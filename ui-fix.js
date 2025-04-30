/**
 * Script di correzione per componenti UI in GitHub Pages
 * Questo script risolve problemi con DatePicker, form e altri componenti UI
 */
(function() {
  // Configurazione
  const API_URL = window.API_URL || 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';
  const BASE_PATH = window.BASE_PATH || '/static_site';
  
  console.log('[UI FIX] Inizializzato, BASE_PATH:', BASE_PATH);
  
  // Fix per DatePicker e altri componenti che utilizzano librerie esterne
  function patchReactDatePicker() {
    // Patch per react-day-picker
    const originalCreateElement = React.createElement;
    
    if (originalCreateElement) {
      try {
        React.createElement = function(type, props, ...children) {
          // Fix per componenti date picker
          if (props && typeof type === 'function' && type.name && 
              (type.name.includes('DatePicker') || type.name.includes('Calendar'))) {
            
            // Assicurati che il componente abbia sempre un valore di default
            if (props.date === undefined || props.date === null) {
              props = { ...props, date: null };
            }
            
            // Log per debugging
            console.log('[UI FIX] Patching DatePicker component:', type.name);
          }
          
          return originalCreateElement.apply(this, [type, props, ...children]);
        };
        console.log('[UI FIX] React.createElement patched for DatePicker');
      } catch (e) {
        console.error('[UI FIX] Error patching React.createElement:', e);
      }
    }
  }
  
  // Attendi che React sia caricato
  function waitForReact(callback) {
    if (window.React) {
      callback();
    } else {
      setTimeout(() => waitForReact(callback), 100);
    }
  }
  
  // Fix per i form di inserimento assenze che appaiono neri
  function fixFormStyles() {
    // Crea uno stile per correggere i problemi con i form
    const style = document.createElement('style');
    style.textContent = `
      /* Fix per form dialogs */
      .dialog-content {
        background-color: white !important;
        color: #333 !important;
      }
      
      /* Fix per DatePicker */
      .rdp {
        background-color: white !important;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 5px;
      }
      
      /* Fix per il selettore di date */
      input[type="date"] {
        height: 38px;
        padding: 0 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      /* Fix per form di ricerca */
      form[role="search"] .flex {
        display: flex !important;
      }
      
      /* Fix per modali/dialogs */
      [role="dialog"] {
        background-color: white !important;
        color: #333 !important;
      }
      
      /* Fix per bottoni nelle tabelle */
      table button svg {
        display: inline-block !important;
      }
      
      /* Fix per icone in generale */
      svg {
        display: inline-block !important;
      }
      
      /* Fix per tabelle */
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      thead th {
        background-color: #f5f5f5;
      }
      
      /* Fix per l'esportazione PDF */
      button:has(svg[data-lucide="file-down"]) {
        display: flex !important;
        align-items: center !important;
      }
      
      /* Fix specifici per il form di inserimento assenze */
      [aria-label="INSERISCI ASSENZE"] {
        background-color: white !important;
        color: #333 !important;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      
      /* Fix per radio button */
      [type="radio"] {
        width: 16px;
        height: 16px;
        display: inline-block;
        margin-right: 5px;
      }
      
      [type="radio"] + label {
        display: inline-block;
        margin-right: 15px;
      }
    `;
    
    document.head.appendChild(style);
    console.log('[UI FIX] Stili CSS aggiunti per correggere problemi visivi');
  }
  
  // Patch per jsPDF per l'esportazione PDF
  function patchPdfExport() {
    // Controlla se jsPDF è già disponibile
    if (!window.jsPDF) {
      console.log('[UI FIX] jsPDF non trovato, caricamento dinamico...');
      
      // Carica jsPDF dinamicamente
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        console.log('[UI FIX] jsPDF caricato con successo');
        
        // Carica anche jspdf-autotable per le tabelle
        const autoTableScript = document.createElement('script');
        autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
        autoTableScript.onload = () => {
          console.log('[UI FIX] jspdf-autotable caricato con successo');
          // Rendi globalmente disponibile jsPDF
          window.jsPDF = window.jspdf.jsPDF;
        };
        document.head.appendChild(autoTableScript);
      };
      document.head.appendChild(script);
    }
  }
  
  // Fix per lucide-react (icone)
  function fixIcons() {
    // Se lucide non è disponibile, carica un polyfill
    if (!window.lucide) {
      console.log('[UI FIX] Lucide non trovato, caricamento dinamico...');
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js';
      script.onload = () => {
        console.log('[UI FIX] Lucide caricato con successo');
        // Inizializza le icone
        if (window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons();
        }
      };
      document.head.appendChild(script);
    }
  }
  
  // Esegui i fix al caricamento completo della pagina
  window.addEventListener('load', function() {
    console.log('[UI FIX] Pagina completamente caricata, applicazione dei fix');
    
    // Fix per componenti UI
    fixFormStyles();
    patchPdfExport();
    fixIcons();
    
    // Fix per React
    waitForReact(() => {
      patchReactDatePicker();
    });
    
    // Attacca handler per l'esportazione PDF
    attachPdfExportHandler();
  });
  
  // Handler per gestire l'export PDF
  function attachPdfExportHandler() {
    // Controlla periodicamente per i pulsanti di export PDF
    const checkExportButtons = setInterval(() => {
      const exportButtons = document.querySelectorAll('button:has(svg[data-lucide="file-down"])');
      
      if (exportButtons.length > 0) {
        console.log('[UI FIX] Trovati pulsanti di export PDF:', exportButtons.length);
        
        exportButtons.forEach(button => {
          // Verifica se abbiamo già aggiunto l'handler
          if (!button.dataset.fixHandlerAdded) {
            button.dataset.fixHandlerAdded = 'true';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            
            // Assicurati che l'icona sia visibile
            const icon = button.querySelector('svg');
            if (icon) {
              icon.style.display = 'inline-block';
              icon.style.marginRight = '8px';
            }
            
            console.log('[UI FIX] Handler export PDF aggiunto');
          }
        });
        
        // Una volta trovati i pulsanti, possiamo fermare il controllo
        clearInterval(checkExportButtons);
      }
    }, 1000);
    
    // Esporta le funzioni PDF nell'oggetto globale
    window.pdfUtils = window.pdfUtils || {};
    window.pdfUtils.exportToPdf = function(tableData, title) {
      if (!window.jsPDF) {
        console.error('[UI FIX] jsPDF non disponibile per l\'esportazione');
        return;
      }
      
      try {
        const doc = new window.jsPDF();
        
        // Aggiungi titolo
        doc.setFontSize(16);
        doc.text(title || 'Report Esportato', 14, 20);
        
        // Aggiungi data di generazione
        doc.setFontSize(10);
        const today = new Date();
        doc.text(`Generato il ${today.toLocaleDateString('it-IT')}`, 14, 30);
        
        // Tabella
        doc.autoTable({
          startY: 40,
          head: [['Nome', 'Cognome', 'Matricola', 'Data Inizio', 'Data Fine', 'Giorni']],
          body: tableData.map(item => [
            item.nome || '',
            item.cognome || '',
            item.matricola || '',
            item.dataInizio || '',
            item.dataFine || 'In corso',
            item.giorni || '0'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
        
        // Salva il PDF
        doc.save(`report_${today.toISOString().split('T')[0]}.pdf`);
        
        console.log('[UI FIX] PDF esportato con successo');
        return true;
      } catch (error) {
        console.error('[UI FIX] Errore durante l\'esportazione PDF:', error);
        return false;
      }
    };
  }
  
  console.log('[UI FIX] Script completato e attivo');
})();