/* Rafiq PWA service worker registration — v24 R17. */
(() => {
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const canRegister = location.protocol === 'https:' || (location.protocol === 'http:' && isLocalhost);
  if (!canRegister || !('serviceWorker' in navigator)) return;

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });
      if (registration.waiting && navigator.serviceWorker.controller) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) worker.postMessage({ type: 'SKIP_WAITING' });
        });
      });
      registration.update().catch(() => {});
    } catch (error) {
      console.warn('Rafiq service worker registration failed:', error);
    }
  });
})();
