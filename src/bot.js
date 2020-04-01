const axios = require('axios');

const bot = {
  botURL: function(action) {
    return `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/${action}`;
  },

  getUser: function(id) {
    return axios.post(this.botURL('getChat'), { chat_id: id });
  },

  answerCallbackQuery: function(id, url) {
    return axios.post(this.botURL('answerCallbackQuery'), {
      callback_query_id: id,
      url,
    });
  },

  answerInlineQuery: function(id, results) {
    return axios.post(this.botURL('answerInlineQuery'), {
      inline_query_id: id,
      results,
    });
  },
}

module.exports = bot;
