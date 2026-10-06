import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Check,
  ShieldCheck,
  Truck,
  Maximize2,
  X,
  Scissors,
} from 'lucide-react';
import { Product, Currency, ProductType, ProductSize, SleeveLining, ProductAddOns } from '../types';
import { formatPrice } from '../data/currencies';
import { ProductCard } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (
    product: Product,
    selectedType: ProductType,
    selectedSize: ProductSize | undefined,
    sleeveLining: SleeveLining,
    addOns: ProductAddOns,
    quantity: number
  ) => void;
  onBuyNow: (
    product: Product,
    selectedType: ProductType,
    selectedSize: ProductSize | undefined,
    sleeveLining: SleeveLining,
    addOns: ProductAddOns,
    quantity: number
  ) => void;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onWatchVideo: (product: Product) => void;
  onOpenSizeGuide: () => void;
  allProducts: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onBack,
  onSelectProduct,
  onQuickView,
  onWatchVideo,
  onOpenSizeGuide,
  allProducts,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedType, setSelectedType] = useState<ProductType>('unstitched');
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [sleeveLining, setSleeveLining] = useState<SleeveLining>('without');
  const [boxPackaging, setBoxPackaging] = useState(false);
  const [liningAddon, setLiningAddon] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Calculate live total price with add-ons in PKR
  let unitPricePKR = product.salePrice;
  if (selectedType === 'stitched') {
    unitPricePKR += 4500; // Pakistani standard luxury bespoke stitching
  }
  if (boxPackaging) {
    unitPricePKR += 500;
  }
  if (liningAddon) {
    unitPricePKR += 2000;
  }

  const handleAddToCart = () => {
    onAddToCart(
      product,
      selectedType,
      selectedType === 'stitched' ? selectedSize : undefined,
      sleeveLining,
      { boxPackaging, lining: liningAddon },
      quantity
    );
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
  };

  const handleBuyNow = () => {
    onBuyNow(
      product,
      selectedType,
      selectedType === 'stitched' ? selectedSize : undefined,
      sleeveLining,
      { boxPackaging, lining: liningAddon },
      quantity
    );
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back to collection button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-stone-600 hover:text-stone-950 mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to {product.collectionLabel}</span>
      </button>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Gallery (Thumbs + Main Image) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Vertical Thumbnail List */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:w-20 shrink-0">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'border-stone-900 shadow-xs'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} angle ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="relative flex-1 aspect-[3/4] bg-[#F2EDE4] overflow-hidden group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              onClick={() => setIsLightboxOpen(true)}
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 cursor-zoom-in"
            />

            {/* Expand / Lightbox Button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              title="Click to Zoom Fullscreen"
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-900 hover:scale-110 transition-transform shadow-md cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Floating Wishlist button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-900 hover:scale-110 transition-transform shadow-md cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isWishlisted ? 'fill-[#C82944] text-[#C82944]' : 'text-stone-800'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Title & SKU */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">
                {product.collectionLabel} · Code: {product.code}
              </span>
              {product.isSale && (
                <span className="bg-[#C82944] text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  Sale
                </span>
              )}
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-3xl tracking-wide text-stone-950 mt-1 uppercase font-normal">
              {product.name}
            </h1>

            {/* Pricing Section */}
            <div className="mt-2 flex items-baseline gap-3">
              {product.discountPercent && product.discountPercent > 0 ? (
                <>
                  <span className="text-stone-400 line-through text-sm sm:text-base font-normal">
                    {formatPrice(product.originalPrice, currency)}
                  </span>
                  <span className="text-xl sm:text-2xl font-semibold text-stone-950">
                    {formatPrice(unitPricePKR, currency)}
                  </span>
                  <span className="text-xs font-semibold text-[#C82944] tracking-wide">
                    Save {product.discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-semibold text-stone-950">
                  {formatPrice(unitPricePKR, currency)}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-500 mt-1 tracking-wide">
              Shipping calculated at checkout. Customs, duties &amp; taxes covered worldwide.
            </p>
          </div>

          <div className="h-px bg-stone-200" />

          {/* TYPE SELECTOR (Unstitched / Stitched) - Exactly as in the video */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-stone-900 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" />
                <span>TYPE</span>
              </label>
              {selectedType === 'stitched' && (
                <button
                  onClick={onOpenSizeGuide}
                  className="text-xs text-stone-600 underline hover:text-stone-950 cursor-pointer"
                >
                  Size Guide &amp; Tailoring
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('unstitched')}
                className={`py-3 px-4 text-xs uppercase tracking-wider font-medium border text-center transition-all cursor-pointer ${
                  selectedType === 'unstitched'
                    ? 'border-stone-950 bg-stone-950 text-white font-semibold shadow-xs'
                    : 'border-stone-300 text-stone-800 hover:border-stone-500 bg-white'
                }`}
              >
                UNSTITCHED
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('stitched')}
                className={`py-3 px-4 text-xs uppercase tracking-wider font-medium border text-center transition-all cursor-pointer ${
                  selectedType === 'stitched'
                    ? 'border-stone-950 bg-stone-950 text-white font-semibold shadow-xs'
                    : 'border-stone-300 text-stone-800 hover:border-stone-500 bg-white'
                }`}
              >
                STITCHED (+{formatPrice(4500, currency)})
              </button>
            </div>
          </div>

          {/* If STITCHED: Size Selector */}
          {selectedType === 'stitched' && (
            <div className="p-4 bg-stone-100/70 border border-stone-200 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-800">
                  Select Size
                </span>
                <span className="text-[11px] text-stone-500">Standard &amp; Custom Fit</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {(['XS', 'S', 'M', 'L', 'XL', 'Custom'] as ProductSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2 text-xs font-medium border transition-colors cursor-pointer ${
                      selectedSize === sz
                        ? 'border-stone-950 bg-stone-900 text-white'
                        : 'border-stone-300 bg-white text-stone-800 hover:border-stone-600'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              {selectedSize === 'Custom' && (
                <p className="text-[11px] text-stone-600 italic">
                  * Our master tailor will contact you via WhatsApp (0332-6109729) for your exact body measurements.
                </p>
              )}
            </div>
          )}

          {/* SLEEVE LINING (As seen in the video) */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-stone-900 mb-2">
              SLEEVE LINING
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSleeveLining('without')}
                className={`py-2.5 px-3 text-xs tracking-wide border text-center transition-all cursor-pointer ${
                  sleeveLining === 'without'
                    ? 'border-stone-950 bg-stone-950 text-white font-medium'
                    : 'border-stone-300 text-stone-700 bg-white hover:border-stone-400'
                }`}
              >
                Sleeves without Lining
              </button>
              <button
                type="button"
                onClick={() => setSleeveLining('with')}
                className={`py-2.5 px-3 text-xs tracking-wide border text-center transition-all cursor-pointer ${
                  sleeveLining === 'with'
                    ? 'border-stone-950 bg-stone-950 text-white font-medium'
                    : 'border-stone-300 text-stone-700 bg-white hover:border-stone-400'
                }`}
              >
                Sleeves with Lining
              </button>
            </div>
          </div>

          {/* ADD ONS (Matching the exact options in the video!) */}
          <div className="space-y-2.5 pt-1">
            <span className="block text-xs uppercase tracking-wider font-semibold text-stone-900">
              ADD ON
            </span>

            <label className="flex items-center gap-3 p-3 border border-stone-200 bg-white hover:border-stone-400 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={boxPackaging}
                onChange={(e) => setBoxPackaging(e.target.checked)}
                className="w-4 h-4 text-stone-900 accent-stone-900 rounded"
              />
              <span className="text-xs uppercase tracking-wider font-medium text-stone-800">
                BOX PACKAGING (+{formatPrice(500, currency)})
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-stone-200 bg-white hover:border-stone-400 transition-colors cursor-pointer select-none">
              <input
                type="checkbox"
                checked={liningAddon}
                onChange={(e) => setLiningAddon(e.target.checked)}
                className="w-4 h-4 text-stone-900 accent-stone-900 rounded"
              />
              <span className="text-xs uppercase tracking-wider font-medium text-stone-800">
                LINING + {formatPrice(2000, currency)}
              </span>
            </label>
          </div>

          {/* QUANTITY & ACTIONS */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-stone-900 mb-2">
                QUANTITY
              </label>
              <div className="inline-flex items-center border border-stone-300 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-stone-600 hover:text-stone-950 font-medium text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-semibold text-stone-900 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-stone-600 hover:text-stone-950 font-medium text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#121110] hover:bg-stone-800 text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <span>ADD TO CART</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-stone-200 hover:bg-stone-300 text-stone-950 text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer"
              >
                BUY IT NOW
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-stone-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-900 shrink-0" />
                <span>100% Original Designer Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-900 shrink-0" />
                <span>Express Worldwide Shipping</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-stone-200" />

          {/* EMBROIDERY & CRAFTSMANSHIP BREAKDOWN (verbatim from video!) */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-stone-950">
              FABRIC &amp; EMBROIDERY SPECIFICATIONS
            </h3>
            <ul className="space-y-2 text-xs text-stone-700 leading-relaxed list-disc list-inside">
              {product.details.map((item, idx) => (
                <li key={idx} className="font-normal">
                  <span className="font-medium text-stone-900">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 text-xs text-stone-600">
              <p><span className="font-medium text-stone-900">Fabric Composition:</span> {product.fabric}</p>
              <p><span className="font-medium text-stone-900">Color Palette:</span> {product.colorName}</p>
            </div>
          </div>

          {/* DISCLAIMER BOX (As seen in the video at 00:45) */}
          <div className="p-4 bg-stone-100/90 border-l-2 border-stone-800 text-[11px] text-stone-600 leading-relaxed">
            <p className="font-semibold text-stone-900 uppercase tracking-wider mb-1">
              DISCLAIMER:
            </p>
            <p>{product.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/50"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={product.images[selectedImageIndex] || product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[90vh] object-contain shadow-2xl"
          />
        </div>
      )}

      {/* YOU MAY ALSO LIKE Section (As shown in the video at 00:46) */}
      <div className="mt-16 sm:mt-24 pt-12 border-t border-stone-200">
        <div className="text-center mb-10">
          <h2 className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.2em] text-stone-950 uppercase font-normal">
            YOU MAY ALSO LIKE
          </h2>
          <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">
            Hand-picked Luxury Pret &amp; Formals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {relatedProducts.map((relProduct) => (
            <ProductCard
              key={relProduct.id}
              product={relProduct}
              currency={currency}
              isWishlisted={false}
              onToggleWishlist={onToggleWishlist}
              onSelectProduct={onSelectProduct}
              onQuickView={onQuickView}
              onWatchVideo={onWatchVideo}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
