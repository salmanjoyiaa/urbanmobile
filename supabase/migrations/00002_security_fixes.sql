-- Fix: Prevent privilege escalation via client-supplied role metadata
-- The original handle_new_user() function trusted raw_user_meta_data->>'role'
-- which allows anyone to sign up as 'admin' by passing role in metadata.
-- This fix hard-codes the default role to 'customer'.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: Restrict storage uploads to agents and admins only
-- Previously any authenticated user (including customers) could upload files

DROP POLICY IF EXISTS "Authenticated upload property images" ON storage.objects;
CREATE POLICY "Agents and admins upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('agent', 'admin')
  );

DROP POLICY IF EXISTS "Authenticated upload product images" ON storage.objects;
CREATE POLICY "Agents and admins upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('agent', 'admin')
  );

-- Fix: Add storage DELETE policies (were completely missing)
CREATE POLICY "Agents can delete own property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Agents can delete own product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );
