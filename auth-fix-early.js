/**
 * Script di redirect API migliorato per GitHub Pages
 * Questo script deve essere inserito come PRIMO elemento in HEAD
 */

(function() {
  // Configurazioni
  const DEBUG = false;
  let API_URL = null;
  
  // Trova URL API da parametri o localStorage
  function inizializzaApiUrl() {
    // Priorità 1: Query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const apiUrlParam = urlParams.get('apiUrl');
    
    if (apiUrlParam) {
      API_URL = apiUrlParam;
      localStorage.setItem('apiUrl', API_URL);
      if (DEBUG) console.log('API-REDIRECT-EARLY: Inizializzato API URL da parametro:', API_URL);
      return;
    }
    
    // Priorità 2: localStorage
    const storedApiUrl = localStorage.getItem('apiUrl');
    if (storedApiUrl) {
      API_URL = storedApiUrl;
      if (DEBUG) console.log('API-REDIRECT-EARLY: Inizializzato API URL da localStorage:', API_URL);
      return;
    }
    
    // Fallback: usa replit.app predefinito
    API_URL = 'https://sigea-api.nightwork140.repl.co';
    localStorage.setItem('apiUrl', API_URL);
    if (DEBUG) console.log('API-REDIRECT-EARLY: Inizializzato API URL default:', API_URL);
  }
  
  // Inizializza API URL
  inizializzaApiUrl();
  
  // Patch fetch originale
  const originalFetch = window.fetch;
  window.fetch = function(resource, options) {
    // Modifica solo richieste API
    if (typeof resource === 'string' && resource.startsWith('/api/')) {
      const newResource = API_URL + resource;
      if (DEBUG) console.log('API-REDIRECT-EARLY: Reindirizzata richiesta API', resource, 'a', newResource);
      
      // Assicura che le opzioni contengano credentials
      options = options || {};
      options.credentials = 'include';
      
      return originalFetch(newResource, options);
    }
    
    // Per tutte le altre richieste, comportamento originale
    return originalFetch(resource, options);
  };
  
  // Esponi API_URL globalmente per altri script
  window.SIGEA_API_URL = API_URL;
  
  // Stampa informazioni solo se richiesto
  if (DEBUG || new URLSearchParams(window.location.search).has('debugApi')) {
    console.log('API-REDIRECT-EARLY: Inizializzato API URL:', API_URL);
    console.log('API-REDIRECT-EARLY: Patch di fetch completata');
  }
  
  // Aggiungi stile per banner API
  const style = document.createElement('style');
  style.textContent = `
    .api-info-banner {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 9999;
      font-family: monospace;
      max-width: 300px;
      backdrop-filter: blur(5px);
    }
    .api-info-banner a {
      color: #4ca9ff;
      text-decoration: none;
    }
  `;
  document.head.appendChild(style);
  
  // Crea banner informativo API
  window.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.className = 'api-info-banner';
    banner.innerHTML = `API: <a href="${API_URL}" target="_blank">${API_URL.replace('https://', '')}</a>`;
    document.body.appendChild(banner);
  });
})();
