const bot = require('../bot');
const { createRoom } = require('../game');

const handleInlineQuery = ({ id }) => {
  bot.answerInlineQuery(id, [{ type: "game", id: '0', game_short_name: 'BOP' }])
    .catch(error => console.error('Telegram error in inline query:', error.response.data));
};

const handleCallbackQuery = (query) => {
  const id = query.id;
  const roomId = query.inline_message_id;
  const name = query.from.username || `${query.from.first_name} ${query.from.last_name}`;
  const user = { id: query.from.id.toString(), name }
  const url = `https://tunnel.nageografie.pl:8444/?roomId=${roomId}&userId=${user.id}`;
  bot.answerCallbackQuery(id, url)
    .then(() => createRoom(roomId, user))
    .catch(error => console.error('Telegram error in callback query:', error.response.data));
};

module.exports = (req, res) => {
  const { inline_query, callback_query } = req.body;
  if (inline_query) {
    handleInlineQuery(inline_query);
  } else if (callback_query) {
    handleCallbackQuery(callback_query);
  }
  res.status(204).end();
};
