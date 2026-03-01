-- Migration 22: Replace 'contract' purpose with 'mid_term'
-- 1. Drop existing constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_purpose_check;

-- 2. Migrate existing rows
UPDATE properties SET purpose = 'mid_term' WHERE purpose = 'contract';

-- 3. Add new constraint
ALTER TABLE properties ADD CONSTRAINT properties_purpose_check
  CHECK (purpose IN ('short_term', 'mid_term', 'long_term'));
