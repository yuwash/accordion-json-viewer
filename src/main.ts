import './app.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')!,
})

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { type: 'module' })
  })
}

export default app