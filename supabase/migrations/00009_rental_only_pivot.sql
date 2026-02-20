-- =============================================
-- Migration: Pivot to Rental-Only Platform
-- Converts property purpose from sale/rent to short_term/long_term/contract
-- Removes 'sold' status, updates existing data
-- =============================================

-- 1. Update existing property data before changing constraints
-- Convert sale → long_term, rent → long_term (default rental type)
UPDATE public.properties SET purpose = 'long_term' WHERE purpose = 'sale';
UPDATE public.properties SET purpose = 'long_term' WHERE purpose = 'rent';

-- Convert sold → archived
UPDATE public.properties SET status = 'archived' WHERE status = 'sold';

-- 2. Drop old CHECK constraints and add new ones
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_purpose_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_purpose_check
  CHECK (purpose IN ('short_term', 'long_term', 'contract'));

ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check
  CHECK (status IN ('draft', 'active', 'rented', 'archived'));
