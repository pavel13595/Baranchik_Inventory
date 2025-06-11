import React from "react";

export const AddToHomeButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showHint, setShowHint] = React.useState(false);
  const iconRef = React.useRef<HTMLSpanElement>(null);
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
      if (iconRef.current && iconRef.current.contains(e.target as Node)) {
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
    <div className="relative" style={{ position: "absolute", top: -12, right: 12 }}>
      <span
        ref={iconRef}
        onClick={handleAdd}
        aria-label="Підказка про додавання ярлика"
        style={{
          fontSize: 34,
          color: "rgba(120,120,120,0.5)",
          display: "block",
          lineHeight: 1,
          cursor: "pointer",
          userSelect: "none",
          fontWeight: 700,
        }}
      >
        ?
      </span>
      {showHint && (
        <div
          ref={hintRef}
          className="absolute right-0 mt-2 p-3 rounded-xl bg-white/95 shadow-xl border border-default-200 text-xs text-left z-50"
          style={{ color: "#222", top: "110%", minWidth: 340, width: 420 }}
        >
          <div className="mb-1">
            <b>Android:</b> Відкрийте меню браузера (<b>⋮</b> або <b>≡</b>) і виберіть <b>"Додати на головний екран"</b>.
            <br />
            <b>iPhone/iPad:</b> Відкрийте сайт у <b>Safari</b>, натисніть <b>Поділитися</b>{" "}
            <span style={{ fontWeight: 600 }}>&#8679;</span> і виберіть <b>"На екран — Додому"</b>.
          </div>
        </div>
      )}
    </div>
  );
};
