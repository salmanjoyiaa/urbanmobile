-- Add installments field for payment plan (e.g. "12 months", "6 installments", or free text)
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS installments TEXT;

COMMENT ON COLUMN properties.installments IS 'Payment installments description (e.g. 12 months, 6 installments)';
