-- Migration 20: Add dining_areas column to properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS dining_areas INTEGER;
