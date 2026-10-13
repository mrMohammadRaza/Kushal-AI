/**
 * IndexedDB Offline Storage & Background Sync Queue for Kaushal AI.
 * Enables candidates in rural or remote areas with unstable/absent connectivity
 * to complete assessments offline and auto-upload when internet is restored.
 */

const DB_NAME = 'KaushalAI_OfflineDB';
const DB_VERSION = 1;
const STORE_QUEUE = 'assessment_queue';
const STORE_CACHE = 'cached_metadata';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'queueId', autoIncrement: true });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a completed assessment offline into IndexedDB outbox.
 */
export async function saveAssessmentOffline(assessmentData) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);

    const record = {
      ...assessmentData,
      status: 'pending',
      savedOfflineAt: new Date().toISOString(),
      retryCount: 0
    };

    const request = store.add(record);
    request.onsuccess = () => {
      // Trigger background sync if service worker is active
      triggerBackgroundSync();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all pending offline assessment submissions.
 */
export async function getPendingAssessments() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readonly');
    const store = tx.objectStore(STORE_QUEUE);
    const request = store.getAll();

    request.onsuccess = () => {
      const pending = (request.result || []).filter(item => item.status === 'pending');
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Removes or updates record to synced.
 */
export async function markAssessmentSynced(queueId) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_QUEUE], 'readwrite');
    const store = tx.objectStore(STORE_QUEUE);
    const request = store.delete(queueId);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Drains the queue by uploading pending items to the backend API.
 */
export async function syncPendingAssessments(apiEndpoint = '/api/assessments/evaluate') {
  const pendingItems = await getPendingAssessments();
  if (!pendingItems.length) return { syncedCount: 0 };

  let syncedCount = 0;
  for (const item of pendingItems) {
    try {
      const formData = new FormData();
      formData.append('candidateId', item.candidateId || 'cand-101');
      formData.append('tradeId', item.trade?.id || 'electrician-l3');
      formData.append('vivaAnswer', item.voiceText || '');

      // Convert base64 or blob photo
      if (item.photo) {
        if (typeof item.photo === 'string' && item.photo.startsWith('data:')) {
          const res = await fetch(item.photo);
          const blob = await res.blob();
          formData.append('practicalImage', blob, 'offline-evidence.jpg');
        } else if (item.photo instanceof Blob) {
          formData.append('practicalImage', item.photo, 'offline-evidence.jpg');
        }
      }

      if (item.antiFraudAudit) {
        formData.append('antiFraudAudit', JSON.stringify(item.antiFraudAudit));
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await markAssessmentSynced(item.queueId);
        syncedCount++;
      }
    } catch (err) {
      console.warn(`[Offline Sync] Failed to sync item ${item.queueId}:`, err);
    }
  }

  return { syncedCount, remaining: pendingItems.length - syncedCount };
}

/**
 * Triggers Service Worker Background Sync registration if supported.
 */
function triggerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(reg => {
      reg.sync.register('sync-assessment-queue').catch(err => {
        console.log('[BackgroundSync] Registration skipped:', err);
      });
    });
  }
}
