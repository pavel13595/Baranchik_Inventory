import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Dashboard } from "./components/dashboard";
import { ThemeProvider } from "./contexts/theme-context";
import { AddToHomeButton } from "./components/add-to-home-button";

const cities = ["Кременчук", "Харків", "Львів"];

function CitySelect() {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<string>("");

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
  };

  const handleGo = () => {
    if (selected) {
      localStorage.setItem("selectedCity", selected);
      navigate(`/city/${selected}`);
    }
  };

  React.useEffect(() => {
    // Якщо місто вже вибрано, одразу редірект
    const saved = localStorage.getItem("selectedCity");
    if (saved && cities.includes(saved)) {
      navigate(`/city/${saved}`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col gap-6 items-center border border-default-200">
        <h1 className="text-2xl font-bold mb-2">Ласкаво просимо!</h1>
        <p className="text-default-600 mb-4">Оберіть місто для інвентаризації:</p>
        <select
          className="w-64 rounded-lg border border-default-200 px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-zinc-900"
          value={selected}
          onChange={handleSelect}
        >
          <option value="" disabled>Оберіть місто...</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <button
          className="mt-4 px-6 py-2 rounded-lg bg-primary text-white font-semibold disabled:bg-default-300"
          onClick={handleGo}
          disabled={!selected}
        >
          Перейти
        </button>
        <AddToHomeButton />
      </div>
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    document.addEventListener('touchmove', function(event) {
    }, { passive: false });
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }, []);
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CitySelect />} />
          <Route path="/city/:cityName" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}