import React from "react";

export const AddToHomeButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAdd = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!visible) {
    // Показуємо інструкцію для ручного додавання ярлика (iOS/Android)
    return (
      <div className="mt-4 text-center text-sm text-default-500 max-w-xs">
        <div className="mb-2 font-semibold text-default-700">
          Як додати ярлик на головний екран:
        </div>
        <div className="mb-1">
          • <b>Android:</b> Відкрийте меню браузера (<b>⋮</b> або <b>≡</b>) і
          виберіть <b>"Додати на головний екран"</b>.
        </div>
        <div>
          • <b>iPhone/iPad:</b> Натисніть <b>Поділитися</b>{" "}
          <span style={{ fontWeight: 600 }}>&#8679;</span> і виберіть
          <b>"На екран — Додому"</b>.
        </div>
      </div>
    );
  }

  return (
    <button
      className="mt-4 px-6 py-2 rounded-lg bg-success text-white font-semibold shadow-lg"
      onClick={handleAdd}
      style={{ zIndex: 1000 }}
    >
      Добавити ярлик на головний екран
    </button>
  );
};
