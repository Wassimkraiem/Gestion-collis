# Colissimo Management System – Agent Instructions

This document guides AI coding agents working on the Colissimo Management System, a Next.js application for managing Colissimo Tunisia delivery parcels.

## Project Overview

- **Purpose**: Full CRUD management of Colissimo Tunisia parcels with status tracking, search, Excel import, PDF generation, and SOAP API integration.
- **Language**: French UI, English code and comments.
- **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.

## Dev Environment Tips

- Use `npm run dev` to start the development server (Next.js).
- The app runs at `http://localhost:3000`. Login is required for dashboard access.
- Environment variables live in `.env.local` (never commit this file). Required: `COLISSIMO_USERNAME`, `COLISSIMO_PASSWORD`, `COLISSIMO_WSDL_URL`, `NEXT_PUBLIC_AUTH_USERNAME`, `NEXT_PUBLIC_AUTH_PASSWORD`.
- Use `@/` path alias for imports (e.g. `@/components/Sidebar`, `@/lib/soap-client`).
- The SOAP client is cached in `lib/soap-client.ts`; call `clearClientCache()` when credentials or WSDL change.

## Build & Test Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

- Run `npm run lint` before committing.
- After moving files or changing imports, run `npm run lint` to catch broken paths.

## Project Structure

```
colissimo-app/
├── app/
│   ├── (dashboard)/           # Dashboard routes (layout with Sidebar)
│   │   ├── page.tsx           # All parcels
│   │   ├── en-attente/        # Status-filtered views
│   │   ├── en-livraison/
│   │   ├── livre/
│   │   └── ...                # Other status routes
│   ├── api/colissimo/         # API routes (SOAP-backed)
│   │   ├── add/route.ts
│   │   ├── update/route.ts
│   │   ├── delete/route.ts
│   │   ├── list/route.ts
│   │   ├── search/route.ts
│   │   ├── detail/route.ts
│   │   ├── valider/route.ts
│   │   ├── bulk-import/route.ts
│   │   ├── stats/route.ts
│   │   ├── gouvernorats/route.ts
│   │   └── pdf/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ColisForm.tsx          # Add/Edit form
│   ├── ColisTable.tsx         # Table view
│   ├── ColisListView.tsx      # List view
│   ├── SearchBar.tsx
│   ├── Sidebar.tsx            # Status navigation
│   ├── DeleteConfirmModal.tsx
│   ├── ColisDetailModal.tsx
│   ├── DeliveryDetailsModal.tsx
│   ├── ExcelImportModal.tsx
│   ├── ColisPrintView.tsx
│   ├── AuthProvider.tsx
│   └── ...
├── lib/
│   ├── soap-client.ts         # SOAP client (cached)
│   ├── auth.ts                # Simple credential auth
│   └── parse-soap-response.ts
└── types/
    └── colissimo.ts           # Colis, ColisFormData, ApiResponse
```

## Tech Stack & Conventions

- **Next.js 16** with App Router. Use `'use client'` only when needed (e.g. hooks, event handlers).
- **TypeScript**: Prefer explicit types for API responses and Colis data. Use `types/colissimo.ts` interfaces.
- **Tailwind CSS 4**: Use utility classes. Responsive: `lg:`, `xl:` prefixes. Custom classes in `globals.css`.
- **Icons**: Lucide React (`lucide-react`).
- **HTTP**: Axios for client requests; `fetch` or Axios in API routes as appropriate.
- **SOAP**: `node-soap` for Colissimo API. Auth via SOAP header (`Uilisateur`, `Pass`).

## Colis Data Model

- Core fields: `reference`, `client`, `adresse`, `ville`, `gouvernorat`, `tel1`, `designation`, `prix`, `nb_pieces`, `type` (`VO`|`EC`|`DO`), `echange` (0|1).
- Optional: `tel2`, `commentaire`, `cod`, `poids`, `echange_lie`.
- Status/state: `statut`, `etat`, `numero_colis`, `agence_actuelle`, `anomalie`, `cause_anomalie`, etc.

## API Integration

- All Colissimo operations go through `/api/colissimo/*` routes.
- Routes call `getSOAPClient()` from `lib/soap-client.ts` and use `lib/parse-soap-response.ts` for parsing.
- Standard response shape: `{ success: boolean, data?: T, error?: string, message?: string }`.

## Authentication

- Simple credential auth via `lib/auth.ts` (env vars `NEXT_PUBLIC_AUTH_USERNAME`, `NEXT_PUBLIC_AUTH_PASSWORD`).
- Session stored in `localStorage` + `sessionStorage`, valid 24h.
- `AuthProvider` wraps the app; dashboard layout checks auth and redirects to `/login` when needed.

## Coding Conventions

- Use functional components and hooks.
- Keep API routes thin: business logic in `lib/` when reusable.
- Handle errors in API routes and return `{ success: false, error: string }`.
- Use French for user-facing strings (labels, messages, placeholders).
- Prefer `async/await` over raw Promises.

## Project-Specific Boundaries

- Do not expose Colissimo credentials or WSDL URL in client code.
- Do not bypass auth for dashboard routes.
- Preserve Colissimo API field names and types when adding or changing Colis fields.
- When adding new status views, update `Sidebar` and dashboard layout `getStatusFromPath`.
- Excel import uses `xlsx`; PDF generation uses the `/api/colissimo/pdf` route.

## PR / Commit Guidelines

- Run `npm run lint` before committing.
- Title format: `[scope] description` (e.g. `[api] fix SOAP auth header`).
- Add or update tests for significant changes when applicable.
