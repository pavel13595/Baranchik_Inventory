export interface Department {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  category: string; // Make sure this property exists
}

export interface InventoryData {
  [departmentId: string]: {
    [itemId: string]: number | string;
  };
}

export interface InventoryHistory {
  timestamp: number;
  userId: string;
  userName: string;
  itemId: string;
  itemName: string;
  departmentId: string;
  departmentName: string;
  oldValue: number;
  newValue: number;
}