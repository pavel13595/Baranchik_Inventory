import React from "react";

export const AddToHomeButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAdd = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setShowHint((h) => !h);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-success text-white text-xs font-semibold shadow-lg hover:bg-success/80 transition-all"
        style={{ minWidth: 0, minHeight: 0 }}
        onClick={handleAdd}
        aria-label="Додати ярлик на головний екран"
      >
        <span style={{ fontSize: 16 }}>★</span>
      </button>
      {showHint && (
        <div
          className="mt-2 p-3 rounded-xl bg-white/95 shadow-xl border border-default-200 text-xs text-left max-w-[260px]"
          style={{ color: "#222" }}
        >
          <div className="font-semibold mb-1 text-default-700">
            Як додати ярлик на головний екран:
          </div>
          <div className="mb-1">
            <b>Android:</b>
            <br />
            Відкрийте меню браузера (<b>⋮</b> або <b>≡</b>)
            <br />
            та виберіть <b>"Додати на головний екран"</b>.
          </div>
          <div>
            <b>iPhone/iPad:</b>
            <br />
            Спочатку відкрийте сайт у браузері <b>Safari</b>.
            <br />
            Далі натисніть <b>Поділитися</b>{" "}
            <span style={{ fontWeight: 600 }}>&#8679;</span>
            <br />
            і виберіть <b>"На екран — Додому"</b>.
          </div>
        </div>
      )}
    </div>
  );
};
