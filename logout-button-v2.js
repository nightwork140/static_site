/**
 * Script per aggiungere un bottone di logout in stile con l'applicazione (v2)
 */

(function() {
  console.log("[LOGOUT v2] Inizializzazione bottone logout in stile");
  
  // Funzione per trovare lo stile dei bottoni dell'app
  function detectAppButtonStyle() {
    const appButtons = document.querySelectorAll('button:not(#fixed-logout), .button, [class*="btn"], [class*="button"]');
    if (appButtons.length === 0) return null;
    
    // Scegli il primo bottone visibile con stile coerente
    for (const button of appButtons) {
      const style = window.getComputedStyle(button);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          padding: style.padding,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          border: style.border
        };
      }
    }
    
    return null;
  }
  
  // Funzione per creare il bottone di logout
  function addLogoutButton() {
    // Evita di aggiungere duplicati
    if (document.getElementById('fixed-logout')) return;
    
    // Rileva lo stile dei bottoni dell'app
    const appButtonStyle = detectAppButtonStyle();
    
    // Crea il bottone
    const button = document.createElement('div');
    button.id = 'fixed-logout';
    button.innerHTML = '<span>Logout</span>';
    
    // Stile base del bottone
    let baseStyle = {
      position: 'fixed',
      top: '10px',
      right: '10px',
      zIndex: '9999',
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '8px 15px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      textDecoration: 'none',
      border: 'none',
      transition: 'background-color 0.2s'
    };
    
    // Se abbiamo rilevato uno stile coerente per i bottoni dell'app, lo usiamo
    if (appButtonStyle) {
      console.log("[LOGOUT v2] Rilevato stile bottoni applicazione:", appButtonStyle);
      baseStyle.backgroundColor = appButtonStyle.backgroundColor || baseStyle.backgroundColor;
      baseStyle.color = appButtonStyle.color || baseStyle.color;
      baseStyle.fontFamily = appButtonStyle.fontFamily || baseStyle.fontFamily;
      baseStyle.fontSize = appButtonStyle.fontSize || baseStyle.fontSize;
      baseStyle.fontWeight = appButtonStyle.fontWeight || baseStyle.fontWeight;
      baseStyle.padding = appButtonStyle.padding || baseStyle.padding;
      baseStyle.borderRadius = appButtonStyle.borderRadius || baseStyle.borderRadius;
      baseStyle.boxShadow = appButtonStyle.boxShadow || baseStyle.boxShadow;
      baseStyle.border = appButtonStyle.border || baseStyle.border;
    } else {
      // Se non riusciamo a rilevare lo stile, usiamo un tema comune nelle applicazioni web moderne
      console.log("[LOGOUT v2] Nessuno stile bottone rilevato, utilizzo tema moderno predefinito");
      baseStyle.backgroundColor = '#4299e1'; // blue-500
      baseStyle.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    }
    
    // Applica lo stile
    Object.assign(button.style, baseStyle);
    
    // Aggiungi effetto hover
    button.onmouseover = function() {
      this.style.backgroundColor = adjustColor(baseStyle.backgroundColor, -20);
    };
    button.onmouseout = function() {
      this.style.backgroundColor = baseStyle.backgroundColor;
    };
    
    // Aggiungi funzionalità di logout
    button.addEventListener('click', performLogout);
    
    // Aggiungi alla pagina
    document.body.appendChild(button);
    console.log("[LOGOUT v2] Bottone logout aggiunto con stile coerente all'applicazione");
  }
  
  // Funzione per schiarire/scurire un colore
  function adjustColor(color, amount) {
    try {
      // Converte colori CSS in formato RGB
      if (!color || typeof color !== 'string') return '#4299e1';
      
      // Gestisci colori rgba
      if (color.startsWith('rgba')) {
        const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (match) {
          const r = Math.max(0, Math.min(255, parseInt(match[1]) + amount));
          const g = Math.max(0, Math.min(255, parseInt(match[2]) + amount));
          const b = Math.max(0, Math.min(255, parseInt(match[3]) + amount));
          return `rgba(${r}, ${g}, ${b}, ${match[4]})`;
        }
      }
      
      // Gestisci colori rgb
      if (color.startsWith('rgb')) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          const r = Math.max(0, Math.min(255, parseInt(match[1]) + amount));
          const g = Math.max(0, Math.min(255, parseInt(match[2]) + amount));
          const b = Math.max(0, Math.min(255, parseInt(match[3]) + amount));
          return `rgb(${r}, ${g}, ${b})`;
        }
      }
      
      // Gestisci colori esadecimali
      if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    } catch (e) {
      console.error("[LOGOUT v2] Errore nell'elaborazione del colore:", e);
    }
    
    // Fallback per sicurezza
    return color;
  }
  
  // Funzione di logout
  function performLogout() {
    console.log("[LOGOUT v2] Logout in corso...");
    
    // Rimuovi dati utente
    localStorage.removeItem('userCredentials');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userCredentials');
    sessionStorage.removeItem('userData');
    
    // Tenta di chiamare l'API di logout
    try {
      fetch('https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev/api/logout', {
        method: 'POST',
        credentials: 'include'
      }).then(() => {
        // Reindirizza alla pagina di login indipendentemente dal successo o fallimento
        redirectToLogin();
      }).catch(() => {
        // Se la chiamata fallisce, reindirizza comunque
        redirectToLogin();
      });
    } catch (e) {
      // Se si verifica un errore, reindirizza comunque
      redirectToLogin();
    }
  }
  
  // Funzione di reindirizzamento al login
  function redirectToLogin() {
    window.location.href = window.location.origin + window.location.pathname + '?forceLogin=true';
  }
  
  // Aggiungi il bottone quando il DOM è pronto
  if (document.body) {
    addLogoutButton();
  } else {
    window.addEventListener('DOMContentLoaded', addLogoutButton);
  }
  
  // Monitora le navigazioni SPA
  const observer = new MutationObserver(function() {
    if (!document.getElementById('fixed-logout') && document.body) {
      addLogoutButton();
    }
  });
  
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
  
  console.log("[LOGOUT v2] Script attivato");
})();