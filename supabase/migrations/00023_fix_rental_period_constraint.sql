-- Fix rental_period constraint to match UI constants

ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_rental_period_check;
ALTER TABLE properties ADD CONSTRAINT properties_rental_period_check 
  CHECK (rental_period IN ('Daily', 'Weekly', 'Monthly', '3 Months', '6 Months', '12 Months', 'Yearly', 'daily', 'weekly', 'monthly', 'yearly'));
