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
        <div
          className="absolute right-0 mt-2 min-w-[220px] w-[90vw] max-w-xs rounded-2xl shadow-2xl bg-white dark:bg-zinc-900 border border-default-200 z-50 animate-fade-in flex flex-col p-3 gap-2"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
        >
          <Button
            startContent={<Icon icon="lucide:file-spreadsheet" />}
            variant="light"
            onPress={() => { setOpen(false); onDownload(); }}
            className="justify-start w-full text-base py-2 px-3 rounded-lg hover:bg-primary/10 transition-colors"
          >
            Завантажити
          </Button>
          <Button
            startContent={<Icon icon="logos:telegram" />}
            variant="light"
            onPress={() => { setOpen(false); onSend(); }}
            className="justify-start w-full text-base py-2 px-3 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            Відправити
          </Button>
          <Button
            startContent={<Icon icon="lucide:plus" />}
            variant="light"
            onPress={() => { setOpen(false); onAdd(); }}
            className="justify-start w-full text-base py-2 px-3 rounded-lg hover:bg-success/10 transition-colors"
          >
            Додати
          </Button>
          <Button
            startContent={<Icon icon="lucide:trash" />}
            variant="light"
            onPress={() => { setOpen(false); onDelete(); }}
            className="justify-start w-full text-base py-2 px-3 rounded-lg hover:bg-danger/10 transition-colors"
          >
            Видалити
          </Button>
          <Button
            startContent={<Icon icon="lucide:refresh-cw" />}
            variant="light"
            onPress={() => { setOpen(false); onReset(); }}
            className="justify-start w-full text-base py-2 px-3 rounded-lg hover:bg-warning/10 transition-colors"
          >
            Скинути
          </Button>
        </div>
      )}
    </div>
  );
};
