# FormForge

A compact no-code form builder with conversational and classic form layouts,
content layers, rich text, theming, uploads, and response analytics.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand with Immer and Zundo for undo/redo
- React Hook Form + Zod
- @dnd-kit for drag and drop
- Framer Motion, Recharts, Hugeicons, next-themes
- Supabase Postgres, Auth, and Storage with offline local fallback

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase setup

1. Create a Supabase project.
2. Enable **Anonymous Sign-Ins** under Authentication → Providers.
3. Run `supabase/schema.sql` in the SQL Editor.
4. Add the project URL and publishable key to `.env.local`.

When Supabase is not configured or temporarily unavailable, FormForge continues
using localStorage and IndexedDB. Once configured, local forms are synchronized
to Postgres and new assets are uploaded to Supabase Storage.

## What is included

- Visual builder with a component library, canvas, and inspector
- Ten answer fields plus Image and Rich Text content layers
- Undo/redo (`⌘Z` / `⇧⌘Z`), delete selected field, Escape to deselect
- Debounced autosave to `localStorage`
- Form theme engine with separate body/heading Google Fonts
- Version snapshots and JSON Schema import/export
- Public Typeform-style player at `/f/[formId]`
- Analytics dashboard with completion rate, time series, and CSV export

Forms, submissions, visits, and uploads sync with Supabase when configured. A
demo **Product feedback** form is seeded on first load.
