/**
 * Script di fix per il login su GitHub Pages
 * Deve essere caricato dopo auth-fix-early.js ma prima di React
 */
(function() {
  // Configurazione Login
  const API_URL = window.API_URL || 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';
  const BASE_PATH = window.BASE_PATH || '/static_site';
  
  console.log('[LOGIN FIX] Inizializzato, API URL:', API_URL);
  
  // Verifica se l'utente è già loggato tramite cookie o localStorage
  function checkLoginStatus() {
    // Controlla se bisogna forzare la pagina di login (parametro URL o localStorage)
    const urlParams = new URLSearchParams(window.location.search);
    const forceLogin = urlParams.get('forceLogin') === 'true';
    const forceLoginStorage = localStorage.getItem('forceLogin') === 'true';
    
    // Se è richiesto il force login, salva la preferenza e non controllare altro
    if (forceLogin) {
      localStorage.setItem('forceLogin', 'true');
      console.log('[LOGIN FIX] ForceLogin attivo da URL, mostrando pagina login');
      clearStoredCredentials();
      window.isAuthenticated = false;
      window.__IS_AUTHENTICATED__ = false;
      return;
    }
    
    // Se force login è salvato in localStorage, rispettalo
    if (forceLoginStorage) {
      console.log('[LOGIN FIX] ForceLogin attivo da localStorage, mostrando pagina login');
      clearStoredCredentials();
      window.isAuthenticated = false;
      window.__IS_AUTHENTICATED__ = false;
      return;
    }
    
    // Controlla se esiste un token in localStorage
    const storedAuthToken = localStorage.getItem('authToken');
    const storedSessionId = localStorage.getItem('sessionId');
    const sessionCookie = document.cookie.includes('connect.sid') || document.cookie.includes('session');
    
    // Forza sempre il controllo delle credenziali se siamo nella pagina di login o auth
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login') || currentPath.includes('/auth')) {
      console.log('[LOGIN FIX] Siamo nella pagina di login/auth, resettiamo le credenziali');
      clearStoredCredentials();
      window.isAuthenticated = false;
      window.__IS_AUTHENTICATED__ = false;
      return;
    }
    
    if (storedAuthToken || storedSessionId || sessionCookie) {
      console.log('[LOGIN FIX] Cookie o token di sessione trovati, verifico utente...');
      
      // Verifica lo stato dell'utente
      fetch(`${API_URL}/api/user`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Authorization': storedAuthToken ? `Bearer ${storedAuthToken}` : undefined,
          'X-Session-ID': storedSessionId || undefined
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json().then(userData => {
            console.log('[LOGIN FIX] Utente già autenticato:', userData);
            window.__USER_DATA__ = userData;
            window.USER_DATA = userData;
            window.isAuthenticated = true;
            window.__IS_AUTHENTICATED__ = true;
            
            // Applica hook per React Query
            if (window.queryClient && typeof window.queryClient.setQueryData === 'function') {
              window.queryClient.setQueryData(['/api/user'], userData);
              console.log('[LOGIN FIX] Dati utente impostati in queryClient');
            }
            
            // Dispatch evento di login completato
            dispatchLoginEvent(userData);
          });
        } else {
          console.log('[LOGIN FIX] Utente non autenticato:', response.status);
          clearStoredCredentials();
          window.isAuthenticated = false;
          window.__IS_AUTHENTICATED__ = false;
        }
      })
      .catch(error => {
        console.error('[LOGIN FIX] Errore verifica utente:', error);
        clearStoredCredentials();
      });
    } else {
      console.log('[LOGIN FIX] Nessun token o cookie di sessione trovato');
      window.isAuthenticated = false;
      window.__IS_AUTHENTICATED__ = false;
    }
  }
  
  // Rimuovi credenziali salvate in caso di errore
  function clearStoredCredentials() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionId');
  }
  
  // Dispatch di un evento custom per notificare il completamento del login
  function dispatchLoginEvent(userData) {
    const event = new CustomEvent('loginCompleted', { detail: userData });
    document.dispatchEvent(event);
    console.log('[LOGIN FIX] Evento loginCompleted dispatched');
  }
  
  // Override della funzione 'logout' se presente
  const originalLogout = window.logout;
  window.logout = function() {
    console.log('[LOGIN FIX] Logout in corso...');
    
    fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors'
    })
    .then(() => {
      clearStoredCredentials();
      window.isAuthenticated = false;
      window.__IS_AUTHENTICATED__ = false;
      
      // Dispatch evento di logout completato
      document.dispatchEvent(new CustomEvent('logoutCompleted'));
      console.log('[LOGIN FIX] Logout completato, evento dispatched');
      
      // Reindirizza alla home o login dopo logout
      window.location.href = BASE_PATH + '/';
    })
    .catch(error => {
      console.error('[LOGIN FIX] Errore durante il logout:', error);
    });
    
    // Chiama anche la funzione originale se presente
    if (typeof originalLogout === 'function') {
      originalLogout.apply(this, arguments);
    }
  };
  
  // Aggiungi menu di logout nell'interfaccia
  function addLogoutMenu() {
    setTimeout(() => {
      if (window.isAuthenticated) {
        // Verifica se il menu di logout è già presente
        if (!document.querySelector('#logout-button')) {
          // Cerca l'area dell'header dove inserire il link di logout
          const header = document.querySelector('header') || 
                        document.querySelector('nav') || 
                        document.querySelector('.navbar');
          
          if (header) {
            // Crea il bottone di logout
            const logoutButton = document.createElement('button');
            logoutButton.id = 'logout-button';
            logoutButton.innerText = 'Logout';
            logoutButton.style.marginLeft = 'auto';
            logoutButton.style.padding = '8px 12px';
            logoutButton.style.background = 'crimson';
            logoutButton.style.color = 'white';
            logoutButton.style.border = 'none';
            logoutButton.style.borderRadius = '4px';
            logoutButton.style.cursor = 'pointer';
            
            // Aggiungi l'evento di logout
            logoutButton.addEventListener('click', () => {
              window.logout();
            });
            
            // Aggiungi il bottone all'header
            const lastChild = header.lastChild;
            header.insertBefore(logoutButton, lastChild);
            console.log('[LOGIN FIX] Bottone di logout aggiunto');
          }
        }
      }
    }, 500);
  }
  
  // Fix alla navigazione post-login
  document.addEventListener('loginCompleted', function(e) {
    // Aggiungiamo un piccolo ritardo per dare tempo al React di renderizzare
    setTimeout(() => {
      // Verifica percorso corrente e reindirizza se necessario
      const path = window.location.pathname;
      if (path === BASE_PATH + '/login' || path === BASE_PATH + '/auth' || path === BASE_PATH + '/') {
        console.log('[LOGIN FIX] Reindirizzamento alla dashboard dopo login');
        window.location.href = BASE_PATH + '/dashboard';
      } else {
        // Se siamo già in una pagina valida, aggiungi il menu di logout
        addLogoutMenu();
      }
    }, 300);
  });
  
  // Controlla periodicamente e aggiungi il bottone di logout se manca
  setInterval(addLogoutMenu, 2000);
  
  // Controlla subito lo stato del login
  checkLoginStatus();
  
  // Esponi funzioni pubbliche
  window.checkLoginStatus = checkLoginStatus;
  window.clearLoginCredentials = clearStoredCredentials;
  
  console.log('[LOGIN FIX] Script completato e attivo');
})();