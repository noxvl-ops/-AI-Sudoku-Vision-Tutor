# AI Sudoku Vision & Tutor

Web application realizzata seguendo la traccia del progetto.

## Funzionalità
- Caricamento immagine o acquisizione da fotocamera.
- OCR multimodale con Google Gemini e risposta JSON strutturata.
- Griglia 9×9 modificabile: clicca una cella e digita una cifra da 1 a 9; Backspace/Canc per svuotarla.
- Controllo dei conflitti nella riga, colonna e riquadro.
- Suggerimenti progressivi: area, posizione, soluzione.
- Spiegazione testuale tramite Gemini e lettura vocale con Web Speech API.
- Solutore locale JavaScript con backtracking.
- Avatar che cambia espressione in base allo stato.

## Requisiti
Node.js 18 o superiore e una API key di Google AI Studio.

## Avvio
1. Estrai lo ZIP e apri la cartella nel terminale.
2. Installa le dipendenze: `npm install`
3. Copia `.env.example` in `.env`.
4. Inserisci la tua chiave in `GEMINI_API_KEY`.
5. Avvia: `npm start`
6. Apri `http://localhost:3000`.

La chiave API resta sul server: non inserirla nel frontend e non caricare `.env` su GitHub.

## Architettura
Frontend HTML/CSS/JavaScript; backend Node.js + Express; integrazione Gemini tramite SDK `@google/genai`. Il backend valida input e output e usa JSON Schema per OCR e spiegazione. La risoluzione è locale, con backtracking, così la correttezza della soluzione non dipende dal modello generativo.

## Nota
Il modello predefinito è `gemini-2.0-flash`, come previsto dalla traccia. Se il modello non è disponibile nel tuo progetto Google AI Studio, modifica `GEMINI_MODEL` nel file `.env` con un modello Flash attualmente abilitato nel tuo account.
