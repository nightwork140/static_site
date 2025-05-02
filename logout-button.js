/**
 * Script per aggiungere un bottone di logout fisso in tutte le pagine
 */

(function() {
  console.log("[LOGOUT] Inizializzazione bottone logout");
  
  function addLogoutButton() {
    if (document.getElementById('fixed-logout')) return;
    
    const button = document.createElement('div');
    button.id = 'fixed-logout';
    button.innerText = 'Logout';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.backgroundColor = '#e74c3c';
    button.style.color = 'white';
    button.style.padding = '8px 15px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';
    button.style.fontWeight = 'bold';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    
    button.addEventListener('click', function() {
      console.log("[LOGOUT] Logout in corso...");
      localStorage.removeItem('userCredentials');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('userCredentials');
      sessionStorage.removeItem('userData');
      window.location.href = window.location.origin + window.location.pathname + '?forceLogin=true';
    });
    
    document.body.appendChild(button);
    console.log("[LOGOUT] Bottone aggiunto");
  }
  
  if (document.body) {
    addLogoutButton();
  } else {
    window.addEventListener('DOMContentLoaded', addLogoutButton);
  }
  
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
})();