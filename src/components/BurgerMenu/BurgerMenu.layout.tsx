import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export function BurgerMenuLayout({
  open, setOpen, selectedCity, cities, menuRef, handleCityChange,
  onDownload, onSend, onAdd, onDelete, onReset
}: any) {
  return (
    <div className="relative" ref={menuRef}>
      <Button isIconOnly variant="flat" onPress={() => setOpen((v: boolean) => !v)} aria-label="Меню">
        <Icon icon="lucide:menu" className="text-2xl" />
      </Button>
      {open && (
        <div
          className="absolute right-0 mt-2 min-w-[180px] max-w-[90vw] w-max rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-default-200 z-50 animate-fade-in flex flex-col items-start px-0 py-0 gap-0 transition-all duration-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
        >
          <div className="w-full px-4 py-2 border-b border-default-100 flex flex-col items-start">
            <label htmlFor="city-select" className="text-xs text-default-500 mb-1">Місто</label>
            <select
              id="city-select"
              className="w-full rounded-md border border-default-200 px-2 py-1 text-sm"
              value={selectedCity}
              onChange={e => handleCityChange(e.target.value)}
            >
              {cities.map((city: string) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <button className="w-full px-4 py-2 text-left hover:bg-default-100" onClick={onDownload}>
            <Icon icon="lucide:file-spreadsheet" className="mr-2" /> Завантажити
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-default-100" onClick={onSend}>
            <Icon icon="logos:telegram" className="mr-2" /> Відправити
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-default-100" onClick={onAdd}>
            <Icon icon="lucide:plus" className="mr-2" /> Додати
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-default-100" onClick={onDelete}>
            <Icon icon="lucide:trash" className="mr-2" /> Видалити
          </button>
          <button className="w-full px-4 py-2 text-left hover:bg-default-100" onClick={onReset}>
            <Icon icon="lucide:rotate-ccw" className="mr-2" /> Скинути
          </button>
        </div>
      )}
    </div>
  );
}
