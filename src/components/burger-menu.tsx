import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface BurgerMenuProps {
  onDownload: () => void;
  onSend: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onReset: () => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({
  onDownload,
  onSend,
  onAdd,
  onDelete,
  onReset
}) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

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
          className="absolute right-0 mt-2 min-w-[150px] w-[70vw] max-w-xs rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-default-200 z-50 animate-fade-in flex flex-col p-2 gap-1 transition-all duration-200"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
        >
          <div className="flex justify-end w-full mb-1">
            <Button isIconOnly size="sm" variant="light" onPress={() => setOpen(false)} aria-label="Закрити меню">
              <Icon icon="lucide:x" className="text-xl" />
            </Button>
          </div>
          <Button
            startContent={<Icon icon="lucide:file-spreadsheet" />}
            variant="light"
            onPress={() => { setOpen(false); onDownload(); }}
            className="flex flex-row-reverse justify-end w-full text-base py-2 px-2 rounded-lg hover:bg-primary/10 transition-colors text-right gap-2"
          >
            <span className="w-full text-right">Завантажити</span>
          </Button>
          <Button
            startContent={<Icon icon="logos:telegram" />}
            variant="light"
            onPress={() => { setOpen(false); onSend(); }}
            className="flex flex-row-reverse justify-end w-full text-base py-2 px-2 rounded-lg hover:bg-secondary/10 transition-colors text-right gap-2"
          >
            <span className="w-full text-right">Відправити</span>
          </Button>
          <Button
            startContent={<Icon icon="lucide:plus" />}
            variant="light"
            onPress={() => { setOpen(false); onAdd(); }}
            className="flex flex-row-reverse justify-end w-full text-base py-2 px-2 rounded-lg hover:bg-success/10 transition-colors text-right gap-2"
          >
            <span className="w-full text-right">Додати</span>
          </Button>
          <Button
            startContent={<Icon icon="lucide:trash" />}
            variant="light"
            onPress={() => { setOpen(false); onDelete(); }}
            className="flex flex-row-reverse justify-end w-full text-base py-2 px-2 rounded-lg hover:bg-danger/10 transition-colors text-right gap-2"
          >
            <span className="w-full text-right">Видалити</span>
          </Button>
          <Button
            startContent={<Icon icon="lucide:refresh-cw" />}
            variant="light"
            onPress={() => { setOpen(false); onReset(); }}
            className="flex flex-row-reverse justify-end w-full text-base py-2 px-2 rounded-lg hover:bg-warning/10 transition-colors text-right gap-2"
          >
            <span className="w-full text-right">Скинути</span>
          </Button>
        </div>
      )}
    </div>
  );
};
