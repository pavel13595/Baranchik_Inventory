import React, { useState } from "react";
import { Card, CardBody, CardHeader, CardFooter, Button, Divider, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "./theme-toggle";
import { InventoryManagement } from "./inventory-management";
import { BurgerMenu } from "./burger-menu";
import { useParams, useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = React.useState<string>(cityName || "Кременчук");
  const [showBurgerMenu, setShowBurgerMenu] = React.useState(false);

  React.useEffect(() => {
    if (cityName && cityName !== selectedCity) setSelectedCity(cityName);
  }, [cityName]);

  React.useEffect(() => {
    if (selectedCity !== cityName) navigate(`/city/${selectedCity}`, { replace: true });
    localStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  // Keep zoom prevention effect
  React.useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  // --- Город ---
  // const cities = [ ... ];
  // const [selectedCity, setSelectedCity] = React.useState<string>(() => localStorage.getItem("selectedCity") || "Кременчук");
  // Удаляем выбор города, оставляем только один город
  const cityLabel = "Инвентаризация";
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;

  // Для передачи действий бургер-меню используем рефы и прокси-функции
  const inventoryRef = React.useRef<any>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isBordered maxWidth="xl" className="fixed top-0 left-0 w-full z-50 bg-background">
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
      {/* Увеличенный отступ сверху для компенсации фиксированного Navbar и статус-бара */}
      <div className="flex-grow pt-[80px] sm:pt-16">
        <InventoryManagement ref={inventoryRef} city={selectedCity} showBurgerMenu={showBurgerMenu} />
      </div>
      <footer className="w-full text-center text-xs text-default-400 py-2 border-t border-default-200 bg-background">
        © 2025
      </footer>
    </div>
  );
};