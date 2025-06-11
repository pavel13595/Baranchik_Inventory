import { useImperativeHandle, useRef, useState, useEffect } from "react";
import { useInventoryData } from "../../hooks/use-inventory-data";
import { exportToExcel } from "../../utils/excel-export";
import { useTheme } from "../../contexts/theme-context";

export function useInventoryManagementLogic(props: any, ref: any) {
  const { city = "Кременчук", showBurgerMenu = false } = props;
  const { departments, items, inventoryData, updateItemCount, resetDepartmentCounts, addNewItem, deleteItem, history, isOnline, syncStatus, checkOnlineStatus } = useInventoryData(city);
  useTheme();

  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [selectedTabKey, setSelectedTabKey] = useState<string | null>(null);
  const [supportsSharing, setSupportsSharing] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setSelectedTabKey(departments[0]?.id || null);
  }, [departments]);

  useEffect(() => {
    const checkSharingSupport = async () => {
      try {
        if (navigator.share && typeof navigator.canShare === 'function') {
          const dummyBlob = new Blob(['dummy'], { type: 'text/plain' });
          const dummyFile = new File([dummyBlob], 'test.txt', { type: 'text/plain' });
          const shareData = { files: [dummyFile], title: 'Test', text: 'Test' };
          setSupportsSharing(navigator.canShare(shareData));
        } else {
          setSupportsSharing(false);
        }
      } catch {
        setSupportsSharing(false);
      }
    };
    checkSharingSupport();
  }, []);

  const handleExportToExcel = (sendToTelegram = false) => {
    if (selectedTabKey) {
      const selectedDepartment = departments.find(dept => dept.id === selectedTabKey);
      if (selectedDepartment) {
        exportToExcel(
          [selectedDepartment],
          items,
          { [selectedDepartment.id]: inventoryData[selectedDepartment.id] || {} },
          sendToTelegram,
          city
        );
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusClick = () => {
    checkOnlineStatus();
  };

  const addModalRef = useRef<{ open: () => void }>(null);
  const deleteModalRef = useRef<{ open: () => void }>(null);
  const resetModalRef = useRef<{ open: () => void }>(null);

  useImperativeHandle(ref, () => ({
    handleExportToExcel,
    openAddModal: () => addModalRef.current?.open(),
    openDeleteModal: () => deleteModalRef.current?.open(),
    openResetModal: () => resetModalRef.current?.open()
  }));

  return {
    city,
    showBurgerMenu,
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
    checkOnlineStatus,
    globalSearchQuery,
    setGlobalSearchQuery,
    selectedTabKey,
    setSelectedTabKey,
    supportsSharing,
    showScrollTop,
    scrollToTop,
    handleExportToExcel,
    handleStatusClick,
    addModalRef,
    deleteModalRef,
    resetModalRef
  };
}
