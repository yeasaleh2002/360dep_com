# 360DEP — 360dep.com

Event-management website with a built-in admin panel.
Bangla-first (English toggle) · light/dark mode · runs on **Cloudflare's free plan**.

| | |
|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Hosting** | Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare), free plan |
| **Database** | Neon Postgres + Drizzle ORM — 6 tables, all prefixed `360dep_` |
| **Images** | ImgBB (hosting) + wsrv.nl (per-screen resizing), both free |
| **Caching** | Tag-based ISR — pages rebuild only when the admin changes something |
| **Styling** | Tailwind CSS · Framer Motion · next-themes |

> New developer? Read **[DEVELOPER_INSTRUCTIONS.md](DEVELOPER_INSTRUCTIONS.md)** — architecture, environment variables, database, full API reference and deployment.

## Features

**Public site** (Bangla by default, English button in the header)
- **Home:** banner slider → about → services → team (when added) → client logos + feedback → 4 gallery highlights → contact form → footer
- **Pages:** About, Services, Gallery (category filter, photo viewer, YouTube), Clients (logos + feedback), Contact
- **Contact form:** saves the enquiry, then opens WhatsApp with the details filled in
- **Phones/tablets:** fixed bottom bar with **Services** and **WhatsApp**
- **Local SEO:** a page for each district (Jashore, Jhenaidah, Magura, Satkhira, Khulna, Narail, Bagerhat, Kushtia, Chuadanga, Meherpur) in Bangla + English, business structured data, ~1,000 bilingual keywords, sitemap
- **Installable app (PWA):** "Download the app" button in the footer, offline page, home-screen icon
- **Footer "Admin login":** asks for the email first; only the admin email continues to the login page
- Unknown URLs redirect to the home page

**Admin panel** (`/admin`) — plain-language screens for a non-technical owner
- **Enquiries:** contact-form messages; mark New / Contacted / Closed; one-tap WhatsApp reply
- **Banners, Services, Team, Clients (with optional feedback), Gallery:** add, edit, hide, delete, drag to reorder, upload photos
- Changes appear on the public site immediately

## Quick start

```bash
npm install
cp .env.example .env                       # fill in the values
npm run db:apply -- drizzle/0000_init.sql  # only for a brand-new, empty database
npm run dev                                # http://localhost:3000 · admin: /admin
```

Admin login: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (plain text) in `.env`. To change the password later, just edit it and redeploy.

## Deploy (Cloudflare, free)

```bash
npx wrangler login
npx wrangler secret put DATABASE_URL                  # …and the other secrets (see instructions)
npm run build && npm run deploy   # first deploy creates the free KV + D1 cache storage automatically
```

**Auto-deploy from GitHub (Workers Builds):** create a **Worker** (not Pages) from the repo, keep Build command `npm run build`, set Deploy command to **`npm run deploy`**, and add `DATABASE_URL` + the `NEXT_PUBLIC_*` values as **build variables**.

Step-by-step: **DEVELOPER_INSTRUCTIONS.md → Deploy to Cloudflare**.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Cloudflare build (Next.js + OpenNext → `.open-next/`) |
| `npm run build:next` | Plain Next.js build (quick check) |
| `npm run preview` | Run the last build locally in the Workers runtime |
| `npm run deploy` | Deploy the last build (creates KV + D1 on first run) |
| `npm run db:generate` | Write a SQL file for schema changes in `lib/db/schema.ts` |
| `npm run db:apply -- drizzle/<file>.sql` | Run one SQL file against `DATABASE_URL` |
| `npm run db:studio` | Browse the database |
| `npm run check-secrets` | Fail if any key/password/DB URL is in the code — run before every push |
| `npm run typecheck` | TypeScript check |

## Security

Signed-JWT admin sessions in httpOnly + Secure + SameSite=Strict cookies · admin password compared in constant time, sessions revoked when it changes · Cloudflare Turnstile on login and contact form · Cloudflare rate limiting (login 5/min, contact 3/min per IP) · Zod validation on every API · parameterised SQL only · CSRF origin checks · CSP, HSTS and other security headers · uploads verified by real file bytes · no secrets in code.
