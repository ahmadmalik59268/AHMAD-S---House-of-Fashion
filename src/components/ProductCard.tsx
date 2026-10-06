import React from 'react';
import { Heart } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/currencies';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onWatchVideo?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickView,
}) => {
  return (
    <div className="group relative flex flex-col">
      {/* Tall Portrait Aspect Ratio (2:3) matching exact Maryam's look */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#F2EDE4] cursor-pointer rounded-xs">
        {/* Main Product Image (Full Length Model) */}
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          onClick={() => onSelectProduct(product)}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
        />

        {/* Top Right Controls (Wishlist) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-center gap-2 z-10">
          {/* Wishlist Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="w-7 h-7 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-stone-900 hover:scale-110 transition-transform shadow-2xs cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted ? 'fill-[#C82944] text-[#C82944]' : 'text-stone-800 stroke-[1.5]'
              }`}
            />
          </button>
        </div>

        {/* Quick View Button on Hover (Hidden on mobile) */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-250 ease-out z-10 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2.5 bg-stone-950 text-white text-[11px] uppercase tracking-widest font-medium hover:bg-stone-800 transition-colors shadow-md cursor-pointer"
          >
            Quick view
          </button>
        </div>
      </div>

      {/* Info Container matching exact Maryam's layout */}
      <div className="pt-2.5 pb-1 text-center cursor-pointer" onClick={() => onSelectProduct(product)}>
        {/* Title: Name - Code */}
        <h3 className="text-xs sm:text-[13px] font-normal tracking-wide text-stone-900 hover:text-stone-600 transition-colors truncate">
          {product.name}
        </h3>

        {/* Pricing: Rs.9,800.00 */}
        <div className="mt-0.5 text-[11px] sm:text-xs text-stone-600 font-normal">
          {product.discountPercent && product.discountPercent > 0 ? (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-stone-400 line-through text-[11px]">
                {formatPrice(product.originalPrice, currency)}
              </span>
              <span className="text-stone-900 font-medium">
                {formatPrice(product.salePrice, currency)}
              </span>
            </div>
          ) : (
            <span>{formatPrice(product.salePrice, currency)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
