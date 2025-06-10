import * as XLSX from "xlsx";
import { Department, Item } from "../types/inventory";
import { shareTelegramMessage, createInventoryReportMessage } from "./telegram-service";

/**
 * Export inventory data to an Excel workbook (one file per department) and optionally share via Telegram.
 *
 * @param departments      List of departments (warehouses / locations)
 * @param items            All available items
 * @param inventoryData    Map: departmentId → (itemId → quantity)
 * @param sendToTelegram   If true, the generated file will be shared instead of (or after) a local download
 * @param city             City name used in document headers (e.g. "Київ", "Львів")
 */
export const exportToExcel = (
  departments: Department[],
  items: Item[],
  inventoryData: { [departmentId: string]: { [itemId: string]: number | string } },
  sendToTelegram = false,
  city: string // <-- added city parameter
) => {
  try {
    // Group items by category (department.id is used as the category key)
    const itemsByCategory: { [key: string]: Item[] } = {};
    departments.forEach((dept) => {
      itemsByCategory[dept.id] = items.filter((item) => item.category === dept.id);
    });

    // Create a separate Excel file for each department
    departments.forEach((dept) => {
      // Create a workbook for this department
      const wb = XLSX.utils.book_new();

      // Get department‑specific items
      const departmentItems = itemsByCategory[dept.id] || [];

      // Create department sheet (city injected into header)
      createDepartmentSheet(wb, dept, departmentItems, inventoryData, city); // <-- pass city

      // (Optional) create a summary sheet spanning all departments – uncomment if needed
      // createSummarySheet(wb, departments, items, inventoryData);

      // Generate Excel file
      const currentDate = new Date().toISOString().split("T")[0];
      const fileName = `Інвентаризація_${dept.name}_${currentDate}.xlsx`;

      // Use a Blob for universal download/share handling
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (sendToTelegram) {
        // Attempt Web Share API first (mobile‑friendly)
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const shareData: ShareData = {
              files: [file],
              title: `Інвентаризація: ${dept.name}`,
              text: `Інвентаризація: ${dept.name} (${new Date().toLocaleDateString()})`,
            };

            if (navigator.canShare(shareData)) {
              navigator
                .share(shareData)
                .then(() => console.log("Shared successfully"))
                .catch((error) => {
                  console.error("Error sharing:", error);
                  // Fallback to download + Telegram deep link
                  downloadAndShareViaTelegram(blob, fileName, dept.name);
                });
            } else {
              // Browser cannot share files
              downloadAndShareViaTelegram(blob, fileName, dept.name);
            }
          } catch (error) {
            console.error("Error with Web Share API:", error);
            downloadAndShareViaTelegram(blob, fileName, dept.name);
          }
        } else {
          // Browser without Web Share API
          downloadAndShareViaTelegram(blob, fileName, dept.name);
        }
      } else {
        // Regular download
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.style.display = "none";
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

// -----------------------------------------------------------------------------
// 🔄 Fallback: download locally then open Telegram deep‑link
// -----------------------------------------------------------------------------
const downloadAndShareViaTelegram = (
  blob: Blob,
  fileName: string,
  departmentName: string,
) => {
  // Download the file
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Compose message instructing the user to attach the file
    const message = `Інвентаризація: ${departmentName} (${new Date().toLocaleDateString()})\n\nПрикрепите скачанный файл Excel к этому сообщению.`;

    // Attempt to open Telegram app on mobile, fallback to web
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `tg://msg?text=${encodeURIComponent(message)}`;
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, "_blank");
    }
  }, 500);
};

// -----------------------------------------------------------------------------
// 📄 Create department‑specific sheet
// -----------------------------------------------------------------------------
const createDepartmentSheet = (
  wb: XLSX.WorkBook,
  department: Department,
  departmentItems: Item[],
  inventoryData: { [departmentId: string]: { [itemId: string]: number | string } },
  city: string, // <-- added city parameter
) => {
  // Header rows (with city name injected)
  const header = [
    ["Організація:", `Той самий Баранчик ${city}`],
    ["Бланк інвентаризації", ""],
    ["", ""],
    ["Дата:", new Date().toLocaleDateString()],
    ["Склад", `Той самий Баранчик ${city} (${department.name})`],
    ["", ""],
    ["Товар", "", "", "Од. вим.", "Залишок фактичний", "Позначки"],
    ["Код", "Штрих-код", "Найменування", "", "", ""],
  ];

  // Rows for each item
  const rows = departmentItems.map((item) => {
    const count = typeof inventoryData[department.id]?.[item.id] === "number" ? (inventoryData[department.id]?.[item.id] as number) : 0;

    // Extract numeric item code (part after "item-")
    const itemCode = item.id.replace("item-", "");

    return [
      itemCode, // Код
      "", // Штрих‑код
      item.name, // Найменування
      department.id === "dept-2" ? getUnitForHouseholdItem(item.name) : "шт", // Од. вим.
      count, // Залишок фактичний
      "", // Позначки
    ];
  });

  // Footer rows (spacing + signatures)
  const footer = [
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    [
      "Інвентаризацію провів: ______________________________",
      "",
      "",
      "Інвентаризацію прийняв: ____________________________",
      "",
      "",
    ],
  ];

  const wsData = [...header, ...rows, ...footer];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Apply styling helpers
  applyDepartmentStyles(ws, wsData.length, header.length, rows.length);

  // Add page footer (page numbering)
  // @ts-ignore – SheetJS custom property
  ws["!footer"] = { odd: "&P із &N" };

  XLSX.utils.book_append_sheet(wb, ws, department.name);
};




