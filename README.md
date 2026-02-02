# Pledged Dashboard - Electron + React

This is a desktop dashboard application built with:

- Electron (desktop shell)
- React + Vite
- Tailwind CSS
- Recharts for charts

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start in development mode (Vite + Electron):

```bash
npm run dev
```

This will:

- start the Vite dev server on http://localhost:5173
- wait for it to be ready
- launch Electron pointing to that URL

3. Build a production bundle:

```bash
npm run build
```

4. Run the built app:

```bash
npm start
```

> Note: `npm start` assumes you have already run `npm run build` so that the `dist` folder exists.

## Project structure

- `electron/main.js` – Electron main process
- `index.html` – root HTML loaded by Vite
- `src/` – React application
- `tailwind.config.cjs`, `postcss.config.cjs` – Tailwind / PostCSS config
- `vite.config.mjs` – Vite config
