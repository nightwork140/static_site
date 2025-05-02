/**
 * Script di correzione per i form in GitHub Pages
 */

(function() {
  console.log('[FORM FIX] Inizializzato');

  function fixSearchFields() {
    const containers = document.querySelectorAll('[class*="search"], [class*="Search"], [id*="search"], [id*="Search"]');
    
    containers.forEach(function(container) {
      if (window.getComputedStyle(container).display === 'none') {
        container.style.display = 'block';
      }
      
      const inputs = container.querySelectorAll('input, select, button');
      inputs.forEach(function(input) {
        if (window.getComputedStyle(input).display === 'none') {
          input.style.display = 'inline-block';
        }
      });
    });
  }

  function applyFixes() {
    fixSearchFields();
    console.log('[FORM FIX] Fix applicati');
  }

  if (document.readyState === 'complete') {
    applyFixes();
  } else {
    window.addEventListener('load', applyFixes);
  }

  const observer = new MutationObserver(function() {
    setTimeout(applyFixes, 200);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();