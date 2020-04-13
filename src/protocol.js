const { register, types } = require('bintocol-node');

const { EVENTS } = require('./constants');

const { NOTHING, OBJECT, ARRAY, UINT, BOOL } = types;

const registerPing = () => register({
  event: EVENTS.PING,
  body: { type: NOTHING },
});

const registerPong = () => register({
  event: EVENTS.PONG,
  body: { type: NOTHING },
});

const registerTick = () => register({
  event: EVENTS.TICK,
  body: {
    type: OBJECT,
    schema: {
      timer: { type: UINT, size: 7 },
      players: {
        type: ARRAY,
        lengthSize: 3,
        content: {
          type: OBJECT,
          schema: {
            x: { type: UINT, size: 10 },
            y: { type: UINT, size: 10 },
            radius: { type: UINT, size: 2 },
          },
        },
      },
      diff: {
        type: ARRAY,
        lengthSize: 14,
        content: {
          type: OBJECT,
          schema: {
            location: {
              type: UINT,
              size: 19,
            },
            value: {
              type: UINT,
              size: 3,
            },
          },
        },
      },
    },
  },
});

const registerJoinAsSpectator = () => register({
  event: EVENTS.JOIN_AS_SPECTATOR,
  body: { type: NOTHING },
});

const registerJoinAsPlayer = () => register({
  event: EVENTS.JOIN_AS_PLAYER,
  body: { type: NOTHING },
});

const registerPlayGame = () => register({
  event: EVENTS.PLAY_GAME,
  body: { type: NOTHING },
});

const registerInput = () => register({
  event: EVENTS.INPUT,
  body: {
    type: OBJECT,
    schema: {
      key: {
        type: UINT,
        size: 1,
      },
      isPressed: { type: BOOL },
    },
  },
});

module.exports = {
  registerEvents: function() {
    registerPing();
    registerPong();
    registerTick();
    registerJoinAsPlayer();
    registerJoinAsSpectator();
    registerPlayGame();
    registerInput();
  },
};
