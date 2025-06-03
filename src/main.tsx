import {HeroUIProvider} from "@heroui/react";
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx';
import './index.css';

// Add a comment explaining Firebase removal
// Firebase has been removed to eliminate connection errors

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>,
)

// Add service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}