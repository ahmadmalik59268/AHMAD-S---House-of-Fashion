export type UserRole = 'admin' | 'customer';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Card' | 'Bank Transfer';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type StitchingType = 'unstitched' | 'stitched';
export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom';
export type SleeveLining = 'without' | 'with';

export interface DatabaseUserProfile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string;
  category_id: string | null;
  collection_id: string | null;
  collection_slug: string | null;
  collection_label: string | null;
  fabric: string;
  color_name: string;
  color_hex: string;
  original_price: number;
  sale_price: number;
  discount_percent: number;
  stock_quantity: number;
  in_stock: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  is_sale: boolean;
  disclaimer: string;
  specifications: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface DatabaseProductVideo {
  id: string;
  product_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  created_at: string;
}

export interface DatabaseOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_phone: string;
  customer_name: string;
  shipping_address: Record<string, unknown>;
  subtotal: number;
  stitching_total: number;
  add_ons_total: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  currency_code: string;
  currency_rate: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  coupon_code: string | null;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCoupon {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_fixed: number | null;
  min_order_amount: number;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseReview {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  city: string | null;
  country: string | null;
  rating: number;
  title: string;
  comment: string;
  is_verified_buyer: boolean;
  is_approved: boolean;
  created_at: string;
}
