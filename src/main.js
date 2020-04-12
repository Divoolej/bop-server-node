const chalk = require('chalk');
const dotenv = require('dotenv');

const game = require('./game');
const server = require('./server');

const { error } = dotenv.config();
if (error) {
  console.error(chalk.red.bold("- Error loading configuration from .env file:\n") + chalk.red(error));
  process.exit(1);
}

game.configure();

server.configure({
  cert: process.env.CERT_PATH,
  key: process.env.KEY_PATH,
  port: process.env.PORT,
});

server.listen()
