# Nozl: hotel booking and front-desk system

Booking website, front desk, KPI dashboard and alerts for small Tunisian hotels.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui (Radix, RTL-aware logical classes) |
| i18n | next-intl: French (default), Arabic (RTL), English |
| Database | PostgreSQL (Neon in production) via Drizzle ORM |
| Auth | Better Auth, roles `admin` / `staff` / `guest` |
| Validation | Zod |
| Hosting | Vercel |

## Getting started

```bash
docker compose up -d           # local Postgres
cp .env.example .env.local     # fill BETTER_AUTH_SECRET
cp .env.local .env             # drizzle-kit and the seed read .env
npm install
npm run db:migrate             # create tables + no-overlap constraint
npm run db:seed                # demo hotel "Les Oliviers", 30 rooms
npm run dev
```

The seed prints the demo admin and reception logins unless `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD` are set.

## Languages

- Every page lives under `src/app/[locale]/` and every URL is prefixed: `/fr`, `/ar`, `/en`. `src/proxy.ts` redirects `/` to the browser's language (French by default).
- Strings live in `messages/{fr,ar,en}.json`. French is the source of truth: keys are type-checked against `fr.json`, so add a key there first, then to `ar.json` and `en.json`.
- Server components use `getTranslations` from `next-intl/server`. Client components get strings as props where possible, so no message file is shipped to the browser.
- Use `Link`, `redirect`, `usePathname` from `@/i18n/navigation`, not from `next/link` / `next/navigation`.
- Arabic pages get `dir="rtl"`. Use logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`), never `ml-`, `mr-`, `left-`, `right-`. Flip directional icons with `rtl:rotate-180`.
- Fonts are self-hosted: Geist for Latin, Noto Sans Arabic (OFL, `src/app/fonts/`) for Arabic glyphs.

## Data model

```
room_types 1─n rooms
room_types 1─n rate_seasons (null = all types)
guests 1─n reservations 1─n reservation_rooms n─1 rooms
reservations 1─n payments
reservations 1─n alerts
user (Better Auth) ─ session / account / verification
hotel_settings (single row), meal_plan_prices, audit_log
```

Guarantees enforced by PostgreSQL, not only by application code:

- **No double booking.** `reservation_rooms_no_overlap` (GiST exclusion on `room_id` + `daterange(check_in, check_out, '[)')`). Back-to-back stays are allowed.
- **Cancelling frees the room.** A trigger keeps `reservation_rooms.is_active` in sync with the reservation status.
- **Sane values.** Check-out after check-in, at least one adult, non-negative amounts, positive rates.

Money is `numeric(12,3)`: the dinar has 3 decimals (millimes).

## Demo data

Fictional 2-star hotel in Sousse: 6 single, 14 double, 6 twin, 4 triple rooms, breakfast included, half-board supplement.
12 months of history plus 4 months of forward bookings with coastal seasonality, a realistic channel mix (Booking.com, phone, walk-in, WhatsApp, direct web, agencies), nationality mix, cancellations and no-shows.
Figures are illustrative; replace them with a real prospect's numbers before a sales demo.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Wipe and reseed demo data (refuses in production) |
| `npm run db:studio` | Browse the database |
