-- =============================================
-- Migration 17: Property Features Overhaul
-- - Add broker_fee, cover_image_index, blocked_dates columns
-- - Update status enum: (draft,active,rented,archived) → (pending,available,sold,rented,reserved)
-- - Migrate existing status data
-- =============================================

-- 1. Add new columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS broker_fee TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image_index INT DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS blocked_dates DATE[] DEFAULT '{}';

-- 2. Drop old constraint FIRST so we can write new values
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- 3. Migrate existing statuses
UPDATE properties SET status = 'available' WHERE status = 'active';
UPDATE properties SET status = 'available' WHERE status = 'draft';
UPDATE properties SET status = 'available' WHERE status = 'archived';

-- 4. Add new constraint
ALTER TABLE properties ADD CONSTRAINT properties_status_check
  CHECK (status IN ('pending', 'available', 'sold', 'rented', 'reserved'));
