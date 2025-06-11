import { useState, useMemo, useEffect, useCallback } from "react";

export function useDepartmentInventoryLogic(props: any) {
  const {
    items,
    inventoryData,
    updateItemCount,
    resetDepartmentCounts,
    addNewItem,
    deleteItem,
    globalSearchQuery,
    setGlobalSearchQuery,
    showBurgerMenu
  } = props;

  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSearch, setDeleteSearch] = useState("");
  const [deleteSelected, setDeleteSelected] = useState<string | null>(null);
  const [showZeroOnly, setShowZeroOnly] = useState(false);
  const [sortZeroToBottom, setSortZeroToBottom] = useState(false);

  useEffect(() => {
    setSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  useEffect(() => {
    setGlobalSearchQuery(searchQuery);
  }, [searchQuery, setGlobalSearchQuery]);

  const filteredItems = useMemo(() =>
    items.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [items, searchQuery]
  );
  const autocompleteItems = useMemo(() =>
    items.map((item: any) => ({ key: item.id, label: item.name })),
    [items]
  );

  return {
    newItemName, setNewItemName,
    searchQuery, setSearchQuery,
    selectedItem, setSelectedItem,
    deleteModal, setDeleteModal,
    deleteSearch, setDeleteSearch,
    deleteSelected, setDeleteSelected,
    showZeroOnly, setShowZeroOnly,
    sortZeroToBottom, setSortZeroToBottom,
    filteredItems, autocompleteItems
  };
}
