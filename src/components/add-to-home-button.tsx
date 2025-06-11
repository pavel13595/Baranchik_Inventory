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
    // Показываем инструкцию для ручного добавления ярлыка (iOS/Android)
    return (
      <div className="mt-4 text-center text-sm text-default-500 max-w-xs">
        <div className="mb-2 font-semibold text-default-700">
          Как добавить ярлык на главный экран:
        </div>
        <div className="mb-1">
          • <b>Android:</b> Откройте меню браузера (<b>⋮</b> или <b>≡</b>) и
          выберите <b>"Добавить на главный экран"</b>.
        </div>
        <div>
          • <b>iPhone/iPad:</b> Нажмите <b>Поделиться</b>{" "}
          <span style={{ fontWeight: 600 }}>&#8679;</span> и выберите
          <b>"На экран — Домой"</b>.
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
      Добавить ярлык на главный экран
    </button>
  );
};
