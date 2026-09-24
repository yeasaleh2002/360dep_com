# Developer Instructions — 360DEP

Everything a new developer needs to understand, run, change and deploy this project.
Read top to bottom once; afterwards use it as a reference.

**Contents**
1. [Architecture in one picture](#1-architecture-in-one-picture)
2. [Folder structure](#2-folder-structure)
3. [Environment variables](#3-environment-variables)
4. [Database](#4-database)
5. [Caching — tag-based ISR](#5-caching--tag-based-isr)
6. [Images](#6-images)
7. [Authentication & security](#7-authentication--security)
8. [API reference](#8-api-reference)
9. [Language (Bangla / English)](#9-language-bangla--english)
10. [Deploy to Cloudflare](#10-deploy-to-cloudflare)
11. [Common tasks (how do I…?)](#11-common-tasks-how-do-i)
12. [Troubleshooting](#12-troubleshooting)
13. [Free-plan limits](#13-free-plan-limits)
14. [SEO & local search](#14-seo--local-search)

---

## 1. Architecture in one picture

```
Visitor ──► Cloudflare edge (Worker, OpenNext)
              │
              ├── static assets (JS/CSS/fonts) ─────────── Cloudflare CDN (free)
              ├── public pages ──► KV page cache ──(hit)──► instant response
              │                      └─(miss / tag revalidated)─► render ─► Neon Postgres
              ├── /admin/* pages ─► middleware (JWT check) ─► render live from Neon
              └── /api/* ─────────► route handlers ─► Zod validation ─► Drizzle ─► Neon
                                                   └─► revalidateTag() ─► D1 tag cache

Images:  admin browser (resize + WebP) ─► /api/upload (verify) ─► ImgBB  ─► URL stored in DB
         visitor ◄── wsrv.nl (resized per screen width) ◄── ImgBB
```

**Key decisions (and why)**

| Decision | Why |
|---|---|
| Cloudflare Workers + OpenNext | Free, global, auto-scaling. OpenNext is the official way to run Next.js there. |
| Drizzle ORM + Neon **HTTP** driver | Tiny bundle (fits the free 3 MB limit), no TCP sockets or connection pools, safe parameterised SQL. Prisma was dropped: too large for the free Worker size limit. |
| PBKDF2 (Web Crypto) for the admin password | bcrypt in JavaScript takes ~250 ms of CPU; the free plan allows ~10 ms per request. PBKDF2 is native and takes ~4 ms. |
| Image resize in the browser | Workers can't run native image libraries (sharp). The server still verifies every file. |
| wsrv.nl image resizer | Next's image optimiser doesn't run on Workers and Cloudflare Images is paid. wsrv.nl is free and needs no key. |
| KV + D1 for the cache | Both are free and need no payment method (R2 needs a card on file). |
| Cloudflare Rate Limiting binding | Free, built into Workers, no database table. In-memory limiters (like `express-rate-limit`) don't work on Workers because every location is a separate process. |

---

## 2. Folder structure

```
app/
  (public)/                 public site — layout.tsx adds header, footer, mobile action bar
    page.tsx                home (banner → about → services → team → clients → gallery → contact)
    about/ services/ gallery/ clients/ contact/
    areas/                  service-area index + one page per district (/areas/jashore …)
  admin/
    login/page.tsx          sign-in
    (panel)/                everything behind login (layout checks the session)
      dashboard/ leads/ banners/ services/ team/ clients/ gallery/
  api/                      route handlers — see section 8
  layout.tsx                root: fonts, theme, language, Clarity analytics
  not-found.tsx             unknown URL → redirect to home
components/
  public/                   site components (hero, cards, contact form, gallery, …)
  admin/                    admin UI (resource manager, forms, uploads, leads table, …)
  ui/                       shared bits (logo, icons, toggles, reveal animation, Turnstile)
lib/
  db/schema.ts              ★ database tables (Drizzle)
  db/index.ts               database client (getDb)
  data.ts                   ★ cached public queries + cache tags
  crud.ts                   generic admin CRUD route factory
  resources.ts              per-collection config (table, schema, cache tag)
  validators.ts             ★ Zod schemas for every input (shared by forms and APIs)
  auth.ts                   JWT sign/verify (edge-safe)
  password.ts               PBKDF2 hashing
  ratelimit.ts              rate limits (Cloudflare binding; in-memory fallback for local dev)
  imgbb.ts                  upload verification + ImgBB upload
  image-presets.ts          image sizes/quality (shared browser/server)
  image-loader.ts           next/image → wsrv.nl
  turnstile.ts              bot-check verification
  whatsapp.ts               wa.me link builders
  i18n/                     bn.json, en.json, provider + <T> component
  seo/                      district list, keyword generator, district page copy, JSON-LD
drizzle/                    SQL for the schema (0000_init.sql = full schema for a new database)
scripts/                    apply-sql, hash-password, check-secrets
middleware.ts               protects /admin/* and admin APIs
open-next.config.ts         OpenNext cache setup (KV + D1)
wrangler.jsonc              Cloudflare Worker config (no secrets)
```

---

## 3. Environment variables

Local values go in **`.env`** (gitignored). **`.env.example`** lists the names with empty values. Never put real values in it.
In production, set them in Cloudflare (see section 10).

| Variable | Secret? | Needed at | What it is / how to get it |
|---|---|---|---|
| `DATABASE_URL` | **yes** | build + runtime | Neon connection string: Neon dashboard → your project → **Connect**. One URL is all you need (see note below). |
| `JWT_SECRET` | **yes** | runtime | Random string ≥ 32 chars that signs admin sessions. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Changing it signs everyone out. |
| `ADMIN_EMAIL` | no | runtime | Email used to sign in to `/admin`. |
| `ADMIN_PASSWORD_HASH` | **yes** | runtime | `npm run hash-password -- "strong-password"`. Never store the plain password. |
| `IMGBB_API_KEY` | **yes** | runtime | Free key from <https://api.imgbb.com> (sign in → "Get API key"). |
| `TURNSTILE_SECRET_KEY` | **yes** | runtime | Cloudflare Turnstile secret (free, see below). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no | **build** | Turnstile site key (public by design). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | **build** | Digits only with country code, e.g. `8801XXXXXXXXX`. |
| `NEXT_PUBLIC_WHATSAPP_PROFILE_LINK` | no | **build** | Optional, e.g. `https://wa.me/qr/XXXX`. Used by general "chat" buttons when set. |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | no | **build** | Microsoft Clarity project id (free analytics). Not loaded on `/admin`. |
| `NEXT_PUBLIC_SITE_URL` | no | build | `https://360dep.com` (canonical URLs, sitemap). |

**`NEXT_PUBLIC_*` values are baked into the JavaScript at build time.** After changing one, rebuild and redeploy.

**What happened to `DIRECT_URL`?** Prisma needed two URLs: a "pooled" one for the app and a "direct" one for migrations. This project now uses Neon's **HTTP** driver, where every query is a stateless HTTPS request, so there's no connection pool to worry about. `DATABASE_URL` alone is used for everything, migrations included.

**Bot protection (Turnstile) — how to get the keys (free):**
1. Cloudflare dashboard → **Turnstile** → **Add widget**.
2. Name: `360dep`, hostname: `360dep.com` (add `localhost` too if you want to test real keys locally), mode: **Managed**.
3. Copy the **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and the **Secret Key** → `TURNSTILE_SECRET_KEY`.

For local development you can use Cloudflare's official **test keys**, which always pass:
`NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`, `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`.
If both are empty, the bot check is skipped (rate limits still apply). **Always set real keys in production.**

**Keeping secrets out of the code:** run `npm run check-secrets` before every commit. It fails if it finds a DB URL, API key, password hash or similar anywhere outside `.env`.

---

## 4. Database

Neon Postgres. The database is **shared with other apps**, so every table this project owns starts with **`360dep_`**, and Drizzle is configured (`tablesFilter: ["360dep_*"]`) never to look at or touch any other table.

| Table | Purpose |
|---|---|
| `360dep_banners` | Home page banners (image, optional title/description) |
| `360dep_services` | Services (title, unique slug, description, image, optional price range) |
| `360dep_team_members` | Team (name, designation, photo, bio, Facebook/LinkedIn) |
| `360dep_clients` | Previous clients (name, logo, website, optional feedback quote) |
| `360dep_gallery_items` | Gallery (title, description, category, `images text[]`, YouTube URL, featured flag) |
| `360dep_leads` | Contact-form enquiries — the admin "Enquiries" inbox (status `new` / `contacted` / `closed`, private note) |

Content tables share these columns: `id` (32-char hex), `sort_order` (drag-and-drop order), `is_active` (show on the site), `created_at`, `updated_at`. In TypeScript they're camelCase (`order`, `isActive`, …).

**Why only these six tables?** Everything else the app needs lives outside Postgres: rate limits use Cloudflare's built-in Rate Limiting, the page cache uses Cloudflare KV/D1, and there is no migrations-history table (see below).

**Changing the schema**
```bash
# 1. edit lib/db/schema.ts
npm run db:generate                               # writes drizzle/000N_<name>.sql — review it!
npm run db:apply -- drizzle/000N_<name>.sql       # runs that one file, in a single transaction
```
Commit the new SQL file. Each file is applied once, by hand — there is no tracking table.
`db:apply` refuses any statement that touches a table/index not starting with `360dep_` or drops a type/sequence/schema.

⚠️ **Never run `drizzle-kit push`** on this database. The database is shared with other apps and push tries to drop their enums and sequences (its table filter doesn't cover those).

**New, empty database:** `npm run db:apply -- drizzle/0000_init.sql` creates all six tables.

---

## 5. Caching — tag-based ISR

Public pages have **no time-based revalidation**. They're built once and served from Cloudflare's cache until an admin changes something.

1. Every public query in `lib/data.ts` is wrapped in `unstable_cache(..., { tags: ["services"], revalidate: false })`.
2. A page that calls `getServices()` is automatically tagged `services`.
3. When the admin creates/edits/hides/reorders/deletes a service, the API calls `revalidateTag("services")` (see `invalidatePublicContent` in `lib/data.ts`).
4. OpenNext records that in the **D1 tag cache**. The next visit to any page tagged `services` (home, /services, /contact dropdown) re-renders it with fresh data and stores the result in **KV**. Pages that don't use that tag stay cached.

| Tag | Used by |
|---|---|
| `banners` | Home |
| `services` | Home, /services, /contact (dropdown), all /areas/* pages, business JSON-LD |
| `team` | Home |
| `clients` | Home, /clients |
| `gallery` | Home, /gallery |

If the database is down during a rebuild, the error is thrown on purpose, so the last good page keeps being served instead of an empty one being cached.

Admin pages (`/admin/*`) and APIs are always dynamic and never cached.

---

## 6. Images

**Upload flow** (`components/admin/api-client.ts` → `app/api/upload/route.ts` → `lib/imgbb.ts`):
1. The admin picks a photo (any size; phones' HEIC is converted to JPEG by the OS).
2. **In the browser:** apply the photo's rotation, shrink so the longest edge fits the preset, and encode as WebP. Typically 80–95% smaller with no visible loss.

   | Preset | Max edge | WebP quality | Used for |
   |---|---|---|---|
   | `photo` | 1920 px | 0.82 | banners, services, gallery |
   | `portrait` | 1200 px | 0.84 | team photos |
   | `logo` | 800 px | 0.90 | client logos (keeps transparency) |
3. **On the server:** reads the real file bytes (magic numbers, not the claimed type), allows only WebP/JPEG/PNG, max 3 MB, max 2048 px per side, then uploads the bytes to ImgBB.
4. Only the returned `https://i.ibb.co/...` URL is stored. Validators reject image URLs from any other host.

**Display:** `next/image` uses `lib/image-loader.ts`, which asks **wsrv.nl** for the exact width each screen needs (e.g. a 640 px WebP on a phone). To disable, make the loader `return src;`.

---

## 7. Authentication & security

| Area | Implementation |
|---|---|
| Admin login | `POST /api/auth/login` checks the email (constant-time) and password (`lib/password.ts`, PBKDF2-SHA256, 25k iterations), then signs a **JWT (HS256, 7 days)** with `JWT_SECRET`. |
| Session cookie | `dep360_session`: `httpOnly`, `Secure` (production), `SameSite=Strict`. Never readable by JavaScript or stored in localStorage. |
| Route protection | `middleware.ts` verifies the JWT on every `/admin/*` page and admin API. Every admin handler checks again (`requireAdmin`), and so does the admin layout. |
| Rate limits | Cloudflare Rate Limiting binding (free): login 5 per minute, contact form 3 per minute, per IP. Configured in `wrangler.jsonc` → `ratelimits`; `lib/ratelimit.ts` falls back to an in-memory limiter under `next dev`/`next start`. Combined with Turnstile (a solved challenge per attempt) this makes password guessing impractical. |
| Bot protection | Cloudflare Turnstile on login + contact form, plus a hidden honeypot field on the contact form. |
| Input validation | Zod schemas (`lib/validators.ts`) on every API, also used by the forms for instant feedback. |
| SQL injection | Drizzle only; all values are sent as bound parameters. No SQL is built from user input. |
| XSS | React escaping; no `dangerouslySetInnerHTML` with user content. |
| CSRF | SameSite=Strict cookies + an `Origin` header check on every state-changing request. |
| Headers | `next.config.ts`: CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP (the same set `helmet` provides for Express). |
| Secrets | Only in `.env` / Cloudflare secrets. `npm run check-secrets` guards the repo. |

---

## 8. API reference

All endpoints return JSON. Errors always look like:

```ts
{ error: string; fieldErrors?: Record<string, string[]>; retryAfter?: number }
```

**Admin endpoints** require the `dep360_session` cookie (sign in first) and, for anything other than GET, an `Origin` header matching the site. Without a session: `401`. Wrong origin: `403`.
Validation failure: `422` · missing item: `404` · rate-limited: `429` · server error: `500`.

### 8.1 Auth

#### `POST /api/auth/login` — public
```ts
// request
{ email: string; password: string; turnstileToken?: string }
// 200 (also sets the session cookie)
{ ok: true }
// 401 { error: "Incorrect email or password." }
// 429 { error: "Too many attempts. Please wait a minute and try again.", retryAfter: 60 }
// 400 { error: "Security check failed…" }   (Turnstile)
```

#### `POST /api/auth/logout`
```ts
// 200 (clears the cookie)
{ ok: true }
```

### 8.2 Contact form — public

#### `POST /api/contact`
```ts
// request
{
  name: string;            // 2–80 chars
  phone: string;           // 7–15 digits; Bangla digits and spaces/dashes are accepted
  email?: string;          // "" or a valid email
  service: string;         // an active service id, or "__other__"
  customService?: string;  // required (2+ chars) when service === "__other__"
  message?: string;        // ≤ 1500 chars
  turnstileToken?: string;
  website?: string;        // honeypot — must stay empty
}
// 200
{ ok: true; serviceTitle: string | null }
// 422 { error: "errors.phoneInvalid", fieldErrors: {...} }   ← error values are i18n keys
// 429 { error: "contact.rateLimited", retryAfter: 60 }
```
After a `200`, the browser opens `https://wa.me/<NEXT_PUBLIC_WHATSAPP_NUMBER>?text=<details>`.

### 8.3 Content collections — admin

The same five endpoints exist for each collection:

| Collection | Base path | Cache tag |
|---|---|---|
| Banners | `/api/banners` | `banners` |
| Services | `/api/services` | `services` |
| Team | `/api/team` | `team` |
| Clients | `/api/clients` | `clients` |
| Gallery | `/api/gallery` | `gallery` |

| Method & path | Body | Response |
|---|---|---|
| `GET /api/{c}` | — | `200 { items: Item[] }` (sorted by display order) |
| `POST /api/{c}` | full item (below) | `201 { item: Item }` (appended to the end) |
| `PUT /api/{c}/:id` | full item (below) | `200 { item: Item }` |
| `PATCH /api/{c}/:id` | `{ isActive?: boolean; isFeatured?: boolean }` (`isFeatured` is gallery only) | `200 { item: Item }` |
| `DELETE /api/{c}/:id` | — | `200 { ok: true }` · `404` if already gone |
| `POST /api/{c}/reorder` | `{ ids: string[] }` in the new order | `200 { ok: true }` |

Every write revalidates that collection's cache tag, so the public site updates immediately.
Empty strings for optional fields are stored as `null`. Image fields must be ImgBB URLs from `/api/upload`.

**Request bodies (POST / PUT)**
```ts
// Banner
{ imageUrl: string; title?: string; description?: string; isActive?: boolean }

// Service  (slug is generated from the title automatically)
{ title: string /*2–100*/; description: string /*10–1500*/; imageUrl?: string;
  priceMin?: number | string; priceMax?: number | string; isActive?: boolean }   // priceMax ≥ priceMin

// Team member
{ name: string; designation: string; photoUrl?: string; bio?: string;
  facebook?: string; linkedin?: string; isActive?: boolean }   // "facebook.com/x" is accepted → https://

// Client
{ name: string; logoUrl: string; website?: string; feedback?: string /*≤600, shown as a quote*/; isActive?: boolean }

// Gallery item  (needs at least one image OR a YouTube link)
{ title: string; description?: string; category?: string; images: string[] /*≤40*/;
  youtubeUrl?: string; isFeatured?: boolean; isActive?: boolean }
```

**Item (response)** = the fields above plus:
```ts
{ id: string; order: number; isActive: boolean; createdAt: string; updatedAt: string }
// services also include: slug: string
```

### 8.4 Leads — admin

| Method & path | Body | Response |
|---|---|---|
| `GET /api/leads?status=new&page=1` | — | `200 { items: Lead[]; total: number; page: number; pageSize: 50 }` |
| `PATCH /api/leads/:id` | `{ status?: "new" \| "contacted" \| "closed"; note?: string }` | `200 { item: Lead }` |
| `DELETE /api/leads/:id` | — | `200 { ok: true }` |

```ts
type Lead = {
  id: string; name: string; phone: string; email: string | null;
  serviceId: string | null; serviceTitle: string | null; customService: string | null;
  message: string | null; status: "new" | "contacted" | "closed"; note: string | null;
  createdAt: string; updatedAt: string;
};
```

### 8.5 Image upload — admin

#### `POST /api/upload` (`multipart/form-data`)
| Field | Value |
|---|---|
| `file` | the image, already resized/encoded by the browser (WebP, JPEG or PNG, ≤ 3 MB, ≤ 2048 px) |
| `preset` | `photo` \| `portrait` \| `logo` |

```ts
// 200
{ url: string; width: number; height: number; bytes: number }
// 413 too large · 415 not a real image · 502 ImgBB unavailable
```

---

## 9. Language (Bangla / English)

- All site text lives in `lib/i18n/bn.json` (primary) and `lib/i18n/en.json`. **Both files must have the same keys.**
- The server renders Bangla (good for SEO and caching); the visitor's English choice is saved in their browser.
- In components: `<T k="home.aboutTitle" />` (works inside Server Components), or `const { t } = useLocale()` in Client Components.
- Content typed in the admin panel (service names etc.) is shown exactly as entered.
- The admin panel itself is in plain English.

---

## 10. Deploy to Cloudflare

Everything below works on the **free plan** with no payment method.

**One-time setup**
```bash
npm install
npx wrangler login                                   # opens the browser

npx wrangler kv namespace create NEXT_INC_CACHE_KV   # copy the "id"
npx wrangler d1 create dep360-tag-cache              # copy the "database_id"
```
Paste both ids into `wrangler.jsonc` (replace `REPLACE_WITH_…`).

**Secrets** (stored encrypted by Cloudflare, never in the repo):
```bash
npx wrangler secret put DATABASE_URL
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD_HASH
npx wrangler secret put IMGBB_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```
(Or: dashboard → Workers & Pages → `dep360-site` → Settings → Variables and Secrets.)

**Build-time values:** `npm run deploy` builds on your computer and reads `NEXT_PUBLIC_*` and `DATABASE_URL` (pages are pre-rendered from the database at build time) from your local `.env`. Make sure `.env` has the **production** values before deploying.
If you use Cloudflare **Workers Builds** (auto-deploy from Git), add the same variables under the project's *Build* → *Variables*, and set the build command to `npx opennextjs-cloudflare build` and the deploy command to `npx opennextjs-cloudflare deploy`.

**Deploy**
```bash
npm run deploy         # builds, uploads and fills the page cache
```

**Custom domain:** dashboard → `dep360-site` → Settings → Domains & Routes → **Add custom domain** → `360dep.com` (the domain must be on Cloudflare DNS, which is free).

**After the first deploy:** open `https://360dep.com/admin`, sign in, and check the contact form end to end.

---

## 11. Common tasks (how do I…?)

**Add a field to services (example: `duration`)**
1. `lib/db/schema.ts` → add `duration: text("duration"),` to `services`.
2. `npm run db:generate`, review the SQL, then `npm run db:apply -- drizzle/<new file>.sql`.
3. `lib/validators.ts` → add `duration: optionalText(60),` to `serviceSchema`.
4. `components/admin/managers.tsx` → add a field to `serviceConfig.fields` (and `defaults`).
5. `lib/data.ts` → select it in `getServices` and add it to `PublicService`.
6. Show it in `components/public/service-card.tsx`.

**Add a new admin-managed collection:** create the table (schema + migration), a Zod schema, a `ResourceConfig` in `lib/resources.ts`, three tiny route files (copy `app/api/team/*`), a cache tag + query in `lib/data.ts`, a manager config in `components/admin/managers.tsx`, an admin page (copy `app/admin/(panel)/team/page.tsx`), a sidebar link in `components/admin/admin-shell.tsx`, and add the API path to the `middleware.ts` matcher.

**Change text on the site:** edit `lib/i18n/bn.json` and `en.json`.

**Change colours/fonts:** CSS variables at the top of `app/globals.css`; fonts in `app/fonts.ts`.

**Change the admin password:** `npm run hash-password -- "new password"` → update `ADMIN_PASSWORD_HASH` in `.env` and in Cloudflare (`npx wrangler secret put ADMIN_PASSWORD_HASH`).

---

**Current content (added during setup):** 3 banners, 4 services with photos, 5 gallery items (3 with YouTube videos) — free-licence Unsplash photos (commercial use allowed, no attribution required) and public YouTube videos by other creators. Replace them with your own event photos/videos when you have them. 3 team members and 4 clients with feedback exist as **hidden samples** (names start with "নমুনা") — edit them with real details and switch "Show on website" on, or delete them.

---

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| `npm run preview` on Windows: *"access violation in the runtime"* | Install the **Microsoft Visual C++ Redistributable (x64)**, free: <https://aka.ms/vs/17/release/vc_redist.x64.exe>. The local Workers runtime (workerd) needs it. `npm run dev` works without it. |
| Admin change doesn't appear on the site | Reload once: the first visit after an edit rebuilds the page. Check the Worker logs (dashboard → Observability) for `revalidateTag` / D1 errors and that the D1 binding id in `wrangler.jsonc` is correct. |
| Login says the check failed | Turnstile keys are missing or don't match the domain. For local testing use the test keys in section 3. |
| "Too many attempts" | The rate limit resets after one minute. |
| Build fails with a database error | `DATABASE_URL` must be set at build time (pages are pre-rendered from the DB). |
| Worker exceeds the size limit | Check with `npx wrangler deploy --dry-run`. Currently ~1.4 MB gzipped against the 3 MB free limit. Avoid large server-side dependencies. |
| A dynamic page returns 404 after an admin edit | Don't add `export const dynamicParams = false` to pages that read cached data — in Next 15 a tag revalidation then makes them 404 (`NoFallbackError`). Handle unknown params with `notFound()` instead (see `app/(public)/areas/[slug]/page.tsx`). |
| Images don't load | CSP only allows `i.ibb.co`, `wsrv.nl`, `i.ytimg.com`. New image hosts must be added in `next.config.ts`. |

---

## 13. Free-plan limits

| Service | Free allowance | This site's usage |
|---|---|---|
| Workers | 100,000 requests/day, 10 ms CPU/request | Cached pages use very little CPU; heaviest request is login (~5 ms). |
| Workers KV | 100k reads/day, 1k writes/day | Writes only happen when a page is rebuilt after an admin edit. |
| D1 | 5M reads/day, 100k writes/day | One tag lookup per page view, one write per admin edit. |
| Neon | 0.5 GB storage, autosuspend | DB is only hit on cache rebuilds, admin use and form submissions. |
| ImgBB | Free, unlimited hosting | — |
| wsrv.nl | Free, no key | — |
| Turnstile | Free, unlimited | — |

If traffic grows beyond 100k requests/day, Workers Paid is $5/month and nothing in the code needs to change.

---

## 14. SEO & local search

Goal: appear for Bangla and English searches like *"যশোরের সেরা ইভেন্ট ম্যানেজমেন্ট"*, *"মাগুরা বিয়ের সাজসজ্জা"*, *"best wedding planner in Jashore"*, *"event management Jhenaidah"*.

**What's in place**

| Piece | Where | What it does |
|---|---|---|
| District pages | `/areas` + `/areas/<district>` (`lib/seo/areas.ts`) | One page each for Jashore, Jhenaidah, Magura, Satkhira, Khulna, Narail, Bagerhat, Kushtia, Chuadanga, Meherpur — Bangla H1 + English subtitle, both languages in the HTML, upazila names, services, bilingual FAQ, links to the other districts. **This is what actually ranks.** |
| Page titles & descriptions | `app/layout.tsx`, each `page.tsx`, `lib/seo/area-content.ts` | Bangla + English, e.g. "মাগুরা ইভেন্ট ম্যানেজমেন্ট ও ওয়েডিং প্ল্যানার \| Best Event Management in Magura". |
| Structured data (JSON-LD) | `lib/seo/jsonld.tsx` | `LocalBusiness` on every public page (service areas = all 10 districts, services from the DB); `Service` + `FAQPage` + `BreadcrumbList` on each district page. Enables rich results. |
| Keywords | `lib/seo/keywords.ts` | ~1,000 unique Bangla + English phrases (service × district × "best/সেরা/near"), split per page (~40 on general pages, ~95–107 per district page). Google ignores the keywords tag; Bing and others still read it. They are **not** shown as visible text (that would be keyword stuffing and hurt ranking). |
| Internal links | Home ("সব জেলায় আমরা আছি"), footer, each district page | Helps search engines find and rank the district pages. |
| Sitemap | `app/sitemap.ts` | Includes `/areas` and all district pages. |

**Add a district:** add an entry to `AREAS` in `lib/seo/areas.ts` (slug, English + Bangla names incl. `bnIn`/`bnOf` forms, upazilas). The page, keywords, sitemap entry, footer/home links and JSON-LD are generated automatically.

**Do these after launch (free, and they matter more than any code):**
1. **Google Business Profile** (<https://business.google.com>) — create a profile for 360DEP in Jashore, category "Event planner" / "Wedding planner", list the service-area districts, add real photos, and ask happy clients for Google reviews. This is the #1 factor for "near me" and "in Jashore" searches and the map results.
2. **Google Search Console** (<https://search.google.com/search-console>) — verify `360dep.com` (DNS record in Cloudflare) and submit `https://360dep.com/sitemap.xml`.
3. **Bing Webmaster Tools** — import from Search Console (one click).
4. Replace the stock gallery photos with your own events and add real client feedback — original photos and genuine reviews improve ranking and trust.
5. Share district pages on your Facebook page and in local groups; links from local sites help.

Rankings take weeks to months to build and can't be guaranteed by any code; the pieces above give the site everything search engines look for.
