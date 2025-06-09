import { Department, Item } from "../types/inventory";

export const initialDepartments: Department[] = [
  { id: "dept-1", name: "Посуда" },
  { id: "dept-2", name: "Хозяйственные товары" },
  { id: "dept-3", name: "Упаковка" }
];

// Импортируем списки для каждого города
import { kremenchukItems } from "./initial-data-kremenchuk";
import { lvivItems } from "./initial-data-lviv";
import { kharkivItems } from "./initial-data-kharkiv";

export { kremenchukItems } from "./initial-data-kremenchuk";
export { lvivItems } from "./initial-data-lviv";
export { kharkivItems } from "./initial-data-kharkiv";

export const cityItems: Record<string, Item[]> = {
  "Кременчук": kremenchukItems,
  "Львів": lvivItems,
  "Харків": kharkivItems,
};