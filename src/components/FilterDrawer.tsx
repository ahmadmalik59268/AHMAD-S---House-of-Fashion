import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { ProductType } from '../types';

interface FilterState {
  priceMax: number;
  type: ProductType | 'all';
  fabric: string;
  sortBy: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResults,
}) => {
  if (!isOpen) return null;

  const fabrics = ['All Fabrics', 'Pure Organza & Raw Silk', 'Raw Silk & Fine Net Organza', 'Micro Velvet & Organza', 'Pure Chiffon & Silk'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-[#FAF8F5] shadow-2xl flex flex-col z-10">
        <div className="p-5 flex items-center justify-between border-b border-stone-200">
          <div>
            <h2 className="font-serif-luxury text-lg tracking-wider text-stone-950 uppercase font-normal">
              Filters &amp; Refinements
            </h2>
            <p className="text-[11px] text-stone-500">{totalResults} products matching</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 text-stone-600 hover:text-stone-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-800">
          {/* Sort By */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-900 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onUpdateFilters({ ...filters, sortBy: e.target.value })}
              className="w-full p-2.5 border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
            >
              <option value="featured">Featured</option>
              <option value="relevant">Most Relevant</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title-az">Alphabetically, A-Z</option>
            </select>
          </div>

          {/* Stitching Type */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-900 mb-2">
              Stitching Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['all', 'unstitched', 'stitched'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onUpdateFilters({ ...filters, type: t })}
                  className={`py-2 px-2 text-center uppercase tracking-wider border transition-colors cursor-pointer ${
                    filters.type === t
                      ? 'border-stone-900 bg-stone-900 text-white font-semibold'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                  }`}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2 font-semibold text-stone-900">
              <span className="uppercase tracking-wider">Max Price</span>
              <span>Rs. {filters.priceMax.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="8000"
              max="20000"
              step="500"
              value={filters.priceMax}
              onChange={(e) => onUpdateFilters({ ...filters, priceMax: Number(e.target.value) })}
              className="w-full accent-stone-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-500 mt-1">
              <span>Rs. 8,000</span>
              <span>Rs. 20,000</span>
            </div>
          </div>

          {/* Fabric */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-stone-900 mb-2">
              Fabric
            </label>
            <div className="space-y-1.5">
              {fabrics.map((fab) => (
                <label key={fab} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fabric"
                    checked={filters.fabric === fab}
                    onChange={() => onUpdateFilters({ ...filters, fabric: fab })}
                    className="accent-stone-900"
                  />
                  <span>{fab}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-white flex gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex-1 py-3 border border-stone-300 text-stone-800 uppercase tracking-widest font-semibold text-xs hover:bg-stone-100 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-stone-950 text-white uppercase tracking-widest font-semibold text-xs hover:bg-stone-800"
          >
            Apply ({totalResults})
          </button>
        </div>
      </div>
    </div>
  );
};
