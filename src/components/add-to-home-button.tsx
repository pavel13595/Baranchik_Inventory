import React from "react";

export const AddToHomeButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showHint, setShowHint] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

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
    <button
      ref={buttonRef}
      className="p-2 rounded-full bg-white shadow border border-default-200 hover:bg-yellow-100 transition-all"
      style={{ minWidth: 0, minHeight: 0, lineHeight: 1 }}
      onClick={handleAdd}
      aria-label="Додати ярлик на головний екран"
    >
      <span style={{ fontSize: 24, color: '#FFD600', display: 'block', lineHeight: 1 }}>★</span>
    </button>
  );
};
