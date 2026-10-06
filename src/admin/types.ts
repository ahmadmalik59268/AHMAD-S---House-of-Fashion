export type AdminRole = 'super_admin' | 'manager' | 'customer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLogin: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded' | 'Failed';

export interface AdminOrderItem {
  productId: string;
  productName: string;
  productCode: string;
  image: string;
  selectedType: 'unstitched' | 'stitched';
  selectedSize?: string;
  sleeveLining: 'without' | 'with';
  quantity: number;
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  country: string;
  items: AdminOrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'card' | 'easypaisa_jazzcash' | 'bank_transfer';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'Blocked';
  joinedDate: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  status: 'Enabled' | 'Disabled';
  description: string;
}

export interface AdminInventoryItem {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
}

export interface StockHistoryLog {
  id: string;
  sku: string;
  productName: string;
  changeAmount: number; // e.g. +20 or -5
  previousStock: number;
  newStock: number;
  reason: 'Restock' | 'Order Deduction' | 'Damage / Defect' | 'Audit Correction' | 'Return';
  adminUser: string;
  timestamp: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g., 10 for 10% or 1000 for Rs 1000
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  status: 'Active' | 'Disabled' | 'Expired';
}

export interface StoreBanner {
  id: string;
  title: string;
  subtitle: string;
  announcementText: string;
  bannerImage: string;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  orderNumber: string;
  customerName: string;
  paymentMethod: 'cod' | 'card' | 'easypaisa_jazzcash' | 'bank_transfer';
  amount: number;
  paymentStatus: PaymentStatus;
  date: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRatePercent: number;
  includeTaxInPrices: boolean;
  autoConfirmCOD: boolean;
  lowStockAlertThreshold: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}
