-- =============================================
-- Fix: handle_new_user trigger — prevent crash on duplicate profile
-- The auth.signUp() call fails with "Database error saving new user"
-- when the trigger tries to INSERT a profile that already exists.
-- Adding ON CONFLICT (id) DO NOTHING makes it idempotent.
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
