
/**
 * Configurazione API con login fixed per il frontend SIGEA
 */

// URL dell'API SIGEA con il login fixed
const API_URL = 'https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev';

// Configurazione per l'autenticazione
const authConfig = {
  // Credenziali di default per il login
  defaultCredentials: {
    username: 'admin',
    password: 'password'
  },
  
  // Endpoint per l'autenticazione
  endpoints: {
    login: `${API_URL}/api/login`,
    user: `${API_URL}/api/user`,
    logout: `${API_URL}/api/logout`,
    debug: `${API_URL}/api/debug-login`,
    health: `${API_URL}/api/health`,
    cookieTest: `${API_URL}/api/cookie-test`,
    generateToken: `${API_URL}/api/auth/generate-token`
  },
  
  // Opzioni fetch per le richieste all'API
  fetchOptions: {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  
  // Funzione per ottenere un token di autenticazione (da localStorage)
  getToken: () => localStorage.getItem('authToken'),
  
  // Funzione per aggiungere l'header di autenticazione a una richiesta
  addAuthHeader: (headers = {}) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }
    return headers;
  }
};

// Funzione per effettuare il login
async function login(username, password) {
  try {
    const response = await fetch(authConfig.endpoints.login, {
      method: 'POST',
      ...authConfig.fetchOptions,
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Salva il sessionID in localStorage come fallback
      if (data._debug && data._debug.sessionID) {
        localStorage.setItem('sessionID', data._debug.sessionID);
      }
      
      // Memorizza anche i dati dell'utente
      localStorage.setItem('userData', JSON.stringify({
        id: data.id,
        username: data.username,
        isAdmin: data.isAdmin
      }));
      
      return { success: true, user: data };
    } else {
      return { success: false, message: data.message || 'Login fallito' };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Errore di connessione al server' };
  }
}

// Funzione per ottenere l'utente corrente
async function getCurrentUser() {
  try {
    // Aggiungi sia credentials che l'header di autorizzazione
    const response = await fetch(authConfig.endpoints.user, {
      method: 'GET',
      ...authConfig.fetchOptions,
      headers: authConfig.addAuthHeader(authConfig.fetchOptions.headers)
    });
    
    if (response.ok) {
      const user = await response.json();
      return { success: true, user };
    } else {
      return { success: false, message: 'Utente non autenticato' };
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return { success: false, message: 'Errore di connessione al server' };
  }
}

// Funzione per effettuare il logout
async function logout() {
  try {
    const response = await fetch(authConfig.endpoints.logout, {
      method: 'POST',
      ...authConfig.fetchOptions
    });
    
    // Pulisci lo storage locale
    localStorage.removeItem('sessionID');
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, message: 'Errore durante il logout' };
  }
}

// Funzione per generare un token di autenticazione (per scenari senza cookie)
async function generateAuthToken(username, password) {
  try {
    const response = await fetch(authConfig.endpoints.generateToken, {
      method: 'POST',
      ...authConfig.fetchOptions,
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      localStorage.setItem('authToken', data.token);
      return { success: true, token: data.token };
    } else {
      return { success: false, message: data.message || 'Generazione token fallita' };
    }
  } catch (error) {
    console.error('Error generating token:', error);
    return { success: false, message: 'Errore di connessione al server' };
  }
}

// Esporta le funzioni e le configurazioni
export {
  API_URL,
  authConfig,
  login,
  getCurrentUser,
  logout,
  generateAuthToken
};