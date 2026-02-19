-- =============================================
-- UrbanSaudi Test Data Seed
-- Run AFTER 00001_initial_schema.sql + 00002_security_fixes.sql
-- =============================================
-- Real Auth UUIDs:
--   Admin:  3e4e7271-177d-401d-87f1-d24e7e76cab8 (zuhabbgoher@gmail.com)
--   Agent:  9c426ebc-929a-4f9a-9ca8-aaa50b410406 (ahmed)
--   Agent:  58e6ef85-1066-4313-b022-5a83d126fed9 (fatima)
--   Agent:  4f837cbe-50f7-4adc-b026-e7b228decf4e (khalid)
--   Agent:  5dca98d4-a12c-42b8-af88-8d8a50a7c26f (noura)
--   Agent:  197fdb41-d0af-4407-b28d-678d039c1b40 (salman)
--   Cust:   aa40fb60-afb5-4dd3-ae4b-38982043628f (sara)
--   Cust:   6c1884f7-727d-4c99-8f54-3b9ddebd91fc (yusuf)
--   Cust:   db5a4f03-b809-4f84-b3cf-b277955c8988 (layla)
--
-- NOTE: All synthetic UUIDs below use valid v4 format
--       (version nibble = 4 at pos 13, variant nibble = 8/9/a/b at pos 17)
-- =============================================

-- =============================================
-- 1. PROFILES — upsert (handles both fresh inserts and existing rows)
-- =============================================
INSERT INTO public.profiles (id, email, full_name, phone, role) VALUES
  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'zuhabbgoher@gmail.com', 'Zuhab Gohar',       '+923177779990', 'admin'),
  ('9c426ebc-929a-4f9a-9ca8-aaa50b410406', 'ahmed@urbansaudi.com',  'Ahmed Al-Dosari',    '+966502345678', 'agent'),
  ('58e6ef85-1066-4313-b022-5a83d126fed9', 'fatima@urbansaudi.com', 'Fatima Al-Harbi',    '+966503456789', 'agent'),
  ('4f837cbe-50f7-4adc-b026-e7b228decf4e', 'khalid@urbansaudi.com', 'Khalid Al-Otaibi',   '+966504567890', 'agent'),
  ('5dca98d4-a12c-42b8-af88-8d8a50a7c26f', 'noura@urbansaudi.com',  'Noura Al-Qahtani',   '+966505678901', 'agent'),
  ('197fdb41-d0af-4407-b28d-678d039c1b40', 'salman@urbansaudi.com', 'Salman Al-Sufi',     '+923349559587', 'agent'),
  ('aa40fb60-afb5-4dd3-ae4b-38982043628f', 'sara@customer.com',     'Sara Al-Mutairi',    '+966507890123', 'customer'),
  ('6c1884f7-727d-4c99-8f54-3b9ddebd91fc', 'yusuf@customer.com',    'Yusuf Al-Zahrani',   '+966508901234', 'customer'),
  ('db5a4f03-b809-4f84-b3cf-b277955c8988', 'layla@customer.com',    'Layla Al-Ghamdi',    '+966509012345', 'customer')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone     = EXCLUDED.phone,
  role      = EXCLUDED.role;

-- =============================================
-- 1b. CLEANUP — remove old seed data so re-runs work cleanly
-- (order respects foreign keys: children first, parents last)
-- =============================================
DELETE FROM public.audit_log WHERE actor_id = '3e4e7271-177d-401d-87f1-d24e7e76cab8';
DELETE FROM public.notifications WHERE user_id IN (
  '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
  '58e6ef85-1066-4313-b022-5a83d126fed9',
  '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
  '197fdb41-d0af-4407-b28d-678d039c1b40',
  '3e4e7271-177d-401d-87f1-d24e7e76cab8'
);
DELETE FROM public.buy_requests WHERE product_id IN (
  SELECT id FROM public.products WHERE agent_id IN (
    SELECT id FROM public.agents WHERE profile_id IN (
      '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
      '58e6ef85-1066-4313-b022-5a83d126fed9',
      '4f837cbe-50f7-4adc-b026-e7b228decf4e',
      '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
      '197fdb41-d0af-4407-b28d-678d039c1b40'
    )
  )
);
DELETE FROM public.visit_requests WHERE property_id IN (
  SELECT id FROM public.properties WHERE agent_id IN (
    SELECT id FROM public.agents WHERE profile_id IN (
      '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
      '58e6ef85-1066-4313-b022-5a83d126fed9',
      '4f837cbe-50f7-4adc-b026-e7b228decf4e',
      '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
      '197fdb41-d0af-4407-b28d-678d039c1b40'
    )
  )
);
DELETE FROM public.products WHERE agent_id IN (
  SELECT id FROM public.agents WHERE profile_id IN (
    '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
    '58e6ef85-1066-4313-b022-5a83d126fed9',
    '4f837cbe-50f7-4adc-b026-e7b228decf4e',
    '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
    '197fdb41-d0af-4407-b28d-678d039c1b40'
  )
);
DELETE FROM public.properties WHERE agent_id IN (
  SELECT id FROM public.agents WHERE profile_id IN (
    '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
    '58e6ef85-1066-4313-b022-5a83d126fed9',
    '4f837cbe-50f7-4adc-b026-e7b228decf4e',
    '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
    '197fdb41-d0af-4407-b28d-678d039c1b40'
  )
);
DELETE FROM public.agents WHERE profile_id IN (
  '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
  '58e6ef85-1066-4313-b022-5a83d126fed9',
  '4f837cbe-50f7-4adc-b026-e7b228decf4e',
  '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
  '197fdb41-d0af-4407-b28d-678d039c1b40'
);

