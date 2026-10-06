import React from 'react';
import {
  Package,
  FolderTree,
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { AdminOrder, AdminCustomer, AdminInventoryItem, AdminCategory } from '../types';
import { Product } from '../../types';

interface DashboardPageProps {
  products: Product[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  inventory: AdminInventoryItem[];
  onNavigateTab: (tab: string) => void;
  onViewOrderDetails: (order: AdminOrder) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  categories,
  orders,
  customers,
  inventory,
  onNavigateTab,
  onViewOrderDetails,
}) => {
  // KPI Calculations
  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalCustomers = customers.length;
  const totalOrders = orders.length;

  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed' || o.orderStatus === 'Processing').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled').length;

  const totalSalesPKR = orders.reduce((acc, o) => (o.orderStatus !== 'Cancelled' ? acc + o.totalAmount : acc), 0);
  const todaySalesPKR = orders
    .filter((o) => o.createdAt.includes('Today') || o.createdAt.includes('2026-10-01'))
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const monthlySalesPKR = totalSalesPKR; // Month to date

  const lowStockProducts = inventory.filter((inv) => inv.status === 'Low Stock' || inv.status === 'Out of Stock').length;

  const recentOrders = orders.slice(0, 5);
  const recentCustomers = customers.slice(0, 5);

  // Sales Trend Mock Data for Bar Chart
  const salesDays = [
    { day: 'Mon', sales: 34000 },
    { day: 'Tue', sales: 48000 },
    { day: 'Wed', sales: 52000 },
    { day: 'Thu', sales: 41000 },
    { day: 'Fri', sales: 68000 },
    { day: 'Sat', sales: 85000 },
    { day: 'Sun', sales: 92000 },
  ];
  const maxSalesDay = Math.max(...salesDays.map((s) => s.sales));

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-stone-900 text-white p-6 rounded-2xl shadow-xl border border-stone-800">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E2D1B3] font-semibold">
            Store Administration · Realtime Overview
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl uppercase font-normal tracking-wide mt-1">
            Executive Performance Dashboard
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Monitoring sales, inventory alerts, and order dispatches for AHMAD&apos;S.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('reports')}
          className="px-5 py-2.5 bg-[#FAF8F5] text-stone-950 font-semibold uppercase tracking-wider text-xs rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>View Full Analytics</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* 11 KPI STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Products</span>
            <Package className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">{totalProducts}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Catalog Items</p>
        </div>

        {/* Total Categories */}
        <div
          onClick={() => onNavigateTab('categories')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Categories</span>
            <FolderTree className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">{totalCategories}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Active Sections</p>
        </div>

        {/* Total Customers */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Customers</span>
            <Users className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">{totalCustomers}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">+18% this month</p>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">{totalOrders}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">All time orders</p>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 bg-white border border-amber-200 bg-amber-50/30 rounded-xl shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-900">{pendingOrders}</p>
          <p className="text-[10px] text-amber-700 font-medium mt-0.5">Requires Action</p>
        </div>

        {/* Completed Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">{completedOrders}</p>
          <p className="text-[10px] text-emerald-700 mt-0.5">Delivered Orders</p>
        </div>

        {/* Cancelled Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cancelled</span>
            <XCircle className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">{cancelledOrders}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Voided Orders</p>
        </div>

        {/* Total Sales */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 bg-stone-900 text-white rounded-xl shadow-md hover:bg-stone-800 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-stone-300 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-4 h-4 text-[#E2D1B3] group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#E2D1B3]">
            Rs. {totalSalesPKR.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Gross Revenue</p>
        </div>

        {/* Today's Sales */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">
            Rs. {todaySalesPKR.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Active Dispatches</p>
        </div>

        {/* Monthly Sales */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs hover:border-stone-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Sales</span>
            <TrendingUp className="w-4 h-4 text-stone-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-950">
            Rs. {monthlySalesPKR.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Current Month</p>
        </div>

        {/* Low Stock Products Alert */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="p-4 bg-white border border-red-200 bg-red-50/20 rounded-xl shadow-xs hover:border-red-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-900">{lowStockProducts}</p>
          <p className="text-[10px] text-red-700 font-medium mt-0.5">Needs Restocking</p>
        </div>
      </div>

      {/* SALES TREND CHART & RECENT CUSTOMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif-luxury text-xl uppercase tracking-wider text-stone-950 font-normal">
                Weekly Revenue Trend
              </h3>
              <p className="text-xs text-stone-500">Sales breakdown for current week (PKR)</p>
            </div>
            <span className="px-3 py-1 bg-stone-100 text-stone-800 text-xs font-semibold rounded-full">
              This Week
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
            {salesDays.map((item) => {
              const heightPercent = Math.max(12, (item.sales / maxSalesDay) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white px-1.5 py-0.5 rounded shadow">
                    Rs.{item.sales / 1000}k
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-stone-900 group-hover:bg-[#C82944] transition-all rounded-t-md relative"
                  />
                  <span className="text-xs font-medium text-stone-600 uppercase">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Customers List */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif-luxury text-lg uppercase tracking-wider text-stone-950 font-normal">
              Recent Clients
            </h3>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-950 underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 divide-y divide-stone-100">
            {recentCustomers.map((cust) => (
              <div key={cust.id} className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-stone-900">{cust.name}</p>
                  <p className="text-[11px] text-stone-500">{cust.city}, {cust.country}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-stone-950">Rs. {cust.totalSpent.toLocaleString()}</span>
                  <span className="block text-[10px] text-stone-400">{cust.totalOrders} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif-luxury text-xl uppercase tracking-wider text-stone-950 font-normal">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-stone-500">Latest checkout dispatches awaiting status updates</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            View All Orders
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-3">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3 font-bold text-stone-900">{ord.orderNumber}</td>
                  <td className="p-3">
                    <p className="font-semibold text-stone-900">{ord.customerName}</p>
                    <p className="text-[11px] text-stone-500">{ord.customerPhone}</p>
                  </td>
                  <td className="p-3 text-stone-600">{ord.createdAt}</td>
                  <td className="p-3 uppercase font-medium text-stone-800">
                    {ord.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="p-3 font-semibold text-stone-950">
                    Rs. {ord.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'Shipped'
                          ? 'bg-sky-100 text-sky-800'
                          : ord.orderStatus === 'Processing'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onViewOrderDetails(ord)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-800 transition-colors rounded cursor-pointer"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
