import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  Layout,
  CreditCard,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Bell,
  Search,
  FileText,
  Star,
  Mail,
  Send,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminGuard } from './AdminGuard';
import { AdminToast } from './components/AdminToast';
import { AuditReportModal } from './components/AuditReportModal';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { InventoryPage } from './pages/InventoryPage';
import { CouponsPage } from './pages/CouponsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NewsletterPage } from './pages/NewsletterPage';
import { BannersPage } from './pages/BannersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminProfilePage } from './pages/AdminProfilePage';
import { SettingsPage } from './pages/SettingsPage';

import {
  INITIAL_ADMIN_USER,
  INITIAL_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_STOCK_LOGS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
  INITIAL_PAYMENTS,
} from './mockData';

import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';
import { fetchLiveProducts, saveStoredCustomProducts, getStoredData, saveStoredData } from '../lib/storeService';
import {
  AdminUser,
  AdminOrder,
  AdminCustomer,
  AdminCategory,
  AdminInventoryItem,
  StockHistoryLog,
  Coupon,
  StoreBanner,
  PaymentTransaction,
  StoreSettings,
  ToastMessage,
  OrderStatus,
  PaymentStatus,
} from './types';
import { Product } from '../types';

interface AdminPanelProps {
  onReturnToStore: () => void;
  onProductsChange?: (products: Product[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onReturnToStore, onProductsChange }) => {
  // Authentication State
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(INITIAL_ADMIN_USER);

  // Active Admin Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Data State with Unified Persistence
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<AdminCategory[]>(() =>
    getStoredData<AdminCategory[]>('ahmads_categories', INITIAL_CATEGORIES)
  );
  const [orders, setOrders] = useState<AdminOrder[]>(() =>
    getStoredData<AdminOrder[]>('ahmads_orders', INITIAL_ORDERS)
  );
  const [customers, setCustomers] = useState<AdminCustomer[]>(INITIAL_CUSTOMERS);
  const [inventory, setInventory] = useState<AdminInventoryItem[]>(INITIAL_INVENTORY);
  const [stockLogs, setStockLogs] = useState<StockHistoryLog[]>(INITIAL_STOCK_LOGS);
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    getStoredData<Coupon[]>('ahmads_coupons', INITIAL_COUPONS)
  );
  const [banners, setBanners] = useState<StoreBanner[]>(() =>
    getStoredData<StoreBanner[]>('ahmads_banners', INITIAL_BANNERS)
  );
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [settings, setSettings] = useState<StoreSettings>(() =>
    getStoredData<StoreSettings>('ahmads_settings', INITIAL_SETTINGS)
  );

  // Selected Order for Modal
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<AdminOrder | null>(null);

  // Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handler
  const handleAuthenticateAdmin = (email: string, pass: string): boolean => {
    if (email.toLowerCase().includes('admin')) {
      setCurrentAdminUser({
        ...INITIAL_ADMIN_USER,
        email,
        lastLogin: 'Just now',
      });
      showToast('Welcome Admin', 'Successfully logged into protected admin panel', 'success');
      return true;
    }
    return false;
  };

