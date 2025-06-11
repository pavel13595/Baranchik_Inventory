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
    <div className="relative" style={{ position: "absolute", top: -16, right: 30 }}>
      <span
        ref={iconRef}
        onClick={handleAdd}
        aria-label="Додати ярлик на головний екран"
        style={{
          fontSize: 34,
          color: "#FFD600",
          display: "block",
          lineHeight: 1,
          background: "#fff",
          borderRadius: "100px",
          boxShadow: "0 2px 8px 0 #eee",
          padding: 8,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#fef7e0")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
      >
        ★
      </span>
      {showHint && (
        <div
          ref={hintRef}
          className="absolute right-0 mt-2 p-3 rounded-xl bg-white/95 shadow-xl border border-default-200 text-xs text-left max-w-[340px] z-50"
          style={{ color: "#222", top: "110%" }}
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
