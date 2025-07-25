// Интеграция с Google Sheets через сервисный аккаунт
const { google } = require('googleapis');
const fs = require('fs');

function getSheetsClient() {
  const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_JSON));
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes,
  });
  return google.sheets({ version: 'v4', auth });
}

async function clearSheet(sheetName) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${sheetName}!A:Z`,
  });
}

async function updateSheet(sheetName, values) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

module.exports = { clearSheet, updateSheet };
