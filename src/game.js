const { performance } = require('perf_hooks');
const Bintocol = require('bintocol-node');

const {
  MAX_PLAYERS,
  STATE,
  EVENTS,
  BOARD,
  VELOCITY,
  RADIUS,
  INPUT,
  PLAYER,
  DIRECTION_PRECISION,
} = require('./constants');
const { registerEvents } = require('./protocol');
const { json, distance, overlap } = require('./utils');
const bot = require('./bot');

const rooms = {};

const game = {
  state: room => ({
    data: {
      owner: room.owner,
      state: room.state,
      players: room.players,
      spectators: room.spectators,
      board: room.board,
    },
  }),

  tickState: (players, diff) => {
    const data = {};
    data.players = players.map(player => ({
      x: (player.x * 10 + 0.5) | 0,
      y: (player.y * 10 + 0.5) | 0,
      direction: Math.round(
        (Math.atan2(-player.velocity.y, player.velocity.x) + 2 * Math.PI)
          % (2 * Math.PI) * DIRECTION_PRECISION
      ),
      speed: player.velocity.type,
      radius: player.radius.type,
      turning: player.angularVelocity.type,
    }));
    data.diff = Object.keys(diff).map(location => ({
      location,
      value: diff[location],
    }));
    return data;
  },

  broadcast: function(roomId, payload, options = { compress: 'auto', json: false }) {
    const message = Bintocol.encode(payload, options);
    Object.values(rooms[roomId].clients).forEach(client => client.send(message));
  },

  configure: function() {
    registerEvents();
  },

  handleConnection: function(ws, request) {
    const params = new URLSearchParams(
      request.url.startsWith('/') ? request.url.slice(1) : request.url
    );
    const roomId = params.get('roomId');
    const userId = params.get('userId');
    ws.on('error', error => (
      console.error('WebSocket error for user', userId, 'in room', roomId + ':', error)
    ));
    const room = rooms[roomId];
    if (!room) {
      ws.send(json({ error: 'Room not found' }));
    } else {
      bot.getUser(userId)
        .then((response) => {
          const name = response.data.result.username ||
            `${response.data.result.first_name} ${response.data.result.last_name}`;
          const user = { id: userId, name };
          this.joinRoom(roomId, user, ws);
          ws.on('message', msg => this.handleEvent(roomId, user, Bintocol.decode(msg)));
          ws.on('close', () => this.leaveRoom(roomId, user));
        })
        .catch(error => {
          console.error(error);
          ws.send(json({ error: 'User not found' }))
        });
    }
  },

  handleEvent: function(roomId, user, message) {
    const { event, data } = message;
    switch (event) {
      case EVENTS.PING:
        rooms[roomId].clients[user.id].send(
          Bintocol.encode({ event: EVENTS.PONG }, { compressed: false })
        );
        break;
      case EVENTS.JOIN_AS_SPECTATOR:
        this.joinAsSpectator(roomId, user);
        break;
      case EVENTS.JOIN_AS_PLAYER:
        this.joinAsPlayer(roomId, user);
        break;
      case EVENTS.PLAY_GAME:
        this.playGame(roomId, user);
        break;
      case EVENTS.INPUT:
        this.processInput(roomId, user, data);
        break;
    }
  },

  createRoom: function(roomId, owner) {
    if (rooms[roomId])
      return;

    rooms[roomId] = {
      owner: null,
      state: STATE.LOBBY,
      players: [],
      spectators: [],
      board: [], // Buffer.alloc(BOARD.SIZE * BOARD.SIZE),
      clients: {},
    };
    console.info('Room', roomId, 'created by user:', owner.name);
  },

  playGame: function(roomId, user) {
    const room = rooms[roomId];
    const { owner, state, board } = room;
    if (owner.id !== user.id || state !== STATE.LOBBY)
      return;
    room.state = STATE.GAME;
    room.players = room.players.map((player, index) => ({
      index,
      id: player.id,
      x: (BOARD.SIZE / 2 - 50) + 100 * (index % 2),
      y: (BOARD.SIZE / 2 - 50) + 100 * (index < 2 ? 0 : 1),
      radius: RADIUS.NORMAL,
      tile: index + 1,
      velocity: {
        type: VELOCITY.LINEAR.NORMAL.type,
        x: 0,
        y: (index < 2 ? 1 : -1) * VELOCITY.LINEAR.NORMAL.value,
      },
      angularVelocity: VELOCITY.ANGULAR.NONE,
      input: {},
    }));
    for (let i = 0; i < BOARD.SIZE * BOARD.SIZE; i++) {
      room.board[i] = 0;
    }
    this.broadcast(
      roomId,
      { event: EVENTS.PLAY_GAME, ...this.state(room) },
      { json: true, compress: true }
    );
    room.lastUpdateTime = performance.now();
    setTimeout(() => this.update(roomId), 10);
  },

  processInput: function(roomId, user, data) {
    const room = rooms[roomId];
    const { players } = room;
    const player = players.find(p => p.id === user.id);
    if (data.key === INPUT.LEFT) {
      player.input.left = data.isPressed;
    } else if (data.key === INPUT.RIGHT) {
      player.input.right = data.isPressed;
    }
    if (player.input.left && player.input.right) {
      player.angularVelocity = VELOCITY.ANGULAR.NONE;
    } else if (player.input.left) {
      player.angularVelocity = {
        ...VELOCITY.ANGULAR.NORMAL,
        value: -VELOCITY.ANGULAR.NORMAL.value,
      };
    } else if (player.input.right) {
      player.angularVelocity = {
        ...VELOCITY.ANGULAR.NORMAL,
        value: VELOCITY.ANGULAR.NORMAL.value,
      };
    } else {
      player.angularVelocity = VELOCITY.ANGULAR.NONE;
    }
  },

  update: function(roomId) {
    const room = rooms[roomId];
    const { state, players, board } = room;
    const now = performance.now()
    const dt = (now - room.lastUpdateTime) / 1000;
    room.lastUpdateTime = now;

    players.forEach(player => {
      const { x, y, velocity, angularVelocity, radius, tile } = player;

      if (angularVelocity.value) {
        // Rotate the velocity vector
        const vX = velocity.x * Math.cos(angularVelocity.value * dt) - velocity.y * Math.sin(angularVelocity.value * dt);
        const vY = velocity.x * Math.sin(angularVelocity.value * dt) + velocity.y * Math.cos(angularVelocity.value * dt);
        player.velocity.x = vX;
        player.velocity.y = vY;
      }

      player.x += player.velocity.x * dt;
      player.y += player.velocity.y * dt;
    });

    let diff = {};

    players.forEach(player => {
      // Handle player to player collisions
      for (let i = player.index + 1; i < players.length; i++) {
        const otherPlayer = players[i];
        let dist = distance(player.x, player.y, otherPlayer.x, otherPlayer.y);
        if (dist < PLAYER.WIDTH) {
          const p1 = { x: player.x, y: player.y };
          const p2 = { x: otherPlayer.x, y: otherPlayer.y };
          const v1 = { x: player.velocity.x, y: player.velocity.y };
          const v2 = { x: otherPlayer.velocity.x, y: otherPlayer.velocity.y };
          // Normal and tangent vectors
          const normal = { x: (p2.x - p1.x) / PLAYER.WIDTH, y: (p2.y - p1.y) / PLAYER.WIDTH };
          const tangent = { x: -normal.y, y: normal.x };
          // Dot products
          const dpTan1 = v1.x * tangent.x + v1.y * tangent.y;
          const dpTan2 = v2.x * tangent.x + v2.y * tangent.y;
          const dpNorm1 = v1.x * normal.x + v1.y * normal.y;
          const dpNorm2 = v2.x * normal.x + v2.y * normal.y;
          // Final velocities
          player.velocity.x = tangent.x * dpTan1 + normal.x * dpNorm2;
          player.velocity.y = tangent.y * dpTan1 + normal.y * dpNorm2;
          const angle1 = Math.atan2(player.velocity.y, player.velocity.x);
          player.velocity.x = Math.cos(angle1) * VELOCITY.LINEAR.NORMAL;
          player.velocity.y = Math.sin(angle1) * VELOCITY.LINEAR.NORMAL;

          otherPlayer.velocity.x = tangent.x * dpTan2 + normal.x * dpNorm1;
          otherPlayer.velocity.y = tangent.y * dpTan2 + normal.y * dpNorm1;
          const angle2 = Math.atan2(otherPlayer.velocity.y, otherPlayer.velocity.x);
          otherPlayer.velocity.x = Math.cos(angle2) * VELOCITY.LINEAR.NORMAL;
          otherPlayer.velocity.y = Math.sin(angle2) * VELOCITY.LINEAR.NORMAL;

          const displacement = {
            x: ((p1.x - p2.x) / dist) * (PLAYER.WIDTH - dist + 1),
            y: ((p1.y - p2.y) / dist) * (PLAYER.WIDTH - dist + 1),
          };

          player.x += displacement.x;
          player.y += displacement.y;
          otherPlayer.x -= displacement.x;
          otherPlayer.y -= displacement.y;
        }
      }

      // Handle wall collisions
      if (player.x - PLAYER.WIDTH / 2 < 0) {
        player.x = PLAYER.WIDTH / 2;
      }
      if (player.x + PLAYER.WIDTH / 2 > BOARD.SIZE) {
        player.x = BOARD.SIZE - PLAYER.WIDTH / 2;
      }
      if (player.y - PLAYER.HEIGHT / 2 < 0) {
        player.y = PLAYER.HEIGHT / 2;
      }
      if (player.y + PLAYER.HEIGHT / 2 > BOARD.SIZE) {
        player.y = BOARD.SIZE - PLAYER.HEIGHT / 2;
      }

      diff = {
        ...diff,
        ...this.paintBoard(roomId, (player.x + 0.5) | 0, (player.y + 0.5) | 0, player.radius.value, player.tile),
      };
    });

    this.broadcast(roomId, { event: EVENTS.TICK, data: this.tickState(players, diff) });
    setTimeout(() => this.update(roomId), 20);
  },

  paintBoard: function(roomId, x, y, radius, tile) {
    const room = rooms[roomId];
    const { players, board } = room;
    const diff = {};
    for (let i = x - radius; i < x + radius; i++) {
      for (let j = y - radius; j < y + radius; j++) {
        if (i < 0 || j < 0 || i >= BOARD.SIZE || j >= BOARD.SIZE) continue;
        if (overlap(x, y, i, j, radius)) {
          if (board[j * BOARD.SIZE + i] !== tile) {
            board[j * BOARD.SIZE + i] = tile;
            diff[j * BOARD.SIZE + i] = tile;
          }
        }
      }
    }
    return diff;
  },

  joinAsPlayer: function(roomId, user) {
    const room = rooms[roomId];
    const { owner, players, spectators, state, clients } = room;

    if (state !== STATE.LOBBY ||
        players.length === MAX_PLAYERS ||
        players.find(p => p.id === user.id)) {
      return false;
    }
    room.spectators = spectators.filter(p => p.id !== user.id);
    players.push(user);
    if (owner === null) {
      room.owner = user;
      console.info('User', user.name, 'joined room', roomId, 'as a player, and became the room owner.');
    } else {
      console.info('User', user.name, 'joined room', roomId, 'as a player.');
    }

    this.broadcast(
      roomId,
      { event: EVENTS.UPDATE_LOBBY,...this.state(room) },
      { json: true, compress: 'auto' },
    );
    return true;
  },

  joinAsSpectator: function(roomId, user) {
    const room = rooms[roomId];
    const { spectators, owner, players, state, clients } = room;

    if (spectators.find(s => s.id === user.id))
      return;
    room.players = players.filter(p => p.id !== user.id);
    if (owner && owner.id === user.id) {
      room.owner = room.players[0] || null;
    }
    spectators.push(user);
    console.info('User', user.name, 'joined room', roomId, 'as a spectator.');

    this.broadcast(
      roomId,
      { event: EVENTS.UPDATE_LOBBY,...this.state(room) },
      { json: true, compress: 'auto' },
    );
  },

  joinRoom: function(roomId, user, socket) {
    const room = rooms[roomId];
    const { owner, players, spectators, state, clients } = room;
    if (clients[user.id])
      return;
    clients[user.id] = socket;
    if (players.concat(spectators).find(u => u.id === user.id))
      return;
    this.joinAsPlayer(roomId, user) || this.joinAsSpectator(roomId, user);
  },

  leaveRoom: function(roomId, user) {
    const room = rooms[roomId];
    const { owner, players, spectators, state, clients } = room;
    delete clients[user.id];
    if (players.find(p => p.id === user.id) && state === STATE.LOBBY) {
      room.players = players.filter(p => p.id !== user.id);
      if (owner.id === user.id) {
        room.owner = room.players[0] || null;
        if (room.owner) {
          console.info('User', user.name, '(owner) left room', roomId + '.', room.owner.name, 'became the room owner.');
        } else {
          console.info('User', user.name, '(owner) left room', roomId + '.', 'Waiting for a new owner.');
        }
      } else {
        console.info('User', user.name, '(player) left room', roomId);
      }
    } else if (spectators.find(s => s.id === user.id)) {
      room.spectators = spectators.filter(s => s.id !== user.id);
      console.info('User', user.name, '(spectator) left room', roomId);
    }
    this.broadcast(
      roomId,
      { event: EVENTS.UPDATE_LOBBY,...this.state(room) },
      { json: true, compress: 'auto' },
    );
  },
};

game.handleConnection = game.handleConnection.bind(game);

module.exports = game;