  const handleLogoutAdmin = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setCurrentAdminUser(null);
    showToast('Logged Out', 'Admin session terminated safely', 'info');
    onReturnToStore();
  };

  // Load live orders and products from Supabase on mount
  useEffect(() => {
    async function loadAdminData() {
      // 1. Live Orders
      try {
        const { data: dbOrders, error: orderErr } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (!orderErr && dbOrders && dbOrders.length > 0) {
          const mappedOrders: AdminOrder[] = dbOrders.map((ord: any) => ({
            id: ord.id,
            orderNumber: ord.order_number,
            customerName: ord.customer_name,
            customerEmail: ord.customer_email,
            customerPhone: ord.customer_phone,
            shippingAddress: typeof ord.shipping_address === 'object' ? ord.shipping_address?.address || '' : String(ord.shipping_address),
            city: typeof ord.shipping_address === 'object' ? ord.shipping_address?.city || 'Pakistan' : 'Pakistan',
            country: typeof ord.shipping_address === 'object' ? ord.shipping_address?.country || 'Pakistan' : 'Pakistan',
            items: (ord.order_items || []).map((it: any) => ({
              productId: it.product_id || it.id,
              productName: it.product_name,
              productCode: it.product_code,
              image: it.product_image_url || '/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg',
              selectedType: (it.stitching_type || 'unstitched') as 'unstitched' | 'stitched',
              selectedSize: it.size || 'M',
              sleeveLining: (it.sleeve_lining || 'without') as 'without' | 'with',
              quantity: it.quantity,
              unitPrice: Number(it.unit_price),
            })),
            subtotal: Number(ord.subtotal),
            discountAmount: Number(ord.discount_amount || 0),
            shippingFee: Number(ord.shipping_fee || 0),
            totalAmount: Number(ord.total_amount),
            paymentMethod: ord.payment_method === 'Card' ? 'card' : ord.payment_method === 'Bank Transfer' ? 'bank_transfer' : 'cod',
            paymentStatus: ord.payment_status as PaymentStatus,
            orderStatus: ord.order_status as OrderStatus,
            orderNotes: ord.special_instructions || '',
            createdAt: ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent',
            updatedAt: ord.updated_at ? new Date(ord.updated_at).toLocaleDateString() : 'Recent',
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error('Error fetching admin orders:', err);
      }

      // 2. Live Products (Merging Supabase DB + Local Admin Products)
      try {
        const liveProds = await fetchLiveProducts();
        if (liveProds && liveProds.length > 0) {
          setProducts(liveProds);
        }
      } catch (err) {
        console.error('Error fetching admin products:', err);
      }
    }

    loadAdminData();
  }, []);

  // Safely notify parent App component when products change
  const isMountedRef = useRef(false);
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (onProductsChange) {
      onProductsChange(products);
    }
  }, [products, onProductsChange]);

  // PRODUCT ACTIONS
  const handleAddProduct = async (newProdData: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const newProd: Product = { ...newProdData, id: newId };
    
    setProducts((prev) => {
      const updatedList = [newProd, ...prev];
      saveStoredCustomProducts(updatedList);
      return updatedList;
    });

    // Save to Supabase
    try {
      const { data: inserted, error } = await supabase
        .from('products')
        .insert({
          name: newProdData.name,
          code: newProdData.code,
          slug: newProdData.slug || newProdData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          original_price: newProdData.originalPrice,
          sale_price: newProdData.salePrice,
          discount_percent: newProdData.discountPercent || 0,
          collection_slug: newProdData.collection,
          collection_label: newProdData.collectionLabel,
          fabric: newProdData.fabric,
          color_name: newProdData.colorName,
          color_hex: newProdData.colorHex,
          in_stock: newProdData.inStock,
          is_best_seller: newProdData.isBestSeller,
          is_new: newProdData.isNew,
          is_sale: newProdData.isSale,
          description: newProdData.description,
          specifications: newProdData.details,
          disclaimer: newProdData.disclaimer,
          is_active: true,
        })
        .select('id')
        .single();

      if (!error && inserted) {
        // Insert images into product_images
        if (newProdData.images && newProdData.images.length > 0) {
          const imgPayload = newProdData.images.map((imgUrl, idx) => ({
            product_id: inserted.id,
            image_url: imgUrl,
            display_order: idx + 1,
            is_primary: idx === 0,
          }));
          await supabase.from('product_images').insert(imgPayload);
        }

        // Insert video if present
        if (newProdData.videoReelUrl) {
          await supabase.from('product_videos').insert({
            product_id: inserted.id,
            video_url: newProdData.videoReelUrl,
            thumbnail_url: newProdData.images[0] || null,
            is_active: true,
          });
        }
      }
    } catch (err) {
      console.error('Failed to persist product to Supabase:', err);
    }

    // Add inventory entry
    const newInv: AdminInventoryItem = {
      productId: newId,
      productName: newProd.name,
      sku: newProd.code,
      category: newProd.collectionLabel,
      currentStock: 20,
      lowStockThreshold: 5,
      status: 'In Stock',
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    setInventory((prev) => [newInv, ...prev]);
  };

  const handleEditProduct = async (updated: Product) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === updated.id ? updated : p));
      saveStoredCustomProducts(updatedList);
      return updatedList;
    });

    try {
      const { data: matchedProd } = await supabase
        .from('products')
        .update({
          name: updated.name,
          code: updated.code,
          original_price: updated.originalPrice,
          sale_price: updated.salePrice,
          discount_percent: updated.discountPercent || 0,
          collection_slug: updated.collection,
          collection_label: updated.collectionLabel,
          fabric: updated.fabric,
          color_name: updated.colorName,
          color_hex: updated.colorHex,
          in_stock: updated.inStock,
          is_best_seller: updated.isBestSeller,
          is_new: updated.isNew,
          is_sale: updated.isSale,
          description: updated.description,
          specifications: updated.details,
        })
        .eq('code', updated.code)
        .select('id')
        .maybeSingle();

      if (matchedProd) {
        // Sync images
        if (updated.images && updated.images.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', matchedProd.id);
          const imgPayload = updated.images.map((imgUrl, idx) => ({
            product_id: matchedProd.id,
            image_url: imgUrl,
            display_order: idx + 1,
            is_primary: idx === 0,
          }));
          await supabase.from('product_images').insert(imgPayload);
        }

        // Sync video
        if (updated.videoReelUrl) {
          await supabase.from('product_videos').delete().eq('product_id', matchedProd.id);
          await supabase.from('product_videos').insert({
            product_id: matchedProd.id,
            video_url: updated.videoReelUrl,
            thumbnail_url: updated.images[0] || null,
            is_active: true,
          });
        }
      }
    } catch (err) {
      console.error('Failed to update product in Supabase:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => {
      const updatedList = prev.filter((p) => p.id !== id);
      saveStoredCustomProducts(updatedList);
      return updatedList;
    });

    if (prod) {
      try {
        const { data: dbProd } = await supabase
          .from('products')
          .select('id')
          .eq('code', prod.code)
          .maybeSingle();

        if (dbProd) {
          await supabase.from('product_images').delete().eq('product_id', dbProd.id);
          await supabase.from('product_videos').delete().eq('product_id', dbProd.id);
          await supabase.from('products').delete().eq('id', dbProd.id);
        }
      } catch (err) {
        console.error('Failed to delete product from Supabase:', err);
      }
    }
  };

  const handleToggleProductFeatured = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBestSeller: !p.isBestSeller } : p))
    );
  };

  const handleToggleProductNew = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isNew: !p.isNew } : p))
    );
  };

  // CATEGORY ACTIONS
  const handleAddCategory = (catData: Omit<AdminCategory, 'id' | 'productCount'>) => {
    const newCat: AdminCategory = {
      ...catData,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    setCategories((prev) => {
      const next = [...prev, newCat];
      saveStoredData('ahmads_categories', next);
      return next;
    });
  };

  const handleEditCategory = (updated: AdminCategory) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      saveStoredData('ahmads_categories', next);
      return next;
    });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveStoredData('ahmads_categories', next);
      return next;
    });
  };

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status, updatedAt: 'Just now' } : o));
      saveStoredData('ahmads_orders', next);
      return next;
    });
    try {
      await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    } catch (err) {
      console.error('Failed to update order status in Supabase:', err);
    }
  };

  const handleUpdatePaymentStatus = async (orderIdOrTxnId: string, status: PaymentStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderIdOrTxnId || o.orderNumber === orderIdOrTxnId
          ? { ...o, paymentStatus: status, updatedAt: 'Just now' }
          : o
      );
      saveStoredData('ahmads_orders', next);
      return next;
    });
    setPayments((prev) =>
      prev.map((p) => (p.id === orderIdOrTxnId ? { ...p, paymentStatus: status } : p))
    );
    try {
      await supabase.from('orders').update({ payment_status: status }).eq('id', orderIdOrTxnId);
    } catch (err) {
      console.error('Failed to update payment status in Supabase:', err);
    }
  };

  // CUSTOMER ACTIONS
  const handleToggleCustomerStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Active' ? 'Blocked' : 'Active' } : c
      )
    );
  };

  // INVENTORY ACTIONS
  const handleAdjustStock = (
    sku: string,
    changeAmount: number,
    reason: 'Restock' | 'Order Deduction' | 'Damage / Defect' | 'Audit Correction' | 'Return'
  ) => {
    let itemObj: AdminInventoryItem | undefined;

    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.sku === sku) {
          const newStock = Math.max(0, inv.currentStock + changeAmount);
          const newStatus =
            newStock === 0 ? 'Out of Stock' : newStock <= inv.lowStockThreshold ? 'Low Stock' : 'In Stock';
          itemObj = inv;
          return {
            ...inv,
            currentStock: newStock,
            status: newStatus,
            lastRestocked: changeAmount > 0 ? new Date().toISOString().split('T')[0] : inv.lastRestocked,
          };
        }
        return inv;
      })
    );

    if (itemObj) {
      const prevStock = itemObj.currentStock;
      const newStock = Math.max(0, prevStock + changeAmount);
      const newLog: StockHistoryLog = {
        id: `log-${Date.now()}`,
        sku,
        productName: itemObj.productName,
        changeAmount,
        previousStock: prevStock,
        newStock,
        reason,
        adminUser: currentAdminUser?.name || 'Ahmad Malik',
        timestamp: new Date().toLocaleString(),
      };
      setStockLogs((prev) => [newLog, ...prev]);
    }
  };

  // COUPON ACTIONS
  const handleAddCoupon = (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `cpn-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => {
      const next = [...prev, newCoupon];
      saveStoredData('ahmads_coupons', next);
      return next;
    });
  };

  const handleEditCoupon = (updated: Coupon) => {
    setCoupons((prev) => {
      const next = prev.map((c) => (c.id === updated.id ? updated : c));
      saveStoredData('ahmads_coupons', next);
      return next;
    });
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveStoredData('ahmads_coupons', next);
      return next;
    });
  };

  // BANNER & SETTINGS ACTIONS
  const handleUpdateBanner = (banner: StoreBanner) => {
    setBanners((prev) => {
      const next = prev.map((b) => (b.id === banner.id ? banner : b));
      saveStoredData('ahmads_banners', next);
      return next;
    });
  };

  const handleUpdateSettings = (updated: StoreSettings) => {
    setSettings(updated);
    saveStoredData('ahmads_settings', updated);
  };

  const handleUpdateAdminProfile = (updated: Partial<AdminUser>) => {
    if (currentAdminUser) {
      setCurrentAdminUser({ ...currentAdminUser, ...updated });
    }
  };

  // Navigation Items Sidebar List matching requested modules
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'collections', label: 'Collections', icon: Layout },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.filter((o) => o.orderStatus === 'Pending').length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badgeAlert: inventory.filter((i) => i.status !== 'In Stock').length },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'newsletter', label: 'Newsletter', icon: Send },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <AdminGuard onCancelToStore={onReturnToStore}>
      <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
        {/* Top Desktop & Mobile Master Header */}
        <header className="sticky top-0 z-40 bg-stone-950 text-white border-b border-stone-800 shadow-md">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Left: Mobile Drawer Button & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E2D1B3] text-stone-950 font-serif-luxury font-bold flex items-center justify-center text-sm shadow-inner">
                  A
                </div>
                <div>
                  <h2 className="font-serif-luxury text-base font-normal tracking-[0.15em] uppercase text-white leading-none">
                    AHMAD&apos;S
                  </h2>
                  <span className="text-[9px] uppercase tracking-widest text-[#E2D1B3] font-bold">
                    ADMIN PORTAL
                  </span>
                </div>
              </div>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-[#E2D1B3] text-xs font-semibold uppercase tracking-wider rounded-lg border border-stone-700 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Audit Report</span>
              </button>

              <button
                onClick={onReturnToStore}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-stone-950 hover:bg-stone-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Store</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 p-1 pl-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                <img
                  src={currentAdminUser?.avatarUrl || '/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg'}
                  alt="Avatar"
                  className="w-6 h-6 rounded-lg object-cover border border-stone-700"
                />
                <span className="text-xs font-bold text-stone-200 hidden md:inline">
                  {currentAdminUser?.name.split(' ')[0]}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Body Layout: Sidebar + Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800 shrink-0">
            <div className="p-4 border-b border-stone-800/80">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                Navigation Modules
              </span>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF8F5] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:bg-stone-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.badgeAlert !== undefined && item.badgeAlert > 0 && (
                      <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-full">
                        {item.badgeAlert}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Admin Actions */}
            <div className="p-3 border-t border-stone-800/80 space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#FAF8F5] text-stone-950 font-bold'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Admin Profile</span>
              </button>

              <button
                onClick={handleLogoutAdmin}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider text-red-400 hover:bg-red-950/40 hover:text-red-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Session</span>
              </button>
            </div>
          </aside>

          {/* MOBILE DRAWER SIDEBAR */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
              />

              <div className="relative w-72 max-w-full bg-stone-900 text-stone-200 flex flex-col h-full z-10 shadow-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E2D1B3]">
                    Admin Navigation
                  </span>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider cursor-pointer ${
                          isActive
                            ? 'bg-white text-stone-950 font-bold'
                            : 'text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>

                <div className="border-t border-stone-800 pt-3 space-y-2">
                  <button
                    onClick={() => {
                      setIsAuditModalOpen(true);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full py-2.5 bg-stone-800 text-[#E2D1B3] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Audit Report</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full py-2.5 bg-stone-800 text-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Admin Profile</span>
                  </button>

                  <button
                    onClick={handleLogoutAdmin}
                    className="w-full py-2.5 bg-red-950 text-red-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN PAGE WORKSPACE CONTENT AREA */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DashboardPage
                products={products}
                categories={categories}
                orders={orders}
                customers={customers}
                inventory={inventory}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onViewOrderDetails={(ord) => {
                  setSelectedOrderForModal(ord);
                  setActiveTab('orders');
                }}
              />
            )}

            {activeTab === 'products' && (
              <ProductsPage
                products={products}
                categories={categories}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesPage
                categories={categories}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersPage
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                onShowToast={showToast}
                selectedOrderForModal={selectedOrderForModal}
                onCloseOrderModal={() => setSelectedOrderForModal(null)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersPage
                customers={customers}
                orders={orders}
                onToggleCustomerStatus={handleToggleCustomerStatus}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryPage
                inventory={inventory}
                stockLogs={stockLogs}
                onAdjustStock={handleAdjustStock}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'collections' && (
              <CollectionsPage onShowToast={showToast} />
            )}

            {activeTab === 'coupons' && (
              <CouponsPage
                coupons={coupons}
                onAddCoupon={handleAddCoupon}
                onEditCoupon={handleEditCoupon}
                onDeleteCoupon={handleDeleteCoupon}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'reviews' && (
              <ReviewsPage onShowToast={showToast} />
            )}

            {activeTab === 'messages' && (
              <MessagesPage onShowToast={showToast} />
            )}

            {activeTab === 'newsletter' && (
              <NewsletterPage onShowToast={showToast} />
            )}

            {activeTab === 'banners' && (
              <BannersPage
                banners={banners}
                products={products}
                onUpdateBanner={handleUpdateBanner}
                onToggleProductFeatured={handleToggleProductFeatured}
                onToggleProductNew={handleToggleProductNew}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsPage
                payments={payments}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsPage
                orders={orders}
                products={products}
                customers={customers}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'profile' && currentAdminUser && (
              <AdminProfilePage
                adminUser={currentAdminUser}
                onUpdateAdminProfile={handleUpdateAdminProfile}
                onLogoutAdmin={handleLogoutAdmin}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onShowToast={showToast}
              />
            )}
          </main>
        </div>

        {/* Global Admin Toast Notifications Container */}
        <AdminToast toasts={toasts} onDismiss={handleDismissToast} />

        {/* Audit Report Modal */}
        <AuditReportModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />
      </div>
    </AdminGuard>
  );
};
