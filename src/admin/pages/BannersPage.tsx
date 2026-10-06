import React, { useState } from 'react';
import { Layout, Image as ImageIcon, Sparkles, Check, Save, Star, Flame, Eye } from 'lucide-react';
import { StoreBanner } from '../types';
import { Product } from '../../types';

interface BannersPageProps {
  banners: StoreBanner[];
  products: Product[];
  onUpdateBanner: (banner: StoreBanner) => void;
  onToggleProductFeatured: (productId: string) => void;
  onToggleProductNew: (productId: string) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const BannersPage: React.FC<BannersPageProps> = ({
  banners,
  products,
  onUpdateBanner,
  onToggleProductFeatured,
  onToggleProductNew,
  onShowToast,
}) => {
  const activeBanner = banners[0] || {
    id: 'ban-1',
    title: 'NOIR LUXURY & LUXURY FORMALS',
    subtitle: 'Handcrafted Pakistani Pret, Chiffon & Bridal Couture',
    announcementText: 'Shop Worldwide Stress-Free! Customs, Duties & Taxes are already covered in your shipping.',
    bannerImage: '/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg',
    isActive: true,
  };

  const [formData, setFormData] = useState({
    title: activeBanner.title,
    subtitle: activeBanner.subtitle,
    announcementText: activeBanner.announcementText,
    bannerImage: activeBanner.bannerImage,
    isActive: activeBanner.isActive,
  });

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBanner({
      ...activeBanner,
      ...formData,
    });
    onShowToast('Store Banner Saved', 'Homepage promotional hero & announcement bar updated', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif-luxury text-2xl uppercase font-normal tracking-wide text-stone-950">
          Store Content & Banners Management
        </h1>
        <p className="text-xs text-stone-500">
          Manage storefront banner graphics, top header announcements, featured collections, and new arrivals
        </p>
      </div>

      {/* Hero Banner & Announcement Config */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
            Homepage Hero Banner & Top Announcement Bar
          </h2>
          <p className="text-xs text-stone-500">Edit the headline banner displayed on the customer landing page</p>
        </div>

        <form onSubmit={handleSaveBanner} className="space-y-5 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
              Top Announcement Bar Text
            </label>
            <input
              type="text"
              required
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Main Hero Headline Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 text-xs font-bold border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
                Sub-Headline Tagline
              </label>
              <input
                type="text"
                required
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold uppercase tracking-wider mb-1">
              Hero Banner Image URL
            </label>
            <input
              type="text"
              required
              value={formData.bannerImage}
              onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-mono"
            />
          </div>

          {/* Banner Preview */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-stone-200 shadow-inner group">
            <img
              src={formData.bannerImage}
              alt="Banner Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase tracking-widest text-[#E2D1B3] font-bold">
                Live Storefront Preview
              </span>
              <p className="font-serif-luxury text-xl font-normal uppercase">{formData.title}</p>
              <p className="text-xs text-stone-200 mt-0.5">{formData.subtitle}</p>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Banner Changes</span>
          </button>
        </form>
      </div>

      {/* Featured Products & New Arrivals Curator */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="font-serif-luxury text-lg uppercase font-normal text-stone-950">
            Promotional Badges & Featured Curation
          </h2>
          <p className="text-xs text-stone-500">
            Toggle which products appear under &quot;Best Sellers&quot; and &quot;New Arrivals&quot; on the store homepage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-3.5 border border-stone-200 rounded-xl flex items-center gap-3.5 bg-stone-50/50 hover:bg-stone-50 transition-colors"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                className="w-14 h-18 object-cover rounded-lg border border-stone-200 shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold text-stone-900 truncate">{p.name}</p>
                <p className="text-stone-500 text-[11px] uppercase font-mono">{p.code}</p>
                <p className="font-semibold text-stone-950 mt-1">Rs. {p.salePrice.toLocaleString()}</p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onToggleProductFeatured(p.id);
                      onShowToast('Featured Toggled', `Updated featured status for ${p.name}`, 'info');
                    }}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-colors ${
                      p.isBestSeller
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>Best Seller</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleProductNew(p.id);
                      onShowToast('New Arrival Toggled', `Updated new arrival badge for ${p.name}`, 'info');
                    }}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer transition-colors ${
                      p.isNew
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>New Arrival</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
