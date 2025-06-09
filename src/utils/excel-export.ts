import * as XLSX from "xlsx";
import { Department, Item, InventoryData } from "../types/inventory";
import { shareTelegramMessage, createInventoryReportMessage } from "./telegram-service";

export const exportToExcel = (
  departments: Department[],
  items: Item[],
  inventoryData: { [departmentId: string]: { [itemId: string]: number | string } },
  sendToTelegram = false
) => {
  try {
    // Group items by category
    const itemsByCategory: {[key: string]: Item[]} = {};
    departments.forEach(dept => {
      itemsByCategory[dept.id] = items.filter(item => item.category === dept.id);
    });
    
    // Create separate Excel files for each department
    departments.forEach(dept => {
      // Create a workbook for this department
      const wb = XLSX.utils.book_new();
      
      // Get department items
      const departmentItems = itemsByCategory[dept.id] || [];
      
      // Create department sheet
      createDepartmentSheet(wb, dept, departmentItems, inventoryData);
      
      // Generate Excel file for this department
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `Інвентаризація_${dept.name}_${currentDate}.xlsx`;
      
      // For mobile compatibility, use blob approach for all devices
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      if (sendToTelegram) {
        // Try Web Share API first (works on most modern mobile browsers)
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { 
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const shareData = {
              files: [file],
              title: `Інвентаризація: ${dept.name}`,
              text: `Інвентаризація: ${dept.name} (${new Date().toLocaleDateString()})`
            };
            
            if (navigator.canShare(shareData)) {
              navigator.share(shareData)
                .then(() => console.log('Shared successfully'))
                .catch((error) => {
                  console.error('Error sharing:', error);
                  // Fallback to download + Telegram deep link
                  downloadAndShareViaTelegram(blob, fileName, dept.name);
                });
            } else {
              // Fallback for browsers that can't share files
              downloadAndShareViaTelegram(blob, fileName, dept.name);
            }
          } catch (error) {
            console.error('Error with Web Share API:', error);
            downloadAndShareViaTelegram(blob, fileName, dept.name);
          }
        } else {
          // Fallback for browsers without Web Share API
          downloadAndShareViaTelegram(blob, fileName, dept.name);
        }
      } else {
        // Regular download
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Ошибка при экспорте в Excel. Пожалуйста, попробуйте снова.");
  }
};

// Fallback function to download file and open Telegram
const downloadAndShareViaTelegram = (blob: Blob, fileName: string, departmentName: string) => {
  // First download the file
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Then open Telegram with a message prompting to attach the file
    const message = `Інвентаризація: ${departmentName} (${new Date().toLocaleDateString()})\n\nПрикрепите скачанный файл Excel к этому сообщению.`;
    
    // On mobile, try to use the Telegram app directly
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tg://msg?text=${encodeURIComponent(message)}`;
    } else {
      // On desktop, open Telegram web
      window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, '_blank');
    }
  }, 500);
};

// Create summary sheet
const createSummarySheet = (
  wb: XLSX.WorkBook,
  departments: Department[],
  items: Item[],
  inventoryData: { [departmentId: string]: { [itemId: string]: number | string } }
) => {
  // Create worksheet data
  const wsData = [
    // Header row with department names
    ["Найменування", ...departments.map(dept => dept.name), "Итого"]
  ];

  // Add rows for each item
  items.forEach(item => {
    const row = [item.name];
    let totalCount = 0;
    
    // Add count for each department
    departments.forEach(dept => {
      const count = typeof inventoryData[dept.id]?.[item.id] === 'number' 
        ? inventoryData[dept.id]?.[item.id] as number 
        : 0;
      row.push(count.toString());
      totalCount += count;
    });
    
    // Add total count for the item across all departments
    row.push(totalCount.toString());
    
    wsData.push(row);
  });
  
  // Add totals row
  const totalsRow = ["ИТОГО"];
  const departmentTotals: number[] = [];
  
  // Calculate totals for each department
  departments.forEach((dept) => {
    let deptTotal = 0;
    
    items.forEach(item => {
      const count = typeof inventoryData[dept.id]?.[item.id] === 'number' 
        ? inventoryData[dept.id]?.[item.id] as number 
        : 0;
      deptTotal += count;
    });
    
    departmentTotals.push(deptTotal);
    totalsRow.push(deptTotal.toString());
  });
  
  // Add grand total
  const grandTotal = departmentTotals.reduce((sum, current) => sum + current, 0);
  totalsRow.push(grandTotal.toString());
  
  wsData.push(totalsRow);

  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Apply styles
  applyStyles(ws, wsData.length);
  
  // Add the sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Сводная");
};

