export type ProductType = 'unstitched' | 'stitched';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Custom';

export type SleeveLining = 'without' | 'with';

export interface ProductAddOns {
  boxPackaging: boolean; // Rs. 500
  lining: boolean; // Rs. 2,000
}

export interface Product {
  id: string;
  name: string;
  code: string;
  slug: string;
  originalPrice: number; // in PKR
  salePrice: number; // in PKR
  discountPercent?: number;
  collection: 'noir-luxury' | 'luxury-formals' | 'chiffon' | 'best-sellers' | 'sale' | 'new-arrivals';
  collectionLabel: string;
  images: string[];
  videoReelUrl?: string;
  videoThumb?: string;
  fabric: string;
  colorName: string;
  colorHex: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  description: string;
  details: string[]; // Pakistani formal embroidery breakdown
  disclaimer: string;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  product: Product;
  selectedType: ProductType;
  selectedSize?: ProductSize;
  sleeveLining: SleeveLining;
  addOns: ProductAddOns;
  quantity: number;
  unitPrice: number;
}

export type CurrencyCode = 'PKR' | 'USD' | 'GBP' | 'AED' | 'EUR' | 'CAD' | 'SAR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // multiplier relative to PKR
  flag: string;
  label: string;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  country: string;
  rating: number;
  date: string;
  productCode: string;
  productName: string;
  title: string;
  comment: string;
  verifiedBuyer: boolean;
  images?: string[];
  productImage?: string;
  imageCountBadge?: string;
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'cod' | 'card' | 'easypaisa_jazzcash' | 'bank_transfer';
  orderNotes?: string;
}
