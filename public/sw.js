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

async function broadcastShareData(data) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => {
    client.postMessage({
      type: 'SHARED_JSON',
      data: data
    });
  });
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
          await broadcastShareData(parsedJson);
        } catch (e) {
          await broadcastShareData({ error: 'Invalid JSON data received' });
        }

        // Redirect to the main page
        return Response.redirect('/accordion-json-viewer/', 303);
      } catch (error) {
        return Response.redirect('/accordion-json-viewer/?error=share-failed', 303);
      }
    })());
  }
});