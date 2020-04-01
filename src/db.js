const chalk = require('chalk');
const Redis = require('ioredis');
const JSONStore = require('redis-json');

class DB {
  connect = (socketPath) => {
    return new Promise((resolve, reject) => {
      this.redisClient = Redis.createClient(socketPath);
      this.redisClient.on('connect', () => {
        this.db = new JSONStore(this.redisClient, { prefix: 'bop:' });
        console.info(chalk.green.bold('- Successfully connected to Redis.'))
        resolve();
      });
      this.redisClient.on('error', (error) => {
        reject(chalk.red.bold("- Error connecting to Redis:\n") + chalk.red(error));
      });
    })
  }
};

const db = new DB();

module.exports = db;
