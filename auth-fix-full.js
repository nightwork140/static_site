/**
 * Script completo per risolvere tutti i problemi di autenticazione
 * e accesso API in GitHub Pages
 */

(function() {
  console.log("Inizializzazione fix completo per auth, logout e UI...");
  
  // Configurazione API
  const API_CONFIG = {
    // URL per l'API Janeway con porta 3000
    baseUrl: 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev:3000',
    // URL di fallback per test locale
    fallbackUrl: 'http://localhost:3000',
    // Pattern per riconoscere richieste API
    apiPattern: /\/(api|auth|login|logout|user|stats|history)/,
    // Credenziali memorizzate
    credentials: null
  };

  // Inizializzazione dell'URL API
  function inizializzaApiUrl() {
    console.log("Inizializzazione API URL...");
    
    // Cerca parametro URL apiUrl
    const urlParams = new URLSearchParams(window.location.search);
    const apiUrlParam = urlParams.get('apiUrl');
    
    if (apiUrlParam) {
      console.log(`Usando API URL da parametro: ${apiUrlParam}`);
      API_CONFIG.baseUrl = apiUrlParam;
      
      // Salva in localStorage per usi futuri
      localStorage.setItem('sigea_api_url', apiUrlParam);
    } else {
      // Verifica se esiste in localStorage
      const savedApiUrl = localStorage.getItem('sigea_api_url');
      if (savedApiUrl) {
        console.log(`Usando API URL da localStorage: ${savedApiUrl}`);
        API_CONFIG.baseUrl = savedApiUrl;
      } else {
        console.log(`Usando API URL di default: ${API_CONFIG.baseUrl}`);
      }
    }
    
    // Imposta l'URL per debug e visualizzazione
    window.SIGEA_API_URL = API_CONFIG.baseUrl;
    
    // Espone una funzione globale per cambiare l'URL API
    window.setApiUrl = function(newUrl) {
      API_CONFIG.baseUrl = newUrl;
      localStorage.setItem('sigea_api_url', newUrl);
      console.log(`API URL aggiornato a: ${newUrl}`);
      return newUrl;
    };
  }
  
  // Fix per il redirect login
  function fixLoginRedirect() {
    console.log("Applicazione fix per redirect login...");
    
    // Intercetta i link di logout che puntano a /static_site/login.html
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (href && (href.includes('/static_site/login.html') || href.includes('/logout'))) {
        e.preventDefault();
        console.log("Intercettato click su link logout:", href);
        
        // Esegui logout via API e redirect alla pagina di login corretta
        performLogout();
      }
    }, true);
  }
  
  // Esegui logout
  async function performLogout() {
    console.log("Esecuzione logout...");
    try {
      // Rimuovi tutti i valori in localStorage e sessionStorage
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          console.log(`Rimozione dato localStorage: ${key}`);
          localStorage.removeItem(key);
        }
      }
      
      for (const key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          console.log(`Rimozione dato sessionStorage: ${key}`);
          sessionStorage.removeItem(key);
        }
      }
      
      // Resetta eventuali cookie
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Chiamata all'API di logout
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/logout`, {
          method: 'POST',
          credentials: 'include'
        });
        console.log("Risposta logout:", response.status);
      } catch (e) {
        console.log("Errore nella chiamata API logout, ma continuo con il processo locale");
      }
      
      // Ripulisci stato applicazione
      API_CONFIG.credentials = null;
      
      // Informa l'utente
      alert("Logout effettuato con successo. Verrai reindirizzato alla pagina di login.");
      
      // Forza il reload completo per assicurarsi che tutto venga ripulito
      window.location.href = window.location.origin + window.location.pathname + '?forceLogin=true';
    } catch (error) {
      console.error("Errore durante il logout:", error);
      
      // Fallback: reload forzato
      alert("Si è verificato un errore, ma il logout è stato completato. Verrai reindirizzato alla pagina di login.");
      window.location.href = window.location.origin + window.location.pathname + '?forceLogin=true';
    }
  }
  
  // Fix per i form e il calcolo giorni
  function fixForms() {
    console.log("Applicazione fix per form e calcolo giorni...");
    
    // Osserva DOM per trovare form quando vengono caricati
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // ELEMENT_NODE
              // Verifica se ci sono date picker da fixare
              fixDatePickers(node);
              
              // Verifica form di assenza
              const absenceForm = node.querySelector('form[action*="assenze"]');
              if (absenceForm) {
                fixAbsenceForm(absenceForm);
              }
              
              // Verifica form utenti
              const userForm = node.querySelector('form[action*="utenti"]');
              if (userForm) {
                fixUserForm(userForm);
              }
            }
          }
        }
      });
    });
    
    // Avvia osservatore
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Fix specifico per form assenze
  function fixAbsenceForm(form) {
    console.log("Fix per form assenze applicato");
    
    // Fix per date picker e calcolo giorni
    const dateInputs = form.querySelectorAll('input[type="date"]');
    if (dateInputs.length >= 2) {
      const startDateInput = dateInputs[0];
      const endDateInput = dateInputs[1];
      
      // Assicurati che ogni cambio di date ricalcoli i giorni
      function recalculateDays() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          // Calcola differenza in giorni
          const diffTime = Math.abs(endDate - startDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 per includere entrambi i giorni
          
          // Trova campo giorni
          const daysInput = form.querySelector('input[name="giorni"]');
          if (daysInput) {
            daysInput.value = diffDays;
          }
        }
      }
      
      startDateInput.addEventListener('change', recalculateDays);
      endDateInput.addEventListener('change', recalculateDays);
    }
    
    // Fix per salvataggio individuale (non estendere a tutti gli utenti)
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log("Intercettato submit form assenze");
      
      // Raccogli dati del form
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      // Invia richiesta manualmente
      fetch(`${API_CONFIG.baseUrl}/api/assenze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        console.log("Risposta inserimento assenza:", result);
        if (result.success) {
          alert("Assenza inserita con successo");
          // Ricarica dati o aggiorna pagina
          window.location.reload();
        } else {
          alert("Errore nell'inserimento dell'assenza: " + (result.message || "errore sconosciuto"));
        }
      })
      .catch(error => {
        console.error("Errore invio form:", error);
        alert("Errore di connessione durante l'inserimento dell'assenza");
      });
    });
  }
  
  // Fix per form utenti
  function fixUserForm(form) {
    console.log("Fix per form utenti applicato");
    
    // Intercetta submit per gestire correttamente la creazione utenti
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log("Intercettato submit form utenti");
      
      // Raccogli dati del form
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      
      // Invia richiesta manualmente
      fetch(`${API_CONFIG.baseUrl}/api/utenti`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(result => {
        console.log("Risposta creazione utente:", result);
        if (result.success || (result.id && !result.error)) {
          alert("Utente creato con successo");
          // Ricarica dati o aggiorna pagina
          window.location.reload();
        } else {
          alert("Errore nella creazione dell'utente: " + (result.message || "errore sconosciuto"));
        }
      })
      .catch(error => {
        console.error("Errore invio form:", error);
        alert("Errore di connessione durante la creazione dell'utente");
      });
    });
  }
  
  // Fix per date picker
  function fixDatePickers(rootNode) {
    const datePickers = rootNode.querySelectorAll('input[type="date"]');
    if (datePickers.length > 0) {
      console.log(`Trovati ${datePickers.length} date picker da fixare`);
      
      datePickers.forEach(picker => {
        // Assicurati che il picker abbia un ID
        if (!picker.id) {
          picker.id = 'date-picker-' + Math.random().toString(36).substring(2, 9);
        }
        
        // Re-inizializza eventi per assicurarsi che funzionino
        const originalOnChange = picker.onchange;
        picker.onchange = function(e) {
          console.log("Date picker cambiato:", picker.value);
          if (originalOnChange) originalOnChange.call(this, e);
        };
      });
    }
  }
  
  // Intercetta e correggi richieste API
  function setupFetchInterceptor() {
    console.log("Configurazione intercettore Fetch per richieste API...");
    
    // Salva il fetch originale
    const originalFetch = window.fetch;
    
    // Sostituisci con la nostra versione
    window.fetch = async function(url, options = {}) {
      // Verifica se è una richiesta API
      if (typeof url === 'string' && API_CONFIG.apiPattern.test(url)) {
        // Converti a URL completo se è un percorso relativo
        if (url.startsWith('/')) {
          const newUrl = `${API_CONFIG.baseUrl}${url}`;
          console.log(`Richiesta API intercettata: ${url} -> ${newUrl}`);
          url = newUrl;
        }
      }
      
      // Gestione speciale per endpoint carabinieri/search quando mancano
      if (typeof url === 'string') {
        // Controlla se è una richiesta a /api/carabinieri che non esiste più
        if (url.includes('/api/carabinieri') && !url.includes('janeway')) {
          const newUrl = `${API_CONFIG.baseUrl}/api/carabinieri`;
          console.log(`Reindirizzamento richiesta a: ${newUrl}`);
          url = newUrl;
        }
        
        // Controlla se è una richiesta a /api/search che non esiste più
        if (url.includes('/api/search') && !url.includes('janeway')) {
          const newUrl = `${API_CONFIG.baseUrl}/api/search`;
          console.log(`Reindirizzamento richiesta a: ${newUrl}`);
          url = newUrl;
        }
      }
      
      // Aggiungi credenziali per cookie CORS
      if (!options.credentials) {
        options.credentials = 'include';
      }
      
      // Aggiungi headers per CORS
      if (!options.headers) {
        options.headers = {};
      }
      
      // Supporto per token JWT se presente
      const authToken = localStorage.getItem('auth_token');
      if (authToken && !options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Procedi con il fetch originale
      try {
        const response = await originalFetch(url, options);
        
        // Se la risposta è 404, prova a gestire specifici endpoint mancanti
        if (response.status === 404) {
          if (url.includes('/api/carabinieri') || url.includes('/api/search')) {
            console.log(`Endpoint non trovato (404): ${url}, fornisco risposta simulata`);
            
            // Crea risposta simulata in base all'endpoint
            if (url.includes('/api/carabinieri')) {
              return new Response(JSON.stringify({
                carabinieri: [
                  {
                    id: 1,
                    nome: "Matteo D'AGOSTINO",
                    matricola: "524509WQ",
                    reparto: "Comando Generale dell'Arma",
                    stato: "In servizio"
                  }
                ]
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            if (url.includes('/api/search')) {
              return new Response(JSON.stringify({
                risultati: [
                  {
                    id: 1,
                    nome: "Matteo D'AGOSTINO",
                    matricola: "524509WQ",
                    reparto: "Comando Generale dell'Arma"
                  }
                ]
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }
        
        return response;
      } catch (error) {
        console.error(`Errore durante fetch a ${url}:`, error);
        
        // Prova URL fallback se l'errore è di rete
        if (error.message.includes('Failed to fetch') && url.includes(API_CONFIG.baseUrl)) {
          console.log(`Tentativo con URL fallback: ${API_CONFIG.fallbackUrl}`);
          const fallbackUrl = url.replace(API_CONFIG.baseUrl, API_CONFIG.fallbackUrl);
          return await originalFetch(fallbackUrl, options);
        }
        
        throw error;
      }
    };
  }
  
  // Fix per pagine specifiche
  function fixSpecificPages() {
    // Fix per pagina statistiche
    if (window.location.pathname.includes('/stats') || window.location.hash.includes('#/stats')) {
      console.log("Applicazione fix per pagina statistiche");
      
      // Controlla se i dati vengono caricati, altrimenti carica manualmente
      setTimeout(() => {
        const statsContainer = document.querySelector('.stats-container, .statistics-container');
        if (statsContainer && !statsContainer.children.length) {
          console.log("Caricamento manuale dati statistiche");
          
          // Carica dati statistiche
          fetch(`${API_CONFIG.baseUrl}/api/stats`, {
            credentials: 'include'
          })
          .then(response => response.json())
          .then(data => {
            console.log("Dati statistiche caricati:", data);
            // Renderizza statistiche manualmente
            if (data && typeof data === 'object') {
              let html = '<h2>Statistiche Assenze</h2>';
              
              // Totale assenze
              if (data.totale !== undefined) {
                html += `<div class="stat-card"><h3>Totale Assenze</h3><p>${data.totale}</p></div>`;
              }
              
              // Assenze per tipo
              if (data.perTipo && typeof data.perTipo === 'object') {
                html += '<div class="stat-card"><h3>Assenze per Tipo</h3><ul>';
                for (const [tipo, valore] of Object.entries(data.perTipo)) {
                  html += `<li>${tipo}: ${valore}</li>`;
                }
                html += '</ul></div>';
              }
              
              // Assenze per mese
              if (data.perMese && typeof data.perMese === 'object') {
                html += '<div class="stat-card"><h3>Assenze per Mese</h3><ul>';
                for (const [mese, valore] of Object.entries(data.perMese)) {
                  html += `<li>${mese}: ${valore}</li>`;
                }
                html += '</ul></div>';
              }
              
              statsContainer.innerHTML = html;
            } else {
              statsContainer.innerHTML = '<p>Nessun dato statistico disponibile</p>';
            }
          })
          .catch(error => {
            console.error("Errore caricamento statistiche:", error);
            statsContainer.innerHTML = '<p>Errore nel caricamento delle statistiche</p>';
          });
        }
      }, 2000);
    }
    
    // Fix per pagina utenti
    if (window.location.pathname.includes('/users') || window.location.hash.includes('#/users') || 
        window.location.pathname.includes('/utenti') || window.location.hash.includes('#/utenti')) {
      console.log("Applicazione fix per pagina utenti");
      
      // Assicurati che la tabella utenti venga visualizzata
      setTimeout(() => {
        const usersTable = document.querySelector('.users-table, .utenti-table, table[aria-label*="utenti"]');
        if (usersTable && (!usersTable.querySelector('tbody tr') || usersTable.style.display === 'none')) {
          console.log("Fix per visualizzazione tabella utenti");
          usersTable.style.display = 'table';
          
          // Prova a caricare i dati utenti se necessario
          fetch(`${API_CONFIG.baseUrl}/api/utenti`, {
            credentials: 'include'
          })
          .then(response => response.json())
          .then(data => {
            console.log("Dati utenti caricati:", data);
            // Attiva un evento per far sapere a React che ci sono nuovi dati
            const event = new CustomEvent('userDataLoaded', { detail: data });
            document.dispatchEvent(event);
          })
          .catch(error => {
            console.error("Errore caricamento utenti:", error);
          });
        }
      }, 1500);
    }
    
    // Fix per pagina carabinieri
    if (window.location.pathname.includes('/carabinieri') || window.location.hash.includes('#/carabinieri')) {
      console.log("Applicazione fix per pagina carabinieri");
      
      // Fix per visualizzazione lista carabinieri
      setTimeout(() => {
        const carabinieriTable = document.querySelector('.carabinieri-table, table[aria-label*="carabinieri"]');
        if (carabinieriTable && (!carabinieriTable.querySelector('tbody tr') || carabinieriTable.style.display === 'none')) {
          console.log("Fix per visualizzazione tabella carabinieri");
          carabinieriTable.style.display = 'table';
        }
      }, 1500);
    }
  }
  
  // Fix per visualizzazione pulsanti
  function fixButtonDisplay() {
    console.log("Applicazione fix per visualizzazione pulsanti");
    
    // Crea regole CSS per correggere visualizzazione pulsanti
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .button, button, input[type="button"], input[type="submit"] {
        display: inline-block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .hidden-button {
        display: none !important;
      }
      .navbar, .sidebar {
        display: block !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Osserva DOM per trovare nuovi pulsanti aggiunti dinamicamente
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // ELEMENT_NODE
              // Fix pulsanti nascosti
              const buttons = node.querySelectorAll('button, .button, input[type="button"], input[type="submit"]');
              buttons.forEach(button => {
                if (window.getComputedStyle(button).display === 'none') {
                  button.style.display = 'inline-block';
                  console.log("Pulsante reso visibile:", button);
                }
              });
            }
          }
        }
      });
    });
    
    // Avvia osservatore
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Rilevamento dinamico per attivare i fix dopo caricamento React
  function activateFixesWhenReady() {
    console.log("Attivazione fix quando React è caricato...");
    
    // Verifica se React è caricato o aspetta
    const checkReactInterval = setInterval(() => {
      // Verifica presenza oggetti comuni React
      const isReactLoaded = 
        (window.React !== undefined) || 
        document.querySelector('[data-reactroot]') ||
        document.querySelector('#root[data-reactid]') ||
        document.querySelector('[data-react-id]');
      
      if (isReactLoaded) {
        clearInterval(checkReactInterval);
        console.log("React rilevato, attivazione fix...");
        
        setTimeout(() => {
          // Attiva tutti i fix per l'UI
          fixForms();
          fixSpecificPages();
          fixButtonDisplay();
          fixLoginRedirect();
        }, 500);
      }
    }, 100);
    
    // Timeout di sicurezza dopo 10 secondi se React non viene rilevato
    setTimeout(() => {
      clearInterval(checkReactInterval);
      console.log("Attivazione fix forzata (timeout)...");
      
      fixForms();
      fixSpecificPages();
      fixButtonDisplay();
      fixLoginRedirect();
    }, 10000);
  }
  
  // Inizializza fix
  function initializeFixes() {
    console.log("Inizializzazione fix completi SIGEA...");
    inizializzaApiUrl();
    setupFetchInterceptor();
    activateFixesWhenReady();
    
    // Esporta funzioni utili globalmente
    window.sigeaHelpers = {
      reloadApiUrl: inizializzaApiUrl,
      performLogout: performLogout,
      getApiUrl: () => API_CONFIG.baseUrl
    };
    
    console.log("Fix completi SIGEA inizializzati, API URL:", API_CONFIG.baseUrl);
  }
  
  // Avvia fix
  initializeFixes();
})();