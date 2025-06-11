import { useState, useRef, useEffect } from "react";

export function useAddToHomeButtonLogic() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const iconRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const handleClick = (e: MouseEvent) => {
      if (iconRef.current && iconRef.current.contains(e.target as Node)) return;
      if (hintRef.current && hintRef.current.contains(e.target as Node)) return;
      setShowHint(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showHint]);

  const handleAdd = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setShowHint((h: boolean) => !h);
    }
  };

  return {
    deferredPrompt,
    showHint,
    iconRef,
    hintRef,
    handleAdd,
    setShowHint
  };
}