// -----------------------------------------------------------------------------
// 🧮 Optional summary sheet (all departments) – unused by default
// -----------------------------------------------------------------------------
const createSummarySheet = (
  wb: XLSX.WorkBook,
  departments: Department[],
  items: Item[],
  inventoryData: { [departmentId: string]: { [itemId: string]: number | string } },
) => {
  const wsData: (string | number)[][] = [["Найменування", ...departments.map((d) => d.name), "Итого"]];

  // Per‑item rows
  items.forEach((item) => {
    const row: (string | number)[] = [item.name];
    let total = 0;

    departments.forEach((dept) => {
      const count = typeof inventoryData[dept.id]?.[item.id] === "number" ? (inventoryData[dept.id]?.[item.id] as number) : 0;
      row.push(count);
      total += count;
    });

    row.push(total);
    wsData.push(row);
  });

  // Totals row
  const totalsRow: (string | number)[] = ["ИТОГО"];
  departments.forEach((dept, idx) => {
    const depTotal = wsData.slice(1).reduce((sum, row) => sum + (row[idx + 1] as number), 0);
    totalsRow.push(depTotal);
  });
  totalsRow.push(totalsRow.slice(1).reduce((a, b) => (a as number) + (b as number), 0));
  wsData.push(totalsRow);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  applyStyles(ws, wsData.length);
  XLSX.utils.book_append_sheet(wb, ws, "Сводная");
};

// -----------------------------------------------------------------------------
// 🔧 Helpers
// -----------------------------------------------------------------------------
// Unit of measurement for household goods (dept‑2)
const getUnitForHouseholdItem = (name: string): string => {
  if (name.includes("(л)")) return "л.";
  if (name.includes("(кг)")) return "кг";
  if (name.includes("(уп)")) return "шт";
  if (name.includes("(рул)")) return "шт";
  return "шт";
};

// Styles for the summary sheet
const applyStyles = (ws: XLSX.WorkSheet, rowCount: number) => {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  // Header row (bold, indigo background)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Data rows
  for (let R = 1; R < rowCount - 1; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;

      ws[addr].s = {
        alignment: C === 0 ? { horizontal: "left" } : { horizontal: "center" },
        ...(R % 2
          ? { fill: { fgColor: { rgb: "F3F4F6" } } } // zebra striping
          : {}),
      };

      if (C > 0) ws[addr].s = { ...ws[addr].s, numFmt: "0.00" };
      if (C === 0) ws[addr].s = { ...ws[addr].s, font: { bold: true } };
    }
  }

  // Totals row
  const totalsR = rowCount - 1;
  for (let C = 0; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: totalsR, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E0E7FF" } },
      alignment: C === 0 ? { horizontal: "left" } : { horizontal: "center" },
      ...(C > 0 ? { numFmt: "0.00" } : {}),
    };
  }

  // Column widths
  ws["!cols"] = new Array(range.e.c + 1).fill({ width: 15 });
  ws["!cols"][0] = { width: 30 };
};

// Styles for the department sheet
const applyDepartmentStyles = (
  ws: XLSX.WorkSheet,
  rowCount: number,
  headerRowCount: number,
  dataRowCount: number,
) => {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

  // Header section
  for (let R = 0; R < headerRowCount; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: R === 7 }, // column headers (row 7)
        alignment: { horizontal: "left", vertical: "center" },
      };
    }
  }

  // Column headers row (index 7)
  for (let C = 0; C <= range.e.c; ++C) {
    const addr = XLSX.utils.encode_cell({ r: 7, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E5E7EB" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        bottom: { style: "thin" },
      },
    };
  }

  // Data rows
  for (let R = headerRowCount; R < headerRowCount + dataRowCount; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = {
        alignment: C === 2 ? { horizontal: "left" } : { horizontal: "center" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          bottom: { style: "thin" },
        },
        ...(C === 4 ? { numFmt: "0.00" } : {}),
      };
    }
  }

  // Footer rows (signatures etc.)
  for (let R = headerRowCount + dataRowCount; R < rowCount; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) continue;
      ws[addr].s = {
        alignment: { horizontal: "left", vertical: "center" },
      };
    }
  }

  // Column widths
  ws["!cols"] = [
    { width: 15 }, // Код
    { width: 5 }, // Штрих‑код
    { width: 40 }, // Найменування
    { width: 8 },  // Од. вим.
    { width: 15 }, // Залишок фактичний
    { width: 15 }, // Позначки
  ];

  // Row heights (20pt for all)
  ws["!rows"] = new Array(rowCount).fill({ hpt: 20 });
};

// -----------------------------------------------------------------------------
// ✔ Example invocation (elsewhere in the codebase)
// -----------------------------------------------------------------------------
// exportToExcel(
//   [selectedDepartment],
//   items,
//   { [selectedDepartment.id]: inventoryData[selectedDepartment.id] || {} },
//   sendToTelegram,
//   city, // <-- pass city here
// );
