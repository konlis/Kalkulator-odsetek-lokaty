# Kalkulator Pożyczki Inwestorskiej

Aplikacja do śledzenia pożyczek inwestorskich z naliczaniem odsetek dziennych od aktualnego salda kapitału.

## Funkcje

- Konfiguracja pożyczki (kapitał, oprocentowanie, daty)
- Transakcje: wpłata kapitału, spłata kapitału, płatność odsetek, płatność mieszana
- Edycja i usuwanie transakcji
- Symulacja dzień-po-dniu z naliczaniem odsetek od kapitału (nie kompoundowane)
- 4 karty KPI z podsumowaniem
- Wykres salda w czasie (Recharts)
- Tabela szczegółowych zdarzeń
- Eksport do PDF i CSV
- Dark mode
- Dane zapisywane w localStorage

## Tech stack

Vite, React 18, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts, jsPDF, date-fns

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

## Build produkcyjny

```bash
npm run build
npm run preview
```

## Deploy

### Vercel

1. Zainstaluj Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Uruchom deploy:
   ```bash
   vercel
   ```

   Przy pierwszym uruchomieniu CLI zapyta o konfigurację — domyślne ustawienia wystarczą (Vite jest wykrywany automatycznie).

3. Deploy produkcyjny:
   ```bash
   vercel --prod
   ```

**Alternatywnie** — połącz repozytorium GitHub z [vercel.com](https://vercel.com) i każdy push na `main` automatycznie triggeruje deploy.

### GitHub Pages

1. Dodaj `base` w `vite.config.ts` (nazwa repozytorium):
   ```ts
   export default defineConfig({
     base: '/nazwa-repozytorium/',
     // ...reszta konfiguracji
   })
   ```

2. Zainstaluj plugin do deploymentu:
   ```bash
   npm install -D gh-pages
   ```

3. Dodaj skrypty w `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Uruchom deploy:
   ```bash
   npm run deploy
   ```

   Strona będzie dostępna pod `https://<username>.github.io/<nazwa-repozytorium>/`.

**Alternatywnie** — użyj GitHub Actions. Utwórz `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

Następnie w ustawieniach repozytorium → Pages → Source wybierz **GitHub Actions**.
