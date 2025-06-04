import React from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Input, 
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Chip,
  Switch
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Department, Item, InventoryData } from "../types/inventory";
import { parseDecimalInput } from "../utils/number-helpers";

interface DepartmentInventoryProps {
  department: Department;
  items: Item[];
  inventoryData: InventoryData;
  updateItemCount: (departmentId: string, itemId: string, count: number) => void;
  resetDepartmentCounts: () => void;
  addNewItem: (name: string) => void;
  deleteItem: (itemId: string, departmentId: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

export const DepartmentInventory: React.FC<DepartmentInventoryProps> = ({
  department,
  items,
  inventoryData,
  updateItemCount,
  resetDepartmentCounts,
  addNewItem,
  deleteItem,
  globalSearchQuery,
  setGlobalSearchQuery
}) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const resetModalDisclosure = useDisclosure();
  const [newItemName, setNewItemName] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState(globalSearchQuery);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [inputValues, setInputValues] = React.useState<{[itemId: string]: string}>({});
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [deleteSearch, setDeleteSearch] = React.useState("");
  const [deleteSelected, setDeleteSelected] = React.useState<string | null>(null);
  const [showZeroOnly, setShowZeroOnly] = React.useState(false);
  const [sortZeroToBottom, setSortZeroToBottom] = React.useState(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // Sync local search with global search
  React.useEffect(() => {
    setSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  React.useEffect(() => {
    setGlobalSearchQuery(searchQuery);
  }, [searchQuery, setGlobalSearchQuery]);

  // ИНИЦИАЛИЗАЦИЯ inputValues при изменении inventoryData
  React.useEffect(() => {
    const newValues: {[itemId: string]: string} = {};
    items.forEach(item => {
      const count = inventoryData[department.id]?.[item.id] ?? 0;
      if (department.id === "dept-1" || department.id === "dept-3") {
        newValues[item.id] = String(Math.floor(Number(count)));
      } else {
        newValues[item.id] = Number(count).toFixed(2).replace('.', ',');
      }
    });
    setInputValues(newValues);
  // eslint-disable-next-line
  }, [inventoryData, department.id, items]);

  // Add a function to handle input value changes
  const handleValueChange = (itemId: string, value: string) => {
    // Parse the input value
    let numericValue: number;
    
    if (department.id === "dept-1" || department.id === "dept-3") { // Посуда и Упаковка - only whole numbers
      // Convert to integer
      numericValue = parseInt(value.replace(/[^\d]/g, '')) || 0;
    } else {
      // For other departments, allow decimal values
      // Replace comma with dot for proper parsing
      const normalizedValue = value.replace(',', '.');
      numericValue = parseFloat(normalizedValue) || 0;
      // Round to 2 decimal places
      numericValue = Number(numericValue.toFixed(2));
    }
    
    // Update the inventory data
    updateItemCount(department.id, itemId, numericValue);
  };

  // Add function to handle input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Если значение 0 или 0,00 — очищаем поле и выделяем (работает на всех устройствах)
    if (e.target.value === "0" || e.target.value === "0,00") {
      e.target.value = "";
      setTimeout(() => e.target.select(), 0);
      return;
    }
    // Для любого значения выделяем весь текст
    e.target.select();
  };

  // Add a function to extract item code from item ID
  const getItemCode = (itemId: string): string => {
    // Try to extract the numeric part after "item-"
    const match = itemId.match(/item-(.+)/);
    return match ? match[1] : "";
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const autocompleteItems = items.map(item => ({
    key: item.id,
    label: item.name
  }));

  // Calculate department total
  const departmentTotal = items.reduce((sum, item) => {
    const count = typeof inventoryData[department.id]?.[item.id] === 'number' 
      ? inventoryData[department.id]?.[item.id] as number 
      : 0;
    return sum + count;
  }, 0);

  // Handle adding a new item
  const handleAddItem = () => {
    if (newItemName.trim()) {
      addNewItem(newItemName.trim());
      setNewItemName("");
      onClose();
    }
  };

  // Handle reset confirmation - fixed implementation
  const handleResetConfirm = () => {
    resetDepartmentCounts();
    resetModalDisclosure.onClose();
  };

  // ОБНОВЛЕНИЕ inputValues при вводе
  const handleInputChange = (itemId: string, value: string) => {
    setInputValues(prev => ({ ...prev, [itemId]: value }));
  };

  // ОБНОВЛЕНИЕ inventoryData только при блюре или валидном числе
  const handleInputBlur = (itemId: string) => {
    const value = inputValues[itemId] ?? "";
    let numericValue: number | null = null;
    if (department.id === "dept-1" || department.id === "dept-3") {
      // Только целые числа
      if (/^\d+$/.test(value)) {
        numericValue = parseInt(value, 10);
      }
    } else {
      // Дробные значения, поддержка запятой и точки
      const normalized = value.replace(',', '.');
      if (/^\d+(\.|,)?\d*$/.test(value) && !isNaN(Number(normalized))) {
        numericValue = Number(Number(normalized).toFixed(2));
      }
    }
    if (numericValue !== null && !isNaN(numericValue)) {
      updateItemCount(department.id, itemId, numericValue);
    } else if (value === "") {
      // Если поле очищено — обнуляем
      updateItemCount(department.id, itemId, 0);
    } else {
      // Некорректное значение — не обновляем
      setInputValues(prev => ({ ...prev, [itemId]: "" }));
    }
  };

  // Фильтр для поиска в модальном окне удаления
  const deleteFilteredItems = items.filter(item =>
    item.name.toLowerCase().includes(deleteSearch.toLowerCase())
  );

  // Сортировка: если активна, строки с количеством 0 внизу, остальные по возрастанию
  const sortedItems = sortZeroToBottom
    ? [...filteredItems].sort((a, b) => {
        const countA = Number(inventoryData[department.id]?.[a.id] ?? 0);
        const countB = Number(inventoryData[department.id]?.[b.id] ?? 0);
        if (countA === 0 && countB !== 0) return 1;
        if (countA !== 0 && countB === 0) return -1;
        if (countA === 0 && countB === 0) return 0;
        return countA - countB;
      })
    : filteredItems;

  return (
    <div className="py-4">
      <div className="flex flex-row gap-2 mb-4 w-full justify-start">
        <Button color="primary" onPress={onOpen}>
          <Icon icon="lucide:plus" className="mr-1" /> Добавить
        </Button>
        <Button color="danger" variant="flat" onPress={() => setDeleteModal(true)}>
          <Icon icon="lucide:trash" className="mr-1" /> Удалить
        </Button>
        <Button color="warning" variant="flat" onPress={resetModalDisclosure.onOpen}>
          <Icon icon="lucide:refresh-cw" className="mr-1" /> Сбросить
        </Button>
      </div>
      <div className="w-full">
        <Autocomplete
          defaultItems={autocompleteItems}
          label="Поиск позиций"
          placeholder="Введите название позиции"
          className="w-full"
          inputValue={searchQuery}
          onInputChange={setSearchQuery}
          selectedKey={selectedItem}
          onSelectionChange={(key) => {
            if (key) {
              setSelectedItem(key.toString());
              setSearchQuery(items.find(item => item.id === key)?.name || "");
            }
          }}
          clearButtonProps={{
            "aria-label": "Очистить поиск",
            onPress: () => {
              setSearchQuery("");
              setSelectedItem(null);
            }
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.key}>
              {item.label}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>
      <div className="mb-4" />
      <div className="flex flex-wrap gap-2 justify-between w-full">
        <div className="flex gap-2">
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="overflow-x-hidden">
          <Table 
            aria-label={`Inventory for ${department.name}`}
            removeWrapper
            className="min-h-[400px] min-w-full"
            shadow="none"
            isStriped
            selectionMode="none"
          >
            <TableHeader>
              <TableColumn key="number" className="w-[40px]">№</TableColumn>
              <TableColumn key="name" className="w-full min-w-[120px]">Наименование</TableColumn>
              <TableColumn key="quantity" className="w-[120px] text-center cursor-pointer select-none" onClick={() => setSortZeroToBottom(v => !v)}>
                <span className="inline-flex items-center gap-1 justify-center">
                  Количество
                  <Icon icon="lucide:arrow-down-up" className={sortZeroToBottom ? "text-primary" : "text-default-400"} width={18} height={18} />
                </span>
              </TableColumn>
            </TableHeader>
            <TableBody>
              {sortedItems.map((item, index) => {
                const count = inventoryData[department.id]?.[item.id] || 0;

                return (
                  <TableRow key={`item-row-${item.id}`}>
                    <TableCell className="w-[40px]">{index + 1}</TableCell>
                    <TableCell className="max-w-[150px] sm:max-w-none truncate">
                      {item.name}
                    </TableCell>
                    <TableCell className="w-[120px] text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat"
                          onPress={() => {
                            let newValue;
                            if (department.id === "dept-1" || department.id === "dept-3") { // Посуда и Упаковка - only whole numbers
                              newValue = Math.max(0, (typeof count === 'number' ? Math.floor(count) : 0) - 1);
                            } else {
                              newValue = Math.max(0, (typeof count === 'number' ? count : 0) - 0.1);
                              newValue = Number(newValue.toFixed(2));
                            }
                            updateItemCount(department.id, item.id, newValue);
                          }}
                          className="min-w-[30px] w-[30px] h-[30px]"
                        >
                          <Icon icon="lucide:minus" className="w-4 h-4" />
                        </Button>
                        <Input
                          type="text"
                          inputMode={department.id === "dept-2" ? "decimal" : (department.id === "dept-1" || department.id === "dept-3" ? "numeric" : "decimal")}
                          min="0"
                          value={inputValues[item.id] ?? ""}
                          onValueChange={(value) => handleInputChange(item.id, value)}
                          onBlur={() => handleInputBlur(item.id)}
                          onFocus={handleInputFocus}
                          className="w-14"
                          classNames={{
                            input: "text-center px-0",
                            inputWrapper: "px-1"
                          }}
                          size="sm"
                        />
                        <Button 
                          isIconOnly 
                          size="sm" 
                          variant="flat"
                          onPress={() => {
                            let newValue;
                            if (department.id === "dept-1" || department.id === "dept-3") { // Посуда и Упаковка - only whole numbers
                              newValue = (typeof count === 'number' ? Math.floor(count) : 0) + 1;
                            } else {
                              newValue = (typeof count === 'number' ? count : 0) + 0.1;
                              newValue = Number(newValue.toFixed(2));
                            }
                            updateItemCount(department.id, item.id, newValue);
                          }}
                          className="min-w-[30px] w-[30px] h-[30px]"
                        >
                          <Icon icon="lucide:plus" className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border border-default-200 rounded-medium">
          <Icon icon="lucide:search-x" className="w-12 h-12 text-default-300 mb-4" />
          <p className="text-default-500">Нет позиций для отображения</p>
        </div>
      )}

      {/* Add item modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Добавить новую позицию в {department.name}</ModalHeader>
              <ModalBody>
                <Input
                  label="Наименование"
                  placeholder="Введите наименование позиции"
                  value={newItemName}
                  onValueChange={setNewItemName}
                  autoFocus
                />
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="flat" 
                  onPress={onClose}
                >
                  Отмена
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleAddItem}
                  isDisabled={!newItemName.trim()}
                >
                  Добавить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Reset confirmation modal */}
      <Modal 
        isOpen={resetModalDisclosure.isOpen} 
        onOpenChange={resetModalDisclosure.onOpenChange}
      >
        <ModalContent>
          {(onModalClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Подтверждение</ModalHeader>
              <ModalBody>
                <p>
                  Вы уверены, что хотите сбросить все значения для категории "{department.name}"?
                </p>
                <p className="text-danger">
                  Это действие нельзя отменить.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="default" 
                  variant="flat" 
                  onPress={onModalClose}
                >
                  Отмена
                </Button>
                <Button 
                  color="danger" 
                  onPress={() => {
                    resetDepartmentCounts();
                    onModalClose();
                  }}
                >
                  Сбросить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete item modal */}
      <Modal isOpen={deleteModal} onOpenChange={setDeleteModal}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Удалить позицию</ModalHeader>
              <ModalBody>
                <Input
                  label="Поиск по наименованию"
                  placeholder="Введите название позиции"
                  value={deleteSearch}
                  onValueChange={setDeleteSearch}
                  autoFocus
                />
                <div className="mt-2 max-h-40 overflow-y-auto">
                  {deleteFilteredItems.length === 0 && (
                    <div className="text-default-400 text-sm py-2 text-center">Нет совпадений</div>
                  )}
                  {deleteFilteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`cursor-pointer px-2 py-1 rounded hover:bg-default-100 ${deleteSelected === item.id ? 'bg-danger/20' : ''}`}
                      onClick={() => setDeleteSelected(item.id)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={() => { setDeleteModal(false); setDeleteSelected(null); setDeleteSearch(""); }}>Отмена</Button>
                <Button color="danger" isDisabled={!deleteSelected} onPress={() => {
                  if (deleteSelected) {
                    // Удаляем выбранную позицию
                    const itemId = deleteSelected;
                    if (typeof deleteItem === 'function') deleteItem(itemId, department.id);
                  }
                  setDeleteModal(false); setDeleteSelected(null); setDeleteSearch("");
                }}>Удалить</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};