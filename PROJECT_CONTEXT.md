# Restaurant Web Frontend – Project Context

## Assignment

Challenge 9 – Restaurant Web Frontend (Next.js + TypeScript)

## Tech Stack (Wajib)

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Redux Toolkit (client/UI state only)
- TanStack Query (server state)
- Axios
- Day.js

## Backend

- Base URL: https://restaurant-be-400174736012.asia-southeast2.run.app
- All API requests MUST start with `/api/...` (avoid double `/api`)

## API Scope (Swagger Summary)

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- PUT /api/auth/profile

### Cart

- GET /api/cart
- POST /api/cart
- PUT /api/cart/{id}
- DELETE /api/cart/{id}
- DELETE /api/cart

### Orders

- POST /api/order/checkout (not from cart)
- GET /api/order/my-order

### Reviews (OPTIONAL / Post-MVP)

- POST /api/review
- GET /api/review/my-reviews
- GET /api/review/restaurant/{restaurantId}
- PUT /api/review/{id}
- DELETE /api/review/{id}

## State Separation Rules

- Server state (React Query):
  - menus / restaurants
  - auth profile
  - cart data
  - orders
- Client/UI state (Redux):
  - filters, sort, search
  - modal/drawer state
  - cart UI helpers (optimistic flags, temp qty)
- Redux MUST NOT store authoritative server data.

## MVP Scope

- Auth (login minimal)
- Menu list (home)
- Filter, sort, search (client-side)
- Cart (server-backed, optimistic UI)
- Checkout (via `/api/order/checkout`)
- Order history (via `/api/order/my-order`)

## Project Rules

- Jangan ubah setup awal project
- Modifikasi hanya di folder `src/` dan `public/`
- No hard-coded API URL
- Mobile-first responsive
- Accessibility basic (alt, focus, contrast)

## Locked Paths (DO NOT CHANGE)

- Redux store: src/lib/store.ts
- React Query client: src/lib/react-query.ts
- Axios client: src/services/api/axios.ts
- Query hooks: src/services/queries/\*
- Redux slices: src/features/\*
  - Cart slice: src/features/cart/cartSlice.ts (UI-only, NO API)
  - Filters slice: src/features/filters/filtersSlice.ts
- Shared types: src/types/\*
- Shared utils: src/lib/utils.ts
- Providers entry (App Router): src/app/providers.tsx

## Architecture Decisions

- Menus filtering: client-side based on Redux state
- React Query for ALL server data (no Redux for server data)
- Redux only for UI/client state
- API calls only inside services/queries layer
- Auth token attached via Axios interceptor (detail decided in Auth session)

## Quality Guardrails (Anti Chaos Rules)

- Satu sesi = satu fokus fitur
- Maksimal 3–6 file baru per sesi
- Page (`app/*/page.tsx`) tidak boleh jadi god component
- Semua domain types hanya di `src/types/`
- Semua helper/formatter lewat `src/lib/utils.ts`
- Import path wajib pakai alias `@/`
- Jangan campur CSR/SSR tanpa alasan jelas

## Definition of Done (Per Sesi)

Sebuah sesi dianggap SELESAI jika:

- `npm run dev` jalan tanpa error
- Tidak melanggar Locked Paths
- Tidak ada hard-coded API URL
- State sesuai aturan (Redux vs React Query)
- Bagian `Current Status` di-update

## Environment Rules (Next.js)

- Gunakan `.env.local`
- Client-side env wajib prefix `NEXT_PUBLIC_`
- DILARANG pakai `VITE_`

## Git Discipline

- Commit minimal setiap selesai satu sesi
- Commit message deskriptif (contoh: `session-a: setup providers`)
- Hindari commit besar tanpa fokus

## Stop Rule (Wajib Dipatuhi)

Hentikan pengerjaan dan rapikan terlebih dahulu jika:

- Bingung file mana yang aktif
- Import path mulai acak
- State terasa tumpang tindih
- Page/component mulai terlalu besar

Rapikan struktur → cek dokumen ini → baru lanjut.

## Current Status

- Project setup: DONE (Session A1)
- Auth: NOT STARTED
- Menu list: NOT STARTED
- Search & filter: NOT STARTED
- Cart: NOT STARTED
- Checkout: NOT STARTED
- Order history: NOT STARTED
