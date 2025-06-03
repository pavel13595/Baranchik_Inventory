import { Department, Item, InventoryData } from "../types/inventory";

// Google API Client ID - you would need to replace this with your own
const API_KEY = "YOUR_API_KEY"; // Replace with your actual API key
const CLIENT_ID = "YOUR_CLIENT_ID"; // Replace with your actual client ID
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let gapiInitialized = false;
let gapiLoaded = false;

/**
 * Initialize the Google API client
 */
const initGapi = async () => {
  if (gapiInitialized) return;
  
  // Check if gapi is already loaded
  if (!gapiLoaded && !window.gapi) {
    try {
      await loadGapiScript();
      gapiLoaded = true;
    } catch (error) {
      console.error("Failed to load Google API script:", error);
      throw new Error("Failed to load Google API");
    }
  }
  
  return new Promise<void>((resolve, reject) => {
    try {
      if (!window.gapi) {
        reject(new Error("Google API not available"));
        return;
      }
      
      window.gapi.load("client:auth2", () => {
        window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          gapiInitialized = true;
          resolve();
        }).catch(reject);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Load the Google API script
 */
const loadGapiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google API script"));
    
    document.body.appendChild(script);
  });
};

/**
 * Check if user is signed in to Google
 */
export const checkSignInStatus = async () => {
  try {
    await initGapi();
    return window.gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    console.error("Error checking sign-in status:", error);
    return false;
  }
};

/**
 * Sign in to Google
 */
export const signIn = async () => {
  try {
    await initGapi();
    return window.gapi.auth2.getAuthInstance().signIn();
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

/**
 * Sign out from Google
 */
export const signOut = async () => {
  try {
    await initGapi();
    return window.gapi.auth2.getAuthInstance().signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

/**
 * Sync inventory data with Google Sheets
 */
export const syncWithGoogleSheets = async (
  spreadsheetId: string,
  departments: Department[],
  items: Item[],
  inventoryData: InventoryData
) => {
  try {
    await initGapi();
    
    // Check if user is signed in
    if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await window.gapi.auth2.getAuthInstance().signIn();
    }
    
    // Create sheets for each department if they don't exist
    await ensureSheetsExist(spreadsheetId, departments);
    
    // Sync each department to its own sheet
    for (const dept of departments) {
      // Filter items for this department
      const departmentItems = items.filter(item => item.category === dept.id);
      
      // Prepare data for Google Sheets
      const headerRow = ["№", "Наименование", "Количество", "Последнее обновление", "Кто обновил"];
      
      const dataRows = departmentItems.map((item, index) => {
        const count = typeof inventoryData[dept.id]?.[item.id] === 'number' 
          ? inventoryData[dept.id]?.[item.id] as number 
          : 0;
        
        const lastUpdated = inventoryData[dept.id]?.[`${item.id}_timestamp`] 
          ? new Date(inventoryData[dept.id]?.[`${item.id}_timestamp`] as number).toLocaleString()
          : "-";
        
        const updatedBy = inventoryData[dept.id]?.[`${item.id}_user`] || "-";
        
        return [index + 1, item.name, count, lastUpdated, updatedBy];
      });
      
      const values = [headerRow, ...dataRows];
      
      // Update the sheet
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${dept.name}!A1`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values
        }
      });
    }
    
    // Also update a summary sheet
    await updateSummarySheet(spreadsheetId, departments, items, inventoryData);
    
    return true;
  } catch (error) {
    console.error("Error syncing with Google Sheets:", error);
    throw error;
  }
};

/**
 * Ensure all department sheets exist
 */
const ensureSheetsExist = async (spreadsheetId: string, departments: Department[]) => {
  try {
    // Get existing sheets
    const response = await window.gapi.client.sheets.spreadsheets.get({
      spreadsheetId
    });
    
    const existingSheets = response.result.sheets.map((sheet: any) => sheet.properties.title);
    
    // Check if we need to add "Summary" sheet
    if (!existingSheets.includes("Сводная")) {
      await window.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: "Сводная"
              }
            }
          }]
        }
      });
    }
    
    // Check if we need to add department sheets
    for (const dept of departments) {
      if (!existingSheets.includes(dept.name)) {
        await window.gapi.client.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: dept.name
                }
              }
            }]
          }
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring sheets exist:", error);
    throw error;
  }
};

/**
 * Update the summary sheet
 */
const updateSummarySheet = async (
  spreadsheetId: string,
  departments: Department[],
  items: Item[],
  inventoryData: InventoryData
) => {
  try {
    // Prepare data for summary sheet
    const headerRow = ["Наименование", ...departments.map(dept => dept.name), "Итого"];
    
    // Group items by category
    const itemsByCategory: {[key: string]: Item[]} = {};
    departments.forEach(dept => {
      itemsByCategory[dept.id] = items.filter(item => item.category === dept.id);
    });
    
    // Create category sections
    const allRows: any[][] = [];
    
    departments.forEach(dept => {
      // Add category header
      allRows.push([dept.name, "", "", "", ""]);
      
      // Add items for this category
      itemsByCategory[dept.id].forEach(item => {
        const row = [item.name];
        let totalCount = 0;
        
        // Add count for each department (will be 0 for all except the item's category)
        departments.forEach(d => {
          const count = d.id === item.category && typeof inventoryData[d.id]?.[item.id] === 'number'
            ? inventoryData[d.id]?.[item.id] as number
            : 0;
          
          row.push(count);
          totalCount += count;
        });
        
        // Add total count for the item
        row.push(totalCount);
        
        allRows.push(row);
      });
      
      // Add empty row after category
      allRows.push(["", "", "", "", ""]);
    });
    
    // Add department totals
    const totalsRow = ["ИТОГО"];
    const departmentTotals: number[] = [];
    
    departments.forEach(dept => {
      let deptTotal = 0;
      
      items.filter(item => item.category === dept.id).forEach(item => {
        const count = typeof inventoryData[dept.id]?.[item.id] === 'number'
          ? inventoryData[dept.id]?.[item.id] as number
          : 0;
        deptTotal += count;
      });
      
      departmentTotals.push(deptTotal);
      totalsRow.push(deptTotal);
    });
    
    // Add grand total
    const grandTotal = departmentTotals.reduce((sum, current) => sum + current, 0);
    totalsRow.push(grandTotal);
    
    allRows.push(totalsRow);
    
    // Update the summary sheet
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Сводная!A1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [headerRow, ...allRows]
      }
    });
    
    // Format the summary sheet
    await formatSummarySheet(spreadsheetId, headerRow.length, allRows.length + 1);
    
  } catch (error) {
    console.error("Error updating summary sheet:", error);
    throw error;
  }
};

/**
 * Format the summary sheet
 */
const formatSummarySheet = async (
  spreadsheetId: string,
  columnCount: number,
  rowCount: number
) => {
  try {
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          // Format header row
          {
            repeatCell: {
              range: {
                sheetId: 0, // Assuming Сводная is the first sheet
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: columnCount
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.2, blue: 0.8 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: "CENTER"
                }
              },
              fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
            }
          },
          // Format category headers
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                endRowIndex: rowCount,
                startColumnIndex: 0,
                endColumnIndex: columnCount
              },
              cell: {
                userEnteredFormat: {
                  wrapStrategy: "WRAP"
                }
              },
              fields: "userEnteredFormat.wrapStrategy"
            }
          },
          // Auto-resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: columnCount
              }
            }
          }
        ]
      }
    });
  } catch (error) {
    console.error("Error formatting summary sheet:", error);
    // Don't throw here, as this is just formatting
  }
};

/**
 * Create a new Google Sheet for inventory
 */
export const createNewSheet = async (title: string = "Инвентаризация") => {
  try {
    await initGapi();
    
    // Check if user is signed in
    if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await window.gapi.auth2.getAuthInstance().signIn();
    }
    
    // Create a new spreadsheet
    const response = await window.gapi.client.sheets.spreadsheets.create({
      properties: {
        title
      }
    });
    
    return response.result.spreadsheetId;
  } catch (error) {
    console.error("Error creating new Google Sheet:", error);
    throw error;
  }
};

// Add type definition for window.gapi
declare global {
  interface Window {
    gapi: any;
    Telegram?: {
      WebApp?: any;
    };
  }
}