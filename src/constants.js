module.exports = {
  BINARY: {
    TYPES: {
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
      UINT: 'UINT',
    },
    MASKS: {
      MASK_2: 3,
      MASK_3: 7,
      MASK_4: 15,
      MASK_6: 63,
      MASK_19: 524287,
    },
  },
  EVENTS: {
    PING: 'PING',
    PONG: 'PONG',
    LOBBY_JOIN: 'LOBBY_JOIN',
    JOIN_AS_PLAYER: 'JOIN_AS_PLAYER',
    JOIN_AS_SPECTATOR: 'JOIN_AS_SPECTATOR',
    UPDATE_LOBBY: 'UPDATE_LOBBY',
    PLAY_GAME: 'PLAY_GAME',
    INPUT: 'INPUT',
    TICK: 'TICK',
  },
  STATE: {
    LOBBY: 'LOBBY',
    GAME: 'GAME',
  },
  INPUT: {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
  },
  MAX_PLAYERS: 4,
  STATE_LOBBY: 'STATE_LOBBY',
  BOARD: {
    SIZE: 720,
    EMPTY: 0,
    PLAYER_1: 1,
    PLAYER_2: 2,
    PLAYER_3: 3,
    PLAYER_4: 4,
  },
  RADIUS: {
    NORMAL: {
      type: 0,
      value: 18,
    },
    BIG: {
      type: 1,
      value: 24,
    },
  },
  VELOCITY: {
    LINEAR: {
      NORMAL: {
        type: 0,
        value: 100,
      },
    },
    ANGULAR: {
      NONE: {
        type: 0,
        value: 0,
      },
      NORMAL: {
        type: 1,
        value: 2 * Math.PI,
      },
    },
  },
  PLAYER: {
    WIDTH: 36,
    HEIGHT: 36,
    IMAGE_OFFSET: 10,
  },
};
