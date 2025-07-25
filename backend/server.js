// Основной сервер Express для API и Telegram-бота
require('dotenv').config();
const express = require('express');
const { startBot } = require('./telegram-bot');
const sheetsApi = require('./sheets-api');

const app = express();
app.use(express.json());
app.use('/api', sheetsApi);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API сервер запущен на порту ${PORT}`);
  startBot();
});
