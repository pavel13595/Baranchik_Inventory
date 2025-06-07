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

  return (
    <div className="relative" ref={menuRef}>
      <Button isIconOnly variant="flat" onPress={() => setOpen(v => !v)} aria-label="Меню">
        <Icon icon="lucide:menu" className="text-2xl" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white dark:bg-zinc-900 border border-default-200 z-50 animate-fade-in flex flex-col p-2 gap-1">
          <Button startContent={<Icon icon="lucide:file-spreadsheet" />} variant="light" onPress={() => { setOpen(false); onDownload(); }} className="justify-start">
            Завантажити
          </Button>
          <Button startContent={<Icon icon="logos:telegram" />} variant="light" onPress={() => { setOpen(false); onSend(); }} className="justify-start">
            Відправити
          </Button>
          <Button startContent={<Icon icon="lucide:plus" />} variant="light" onPress={() => { setOpen(false); onAdd(); }} className="justify-start">
            Додати
          </Button>
          <Button startContent={<Icon icon="lucide:trash" />} variant="light" onPress={() => { setOpen(false); onDelete(); }} className="justify-start">
            Видалити
          </Button>
          <Button startContent={<Icon icon="lucide:refresh-cw" />} variant="light" onPress={() => { setOpen(false); onReset(); }} className="justify-start">
            Скинути
          </Button>
        </div>
      )}
    </div>
  );
};
