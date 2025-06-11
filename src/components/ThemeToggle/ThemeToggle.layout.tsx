import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export function ThemeToggleLayout({ theme, toggleTheme }: { theme: string, toggleTheme: () => void }) {
  return (
    <Button
      isIconOnly
      variant="flat"
      onPress={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Icon icon="lucide:moon" className="text-default-600" />
      ) : (
        <Icon icon="lucide:sun" className="text-default-600" />
      )}
    </Button>
  );
}
