/**
 * Script di correzione per il caricamento delle risorse in GitHub Pages
 * Questo script risolve problemi con percorsi di asset, immagini e risorse CSS
 */
(function() {
  // Configurazione
  const API_URL = window.API_URL || 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';
  const BASE_PATH = window.BASE_PATH || '/static_site';
  
  console.log('[ASSET FIX] Inizializzato, BASE_PATH:', BASE_PATH);
  
  // Fix per i percorsi delle risorse CSS e JS
  function fixAssetPaths() {
    // Raccogli tutti i link CSS e gli script JS
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    // Fix per i percorsi CSS
    cssLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Correggi solo percorsi relativi che non iniziano con http o //
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith(BASE_PATH)) {
        // Se inizia con /, aggiungi il BASE_PATH
        if (href.startsWith('/') && !href.startsWith(BASE_PATH)) {
          link.setAttribute('href', BASE_PATH + href);
          console.log('[ASSET FIX] Percorso CSS corretto:', href, '→', BASE_PATH + href);
        }
      }
    });
    
    // Fix per i percorsi JS
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      
      // Correggi solo percorsi relativi che non iniziano con http o //
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith(BASE_PATH)) {
        // Se inizia con /, aggiungi il BASE_PATH
        if (src.startsWith('/') && !src.startsWith(BASE_PATH)) {
          script.setAttribute('src', BASE_PATH + src);
          console.log('[ASSET FIX] Percorso JS corretto:', src, '→', BASE_PATH + src);
        }
      }
    });
    
    console.log('[ASSET FIX] Percorsi CSS e JS corretti');
  }
  
  // Fix per le immagini
  function fixImagePaths() {
    // Controlla periodicamente per nuove immagini
    setInterval(() => {
      const images = document.querySelectorAll('img[src]');
      
      images.forEach(img => {
        const src = img.getAttribute('src');
        
        // Correggi solo percorsi relativi che non iniziano con http, data: o //
        if (src && !src.startsWith('http') && !src.startsWith('data:') && !src.startsWith('//') && !src.startsWith(BASE_PATH)) {
          // Se inizia con /, aggiungi il BASE_PATH
          if (src.startsWith('/') && !src.startsWith(BASE_PATH)) {
            img.setAttribute('src', BASE_PATH + src);
            console.log('[ASSET FIX] Percorso immagine corretto:', src, '→', BASE_PATH + src);
          }
        }
      });
    }, 1000);
  }
  
  // Fix per gli asset dinamici caricati in background
  function setupFetchInterceptor() {
    // Tieni traccia degli URL già intercettati
    const interceptedUrls = new Set();
    
    // Intercetta tutte le richieste fetch
    const originalFetch = window.fetch;
    window.fetch = function(resource, options = {}) {
      let url = resource;
      
      // Gestisci solo stringhe URL
      if (typeof resource === 'string') {
        // Se si tratta di un percorso di asset...
        if (!resource.startsWith('http') && !resource.startsWith('//') && 
            !resource.startsWith('/api') && !resource.includes('/api/') && 
            resource.startsWith('/') && !resource.startsWith(BASE_PATH)) {
          
          // ... e contiene un'estensione file comune per asset
          if (/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(resource)) {
            url = BASE_PATH + resource;
            
            // Log solo la prima volta che intercettiamo un URL
            if (!interceptedUrls.has(resource)) {
              interceptedUrls.add(resource);
              console.log('[ASSET FIX] Percorso asset fetch corretto:', resource, '→', url);
            }
          }
        }
      }
      
      return originalFetch(url, options);
    };
  }
  
  // Fix per percorsi di assets dinamici in stile @import url(...)
  function fixCssImports() {
    // Controlla tutti i fogli di stile
    const styleSheets = Array.from(document.styleSheets || []);
    
    try {
      styleSheets.forEach(sheet => {
        // Salta i fogli di stile da domini cross-origin che generano errori CORS
        try {
          // Questo genererà un errore se il CSS è servito da un dominio diverso
          const rules = sheet.cssRules || sheet.rules;
          
          // Se arriviamo qui, possiamo accedere alle regole
          for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            
            // Controlla se è una regola @import
            if (rule.type === CSSRule.IMPORT_RULE) {
              const importUrl = rule.href;
              
              // Correggi solo percorsi relativi
              if (importUrl && !importUrl.startsWith('http') && !importUrl.startsWith('//') &&
                  importUrl.startsWith('/') && !importUrl.startsWith(BASE_PATH)) {
                
                // Non possiamo modificare la regola direttamente, dovremmo ricreare il foglio di stile
                console.log('[ASSET FIX] Rilevato @import con percorso da correggere:', importUrl);
              }
            }
          }
        } catch (e) {
          // Ignora errori CORS
        }
      });
    } catch (e) {
      console.error('[ASSET FIX] Errore durante la correzione degli import CSS:', e);
    }
  }
  
  // Fix per i webfont e risorse come FontAwesome
  function fixFontResources() {
    // Controlla se ci sono script di FontAwesome
    const faLinks = document.querySelectorAll('link[href*="font-awesome"], link[href*="fontawesome"]');
    
    if (faLinks.length === 0) {
      console.log('[ASSET FIX] FontAwesome non rilevato, caricamento se necessario');
      
      // Carica Font Awesome se non presente
      const checkFaIcons = () => {
        if (document.querySelector('.fa, .fas, .far, .fab, .fal, .fad')) {
          // Ci sono elementi che usano FA ma non è caricato
          if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
            document.head.appendChild(link);
            console.log('[ASSET FIX] FontAwesome caricato automaticamente');
          }
          return true;
        }
        return false;
      };
      
      // Controlla periodicamente
      if (!checkFaIcons()) {
        const faInterval = setInterval(() => {
          if (checkFaIcons()) {
            clearInterval(faInterval);
          }
        }, 1000);
      }
    }
  }
  
  // Applica i fix immediatamente per i tag nel DOM iniziale
  fixAssetPaths();
  setupFetchInterceptor();
  
  // Attendi che la pagina sia completamente caricata per il resto
  window.addEventListener('load', function() {
    console.log('[ASSET FIX] Pagina caricata, applicazione di tutti i fix per asset');
    fixImagePaths();
    fixCssImports();
    fixFontResources();
  });
  
  console.log('[ASSET FIX] Script completato e attivo');
})();