import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, MessageCircle, Star, Sparkles, Globe } from 'lucide-react';
import { Header } from './components/Header';
import { NavDrawer } from './components/NavDrawer';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './components/ProductDetailView';
import { QuickViewModal } from './components/QuickViewModal';
import { VideoReelModal } from './components/VideoReelModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FilterDrawer } from './components/FilterDrawer';
import { ReviewsDrawer } from './components/ReviewsDrawer';
import { WhatsAppChatModal, WhatsAppIcon } from './components/WhatsAppChatModal';
import { SizeChartModal } from './components/SizeChartModal';
import { SearchModal } from './components/SearchModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AccountPageView } from './components/AccountPageView';
import { PolicyModal, PolicyType } from './components/PolicyModal';
import { Footer } from './components/Footer';
import { HeroSlider } from './components/HeroSlider';
import { WatchAndBuySection } from './components/WatchAndBuySection';
import { ShopByCollectionSection } from './components/ShopByCollectionSection';
import { AdminPanel } from './admin/AdminPanel';
import { supabase } from './lib/supabase';
import { fetchLiveProducts, fetchSupabaseCart, syncCartToSupabase } from './lib/storeService';
import { PRODUCTS, HERO_FEATURED } from './data/products';
import { CURRENCIES } from './data/currencies';
import {
  Product,
  CartItem,
  CurrencyCode,
  ProductType,
  ProductSize,
  SleeveLining,
  ProductAddOns,
} from './types';

