/**
 * Script per correggere le chiamate API nel frontend statico
 *
 * Questo script deve essere incluso nella pagina HTML prima di qualsiasi altro script
 * e sostituisce le chiamate fetch e XMLHttpRequest per assicurarsi che le richieste
 * API vadano all'URL corretto.
 */

(function () {
  // URL dell'API di Replit
  const API_URL =
    "https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev";

  // Backup dell'originale fetch
  const originalFetch = window.fetch;

  // Sovrascrivere fetch per ridirezionare le chiamate API
  window.fetch = function (resource, options = {}) {
    let url = resource;

    // Se è una stringa e inizia con /api, reindirizza a API_URL
    if (typeof resource === "string" && resource.startsWith("/api")) {
      url = API_URL + resource;
      console.log(
        "[API Redirect] Reindirizzamento richiesta da",
        resource,
        "a",
        url
      );
    }

    // Assicurati che le richieste includano credentials
    if (!options.credentials) {
      options.credentials = "include";
    }

    // Assicurati che mode sia cors per richieste cross-origin
    if (!options.mode) {
      options.mode = "cors";
    }

    return originalFetch(url, options);
  };

  // Backup dell'originale XMLHttpRequest.open
  const originalOpen = XMLHttpRequest.prototype.open;

  // Sovrascrivere XMLHttpRequest.open per ridirezionare le chiamate API
  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password
  ) {
    let redirectUrl = url;

    // Se l'URL inizia con /api, reindirizza a API_URL
    if (typeof url === "string" && url.startsWith("/api")) {
      redirectUrl = API_URL + url;
      console.log(
        "[API Redirect XHR] Reindirizzamento richiesta da",
        url,
        "a",
        redirectUrl
      );
    }

    // Chiamare l'originale open con l'URL modificato
    return originalOpen.call(this, method, redirectUrl, async, user, password);
  };

  // Dopo il caricamento della pagina, imposta l'URL API nell'environment
  window.addEventListener("DOMContentLoaded", () => {
    window.ENV = window.ENV || {};
    window.ENV.API_URL = API_URL;

    // Se esiste import.meta.env, imposta anche li
    if (window.import && window.import.meta && window.import.meta.env) {
      window.import.meta.env.VITE_API_URL = API_URL;
    }

    console.log("[API Fix] URL API impostato a:", API_URL);
  });

  console.log("[API Fix] Script di correzione API caricato");
})();
