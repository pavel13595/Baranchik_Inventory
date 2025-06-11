import React from "react";

export const AddToHomeButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showHint, setShowHint] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const hintRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  React.useEffect(() => {
    if (!showHint) return;
    const handleClick = (e: MouseEvent) => {
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }
      if (hintRef.current && hintRef.current.contains(e.target as Node)) {
        return;
      }
      setShowHint(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showHint]);

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
    <div className="w-full flex flex-col items-center">
      <button
        ref={buttonRef}
        className="mt-2 px-5 py-2 rounded-lg bg-yellow-400 text-black font-semibold shadow hover:bg-yellow-300 transition-all text-sm flex items-center gap-2"
        style={{ minWidth: 0, minHeight: 0 }}
        onClick={handleAdd}
        aria-label="Додати ярлик на головний екран"
      >
        <span style={{ fontSize: 18 }}>★</span>
        Додати ярлик на головний екран
      </button>
      {showHint && (
        <div
          ref={hintRef}
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
