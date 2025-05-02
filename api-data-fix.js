/**
 * Script di correzione per i dati API per GitHub Pages
 */

(function() {
  console.log("[API FIX] Inizializzato");
  
  // Dati per cronologia
  const cronologiaData = [
    {
      id: 1,
      carabiniereId: 101,
      carabiniere: { nome: 'Mario', cognome: 'Rossi', matricola: 'CC12345' },
      dataInizio: '2025-02-10',
      dataFine: '2025-02-18',
      tipologia: 'Malattia',
      giorniTotali: 9,
      notificheSoglia: true,
      note: 'Prima notifica inviata il 15/02/2025'
    },
    {
      id: 2,
      carabiniereId: 102,
      carabiniere: { nome: 'Luigi', cognome: 'Bianchi', matricola: 'CC12346' },
      dataInizio: '2025-03-05',
      dataFine: '2025-03-15',
      tipologia: 'Infortunio',
      giorniTotali: 11,
      notificheSoglia: true,
      note: 'Infortunio durante servizio'
    }
  ];
  
  // Dati per statistiche
  const statisticheData = {
    totaleCarabinieri: 120,
    totaleAssenze: 345,
    malattiePerMese: [
      { mese: 'Gennaio', totale: 28 },
      { mese: 'Febbraio', totale: 35 },
      { mese: 'Marzo', totale: 42 },
      { mese: 'Aprile', totale: 38 }
    ],
    tipiAssenza: [
      { tipo: 'Malattia', totale: 245 },
      { tipo: 'Infortunio', totale: 68 },
      { tipo: 'Congedo', totale: 32 }
    ],
    soglieSuperateMese: { totale: 15 }
  };
  
  // Dati per carabinieri
  const carabinieriData = [
    {
      id: 101,
      nome: 'Mario',
      cognome: 'Rossi',
      matricola: 'CC12345',
      email: 'mario.rossi@carabinieri.it',
      grado: 'Maresciallo Capo',
      reparto: 'Comando Provinciale Roma',
      dataUltimaMalattia: '2025-05-01',
      giorniTotaliMalattia: 13,
      sogliaRaggiunta: true
    },
    {
      id: 102,
      nome: 'Luigi',
      cognome: 'Bianchi',
      matricola: 'CC12346',
      email: 'luigi.bianchi@carabinieri.it',
      grado: 'Brigadiere',
      reparto: 'Comando Provinciale Milano',
      dataUltimaMalattia: '2025-03-15',
      giorniTotaliMalattia: 11,
      sogliaRaggiunta: true
    },
    {
      id: 103,
      nome: 'Giuseppe',
      cognome: 'Verdi',
      matricola: 'CC12347',
      email: 'giuseppe.verdi@carabinieri.it',
      grado: 'Appuntato Scelto',
      reparto: 'Comando Provinciale Napoli',
      dataUltimaMalattia: '2025-04-05',
      giorniTotaliMalattia: 5,
      sogliaRaggiunta: false
    }
  ];
  
  // Patch per Array.prototype.map
  const originalArrayMap = Array.prototype.map;
  Array.prototype.map = function(...args) {
    if (this === null || this === undefined) {
      console.warn('[API FIX] Chiamata map() su null/undefined, restituendo array vuoto');
      return [];
    }
    return originalArrayMap.apply(this, args);
  };
  
  // Intercetta le chiamate fetch
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let url = input;
    if (input instanceof Request) url = input.url;
    if (typeof url !== 'string' || !url.includes('api')) {
      return originalFetch(input, init);
    }
    
    try {
      const response = await originalFetch(input, init);
      const clone = response.clone();
      
      try {
        if (response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          
          // Se non ci sono dati validi, fornisci dati di simulazione
          if (!data || (typeof data === 'string' && data.includes('API'))) {
            console.log("[API FIX] Fornisco dati simulati per", url);
            let mockData;
            
            if (url.includes('/api/carabinieri') || url.includes('/api/search')) {
              mockData = carabinieriData;
            } 
            else if (url.includes('/api/malattie') || url.includes('/api/cronologia')) {
              mockData = cronologiaData;
            }
            else if (url.includes('/api/statistiche')) {
              mockData = statisticheData;
            }
            else {
              mockData = { success: true, message: 'Operazione completata con successo' };
            }
            
            return new Response(JSON.stringify(mockData), {
              status: 200,
              headers: new Headers({ 'Content-Type': 'application/json' })
            });
          }
        }
      } catch (e) {
        console.error("[API FIX] Errore durante l'elaborazione:", e);
      }
      
      return clone;
    } catch (error) {
      console.error("[API FIX] Errore fetch:", error);
      throw error;
    }
  };
})();