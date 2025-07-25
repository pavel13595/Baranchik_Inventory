// API для получения данных из Google Sheets
const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const router = express.Router();

function getSheetsClient() {
  const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_JSON));
  const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  const auth = new google.auth.GoogleAuth({ credentials, scopes });
  return google.sheets({ version: 'v4', auth });
}

// GET /api/inventory?city=kharkiv&type=posuda
router.get('/inventory', async (req, res) => {
  const { city, type } = req.query;
  if (!city || !type) return res.status(400).json({ error: 'city and type required' });
  const sheetName = `${city}_${type}`;
  try {
    const sheets = getSheetsClient();
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: `${sheetName}!A:Z`,
    });
    res.json({ data: result.data.values || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
