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
- Import transakcji z wyciągu PDF Santander Bank
- Eksport do PDF i CSV
- Dark mode
- Dane zapisywane w localStorage

## Tech stack

Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts, jsPDF, pdfjs-dist, date-fns

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

Repozytorium zawiera workflow `.github/workflows/deploy.yml` — każdy push na `main` automatycznie buduje i deployuje aplikację.

Wymagana jednorazowa konfiguracja: w ustawieniach repozytorium → Pages → Source wybierz **GitHub Actions**.
