/**
 * Demo data: a fictional 30-room, 2-star hotel in Sousse with ~16 months of
 * realistic activity (12 months of history, 4 months of forward bookings).
 *
 * Deterministic: same SEED_TODAY gives the same data.
 *   npm run db:seed
 *
 * Seasonality, channel mix, nationality mix and lead times are modelled on
 * a typical Tunisian coastal 2-star property. They are ILLUSTRATIVE, not
 * measured from a real hotel: replace them with a prospect's figures.
 */
import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import * as s from "../src/db/schema";

if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error("Refusing to seed in production without --force (it wipes data).");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: s, casing: "snake_case" });

/* ----------------------------- helpers ---------------------------------- */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261106);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
function weighted<T extends string>(table: Record<T, number>): T {
  const entries = Object.entries(table) as [T, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = rand() * total;
  for (const [k, w] of entries) if ((r -= w) <= 0) return k;
  return entries[entries.length - 1][0];
}
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const round3 = (n: number) => Math.round(n * 1000) / 1000;

const DAY = 86_400_000;
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (isoDate: string, n: number) => iso(new Date(toDate(isoDate).getTime() + n * DAY));
const diffDays = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / DAY);

// Calendar day in the hotel's timezone, not UTC.
const TODAY = process.env.SEED_TODAY ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(new Date());
const START = addDays(TODAY, -365);
const END = addDays(TODAY, 120);

/* ----------------------------- hotel model ------------------------------ */
const HOTEL = {
  name: "Hôtel Les Oliviers",
  stars: 2,
  city: "Sousse",
  address: "Adresse de démonstration, Sousse, Tunisie",
  phone: "+216 73 000 000",
  whatsapp: "+216 20 000 000",
  email: "contact@lesoliviers.example",
  vatRate: 7,
  cityTaxPerAdultNight: 2, // demo value, configurable per hotel
};

const ROOM_TYPES = [
  {
    code: "SGL", count: 6, baseRate: 95, maxAdults: 1, maxChildren: 0, bed: "1 single bed", size: 14,
    name: { fr: "Chambre Single", ar: "غرفة فردية", en: "Single Room" },
    description: {
      fr: "Chambre calme pour une personne, idéale pour les voyages d'affaires. Petit-déjeuner inclus.",
      ar: "غرفة هادئة لشخص واحد، مثالية لرحلات العمل. فطور الصباح مشمول.",
      en: "Quiet room for one, ideal for business trips. Breakfast included.",
    },
  },
  {
    code: "DBL", count: 14, baseRate: 130, maxAdults: 2, maxChildren: 1, bed: "1 double bed", size: 18,
    name: { fr: "Chambre Double", ar: "غرفة مزدوجة", en: "Double Room" },
    description: {
      fr: "Chambre confortable avec lit double, climatisation et salle de bain privée. Petit-déjeuner inclus.",
      ar: "غرفة مريحة بسرير مزدوج، مكيفة وبحمام خاص. فطور الصباح مشمول.",
      en: "Comfortable room with a double bed, air conditioning and private bathroom. Breakfast included.",
    },
  },
  {
    code: "TWN", count: 6, baseRate: 130, maxAdults: 2, maxChildren: 1, bed: "2 single beds", size: 18,
    name: { fr: "Chambre Twin", ar: "غرفة بسريرين", en: "Twin Room" },
    description: {
      fr: "Deux lits séparés, parfaite pour amis ou collègues. Petit-déjeuner inclus.",
      ar: "سريران منفصلان، مثالية للأصدقاء أو الزملاء. فطور الصباح مشمول.",
      en: "Two separate beds, perfect for friends or colleagues. Breakfast included.",
    },
  },
  {
    code: "TRP", count: 4, baseRate: 170, maxAdults: 3, maxChildren: 1, bed: "1 double + 1 single", size: 24,
    name: { fr: "Chambre Triple", ar: "غرفة ثلاثية", en: "Triple Room" },
    description: {
      fr: "Espace familial avec un lit double et un lit simple. Petit-déjeuner inclus.",
      ar: "مساحة عائلية بسرير مزدوج وسرير فردي. فطور الصباح مشمول.",
      en: "Family space with a double and a single bed. Breakfast included.",
    },
  },
] as const;
const AMENITIES = ["wifi", "air_conditioning", "private_bathroom", "tv", "breakfast"];

