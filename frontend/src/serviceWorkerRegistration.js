import { syncPendingAssessments } from './utils/offlineStore';

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  // Use Vite standard production check
  const isProd = import.meta.env.PROD;

  if ('serviceWorker' in navigator && isProd) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[ServiceWorker] Registered with scope:', registration.scope);

          // Listen for updates and prompt immediate activation
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[ServiceWorker] New version available; skipping waiting.');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });

          // Listen for background sync trigger messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
              console.log('[ServiceWorker] Received background sync trigger, draining IndexedDB queue...');
              syncPendingAssessments().catch((e) => console.warn('[Sync] Sync failed:', e));
            }
          });
        })
        .catch((error) => {
          console.warn('[ServiceWorker] Registration skipped or failed (non-blocking):', error);
        });
    });
  }

  // Auto-sync when device regains connectivity
  window.addEventListener('online', () => {
    console.log('[Network] Internet connection restored. Syncing offline assessment queue...');
    syncPendingAssessments().catch((e) => console.warn('[Sync] Online sync failed:', e));
  });
}

