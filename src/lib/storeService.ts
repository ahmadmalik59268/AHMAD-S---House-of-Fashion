import { supabase, isSupabaseConfigured } from './supabase';
import { Product, CartItem } from '../types';
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products';

export interface DbOrderPayload {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    apartment?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  stitchingTotal: number;
  addOnsTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  currencyCode: string;
  currencyRate: number;
  paymentMethod: 'Cash on Delivery' | 'Card' | 'Bank Transfer';
  couponCode?: string | null;
  specialInstructions?: string | null;
  items: CartItem[];
}

/**
 * Generic Local & Persistent Storage Helpers
 */
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // safe fallback
  }
}

/**
 * Custom Products Storage Helpers
 */
export function getStoredCustomProducts(): Product[] {
  return getStoredData<Product[]>('ahmads_custom_products', []);
}

export function saveStoredCustomProducts(products: Product[]): void {
  saveStoredData('ahmads_custom_products', products);
}

/**
 * PRODUCTS: Fetch from Supabase + Local Admin Additions, merged with high-res catalog
 */
export async function fetchLiveProducts(): Promise<Product[]> {
  const hasCustomStorage = typeof window !== 'undefined' && localStorage.getItem('ahmads_custom_products') !== null;
  const customLocalProducts = getStoredCustomProducts();
  let dbMapped: Product[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            display_order,
            is_primary
          ),
          product_videos (
            id,
            video_url,
            thumbnail_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && dbProducts && dbProducts.length > 0) {
        dbMapped = dbProducts.map((p) => {
          const imagesList = (p.product_images || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((img: any) => img.image_url);

          const activeVideo = (p.product_videos || [])[0];

          return {
            id: p.id,
            name: p.name,
            code: p.code,
            slug: p.slug,
            originalPrice: Number(p.original_price),
            salePrice: Number(p.sale_price),
            discountPercent: p.discount_percent || 0,
            collection: (p.collection_slug || 'luxury-formals') as Product['collection'],
            collectionLabel: p.collection_label || 'Luxury Formals',
            images: imagesList.length > 0 ? imagesList : ['/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg'],
            videoReelUrl: activeVideo?.video_url || undefined,
            videoThumb: activeVideo?.thumbnail_url || undefined,
            fabric: p.fabric,
            colorName: p.color_name,
            colorHex: p.color_hex,
            inStock: p.in_stock,
            isBestSeller: p.is_best_seller,
            isNew: p.is_new,
            isSale: p.is_sale,
            description: p.description || '',
            details: Array.isArray(p.specifications) ? p.specifications : [],
            disclaimer: p.disclaimer || '',
          };
        });
      }
    } catch (err) {
      console.error('fetchLiveProducts DB error:', err);
    }
  }

  // Combine: If user modified catalog in admin (hasCustomStorage), prioritize custom local & DB products
  let combined: Product[] = [];
  if (hasCustomStorage) {
    combined = [...customLocalProducts, ...dbMapped];
  } else if (dbMapped.length > 0) {
    combined = [...dbMapped, ...STATIC_PRODUCTS];
  } else {
    combined = STATIC_PRODUCTS;
  }

  const seen = new Set<string>();
  const uniqueProducts: Product[] = [];

  for (const p of combined) {
    const key = (p.id || p.code || '').toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueProducts.push(p);
    }
  }

  return uniqueProducts;
}

/**
 * CART: Save/Sync customer cart with Supabase
 */
