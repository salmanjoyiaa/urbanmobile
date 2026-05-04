-- Migration to add video support for properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS is_video_featured boolean DEFAULT false;
