import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Product, Currency, ProductType, ProductSize, SleeveLining, ProductAddOns } from '../types';
import { formatPrice } from '../data/currencies';

interface QuickViewModalProps {
  product: Product | null;
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    selectedType: ProductType,
    selectedSize: ProductSize | undefined,
    sleeveLining: SleeveLining,
    addOns: ProductAddOns,
    quantity: number
  ) => void;
  onOpenFullDetail: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  currency,
  isOpen,
  onClose,
  onAddToCart,
  onOpenFullDetail,
}) => {
  const [selectedType, setSelectedType] = useState<ProductType>('unstitched');
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [sleeveLining, setSleeveLining] = useState<SleeveLining>('without');
  const [boxPackaging, setBoxPackaging] = useState(false);
  const [liningAddon, setLiningAddon] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  let unitPricePKR = product.salePrice;
  if (selectedType === 'stitched') unitPricePKR += 4500;
  if (boxPackaging) unitPricePKR += 500;
  if (liningAddon) unitPricePKR += 2000;

  const handleAdd = () => {
    onAddToCart(
      product,
      selectedType,
      selectedType === 'stitched' ? selectedSize : undefined,
      sleeveLining,
      { boxPackaging, lining: liningAddon },
      quantity
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-none shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-20 p-1.5 text-stone-600 hover:text-stone-950 transition-colors bg-white/80 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-[#F2EDE4] relative aspect-[3/4] md:aspect-auto">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Details & Selectors */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
              {product.collectionLabel} · {product.code}
            </span>
            <h2 className="font-serif-luxury text-xl text-stone-950 uppercase font-normal mt-1">
              {product.name}
            </h2>

            <div className="mt-1 flex items-baseline gap-2">
              {product.discountPercent && product.discountPercent > 0 ? (
                <>
                  <span className="text-stone-400 line-through text-xs">
                    {formatPrice(product.originalPrice, currency)}
                  </span>
                  <span className="text-lg font-semibold text-stone-950">
                    {formatPrice(unitPricePKR, currency)}
                  </span>
                  <span className="text-[11px] text-[#C82944] font-medium">
                    Save {product.discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-lg font-semibold text-stone-950">
                  {formatPrice(unitPricePKR, currency)}
                </span>
              )}
            </div>

            {/* Type toggle */}
            <div className="mt-4">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-800 mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType('unstitched')}
                  className={`py-2 text-xs uppercase font-medium border text-center cursor-pointer ${
                    selectedType === 'unstitched'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white text-stone-700'
                  }`}
                >
                  Unstitched
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('stitched')}
                  className={`py-2 text-xs uppercase font-medium border text-center cursor-pointer ${
                    selectedType === 'stitched'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white text-stone-700'
                  }`}
                >
                  Stitched (+{formatPrice(4500, currency)})
                </button>
              </div>
            </div>

            {/* Addons */}
            <div className="mt-3 space-y-1.5 text-xs text-stone-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={boxPackaging}
                  onChange={(e) => setBoxPackaging(e.target.checked)}
                  className="rounded text-stone-900 accent-stone-900"
                />
                <span>Box Packaging (+{formatPrice(500, currency)})</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={liningAddon}
                  onChange={(e) => setLiningAddon(e.target.checked)}
                  className="rounded text-stone-900 accent-stone-900"
                />
                <span>Lining (+{formatPrice(2000, currency)})</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleAdd}
              className="w-full py-3 bg-[#121110] hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <span>ADD TO CART</span>
              )}
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFullDetail(product);
              }}
              className="w-full text-center text-xs underline text-stone-600 hover:text-stone-950 py-1 cursor-pointer"
            >
              View Full Product Details &amp; Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
