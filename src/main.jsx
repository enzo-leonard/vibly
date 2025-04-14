import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Fonction pour recharger la page quand une mise à jour est disponible
function handleServiceWorkerUpdate() {
  // Recharge la page automatiquement pour utiliser la nouvelle version
  window.location.reload(true);
}

// Fonction pour vérifier les mises à jour
function checkForUpdates(registration) {
  // Vérification automatique des mises à jour toutes les 15 minutes
  setInterval(() => {
    registration.update();
  }, 15 * 60 * 1000);
}

// Enregistrement du service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration);
        
        // Configuration de la mise à jour
        checkForUpdates(registration);
        
        // Mise à jour disponible
        registration.addEventListener('updatefound', () => {
          console.log('SW update found');
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            // Quand l'installation est terminée et que le worker est en attente
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('SW update ready, reloading...');
              // Envoie un message au service worker
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              handleServiceWorkerUpdate();
            }
          });
        });
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
    
    // En cas de contrôle pris par un nouveau service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New service worker controller, reloading...');
      // Évite les rechargements multiples
      if (!window.isReloading) {
        window.isReloading = true;
        window.location.reload(true);
      }
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
