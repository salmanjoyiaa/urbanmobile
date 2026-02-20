-- =============================================
-- Migration: Pivot to Rental-Only Platform
-- Converts property purpose from sale/rent to short_term/long_term/contract
-- Removes 'sold' status, updates existing data
-- =============================================

-- 1. Drop old CHECK constraints first (find by column, not by guessed name)
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop all CHECK constraints on properties.purpose
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'public.properties'::regclass
      AND con.contype = 'c'
      AND att.attname = 'purpose'
  LOOP
    EXECUTE format('ALTER TABLE public.properties DROP CONSTRAINT %I', r.conname);
  END LOOP;

  -- Drop all CHECK constraints on properties.status
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'public.properties'::regclass
      AND con.contype = 'c'
      AND att.attname = 'status'
  LOOP
    EXECUTE format('ALTER TABLE public.properties DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 2. Update existing property data (now safe without CHECK constraints)
-- Convert sale → long_term, rent → long_term (default rental type)
UPDATE public.properties SET purpose = 'long_term' WHERE purpose = 'sale';
UPDATE public.properties SET purpose = 'long_term' WHERE purpose = 'rent';

-- Convert sold → archived
UPDATE public.properties SET status = 'archived' WHERE status = 'sold';

-- 3. Add new CHECK constraints
ALTER TABLE public.properties ADD CONSTRAINT properties_purpose_check
  CHECK (purpose IN ('short_term', 'long_term', 'contract'));

ALTER TABLE public.properties ADD CONSTRAINT properties_status_check
  CHECK (status IN ('draft', 'active', 'rented', 'archived'));