-- =============================================
-- 2. AGENTS  (UUIDs: a0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- =============================================
INSERT INTO public.agents (id, profile_id, license_number, company_name, bio, status, reviewed_by, reviewed_at) VALUES
  ('a0000001-0000-4000-8000-000000000010', '9c426ebc-929a-4f9a-9ca8-aaa50b410406',
   'RE-2024-001', 'Dosari Properties', 'Experienced Riyadh property specialist with 12 years in the market.',
   'approved', '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '30 days'),

  ('a0000002-0000-4000-8000-000000000011', '58e6ef85-1066-4313-b022-5a83d126fed9',
   'RE-2024-002', 'Harbi Real Estate', 'Jeddah residential expert. Specializing in villas and luxury apartments.',
   'approved', '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '25 days'),

  ('a0000003-0000-4000-8000-000000000012', '4f837cbe-50f7-4adc-b026-e7b228decf4e',
   'RE-2024-003', 'Otaibi Group', 'Commercial and office space specialist in Eastern Province.',
   'approved', '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '20 days'),

  ('a0000004-0000-4000-8000-000000000013', '5dca98d4-a12c-42b8-af88-8d8a50a7c26f',
   'RE-2024-004', 'Qahtani Homes', 'New agent specializing in Medina family homes.',
   'pending', NULL, NULL),

  ('a0000005-0000-4000-8000-000000000014', '197fdb41-d0af-4407-b28d-678d039c1b40',
   NULL, NULL, 'Invalid license submitted.',
   'rejected', '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '10 days');

UPDATE public.agents SET rejection_reason = 'License number could not be verified. Please resubmit with valid documentation.'
  WHERE id = 'a0000005-0000-4000-8000-000000000014';

-- =============================================
-- 3. PROPERTIES  (UUIDs: e0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- =============================================
INSERT INTO public.properties (id, agent_id, title, description, type, purpose, price, city, district, bedrooms, bathrooms, area_sqm, year_built, amenities, images, status) VALUES
  ('e0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000010',
   'Luxury Penthouse in Al-Olaya', 'Stunning two-level penthouse with panoramic city views. Italian marble floors, smart home system, and private rooftop terrace.',
   'apartment', 'sale', 2850000.00, 'Riyadh', 'Al-Olaya', 4, 5, 320.00, 2023,
   ARRAY['parking', 'pool', 'gym', 'elevator', 'security', 'central_ac'],
   ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'], 'active'),

  ('e0000002-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000010',
   'Modern Studio near KAFD', 'Compact studio ideal for professionals. Walking distance to King Abdullah Financial District.',
   'studio', 'rent', 4500.00, 'Riyadh', 'Al-Aqiq', 1, 1, 55.00, 2022,
   ARRAY['parking', 'elevator', 'security', 'central_ac'],
   ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'], 'active'),

  ('e0000003-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000010',
   'Family Villa with Garden', 'Spacious villa in a quiet compound with large garden, pool, and maid''s quarters.',
   'villa', 'sale', 3200000.00, 'Riyadh', 'Al-Nakheel', 5, 6, 480.00, 2020,
   ARRAY['parking', 'pool', 'garden', 'security', 'central_ac', 'maid_room'],
   ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'], 'active'),

  ('e0000004-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000010',
   'Draft: Warehouse Space', 'Large warehouse near industrial area.',
   'land', 'rent', 15000.00, 'Riyadh', 'Industrial City', NULL, NULL, 2000.00, 2015,
   ARRAY['parking'],
   ARRAY['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'], 'draft'),

  ('e0000005-0000-4000-8000-000000000005', 'a0000002-0000-4000-8000-000000000011',
   'Sea-View Apartment in Corniche', 'Beautiful apartment with direct Red Sea views. Premium finishes and balcony.',
   'apartment', 'rent', 8500.00, 'Jeddah', 'Al-Corniche', 3, 3, 180.00, 2021,
   ARRAY['parking', 'pool', 'gym', 'elevator', 'security'],
   ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'], 'active'),

  ('e0000006-0000-4000-8000-000000000006', 'a0000002-0000-4000-8000-000000000011',
   'Traditional Jeddah Villa', 'Elegant villa blending traditional Saudi architecture with modern comforts.',
   'villa', 'sale', 4500000.00, 'Jeddah', 'Al-Rawdah', 6, 7, 550.00, 2019,
   ARRAY['parking', 'pool', 'garden', 'security', 'central_ac', 'maid_room', 'driver_room'],
   ARRAY['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80', 'https://images.unsplash.com/photo-1600566753086-00f18f6b6b58?w=800&q=80'], 'active'),

  ('e0000007-0000-4000-8000-000000000007', 'a0000002-0000-4000-8000-000000000011',
   'Duplex near Jeddah Tower', 'Spacious duplex with modern design near the upcoming Jeddah Tower project.',
   'duplex', 'sale', 1950000.00, 'Jeddah', 'Obhur', 4, 4, 280.00, 2023,
   ARRAY['parking', 'gym', 'elevator', 'security', 'central_ac'],
   ARRAY['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'], 'active'),

  ('e0000008-0000-4000-8000-000000000008', 'a0000003-0000-4000-8000-000000000012',
   'Class A Office Space', 'Premium office floor in Khobar business district. 24/7 access and parking.',
   'office', 'rent', 25000.00, 'Khobar', 'Business District', NULL, 2, 350.00, 2022,
   ARRAY['parking', 'elevator', 'security', 'central_ac'],
   ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'], 'active'),

  ('e0000009-0000-4000-8000-000000000009', 'a0000003-0000-4000-8000-000000000012',
   'Beachfront Land in Dammam', 'Large plot of land with beach access. Perfect for resort or residential development.',
   'land', 'sale', 8500000.00, 'Dammam', 'Coastal Road', NULL, NULL, 5000.00, NULL,
   ARRAY[]::TEXT[],
   ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'], 'active'),

  ('e0000010-0000-4000-8000-000000000010', 'a0000003-0000-4000-8000-000000000012',
   'Sold: Executive Villa', 'Previously sold executive villa.',
   'villa', 'sale', 2100000.00, 'Khobar', 'Al-Thuqbah', 4, 3, 350.00, 2018,
   ARRAY['parking', 'pool', 'garden', 'security'],
   ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'], 'sold')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 4. PRODUCTS  (UUIDs: d0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- =============================================
INSERT INTO public.products (id, agent_id, title, description, category, condition, price, city, images) VALUES
  ('d0000001-0000-4000-8000-000000000001', 'a0000001-0000-4000-8000-000000000010',
   'Italian Leather Sofa Set', 'Genuine Italian leather 3+2+1 sofa set. Barely used for 6 months.',
   'furniture', 'like_new', 8500.00, 'Riyadh',
   ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80']),
  ('d0000002-0000-4000-8000-000000000002', 'a0000001-0000-4000-8000-000000000010',
   'Samsung 75" QLED TV', '75 inch Samsung QLED 4K Smart TV with wall mount included.',
   'electronics', 'good', 3200.00, 'Riyadh',
   ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80']),
  ('d0000003-0000-4000-8000-000000000003', 'a0000001-0000-4000-8000-000000000010',
   'Bosch Dishwasher', 'Bosch Series 6 built-in dishwasher. Works perfectly.',
   'appliances', 'good', 1800.00, 'Riyadh',
   ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80']),
  ('d0000004-0000-4000-8000-000000000004', 'a0000001-0000-4000-8000-000000000010',
   'Persian Rug 3x5m', 'Hand-knotted Persian rug with traditional patterns.',
   'decor', 'like_new', 12000.00, 'Riyadh',
   ARRAY['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80']),
  ('d0000005-0000-4000-8000-000000000005', 'a0000002-0000-4000-8000-000000000011',
   'Complete Kitchen Set', 'Full kitchen cabinet set with granite countertop.',
   'kitchen', 'good', 15000.00, 'Jeddah',
   ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80']),
  ('d0000006-0000-4000-8000-000000000006', 'a0000002-0000-4000-8000-000000000011',
   'Garden Furniture Set', 'Outdoor rattan sofa + table + 4 chairs. UV resistant.',
   'outdoor', 'like_new', 4500.00, 'Jeddah',
   ARRAY['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80']),
  ('d0000007-0000-4000-8000-000000000007', 'a0000002-0000-4000-8000-000000000011',
   'LG Side-by-Side Refrigerator', 'LG InstaView 674L refrigerator with ice maker.',
   'appliances', 'good', 3800.00, 'Jeddah',
   ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80']),
  ('d0000008-0000-4000-8000-000000000008', 'a0000002-0000-4000-8000-000000000011',
   'King Size Bed Frame', 'Solid oak king size bed frame with headboard. No mattress.',
   'furniture', 'fair', 2200.00, 'Jeddah',
   ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80']),
  ('d0000009-0000-4000-8000-000000000009', 'a0000003-0000-4000-8000-000000000012',
   'Office Desk Set (4 units)', 'Set of 4 modern office desks with cable management.',
   'furniture', 'good', 6000.00, 'Khobar',
   ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80']),
  ('d0000010-0000-4000-8000-000000000010', 'a0000003-0000-4000-8000-000000000012',
   'Dyson Air Purifier', 'Dyson Pure Cool TP07. HEPA filter, WiFi enabled.',
   'electronics', 'new', 2400.00, 'Dammam',
   ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80']),
  ('d0000011-0000-4000-8000-000000000011', 'a0000003-0000-4000-8000-000000000012',
   'Swimming Pool Equipment', 'Pool pump, filter, chemical set, and cleaning robot.',
   'outdoor', 'fair', 5500.00, 'Khobar',
   ARRAY['https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80']),
  ('d0000012-0000-4000-8000-000000000012', 'a0000003-0000-4000-8000-000000000012',
   'Commercial Coffee Machine', 'La Marzocca Linea Mini. Perfect condition. Moving sale.',
   'kitchen', 'like_new', 9500.00, 'Dammam',
   ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80'])
ON CONFLICT (id) DO NOTHING;

UPDATE public.products SET is_available = false WHERE id = 'd0000008-0000-4000-8000-000000000008';

-- =============================================
-- 5. VISIT REQUESTS  (UUIDs: f0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- =============================================
INSERT INTO public.visit_requests (id, property_id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status, admin_notes, confirmed_by, confirmed_at) VALUES
  ('f0000001-0000-4000-8000-000000000001', 'e0000001-0000-4000-8000-000000000001',
   'Sara Al-Mutairi', 'sara@customer.com', '+966507890123',
   CURRENT_DATE + interval '3 days', '10:00', 'pending', NULL, NULL, NULL),

  ('f0000002-0000-4000-8000-000000000002', 'e0000005-0000-4000-8000-000000000005',
   'Yusuf Al-Zahrani', 'yusuf@customer.com', '+966508901234',
   CURRENT_DATE + interval '5 days', '14:00', 'pending', NULL, NULL, NULL),

  ('f0000003-0000-4000-8000-000000000003', 'e0000003-0000-4000-8000-000000000003',
   'Layla Al-Ghamdi', 'layla@customer.com', '+966509012345',
   CURRENT_DATE + interval '2 days', '11:00', 'confirmed',
   'Visitor confirmed via WhatsApp.',
   '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '1 day'),

  ('f0000004-0000-4000-8000-000000000004', 'e0000002-0000-4000-8000-000000000002',
   'Sara Al-Mutairi', 'sara@customer.com', '+966507890123',
   CURRENT_DATE - interval '2 days', '09:00', 'cancelled',
   'Visitor cancelled — schedule conflict.', NULL, NULL),

  ('f0000005-0000-4000-8000-000000000005', 'e0000006-0000-4000-8000-000000000006',
   'Yusuf Al-Zahrani', 'yusuf@customer.com', '+966508901234',
   CURRENT_DATE - interval '7 days', '15:00', 'completed',
   'Visit completed. Buyer expressed strong interest.',
   '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '8 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 6. BUY REQUESTS  (UUIDs: b0xxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx)
-- =============================================
INSERT INTO public.buy_requests (id, product_id, buyer_name, buyer_email, buyer_phone, message, status, admin_notes, confirmed_by, confirmed_at) VALUES
  ('b0000001-0000-4000-8000-000000000001', 'd0000001-0000-4000-8000-000000000001',
   'Sara Al-Mutairi', 'sara@customer.com', '+966507890123',
   'Is the sofa available for immediate pickup in Riyadh?',
   'pending', NULL, NULL, NULL),

  ('b0000002-0000-4000-8000-000000000002', 'd0000009-0000-4000-8000-000000000009',
   'Layla Al-Ghamdi', 'layla@customer.com', '+966509012345',
   'Can you deliver to Dammam?',
   'pending', NULL, NULL, NULL),

  ('b0000003-0000-4000-8000-000000000003', 'd0000004-0000-4000-8000-000000000004',
   'Yusuf Al-Zahrani', 'yusuf@customer.com', '+966508901234',
   'Beautiful rug. I would like to see it in person first.',
   'confirmed', 'Buyer meeting scheduled for Saturday.',
   '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '3 days'),

  ('b0000004-0000-4000-8000-000000000004', 'd0000012-0000-4000-8000-000000000012',
   'Sara Al-Mutairi', 'sara@customer.com', '+966507890123',
   'Offering 7000 SAR.',
   'rejected', 'Offer too low. Seller minimum is 9000 SAR.',
   '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '5 days'),

  ('b0000005-0000-4000-8000-000000000005', 'd0000002-0000-4000-8000-000000000002',
   'Layla Al-Ghamdi', 'layla@customer.com', '+966509012345',
   NULL,
   'completed', 'Transaction completed. Payment received.',
   '3e4e7271-177d-401d-87f1-d24e7e76cab8', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 7. NOTIFICATIONS  (use real profile UUIDs for user_id FK)
-- =============================================
INSERT INTO public.notifications (user_id, title, body, type, read) VALUES
  ('9c426ebc-929a-4f9a-9ca8-aaa50b410406', 'New visit request',
   'Sara Al-Mutairi requested a visit to Luxury Penthouse in Al-Olaya', 'visit_request', false),
  ('9c426ebc-929a-4f9a-9ca8-aaa50b410406', 'New buy request',
   'Sara wants to buy Italian Leather Sofa Set', 'buy_request', false),
  ('58e6ef85-1066-4313-b022-5a83d126fed9', 'New visit request',
   'Yusuf Al-Zahrani requested a visit to Sea-View Apartment', 'visit_request', false),
  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'New agent pending',
   'Noura Al-Qahtani has applied as agent', 'agent_pending', false),
  ('5dca98d4-a12c-42b8-af88-8d8a50a7c26f', 'Application received',
   'Your agent application is under review', 'agent_status', true),
  ('197fdb41-d0af-4407-b28d-678d039c1b40', 'Application rejected',
   'Your agent application has been rejected', 'agent_status', true);

-- =============================================
-- 8. AUDIT LOG  (use real admin UUID for actor_id FK)
-- =============================================
INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, metadata, created_at) VALUES
  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'approve_agent', 'agent',
   'a0000001-0000-4000-8000-000000000010',
   '{"agent_name": "Ahmed Al-Dosari"}', now() - interval '30 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'approve_agent', 'agent',
   'a0000002-0000-4000-8000-000000000011',
   '{"agent_name": "Fatima Al-Harbi"}', now() - interval '25 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'approve_agent', 'agent',
   'a0000003-0000-4000-8000-000000000012',
   '{"agent_name": "Khalid Al-Otaibi"}', now() - interval '20 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'reject_agent', 'agent',
   'a0000005-0000-4000-8000-000000000014',
   '{"agent_name": "Salman Al-Sufi", "reason": "Invalid license"}', now() - interval '10 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'confirm_visit', 'visit_request',
   'f0000003-0000-4000-8000-000000000003',
   '{"visitor": "Layla Al-Ghamdi", "property": "Family Villa with Garden"}', now() - interval '1 day'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'confirm_buy', 'buy_request',
   'b0000003-0000-4000-8000-000000000003',
   '{"buyer": "Yusuf Al-Zahrani", "product": "Persian Rug 3x5m"}', now() - interval '3 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'reject_buy', 'buy_request',
   'b0000004-0000-4000-8000-000000000004',
   '{"buyer": "Sara Al-Mutairi", "product": "Commercial Coffee Machine"}', now() - interval '5 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'complete_visit', 'visit_request',
   'f0000005-0000-4000-8000-000000000005',
   '{"visitor": "Yusuf Al-Zahrani", "property": "Traditional Jeddah Villa"}', now() - interval '7 days'),

  ('3e4e7271-177d-401d-87f1-d24e7e76cab8', 'complete_buy', 'buy_request',
   'b0000005-0000-4000-8000-000000000005',
   '{"buyer": "Layla Al-Ghamdi", "product": "Samsung 75 QLED TV"}', now() - interval '10 days');
