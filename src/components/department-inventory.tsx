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

export const DepartmentInventory: React.FC<DepartmentInventoryProps & { cityLabel: string }> = ({
  department,
  items,
  inventoryData,
  updateItemCount,
  resetDepartmentCounts,
  addNewItem,
  deleteItem,
  globalSearchQuery,
  setGlobalSearchQuery,
  cityLabel
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

  // Для сортировки всей строки: формируем массив объектов {item, count}
  const itemsWithCount = filteredItems.map(item => ({
    item,
    count: Number(inventoryData[department.id]?.[item.id] ?? 0)
  }));

  // Сортировка: если активна, строки с количеством 0 наверху, остальные внизу (без сортировки между ними)
  const sortedRows = sortZeroToBottom
    ? [...itemsWithCount].sort((a, b) => {
        if (a.count === 0 && b.count !== 0) return -1;
        if (a.count !== 0 && b.count === 0) return 1;
        return 0;
      })
    : itemsWithCount;

  return (
    <div className="py-4">
      <h1 className="text-lg sm:text-2xl font-semibold mb-4" data-locator="src/components/department-inventory.tsx:h1:custom">
        {cityLabel}
      </h1>
      <div className="flex flex-row gap-2 mb-4 w-full justify-start">
        <Button color="primary" variant="flat" onPress={onOpen}>
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
              {sortedRows.map(({item, count}, idx) => (
                <TableRow key={`item-row-${item.id}`}>
                  <TableCell className="w-[40px]">{idx + 1}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-none truncate">
                    {item.name}
                  </TableCell>
                  <TableCell className="w-[120px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        isIconOnly
                        variant="bordered"
                        color="default"
                        className="p-0.5 rounded-full"
                        onPress={() => {
                          // Удаляем один товар
                          const currentValue = inventoryData[department.id]?.[item.id] ?? 0;
                          const newValue = Math.max(0, Number(currentValue) - 1);
                          updateItemCount(department.id, item.id, newValue);
                        }}
                        aria-label="Уменьшить количество"
                      >
                        <Icon icon="lucide:minimize" width={16} height={16} />
                      </Button>
                      <Input
                        type="text"
                        variant="bordered"
                        className="w-[80px] text-center"
                        value={inputValues[item.id] ?? ""}
                        onFocus={handleInputFocus}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        onBlur={() => handleInputBlur(item.id)}
                        aria-label={`Количество для ${item.name}`}
                      />
                      <Button 
                        isIconOnly
                        variant="bordered"
                        color="default"
                        className="p-0.5 rounded-full"
                        onPress={() => {
                          // Увеличиваем один товар
                          const currentValue = inventoryData[department.id]?.[item.id] ?? 0;
                          const newValue = Number(currentValue) + 1;
                          updateItemCount(department.id, item.id, newValue);
                        }}
                        aria-label="Увеличить количество"
                      >
                        <Icon icon="lucide:plus" width={16} height={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center text-default-500 py-4">
          Нет позиций для отображения
        </div>
      )}

      {/* Модальное окно добавления нового товара */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        aria-label="Добавить новый товар"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <Icon icon="lucide:plus" className="mr-2" />
              <h2 className="text-lg font-semibold">Добавить новый товар</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Название товара"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                aria-label="Название нового товара"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              onPress={handleAddItem}
              disabled={!newItemName.trim()}
            >
              Добавить
            </Button>
            <Button 
              variant="bordered" 
              onPress={onClose}
              className="ml-2"
            >
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно подтверждения сброса */}
      <Modal
        isOpen={resetModalDisclosure.isOpen}
        onOpenChange={resetModalDisclosure.onOpen}
        aria-label="Подтверждение сброса"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <Icon icon="lucide:refresh-cw" className="mr-2" />
              <h2 className="text-lg font-semibold">Сбросить количество товаров?</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Вы уверены, что хотите сбросить количество всех товаров в этом отделе до 0? Это действие нельзя будет отменить.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              onPress={handleResetConfirm}
            >
              Сбросить
            </Button>
            <Button 
              variant="bordered" 
              onPress={resetModalDisclosure.onClose}
              className="ml-2"
            >
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно удаления товара */}
      <Modal
        isOpen={deleteModal}
        onOpenChange={setDeleteModal}
        aria-label="Удалить товар"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <Icon icon="lucide:trash" className="mr-2" />
              <h2 className="text-lg font-semibold">Удалить товар</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Поиск товара для удаления"
                value={deleteSearch}
                onChange={(e) => setDeleteSearch(e.target.value)}
                aria-label="Поиск товара для удаления"
              />
              {deleteFilteredItems.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto">
                  {deleteFilteredItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`p-2 rounded cursor-pointer transition-all flex items-center gap-2 ${
                        deleteSelected === item.id 
                          ? "bg-danger-500 text-white" 
                          : "bg-default-100 hover:bg-default-200"
                      }`}
                      onClick={() => setDeleteSelected(item.id)}
                    >
                      <Icon icon="lucide:trash-2" className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-default-500 py-4">
                  Нет позиций для удаления
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              onPress={() => {
                if (deleteSelected) {
                  deleteItem(deleteSelected, department.id);
                  setDeleteSelected(null);
                  setDeleteModal(false);
                }
              }}
              disabled={!deleteSelected}
            >
              Удалить
            </Button>
            <Button 
              variant="bordered" 
              onPress={() => setDeleteModal(false)}
              className="ml-2"
            >
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
