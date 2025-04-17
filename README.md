# Build Statico - Sistema Gestione Assenze Carabinieri

Questo è un build statico del frontend dell'applicazione Sistema Gestione Assenze Carabinieri.

## Istruzioni di Deployment

1. Carica tutti i file di questa directory su un hosting statico (Vercel, Netlify, GitHub Pages, ecc.)

2. Il backend è già configurato e disponibile su Replit all'URL:
   ```
   https://125ec53e-b5ad-466d-93bb-d52e653062de-00-1j7uejkdf73fw.janeway.replit.dev
   ```

3. Non è necessario modificare nulla nella configurazione del frontend, in quanto il build è già configurato per utilizzare l'URL del backend Replit.

## Note

- Il backend è già configurato per accettare richieste CORS dal dominio del frontend statico
- Le chiamate API sono preconfigurate per utilizzare l'URL del backend Replit specificato in .env.production.static
- Assicurati che il servizio di hosting statico supporti il routing SPA (Single Page Application)