// Create department sheet
const createDepartmentSheet = (
  wb: XLSX.WorkBook,
  department: Department,
  departmentItems: Item[],
  inventoryData: { [departmentId: string]: { [itemId: string]: number | string } }
) => {
  // Create header
  const header = [
  ["Організація:", `Той самий Баранчик ${city}`],
  ["Бланк інвентаризації", ""],
  ["", ""],
  ["На дату:", new Date().toLocaleDateString()],
  ["Склад", `Той самий Баранчик ${city}`],
  ["", ""],
  ["Товар", "", "", "Од. вим.", "Залишок фактичний", "Позначки"],
  ["Код", "Штрих-код", "Найменування", "", "", ""]
];
  
  // Create rows for each item
  const rows = departmentItems.map(item => {
    const count = typeof inventoryData[department.id]?.[item.id] === 'number' 
      ? inventoryData[department.id]?.[item.id] as number 
      : 0;
    
    // Extract item code from id - get everything after "item-"
    const itemCode = item.id.replace("item-", "");
    
    return [
      itemCode,
      "", // Штрих-код
      item.name,
      department.id === "dept-2" ? getUnitForHouseholdItem(item.name) : "шт", // Од. вим.
      count,
      "" // Позначки
    ];
  });
  
  // Add footer
  const footer = [
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["Інвентаризацію провів: ______________________________", "", "", "Інвентаризацію прийняв: ____________________________", "", ""]
  ];
  
  // Combine all rows
  const wsData = [...header, ...rows, ...footer];
  
  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Apply department sheet styles
  applyDepartmentStyles(ws, wsData.length, header.length, rows.length);
  
  // Add page number
  ws['!footer'] = { odd: '&P із &N' };
  
  // Add the sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, department.name);
};

// Helper function to determine the unit of measurement for household items
const getUnitForHouseholdItem = (itemName: string): string => {
  if (itemName.includes("(л)")) return "л.";
  if (itemName.includes("(кг)")) return "кг";
  if (itemName.includes("(уп)")) return "шт";
  if (itemName.includes("(рул)")) return "шт";
  return "шт";
};

// Apply styles to summary sheet
const applyStyles = (ws: XLSX.WorkSheet, rowCount: number) => {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  
  // Style the header row
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[headerAddress]) continue;
    
    ws[headerAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
      alignment: { horizontal: "center", vertical: "center" }
    };
  }
  
  // Style the data cells
  for (let R = 1; R <= range.e.r - 1; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      // Style for item names (first column)
      if (C === 0) {
        ws[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "left" }
        };
      } 
      // Style for numeric cells
      else {
        ws[cellAddress].s = {
          alignment: { horizontal: "center" },
          numFmt: "0.00" // Format numbers with 2 decimal places
        };
      }
      
      // Alternate row colors for better readability
      if (R % 2 === 1) {
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          fill: { fgColor: { rgb: "F3F4F6" } } // Light gray
        };
      }
    }
  }
  
  // Style the totals row
  const totalsRowIndex = range.e.r;
  for (let C = 0; C <= range.e.c; ++C) {
    const totalCellAddress = XLSX.utils.encode_cell({ r: totalsRowIndex, c: C });
    if (!ws[totalCellAddress]) continue;
    
    ws[totalCellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E0E7FF" } }, // Light indigo
      alignment: C === 0 ? { horizontal: "left" } : { horizontal: "center" },
      numFmt: C > 0 ? "0.00" : undefined // Format numbers with 2 decimal places
    };
  }
  
  // Set column widths
  ws["!cols"] = Array(range.e.c + 1).fill(null).map(() => ({ width: 15 }));
  ws["!cols"][0] = { width: 30 }; // Make the first column wider for item names
};

// Apply styles to department sheet
const applyDepartmentStyles = (ws: XLSX.WorkSheet, rowCount: number, headerRowCount: number, dataRowCount: number) => {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  
  // Style the header
  for (let R = 0; R < headerRowCount; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        font: { bold: R === 7 }, // Bold for column headers
        alignment: { horizontal: "left", vertical: "center" }
      };
    }
  }
  
  // Style the column headers (row 7)
  for (let C = 0; C <= range.e.c; ++C) {
    const headerAddress = XLSX.utils.encode_cell({ r: 7, c: C });
    if (!ws[headerAddress]) continue;
    
    ws[headerAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E5E7EB" } }, // Light gray
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" }
      }
    };
  }
  
  // Style the data rows
  for (let R = headerRowCount; R < headerRowCount + dataRowCount; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        alignment: C === 2 ? { horizontal: "left" } : { horizontal: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" }
        }
      };
      
      // Format numbers with 2 decimal places
      if (C === 4) {
        ws[cellAddress].s = {
          ...ws[cellAddress].s,
          numFmt: "0.00"
        };
      }
    }
  }
  
  // Style the footer
  for (let R = headerRowCount + dataRowCount; R < rowCount; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        alignment: { horizontal: "left", vertical: "center" }
      };
    }
  }
  
  // Set column widths
  ws["!cols"] = [
    { width: 10 }, // Код
    { width: 12 }, // Штрих-код
    { width: 40 }, // Найменування
    { width: 8 },  // Од. вим.
    { width: 15 }, // Залишок фактичний
    { width: 15 }  // Позначки
  ];
  
  // Set row heights
  ws["!rows"] = Array(rowCount).fill(null).map(() => ({ hpt: 20 }));
};