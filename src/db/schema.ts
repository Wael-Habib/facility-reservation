import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Money: TND has 3 decimals (millimes). */
const money = (name: string) => numeric(name, { precision: 12, scale: 3, mode: "number" });
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* ---------------------------------------------------------------------------
 * Enums
 * ------------------------------------------------------------------------- */
export const userRole = pgEnum("user_role", ["admin", "staff", "guest"]);
export const roomStatus = pgEnum("room_status", ["in_service", "out_of_order"]);
export const housekeepingStatus = pgEnum("housekeeping_status", ["clean", "dirty", "inspected"]);
export const reservationStatus = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "no_show",
]);
export const bookingChannel = pgEnum("booking_channel", [
  "direct_web",
  "phone",
  "walk_in",
  "whatsapp",
  "booking_com",
  "expedia",
  "agency",
  "other",
]);
export const mealPlan = pgEnum("meal_plan", ["RO", "BB", "HB", "FB"]);
export const paymentMethod = pgEnum("payment_method", ["cash", "card", "bank_transfer", "online", "other"]);
export const alertSeverity = pgEnum("alert_severity", ["info", "warning", "critical"]);
export const alertType = pgEnum("alert_type", [
  "new_booking",
  "cancellation",
  "arrivals_today",
  "departures_today",
  "low_occupancy",
  "overbooking_risk",
  "unpaid_balance",
  "no_show",
]);

/* ---------------------------------------------------------------------------
 * Auth (Better Auth core tables + role)
 * ------------------------------------------------------------------------- */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("guest"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ---------------------------------------------------------------------------
 * Hotel configuration
 * ------------------------------------------------------------------------- */
export type Localized = { fr: string; ar: string; en: string };

/** Single-row table: the hotel this deployment serves. */
export const hotelSettings = pgTable("hotel_settings", {
  id: integer("id").primaryKey().default(1),
  name: text("name").notNull(),
  stars: integer("stars").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp"),
  email: text("email").notNull(),
  currency: text("currency").notNull().default("TND"),
  timezone: text("timezone").notNull().default("Africa/Tunis"),
  checkInTime: text("check_in_time").notNull().default("14:00"),
  checkOutTime: text("check_out_time").notNull().default("12:00"),
  /** VAT on accommodation, percent. Confirm the current rate with the hotel's accountant. */
  vatRate: numeric("vat_rate", { precision: 5, scale: 2, mode: "number" }).notNull().default(7),
  /** Tourist tax per adult per night, TND. Configurable per hotel. */
  cityTaxPerAdultNight: money("city_tax_per_adult_night").notNull().default(0),
  defaultMealPlan: mealPlan("default_meal_plan").notNull().default("BB"),
  updatedAt: updatedAt(),
});

export const roomTypes = pgTable(
  "room_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    name: jsonb("name").$type<Localized>().notNull(),
    description: jsonb("description").$type<Localized>().notNull(),
    maxAdults: integer("max_adults").notNull(),
    maxChildren: integer("max_children").notNull().default(0),
    bedConfig: text("bed_config").notNull(),
    sizeSqm: integer("size_sqm"),
    /** Base nightly rate for the whole room, breakfast included (BB). */
    baseRate: money("base_rate").notNull(),
    amenities: text("amenities").array().notNull().default(sql`'{}'::text[]`),
    photos: text("photos").array().notNull().default(sql`'{}'::text[]`),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [check("room_types_base_rate_positive", sql`${t.baseRate} > 0`)],
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull().unique(),
    floor: integer("floor").notNull(),
    roomTypeId: uuid("room_type_id")
      .notNull()
      .references(() => roomTypes.id, { onDelete: "restrict" }),
    status: roomStatus("status").notNull().default("in_service"),
    housekeeping: housekeepingStatus("housekeeping").notNull().default("clean"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("rooms_type_idx").on(t.roomTypeId)],
);

/** Price multipliers by period. Highest-priority matching season wins. */
export const rateSeasons = pgTable(
  "rate_seasons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    multiplier: numeric("multiplier", { precision: 4, scale: 2, mode: "number" }).notNull(),
    /** Null = applies to every room type. */
    roomTypeId: uuid("room_type_id").references(() => roomTypes.id, { onDelete: "cascade" }),
    priority: integer("priority").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    check("rate_seasons_dates", sql`${t.endDate} >= ${t.startDate}`),
    check("rate_seasons_multiplier", sql`${t.multiplier} > 0`),
  ],
);

