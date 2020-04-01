const LZUTF8 = require('lzutf8');
const { EVENTS, BINARY } = require('./constants');

const { MASK_2, MASK_3, MASK_4, MASK_6 } = BINARY.MASKS;
const { ARRAY, OBJECT, UINT } = BINARY.TYPES;

const formats = {
  [EVENTS.TICK]: {
    players: {
      type: ARRAY,
      lengthSize: 0,
      content: {
        type: OBJECT,
        schema: {
          x: { type: UINT, size: 10 },
          y: { type: UINT, size: 10 },
          turning: { type: UINT, size: 2 },
          radius: { type: UINT, size: 2 },
          direction: { type: UINT, size: 16 },
          speed: { type: UINT, size: 2 },
        },
      },
    },
  },
};

const encode = (payload, options) => {
  const { event, data } = payload;
  const isJson = !!options.json;
  let isCompressed = false;
  let headerByte = 0;
  headerByte |= isJson << 7;
  headerByte |= event & MASK_6;
  if (isJson) {
    const uncompressed = Buffer.from(JSON.stringify(data));
    const compressed = LZUTF8.compress(string);
    isCompressed = compressed.length < uncompressed.length;
    headerByte |= isCompressed << 6;
    const headerBuf = Buffer.from([headerByte]);
    const dataBuf = isCompressed ? compressed : uncompressed;
    return Buffer.concat([headerBuf, dataBuf]);
  }
  const headerBuf = Buffer.from([headerByte]);
  let offset = 0;
  let bits = 0;
  let byte = 0;
  const format = formats[event]
}

const decode = buffer => {
  const headerByte = buffer[0];

}

// encode isJson (1 bit)
// encode isCompressed (1 bit)
// encode event type (6 bits)
