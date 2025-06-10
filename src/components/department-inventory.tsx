import React, { forwardRef, useImperativeHandle, useMemo, useCallback } from "react";
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
  inventoryData: { [itemId: string]: number | string };
  updateItemCount: (departmentId: string, itemId: string, count: number) => void;
  resetDepartmentCounts: () => void;
  addNewItem: (name: string) => void;
  deleteItem: (itemId: string, departmentId: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  addModalRef?: React.Ref<{ open: () => void }>;
  deleteModalRef?: React.Ref<{ open: () => void }>;
  resetModalRef?: React.Ref<{ open: () => void }>;
  showBurgerMenu?: boolean;
}

export const DepartmentInventory = forwardRef((props: DepartmentInventoryProps, ref) => {
  const {
    department,
    items,
    inventoryData,
    updateItemCount,
    resetDepartmentCounts,
    addNewItem,
    deleteItem,
    globalSearchQuery,
    setGlobalSearchQuery,
    addModalRef,
    deleteModalRef,
    resetModalRef,
    showBurgerMenu,
  } = props;
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const resetModalDisclosure = useDisclosure();
  const [newItemName, setNewItemName] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState(globalSearchQuery);
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [deleteSearch, setDeleteSearch] = React.useState("");
  const [deleteSelected, setDeleteSelected] = React.useState<string | null>(null);
  const [showZeroOnly, setShowZeroOnly] = React.useState(false);
  const [sortZeroToBottom, setSortZeroToBottom] = React.useState(false);

  // Показывать кнопки только если НЕ мобильное устройство и НЕ showBurgerMenu
  // Исправление: определять isMobile только один раз на маунте, и использовать showBurgerMenu только из props
  // Это предотвратит "мигание" кнопок при смене таба
  const isMobile = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  }, []);

  // Sync local search with global search
  React.useEffect(() => {
    setSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  React.useEffect(() => {
    setGlobalSearchQuery(searchQuery);
  }, [searchQuery, setGlobalSearchQuery]);

  // Мемоизация фильтрации и автокомплита
  const filteredItems = useMemo(() =>
    items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [items, searchQuery]
  );
  const autocompleteItems = useMemo(() =>
    items.map(item => ({ key: item.id, label: item.name })),
    [items]
  );

  // Мемоизация inputValues только для видимых items
  const inputValues = useMemo(() => {
    const values: {[itemId: string]: string} = {};
    filteredItems.forEach(item => {
      const count = inventoryData[item.id] ?? 0;
      // Для всех отделов теперь одинаково: только целые числа
      values[item.id] = String(Math.floor(Number(count)));
    });
    return values;
  }, [filteredItems, inventoryData]);

  // Для сортировки всей строки: формируем массив объектов {item, count}
  const itemsWithCount = useMemo(() =>
    filteredItems.map(item => ({ item, count: Number(inventoryData[item.id] ?? 0) })),
    [filteredItems, inventoryData]
  );

  // Мемоизация sortedRows
  const sortedRows = useMemo(() => (
    sortZeroToBottom
      ? [...itemsWithCount].sort((a, b) => {
          if (a.count === 0 && b.count !== 0) return -1;
          if (a.count !== 0 && b.count === 0) return 1;
          return 0;
        })
      : itemsWithCount
  ), [sortZeroToBottom, itemsWithCount]);

  // Add a function to handle input value changes
  const handleValueChange = (itemId: string, value: string) => {
    // Для всех отделов теперь одинаково: только целые числа
    const numericValue = parseInt(value.replace(/[^\d]/g, "")) || 0;
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

  // Calculate department total
  const departmentTotal = items.reduce((sum, item) => {
    // Исправлено: inventoryData теперь по item.id, а не по department.id
    const count = typeof inventoryData[item.id] === 'number' 
      ? inventoryData[item.id] as number 
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

  // --- ОПТИМИЗАЦИЯ: удаляем лишний setInputValues, используем только локальный inputValues для отображения, а обновление inventoryData делаем через handleValueChange/handleInputBlur ---
  // inputValues теперь вычисляется только для видимых items через useMemo выше

  // handleInputChange теперь просто вызывает handleValueChange (и не вызывает setInputValues)
  const handleInputChange = useCallback((itemId: string, value: string) => {
    handleValueChange(itemId, value);
  }, [handleValueChange]);

  // handleInputBlur теперь не вызывает setInputValues, только обновляет inventoryData
  const handleInputBlur = useCallback((itemId: string) => {
    const value = inputValues[itemId] ?? "";
    let numericValue: number | null = null;
    if (/^\d+$/.test(value)) {
      numericValue = parseInt(value, 10);
    }
    if (numericValue !== null && !isNaN(numericValue)) {
      updateItemCount(department.id, itemId, numericValue);
    } else if (value === "") {
      updateItemCount(department.id, itemId, 0);
    }
  }, [inputValues, updateItemCount]);

  // Фильтр для поиска в модальном окне удаления
  const deleteFilteredItems = items.filter(item =>
    item.name.toLowerCase().includes(deleteSearch.toLowerCase())
  );

  useImperativeHandle(addModalRef, () => ({ open: onOpen }), [onOpen]);
  useImperativeHandle(deleteModalRef, () => ({ open: () => setDeleteModal(true) }), []);
  useImperativeHandle(resetModalRef, () => ({ open: resetModalDisclosure.onOpen }), [resetModalDisclosure]);

  // Группа управления (добавить, удалить, сбросить, экспорт, отправить)
  const showActionButtons = React.useMemo(() => {
    // Кнопки видны только на десктопе и планшете, если не открыт бургер-меню
    return !isMobile && !showBurgerMenu;
  }, [isMobile, showBurgerMenu]);

  return (
    <div className="py-4">
      {showActionButtons && (
        <div className="flex flex-row flex-wrap gap-2 w-full justify-center mb-4">
          {/* Управление товарами */}
          <Button color="primary" variant="flat" onPress={onOpen}>
            <Icon icon="lucide:plus" className="mr-1" /> Додати
          </Button>
          <Button color="danger" variant="flat" onPress={() => setDeleteModal(true)}>
            <Icon icon="lucide:trash" className="mr-1" /> Видалити
          </Button>
          <Button color="warning" variant="flat" onPress={resetModalDisclosure.onOpen}>
            <Icon icon="lucide:refresh-cw" className="mr-1" /> Скинути
          </Button>
        </div>
      )}
      <div className="w-full">
        <Autocomplete
          defaultItems={autocompleteItems}
          label="Пошук позицій"
          placeholder="Введіть назву позиції"
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
            "aria-label": "Очистити пошук",
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
              <TableColumn key="name" className="w-full min-w-[120px]">Найменування</TableColumn>
              <TableColumn key="quantity" className="w-[120px] text-center cursor-pointer select-none" onClick={() => setSortZeroToBottom(v => !v)}>
                <span className="inline-flex items-center gap-1 justify-center">
                  Кількість
                  <Icon icon="lucide:arrow-down-up" className={sortZeroToBottom ? "text-primary" : "text-default-400"} width={18} height={18} />
                </span>
              </TableColumn>
            </TableHeader>
            <TableBody>
              {sortedRows.map(({item, count}, idx) => (
                <TableRow key={`item-row-${item.id}`}>
                  <TableCell className="w-[40px]">{idx + 1}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-none truncate">{item.name}</TableCell>
                  <TableCell className="w-[120px] text-center align-middle">
                    <div className="flex items-center justify-center gap-1">
                      {/* Удаляем setInputValues из onPress у кнопок +/- (теперь только updateItemCount) */}
                      <Button 
                        isIconOnly
                        variant="bordered"
                        color="default"
                        className="p-0.5 rounded-full"
                        onPress={() => {
                          let rawValue = inputValues[item.id] ?? "";
                          let currentValue = department.id === "dept-2" ? Number(rawValue.replace(',', '.')) : Number(rawValue);
                          if (isNaN(currentValue)) currentValue = 0;
                          let newValue = currentValue - 1;
                          if (department.id === "dept-1" || department.id === "dept-3") {
                            newValue = Math.max(0, Math.round(newValue));
                          } else if (department.id === "dept-2") {
                            newValue = Math.max(0, Number((currentValue - 0.1).toFixed(1)));
                          }
                          updateItemCount(department.id, item.id, newValue);
                        }}
                        aria-label="Уменьшить количество"
                      >
                        <Icon icon="lucide:minus" width={16} height={16} />
                      </Button>
                      <Input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        variant="bordered"
                        style={{ width: '2.5em', minWidth: '2.5em', maxWidth: '2.5em', textAlign: 'center', fontWeight: 600, textAlignLast: 'center' }}
                        className="text-center font-semibold"
                        value={inputValues[item.id] ?? ""}
                        onFocus={handleInputFocus}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        onBlur={() => handleInputBlur(item.id)}
                        aria-label={`Количество для ${item.name}`}
                        classNames={{ input: "text-center font-semibold" }}
                        min={0}
                        step={1}
                      />
                      <Button 
                        isIconOnly
                        variant="bordered"
                        color="default"
                        className="p-0.5 rounded-full"
                        onPress={() => {
                          let rawValue = inputValues[item.id] ?? "";
                          let currentValue = department.id === "dept-2" ? Number(rawValue.replace(',', '.')) : Number(rawValue);
                          if (isNaN(currentValue)) currentValue = 0;
                          let newValue;
                          if (department.id === "dept-1" || department.id === "dept-3") {
                            newValue = Math.round(currentValue + 1);
                          } else if (department.id === "dept-2") {
                            newValue = Number((currentValue + 0.1).toFixed(1));
                          } else {
                            newValue = currentValue + 1;
                          }
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
          Немає позицій для відображення
        </div>
      )}

      {/* Модальне вікно додавання нового товару */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        aria-label="Додати новий товар"
        placement="bottom"
        className=""
        style={{}}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <Icon icon="lucide:plus" className="mr-2" />
              <h2 className="text-lg font-semibold">Додати новий товар</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Назва товару"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                aria-label="Назва нового товару"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              onPress={handleAddItem}
              disabled={!newItemName.trim()}
            >
              Додати
            </Button>
            <Button 
              variant="bordered" 
              onPress={onClose}
              className="ml-2"
            >
              Відміна
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальне вікно підтвердження скидання */}
      <Modal
        isOpen={resetModalDisclosure.isOpen}
        onOpenChange={resetModalDisclosure.onOpen}
        aria-label="Підтвердження скидання"
        placement="bottom"
        className=""
        style={{}}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <Icon icon="lucide:refresh-cw" className="mr-2" />
              <h2 className="text-lg font-semibold">Скинути кількість товарів?</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Ви впевнені, що хочете скинути кількість усіх товарів у цьому відділі до 0? Це дію не можна буде скасувати.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="danger" 
              onPress={handleResetConfirm}
            >
              Скинути
            </Button>
            <Button 
              variant="bordered" 
              onPress={resetModalDisclosure.onClose}
              className="ml-2"
            >
              Відміна
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальне вікно видалення товару */}
      <Modal
        isOpen={deleteModal}
        onOpenChange={setDeleteModal}
        aria-label="Видалити товар"
        placement="bottom"
        className=""
        style={{}}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center">
              <Icon icon="lucide:trash" className="mr-2" />
              <h2 className="text-lg font-semibold">Видалити товар</h2>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Пошук товару для видалення"
                value={deleteSearch}
                onChange={(e) => setDeleteSearch(e.target.value)}
                aria-label="Пошук товару для видалення"
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
                  Немає позицій для видалення
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
              Видалити
            </Button>
            <Button 
              variant="bordered" 
              onPress={() => setDeleteModal(false)}
              className="ml-2"
            >
              Відміна
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

DepartmentInventory.displayName = "DepartmentInventory";
