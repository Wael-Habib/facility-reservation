# Nozl: hotel booking and front-desk system

Booking website, front desk, KPI dashboard and alerts for small Tunisian hotels.
Product brief: [`PRODUCT.md`](PRODUCT.md). Security history: [`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md).

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4 (shadcn/ui from Phase 2) |
| Database | PostgreSQL (Neon in production) via Drizzle ORM |
| Auth | Better Auth, roles `admin` / `staff` / `guest` |
| Validation | Zod |
| Hosting | Vercel |

## Getting started

```bash
cp .env.example .env.local     # fill DATABASE_URL and BETTER_AUTH_SECRET
cp .env.local .env             # drizzle-kit and the seed read .env
npm install
npm run db:migrate             # create tables + no-overlap constraint
npm run db:seed                # demo hotel "Les Oliviers", 30 rooms
npm run dev
```

The seed prints the demo admin and reception logins unless `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD` are set.

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
