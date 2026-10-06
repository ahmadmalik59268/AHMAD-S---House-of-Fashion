import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  Banknote,
} from 'lucide-react';
import { Coupon } from '../types';

interface CouponsPageProps {
  coupons: Coupon[];
  onAddCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  onEditCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const CouponsPage: React.FC<CouponsPageProps> = ({
  coupons,
  onAddCoupon,
  onEditCoupon,
  onDeleteCoupon,
  onShowToast,
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Disabled' | 'Expired'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minOrderAmount: 10000,
    usageLimit: 100,
    expiryDate: '2026-12-31',
    status: 'Active' as 'Active' | 'Disabled' | 'Expired',
  });

  const filtered = coupons.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesQuery = c.code.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const openAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      minOrderAmount: 10000,
      usageLimit: 100,
      expiryDate: '2026-12-31',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      usageLimit: c.usageLimit,
      expiryDate: c.expiryDate,
      status: c.status,
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (c: Coupon) => {
    const nextStatus = c.status === 'Active' ? 'Disabled' : 'Active';
    onEditCoupon({ ...c, status: nextStatus });
    onShowToast('Coupon Updated', `Coupon ${c.code} is now ${nextStatus}`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return;

    if (editingCoupon) {
      onEditCoupon({
        ...editingCoupon,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minOrderAmount: formData.minOrderAmount,
        usageLimit: formData.usageLimit,
        expiryDate: formData.expiryDate,
        status: formData.status,
      });
      onShowToast('Coupon Updated', `Updated coupon code ${formData.code.toUpperCase()}`, 'success');
    } else {
      onAddCoupon({
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        minOrderAmount: formData.minOrderAmount,
        usageLimit: formData.usageLimit,
        expiryDate: formData.expiryDate,
        status: formData.status,
      });
      onShowToast('Coupon Created', `Created coupon code ${formData.code.toUpperCase()}`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = (id: string) => {
    onDeleteCoupon(id);
    onShowToast('Coupon Deleted', 'Promotional code removed', 'warning');
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
            Discounts & Promo Coupons
          </h1>
          <p className="text-xs text-stone-500">Create percentage or fixed PKR voucher codes for sales campaigns</p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Active Coupons</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {coupons.filter((c) => c.status === 'Active').length}
          </p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Total Redemptions</p>
          <p className="text-2xl font-bold text-stone-950 mt-1">
            {coupons.reduce((acc, c) => acc + c.usedCount, 0)} times
          </p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Expired Codes</p>
          <p className="text-2xl font-bold text-stone-400 mt-1">
            {coupons.filter((c) => c.status === 'Expired').length}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coupon promo code..."
            className="w-full p-2.5 pl-9 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'Active', 'Disabled', 'Expired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase tracking-wider font-semibold">
                <th className="p-3.5">Promo Code</th>
                <th className="p-3.5">Discount Type</th>
                <th className="p-3.5">Value</th>
                <th className="p-3.5">Min Order</th>
                <th className="p-3.5">Usage / Limit</th>
                <th className="p-3.5">Expiry Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-stone-950 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{c.code}</span>
                  </td>
                  <td className="p-3.5 capitalize text-stone-700 font-medium">{c.type}</td>
                  <td className="p-3.5 font-bold text-stone-950">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `Rs. ${c.value.toLocaleString()} OFF`}
                  </td>
                  <td className="p-3.5 text-stone-600">Rs. {c.minOrderAmount.toLocaleString()}</td>
                  <td className="p-3.5 text-stone-700 font-medium">
                    {c.usedCount} / {c.usageLimit}
                  </td>
                  <td className="p-3.5 text-stone-500 font-medium">{c.expiryDate}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'Disabled'
                          ? 'bg-stone-200 text-stone-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded transition-colors cursor-pointer"
                        title="Toggle Enable/Disable"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded transition-colors cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(c.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="font-serif-luxury text-xl uppercase font-normal text-stone-950">
                {editingCoupon ? 'Edit Coupon Code' : 'Create New Promo Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. EID2026 or AHMAD10"
                  className="w-full p-2.5 text-xs font-mono font-bold uppercase border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed PKR Amount (Rs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs font-bold border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                    Minimum Order Amount (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                    Usage Count Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-stone-300 text-stone-700 font-semibold uppercase tracking-wider rounded-xl hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-stone-900 text-white font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 shadow-md cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4">
            <h3 className="font-serif-luxury text-lg font-normal text-stone-950">Delete Coupon Code?</h3>
            <p className="text-xs text-stone-600">
              This action will permanently delete this discount code from the system.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 border border-stone-300 rounded-xl text-stone-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingId)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
