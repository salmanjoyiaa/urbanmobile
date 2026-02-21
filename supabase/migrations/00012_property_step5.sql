-- Migration 00012: Property Step 5 Additions (Visiting Team Instructions)

-- Add visiting team instructions and image columns to properties
ALTER TABLE "public"."properties"
ADD COLUMN IF NOT EXISTS "visiting_agent_instructions" TEXT,
ADD COLUMN IF NOT EXISTS "visiting_agent_image" TEXT;
