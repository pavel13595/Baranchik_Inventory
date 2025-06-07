import React from "react";
import { Department, Item, InventoryData, InventoryHistory } from "../types/inventory";
import { initialDepartments, initialItems } from "../data/initial-data";
import { syncWithGoogleSheets } from "../utils/google-sheets";
import { db } from "../firebase-config";

export const useInventoryData = () => {
  const [departments, setDepartments] = React.useState<Department[]>(initialDepartments);
  const [items, setItems] = React.useState<Item[]>(initialItems);
  const [inventoryData, setInventoryData] = React.useState<InventoryData>({});
  const [history, setHistory] = React.useState<InventoryHistory[]>([]);
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

  const isIOS = React.useMemo(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
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
        setItems(JSON.parse(savedItems));
      }

      if (savedInventoryData) {
        setInventoryData(JSON.parse(savedInventoryData));
      }
      
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
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

  const updateItemCount = (departmentId: string, itemId: string, count: number) => {
    setInventoryData(prev => {
      const newData = { ...prev };
      if (!newData[departmentId]) newData[departmentId] = {};
      const oldValue = newData[departmentId][itemId] || 0;
      if (oldValue !== count) {
        (newData[departmentId] as any)[itemId] = count;
        (newData[departmentId] as any)[`${itemId}_timestamp`] = Date.now();
        const itemObj = items.find(i => i.id === itemId);
        const deptObj = departments.find(d => d.id === departmentId);
        if (itemObj && deptObj) {
          setHistory(prev => [
            {
              timestamp: Date.now(),
              departmentId,
              departmentName: deptObj.name,
              itemId,
              itemName: itemObj.name,
              oldValue: typeof oldValue === 'number' ? oldValue : 0,
              newValue: count,
              userName: "Система"
            },
            ...prev.slice(0, 99)
          ]);
        }
      }
      return newData;
    });
  };

  const resetDepartmentCounts = (departmentId: string) => {
    setInventoryData(prev => {
      const newData = { ...prev };
      newData[departmentId] = {};
      return newData;
    });
  };

  const addNewItem = (name: string, categoryId: string) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name,
      category: categoryId
    };
    setItems(prev => [...prev, newItem]);
  };

  const deleteItem = (itemId: string, departmentId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setInventoryData(prev => {
      const newData = { ...prev };
      if (newData[departmentId]) {
        delete (newData[departmentId] as any)[itemId];
      }
      return newData;
    });
  };

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