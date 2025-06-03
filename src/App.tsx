import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./components/dashboard";
import { ThemeProvider } from "./contexts/theme-context";

// Remove ProtectedRoute component that uses useAuth
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
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}