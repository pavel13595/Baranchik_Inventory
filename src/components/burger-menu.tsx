import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface BurgerMenuProps {
  onDownload: () => void;
  onSend: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onReset: () => void;
  onMenuOpenChange?: (open: boolean) => void;
  onCityChange?: (city: string) => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({
  onDownload,
  onSend,
  onAdd,
  onDelete,
  onReset,
  onMenuOpenChange,
  onCityChange
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState<string>(() => localStorage.getItem("selectedCity") || "Кременчук");
  const cities = ["Кременчук", "Харків", "Львів"];
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  // Закрытие по клику вне меню
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Закрытие по Esc
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  // Закрытие по свайпу вниз (touch)
  React.useEffect(() => {
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

  return (
    <div className="relative" ref={menuRef}>
      <Button isIconOnly variant="flat" onPress={() => setOpen(v => !v)} aria-label="Меню">
        <Icon icon="lucide:menu" className="text-2xl" />
      </Button>
      {open && (
        <div
          className="absolute right-0 mt-2 min-w-[180px] max-w-[90vw] w-max rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-default-200 z-50 animate-fade-in flex flex-col items-center px-0 py-0 gap-0 transition-all duration-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
        >
          <div className="w-full px-4 py-2 border-b border-default-100 flex flex-col items-center">
            <label htmlFor="city-select" className="text-xs text-default-500 mb-1">Місто</label>
            <select
              id="city-select"
              className="w-full rounded-lg border border-default-200 px-2 py-1 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-zinc-900"
              value={selectedCity}
              onChange={e => {
                setSelectedCity(e.target.value);
                localStorage.setItem("selectedCity", e.target.value);
                if (typeof onCityChange === 'function') onCityChange(e.target.value);
                setOpen(false);
              }}
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <Button
            startContent={<Icon icon="lucide:arrow-down-to-line" className="w-6 h-6" />}
            variant="light"
            onPress={() => { setOpen(false); onDownload(); }}
            className="flex flex-row justify-center min-w-[140px] text-base py-2 px-4 rounded-lg hover:bg-primary/10 transition-colors text-center gap-2 border-b border-default-100 last:border-b-0"
          >
            Завантажити
          </Button>
          <Button
            startContent={<Icon icon="logos:telegram" className="w-6 h-6" />}
            variant="light"
            onPress={() => { setOpen(false); onSend(); }}
            className="flex flex-row justify-center min-w-[140px] text-base py-2 px-4 rounded-lg hover:bg-secondary/10 transition-colors text-center gap-2 border-b border-default-100 last:border-b-0"
          >
            Відправити
          </Button>
          <Button
            startContent={<Icon icon="lucide:plus" className="w-6 h-6" />}
            variant="light"
            onPress={() => { setOpen(false); onAdd(); }}
            className="flex flex-row justify-center min-w-[140px] text-base py-2 px-4 rounded-lg hover:bg-success/10 transition-colors text-center gap-2 border-b border-default-100 last:border-b-0"
          >
            Додати
          </Button>
          <Button
            startContent={<Icon icon="lucide:trash" className="w-6 h-6" />}
            variant="light"
            onPress={() => { setOpen(false); onDelete(); }}
            className="flex flex-row justify-center min-w-[140px] text-base py-2 px-4 rounded-lg hover:bg-danger/10 transition-colors text-center gap-2 border-b border-default-100 last:border-b-0"
          >
            Видалити
          </Button>
          <Button
            startContent={<Icon icon="lucide:refresh-cw" className="w-6 h-6" />}
            variant="light"
            onPress={() => { setOpen(false); onReset(); }}
            className="flex flex-row justify-center min-w-[140px] text-base py-2 px-4 rounded-lg hover:bg-warning/10 transition-colors text-center gap-2 last:border-b-0"
          >
            Скинути
          </Button>
          <Button
            startContent={<Icon icon="lucide:eraser" className="w-6 h-6" />}
            variant="light"
            onPress={() => {
              if (window.confirm("Очистити всі дані пам'яті для тесту? Це видалить всі інвентаризации для всіх міст!")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="flex flex-row justify-center min-w-[140px] text-base py-2 px-4 rounded-lg hover:bg-danger/10 transition-colors text-center gap-2 border-t border-default-100 mt-2"
          >
            Очистити пам'ять
          </Button>
        </div>
      )}
    </div>
  );
};
