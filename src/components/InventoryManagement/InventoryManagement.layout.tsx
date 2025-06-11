import React, { forwardRef } from "react";
import { Card, CardBody, CardHeader, CardFooter, Button, Tabs, Tab, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DepartmentInventory } from "../DepartmentInventory/DepartmentInventory";

export const InventoryManagementLayout = forwardRef((props: any, ref) => {
  const {
    city,
    showBurgerMenu,
    departments,
    items,
    inventoryData,
    updateItemCount,
    resetDepartmentCounts,
    addNewItem,
    deleteItem,
    globalSearchQuery,
    setGlobalSearchQuery,
    selectedTabKey,
    setSelectedTabKey,
    showScrollTop,
    scrollToTop,
    handleExportToExcel,
    addModalRef,
    deleteModalRef,
    resetModalRef
  } = props;

  return (
    <div className="container mx-auto px-0 sm:px-4 py-2 sm:py-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col justify-between items-start gap-4 px-2 sm:px-6 pt-4 sm:pt-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 w-full">
            {`Той самий Баранчик ${city}`}
          </h1>
          <div className="flex w-full items-center gap-2 justify-between">
            <div className="hidden sm:flex flex-wrap gap-2 w-full justify-center">
              <Button 
                color="primary" 
                startContent={<Icon icon="lucide:file-spreadsheet" />} 
                onPress={() => handleExportToExcel(false)}
                fullWidth={true}
                className="sm:w-auto"
                size="sm"
                variant="flat"
              >
                Завантажити
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
                Відправити
              </Button>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="px-1 sm:px-6">
          <Tabs 
            aria-label="Відділи"
            className="w-full flex justify-center"
            selectedKey={selectedTabKey}
            onSelectionChange={(key) => setSelectedTabKey(key as string)}
            variant="underlined"
            classNames={{
              tabList: "overflow-x-auto flex-nowrap justify-center items-center flex gap-2 w-full",
              tab: "whitespace-nowrap px-2 sm:px-4",
              cursor: "w-full",
              panel: "px-0"
            }}
            size="sm"
          >
            {departments.map((department: any) => (
              <Tab key={department.id} title={
                department.id === "dept-1"
                  ? "Посуд"
                  : department.id === "dept-2"
                  ? "Господарські товари"
                  : department.id === "dept-3"
                  ? "Упаковка"
                  : department.name
              }>
                <DepartmentInventory
                  department={department}
                  items={items.filter((item: any) => item.category === department.id)}
                  inventoryData={inventoryData[department.id] || {}}
                  updateItemCount={updateItemCount}
                  resetDepartmentCounts={() => resetDepartmentCounts(department.id)}
                  addNewItem={(name: string) => addNewItem(name, department.id)}
                  deleteItem={deleteItem}
                  globalSearchQuery={globalSearchQuery}
                  setGlobalSearchQuery={setGlobalSearchQuery}
                  addModalRef={addModalRef}
                  deleteModalRef={deleteModalRef}
                  resetModalRef={resetModalRef}
                  showBurgerMenu={showBurgerMenu}
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
});

InventoryManagementLayout.displayName = "InventoryManagementLayout";
