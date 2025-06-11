import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useBurgerMenuLogic({ onMenuOpenChange, onCityChange }: any) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => localStorage.getItem("selectedCity") || "Кременчук");
  const cities = ["Кременчук", "Харків", "Львів"];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY > 60) setOpen(false);
    };
    const node = menuRef.current;
    if (node) {
      node.addEventListener("touchstart", handleTouchStart);
      node.addEventListener("touchmove", handleTouchMove);
    }
    return () => {
      if (node) {
        node.removeEventListener("touchstart", handleTouchStart);
        node.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [open]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("selectedCity", city);
    if (typeof onCityChange === 'function') onCityChange(city);
    setOpen(false);
  };

  return {
    open, setOpen,
    selectedCity, setSelectedCity,
    cities,
    menuRef,
    handleCityChange
  };
}
