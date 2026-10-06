-- ==============================================================================
-- AHMAD'S - House of Fashion: Complete Supabase PostgreSQL Schema Migration
-- Phase 2 Backend Foundation
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom ENUM Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('Cash on Delivery', 'Card', 'Bank Transfer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Failed', 'Refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE stitching_type AS ENUM ('unstitched', 'stitched');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE product_size AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'Custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sleeve_lining AS ENUM ('without', 'with');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Utility Function: Updated At Timestamp Handler
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABLE CREATION
-- ==============================================================================

-- 4.1 user_profiles (Synced with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.2 categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.3 collections
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.4 products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  collection_slug TEXT,
  collection_label TEXT,
  fabric TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT DEFAULT '#000000' NOT NULL,
  original_price NUMERIC(12, 2) NOT NULL,
  sale_price NUMERIC(12, 2) NOT NULL,
  discount_percent INTEGER DEFAULT 0 NOT NULL,
  stock_quantity INTEGER DEFAULT 10 NOT NULL,
  in_stock BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_new BOOLEAN DEFAULT false NOT NULL,
  is_best_seller BOOLEAN DEFAULT false NOT NULL,
  is_sale BOOLEAN DEFAULT false NOT NULL,
  disclaimer TEXT DEFAULT 'Please note that the color of the item you receive may vary slightly from that shown in the product shoot. This can happen due to the variation in light at the time of photography. All products are 100% original and work may vary slightly.' NOT NULL,
  specifications JSONB DEFAULT '[]'::jsonb NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.5 product_images
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.6 product_videos
CREATE TABLE IF NOT EXISTS public.product_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  duration_seconds INTEGER,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.7 product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  stitching_type stitching_type NOT NULL,
  size product_size,
  sku TEXT,
  price_adjustment NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  stock_quantity INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.8 wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.9 wishlist_items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(wishlist_id, product_id)
);

-- 4.10 carts
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.11 cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  stitching_type stitching_type DEFAULT 'unstitched'::stitching_type NOT NULL,
  size product_size,
  sleeve_lining sleeve_lining DEFAULT 'without'::sleeve_lining NOT NULL,
  box_packaging BOOLEAN DEFAULT false NOT NULL,
  lining BOOLEAN DEFAULT false NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  tailoring_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.12 addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'Pakistan' NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.13 orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  stitching_total NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  add_ons_total NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  shipping_fee NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  currency_code TEXT DEFAULT 'PKR' NOT NULL,
  currency_rate NUMERIC(10, 4) DEFAULT 1.0000 NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'Pending'::payment_status NOT NULL,
  order_status order_status DEFAULT 'Pending'::order_status NOT NULL,
  coupon_code TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.14 order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_image_url TEXT,
  stitching_type stitching_type NOT NULL,
  size product_size,
  sleeve_lining sleeve_lining NOT NULL,
  box_packaging BOOLEAN DEFAULT false NOT NULL,
  lining BOOLEAN DEFAULT false NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.15 coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER,
  discount_fixed NUMERIC(12, 2),
  min_order_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0 NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.16 coupon_usage
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.17 reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  city TEXT,
  country TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  is_verified_buyer BOOLEAN DEFAULT false NOT NULL,
  is_approved BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.18 contact_messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.19 newsletter_subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4.20 site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- 5. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_collection_slug ON public.products(collection_slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(sale_price);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_product ON public.product_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist ON public.wishlist_items(wishlist_id);

-- ==============================================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- ==============================================================================

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_collections_updated_at ON public.collections;
CREATE TRIGGER trigger_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER trigger_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_carts_updated_at ON public.carts;
CREATE TRIGGER trigger_carts_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trigger_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_addresses_updated_at ON public.addresses;
CREATE TRIGGER trigger_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_coupons_updated_at ON public.coupons;
CREATE TRIGGER trigger_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. AUTH TRIGGER: AUTO-CREATE USER PROFILE ON SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, email, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    'customer'::public.user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. HELPER SECURITY FUNCTION: IS_ADMIN()
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 9.1 user_profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to user profiles" ON public.user_profiles
  FOR ALL USING (public.is_admin());

-- 9.2 categories policies (Public readable)
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- 9.3 collections policies (Public readable)
CREATE POLICY "Public can view active collections" ON public.collections
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to collections" ON public.collections
  FOR ALL USING (public.is_admin());

-- 9.4 products policies (Public readable)
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to products" ON public.products
  FOR ALL USING (public.is_admin());

-- 9.5 product_images policies
CREATE POLICY "Public can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Admins have full access to product images" ON public.product_images
  FOR ALL USING (public.is_admin());

-- 9.6 product_videos policies
CREATE POLICY "Public can view product videos" ON public.product_videos
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to product videos" ON public.product_videos
  FOR ALL USING (public.is_admin());

-- 9.7 product_variants policies
CREATE POLICY "Public can view product variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins have full access to product variants" ON public.product_variants
  FOR ALL USING (public.is_admin());

-- 9.8 wishlists & wishlist_items policies
CREATE POLICY "Users manage their own wishlist" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage their own wishlist items" ON public.wishlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid()
    )
  );

-- 9.9 carts & cart_items policies
CREATE POLICY "Users manage their own cart" ON public.carts
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users manage their own cart items" ON public.cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.carts
      WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.user_id IS NULL)
    )
  );

-- 9.10 addresses policies
CREATE POLICY "Users manage their own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to addresses" ON public.addresses
  FOR ALL USING (public.is_admin());

-- 9.11 orders & order_items policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can create an order" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Anyone can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- 9.12 coupons policies
CREATE POLICY "Public can view active coupons" ON public.coupons
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- 9.13 coupon_usage policies
CREATE POLICY "Users can view their coupon usage" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can log coupon usage" ON public.coupon_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to coupon usage" ON public.coupon_usage
  FOR ALL USING (public.is_admin());

-- 9.14 reviews policies
CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (is_approved = true OR public.is_admin());

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins have full access to reviews" ON public.reviews
  FOR ALL USING (public.is_admin());

-- 9.15 contact_messages policies
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to contact messages" ON public.contact_messages
  FOR ALL USING (public.is_admin());

-- 9.16 newsletter_subscribers policies
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL USING (public.is_admin());

-- 9.17 site_settings policies
CREATE POLICY "Public can read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins have full access to site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- ==============================================================================
-- 10. SEED INITIAL SITE SETTINGS & DEFAULT COUPONS
-- ==============================================================================

INSERT INTO public.coupons (code, discount_percent, min_order_amount, is_active)
VALUES 
  ('AHMAD10', 10, 0, true),
  ('WELCOME10', 10, 0, true),
  ('COUTURE15', 15, 20000, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('announcement_bar', '{"text": "Shop Worldwide Stress-Free! Customs, Duties & Taxes are already covered in your shipping.", "active": true}'::jsonb, 'Top announcement banner text'),
  ('free_shipping_threshold', '{"pkr": 15000, "active": true}'::jsonb, 'Free express shipping order minimum in PKR'),
  ('contact_info', '{"email": "info@ahmads.pk", "phone": "+92 332 6109729", "timings": "12PM - 9PM Monday - Saturday", "address": "Plot #103 Gulberg Lahore"}'::jsonb, 'Store contact details')
ON CONFLICT (key) DO NOTHING;