export async function fetchSupabaseCart(userId: string): Promise<CartItem[] | null> {
  try {
    if (!isSupabaseConfigured || !userId) return null;

    // 1. Get or create cart for user
    const { data: cartData, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (cartError || !cartData) return null;

    // 2. Fetch cart items
    const { data: itemsData, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          id,
          name,
          code,
          slug,
          original_price,
          sale_price,
          fabric,
          color_name,
          color_hex,
          in_stock,
          collection_slug,
          collection_label,
          product_images (image_url, display_order)
        )
      `)
      .eq('cart_id', cartData.id);

    if (itemsError || !itemsData) return null;

    return itemsData.map((item: any) => {
      const prod = item.product || {};
      const imgList = (prod.product_images || []).map((img: any) => img.image_url);

      return {
        id: item.id,
        productId: item.product_id,
        product: {
          id: prod.id || item.product_id,
          name: prod.name || item.product_name,
          code: prod.code || '',
          slug: prod.slug || '',
          originalPrice: Number(prod.original_price || item.unit_price),
          salePrice: Number(prod.sale_price || item.unit_price),
          collection: prod.collection_slug || 'luxury-formals',
          collectionLabel: prod.collection_label || 'Luxury Formals',
          images: imgList.length > 0 ? imgList : ['/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg'],
          fabric: prod.fabric || 'Pure Organza',
          colorName: prod.color_name || 'Multi',
          colorHex: prod.color_hex || '#000',
          inStock: true,
          description: '',
          details: [],
          disclaimer: '',
        },
        selectedType: item.stitching_type || 'unstitched',
        selectedSize: item.size || 'M',
        sleeveLining: item.sleeve_lining || 'without',
        addOns: {
          boxPackaging: Boolean(item.box_packaging),
          lining: Boolean(item.lining),
        },
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
      };
    });
  } catch (err) {
    console.error('fetchSupabaseCart exception:', err);
    return null;
  }
}

export async function syncCartToSupabase(userId: string, items: CartItem[]): Promise<void> {
  try {
    if (!isSupabaseConfigured || !userId) return;

    // 1. Get or create cart row
    let { data: cartData } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!cartData) {
      const { data: newCart, error: createErr } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (createErr || !newCart) return;
      cartData = newCart;
    }

    if (!cartData) return;

    // 2. Delete existing items
    await supabase.from('cart_items').delete().eq('cart_id', cartData.id);

    // 3. Insert fresh items
    const isValidUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    const payload = items.map((it) => ({
      cart_id: cartData.id,
      product_id: isValidUUID(it.productId) ? it.productId : null,
      stitching_type: it.selectedType,
      size: it.selectedSize || 'M',
      sleeve_lining: it.sleeveLining,
      box_packaging: it.addOns.boxPackaging,
      lining: it.addOns.lining,
      quantity: it.quantity,
      unit_price: it.unitPrice,
    }));

    if (payload.length > 0) {
      await supabase.from('cart_items').insert(payload);
    }
  } catch (err) {
    console.error('syncCartToSupabase exception:', err);
  }
}

export async function submitOrderToSupabase(payload: DbOrderPayload): Promise<{ orderNumber: string; error?: string }> {
  try {
    const orderNumber = `AHM-${Math.floor(10000 + Math.random() * 90000)}`;

    // Instant Local Storage Persistence for Admin Panel
    try {
      const existingOrders = getStoredData<any[]>('ahmads_orders', []);
      const localOrderObj = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        shippingAddress: payload.shippingAddress.address,
        city: payload.shippingAddress.city || 'Pakistan',
        country: payload.shippingAddress.country || 'Pakistan',
        items: payload.items.map((it) => ({
          productId: it.productId,
          productName: it.product.name,
          productCode: it.product.code,
          image: it.product.images[0] || '',
          selectedType: it.selectedType,
          selectedSize: it.selectedSize || 'M',
          sleeveLining: it.sleeveLining,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
        subtotal: payload.subtotal,
        discountAmount: payload.discountAmount,
        shippingFee: payload.shippingFee,
        totalAmount: payload.totalAmount,
        paymentMethod:
          payload.paymentMethod === 'Card'
            ? 'card'
            : payload.paymentMethod === 'Bank Transfer'
            ? 'bank_transfer'
            : 'cod',
        paymentStatus: 'Pending',
        orderStatus: 'Pending',
        orderNotes: payload.specialInstructions || '',
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString(),
      };
      saveStoredData('ahmads_orders', [localOrderObj, ...existingOrders]);
    } catch {
      // safe fallback
    }

    if (!isSupabaseConfigured) {
      return { orderNumber };
    }

    // 1. Insert order header
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: payload.userId || null,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        shipping_address: payload.shippingAddress,
        subtotal: payload.subtotal,
        stitching_total: payload.stitchingTotal,
        add_ons_total: payload.addOnsTotal,
        shipping_fee: payload.shippingFee,
        discount_amount: payload.discountAmount,
        total_amount: payload.totalAmount,
        currency_code: payload.currencyCode,
        currency_rate: payload.currencyRate,
        payment_method: payload.paymentMethod,
        payment_status: 'Pending',
        order_status: 'Pending',
        coupon_code: payload.couponCode || null,
        special_instructions: payload.specialInstructions || null,
      })
      .select('id')
      .single();

    if (orderErr || !orderRow) {
      console.error('Supabase order insert error:', orderErr);
      return { orderNumber, error: orderErr?.message };
    }

    // 2. Insert order items
    const isValidUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    const itemsPayload = payload.items.map((item) => ({
      order_id: orderRow.id,
      product_id: isValidUUID(item.productId) ? item.productId : null,
      product_name: item.product.name,
      product_code: item.product.code,
      product_image_url: item.product.images[0] || '',
      stitching_type: item.selectedType,
      size: item.selectedSize || 'M',
      sleeve_lining: item.sleeveLining,
      box_packaging: item.addOns.boxPackaging,
      lining: item.addOns.lining,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    if (itemsPayload.length > 0) {
      const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsErr) {
        console.error('Supabase order_items insert error:', itemsErr);
      }
    }

    // 3. Clear user's cart in DB if authenticated
    if (payload.userId) {
      const { data: cartData } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', payload.userId)
        .maybeSingle();

      if (cartData) {
        await supabase.from('cart_items').delete().eq('cart_id', cartData.id);
      }
    }

    return { orderNumber };
  } catch (err: unknown) {
    console.error('submitOrderToSupabase exception:', err);
    return {
      orderNumber: `AHM-${Math.floor(10000 + Math.random() * 90000)}`,
      error: err instanceof Error ? err.message : 'Order submission error',
    };
  }
}
