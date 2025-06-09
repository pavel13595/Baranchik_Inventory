import React from "react";
import { Department, Item, InventoryData, InventoryHistory } from "../types/inventory";
import { initialDepartments, cityItems } from "../data/initial-data";
import { syncWithGoogleSheets } from "../utils/google-sheets";

export const useInventoryData = (city: string = "Кременчук") => {
  // Для каждого города — отдельные данные
  const [allInventoryData, setAllInventoryData] = React.useState<{[city: string]: InventoryData}>({});
  const [allItems, setAllItems] = React.useState<{[city: string]: Item[]}>({});
  const [allHistory, setAllHistory] = React.useState<{[city: string]: InventoryHistory[]}>({});

  // Глобальные отделы (одинаковые для всех городов)
  const [departments, setDepartments] = React.useState<Department[]>(initialDepartments);

  // Получаем данные для текущего города
  const inventoryData = allInventoryData[city] || {};
  const items = allItems[city] || [];
  const history = allHistory[city] || [];

  // При смене города инициализируем только если нет данных
  React.useEffect(() => {
    setAllInventoryData(prev => prev[city] ? prev : { ...prev, [city]: {} });
    setAllHistory(prev => prev[city] ? prev : { ...prev, [city]: [] });
    setAllItems(prev => {
      // Если уже есть массив для города — не трогаем
      if (prev[city] && prev[city].length > 0) return prev;
      // Если есть уникальный список для города — используем его
      if (cityItems[city]) {
        return { ...prev, [city]: cityItems[city] };
      }
      // Для других городов — пустой массив
      return { ...prev, [city]: [] };
    });
  }, [city]);

  const [isOnline, setIsOnline] = React.useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = React.useState<"idle" | "syncing" | "success" | "error">("idle");
  
  const checkOnlineStatus = React.useCallback(() => {
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 1000);
    } else {
      setSyncStatus("error");
    }
  }, []);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 1000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("error");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  React.useEffect(() => {
    try {
      const savedDepartments = localStorage.getItem("departments");
      const savedItems = localStorage.getItem("items");
      const savedInventoryData = localStorage.getItem("inventoryData");
      const savedHistory = localStorage.getItem("inventoryHistory");

      if (savedDepartments) {
        setDepartments(JSON.parse(savedDepartments));
      }

      if (savedItems) {
        setAllItems(prev => ({ ...prev, [city]: JSON.parse(savedItems) }));
      }

      if (savedInventoryData) {
        setAllInventoryData(prev => ({ ...prev, [city]: JSON.parse(savedInventoryData) }));
      }
      
      if (savedHistory) {
        setAllHistory(prev => ({ ...prev, [city]: JSON.parse(savedHistory) }));
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // If there's an error, use initial data
    }
  }, []);

  // Универсальное сохранение данных после каждого изменения
  React.useEffect(() => {
    try {
      const allData = {
        departments,
        items,
        inventoryData,
        history,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem("inventoryAppData", JSON.stringify(allData));
      // Для десктопа сохраняем и по старым ключам для обратной совместимости
      localStorage.setItem("departments", JSON.stringify(departments));
      localStorage.setItem("items", JSON.stringify(items));
      localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
      localStorage.setItem("inventoryHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
    }
  }, [departments, items, inventoryData, history]);

  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Синхронизация с Google Sheets при первом подключении онлайн
    if (isOnline) {
      const spreadsheetId = localStorage.getItem("spreadsheetId") || "";
      if (spreadsheetId) {
        syncWithGoogleSheets(spreadsheetId, departments, items, inventoryData);
      }
    }
  }, [isOnline, departments, items, inventoryData, history]);

  // Методы для работы с текущим городом
  const updateItemCount = (departmentId: string, itemId: string, count: number) => {
    setAllInventoryData(prev => {
      const cityData = { ...(prev[city] || {}) };
      if (!cityData[departmentId]) cityData[departmentId] = {};
      cityData[departmentId][itemId] = count;
      return { ...prev, [city]: cityData };
    });
  };

  const resetDepartmentCounts = (departmentId: string) => {
    setAllInventoryData(prev => {
      const cityData = { ...(prev[city] || {}) };
      cityData[departmentId] = {};
      return { ...prev, [city]: cityData };
    });
  };

  const addNewItem = (name: string, categoryId: string) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name,
      category: categoryId
    };
    setAllItems(prev => {
      const cityItems = prev[city] ? [...prev[city]] : [];
      return { ...prev, [city]: [...cityItems, newItem] };
    });
  };

  const deleteItem = (itemId: string, departmentId: string) => {
    setAllItems(prev => {
      const cityItems = prev[city] ? prev[city].filter(item => item.id !== itemId) : [];
      return { ...prev, [city]: cityItems };
    });
    setAllInventoryData(prev => {
      const cityData = { ...(prev[city] || {}) };
      if (cityData[departmentId]) {
        delete cityData[departmentId][itemId];
      }
      return { ...prev, [city]: cityData };
    });
  };

  // Сохраняем выбранный город
  React.useEffect(() => {
    localStorage.setItem("selectedCity", city);
  }, [city]);

  // При инициализации читаем данные для всех городов из localStorage
  React.useEffect(() => {
    try {
      const savedAllInventoryData = localStorage.getItem("allInventoryData");
      const savedAllItems = localStorage.getItem("allItems");
      const savedAllHistory = localStorage.getItem("allHistory");
      if (savedAllInventoryData) setAllInventoryData(JSON.parse(savedAllInventoryData));
      if (savedAllItems) setAllItems(JSON.parse(savedAllItems));
      if (savedAllHistory) setAllHistory(JSON.parse(savedAllHistory));
    } catch (error) {
      // ignore
    }
  }, []);

  // Сохраняем все изменения по городам
  React.useEffect(() => {
    localStorage.setItem("allInventoryData", JSON.stringify(allInventoryData));
  }, [allInventoryData]);
  React.useEffect(() => {
    localStorage.setItem("allItems", JSON.stringify(allItems));
  }, [allItems]);
  React.useEffect(() => {
    localStorage.setItem("allHistory", JSON.stringify(allHistory));
  }, [allHistory]);

  return {
    departments,
    items,
    inventoryData,
    updateItemCount,
    resetDepartmentCounts,
    addNewItem,
    deleteItem,
    history,
    isOnline,
    syncStatus,
    checkOnlineStatus
  };
};