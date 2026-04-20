# Recipe Tracker

A simple tool to track recipes and plan what to make for breakfast, lunch, and dinner.

## Features

- Create, view, and manage recipes
- Ingredients and tags for each recipe
- Mark favorites and track basic metadata (rating, last made, times included)
- Weekly schedule planning
- Shopping lists generated from planned meals

## Tech stack

- Next.js (App Router)
- TypeScript
- Prisma + SQLite
- Tailwind CSS

## Setup

Requirements: Node.js and npm.

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure environment

   Create a `.env` file (if needed). This app uses Prisma with SQLite.

3. Set up the database

   ```bash
   npx prisma migrate dev
   ```

4. Run the app

   ```bash
   npm run dev
   ```

Then open `http://localhost:3000`.

## Project structure

- `app/`
  - `actions/` Server actions
  - `api/` Route handlers
  - `dashboard/` Dashboard pages
  - `recipes/` Recipe pages
  - `schedules/` Schedule pages
  - `shopping/` Shopping list pages
  - `layout.tsx` App layout
  - `globals.css` Global styles
- `components/` Shared React components
- `lib/` Shared utilities (including Prisma client)
- `prisma/` Prisma schema and migrations
- `types/` Shared TypeScript types

## Scripts

- `npm run dev` Start the dev server
- `npm run build` Build for production
- `npm run start` Start the production server
- `npm run lint` Run ESLint
