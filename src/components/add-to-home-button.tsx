import React from "react";

export const AddToHomeButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

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
      alert(
        "Щоб додати ярлик, скористайтеся стандартною функцією браузера: 'Додати на головний екран' у меню (⋮ або ≡) на Android, або спочатку відкрийте сайт у браузері Safari на iPhone/iPad, потім через 'Поділитися' → 'На екран — Додому'."
      );
    }
  };

  return (
    <button
      className="mt-4 px-6 py-2 rounded-lg bg-success text-white font-semibold shadow-lg"
      onClick={handleAdd}
      style={{ zIndex: 1000 }}
    >
      Додати ярлик на головний екран
    </button>
  );
};