export default function App() {
  // Admin Route Handler (/admin, /admin/login)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToStore = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Currencies
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('PKR');
  const currency = CURRENCIES[currencyCode] || CURRENCIES.PKR;

  // Navigation & Product Detail View
  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Live products loaded from Supabase (fallback to static catalog)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Cart & Wishlist with localStorage persistence and Supabase sync
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ahmads_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('ahmads_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load live products & user cart from Supabase
  useEffect(() => {
    async function loadLiveCatalog() {
      const live = await fetchLiveProducts();
      if (live && live.length > 0) {
        setProducts(live);
      }
    }
    loadLiveCatalog();

    async function checkUserSession() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
        const userCart = await fetchSupabaseCart(data.user.id);
        if (userCart && userCart.length > 0) {
          setCart(userCart);
        }
      }
    }
    checkUserSession();

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        const userCart = await fetchSupabaseCart(session.user.id);
        if (userCart && userCart.length > 0) {
          setCart(userCart);
        }
      } else {
        setCurrentUserId(null);
      }
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Save cart to local storage and sync to Supabase when logged in
  useEffect(() => {
    try {
      localStorage.setItem('ahmads_cart', JSON.stringify(cart));
    } catch {
      // safe fallback
    }
    if (currentUserId) {
      syncCartToSupabase(currentUserId, cart);
    }
  }, [cart, currentUserId]);

  useEffect(() => {
    try {
      localStorage.setItem('ahmads_wishlist', JSON.stringify(wishlist));
    } catch {
      // safe fallback
    }
  }, [wishlist]);

  // Modal / Drawer States
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountPage, setIsAccountPage] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState<PolicyType>('delivery');

  // Active modals for quick view & video reels
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeVideoProduct, setActiveVideoProduct] = useState<Product | null>(null);
  const [cartOrderNotes, setCartOrderNotes] = useState<string>('');

  // Filters State
  const [filters, setFilters] = useState<{
    priceMax: number;
    type: ProductType | 'all';
    fabric: string;
    sortBy: string;
  }>({
    priceMax: 20000,
    type: 'all',
    fabric: 'All Fabrics',
    sortBy: 'featured',
  });

  // Cart operations
  const handleAddToCart = (
    product: Product,
    selectedType: ProductType = 'unstitched',
    selectedSize: ProductSize = 'M',
    sleeveLining: SleeveLining = 'without',
    addOns: ProductAddOns = { boxPackaging: false, lining: false },
    quantity: number = 1
  ) => {
    let unitPrice = product.salePrice;
    if (selectedType === 'stitched') unitPrice += 4500;
    if (addOns.boxPackaging) unitPrice += 500;
    if (addOns.lining) unitPrice += 2000;

    const newItemId = `${product.id}-${selectedType}-${selectedSize}-${sleeveLining}-${addOns.boxPackaging}-${addOns.lining}`;

    setCart((prev) => {
      const existing = prev.find((it) => it.id === newItemId);
      if (existing) {
        return prev.map((it) =>
          it.id === newItemId ? { ...it, quantity: it.quantity + quantity } : it
        );
      }
      return [
        ...prev,
        {
          id: newItemId,
          productId: product.id,
          product,
          selectedType,
          selectedSize: selectedType === 'stitched' ? selectedSize : undefined,
          sleeveLining,
          addOns,
          quantity,
          unitPrice,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((it) => it.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeCollection === 'noir-luxury') {
      list = list.filter((p) => p.collection === 'noir-luxury');
    } else if (activeCollection === 'luxury-formals') {
      list = list.filter((p) => p.collection === 'luxury-formals');
    } else if (activeCollection === 'sale') {
      list = list.filter((p) => p.isSale);
    } else if (activeCollection === 'best-sellers') {
      list = list.filter((p) => p.isBestSeller);
    } else if (activeCollection === 'new-arrivals') {
      list = list.slice(0, 8);
    }

    // Price filter
    list = list.filter((p) => p.salePrice <= filters.priceMax);

    // Fabric filter
    if (filters.fabric !== 'All Fabrics') {
      list = list.filter((p) => p.fabric.toLowerCase().includes(filters.fabric.toLowerCase()));
    }

    // Sort
    if (filters.sortBy === 'price-low') {
      list.sort((a, b) => a.salePrice - b.salePrice);
    } else if (filters.sortBy === 'price-high') {
      list.sort((a, b) => b.salePrice - a.salePrice);
    } else if (filters.sortBy === 'title-az') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, activeCollection, filters]);

  // Page title / heading
  const getCollectionTitle = () => {
    if (activeCollection === 'noir-luxury') return 'NOIR LUXURY';
    if (activeCollection === 'luxury-formals') return 'LUXURY FORMALS';
    if (activeCollection === 'sale') return 'SALE ENSEMBLES';
    if (activeCollection === 'best-sellers') return 'BEST SELLERS';
    if (activeCollection === 'new-arrivals') return 'NEW ARRIVALS';
    return 'NOIR LUXURY & LUXURY FORMALS';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPolicy = (type: PolicyType) => {
    setPolicyType(type);
    setIsPolicyModalOpen(true);
  };

  if (isAdminRoute) {
    return (
      <AdminPanel
        onReturnToStore={navigateToStore}
        onProductsChange={(updated) => setProducts(updated)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-stone-900 selection:text-white relative">
      {/* Header */}
      <Header
        currentCurrency={currency}
        onSelectCurrency={setCurrencyCode}
        onOpenNav={() => setIsNavOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => {
          setIsAccountPage(true);
          setSelectedProduct(null);
          scrollToTop();
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        activeCollection={activeCollection}
        onSelectCollection={(col) => {
          setIsAccountPage(false);
          setSelectedProduct(null);
          setActiveCollection(col);
          scrollToTop();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAccountPage ? (
          /* FULL PAGE ACCOUNT / PROFILE / SIGN IN VIEW */
          <AccountPageView
            onBackToStore={() => {
              setIsAccountPage(false);
              scrollToTop();
            }}
            onOpenAdmin={navigateToAdmin}
            currency={currency}
            onSelectProduct={(p) => {
              setIsAccountPage(false);
              setSelectedProduct(p);
              scrollToTop();
            }}
          />
        ) : selectedProduct ? (
          /* PRODUCT DETAIL PAGE VIEW */
          <ProductDetailView
            product={selectedProduct}
            currency={currency}
            isWishlisted={wishlist.some((p) => p.id === selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={(prod, type, sz, lining, addons, qty) => {
              handleAddToCart(prod, type, sz, lining, addons, qty);
              setIsCheckoutOpen(true);
            }}
            onBack={() => {
              setSelectedProduct(null);
              scrollToTop();
            }}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              scrollToTop();
            }}
            onQuickView={(p) => setQuickViewProduct(p)}
            onWatchVideo={(p) => setActiveVideoProduct(p)}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            allProducts={products}
          />
        ) : (
          /* CATALOG & COLLECTION VIEW */
          <div>
            {activeCollection === 'all' ? (
              /* HOMEPAGE SECTIONS - EXACTLY MIRRORING REFERENCE WEBSITE */
              <div className="space-y-4 sm:space-y-6">
                {/* 1. Hero Carousel Slider */}
                <HeroSlider
                  onSelectCollection={(col) => {
                    setSelectedProduct(null);
                    setActiveCollection(col);
                    scrollToTop();
                  }}
                />

                {/* 2. NEW ARRIVALS Section */}
                <section className="py-10 sm:py-14 bg-white">
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-6 sm:mb-8">
                      <h2 className="font-heading text-xl sm:text-2xl md:text-3xl tracking-[0.2em] text-stone-950 uppercase font-medium">
                        NEW ARRIVALS
                      </h2>
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setActiveCollection('new-arrivals');
                            scrollToTop();
                          }}
                          className="border border-stone-300 bg-white px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs inline-block"
                        >
                          VIEW ALL
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 lg:gap-6">
                      {products.slice(0, 4).map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          isWishlisted={wishlist.some((p) => p.id === product.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onSelectProduct={(p) => {
                            setSelectedProduct(p);
                            scrollToTop();
                          }}
                          onQuickView={(p) => setQuickViewProduct(p)}
                          onWatchVideo={(p) => setActiveVideoProduct(p)}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* 3. WATCH & BUY Video Reels Section */}
                <WatchAndBuySection
                  products={products}
                  currency={currency}
                  onSelectProduct={(p) => {
                    setSelectedProduct(p);
                    scrollToTop();
                  }}
                  onWatchVideo={(p) => setActiveVideoProduct(p)}
                />

                {/* 4. BEST SELLERS Section */}
                <section className="py-10 sm:py-14 bg-white">
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-6 sm:mb-8">
                      <h2 className="font-heading text-xl sm:text-2xl md:text-3xl tracking-[0.2em] text-stone-950 uppercase font-medium">
                        BEST SELLERS
                      </h2>
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setActiveCollection('best-sellers');
                            scrollToTop();
                          }}
                          className="border border-stone-300 bg-white px-4 py-1.5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-medium text-stone-900 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs inline-block"
                        >
                          VIEW ALL
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 lg:gap-6">
                      {products.filter((p) => p.isBestSeller)
                        .slice(0, 4)
                        .map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            currency={currency}
                            isWishlisted={wishlist.some((p) => p.id === product.id)}
                            onToggleWishlist={handleToggleWishlist}
                            onSelectProduct={(p) => {
                              setSelectedProduct(p);
                              scrollToTop();
                            }}
                            onQuickView={(p) => setQuickViewProduct(p)}
                            onWatchVideo={(p) => setActiveVideoProduct(p)}
                          />
                        ))}
                    </div>
                  </div>
                </section>

                {/* 5. SHOP BY COLLECTION Section */}
                <ShopByCollectionSection
                  onSelectCollection={(col) => {
                    setSelectedProduct(null);
                    setActiveCollection(col);
                    scrollToTop();
                  }}
                />
              </div>
            ) : (
              /* SPECIFIC COLLECTION VIEW - MATCHING REFERENCE VIDEO */
              <div>
                {/* Collection Title Header matching reference image */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4 text-center">
                  <h2 className="font-heading text-base sm:text-lg md:text-xl tracking-[0.14em] text-stone-900 uppercase font-normal">
                    {getCollectionTitle()}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-light mt-0.5">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>

                {/* Subheader: Filter on left & Sort Dropdown on right matching screenshot */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 mb-6 flex items-center justify-between text-xs text-stone-700">
                  {/* Filter Button in bordered box */}
                  <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center gap-2 border border-stone-300 bg-white px-3.5 py-1.5 text-xs text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.4]" />
                    <span>Filter</span>
                  </button>

                  {/* Center products count on desktop */}
                  <div className="hidden sm:block text-xs text-stone-500 font-light">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </div>

                  {/* Sort By Dropdown in bordered box */}
                  <div className="relative border border-stone-300 bg-white px-2.5 py-1.5 flex items-center gap-1">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      aria-label="Sort products"
                      className="bg-transparent border-none text-xs text-stone-800 focus:outline-none cursor-pointer pr-4 appearance-none"
                    >
                      <option value="relevant">Most relevant</option>
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="title-az">Alphabetically, A-Z</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-stone-500 pointer-events-none absolute right-2" />
                  </div>
                </div>

                {/* Product Cards Grid (4 columns on desktop, 2 on mobile) matching reference */}
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="font-heading text-lg text-stone-800 uppercase font-medium">
                        No products found
                      </p>
                      <p className="text-xs text-stone-500 mt-2">
                        Try adjusting your filters or price slider to see more luxury ensembles.
                      </p>
                      <button
                        onClick={() => {
                          setFilters({
                            priceMax: 20000,
                            type: 'all',
                            fabric: 'All Fabrics',
                            sortBy: 'featured',
                          });
                          setActiveCollection('all');
                        }}
                        className="mt-4 px-6 py-2.5 bg-stone-950 text-white text-xs uppercase tracking-widest font-semibold cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 lg:gap-6">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          isWishlisted={wishlist.some((p) => p.id === product.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onSelectProduct={(p) => {
                            setSelectedProduct(p);
                            scrollToTop();
                          }}
                          onQuickView={(p) => setQuickViewProduct(p)}
                          onWatchVideo={(p) => setActiveVideoProduct(p)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating UI Elements */}

      {/* 1. Bottom Left: Floating Currency Switcher Badge */}
      <div className="fixed bottom-5 left-4 z-40">
        <button
          onClick={() => setIsCurrencyModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-stone-300 shadow-lg text-xs font-medium text-stone-800 hover:bg-stone-50 transition-transform active:scale-95 cursor-pointer"
          title="Change Store Currency"
        >
          <span className="text-base">{currency.flag}</span>
          <span className="font-semibold tracking-wider">{currency.code}</span>
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>
      </div>

      {/* 2. Right Edge: Persistent Vertical "Reviews" Tab */}
      <button
        onClick={() => setIsReviewsOpen(true)}
        className="fixed top-1/2 right-0 -translate-y-1/2 z-40 bg-[#121110] hover:bg-stone-800 text-[#FAF8F5] py-3 px-2 shadow-xl flex items-center gap-1 text-[11px] font-semibold tracking-widest uppercase writing-mode-vertical cursor-pointer transition-colors"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mb-1" />
        <span>Reviews</span>
      </button>

      {/* 3. Bottom Right: Direct WhatsApp Customer Support Link */}
      <a
        href="https://wa.me/923326109729?text=Salam%20AHMAD%27S%2C%20I%20would%20like%20to%20inquire%20about%20your%20Luxury%20Collections."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-4 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold tracking-wide cursor-pointer transition-all hover:scale-105 active:scale-95 group border-2 border-white/90 select-none"
        title="Chat on WhatsApp (+92 332 6109729)"
        aria-label="Chat directly on WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
        <span className="font-medium tracking-wide">WhatsApp</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      </a>

      {/* Currency Switcher Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xs bg-white shadow-2xl p-5 border border-stone-200">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <span className="text-xs uppercase font-bold tracking-wider text-stone-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Select Currency</span>
              </span>
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              {Object.values(CURRENCIES).map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrencyCode(c.code);
                    setIsCurrencyModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 hover:bg-stone-100 transition-colors text-left cursor-pointer ${
                    currency.code === c.code ? 'bg-stone-100 font-bold text-stone-950' : 'text-stone-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span>{c.label}</span>
                  </span>
                  <span className="text-stone-400">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drawers & Modals */}
      <NavDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        activeCollection={activeCollection}
        onSelectCollection={(col) => {
          setSelectedProduct(null);
          setActiveCollection(col);
          scrollToTop();
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => {
          setIsAccountPage(true);
          setSelectedProduct(null);
          scrollToTop();
        }}
        onOpenAdmin={navigateToAdmin}
        wishlistCount={wishlist.length}
        currentCurrency={currency}
        onSelectCurrency={setCurrencyCode}
      />

      <QuickViewModal
        product={quickViewProduct}
        currency={currency}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenFullDetail={(p) => {
          setSelectedProduct(p);
          scrollToTop();
        }}
      />

      <VideoReelModal
        product={activeVideoProduct}
        allProducts={products}
        currency={currency}
        isOpen={!!activeVideoProduct}
        onClose={() => setActiveVideoProduct(null)}
        onAddToCart={(p) => handleAddToCart(p)}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          scrollToTop();
        }}
        onChangeProduct={(nextProd) => setActiveVideoProduct(nextProd)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={(notes) => {
          setCartOrderNotes(notes || '');
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currency}
        orderNotes={cartOrderNotes}
        onClearCart={handleClearCart}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onUpdateFilters={setFilters}
        onResetFilters={() =>
          setFilters({
            priceMax: 20000,
            type: 'all',
            fabric: 'All Fabrics',
            sortBy: 'featured',
          })
        }
        totalResults={filteredProducts.length}
      />

      <ReviewsDrawer
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
      />

      <WhatsAppChatModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      <SizeChartModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        currency={currency}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          scrollToTop();
        }}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        currency={currency}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          scrollToTop();
        }}
        onMoveToCart={(p) => handleAddToCart(p)}
      />

      <PolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        policyType={policyType}
        onOpenType={(type) => setPolicyType(type)}
      />

      {/* Footer */}
      <Footer
        onSelectCollection={(col) => {
          setSelectedProduct(null);
          setActiveCollection(col);
          scrollToTop();
        }}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenReviews={() => setIsReviewsOpen(true)}
        onOpenPolicy={handleOpenPolicy}
        onOpenAdmin={navigateToAdmin}
      />
    </div>
  );
}
