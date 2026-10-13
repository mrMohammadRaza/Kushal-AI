import { syncPendingAssessments } from './utils/offlineStore';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registered successfully with scope:', registration.scope);

          // Listen for background sync trigger messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
              console.log('[ServiceWorker] Received background sync trigger, draining IndexedDB queue...');
              syncPendingAssessments();
            }
          });
        })
        .catch((error) => {
          console.log('[ServiceWorker] Registration failed:', error);
        });
    });
  }

  // Auto-sync when device regains connectivity
  window.addEventListener('online', () => {
    console.log('[Network] Internet connection restored. Syncing offline assessment queue...');
    syncPendingAssessments();
  });
}
