/**
 * Script di correzione avanzato per i form (v2)
 */

(function() {
  console.log('[FORM FIX v2] Inizializzato');

  // Dati per carabinieri (per simulare form inserimento)
  const carabinieriData = [
    {
      id: 101,
      nome: 'Mario',
      cognome: 'Rossi',
      matricola: 'CC12345',
      email: 'mario.rossi@carabinieri.it',
      grado: 'Maresciallo Capo',
      reparto: 'Comando Provinciale Roma'
    },
    {
      id: 102,
      nome: 'Luigi',
      cognome: 'Bianchi',
      matricola: 'CC12346',
      email: 'luigi.bianchi@carabinieri.it',
      grado: 'Brigadiere',
      reparto: 'Comando Provinciale Milano'
    }
  ];

  // Corregge i campi di ricerca nascosti
  function fixSearchFields() {
    // Cerca tutti i possibili contenitori di ricerca usando vari selettori
    const searchContainers = document.querySelectorAll(
      'div[class*="search"], div[class*="Search"], ' +
      'div[id*="search"], div[id*="Search"], ' +
      'form[class*="search"], form[class*="Search"], ' +
      'div[class*="filtri"], div[class*="Filtri"], ' +
      'section[class*="search"], section[class*="Search"]'
    );
    
    searchContainers.forEach(function(container) {
      // Rendi visibili i container nascosti
      const style = window.getComputedStyle(container);
      if (style.display === 'none') {
        container.style.display = 'block';
        console.log('[FORM FIX v2] Reso visibile container di ricerca:', container);
      }
      if (style.visibility === 'hidden') {
        container.style.visibility = 'visible';
        console.log('[FORM FIX v2] Modificata visibilità container di ricerca:', container);
      }
      if (parseFloat(style.opacity) === 0) {
        container.style.opacity = '1';
        console.log('[FORM FIX v2] Modificata opacità container di ricerca:', container);
      }
      
      // Mostra anche tutti i contenitori interni
      const innerContainers = container.querySelectorAll('div, section, fieldset');
      innerContainers.forEach(function(inner) {
        const innerStyle = window.getComputedStyle(inner);
        if (innerStyle.display === 'none') {
          inner.style.display = 'block';
        }
        if (innerStyle.visibility === 'hidden') {
          inner.style.visibility = 'visible';
        }
      });
      
      // Trova e rendi visibili gli input nascosti
      const inputs = container.querySelectorAll('input, select, button');
      inputs.forEach(function(input) {
        const inputStyle = window.getComputedStyle(input);
        if (inputStyle.display === 'none') {
          input.style.display = 'inline-block';
          console.log('[FORM FIX v2] Reso visibile input di ricerca:', input);
        }
        if (inputStyle.visibility === 'hidden') {
          input.style.visibility = 'visible';
        }
        if (parseFloat(inputStyle.opacity) === 0) {
          input.style.opacity = '1';
        }
      });
    });
  }

  // Sistema i bottoni con etichette specifiche (cerca, ricerca, salva, ecc.)
  function fixActionButtons() {
    // Lista di termini per trovare i bottoni di azione
    const actionTerms = ['cerca', 'ricerca', 'salva', 'inserisci', 'modifica', 'elimina', 'invia', 'submit', 'search', 'save'];
    
    // Cerca tutti i bottoni e input di tipo submit
    const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
    
    buttons.forEach(function(button) {
      // Ottieni il testo del bottone
      const buttonText = button.innerText || button.value || button.textContent || '';
      const buttonLower = buttonText.toLowerCase();
      
      // Controlla se il testo contiene uno dei termini di azione
      const isActionButton = actionTerms.some(term => buttonLower.includes(term));
      
      // Controlla anche attributi class e id
      const classAndId = (button.className || '') + ' ' + (button.id || '');
      const hasActionClass = actionTerms.some(term => classAndId.toLowerCase().includes(term));
      
      if (isActionButton || hasActionClass) {
        // Se è un bottone di azione, rendilo visibile
        const style = window.getComputedStyle(button);
        if (style.display === 'none') {
          button.style.display = 'inline-block';
          console.log('[FORM FIX v2] Reso visibile bottone azione:', button);
        }
        if (style.visibility === 'hidden') {
          button.style.visibility = 'visible';
        }
        if (parseFloat(style.opacity) === 0) {
          button.style.opacity = '1';
        }
      }
    });
  }

  // Funzione per intercettare l'invio dei form
  function interceptFormSubmission() {
    // Intercetta gli eventi submit
    document.addEventListener('submit', function(event) {
      // Non bloccare la presentazione originale
      console.log('[FORM FIX v2] Form sottomesso:', event.target);
      
      // Recupera tutti i dati dal form
      const formData = new FormData(event.target);
      const formDataObj = {};
      formData.forEach(function(value, key) {
        formDataObj[key] = value;
      });
      
      console.log('[FORM FIX v2] Dati del form:', formDataObj);
      
      // Simula una risposta di successo dopo 1 secondo
      setTimeout(() => {
        // Genera un ID casuale per simulare un nuovo record
        const newId = Math.floor(Math.random() * 1000) + 100;
        
        // Crea un messaggio di successo basato sul tipo di form
        let successMessage = 'Operazione completata con successo';
        const formAction = (event.target.action || '').toLowerCase();
        
        if (formAction.includes('carabinier') || formAction.includes('utent')) {
          successMessage = `${formDataObj.nome || ''} ${formDataObj.cognome || ''} salvato con successo`;
        } else if (formAction.includes('malatt') || formAction.includes('assenz')) {
          successMessage = 'Assenza registrata con successo';
        }
        
        // Aggiungiamo il nuovo record ai dati simulati
        if (formDataObj.nome && formDataObj.cognome) {
          const newRecord = {
            id: newId,
            nome: formDataObj.nome,
            cognome: formDataObj.cognome,
            ...formDataObj
          };
          carabinieriData.push(newRecord);
        }
        
        // Crea e dispara l'evento di successo
        const successEvent = new CustomEvent('formSubmitSuccess', {
          detail: {
            form: event.target,
            success: true,
            message: successMessage,
            data: {
              id: newId,
              ...formDataObj
            }
          }
        });
        
        document.dispatchEvent(successEvent);
        console.log('[FORM FIX v2] Simulata risposta di successo per il form');
        
        // Ricrea elementi UI se necessario
        setTimeout(fixSearchFields, 500);
        setTimeout(fixActionButtons, 500);
      }, 1000);
    }, false);
  }

  // Funzione per controllare i form da sistemare
  function findAndFixForms() {
    // Trova tutti i form nella pagina
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      // Verifica se il form è nascosto
      const style = window.getComputedStyle(form);
      if (style.display === 'none') {
        form.style.display = 'block';
        console.log('[FORM FIX v2] Reso visibile form nascosto:', form);
      }
      
      // Verifica se ci sono elementi nascosti nel form
      const hiddenElements = form.querySelectorAll('[style*="display:none"], [style*="display: none"], [hidden]');
      hiddenElements.forEach(function(el) {
        if (el.tagName !== 'INPUT' || el.type !== 'hidden') { // non modificare gli input hidden
          el.style.display = 'block';
          el.hidden = false;
          console.log('[FORM FIX v2] Reso visibile elemento nascosto in form:', el);
        }
      });
    });
  }

  // Funzione principale per applicare tutti i fix
  function applyFormFixes() {
    console.log('[FORM FIX v2] Applicazione di tutti i fix per i form');
    fixSearchFields();
    fixActionButtons();
    findAndFixForms();
  }

  // Applica i fix quando il documento è completamente caricato
  if (document.readyState === 'complete') {
    applyFormFixes();
    interceptFormSubmission();
  } else {
    window.addEventListener('load', function() {
      applyFormFixes();
      interceptFormSubmission();
    });
  }

  // Monitora le navigazioni SPA
  const observer = new MutationObserver(function() {
    setTimeout(applyFormFixes, 300);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
  
  console.log('[FORM FIX v2] Script attivato e in ascolto per cambiamenti DOM');
})();