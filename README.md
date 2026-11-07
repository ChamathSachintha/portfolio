# Personal portfolio

React, Vite, TypeScript, Tailwind CSS, and React Router foundation for a personal portfolio with a separate university practical-session journal.

## Status

The frontend foundation and homepage implementation are in place. The university journal includes a Supabase-backed weekly entry CMS with draft/publish workflows, editable module settings, optional facilitator details, and ordered media/content sections.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- npm
- Supabase PostgreSQL, Auth, and Storage for the university journal

Sanity CMS is not used for the journal. Cloudflare Pages is the planned hosting target.

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

## Routes

- `/`
- `/about`
- `/projects`
- `/gallery`
- `/contact`
- `/university-journal`
- `/university-journal/:slug`
- `/journal-admin/login`
- `/journal-admin`
- `/journal-admin/settings`

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
