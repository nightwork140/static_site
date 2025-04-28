/**
 * Script per correggere le chiamate API nel frontend statico
 *
 * ATTENZIONE: Questo script deve essere incluso PRIMA di qualsiasi altro script
 * nella pagina HTML e soprattutto prima che l'app React venga caricata
 */

(function () {
  // Configurazione API
  const API_CONFIG = {
    API_URL:
      "https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev",
    debug: true,
  };

  // Stampa informazioni di debug
  function apiDebugLog(...args) {
    if (API_CONFIG.debug) {
      console.log("[API Fix]", ...args);
    }
  }

  // Registra le modifiche
  apiDebugLog("Inizializzazione fix API URL per GitHub Pages");
  apiDebugLog("API URL configurato:", API_CONFIG.API_URL);

  // Definisci una variabile globale con l'URL API per React e altre librerie
  window.SIGEA_API_URL = API_CONFIG.API_URL;

  // Definisci l'API URL in diverse posizioni per assicurarci che sia disponibile
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_API_URL = API_CONFIG.API_URL;

  // Crea un oggetto per le chiamate API sicure
  window.api = {
    url: API_CONFIG.API_URL,
    fetch: function (endpoint, options = {}) {
      // Costruisci l'URL completo
      const fullUrl = endpoint.startsWith("http")
        ? endpoint
        : endpoint.startsWith("/api")
        ? API_CONFIG.API_URL + endpoint
        : API_CONFIG.API_URL +
          "/api" +
          (endpoint.startsWith("/") ? endpoint : "/" + endpoint);

      // Assicurati che credentials e mode siano impostati per CORS
      options.credentials = options.credentials || "include";
      options.mode = options.mode || "cors";

      apiDebugLog("Chiamata API:", fullUrl, options.method || "GET");
      return fetch(fullUrl, options);
    },
    login: async function (username, password) {
      try {
        const response = await this.fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        return await response.json();
      } catch (error) {
        apiDebugLog("Errore login:", error);
        throw error;
      }
    },
    getUser: async function () {
      try {
        const response = await this.fetch("/api/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("authToken")
              ? `Bearer ${localStorage.getItem("authToken")}`
              : undefined,
          },
        });

        return await response.json();
      } catch (error) {
        apiDebugLog("Errore get user:", error);
        throw error;
      }
    },
  };

  // Sovrascrivi fetch per intercettare tutte le chiamate API
  const originalFetch = window.fetch;
  window.fetch = function (resource, options = {}) {
    let url = resource;

    // Per stringhe che iniziano con /api
    if (typeof resource === "string") {
      if (resource.startsWith("/api")) {
        url = API_CONFIG.API_URL + resource;
        apiDebugLog("Intercettata chiamata API:", resource, "→", url);
      } else if (resource.includes("/api/")) {
        // Cerca anche URL come https://nightwork140.github.io/api/login
        const apiIndex = resource.indexOf("/api/");
        if (apiIndex >= 0) {
          const apiPath = resource.substring(apiIndex);
          url = API_CONFIG.API_URL + apiPath;
          apiDebugLog("Corretta chiamata API completa:", resource, "→", url);
        }
      }
    }

    // Imposta sempre credentials e mode per le chiamate API
    if (
      typeof resource === "string" &&
      (resource.includes("/api/") || resource.startsWith("/api"))
    ) {
      options.credentials = "include";
      options.mode = "cors";
    }

    return originalFetch(url, options);
  };

  // Sovrascrivi anche XMLHttpRequest per completezza
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password
  ) {
    let redirectUrl = url;

    if (typeof url === "string") {
      if (url.startsWith("/api")) {
        redirectUrl = API_CONFIG.API_URL + url;
        apiDebugLog("Intercettata chiamata XHR API:", url, "→", redirectUrl);
      } else if (url.includes("/api/")) {
        // Cerca anche URL come https://nightwork140.github.io/api/login
        const apiIndex = url.indexOf("/api/");
        if (apiIndex >= 0) {
          const apiPath = url.substring(apiIndex);
          redirectUrl = API_CONFIG.API_URL + apiPath;
          apiDebugLog(
            "Corretta chiamata XHR API completa:",
            url,
            "→",
            redirectUrl
          );
        }
      }
    }

    return originalOpen.call(this, method, redirectUrl, async, user, password);
  };

  // Aggiungi uno script tag direttamente al document per definire l'ambiente prima che React si carichi
  const scriptTag = document.createElement("script");
  scriptTag.textContent = `
    // Imposta variabili d'ambiente per il frontend
    window.ENV = {
      API_URL: "${API_CONFIG.API_URL}"
    };
    
    // Definisci import.meta.env che viene usato dalle applicazioni Vite
    window.import = window.import || {};
    window.import.meta = window.import.meta || {};
    window.import.meta.env = window.import.meta.env || {};
    window.import.meta.env.VITE_API_URL = "${API_CONFIG.API_URL}";
    
    console.log("[API Fix Injection] API URL impostato a: ${API_CONFIG.API_URL}");
  `;
  document.head.appendChild(scriptTag);

  // Esporta configurazione API in window
  window.API_CONFIG = API_CONFIG;

  apiDebugLog("Fix API caricato e attivo");

  // Aggiungi un messaggio visibile nella pagina dopo il caricamento
  window.addEventListener("DOMContentLoaded", () => {
    const infoDiv = document.createElement("div");
    infoDiv.style.position = "fixed";
    infoDiv.style.bottom = "10px";
    infoDiv.style.right = "10px";
    infoDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
    infoDiv.style.color = "white";
    infoDiv.style.padding = "10px";
    infoDiv.style.borderRadius = "5px";
    infoDiv.style.fontSize = "12px";
    infoDiv.style.zIndex = "9999";
    infoDiv.innerHTML = `API URL: ${API_CONFIG.API_URL}<br>Fix Attivo`;
    document.body.appendChild(infoDiv);

    // Nascondi dopo 10 secondi
    setTimeout(() => {
      infoDiv.style.display = "none";
    }, 10000);
  });
})();
