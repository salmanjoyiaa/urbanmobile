-- Add rental cadence and security deposit columns to properties

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS rental_period TEXT CHECK (rental_period IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(12,2);

-- Update existing rent properties to have a default rental_period if null
UPDATE properties 
SET rental_period = 'yearly' 
WHERE purpose = 'rent' AND rental_period IS NULL;
