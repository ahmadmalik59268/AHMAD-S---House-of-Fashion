import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  History,
  Plus,
  Minus,
  Search,
  RefreshCw,
  X,
  TrendingDown,
  CheckCircle2,
  PackageCheck,
} from 'lucide-react';
import { AdminInventoryItem, StockHistoryLog } from '../types';

interface InventoryPageProps {
  inventory: AdminInventoryItem[];
  stockLogs: StockHistoryLog[];
  onAdjustStock: (
    sku: string,
    changeAmount: number,
    reason: 'Restock' | 'Order Deduction' | 'Damage / Defect' | 'Audit Correction' | 'Return'
  ) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  inventory,
  stockLogs,
  onAdjustStock,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'logs'>('inventory');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('all');

  // Stock Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<AdminInventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState<'Restock' | 'Order Deduction' | 'Damage / Defect' | 'Audit Correction' | 'Return'>('Restock');

  const filteredInventory = inventory.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesQuery =
      item.productName.toLowerCase().includes(query.toLowerCase()) ||
      item.sku.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const filteredLogs = stockLogs.filter((log) => {
    return (
      log.productName.toLowerCase().includes(query.toLowerCase()) ||
      log.sku.toLowerCase().includes(query.toLowerCase()) ||
      log.reason.toLowerCase().includes(query.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(query.toLowerCase())
    );
  });

  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'Out of Stock').length;

  const handleOpenAdjust = (item: AdminInventoryItem) => {
    setAdjustingItem(item);
    setAdjustAmount(10);
    setAdjustType('add');
    setAdjustReason('Restock');
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjustAmount <= 0) return;

    const change = adjustType === 'add' ? adjustAmount : -adjustAmount;
    onAdjustStock(adjustingItem.sku, change, adjustReason);

    onShowToast(
      'Stock Adjusted',
      `Updated stock for ${adjustingItem.productName} by ${change > 0 ? '+' : ''}${change} units.`,
      'success'
    );

    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Inventory & Warehouse Control
          </h1>
          <p className="text-xs text-stone-500">Monitor stock levels, SKUs, low-stock alerts, and audit logs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock Items</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* Low / Out of Stock Alert Summary Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider">Inventory Restock Action Needed</p>
              <p className="text-amber-700 mt-0.5">
                You currently have <strong className="text-amber-950">{lowStockCount} low stock</strong> items and{' '}
                <strong className="text-red-700">{outOfStockCount} out of stock</strong> items requiring replenishment.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('inventory');
              setStatusFilter('Low Stock');
            }}
            className="px-3.5 py-1.5 bg-amber-900 text-amber-50 font-semibold text-[11px] uppercase tracking-wider rounded-lg hover:bg-amber-950 transition-colors shrink-0 cursor-pointer"
          >
            Filter Alerts
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product name, SKU, or category..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        {activeTab === 'inventory' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Table Content */}
      {activeTab === 'inventory' ? (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Product SKU</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Alert Threshold</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5">Last Restocked</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInventory.map((item) => (
                  <tr key={item.sku} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{item.sku}</td>
                    <td className="p-3.5 font-semibold text-stone-950">{item.productName}</td>
                    <td className="p-3.5 text-stone-600">{item.category}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-sm text-stone-950">{item.currentStock}</span> units
                    </td>
                    <td className="p-3.5 text-stone-500 font-medium">&lt; {item.lowStockThreshold} units</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-500">{item.lastRestocked}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[11px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Log Ref</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Stock Change</th>
                  <th className="p-3.5">Previous → New</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Admin User</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-stone-500">{log.id}</td>
                    <td className="p-3.5 font-mono font-bold text-stone-900">{log.sku}</td>
                    <td className="p-3.5 font-semibold text-stone-950">{log.productName}</td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold ${
                          log.changeAmount > 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-700 font-medium">
                      {log.previousStock} → <strong className="text-stone-950">{log.newStock}</strong>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-semibold rounded">
                        {log.reason}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-800 font-medium">{log.adminUser}</td>
                    <td className="p-3.5 text-stone-500">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                  Inventory Adjustment
                </span>
                <h3 className="font-serif-luxury text-xl uppercase font-normal text-stone-950">
                  {adjustingItem.sku}
                </h3>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-stone-900">{adjustingItem.productName}</p>
                  <p className="text-stone-500 text-[11px]">Current Quantity: {adjustingItem.currentStock} units</p>
                </div>
                <span className="px-2.5 py-1 bg-stone-900 text-white font-bold rounded-lg text-xs">
                  {adjustingItem.currentStock}
                </span>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-2">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2.5 text-xs font-bold uppercase rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      adjustType === 'add'
                        ? 'bg-emerald-800 text-white border-emerald-900'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-2.5 text-xs font-bold uppercase rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      adjustType === 'subtract'
                        ? 'bg-red-800 text-white border-red-900'
                        : 'bg-white text-stone-700 border-stone-300'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    <span>Deduct Stock</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1.5">
                  Quantity Count
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 text-sm border border-stone-300 rounded-xl font-bold focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1.5">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value as any)}
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Restock">Restock / New Shipment</option>
                  <option value="Order Deduction">Manual Order Deduction</option>
                  <option value="Damage / Defect">Damage / Defect Disposal</option>
                  <option value="Audit Correction">Audit Inventory Correction</option>
                  <option value="Return">Customer Return Restock</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 font-semibold uppercase tracking-wider rounded-xl hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 shadow-md cursor-pointer"
                >
                  Apply Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
