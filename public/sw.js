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

const MAX_SIZE = 50000; // characters

function validateSize(content) {
    if (content.length > MAX_SIZE) {
      alert(`Content is too large. Maximum size is ${MAX_SIZE} characters.`);
      return false;
    }
    return true;
}

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share-target')) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        let jsonData;

        // Handle file share
        const jsonFile = formData.get('json');
        if (jsonFile instanceof File) {
          jsonData = await jsonFile.text();
        } else {
          return Response.redirect('/accordion-json-viewer/?error=share-failed&reason=no-file', 303);
        }

        try {
          // Validate JSON
          if (!validateSize(textInput)) {
            return Response.redirect('/accordion-json-viewer/?error=share-failed&reason=too-large', 303);
          }
          const parsedJson = JSON.parse(jsonData);
          const key = await storeSharedData(parsedJson);

          // Redirect to the main page
          return Response.redirect(`/accordion-json-viewer/?sharedKey=${key}`, 303);
        } catch (e) {
          return Response.redirect('/accordion-json-viewer/?error=share-failed&reason=invalid-json', 303);
        }
      } catch (error) {
        return Response.redirect('/accordion-json-viewer/?error=share-failed', 303);
      }
    })());
  }
});