const fs = require('fs');
const https = require('https');
const chalk = require('chalk');
const WebSocket = require('ws');

const router = require('./router');

const DEFAULT_PORT = 3000;

const server = {
  configure: function(config) {
    this.config = config;
    this.server = https.createServer({
      cert: fs.readFileSync(config.cert),
      key: fs.readFileSync(config.key),
    }, router);
    this.wss = new WebSocket.Server({ server: this.server });
    this.listen = this.listen.bind(this);
    this.runHTTPS = this.runHTTPS.bind(this);
    this.runWSS = this.runWSS.bind(this);
  },
  runHTTPS: function() {
    return new Promise((resolve, reject) => {
      this.server.on('listening', () => {
        console.info(
          chalk.green.bold('- HTTPS server accepting connections on:'),
          chalk.green(`https://${this.server.address().address}:${this.server.address().port}`)
        );
        resolve();
      })
      this.server.on('error', error => {
        this.server.close();
        reject(chalk.red.bold("- Error starting up HTTPS server:\n") + chalk.red(error));
      });
    });
  },
  runWSS: function() {
    return new Promise((resolve, reject) => {
      this.wss.on('listening', () => {
        console.info(
          chalk.green.bold('- WebSocket server accepting connections on:'),
          chalk.green(`wss://${this.wss.address().address}:${this.wss.address().port}`)
        );
        resolve();
      });
      this.wss.on('error', () => {
        this.wss.close();
        reject(chalk.red.bold("- Error starting up WebSocket server:\n") + chalk.red(error));
      });
      this.wss.on('connection', this.config.onConnect)
    })
  },
  listen: function() {
    const promise = Promise.all([this.runHTTPS(), this.runWSS()]);
    const port = this.config.port || DEFAULT_PORT;
    this.server.listen(port, "localhost");
  },
};

module.exports = server;