// Target occupancy by month (Jan..Dec): coastal seasonality.
const OCC = [0.35, 0.38, 0.45, 0.55, 0.62, 0.75, 0.92, 0.95, 0.78, 0.6, 0.42, 0.48];
// Price multiplier by month.
const SEASON = [
  { name: "Basse saison", months: [0, 1, 2, 10, 11], mult: 0.8 },
  { name: "Moyenne saison", months: [3, 4, 9], mult: 1.0 },
  { name: "Haute saison", months: [5, 8], mult: 1.25 },
  { name: "Très haute saison", months: [6, 7], mult: 1.5 },
];
const multFor = (isoDate: string) =>
  SEASON.find((x) => x.months.includes(toDate(isoDate).getUTCMonth()))!.mult;

const MEAL_SUPPLEMENT = { RO: -8, BB: 0, HB: 25, FB: 45 } as const;
const COMMISSION: Partial<Record<(typeof s.bookingChannel.enumValues)[number], number>> = {
  booking_com: 0.15,
  expedia: 0.18,
  agency: 0.2,
};
const CHANNEL_MIX = {
  booking_com: 38, phone: 18, walk_in: 15, whatsapp: 10, direct_web: 8, agency: 8, expedia: 3,
} as const;
const LEAD_DAYS: Record<keyof typeof CHANNEL_MIX, [number, number]> = {
  walk_in: [0, 0], phone: [2, 30], whatsapp: [1, 21], direct_web: [5, 60],
  booking_com: [3, 90], expedia: [7, 90], agency: [20, 120],
};
const NATIONALITY_MIX = {
  TN: 30, FR: 15, DZ: 18, LY: 12, DE: 7, IT: 4, GB: 4, BE: 3, PL: 3, CZ: 2, RU: 2,
} as const;
type Nat = keyof typeof NATIONALITY_MIX;

