# Stash

**A calm inbox for things you don't want to lose.**

Stash is a personal content-saving platform that lets you capture links from anywhere on the web, automatically enrich them with metadata (title, description, preview image), and browse them in a beautiful, searchable dashboard. Save articles, videos, GitHub repos, social posts, and more — then find them again when you need them.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Metadata Scraping](#metadata-scraping)
- [Browser Extension](#browser-extension)
- [Deployment](#deployment)
- [Development](#development)
- [License](#license)

---

## Overview

Stash solves a common problem: you find something interesting online, open it in a new tab "to read later," and never see it again. Stash gives you a single place to save those links, automatically pulls in rich previews, and organizes everything so you can search and filter your collection effortlessly.

The product is built as a **monorepo** with four main components:

| Component | Description |
|-----------|-------------|
| **Web App** | React dashboard for browsing, searching, and managing saved items |
| **API Server** | Express backend for authenticated save/get/delete operations |
| **Worker** | Background job processor that scrapes URL metadata via Puppeteer |
| **Browser Extension** | Chrome extension for one-click saving from any tab |

Authentication is handled by **Supabase Auth** (email/password and Google OAuth). The web app reads and writes items directly to Supabase PostgreSQL, while the browser extension communicates with the Express API.

---

## Features

### Web Dashboard

- **Save links** — Paste any URL and Stash stores it instantly; metadata is fetched in the background.
- **Rich item cards** — Each saved link displays a title, description, preview image, and inferred content type.
- **Search** — Full-text search across titles, descriptions, and URLs.
- **Smart filtering** — Filter by content type: All, Videos, Articles, Code, or Social. Types are inferred automatically from the URL (e.g. YouTube → Video, GitHub → Code).
- **Compact view** — Toggle a compact grid layout that hides preview images.
- **Profile & settings** — View account details, adjust display preferences, and sign out.

### Authentication

- Email and password sign-up / sign-in
- Google OAuth
- Protected routes — unauthenticated users are redirected to the auth page
- Session sync to the browser extension after login

### Browser Extension

- **Quick Stash** — Save the currently active browser tab with one click
- **Manual entry** — Paste any URL from the popup
- **Session sharing** — After signing in on the web app, the extension receives the auth token automatically
- Duplicate detection — Saving an already-stashed URL shows a friendly message

### Background Processing

When a link is saved, Stash enriches it asynchronously by extracting Open Graph metadata (`og:title`, `og:description`, `og:image`) from the target page. Two processing paths exist:

1. **BullMQ Worker + Puppeteer** — Used when saving via the Express API (extension path)
2. **Supabase Edge Function** — Triggered by database webhooks on new item inserts (web app path)

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Browser        │     │  Web App         │     │  Chrome         │
│  Extension      │────▶│  (React/Vite)    │     │  Extension      │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                        │
         │ POST /save            │ Supabase Client        │ POST /save
         ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Express API    │     │  Supabase        │     │  Express API    │
│  (Port 3000)    │────▶│  PostgreSQL      │◀────│  (Port 3000)    │
└────────┬────────┘     └────────┬─────────┘     └─────────────────┘
         │                       │
         │ Enqueue job           │ DB webhook
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Redis          │     │  Supabase Edge   │
│  (BullMQ Queue) │     │  Function        │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Crawler Worker │     │  Cheerio Scraper │
│  (Puppeteer)    │     │                  │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
           ┌──────────────────┐
           │  Update item     │
           │  (title, desc,   │
           │   image, status) │
           └──────────────────┘
```

### Data Flow

1. **Web app save** — User pastes a URL → item inserted into Supabase `items` table with `is_processed: false` → Supabase webhook triggers the Edge Function → metadata scraped and item updated.

2. **Extension save** — User clicks "Stash Current Tab" → extension sends `POST /save` with Bearer token → API validates auth via Supabase, creates item in PostgreSQL via Prisma, enqueues a BullMQ job → worker scrapes the URL with Puppeteer and updates the item.

3. **Browse** — Web app queries Supabase directly for the authenticated user's items, sorted by creation date.

---

## Project Structure

```
stash/
├── prisma/
│   └── schema.prisma          # Database models (User, Item)
├── supabase/
│   └── functions/
│       └── scrape-metadata/   # Edge Function for URL metadata scraping
├── src/
│   ├── api/
│   │   ├── server.ts          # Express server entry point
│   │   ├── controllers/       # save, get, delete handlers
│   │   └── middlewares/       # Supabase JWT auth middleware
│   ├── workers/
│   │   ├── crawler.ts         # BullMQ worker entry point
│   │   └── scrapers/
│   │       └── baseScraper.ts # Puppeteer-based metadata scraper
│   ├── helper/
│   │   ├── createStash.ts     # BullMQ queue setup
│   │   └── initiatePrisma.ts  # Prisma client singleton
│   ├── config.ts              # Redis and queue configuration
│   ├── frontend/              # React web application
│   │   ├── src/
│   │   │   ├── pages/         # Dashboard, Auth, 404
│   │   │   ├── components/    # UI components (ItemCard, modals, shadcn/ui)
│   │   │   ├── integrations/  # Supabase client and types
│   │   │   └── lib/           # Utilities
│   │   └── vercel.json        # SPA routing for deployment
│   └── extension/             # Chrome browser extension
│       ├── manifest.json
│       └── src/
│           ├── App.tsx        # Extension popup UI
│           ├── background.ts  # Session sync service worker
│           └── config.ts      # API and website URLs
├── docker-compose.yml         # Local PostgreSQL and Redis
├── package.json               # Root scripts and backend dependencies
└── tsconfig.json
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js + TypeScript | Runtime and language |
| Express 5 | REST API server |
| Prisma | ORM for PostgreSQL |
| BullMQ | Job queue for async scraping |
| Redis | BullMQ connection backend |
| Puppeteer | Headless browser for metadata extraction |
| Supabase JS | Auth token verification |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| shadcn/ui + Radix UI | Component library |
| Framer Motion | Animations |
| React Router | Client-side routing |
| TanStack Query | Server state management |
| Supabase JS | Auth and direct database access |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Supabase | Auth, PostgreSQL, Edge Functions |
| Docker Compose | Local PostgreSQL and Redis |
| Vercel | Frontend deployment (SPA rewrites) |

### Browser Extension

| Technology | Purpose |
|------------|---------|
| React + Vite | Popup UI |
| Chrome Manifest V3 | Extension platform |
| Axios | API communication |

---

## Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for local PostgreSQL and Redis)
- **Supabase project** — [Create one](https://supabase.com/dashboard) for auth and database
- **Chrome browser** (for the extension)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/arsrivastawa/stash.git
cd stash
```

### 2. Install dependencies

```bash
# Root (API + worker)
npm install

# Frontend
cd src/frontend && npm install && cd ../..

# Extension
cd src/extension && npm install && cd ../..
```

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 4. Configure environment variables

Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

Create `src/frontend/.env` with your Supabase public keys:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_EXTENSION_ID=your-chrome-extension-id
```

### 5. Set up the database

```bash
npx prisma db push
npx prisma generate
```

In your Supabase dashboard, ensure the `users` and `items` tables exist with Row Level Security policies that restrict access to the authenticated user's own data.

### 6. Run the application

Open four terminal sessions:

```bash
# Terminal 1 — API server
npm run server

# Terminal 2 — Background worker
npm run worker

# Terminal 3 — Web app (http://localhost:8080)
npm run frontend

# Terminal 4 — Extension dev build
npm run extension
```

Load the extension in Chrome at `chrome://extensions` → Enable Developer Mode → Load unpacked → select `src/extension/dist`.

---

## Environment Variables

### Root `.env` (API + Worker)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/stash_db` |
| `SUPABASE_URL` | Supabase project URL | — |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | — |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `PORT` | API server port | `3000` |

### Frontend `src/frontend/.env`

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_EXTENSION_ID` | Chrome extension ID (for session sync) |

### Supabase Edge Function (set in Supabase dashboard)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Auto-injected by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected by Supabase |

---

## Running the Application

| Command | Description | Port |
|---------|-------------|------|
| `npm run server` | Start the Express API | 3000 |
| `npm run worker` | Start the BullMQ crawler worker | — |
| `npm run frontend` | Start the Vite dev server | 8080 |
| `npm run extension` | Build/watch the Chrome extension | — |

---

## API Reference

All protected endpoints require an `Authorization: Bearer <supabase-jwt>` header.

### `GET /`

Health check. Returns `"Stash Queue API is running"`.

### `POST /save`

Save a URL to the user's stash.

**Request body:**

```json
{
  "url": "https://example.com/article"
}
```

**Responses:**

| Status | Body | Meaning |
|--------|------|---------|
| `201` | `{ "status": "queued", "jobId": "..." }` | New item created and scraping job enqueued |
| `200` | `{ "status": "exists", "itemId": "..." }` | URL already saved by this user |
| `400` | `{ "error": "URL is required" }` | Missing URL |
| `401` | `{ "error": "..." }` | Invalid or missing auth token |

### `GET /get`

Retrieve all items for the authenticated user, ordered by creation date (newest first).

**Response:** `200` with a JSON array of item objects.

### `POST /delete`

Delete an item by ID. Users can only delete their own items.

**Request body:**

```json
{
  "id": "item-uuid"
}
```

**Responses:**

| Status | Meaning |
|--------|---------|
| `200` | Item deleted successfully |
| `403` | Item belongs to another user |
| `404` | Item not found |

---

## Database Schema

### User

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (UUID) | Matches Supabase Auth user ID |
| `email` | String | User email (unique) |
| `name` | String? | Display name (optional) |
| `created_at` | DateTime | Account creation timestamp |

### Item

| Column | Type | Description |
|--------|------|-------------|
| `id` | String (UUID) | Primary key |
| `original_url` | String | The saved URL |
| `user_id` | String (UUID) | Foreign key to User |
| `title` | String? | Scraped page title |
| `description` | String? | Scraped page description |
| `image_url` | String? | Scraped preview image URL |
| `is_processed` | Boolean | Whether metadata scraping is complete |
| `created_at` | DateTime | When the item was saved |
| `updated_at` | DateTime | Last metadata update |

**Constraints:** Unique on `(user_id, original_url)` — each user can save a given URL only once.

---

## Metadata Scraping

Stash extracts page metadata using Open Graph tags, with fallbacks to standard HTML meta tags.

### Puppeteer Worker (API path)

Used when items are saved through the Express API (browser extension):

1. Job added to the `stash-queue` BullMQ queue
2. Worker launches headless Chrome via Puppeteer
3. Page loaded with a realistic User-Agent
4. Extracts `og:title`, `og:description`, `og:image` (falls back to `<title>` and `<meta name="description">`)
5. Updates the item in PostgreSQL and sets `is_processed: true`

### Supabase Edge Function (Web app path)

Used when items are inserted directly via the Supabase client (web dashboard):

1. Database webhook fires on new `items` row
2. Edge Function fetches the URL HTML with a browser-like User-Agent
3. Parses metadata with Cheerio
4. Updates the row via the Supabase service role client

---

## Browser Extension

### Setup

1. Build the extension: `npm run extension`
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select `src/extension/dist`
5. Copy the extension ID from the extensions page
6. Set `VITE_EXTENSION_ID` in `src/frontend/.env` to that ID
7. Sign in on the web app — the session token syncs to the extension automatically

### How Session Sync Works

When a user signs in on the web app (`localhost:8080`), the frontend sends a `SYNC_SESSION` message to the extension via `chrome.runtime.sendMessage`. The extension's background service worker stores the Supabase session in `chrome.storage.local`. The popup then reads this token for authenticated API calls.

Trusted origins are configured in both `manifest.json` (`externally_connectable`) and `background.ts`.

### Extension Configuration

Update `src/extension/src/config.ts` for your environment:

```typescript
export const WEBSITE_URL = 'http://localhost:8080';
export const API_URL = 'http://localhost:3000';
```

---

## Deployment

### Frontend (Vercel)

The web app includes a `vercel.json` with SPA rewrites so client-side routing works in production. Set the `VITE_*` environment variables in your Vercel project settings.

```bash
cd src/frontend
npm run build
```

### API + Worker

Deploy the Express server and BullMQ worker as separate processes or containers. Ensure they share access to the same PostgreSQL database and Redis instance.

### Supabase Edge Function

Deploy the metadata scraper:

```bash
supabase functions deploy scrape-metadata
```

Configure a database webhook on the `items` table (INSERT event) pointing to this function.

### Browser Extension

Build for production and publish to the Chrome Web Store:

```bash
cd src/extension
npm run build
```

Update `config.ts` with production API and website URLs before building.

---

## Development

### Content Type Inference

The dashboard automatically categorizes saved links based on URL patterns:

| Pattern | Type |
|---------|------|
| `youtube.com`, `youtu.be`, `vimeo` | Video |
| `github.com`, `gitlab`, `stackoverflow` | Code |
| `twitter.com`, `x.com`, `instagram`, `linkedin`, `reddit` | Social |
| Everything else | Article |

### Key Design Decisions

- **Dual save paths** — The web app writes directly to Supabase for instant feedback; the extension goes through the Express API for queue-based processing. Both paths converge on the same `items` table.
- **Optimistic UI** — Deleting an item removes it from the grid immediately; the request is reverted if the server call fails.
- **Per-user isolation** — All queries and mutations are scoped to the authenticated user's ID. The API enforces ownership on delete operations.

### Useful Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to the database
npx prisma db push

# Open Prisma Studio to inspect data
npx prisma studio

# Lint the frontend
cd src/frontend && npm run lint
```

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2025 Aditya Ranjan
