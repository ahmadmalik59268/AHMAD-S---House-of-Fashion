import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/currencies';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: Currency;
  onSelectProduct: (p: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.collectionLabel.toLowerCase().includes(q) ||
        p.colorName.toLowerCase().includes(q)
    );
  }, [query, products]);

  if (!isOpen) return null;

  const popularSearches = ['Noir Luxury', 'ZEE-1912', 'Velvet', 'Organza', 'Bridal Formals', 'Emerald Green'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] shadow-2xl overflow-hidden border border-stone-200">
        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-stone-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by suit name, code (e.g. ZEE-1912), fabric, or color..."
            className="flex-1 text-sm sm:text-base focus:outline-none bg-transparent text-stone-900 placeholder-stone-400 font-normal"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-stone-950 px-2 py-1"
          >
            Cancel
          </button>
        </div>

        {/* Popular searches suggestions */}
        {!query && (
          <div className="p-5 text-xs">
            <span className="text-stone-400 uppercase tracking-widest font-semibold block mb-2.5">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 bg-stone-200/70 hover:bg-stone-300 text-stone-800 rounded-full transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-stone-200">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500">
                No luxury ensembles found matching &ldquo;{query}&rdquo;.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProduct(item);
                    onClose();
                  }}
                  className="py-3 flex items-center justify-between hover:bg-stone-100/60 px-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-15 object-cover bg-[#F2EDE4] border border-stone-200"
                    />
                    <div>
                      <p className="text-xs font-semibold text-stone-900 uppercase tracking-wide">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-stone-500">{item.fabric}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-stone-950">
                      {formatPrice(item.salePrice, currency)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
