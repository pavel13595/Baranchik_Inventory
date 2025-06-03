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

  React.useEffect(() => {
    try {
      // For iOS, use a more reliable approach
      if (isIOS) {
        // Use a single storage key for all data to minimize write operations
        const allData = {
          departments,
          items,
          inventoryData,
          history,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem("inventoryAppData", JSON.stringify(allData));
      } else {
        // For other platforms, use separate keys
        localStorage.setItem("departments", JSON.stringify(departments));
        localStorage.setItem("items", JSON.stringify(items));
        localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
        localStorage.setItem("inventoryHistory", JSON.stringify(history));
      }
      
      // Show success status briefly when data is saved
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 1000);
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      setSyncStatus("error");
    }
  }, [departments, items, inventoryData, history, isIOS]);

  React.useEffect(() => {
    if (!isIOS) return;
    
    const saveAllData = () => {
      try {
        const allData = {
          departments,
          items,
          inventoryData,
          history,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem("inventoryAppData", JSON.stringify(allData));
      } catch (error) {
        console.error("Error saving data on visibility change:", error);
      }
    };
    
    // Save when page becomes hidden (user switches apps or tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveAllData();
      }
    };
    
    // Save before page unload
    const handleBeforeUnload = () => {
      saveAllData();
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Also save periodically (every 10 seconds)
    const intervalId = setInterval(saveAllData, 10000);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(intervalId);
    };
  }, [departments, items, inventoryData, history, isIOS]);

  React.useEffect(() => {
    if (!isIOS) return;
    
    try {
      const savedData = localStorage.getItem("inventoryAppData");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.departments) setDepartments(parsedData.departments);
        if (parsedData.items) setItems(parsedData.items);
        if (parsedData.inventoryData) setInventoryData(parsedData.inventoryData);
        if (parsedData.history) setHistory(parsedData.history);
      }
    } catch (error) {
      console.error("Error loading combined data from localStorage:", error);
    }
  }, [isIOS]);

  const updateItemCount = (departmentId: string, itemId: string, count: number) => {
    setInventoryData(prev => {
      const newData = { ...prev };
      
      if (!newData[departmentId]) {
        newData[departmentId] = {};
      }
      
      // Get old value for history
      const oldValue = newData[departmentId][itemId] || 0;
      
      // Only update if value changed
      if (oldValue !== count) {
        // Update the value
        newData[departmentId][itemId] = count;
        
        // Add timestamp
        newData[departmentId][`${itemId}_timestamp`] = Date.now();
        
        // Add to history
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
              userName: "Система" // Default user name
            },
            ...prev.slice(0, 99) // Keep last 100 entries
          ]);
        }
      }
      
      return newData;
    });
  };

  const resetDepartmentCounts = (departmentId: string) => {
    setInventoryData(prev => {
      const newData = { ...prev };
      
      // Create a new empty object for the department or reset existing one
      newData[departmentId] = {};
      
      return newData;
    });
  };

  const addNewItem = (name: string, categoryId: string) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name,
      category: categoryId // Make sure to set the category
    };

    setItems(prev => [...prev, newItem]);
  };

  const addNewDepartment = (name: string) => {
    const newDepartment: Department = {
      id: `dept-${Date.now()}`,
      name
    };

    setDepartments(prev => [...prev, newDepartment]);
  };

  return {
    departments,
    items,
    inventoryData,
    updateItemCount,
    resetDepartmentCounts,
    addNewItem,
    addNewDepartment,
    history,
    isOnline,
    syncStatus,
    checkOnlineStatus
  };
};