-- =============================================
-- Migration 10: Property Details Additions
-- =============================================

-- 1. Relax the Type Constraint
-- To manage existing check constraints via altering, we first drop the existing check
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_type_check;

-- Create the new relaxed constraint that includes Commercial Space, Storage space, and Other
ALTER TABLE properties ADD CONSTRAINT properties_type_check CHECK (
    type IN (
        'apartment',
        'villa',
        'office',
        'land',
        'studio',
        'duplex',
        'commercial_space',
        'storage_space',
        'other'
    )
);

-- 2. Add new details columns
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_ref TEXT,
  ADD COLUMN IF NOT EXISTS layout TEXT,
  ADD COLUMN IF NOT EXISTS building_features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS apartment_features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS location_url TEXT,
  ADD COLUMN IF NOT EXISTS rental_period TEXT,
  ADD COLUMN IF NOT EXISTS office_fee TEXT,
  ADD COLUMN IF NOT EXISTS water_bill_included TEXT,
  ADD COLUMN IF NOT EXISTS security_deposit TEXT,
  ADD COLUMN IF NOT EXISTS nearby_places TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS drive_link TEXT;
