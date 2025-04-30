/**
 * Script avanzato di correzione UI per GitHub Pages
 * Questo script risolve problemi specifici con componenti React e navigazione
 */
(function() {
  // Configurazione
  const API_URL = window.API_URL || 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';
  const BASE_PATH = window.BASE_PATH || '/static_site';
  
  console.log('[ADVANCED UI FIX] Inizializzato, API URL:', API_URL);
  
  // Variabili per tracciare lo stato dell'applicazione
  let isLoggedIn = false;
  let loginBypassActive = false;
  let currentUser = null;
  let isSpaNavigation = false;
  
  // Funzione per disabilitare il login automatico e forzare la visualizzazione della pagina di login
  function disableAutoLogin() {
    loginBypassActive = true;
    console.log('[ADVANCED UI FIX] Login automatico disabilitato');
    
    // Forza la reinizializzazione della pagina di login
    if (window.location.pathname.includes('/auth') || window.location.pathname === BASE_PATH + '/' || window.location.pathname === '/') {
      console.log('[ADVANCED UI FIX] Forzo la visualizzazione della pagina di login');
      
      // Svuota le credenziali memorizzate
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionId');
      localStorage.removeItem('sessionID');
      
      // Sovrascrivi le funzioni di verifica login esistenti
      if (window.checkLoginStatus) {
        const originalCheck = window.checkLoginStatus;
        window.checkLoginStatus = function() {
          console.log('[ADVANCED UI FIX] Bypass login check');
          window.isAuthenticated = false;
          window.__IS_AUTHENTICATED__ = false;
          window.__USER_DATA__ = null;
          window.USER_DATA = null;
          return false;
        };
      }
    }
  }
  
  // Funzione per riattivare l'auto-login
  function enableAutoLogin() {
    loginBypassActive = false;
    console.log('[ADVANCED UI FIX] Login automatico riattivato');
    
    // Ripristina la funzione originale se esiste
    if (window._originalCheckLoginStatus) {
      window.checkLoginStatus = window._originalCheckLoginStatus;
    }
  }
  
  // Fix per la navigazione React Router
  function fixReactRouterNavigation() {
    // Aggiungiamo un listener per i click su link
    document.addEventListener('click', function(e) {
      // Cerca il link più vicino
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentNode;
        if (!target || target === document) break;
      }
      
      // Se è un link interno senza target specifico
      if (target && target.tagName === 'A' && target.getAttribute('href') &&
          !target.getAttribute('target') && !target.getAttribute('rel')?.includes('external')) {
        
        const href = target.getAttribute('href');
        
        // Se è un link interno che non punta a un'API
        if (!href.startsWith('http') && !href.startsWith('#') && !href.includes('/api/')) {
          // Marca la navigazione SPA
          isSpaNavigation = true;
          console.log('[ADVANCED UI FIX] Navigazione SPA rilevata:', href);
          
          // Intervallo per applicare correzioni post-navigazione
          setTimeout(() => {
            // Trigger per rieseguire i fix dopo la navigazione
            patchReactComponents();
            fixPageSpecificElements();
            
            // Resetta il flag dopo 500ms
            setTimeout(() => {
              isSpaNavigation = false;
            }, 500);
          }, 300);
        }
      }
    });
  }
  
  // Patch per i componenti React dopo che sono stati montati
  function patchReactComponents() {
    console.log('[ADVANCED UI FIX] Patching componenti React dopo navigazione');
    
    // Patch per i pulsanti di esportazione PDF
    const pdfButtons = document.querySelectorAll('button:has(svg[data-lucide="file-down"])');
    pdfButtons.forEach(button => {
      if (!button.dataset.patchedExport) {
        button.dataset.patchedExport = 'true';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        
        const icon = button.querySelector('svg');
        if (icon) {
          icon.style.display = 'inline-block';
          icon.style.marginRight = '8px';
        }
        
        // Aggiungi event listener alternativo
        button.addEventListener('click', function(e) {
          console.log('[ADVANCED UI FIX] Click su pulsante export PDF');
          
          // Ottieni i dati dalla tabella più vicina
          const table = findClosestElement(button, 'table');
          if (table) {
            exportTableToPdf(table, 'Report Esportato');
            e.preventDefault();
            e.stopPropagation();
          }
        });
      }
    });
    
    // Patch per i pulsanti di ricerca
    const searchButtons = document.querySelectorAll('button:has(svg[data-lucide="search"])');
    searchButtons.forEach(button => {
      if (!button.dataset.patchedSearch) {
        button.dataset.patchedSearch = 'true';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        
        const icon = button.querySelector('svg');
        if (icon) {
          icon.style.display = 'inline-block';
          icon.style.marginRight = '8px';
        }
      }
    });
    
    // Patch per i form di modifica
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (!form.dataset.patchedForm) {
        form.dataset.patchedForm = 'true';
        
        // Trova ogni datepicker nel form
        const dateFields = form.querySelectorAll('input[type="date"], [role="combobox"][aria-expanded], [role="textbox"][placeholder*="data" i], [role="textbox"][placeholder*="date" i]');
        
        dateFields.forEach(field => {
          if (!field.dataset.patchedDate) {
            field.dataset.patchedDate = 'true';
            
            // Se il campo è disabilitato, lo rendiamo funzionante
            if (field.hasAttribute('disabled') || field.getAttribute('aria-disabled') === 'true') {
              field.removeAttribute('disabled');
              field.setAttribute('aria-disabled', 'false');
              console.log('[ADVANCED UI FIX] DatePicker abilitato:', field);
            }
            
            // Se è un campo standard, aggiungi il supporto nativo
            if (field.tagName === 'INPUT' && !field.getAttribute('type')) {
              field.setAttribute('type', 'date');
              console.log('[ADVANCED UI FIX] Campo data convertito a nativo:', field);
            }
          }
        });
      }
    });
    
    // Patch per componenti Select e Dropdown
    const selects = document.querySelectorAll('[role="combobox"], [role="listbox"]');
    selects.forEach(select => {
      if (!select.dataset.patchedSelect) {
        select.dataset.patchedSelect = 'true';
        
        // Assicuriamo che i dropdown siano cliccabili
        select.style.pointerEvents = 'auto';
        select.style.cursor = 'pointer';
        
        // Rimuovi attributi disabled che potrebbero impedire il funzionamento
        if (select.hasAttribute('disabled') || select.getAttribute('aria-disabled') === 'true') {
          select.removeAttribute('disabled');
          select.setAttribute('aria-disabled', 'false');
        }
      }
    });
  }
  
  // Helper per trovare l'elemento più vicino di un certo tipo
  function findClosestElement(element, selector) {
    while (element) {
      if (element.matches && element.matches(selector)) {
        return element;
      }
      element = element.parentNode;
      if (!element || element === document) break;
    }
    return null;
  }
  
  // Funzione per esportare una tabella HTML in PDF
  function exportTableToPdf(table, title) {
    if (!window.jsPDF) {
      console.error('[ADVANCED UI FIX] jsPDF non disponibile per l\'esportazione');
      alert('Errore: Libreria jsPDF non disponibile. Impossibile esportare in PDF.');
      return false;
    }
    
    try {
      // Crea un nuovo documento PDF
      const doc = new window.jsPDF();
      
      // Aggiungi titolo
      doc.setFontSize(16);
      doc.text(title || 'Report Esportato', 14, 20);
      
      // Aggiungi data di generazione
      doc.setFontSize(10);
      const today = new Date();
      doc.text(`Generato il ${today.toLocaleDateString('it-IT')}`, 14, 30);
      
      // Estrai dati dalla tabella HTML
      const headCells = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      
      // Se non ci sono header, usa un array di colonne generiche
      const headers = headCells.length > 0 ? headCells : 
                      ['Nome', 'Cognome', 'Matricola', 'Data Inizio', 'Data Fine', 'Giorni'];
      
      // Estrai dati dalle righe
      const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
        return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
      });
      
      // Se non ci sono dati, mostra un messaggio di errore
      if (rows.length === 0) {
        console.error('[ADVANCED UI FIX] Nessun dato trovato nella tabella per l\'esportazione');
        alert('Nessun dato trovato nella tabella per l\'esportazione');
        return false;
      }
      
      // Genera la tabella nel PDF
      doc.autoTable({
        startY: 40,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      
      // Salva il PDF
      doc.save(`report_${today.toISOString().split('T')[0]}.pdf`);
      
      console.log('[ADVANCED UI FIX] PDF esportato con successo');
      return true;
    } catch (error) {
      console.error('[ADVANCED UI FIX] Errore durante l\'esportazione PDF:', error);
      alert('Errore durante l\'esportazione PDF: ' + error.message);
      return false;
    }
  }
  
  // Fix specifici per determinate pagine
  function fixPageSpecificElements() {
    // Fix per la pagina di inserimento assenze
    if (document.querySelector('[aria-label="INSERISCI ASSENZE"]')) {
      console.log('[ADVANCED UI FIX] Rilevata pagina inserimento assenze, applicazione fix');
      
      // Trova il form di inserimento
      const form = document.querySelector('[aria-label="INSERISCI ASSENZE"]');
      if (form) {
        // Cambia lo sfondo per renderlo visibile
        form.style.backgroundColor = 'white';
        form.style.color = '#333';
        form.style.padding = '20px';
        form.style.borderRadius = '8px';
        form.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        
        // Fix per i radio button
        const radioGroups = form.querySelectorAll('[role="radiogroup"]');
        radioGroups.forEach(group => {
          const radios = group.querySelectorAll('[role="radio"]');
          radios.forEach(radio => {
            radio.style.display = 'inline-block';
            radio.style.marginRight = '15px';
          });
        });
        
        console.log('[ADVANCED UI FIX] Form inserimento assenze corretto');
      }
    }
    
    // Fix per la pagina di ricerca
    if (document.querySelector('form[role="search"]')) {
      console.log('[ADVANCED UI FIX] Rilevata pagina di ricerca, applicazione fix');
      
      // Trova il form di ricerca
      const searchForm = document.querySelector('form[role="search"]');
      if (searchForm) {
        // Fix per i pulsanti di ricerca
        const searchButton = searchForm.querySelector('button[type="submit"]');
        if (searchButton) {
          searchButton.style.display = 'flex';
          searchButton.style.alignItems = 'center';
          
          const icon = searchButton.querySelector('svg');
          if (icon) {
            icon.style.display = 'inline-block';
            icon.style.marginRight = '8px';
          }
        }
        
        console.log('[ADVANCED UI FIX] Form di ricerca corretto');
      }
    }
  }
  
  // Impedisce il bypass della pagina di login se necessario
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('forceLogin') === 'true') {
    disableAutoLogin();
  }
  
  // Funzioni esposte globalmente per controllo utente
  window.enforceLogin = disableAutoLogin;
  window.allowAutoLogin = enableAutoLogin;
  
  // Applicazione dei fix
  fixReactRouterNavigation();
  
  // Observer per rilevare cambiamenti nel DOM dopo navigazione SPA
  const setupObserver = function() {
    if (document.body) {
      const observer = new MutationObserver((mutations) => {
        // Applica i fix solo se siamo in navigazione SPA o ci sono nuovi elementi
        if (isSpaNavigation || mutations.some(m => m.addedNodes.length > 0)) {
          patchReactComponents();
          fixPageSpecificElements();
        }
      });
      
      // Configurazione observer per osservare l'intera pagina
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('[ADVANCED UI FIX] Observer configurato con successo');
    } else {
      console.log('[ADVANCED UI FIX] document.body non ancora disponibile, riprovo tra 100ms');
      setTimeout(setupObserver, 100);
    }
  };
  
  // Avvia il processo di configurazione dell'observer
  setupObserver();
  
  // Esegui i fix al caricamento della pagina
  window.addEventListener('load', function() {
    console.log('[ADVANCED UI FIX] Pagina caricata, applicazione fix UI avanzati');
    patchReactComponents();
    fixPageSpecificElements();
  });
  
  console.log('[ADVANCED UI FIX] Script completato e attivo');
})();