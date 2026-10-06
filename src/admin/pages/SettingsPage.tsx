import React, { useState } from 'react';
import { Store, Phone, Mail, MapPin, DollarSign, Truck, Percent, Save, ShieldCheck } from 'lucide-react';
import { StoreSettings } from '../types';

interface SettingsPageProps {
  settings: StoreSettings;
  onUpdateSettings: (updated: StoreSettings) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({
    ...settings,
    storePhone: settings.storePhone || '03326109729',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    onShowToast('Settings Saved', 'Store configuration and phone contact updated', 'success');
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
          Store Configuration & System Settings
        </h1>
        <p className="text-xs text-stone-500">
          Manage general store parameters, official contact details, currency, shipping rules, and taxes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Store General Information */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-stone-800" />
            <h3 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
              General Store Contact & Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Official Store Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.storePhone}
                  onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
                  placeholder="03326109729"
                  className="w-full p-2.5 pl-9 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-bold"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Official Support Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.storeEmail}
                  onChange={(e) => setFormData({ ...formData, storeEmail: e.target.value })}
                  className="w-full p-2.5 pl-9 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Base Store Currency
              </label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
              Store Physical Address
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.storeAddress}
                onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
                className="w-full p-2.5 pl-9 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Rules */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-stone-800" />
            <h3 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
              Shipping & Courier Dispatch Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Free Express Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                required
                value={formData.freeShippingThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeShippingThreshold: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Standard Nationwide Flat Shipping Fee (PKR)
              </label>
              <input
                type="number"
                required
                value={formData.standardShippingFee}
                onChange={(e) =>
                  setFormData({ ...formData, standardShippingFee: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Tax & Order Automation Rules */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <Percent className="w-4 h-4 text-stone-800" />
            <h3 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
              Taxation & Order Processing
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Low Stock Threshold Alert Count
              </label>
              <input
                type="number"
                required
                value={formData.lowStockAlertThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockAlertThreshold: parseInt(e.target.value) || 0 })
                }
                className="w-full p-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-bold"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="autoConfirmCOD"
                checked={formData.autoConfirmCOD}
                onChange={(e) => setFormData({ ...formData, autoConfirmCOD: e.target.checked })}
                className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900"
              />
              <label htmlFor="autoConfirmCOD" className="text-stone-800 font-semibold cursor-pointer">
                Auto-Confirm Cash on Delivery (COD) Checkout Orders
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
};
