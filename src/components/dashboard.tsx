import React, { useState } from "react";
import { Card, CardBody, CardHeader, CardFooter, Button, Divider, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "./theme-toggle";
import { InventoryManagement } from "./inventory-management";

export const Dashboard: React.FC = () => {
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
  const cities = [
    { key: "kremenchuk", label: "Той Самий Баранчик Кременчук" },
    { key: "kharkiv", label: "Той Самий Баранчик Харьков" },
    { key: "lviv", label: "Той Самий Баранчик Львов" }
  ];
  const [selectedCity, setSelectedCity] = useState(cities[0].key);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar isBordered maxWidth="xl" className="">
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <Icon icon="lucide:clipboard-list" className="text-primary text-xl" />
            <select
              className="bg-transparent font-bold text-inherit outline-none border-none cursor-pointer"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              style={{ minWidth: 180 }}
            >
              {cities.map(city => (
                <option key={city.key} value={city.key}>{city.label}</option>
              ))}
            </select>
          </div>
        </NavbarBrand>
        
        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      
      <div className="flex-grow">
        <InventoryManagement selectedCity={selectedCity} />
      </div>
      <footer className="w-full text-center text-xs text-default-400 py-2 border-t border-default-200 bg-background">
        © 2025
      </footer>
    </div>
  );
};