import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function DashboardLogic() {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>(cityName || "Кременчук");
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const inventoryRef = useRef<any>(null);

  useEffect(() => {
    if (cityName && cityName !== selectedCity) setSelectedCity(cityName);
  }, [cityName]);

  useEffect(() => {
    if (selectedCity !== cityName) navigate(`/city/${selectedCity}`, { replace: true });
    localStorage.setItem("selectedCity", selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => document.removeEventListener('touchmove', handleTouchMove);
  }, []);

  return {
    selectedCity,
    setSelectedCity,
    showBurgerMenu,
    setShowBurgerMenu,
    inventoryRef
  };
}
