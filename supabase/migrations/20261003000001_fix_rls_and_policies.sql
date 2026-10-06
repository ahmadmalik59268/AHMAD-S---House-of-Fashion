-- ==============================================================================
-- MIGRATION: 20261003000001_fix_rls_and_policies.sql
-- Fix RLS Policies & Storage Access for AHMAD'S Fashion House
-- ==============================================================================

-- 1. Ensure user_profiles has INSERT policy for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_profiles' 
      AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON public.user_profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Ensure orders and order_items can be inserted by guests and logged-in customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'orders' 
      AND policyname = 'Anyone can create an order'
  ) THEN
    CREATE POLICY "Anyone can create an order" ON public.orders
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'order_items' 
      AND policyname = 'Anyone can insert order items'
  ) THEN
    CREATE POLICY "Anyone can insert order items" ON public.order_items
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 3. Storage Buckets (Create if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('product-videos', 'product-videos', true),
  ('collection-banners', 'collection-banners', true),
  ('category-images', 'category-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Policies: Public view, authenticated upload
DO $$
BEGIN
  -- product-images
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Product Images') THEN
    CREATE POLICY "Public Access for Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload Product Images') THEN
    CREATE POLICY "Admins can upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
  END IF;

  -- product-videos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Product Videos') THEN
    CREATE POLICY "Public Access for Product Videos" ON storage.objects FOR SELECT USING (bucket_id = 'product-videos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload Product Videos') THEN
    CREATE POLICY "Admins can upload Product Videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-videos');
  END IF;

  -- collection-banners
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Collection Banners') THEN
    CREATE POLICY "Public Access for Collection Banners" ON storage.objects FOR SELECT USING (bucket_id = 'collection-banners');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload Collection Banners') THEN
    CREATE POLICY "Admins can upload Collection Banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collection-banners');
  END IF;
END $$;
