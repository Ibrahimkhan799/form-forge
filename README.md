# FormForge

A high-performance no-code form builder inspired by Typeform, Google Forms, and Webflow. The interface follows a minimal Apple-inspired system: white cards, `#FBFBFD` page surfaces, `#007AFF` as the only accent, and 12px corners.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand with Immer and Zundo for undo/redo
- React Hook Form + Zod
- @dnd-kit for drag and drop
- Framer Motion, Recharts, Hugeicons, next-themes

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What is included

- Visual builder with a component library, canvas, and inspector
- Ten field types, including rating and file upload
- Undo/redo (`⌘Z` / `⇧⌘Z`), delete selected field, Escape to deselect
- Debounced autosave to `localStorage`
- Form theme engine (accent, radius, font, background style)
- Version snapshots and JSON Schema import/export
- Public Typeform-style player at `/f/[formId]`
- Analytics dashboard with completion rate, time series, and CSV export

Forms and submissions persist in the browser. A demo **Product feedback** form is seeded on first load.
