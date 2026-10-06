import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/currencies';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  currency: Currency;
  onRemoveFromWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  currency,
  onRemoveFromWishlist,
  onSelectProduct,
  onMoveToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#FAF8F5] shadow-2xl flex flex-col z-10">
        <div className="p-5 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#C82944] fill-[#C82944]" />
            <h2 className="font-serif-luxury text-lg tracking-wider text-stone-950 uppercase font-normal">
              Your Wishlist ({wishlist.length})
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-stone-600 hover:text-stone-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-200">
          {wishlist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Heart className="w-12 h-12 text-stone-300 stroke-[1.5]" />
              <p className="font-serif-luxury text-lg uppercase text-stone-800">Your wishlist is empty</p>
              <p className="text-xs text-stone-500">
                Tap the heart on any luxury suit to save your favorite ensembles for Eid and weddings.
              </p>
            </div>
          ) : (
            wishlist.map((product) => (
              <div key={product.id} className="py-4 flex gap-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="w-20 h-26 object-cover object-top border border-stone-200 bg-[#F2EDE4] cursor-pointer"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="text-xs font-semibold text-stone-900 uppercase tracking-wide cursor-pointer hover:underline truncate"
                      >
                        {product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveFromWishlist(product.id)}
                        className="text-stone-400 hover:text-[#C82944] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-0.5">{product.collectionLabel}</p>
                    <p className="text-xs font-semibold text-stone-950 mt-1">
                      {formatPrice(product.salePrice, currency)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onMoveToCart(product);
                      onRemoveFromWishlist(product.id);
                    }}
                    className="mt-2 py-2 bg-stone-900 text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Move to Bag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
