module.exports = {
  EVENTS: {
    PING: 0,
    PONG: 1,
    JOIN_AS_PLAYER: 2,
    JOIN_AS_SPECTATOR: 3,
    UPDATE_LOBBY: 4,
    PLAY_GAME: 5,
    INPUT: 6,
    TICK: 7,
  },
  STATE: {
    LOBBY: 'LOBBY',
    GAME: 'GAME',
  },
  INPUT: {
    LEFT: 0,
    RIGHT: 1,
  },
  MAX_PLAYERS: 4,
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
  DIRECTION_PRECISION: 10000,
};
