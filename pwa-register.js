/* Rafiq PWA service worker registration. Safe in the hosted web build and ignored in extension/file contexts. */
(() => {
  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const canRegister = location.protocol === 'https:' || (location.protocol === 'http:' && isLocalhost);
  if (!canRegister || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      registration.update().catch(() => {});
    } catch (error) {
      console.warn('Rafiq service worker registration failed:', error);
    }
  });
})();
