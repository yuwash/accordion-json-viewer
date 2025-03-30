// From https://vite-pwa-org.netlify.app/guide/inject-manifest.html
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

cleanupOutdatedCaches()

precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

// Custom service worker to handle share target
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

async function storeSharedData(data) {
  const key = 'shared-json-' + Date.now(); // Generate a unique key
  localStorage.setItem(key, JSON.stringify(data));
  return key;
}

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share-target')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        let jsonData;

        // Handle file share
        const jsonFile = formData.get('json');
        if (jsonFile && jsonFile.type === 'application/json') {
          jsonData = await jsonFile.text();
        } else {
          // Handle text/url share
          const text = formData.get('text') || '';
          const url = formData.get('url') || '';
          jsonData = text || url;
        }

        try {
          // Validate JSON
          const parsedJson = JSON.parse(jsonData);
          const key = await storeSharedData(parsedJson);
          return Response.redirect(`/accordion-json-viewer/?sharedKey=${key}`, 303);
        } catch (e) {
          const key = await storeSharedData({ error: 'Invalid JSON data received' });
          return Response.redirect(`/accordion-json-viewer/?sharedKey=${key}`, 303);
        }
      } catch (error) {
        const key = await storeSharedData({ error: 'Failed to process shared content' });
        return Response.redirect(`/accordion-json-viewer/?sharedKey=${key}`, 303);
      }
    })());
  }
});