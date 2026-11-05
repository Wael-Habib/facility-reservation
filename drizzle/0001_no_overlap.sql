-- Double-booking protection enforced by PostgreSQL itself.
-- An assigned room cannot hold two active stays whose night ranges overlap.
-- Ranges are [check_in, check_out): checking out on the 5th and a new guest
-- checking in on the 5th is allowed.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "reservation_rooms"
  ADD CONSTRAINT "reservation_rooms_no_overlap"
  EXCLUDE USING gist (
    "room_id" WITH =,
    daterange("check_in", "check_out", '[)') WITH &&
  )
  WHERE ("is_active" AND "room_id" IS NOT NULL);
--> statement-breakpoint
-- Keep reservation_rooms.is_active in sync with the parent reservation status,
-- so cancelling a reservation frees its rooms automatically.
CREATE OR REPLACE FUNCTION sync_reservation_rooms_active() RETURNS trigger AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE "reservation_rooms"
      SET "is_active" = NEW.status NOT IN ('cancelled', 'no_show')
      WHERE "reservation_id" = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "reservations_sync_rooms_active"
  AFTER UPDATE OF "status" ON "reservations"
  FOR EACH ROW EXECUTE FUNCTION sync_reservation_rooms_active();
