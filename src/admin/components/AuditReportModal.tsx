import React from 'react';
import { X, FileText, CheckCircle2, Database, Shield, Server, ArrowRight, Layers } from 'lucide-react';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 text-stone-100 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-800 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E2D1B3] text-stone-950 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#E2D1B3] font-bold">
                AHMAD&apos;S ADMIN AUDIT REPORT
              </span>
              <h2 className="font-serif-luxury text-2xl uppercase font-normal text-white">
                Admin Panel Architecture & Supabase Roadmap
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Content Sections */}
        <div className="space-y-6 text-xs text-stone-300 leading-relaxed">
          {/* Section 1 & 2: Pages & Modules */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-[#E2D1B3] text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>1 & 2. Admin Pages & Modules Created (12 Complete Modules)</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Dashboard:</strong> 11 KPI Cards, Sales Trend Chart, Recent Dispatches & Clients</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Products Management:</strong> Add, Edit, Delete, Search, Category/Status Filters, Add-ons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Categories:</strong> Add, Edit, Delete, Enable/Disable, Image Upload URL</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Orders Management:</strong> Table, Filter Status, Payment Status, Print Invoice Modal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Customers Directory:</strong> Profile Modal, Order History, Total Spent, Activate/Block</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Inventory & Warehouse:</strong> Current Stock, Low Stock Alerts, Stock Adjustment Modal, Logs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Discounts / Coupons:</strong> Percentage/Fixed Vouchers, Min Order, Expiry, Usage Count</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Banners / Store Content:</strong> Hero Banner Title/Subtitle, Announcement Bar, Curation Badges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Payments:</strong> Method Breakdown (COD, Card, EasyPaisa, Bank), Transaction Log, Mark Paid</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Sales Reports:</strong> Daily/Weekly/Monthly/Yearly Revenue, Top Selling Products, CSV Export</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Admin Profile:</strong> User Avatar, Role Badge, Name/Email Update, Password Change, Logout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span><strong>Store Settings:</strong> Name, Official Phone (03326109729), Address, Currency, Shipping & Taxes</span>
              </li>
            </ul>
          </div>

          {/* Section 3, 4, 5: Actions, Frontend vs Backend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-emerald-400 text-xs">
                3 & 4. Interactive Frontend Actions
              </h4>
              <p className="text-stone-300">
                All buttons (Add/Edit/Delete Product, Change Order Status, Stock Adjustment, Coupon Toggle, Export CSV, Print Invoice, Settings Save) perform live client-side state updates and trigger Toast notifications immediately.
              </p>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-amber-400 text-xs">
                5. Functions Needing Supabase Integration
              </h4>
              <p className="text-stone-300">
                Persistent database CRUD, encrypted password auth, real-time order sync across sessions, file storage for image uploads, and server-side RBAC role validation.
              </p>
            </div>
          </div>

          {/* Section 6: Exact Supabase Tables Needed */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
            <h3 className="font-bold uppercase tracking-wider text-[#E2D1B3] text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>6. Exact Supabase PostgreSQL Database Schema Needed</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 font-mono text-stone-300">
                <strong className="text-white block font-sans font-bold">1. admin_users</strong>
                id, email, password_hash, role (&apos;super_admin&apos; | &apos;manager&apos;), full_name, avatar_url, last_login
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 font-mono text-stone-300">
                <strong className="text-white block font-sans font-bold">2. products</strong>
                id, code, name, slug, original_price, sale_price, collection_slug, fabric, color_name, images, in_stock, is_bestseller
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 font-mono text-stone-300">
                <strong className="text-white block font-sans font-bold">3. categories</strong>
                id, name, slug, image, status, description, product_count
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 font-mono text-stone-300">
                <strong className="text-white block font-sans font-bold">4. orders & order_items</strong>
                id, order_number, customer_name, customer_email, customer_phone, shipping_address, city, payment_status, order_status
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 font-mono text-stone-300">
                <strong className="text-white block font-sans font-bold">5. inventory & stock_logs</strong>
                sku, product_id, current_stock, low_stock_threshold, status, change_amount, reason, admin_user, timestamp
              </div>
              <div className="p-2.5 bg-stone-900 rounded-lg border border-stone-800 font-mono text-stone-300">
                <strong className="text-white block font-sans font-bold">6. coupons & store_settings</strong>
                code, discount_type, value, min_order_amount, usage_limit, store_phone, free_shipping_threshold
              </div>
            </div>
          </div>

          {/* Section 7: Next Steps to Connect */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-[#E2D1B3] text-sm flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>7. Exact Next Steps Required to Connect to Supabase</span>
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-300">
              <li>Provision Supabase project and get <code className="text-amber-300">VITE_SUPABASE_URL</code> & <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code>.</li>
              <li>Install <code className="text-stone-100">@supabase/supabase-js</code> in the project.</li>
              <li>Run the SQL DDL migration script to create the 6 PostgreSQL tables listed above.</li>
              <li>Enable Row Level Security (RLS) policies granting read access to customers and full write access to authenticated admin users with role <code className="text-stone-100 font-mono">&apos;super_admin&apos;</code>.</li>
              <li>Replace mock data hooks with Supabase <code className="text-stone-100 font-mono">supabase.from(&apos;products&apos;).select()</code> queries.</li>
            </ol>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#FAF8F5] hover:bg-stone-200 text-stone-950 font-bold uppercase tracking-wider text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
