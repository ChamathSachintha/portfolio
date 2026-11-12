# Personal portfolio

React, Vite, TypeScript, Tailwind CSS, and React Router foundation for a personal portfolio with a separate university practical-session journal.

## Status

The portfolio and university journal use a Supabase-backed CMS. The journal includes weekly entry draft/publish workflows; the portfolio includes project case studies, private screenshot media, and optional homepage featured-project management.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- npm
- Supabase PostgreSQL, Auth, and Storage for the university journal

Sanity CMS is not used. Cloudflare Pages is the planned hosting target.

## University Journal architecture

The public journal reads published content from Supabase. Authorized administrators use the protected CMS routes to manage the singleton module settings, journal entries, private gallery assets, thumbnails, captions, ordering, and optional facilitator photographs. Supabase Auth, PostgreSQL RLS, and private Storage policies are the authorization boundaries; the browser client never uses a service-role key.

Required browser configuration:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

These are public frontend variables, not secrets. Do not place service-role keys or passwords in Vite environment variables.

## Getting started

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

The development server will print its local URL. Production output is generated in `dist`:

```bash
npm run build
npm run preview
```

## Validation

```bash
npm run lint
npm run build
git diff --check
```

## Cloudflare Pages deployment

Use the following build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20 or newer

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Cloudflare Pages preview and production environment settings. Verify client-side deep-link refreshes after connecting the Pages project, especially for `/university-journal/:slug` and `/journal-admin/*`.

The Contact page uses `functions/api/contact.ts` when Cloudflare Pages is configured. Add `VITE_TURNSTILE_SITE_KEY` as a public build variable and configure these server-side variables in both Preview and Production: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_EMAIL_TO=chamath@merae.lk`, and a separately verified `CONTACT_EMAIL_FROM`. Until Turnstile and the email provider are configured and tested, the direct `mailto:chamath@merae.lk` link remains the working contact method.

## Routes

- `/`
- `/about`
- `/projects`
- `/projects/:slug`
- `/gallery`
- `/contact`
- `/university-journal`
- `/university-journal/projects/turtle-conservation`
- `/university-journal/:slug`
- `/journal-admin/login`
- `/journal-admin`
- `/journal-admin/settings`
- `/portfolio-admin/projects`
- `/portfolio-admin/projects/new`
- `/portfolio-admin/projects/:id/edit`
- `/portfolio-admin/featured`
- `/admin/login`
- `/admin`

The shared admin entry point is `/admin`. It uses the existing Supabase administrator check and provides access to both the University Journal CMS and Software Projects CMS. The older `/journal-admin/*` URLs remain available for compatibility.

## Software Projects CMS

The project CMS uses the existing Supabase administrator identity (`journal_admins`) and does not add a second login system. Project content is stored in `portfolio_projects` with ordered technology, feature, and custom-section child tables. Published projects are readable publicly; drafts and all write operations remain administrator-only through RLS.

Project screenshots use the separate private `portfolio-project-assets` bucket and are stored under `projects/{projectId}/screenshots/{uniqueFileName}`. The editor supports multiple uploads, captions, alternative text, hero/screenshot classification, and safe deletion cleanup.

Homepage featured projects are stored in `portfolio_featured_projects`, with positions 1–3 enforced by database constraints and the `save_portfolio_featured_projects` RPC. The homepage now reads only published CMS featured projects; it does not fall back to hardcoded project cards.

### Migration order

Do not run migrations automatically from the frontend. Apply the existing journal migrations first, then `supabase/migrations/20261110_portfolio_projects.sql` in Supabase SQL Editor. Confirm the RLS policies and private storage bucket before selecting homepage featured content.

The new migration creates the project tables, indexes, RLS policies, atomic featured-project RPC, and private storage bucket. Live authenticated upload, publishing, and RLS verification still require the migration to be applied and an administrator account to be available.

## Project structure

```text
src/
├── app/       # Application and route setup
├── components/ # Shared visual components
├── layouts/   # Site-wide layout composition
├── pages/     # Route-level page placeholders
├── services/  # Supabase journal data and media operations
├── types/     # Journal data contracts
└── styles/    # Global CSS and Tailwind entry point
```
