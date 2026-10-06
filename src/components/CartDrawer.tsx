import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../data/currencies';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: (orderNotes?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [orderNotes, setOrderNotes] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 15000; // 15,000 PKR
  const subtotalPKR = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalPKR);
  const freeShippingProgress = Math.min(100, (subtotalPKR / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#FAF8F5] shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h2 className="font-serif-luxury text-lg tracking-wider text-stone-950 uppercase font-normal">
              Your Shopping Bag ({items.reduce((sum, it) => sum + it.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-1 text-stone-600 hover:text-stone-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-3 bg-[#F2EDE4] border-b border-stone-200/80">
          {remainingForFreeShipping > 0 ? (
            <p className="text-xs text-stone-700">
              Add <span className="font-semibold text-stone-900">{formatPrice(remainingForFreeShipping, currency)}</span> more for <span className="font-semibold text-stone-900">FREE Express Delivery</span>!
            </p>
          ) : (
            <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>Congratulations! You qualify for FREE Express Delivery!</span>
            </p>
          )}
          <div className="mt-2 w-full bg-stone-300 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-stone-900 h-full transition-all duration-300 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-200">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <p className="font-serif-luxury text-lg uppercase text-stone-800">Your bag is empty</p>
                <p className="text-xs text-stone-500 mt-1">
                  Discover our exclusive Noir Luxury and Luxury Formals collection.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-26 object-cover object-top border border-stone-200 bg-[#F2EDE4] shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wide truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        aria-label="Remove item"
                        className="text-stone-400 hover:text-[#C82944] transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Type: <span className="font-medium text-stone-800 uppercase">{item.selectedType}</span>
                      {item.selectedType === 'stitched' && item.selectedSize && (
                        <span> · Size: {item.selectedSize}</span>
                      )}
                    </p>

                    <p className="text-[10px] text-stone-500">
                      Sleeves: {item.sleeveLining === 'with' ? 'With Lining' : 'Without Lining'}
                    </p>

                    {(item.addOns.boxPackaging || item.addOns.lining) && (
                      <p className="text-[10px] text-stone-500">
                        Add-ons: {[
                          item.addOns.boxPackaging ? 'Box Packaging' : '',
                          item.addOns.lining ? 'Lining' : '',
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Selector */}
                    <div className="inline-flex items-center border border-stone-300 bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-2.5 py-1 text-stone-600 hover:text-stone-950 font-medium text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-semibold text-stone-900 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-2.5 py-1 text-stone-600 hover:text-stone-950 font-medium text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <span className="text-xs font-semibold text-stone-950">
                      {formatPrice(item.unitPrice * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-white space-y-3">
            {/* Special Instructions */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-stone-600 mb-1 font-medium">
                Order Notes / Special Stitching Instructions:
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Please shorten shirt length to 44 inches or add urgent gift wrapping..."
                rows={2}
                className="w-full text-xs p-2 border border-stone-300 rounded-none focus:outline-none focus:border-stone-900 bg-[#FAF8F5]"
              />
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs uppercase tracking-wider text-stone-600">Subtotal</span>
              <span className="text-base font-semibold text-stone-950">
                {formatPrice(subtotalPKR, currency)}
              </span>
            </div>

            <p className="text-[10px] text-stone-500">
              Taxes, duties &amp; shipping calculated at checkout.
            </p>

            {/* Checkout CTA */}
            <button
              onClick={() => onProceedToCheckout(orderNotes)}
              className="w-full py-4 bg-[#121110] hover:bg-stone-800 text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
              <span>Guaranteed Safe &amp; Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
