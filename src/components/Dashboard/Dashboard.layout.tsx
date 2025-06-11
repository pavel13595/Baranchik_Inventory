import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { InventoryManagement } from "../InventoryManagement/InventoryManagement";
import { BurgerMenu } from "../BurgerMenu/BurgerMenu";

export function DashboardLayout({
  selectedCity,
  setSelectedCity,
  showBurgerMenu,
  setShowBurgerMenu,
  inventoryRef,
  styles
}: any) {
  return (
    <div className={styles.dashboardRoot}>
      <Navbar isBordered maxWidth="xl" className={styles.navbarFixed}>
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:clipboard-list" className="text-primary text-2xl sm:text-3xl" style={{ minWidth: 32, minHeight: 32 }} />
            <span className="font-bold text-inherit flex items-center gap-2" style={{ minWidth: 180 }}>
              Інвентаризація
            </span>
          </div>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
          <NavbarItem className="block sm:hidden">
            <BurgerMenu
              onDownload={() => inventoryRef.current?.handleExportToExcel?.(false)}
              onSend={() => inventoryRef.current?.handleExportToExcel?.(true)}
              onAdd={() => inventoryRef.current?.openAddModal?.()}
              onDelete={() => inventoryRef.current?.openDeleteModal?.()}
              onReset={() => inventoryRef.current?.openResetModal?.()}
              onCityChange={setSelectedCity}
              onMenuOpenChange={setShowBurgerMenu}
            />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <div className={styles.content + " hide-scrollbar"}>
        <InventoryManagement ref={inventoryRef} city={selectedCity} showBurgerMenu={showBurgerMenu} />
      </div>
      <footer className={styles.footer}>
        © 2025
      </footer>
    </div>
  );
}
