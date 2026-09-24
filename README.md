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

Admin password hash: `npm run hash-password -- "a-long-strong-password"` → paste the printed line into `.env`.

## Deploy (Cloudflare, free)

```bash
npx wrangler login
npx wrangler kv namespace create NEXT_INC_CACHE_KV    # paste id into wrangler.jsonc
npx wrangler d1 create dep360-tag-cache               # paste database_id into wrangler.jsonc
npx wrangler secret put DATABASE_URL                  # …and the other secrets (see instructions)
npm run deploy
```

Step-by-step: **DEVELOPER_INSTRUCTIONS.md → Deploy to Cloudflare**.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Next.js production build (quick check) |
| `npm run preview` | Build for Cloudflare and run locally in the Workers runtime |
| `npm run deploy` | Build for Cloudflare and deploy |
| `npm run db:generate` | Write a SQL file for schema changes in `lib/db/schema.ts` |
| `npm run db:apply -- drizzle/<file>.sql` | Run one SQL file against `DATABASE_URL` |
| `npm run db:studio` | Browse the database |
| `npm run hash-password -- "pw"` | Generate `ADMIN_PASSWORD_HASH` |
| `npm run check-secrets` | Fail if any key/password/DB URL is in the code — run before every push |
| `npm run typecheck` | TypeScript check |

## Security

Signed-JWT admin sessions in httpOnly + Secure + SameSite=Strict cookies · PBKDF2 password hashing · Cloudflare Turnstile on login and contact form · Cloudflare rate limiting (login 5/min, contact 3/min per IP) · Zod validation on every API · parameterised SQL only · CSRF origin checks · CSP, HSTS and other security headers · uploads verified by real file bytes · no secrets in code.
