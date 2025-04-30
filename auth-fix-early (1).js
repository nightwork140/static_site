/**
 * Script di redirect API migliorato per GitHub Pages
 * Questo script deve essere inserito come PRIMO elemento in HEAD
 */
(function() {
  // Configurazione API
  const API_URL = 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';
  
  console.log('[API REDIRECT EARLY] Inizializzato, API URL:', API_URL);
  
  // Override di importanti oggetti globali PRIMA che qualsiasi libreria venga caricata
  window.__API_URL__ = API_URL;
  window.API_URL = API_URL;
  
  // Env per React
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_API_URL = API_URL;
  window.process.env.REACT_APP_API_URL = API_URL;
  
  // Env per Vite
  window.import = window.import || {};
  window.import.meta = window.import.meta || {};
  window.import.meta.env = window.import.meta.env || {};
  window.import.meta.env.VITE_API_URL = API_URL;
  
  // Monkey patch fetch prima che React lo usi
  const originalFetch = window.fetch;
  window.fetch = function(resource, options = {}) {
    let url = resource;
    let needsCors = false;
    
    // Per stringhe che iniziano con /api
    if (typeof resource === 'string') {
      // Configura base path per GitHub Pages
      const BASE_PATH = '/static_site';
      
      if (resource.startsWith('/api')) {
        // Reindirizza chiamate API all'URL Replit
        url = API_URL + resource;
        needsCors = true;
        console.log('[API REDIRECT] Sostituzione:', resource, '→', url);
      } else if (resource.includes('/api/')) {
        // Cerca anche URL come https://nightwork140.github.io/api/login o /static_site/api/login
        const apiIndex = resource.indexOf('/api/');
        if (apiIndex >= 0) {
          const apiPath = resource.substring(apiIndex);
          url = API_URL + apiPath;
          needsCors = true;
          console.log('[API REDIRECT] Sostituzione URL completo:', resource, '→', url);
        }
      } else if (resource.startsWith('/') && 
                !resource.startsWith(BASE_PATH) && 
                !resource.startsWith('/assets/') && 
                !resource.includes('.')) {
        // Fix per i percorsi relativi in GitHub Pages
        // Aggiungi BASE_PATH per le richieste di navigazione ma non per asset come .js, .css, ecc.
        url = BASE_PATH + resource;
        console.log('[PATH REDIRECT] Aggiunto base path:', resource, '→', url);
      }
    }
    
    // Imposta sempre credentials e mode per le chiamate API reindirizzate
    if (needsCors) {
      options.credentials = 'include';
      options.mode = 'cors';
      
      // Aggiungi header di autorizzazione da localStorage se presente
      if (!options.headers) options.headers = {};
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Aggiungi header X-Session-ID se presente in localStorage
      const sessionID = localStorage.getItem('sessionID');
      if (sessionID) {
        options.headers['X-Session-ID'] = sessionID;
      }
    }
    
    return originalFetch(url, options);
  };
  
  // Override anche XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    let redirectUrl = url;
    
    if (typeof url === 'string') {
      // Configura base path per GitHub Pages
      const BASE_PATH = '/static_site';
      
      if (url.startsWith('/api')) {
        redirectUrl = API_URL + url;
        console.log('[API REDIRECT XHR] Sostituzione:', url, '→', redirectUrl);
      } else if (url.includes('/api/')) {
        const apiIndex = url.indexOf('/api/');
        if (apiIndex >= 0) {
          const apiPath = url.substring(apiIndex);
          redirectUrl = API_URL + apiPath;
          console.log('[API REDIRECT XHR] Sostituzione URL completo:', url, '→', redirectUrl);
        }
      } else if (url.startsWith('/') && 
                !url.startsWith(BASE_PATH) && 
                !url.startsWith('/assets/') && 
                !url.includes('.')) {
        // Fix per i percorsi relativi in GitHub Pages
        redirectUrl = BASE_PATH + url;
        console.log('[PATH REDIRECT XHR] Aggiunto base path:', url, '→', redirectUrl);
      }
    }
    
    return originalOpen.call(this, method, redirectUrl, async, user, password);
  };
  
  // Aggiungiamo un fix per History API (usata da React Router)
  // Necessario per gestire i percorsi quando l'utente naviga
  const BASE_PATH = '/static_site';
  
  // Override del pushState
  const originalPushState = window.history.pushState;
  window.history.pushState = function(state, title, url) {
    // Se la URL inizia con / ma non con BASE_PATH, aggiungiamo BASE_PATH
    if (url && typeof url === 'string' && url.startsWith('/') && 
        !url.startsWith(BASE_PATH) && !url.startsWith('/api') && !url.includes('.')) {
      const newUrl = BASE_PATH + url;
      console.log('[HISTORY REDIRECT] pushState modificato:', url, '→', newUrl);
      return originalPushState.call(this, state, title, newUrl);
    }
    return originalPushState.call(this, state, title, url);
  };
  
  // Override del replaceState
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function(state, title, url) {
    // Se la URL inizia con / ma non con BASE_PATH, aggiungiamo BASE_PATH
    if (url && typeof url === 'string' && url.startsWith('/') && 
        !url.startsWith(BASE_PATH) && !url.startsWith('/api') && !url.includes('.')) {
      const newUrl = BASE_PATH + url;
      console.log('[HISTORY REDIRECT] replaceState modificato:', url, '→', newUrl);
      return originalReplaceState.call(this, state, title, newUrl);
    }
    return originalReplaceState.call(this, state, title, url);
  };
  
  // Setup configurazione globale base path per i router
  window.BASE_PATH = BASE_PATH;
  window.__BASE_PATH__ = BASE_PATH;
  
  // Imposta basename per React Router se usato
  try {
    window.__REACT_ROUTER_BASENAME__ = BASE_PATH;
    window.__BASENAME__ = BASE_PATH;
  } catch (e) {
    console.error('Errore configurazione basename:', e);
  }
  
  console.log('[API REDIRECT EARLY] Script completato e attivo');
  console.log('[PATHS] Base Path configurato:', BASE_PATH);
})();
