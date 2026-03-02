-- Migration 24: Add two_entrance and building_condition to properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS two_entrance INTEGER,
  ADD COLUMN IF NOT EXISTS building_condition TEXT;