const NAMES: Record<"maghreb" | "fr" | "de" | "it" | "en" | "pl" | "cz" | "ru", { first: string[]; last: string[] }> = {
  maghreb: {
    first: ["Mohamed", "Ahmed", "Amine", "Youssef", "Sami", "Karim", "Walid", "Nizar", "Hichem", "Fatma", "Amira", "Sarra", "Ines", "Mariem", "Nour", "Rania", "Salma", "Yasmine", "Khalil", "Omar"],
    last: ["Ben Ali", "Trabelsi", "Gharbi", "Jaziri", "Hammami", "Bouazizi", "Chaabane", "Mejri", "Sassi", "Ayari", "Dridi", "Haddad", "Belkacem", "Benali", "Mansouri", "Zitouni", "Abdelli", "Ferjani"],
  },
  fr: {
    first: ["Pierre", "Julien", "Nicolas", "Thomas", "Camille", "Claire", "Sophie", "Isabelle", "Laurent", "Marie", "Antoine", "Chloé"],
    last: ["Martin", "Bernard", "Dubois", "Durand", "Lefebvre", "Moreau", "Laurent", "Simon", "Michel", "Garcia", "Roux", "Fontaine"],
  },
  de: {
    first: ["Lukas", "Jonas", "Felix", "Anna", "Lena", "Laura", "Stefan", "Katrin", "Markus", "Sabine"],
    last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Koch"],
  },
  it: { first: ["Marco", "Luca", "Giulia", "Francesca", "Andrea", "Sara"], last: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano"] },
  en: { first: ["James", "Oliver", "Emma", "Sophie", "Harry", "Grace"], last: ["Smith", "Jones", "Taylor", "Brown", "Wilson", "Evans"] },
  pl: { first: ["Piotr", "Anna", "Tomasz", "Katarzyna", "Michał"], last: ["Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kamiński"] },
  cz: { first: ["Jan", "Petr", "Eva", "Lucie"], last: ["Novák", "Svoboda", "Dvořák", "Černý"] },
  ru: { first: ["Ivan", "Olga", "Dmitri", "Natalia"], last: ["Ivanov", "Petrova", "Smirnov", "Volkova"] },
};
const NAME_POOL: Record<Nat, keyof typeof NAMES> = {
  TN: "maghreb", DZ: "maghreb", LY: "maghreb", FR: "fr", BE: "fr", DE: "de", IT: "it", GB: "en", PL: "pl", CZ: "cz", RU: "ru",
};
const PHONE_PREFIX: Record<Nat, string> = {
  TN: "+216", DZ: "+213", LY: "+218", FR: "+33", BE: "+32", DE: "+49", IT: "+39", GB: "+44", PL: "+48", CZ: "+420", RU: "+7",
};
const EMAIL_DOMAINS = ["gmail.com", "yahoo.fr", "hotmail.com", "outlook.com"];
const ascii = (x: string) => x.normalize("NFD").replace(/[^\w]/g, "").toLowerCase();

/* ----------------------------- generation ------------------------------- */
type GuestRow = typeof s.guests.$inferInsert & { id: string };
type ResRow = typeof s.reservations.$inferInsert & { id: string };
type ResRoomRow = typeof s.reservationRooms.$inferInsert;
type PayRow = typeof s.payments.$inferInsert;

const guestRows: GuestRow[] = [];
const guestsByNat = new Map<Nat, GuestRow[]>();
function getGuest(nat: Nat): string {
  const existing = guestsByNat.get(nat) ?? [];
  if (existing.length > 5 && rand() < 0.15) return pick(existing).id; // returning guest
  const pool = NAMES[NAME_POOL[nat]];
  const firstName = pick(pool.first);
  const lastName = pick(pool.last);
  const id = randomUUID();
  const g: GuestRow = {
    id,
    firstName,
    lastName,
    nationality: nat,
    email: rand() < 0.8 ? `${ascii(firstName)}.${ascii(lastName)}${randInt(1, 99)}@${pick(EMAIL_DOMAINS)}` : null,
    phone: `${PHONE_PREFIX[nat]} ${randInt(20, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`,
  };
  guestRows.push(g);
  guestsByNat.set(nat, [...existing, g]);
  return id;
}

function stayPrice(roomBase: number, checkIn: string, nights: number, adults: number, children: number, meal: keyof typeof MEAL_SUPPLEMENT) {
  let room = 0;
  for (let i = 0; i < nights; i++) room += roomBase * multFor(addDays(checkIn, i));
  const persons = adults + children * 0.5;
  const meals = MEAL_SUPPLEMENT[meal] * persons * nights;
  const tax = HOTEL.cityTaxPerAdultNight * adults * nights;
  return { total: round3(room + meals + tax), nightly: round3(room / nights) };
}

function losSample() {
  return Number(weighted({ "1": 20, "2": 25, "3": 20, "4": 12, "5": 8, "6": 5, "7": 10 }));
}

async function main() {
  console.log(`Seeding demo hotel: ${START} to ${END} (today ${TODAY})`);

  await db.execute(sql`TRUNCATE TABLE
    audit_log, alerts, payments, reservation_rooms, reservations, guests,
    rate_seasons, meal_plan_prices, rooms, room_types, hotel_settings,
    session, account, verification, "user" RESTART IDENTITY CASCADE`);

  /* Users */
  const adminPw = process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  const staffPw = process.env.SEED_STAFF_PASSWORD || randomBytes(9).toString("base64url");
  const users = [
    { id: randomUUID(), name: "Gérant (démo)", email: "admin@lesoliviers.example", role: "admin" as const, pw: adminPw },
    { id: randomUUID(), name: "Réception (démo)", email: "reception@lesoliviers.example", role: "staff" as const, pw: staffPw },
  ];
  await db.insert(s.user).values(users.map(({ id, name, email, role }) => ({ id, name, email, role, emailVerified: true })));
  await db.insert(s.account).values(
    await Promise.all(
      users.map(async (u) => ({
        id: randomUUID(),
        accountId: u.id,
        providerId: "credential",
        userId: u.id,
        password: await hashPassword(u.pw),
      })),
    ),
  );
  const staffId = users[1].id;

  /* Hotel, room types, rooms, seasons, meal plans */
  await db.insert(s.hotelSettings).values({ id: 1, ...HOTEL });

  const typeRows = await db
    .insert(s.roomTypes)
    .values(
      ROOM_TYPES.map((t, i) => ({
        code: t.code,
        name: t.name,
        description: t.description,
        maxAdults: t.maxAdults,
        maxChildren: t.maxChildren,
        bedConfig: t.bed,
        sizeSqm: t.size,
        baseRate: t.baseRate,
        amenities: AMENITIES,
        sortOrder: i,
      })),
    )
    .returning({ id: s.roomTypes.id, code: s.roomTypes.code });
  const typeId = Object.fromEntries(typeRows.map((r) => [r.code, r.id]));

  const roomRows: { id: string; number: string; floor: number; roomTypeId: string; code: string; base: number }[] = [];
  let n = 0;
  for (const t of ROOM_TYPES) {
    for (let i = 0; i < t.count; i++, n++) {
      const floor = Math.floor(n / 10) + 1;
      roomRows.push({
        id: randomUUID(),
        number: `${floor}${String((n % 10) + 1).padStart(2, "0")}`,
        floor,
        roomTypeId: typeId[t.code],
        code: t.code,
        base: t.baseRate,
      });
    }
  }
  await db.insert(s.rooms).values(roomRows.map(({ id, number, floor, roomTypeId }) => ({ id, number, floor, roomTypeId })));

  const seasonRows: (typeof s.rateSeasons.$inferInsert)[] = [];
  const startYear = toDate(START).getUTCFullYear();
  for (let y = startYear; y <= startYear + 2; y++) {
    for (let m = 0; m < 12; m++) {
      const season = SEASON.find((x) => x.months.includes(m))!;
      if (season.mult === 1) continue; // base rate, no row needed
      const first = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const last = addDays(`${m === 11 ? y + 1 : y}-${String(m === 11 ? 1 : m + 2).padStart(2, "0")}-01`, -1);
      seasonRows.push({ name: `${season.name} ${y}`, startDate: first, endDate: last, multiplier: season.mult });
    }
  }
  await db.insert(s.rateSeasons).values(seasonRows);
  await db.insert(s.mealPlanPrices).values(
    (Object.keys(MEAL_SUPPLEMENT) as (keyof typeof MEAL_SUPPLEMENT)[]).map((plan) => ({
      plan,
      supplementPerPersonNight: MEAL_SUPPLEMENT[plan],
    })),
  );

  /* Reservations */
  const resRows: ResRow[] = [];
  const resRoomRows: ResRoomRow[] = [];
  const payRows: PayRow[] = [];

  function makeReservation(room: (typeof roomRows)[number] | null, code: string, base: number, roomTypeId: string, checkIn: string, nights: number, cancelled: boolean) {
    const checkOut = addDays(checkIn, nights);
    const channel = weighted(CHANNEL_MIX);
    const nat = weighted(NATIONALITY_MIX);
    const t = ROOM_TYPES.find((x) => x.code === code)!;
    let adults: number = t.maxAdults;
    let children = 0;
    if (code === "DBL" && rand() < 0.1) adults = 1;
    if (code === "TRP" && rand() < 0.3) { adults = 2; children = 1; }
    if ((code === "DBL" || code === "TWN") && adults === 2 && rand() < 0.08) children = 1;
    const meal = weighted({ BB: 70, HB: 25, RO: 5 });
    const { total, nightly } = stayPrice(base, checkIn, nights, adults, children, meal);
    const [leadMin, leadMax] = LEAD_DAYS[channel];
    const lead = randInt(leadMin, leadMax);
    const bookedAt = new Date(toDate(addDays(checkIn, -lead)).getTime() + randInt(8, 22) * 3600_000);

    let status: (typeof s.reservationStatus.enumValues)[number];
    if (cancelled) status = "cancelled";
    else if (checkOut <= TODAY) status = rand() < (COMMISSION[channel] ? 0.04 : 0.015) ? "no_show" : "checked_out";
    else if (checkIn <= TODAY) status = "checked_in";
    else status = ["direct_web", "whatsapp", "phone"].includes(channel) && rand() < 0.15 ? "pending" : "confirmed";

    // A no-show is charged one night; a cancellation nothing.
    const billed = status === "cancelled" ? 0 : status === "no_show" ? round3(total / nights) : total;
    const id = randomUUID();
    resRows.push({
      id,
      code: "", // assigned after sorting by booking time
      guestId: getGuest(nat),
      status,
      channel,
      checkIn,
      checkOut,
      adults,
      children,
      mealPlan: meal,
      totalAmount: billed,
      commissionAmount: round3(billed * (COMMISSION[channel] ?? 0)),
      createdByUserId: ["phone", "walk_in", "whatsapp"].includes(channel) ? staffId : null,
      bookedAt,
      cancelledAt: cancelled ? new Date(Math.min(bookedAt.getTime() + randInt(1, Math.max(1, lead)) * DAY, toDate(checkIn).getTime())) : null,
      cancellationReason: cancelled ? pick(["Changement de programme", "Raison personnelle", "Trouvé moins cher", "Vol annulé", null]) : null,
    });
    resRoomRows.push({
      reservationId: id,
      roomTypeId,
      roomId: room && !cancelled ? room.id : null,
      checkIn,
      checkOut,
      nightlyRate: nightly,
      isActive: !(status === "cancelled" || status === "no_show"),
    });

    // Payments
    const method = () => weighted({ cash: 60, card: 25, bank_transfer: 15 });
    if (status === "checked_out" || status === "no_show") {
      payRows.push({ reservationId: id, amount: billed, method: method(), paidAt: new Date(toDate(checkOut).getTime() + 10 * 3600_000), recordedByUserId: staffId });
    } else if (status === "checked_in" && rand() < 0.5) {
      payRows.push({ reservationId: id, amount: round3(billed * 0.3), method: method(), paidAt: new Date(toDate(checkIn).getTime() + 15 * 3600_000), recordedByUserId: staffId });
    } else if (status === "confirmed" && ["direct_web", "phone", "whatsapp"].includes(channel) && rand() < 0.35) {
      payRows.push({ reservationId: id, amount: round3(billed * 0.3), method: weighted({ bank_transfer: 70, card: 30 }), paidAt: new Date(bookedAt.getTime() + DAY), recordedByUserId: staffId });
    }
  }

  for (const room of roomRows) {
    let d = START;
    while (d < END) {
      const daysAhead = diffDays(TODAY, d);
      let occ = OCC[toDate(d).getUTCMonth()];
      if (daysAhead > 0) occ *= Math.max(0.1, 1 - daysAhead / 150); // not all future bookings are in yet
      const L = 3;
      const pStart = occ / (L * (1 - occ) + occ);
      if (rand() < pStart) {
        const nights = Math.min(losSample(), diffDays(d, END));
        if (nights < 1) break;
        makeReservation(room, room.code, room.base, room.roomTypeId, d, nights, false);
        // ~10% extra bookings that were cancelled (never occupied the room)
        if (rand() < 0.1) {
          makeReservation(null, room.code, room.base, room.roomTypeId, addDays(d, randInt(-10, 10)), randInt(1, 5), true);
        }
        d = addDays(d, nights);
      } else {
        d = addDays(d, 1);
      }
    }
  }

  // Human-readable codes in booking order: NZ-26-00001
  resRows.sort((a, b) => a.bookedAt!.getTime() - b.bookedAt!.getTime());
  resRows.forEach((r, i) => {
    r.code = `NZ-${String(r.bookedAt!.getUTCFullYear()).slice(2)}-${String(i + 1).padStart(5, "0")}`;
  });

  const chunk = <T>(arr: T[], size = 500) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
  await db.transaction(async (tx) => {
    for (const c of chunk(guestRows)) await tx.insert(s.guests).values(c);
    for (const c of chunk(resRows)) await tx.insert(s.reservations).values(c);
    for (const c of chunk(resRoomRows)) await tx.insert(s.reservationRooms).values(c);
    for (const c of chunk(payRows)) await tx.insert(s.payments).values(c);
  });

  /* Housekeeping: rooms freed today or currently occupied need cleaning */
  await db.execute(sql`
    UPDATE rooms SET housekeeping = 'dirty'
    WHERE id IN (
      SELECT room_id FROM reservation_rooms
      WHERE is_active AND room_id IS NOT NULL
        AND (check_out = ${TODAY}::date OR (check_in <= ${TODAY}::date AND check_out > ${TODAY}::date))
    )`);
  await db.update(s.rooms).set({ status: "out_of_order", notes: "Climatisation en panne, technicien prévu" }).where(sql`number = '305'`);

  /* A few starter alerts */
  const arrivals = resRows.filter((r) => r.checkIn === TODAY && ["confirmed", "pending"].includes(r.status!)).length;
  const pendingCount = resRows.filter((r) => r.status === "pending").length;
  await db.insert(s.alerts).values([
    { type: "arrivals_today", severity: "info", title: `${arrivals} arrivée(s) prévue(s) aujourd'hui`, dedupeKey: `arrivals:${TODAY}` },
    { type: "new_booking", severity: "warning", title: `${pendingCount} réservation(s) en attente de confirmation`, dedupeKey: `pending:${TODAY}` },
  ]);

  /* Summary */
  const { rows } = await pool.query<{ k: string; v: string }>(`
    WITH nights AS (
      SELECT rr.room_id, g::date AS night, rr.nightly_rate
      FROM reservation_rooms rr, generate_series(rr.check_in, rr.check_out - 1, '1 day') g
      JOIN reservations r ON true
      WHERE r.id = rr.reservation_id AND rr.is_active AND rr.room_id IS NOT NULL
    )
    SELECT 'occupancy_last_12m' k, round(100.0 * count(*) FILTER (WHERE night < $1::date AND night >= $1::date - 365) / (30 * 365), 1)::text v FROM nights
    UNION ALL SELECT 'adr_last_12m_tnd', round(avg(nightly_rate) FILTER (WHERE night < $1::date AND night >= $1::date - 365), 1)::text FROM nights
    UNION ALL SELECT 'reservations', count(*)::text FROM reservations
    UNION ALL SELECT 'guests', count(*)::text FROM guests
    UNION ALL SELECT 'commission_paid_last_12m_tnd', round(sum(commission_amount) FILTER (WHERE check_out <= $1::date AND check_in >= $1::date - 365), 0)::text FROM reservations
  `, [TODAY]);
  console.table(Object.fromEntries(rows.map((r) => [r.k, r.v])));
  if (!process.env.SEED_ADMIN_PASSWORD) console.log(`admin@lesoliviers.example / ${adminPw}`);
  if (!process.env.SEED_STAFF_PASSWORD) console.log(`reception@lesoliviers.example / ${staffPw}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
