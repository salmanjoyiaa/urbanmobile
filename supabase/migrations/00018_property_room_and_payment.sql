-- Migration 18: Property details – kitchens, living_rooms, drawing_rooms, payment_methods_accepted
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS kitchens INTEGER,
  ADD COLUMN IF NOT EXISTS living_rooms INTEGER,
  ADD COLUMN IF NOT EXISTS drawing_rooms INTEGER,
  ADD COLUMN IF NOT EXISTS payment_methods_accepted TEXT;
