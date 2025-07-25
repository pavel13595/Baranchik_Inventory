// Вспомогательные функции для работы с Excel и Google Sheets
const XLSX = require('xlsx');
const { updateSheet, clearSheet } = require('./google-sheets');

/**
 * Обработка Excel-файла и обновление Google Sheets
 * @param {string} filePath - путь к Excel-файлу
 * @param {string} city - название города (kharkiv, kremenchuk, lviv)
 */
async function handleExcelFile(filePath, city) {
  try {
    console.log(`[Excel] Чтение файла: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`[Excel] Первый лист: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`[Excel] Прочитано строк: ${data.length}`);
    console.log(`[Sheets] Очищаем лист: ${city}`);
    await clearSheet(city);
    console.log(`[Sheets] Загружаем данные в лист: ${city}`);
    await updateSheet(city, data);
    console.log(`[Sheets] Данные успешно обновлены для города: ${city}`);
  } catch (e) {
    console.error(`[ERROR] handleExcelFile:`, e);
    throw e;
  }
}

module.exports = { handleExcelFile };
