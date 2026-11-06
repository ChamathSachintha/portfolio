# Personal portfolio

React, Vite, TypeScript, Tailwind CSS, and React Router foundation for a personal portfolio with a separate university practical-session journal.

## Status

The frontend foundation and the first homepage implementation are now in place. The homepage uses Chamath Sachintha's supplied professional information and the approved dark charcoal/lime visual direction. Other portfolio pages remain placeholders until their respective implementation phases.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- npm

Sanity CMS and Cloudflare Pages are planned for later phases. No CMS or custom backend is configured yet.

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
```

## Routes

- `/`
- `/about`
- `/projects`
- `/gallery`
- `/contact`
- `/university-journal`
- `/university-journal/:slug`

## Project structure

```text
src/
├── app/       # Application and route setup
├── components/ # Shared visual components
├── layouts/   # Site-wide layout composition
├── pages/     # Route-level page placeholders
└── styles/    # Global CSS and Tailwind entry point
```

Design tokens are defined in `tailwind.config.ts` from `DESIGN_REFERENCE.md`. Personal content, approved assets, animations, and CMS integration are not included in this foundation.

## Git and environment hygiene

Do not commit `node_modules`, build output, or `.env` files. Use `.env.example` only for documenting future public configuration names; Vite `VITE_*` values are public in the browser bundle and must never contain secrets.
