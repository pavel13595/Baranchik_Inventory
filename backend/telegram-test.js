// Минимальный тест Telegram токена
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');


console.log('Пробуем подключиться к Telegram с токеном:', process.env.TELEGRAM_BOT_TOKEN);
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Ошибка: переменная TELEGRAM_BOT_TOKEN не найдена. Проверьте .env!');
  process.exit(1);
}
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('polling_error', (err) => {
  console.error('Polling error:', err);
});

bot.onText(/.*/, (msg) => {
  console.log('Бот получил сообщение:', msg.text);
  bot.sendMessage(msg.chat.id, 'Бот работает!');
});
