const chalk = require('chalk');
const dotenv = require('dotenv');

const game = require('./game');
const server = require('./server');

const { error } = dotenv.config();
if (error) {
  console.error(chalk.red.bold("- Error loading configuration from .env file:\n") + chalk.red(error));
  process.exit(1);
}

// const { MASK_2, MASK_3, MASK_4, MASK_6 } = require('./constants').BINARY;

// const test = (ws, request) => {
//   const players = [{ x: 111.111, y: 555.666, velocity: { x: 0.92, y: -97.21, type: 1 }, radius: { type: 1 }, angularVelocity: { type: 1 } }];
//   const diff = { 31742: 2 };
//   const buf = Buffer.alloc(players.length * 6 + Object.keys(diff).length * 3);
//   let offset = 0;
//   players.forEach(player => {
//     const data = {
//       x: (player.x + 0.5) | 0,
//       y: (player.y + 0.5) | 0,
//       vAngle: Math.round((Math.atan2(-player.velocity.y, player.velocity.x) + 2 * Math.PI) % (2 * Math.PI) * 10000),
//       vMagnitude: player.velocity.type,
//       radius: player.radius.type,
//       angularVelocity: player.angularVelocity.type,
//     };
//     buf.writeUInt8(data.x >> 2, offset++);
//     buf.writeUInt8(((data.x & MASK_2) << 6) | ((data.y >> 4) & MASK_6), offset++);
//     buf.writeUInt8(((data.y & MASK_4) << 4) | ((data.radius & MASK_2) << 2) | (data.angularVelocity & MASK_2), offset++);
//     offset = buf.writeUInt16BE(data.vAngle, offset);
//     buf.writeUInt8(data.vMagnitude, offset++);
//   });
//   for (location in diff) {
//     offset = buf.writeUInt16BE(location >> 3, offset);
//     buf.writeUInt8(((location & MASK_3) << 3) | (diff[location] & MASK_3), offset++);
//   }
//   ws.send(buf, { binary: true });
// }

game.configure();

server.configure({
  cert: process.env.CERT_PATH,
  key: process.env.KEY_PATH,
  port: process.env.PORT,
});

server.listen()
