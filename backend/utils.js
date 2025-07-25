// Вспомогательные функции для работы с Excel и Google Sheets
const ExcelJS = require('exceljs');
const { updateSheet, clearSheet } = require('./google-sheets');

/**
 * Обработка Excel-файла и обновление Google Sheets
 * @param {string} filePath - путь к Excel-файлу
 * @param {string} city - название города (kharkiv, kremenchuk, lviv)
 */
async function handleExcelFile(filePath, city) {
  try {
    console.log(`[ExcelJS] Чтение файла: ${filePath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    console.log(`[ExcelJS] Первый лист: ${worksheet.name}`);
    const data = [];
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      data.push(row.values.slice(1)); // row.values[0] is undefined, slice to skip
    });
    console.log(`[ExcelJS] Прочитано строк: ${data.length}`);
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