/** Meal-plan supplements per person per night, relative to BB. */
export const mealPlanPrices = pgTable("meal_plan_prices", {
  plan: mealPlan("plan").primaryKey(),
  supplementPerPersonNight: money("supplement_per_person_night").notNull(),
});

/* ---------------------------------------------------------------------------
 * Guests and reservations
 * ------------------------------------------------------------------------- */
export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    /** ISO 3166-1 alpha-2 */
    nationality: text("nationality"),
    /** Filled at check-in for the police register. */
    idDocumentType: text("id_document_type"),
    idDocumentNumber: text("id_document_number"),
    dateOfBirth: date("date_of_birth"),
    notes: text("notes"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("guests_email_idx").on(t.email), index("guests_phone_idx").on(t.phone)],
);

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Human reference given to the guest, e.g. NZ-26-00123 */
    code: text("code").notNull().unique(),
    guestId: uuid("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "restrict" }),
    status: reservationStatus("status").notNull().default("pending"),
    channel: bookingChannel("channel").notNull(),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    adults: integer("adults").notNull(),
    children: integer("children").notNull().default(0),
    mealPlan: mealPlan("meal_plan").notNull().default("BB"),
    /** Total price of the stay, taxes included, TND. */
    totalAmount: money("total_amount").notNull(),
    /** Commission owed to the OTA / agency for this booking (0 for direct). */
    commissionAmount: money("commission_amount").notNull().default(0),
    specialRequests: text("special_requests"),
    internalNotes: text("internal_notes"),
    createdByUserId: text("created_by_user_id").references(() => user.id, { onDelete: "set null" }),
    bookedAt: timestamp("booked_at", { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancellationReason: text("cancellation_reason"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check("reservations_dates", sql`${t.checkOut} > ${t.checkIn}`),
    check("reservations_adults", sql`${t.adults} >= 1`),
    check("reservations_children", sql`${t.children} >= 0`),
    check("reservations_amounts", sql`${t.totalAmount} >= 0 AND ${t.commissionAmount} >= 0`),
    index("reservations_dates_idx").on(t.checkIn, t.checkOut),
    index("reservations_status_idx").on(t.status),
    index("reservations_guest_idx").on(t.guestId),
  ],
);

/**
 * One row per room in a reservation (group bookings have several).
 * `isActive` mirrors the parent status (false when cancelled / no-show) and
 * is what the database no-overlap constraint uses: an assigned room can never
 * hold two active stays on the same night. See migration 0001.
 */
export const reservationRooms = pgTable(
  "reservation_rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    roomTypeId: uuid("room_type_id")
      .notNull()
      .references(() => roomTypes.id, { onDelete: "restrict" }),
    /** Null until reception assigns a physical room. */
    roomId: uuid("room_id").references(() => rooms.id, { onDelete: "restrict" }),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    nightlyRate: money("nightly_rate").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    check("reservation_rooms_dates", sql`${t.checkOut} > ${t.checkIn}`),
    index("reservation_rooms_reservation_idx").on(t.reservationId),
    index("reservation_rooms_room_idx").on(t.roomId),
    index("reservation_rooms_type_dates_idx").on(t.roomTypeId, t.checkIn, t.checkOut),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "restrict" }),
    amount: money("amount").notNull(),
    method: paymentMethod("method").notNull(),
    reference: text("reference"),
    paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
    recordedByUserId: text("recorded_by_user_id").references(() => user.id, { onDelete: "set null" }),
  },
  (t) => [
    check("payments_amount_nonzero", sql`${t.amount} <> 0`),
    index("payments_reservation_idx").on(t.reservationId),
  ],
);

/* ---------------------------------------------------------------------------
 * Operations
 * ------------------------------------------------------------------------- */
export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: alertType("type").notNull(),
    severity: alertSeverity("severity").notNull().default("info"),
    title: text("title").notNull(),
    body: text("body"),
    reservationId: uuid("reservation_id").references(() => reservations.id, { onDelete: "cascade" }),
    /** Prevents duplicate alerts for the same event (e.g. one low-occupancy alert per day). */
    dedupeKey: text("dedupe_key"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("alerts_dedupe_idx").on(t.dedupeKey),
    index("alerts_unread_idx").on(t.readAt, t.createdAt),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    changes: jsonb("changes"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId), index("audit_created_idx").on(t.createdAt)],
);
