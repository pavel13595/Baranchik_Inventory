import React from "react";
import { Card, CardBody, CardHeader, CardFooter, Button, Tabs, Tab, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Badge, Switch, Select, SelectItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DepartmentInventory } from "./department-inventory";
import { useInventoryData } from "../hooks/use-inventory-data";
import { exportToExcel } from "../utils/excel-export";
import { initialDepartments, initialItems } from "../data/initial-data";
import type { Item } from "../types/inventory";
import { useTheme } from "../contexts/theme-context";

export const InventoryManagement: React.FC = () => {
  const { 
    departments, 
    inventoryData, 
    updateItemCount, 
    resetDepartmentCounts,
    addNewItem,
    deleteItem,
    history,
    isOnline,
    syncStatus,
    checkOnlineStatus
  } = useInventoryData();
  
  const { theme } = useTheme();

  const [globalSearchQuery, setGlobalSearchQuery] = React.useState("");
  const [selectedTabKey, setSelectedTabKey] = React.useState<string | null>(null);
  const [supportsSharing, setSupportsSharing] = React.useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  // Set default tab without user role check
  React.useEffect(() => {
    setSelectedTabKey(departments[0]?.id || null);
  }, [departments]);

  // Используем только один список товаров (Кременчуг)
  const items = initialItems;

  // Check if device supports sharing files - fix the error with navigator.canShare
  React.useEffect(() => {
    const checkSharingSupport = async () => {
      try {
        if (navigator.share && typeof navigator.canShare === 'function') {
          const dummyBlob = new Blob(['dummy'], { type: 'text/plain' });
          const dummyFile = new File([dummyBlob], 'test.txt', { type: 'text/plain' });
          
          const shareData = {
            files: [dummyFile],
            title: 'Test',
            text: 'Test'
          };
          
          setSupportsSharing(navigator.canShare(shareData));
        } else {
          setSupportsSharing(false);
        }
      } catch (error) {
        console.error("Error checking sharing support:", error);
        setSupportsSharing(false);
      }
    };
    
    checkSharingSupport();
  }, []);

  // Export only the current department
  const handleExportToExcel = (sendToTelegram = false) => {
    if (selectedTabKey) {
      const selectedDepartment = departments.find(dept => dept.id === selectedTabKey);
      if (selectedDepartment) {
        exportToExcel(
          [selectedDepartment],
          items,
          { [selectedDepartment.id]: inventoryData[selectedDepartment.id] || {} },
          sendToTelegram
        );
      }
    }
  };

  // Check scroll position to show/hide back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Add a function to toggle Firebase network connection
  const handleStatusClick = () => {
    checkOnlineStatus();
  };

  return (
    <div className="container mx-auto px-0 sm:px-4 py-2 sm:py-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col justify-between items-start gap-4 px-2 sm:px-6">
          <div className="flex justify-between w-full items-center gap-2">
            <div className="flex items-center gap-2">
            </div>
            {/* Status indicator - make it clickable to check online status */}
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="min-w-0 w-8 h-8 p-0"
              onPress={handleStatusClick}
              aria-label="Проверить подключение"
            >
              <div className={`w-3 h-3 rounded-full ${
                syncStatus === 'syncing' ? 'bg-primary animate-pulse' : 
                syncStatus === 'success' ? 'bg-success' : 
                syncStatus === 'error' ? 'bg-danger' : 
                isOnline ? 'bg-success' : 'bg-danger'
              }`} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            <Button 
              color="primary" 
              startContent={<Icon icon="lucide:file-spreadsheet" />} 
              onPress={() => handleExportToExcel(false)}
              fullWidth={true}
              className="sm:w-auto"
              size="sm"
              variant="flat"
            >
              Скачать
            </Button>
            
            <Button 
              color="secondary" 
              startContent={<Icon icon="logos:telegram" />} 
              onPress={() => handleExportToExcel(true)}
              fullWidth={true}
              className="sm:w-auto"
              size="sm"
              variant="flat"
            >
              Отправить
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-1 sm:px-6">
          <Tabs 
            aria-label="Departments" 
            className="w-full"
            selectedKey={selectedTabKey}
            onSelectionChange={(key) => setSelectedTabKey(key as string)}
            variant="underlined"
            classNames={{
              tabList: "overflow-x-auto flex-nowrap",
              tab: "whitespace-nowrap px-2 sm:px-4",
              cursor: "w-full",
              panel: "px-0"
            }}
            size="sm"
          >
            {departments.map((department) => (
              <Tab key={department.id} title={department.name}>
                <DepartmentInventory
                  department={department}
                  items={items.filter(item => item.category === department.id)}
                  inventoryData={inventoryData[department.id] || {}}
                  updateItemCount={updateItemCount}
                  resetDepartmentCounts={() => resetDepartmentCounts(department.id)}
                  addNewItem={(name) => addNewItem(name, department.id)}
                  deleteItem={deleteItem}
                  globalSearchQuery={globalSearchQuery}
                  setGlobalSearchQuery={setGlobalSearchQuery}
                />
              </Tab>
            ))}
          </Tabs>
        </CardBody>
        <CardFooter className="flex justify-between px-2 sm:px-6">
          <p className="text-default-500 text-xs">
          </p>
        </CardFooter>
      </Card>
      
      {/* Back to top button */}
      {showScrollTop && (
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          onPress={scrollToTop}
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          aria-label="Вернуться наверх"
        >
          <Icon icon="lucide:chevron-up" width={20} height={20} />
        </Button>
      )}
    </div>
  );
};