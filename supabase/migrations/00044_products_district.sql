-- Optional neighborhood / district label for marketplace products (free text).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS district TEXT;
