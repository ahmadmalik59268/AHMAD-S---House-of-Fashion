import React from 'react';
import { Menu, Search, User, ShoppingBag, Sparkles } from 'lucide-react';
import { Currency, CurrencyCode } from '../types';

interface HeaderProps {
  currentCurrency: Currency;
  onSelectCurrency: (code: CurrencyCode) => void;
  onOpenNav: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  cartCount: number;
  wishlistCount: number;
  activeCollection: string;
  onSelectCollection: (col: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNav,
  onOpenSearch,
  onOpenCart,
  onOpenAccount,
  cartCount,
  onSelectCollection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all duration-200">
      {/* Top Announcement Bar - exactly like the video */}
      <div className="bg-[#121110] text-[#FAF8F5] py-2 px-4 text-center text-[11px] sm:text-xs tracking-wider uppercase font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#E2D1B3] shrink-0" />
        <span className="truncate">
          Shop Worldwide Stress-Free! Customs, Duties &amp; Taxes are already covered in your shipping.
        </span>
      </div>

      {/* Main Navigation Bar - exactly like the video */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <div className="flex items-center">
          <button
            onClick={onOpenNav}
            aria-label="Open menu"
            className="p-2 -ml-2 text-stone-900 hover:text-stone-600 transition-colors focus:outline-none cursor-pointer"
          >
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Center: Brand Logo matching MARYAM'S in the screenshot */}
        <div
          className="text-center cursor-pointer select-none"
          onClick={() => onSelectCollection('all')}
        >
          <h1 className="font-brand-logo text-[22px] sm:text-[26px] md:text-[28px] font-medium tracking-[0.06em] text-stone-950 hover:opacity-90 transition-opacity uppercase">
            AHMAD&apos;S
          </h1>
        </div>

        {/* Right: Search, Account, Cart */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search collection"
            className="p-2 text-stone-900 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* User Account */}
          <button
            onClick={onOpenAccount}
            aria-label="Customer account"
            className="p-2 text-stone-900 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Shopping Bag */}
          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="p-2 text-stone-900 hover:text-stone-600 transition-colors relative cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#121110] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
