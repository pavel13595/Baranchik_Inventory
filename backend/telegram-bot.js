// Логика Telegram-бота

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { handleExcelFile } = require('./utils');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });


// Сохраняем состояние диалога для каждого пользователя
const userSessions = {};


function startBot() {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userSessions[chatId] = { step: 'city', city: null, type: null };
    bot.sendMessage(chatId, 'Выберите город для переучета:', {
      reply_markup: {
        inline_keyboard: [
          [ { text: 'Харьков', callback_data: 'city_kharkiv' } ],
          [ { text: 'Кременчуг', callback_data: 'city_kremenchuk' } ],
          [ { text: 'Львов', callback_data: 'city_lviv' } ]
        ]
      }
    });
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (!userSessions[chatId]) userSessions[chatId] = { step: 'city', city: null, type: null };
    const session = userSessions[chatId];

    if (query.data.startsWith('city_')) {
      session.city = query.data.replace('city_', '');
      session.step = 'clear';
      bot.sendMessage(chatId, `Очистить старый бланк переучета для города ${session.city}?`, {
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Да', callback_data: 'clear_yes' }, { text: 'Нет', callback_data: 'clear_no' } ]
          ]
        }
      });
    } else if (query.data === 'clear_yes' || query.data === 'clear_no') {
      session.step = 'type';
      if (query.data === 'clear_yes') {
        // Очищаем все типы для выбранного города
        for (const type of ['posuda', 'hoz', 'upakovka']) {
          try {
            await clearSheet(`${session.city}_${type}`);
          } catch (e) {}
        }
        bot.sendMessage(chatId, 'Старые бланки переучета очищены.');
      }
      bot.sendMessage(chatId, 'Выберите тип переучета:', {
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Посуда', callback_data: 'type_posuda' } ],
            [ { text: 'Хозтовары', callback_data: 'type_hoz' } ],
            [ { text: 'Упаковка', callback_data: 'type_upakovka' } ]
          ]
        }
      });
    } else if (query.data.startsWith('type_')) {
      session.type = query.data.replace('type_', '');
      session.step = 'upload';
      bot.sendMessage(chatId, `Загрузите Excel-файл для типа: ${session.type}`);
    } else if (query.data === 'next_type') {
      session.step = 'type';
      bot.sendMessage(chatId, 'Выберите следующий тип переучета:', {
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Посуда', callback_data: 'type_posuda' } ],
            [ { text: 'Хозтовары', callback_data: 'type_hoz' } ],
            [ { text: 'Упаковка', callback_data: 'type_upakovka' } ],
            [ { text: 'Завершить', callback_data: 'finish' } ]
          ]
        }
      });
    } else if (query.data === 'finish') {
      bot.sendMessage(chatId, 'Загрузка завершена! Все данные обновлены.');
      delete userSessions[chatId];
    }
  });

  bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    const session = userSessions[chatId];
    if (!session || session.step !== 'upload' || !session.city || !session.type) {
      bot.sendMessage(chatId, 'Сначала выберите город и тип переучета.');
      return;
    }
    const fileId = msg.document.file_id;
    const fileName = msg.document.file_name;
    try {
      const fileUrl = await bot.getFileLink(fileId);
      const tempPath = path.join(__dirname, 'temp', `${chatId}_${fileName}`);
      fs.mkdirSync(path.dirname(tempPath), { recursive: true });
      const res = await fetch(fileUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(tempPath, buffer);
      await handleExcelFile(tempPath, `${session.city}_${session.type}`);
      fs.unlinkSync(tempPath);
      bot.sendMessage(chatId, `Данные для типа ${session.type} успешно загружены!`, {
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Загрузить следующий тип', callback_data: 'next_type' } ],
            [ { text: 'Завершить', callback_data: 'finish' } ]
          ]
        }
      });
      session.step = 'wait_next';
    } catch (e) {
      bot.sendMessage(chatId, 'Ошибка при обработке файла: ' + e.message);
    }
  });
}

module.exports = { startBot };
