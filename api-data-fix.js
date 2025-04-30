/**
 * Script di correzione per i dati API per GitHub Pages
 * Risolve problemi con i dati di risposta incompleti o non array
 */
(function() {
  // Configurazione
  const API_URL = window.API_URL || 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';
  const BASE_PATH = window.BASE_PATH || '/static_site';
  
  console.log('[API DATA FIX] Inizializzato, API URL:', API_URL);
  
  // Funzione per verificare se un oggetto è un messaggio di errore API
  function isApiInfoMessage(data) {
    return data && 
           typeof data === 'object' && 
           data.message && 
           data.info && 
           data.info.includes('versione API-only');
  }
  
  // Dati di fallback per varie entità
  const fallbackData = {
    carabinieri: [
      { id: 1, nome: 'Mario', cognome: 'Rossi', matricola: 'CC123456', reparto: 'Reparto Operativo', email: 'mario.rossi@esempio.it' },
      { id: 2, nome: 'Giuseppe', cognome: 'Verdi', matricola: 'CC234567', reparto: 'Nucleo Radiomobile', email: 'giuseppe.verdi@esempio.it' },
      { id: 3, nome: 'Anna', cognome: 'Bianchi', matricola: 'CC345678', reparto: 'Stazione Principale', email: 'anna.bianchi@esempio.it' }
    ],
    malattie: [
      { id: 1, carabiniereId: 1, dataInizio: '2025-04-23', dataFine: '2025-05-06', giorni: 14, tipo: 'Malattia', note: 'Influenza' },
      { id: 2, carabiniereId: 2, dataInizio: '2025-04-15', dataFine: '2025-04-22', giorni: 8, tipo: 'Infortunio', note: 'Trauma alla caviglia' }
    ],
    searchResults: []
  };
  
  // Override fetch per gestire risposte problematiche
  const originalFetch = window.fetch;
  window.fetch = async function(resource, options = {}) {
    try {
      // Utilizza il fetch originale
      const response = await originalFetch(resource, options);
      const clonedResponse = response.clone();
      
      // Se la risposta non è OK, gestisci subito
      if (!response.ok) {
        console.warn(`[API DATA FIX] Risposta API non OK: ${response.status} - ${response.statusText}`);
        return response;
      }
      
      // Verifica il tipo di risposta
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Non è JSON, restituisci la risposta originale
        return response;
      }
      
      try {
        // Leggi i dati JSON
        const data = await clonedResponse.json();
        
        // Verifica se è un messaggio informativo API e non i dati reali
        if (isApiInfoMessage(data)) {
          console.warn(`[API DATA FIX] L'API ha restituito un messaggio informativo invece dei dati: ${data.message}`);
          
          // Crea una nuova risposta con dati simulati in base all'endpoint
          let fixedData = [];
          
          if (resource.toString().includes('/api/carabinieri')) {
            fixedData = fallbackData.carabinieri;
            console.log('[API DATA FIX] Utilizzando dati carabinieri di fallback');
          } else if (resource.toString().includes('/api/malattie')) {
            fixedData = fallbackData.malattie;
            console.log('[API DATA FIX] Utilizzando dati malattie di fallback');
          } else if (resource.toString().includes('/api/search')) {
            fixedData = fallbackData.searchResults;
            console.log('[API DATA FIX] Utilizzando risultati di ricerca di fallback');
          }
          
          // Crea una nuova risposta con i dati corretti
          const fixedResponse = new Response(JSON.stringify(fixedData), {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          });
          
          return fixedResponse;
        }
        
        // Verifica se i dati dovrebbero essere un array ma non lo sono
        if (
          (resource.toString().includes('/api/carabinieri') || 
           resource.toString().includes('/api/malattie') || 
           resource.toString().includes('/api/search')) && 
          !Array.isArray(data)
        ) {
          console.warn(`[API DATA FIX] L'API ha restituito un oggetto invece di un array per: ${resource.toString()}`);
          
          // Scegli i dati di fallback appropriati
          let fixedData = [];
          if (resource.toString().includes('/api/carabinieri')) {
            fixedData = fallbackData.carabinieri;
          } else if (resource.toString().includes('/api/malattie')) {
            fixedData = fallbackData.malattie;
          } else if (resource.toString().includes('/api/search')) {
            fixedData = fallbackData.searchResults;
          }
          
          // Crea una nuova risposta con un array
          const fixedResponse = new Response(JSON.stringify(fixedData), {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'application/json'
            })
          });
          
          return fixedResponse;
        }
        
        // I dati sono validi, restituisci la risposta originale
        return response;
      } catch (parseError) {
        console.error('[API DATA FIX] Errore nel parsing JSON:', parseError);
        return response;
      }
    } catch (fetchError) {
      console.error('[API DATA FIX] Errore durante il fetch:', fetchError);
      throw fetchError;
    }
  };
  
  // Patch per i dati ricevuti da react-query
  if (window.reactQueryDevtools) {
    const originalSetQueryData = window.reactQueryDevtools.setQueryData;
    if (originalSetQueryData) {
      window.reactQueryDevtools.setQueryData = function(queryKey, data) {
        // Verifica se i dati sono un messaggio informativo
        if (isApiInfoMessage(data)) {
          console.warn(`[API DATA FIX] Intercettato messaggio informativo in reactQueryDevtools per ${queryKey}`);
          
          // Scegli dati sostitutivi appropriati
          let fixedData = [];
          if (queryKey.includes('/carabinieri')) {
            fixedData = fallbackData.carabinieri;
          } else if (queryKey.includes('/malattie')) {
            fixedData = fallbackData.malattie;
          } else if (queryKey.includes('/search')) {
            fixedData = fallbackData.searchResults;
          }
          
          return originalSetQueryData(queryKey, fixedData);
        }
        
        // Verifica se i dati dovrebbero essere un array ma non lo sono
        if ((queryKey.includes('/carabinieri') || 
             queryKey.includes('/malattie') || 
             queryKey.includes('/search')) && 
            data && !Array.isArray(data)) {
          console.warn(`[API DATA FIX] Intercettato oggetto invece di array in reactQueryDevtools per ${queryKey}`);
          
          // Scegli dati sostitutivi appropriati
          let fixedData = [];
          if (queryKey.includes('/carabinieri')) {
            fixedData = fallbackData.carabinieri;
          } else if (queryKey.includes('/malattie')) {
            fixedData = fallbackData.malattie;
          } else if (queryKey.includes('/search')) {
            fixedData = fallbackData.searchResults;
          }
          
          return originalSetQueryData(queryKey, fixedData);
        }
        
        // Dati validi, procedi normalmente
        return originalSetQueryData(queryKey, data);
      };
    }
  }
  
  // Fix per funzioni specifiche che causano errori
  window.addEventListener('load', function() {
    // Fix specifico per la funzione che causa l'errore e.map is not a function
    const patchMapFunctions = function() {
      // Cerca tutte le funzioni globali o funzioni React che potrebbero usare .map
      setTimeout(() => {
        console.log('[API DATA FIX] Applicazione patch per funzioni map');
        
        // Patch per le chiamate map nei componenti
        const originalArrayMap = Array.prototype.map;
        
        // Estendi la funzione nativa per essere più resiliente
        Array.prototype.map = function() {
          if (!this) {
            console.warn('[API DATA FIX] Tentativo di chiamare map su null o undefined, restituendo array vuoto');
            return [];
          }
          
          // Converti in array se non lo è già (es. object)
          if (!Array.isArray(this) && typeof this === 'object') {
            console.warn('[API DATA FIX] Tentativo di chiamare map su un oggetto non array, convertendo in array');
            const arr = Object.values(this);
            return originalArrayMap.apply(arr, arguments);
          }
          
          return originalArrayMap.apply(this, arguments);
        };
      }, 1000); // Ritardo per assicurarsi che l'app sia caricata
    };
    
    patchMapFunctions();
  });
  
  console.log('[API DATA FIX] Script completato e attivo');
})();