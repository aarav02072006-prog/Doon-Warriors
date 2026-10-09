# Project Brief: Meesho E-Commerce Platform ("Haat")

## Goals (judging criteria)
Website performance, product discovery, search + filtering + sorting + categorisation, product detail pages (images, pricing, description, ratings, reviews), REST API backend architecture, speed/scalability/SEO/accessibility, basic security for auth and user data, secure checkout.

## Bonus features (must build both)
1. **Concurrency-safe Flash Checkout**: inventory reservation; if many users buy the last unit at the same time, no overselling; inventory locked for a 3-minute checkout window.
2. **"Bharat Lite Mode"**: automatic + toggleable low-bandwidth mode (aggressive payload reduction, skeleton states, offline cart persistence, optimistic UI).

## Tech (free tiers only)
- **client/**: React 19 + Vite, JavaScript (no TypeScript), React Router (package "react-router", v7 library mode with createBrowserRouter), TanStack Query v5, Tailwind CSS v4 (via @tailwindcss/vite plugin and CSS @theme tokens, NO tailwind.config.js), lucide-react icons, @supabase/supabase-js v2 for auth only, idb-keyval for IndexedDB, vite-plugin-pwa. Deployed on Vercel.
- **server/**: Node 20+, Express 5, ES modules ("type":"module"), @supabase/supabase-js v2 with the SERVICE ROLE key (server only), zod, helmet, cors, compression, express-rate-limit, pino + pino-http. Deployed on Render (free web service).
- **supabase/**: SQL migrations (numbered files) + seed script. Postgres + Supabase Auth.
- No paid services. No Docker required.

## Folder structure
```
/
├─ client/
│  ├─ public/
│  └─ src/
│     ├─ app/          (router.jsx, providers.jsx, App layout)
│     ├─ pages/        (one folder per route: Home/, Category/, Search/, Product/, Cart/, Checkout/, Orders/, Account/, Auth/, NotFound/)
│     ├─ features/     (domain logic: catalog/, cart/, checkout/, auth/, lite-mode/, wishlist/, reviews/) — hooks, api calls, feature components
│     ├─ components/   (ui/ = design-system primitives; layout/ = Header, Footer, BottomNav)
│     ├─ lib/          (apiClient.js, supabase.js, format.js, storage.js)
│     └─ styles/       (index.css with @theme tokens)
├─ server/
│  └─ src/
│     ├─ config/       (env.js — validates env with zod and fails fast)
│     ├─ routes/       (thin: wire URL → controller)
│     ├─ controllers/  (parse/validate request, call service, send response)
│     ├─ services/     (business logic, DB access via supabase client / RPC)
│     ├─ middleware/   (auth, validate, errorHandler, notFound, rateLimit)
│     ├─ utils/        (ApiError, asyncHandler, pagination, cache)
│     ├─ app.js        (express app, no listen)
│     └─ index.js      (listen)
├─ supabase/ (migrations/, seed/)
├─ data/ (raw CSV goes here)
└─ docs/
```

## API conventions
- Base path: `/api/v1`
- JSON responses: `{ data, meta? }` on success and `{ error: { code, message, details? } }` on failure
- Proper HTTP status codes
- Cursor-less page/limit pagination with `meta { page, limit, total, totalPages }`

## Code rules
- Small single-purpose files (<200 lines)
- Named exports
- No dead code
- No console.log (use logger on server)
- All async errors go to central error handler
- Every env var documented in `.env.example`
- No secrets in client code (only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`)

## Design Direction — "Haat" (Indian market, editorial, warm)
- **Palette (CSS tokens)**:
  - `--paper` `#FBF6EF` (page bg)
  - `--card` `#FFFFFF`
  - `--ink` `#1C1622` (text)
  - `--ink-muted` `#6B6272`
  - `--line` `#ECE3D8`
  - `--brand` `#8E1F6F` (deep magenta, used sparingly: primary buttons, active states)
  - `--brand-soft` `#F6E4EF`
  - `--marigold` `#E9A23B` (deals, flash, highlights)
  - `--leaf` `#2E7D5B` (in-stock, success, ratings ≥4)
  - `--chilli` `#C2410C` (errors, low stock)
- Provide a dark theme via `prefers-color-scheme` with tuned equivalents.
- **Type**: "Bricolage Grotesque" (headings, 600–700) + "Figtree" (body 400/500/600), self-hosted with `@fontsource` (`font-display: swap`). Use tabular-nums for prices.
- **Shape**: 14px card radius, 999px chips, 1px `--line` borders instead of heavy shadows; one soft shadow only on hover/raised elements.
- **Signature details**: Prices shown as large ₹ amount + struck MRP + marigold "% off" tag; category tiles use tinted backgrounds with a large icon; subtle paper grain is NOT allowed (performance) — use flat color.
- **Motion**: 150–200ms ease-out, respect `prefers-reduced-motion`.
- **Mobile-first**: Bottom navigation bar on <768px (Home, Categories, Search, Cart, Account); sticky header with search on all sizes. Breakpoints: mobile <640, tablet 640–1023, desktop ≥1024. Min tap target 44px.
- **Accessibility**: WCAG AA contrast, visible focus rings (2px `--brand` offset 2px), semantic landmarks, labelled form controls.
