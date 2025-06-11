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
    <div className="relative">
      <button
        ref={buttonRef}
        className="p-2 bg-white shadow border-2 border-yellow-400 rounded-full hover:bg-yellow-100 transition-all"
        style={{ minWidth: 0, minHeight: 0, lineHeight: 1, boxShadow: '0 2px 8px 0 #ffe06680' }}
        onClick={handleAdd}
        aria-label="Додати ярлик на головний екран"
      >
        <span style={{ fontSize: 24, color: '#FFD600', display: 'block', lineHeight: 1 }}>★</span>
      </button>
      {showHint && (
        <div
          ref={hintRef}
          className="absolute right-0 mt-2 p-3 rounded-xl bg-white/95 shadow-xl border border-default-200 text-xs text-left max-w-[260px] z-50"
          style={{ color: "#222", top: '110%' }}
        >
          <div className="mb-1">
            <b>Android:</b> Відкрийте меню браузера (<b>⋮</b> або <b>≡</b>) і виберіть <b>"Додати на головний екран"</b>.<br />
            <b>iPhone/iPad:</b> Відкрийте сайт у <b>Safari</b>, натисніть <b>Поділитися</b> <span style={{fontWeight:600}}>&#8679;</span> і виберіть <b>"На екран — Додому"</b>.
          </div>
        </div>
      )}
    </div>
  );
};
