import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { Dashboard } from "./components/dashboard";
import { ThemeProvider } from "./contexts/theme-context";

// Remove ProtectedRoute component that uses useAuth
export default function App() {
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate loading to ensure all components are ready
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Keep zoom prevention effect
  React.useEffect(() => {
    document.addEventListener('touchmove', function(event) {
      if (event.scale !== 1) {
        event.preventDefault();
      }
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
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Spinner classNames={{wrapper: "text-default-500"}} size="lg" />
      </div>
    );
  }
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}