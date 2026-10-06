import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Heart, Instagram, Facebook } from 'lucide-react';
import { Currency, CurrencyCode } from '../types';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeCollection: string;
  onSelectCollection: (col: string) => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenAdmin?: () => void;
  wishlistCount: number;
  currentCurrency: Currency;
  onSelectCurrency: (code: CurrencyCode) => void;
}

// Staggered Cascade Animation Variants
const menuContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -22 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen,
  onClose,
  onSelectCollection,
  onOpenWishlist,
  onOpenAccount,
  wishlistCount,
}) => {
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);

  const handleNavClick = (colKey: string) => {
    onSelectCollection(colKey);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-nav">
          {/* Animated Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/45 backdrop-blur-2xs cursor-pointer"
            onClick={onClose}
          />

          {/* Drawer Slide-In Panel from Left with Silky Easing */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 w-[325px] max-w-[86vw] bg-[#FAF8F5] shadow-2xl flex flex-col z-10 border-r border-[#E5E0D8]"
          >
            {/* Top Bar with Close Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="flex items-center justify-end px-7 pt-6 pb-4"
            >
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-1 -mr-1 text-stone-900 hover:text-stone-600 transition-all hover:rotate-90 duration-200 cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[1.4]" />
              </button>
            </motion.div>

            {/* Menu List with Smooth Staggered Cascading Animation */}
            <div className="flex-1 overflow-y-auto px-7 text-[12.5px] tracking-[0.16em] uppercase text-stone-900 font-medium">
              <motion.div
                variants={menuContainerVariants}
                initial="hidden"
                animate="visible"
                className="border-t border-[#E5E0D8]"
              >
                {/* 1. NOIR LUXURY with Red LIVE NOW Badge */}
                <motion.div variants={menuItemVariants} className="border-b border-[#E5E0D8]">
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={() => handleNavClick('noir-luxury')}
                    className="w-full py-4 flex items-center justify-between text-left text-stone-900 hover:text-stone-600 transition-colors cursor-pointer group"
                  >
                    <span className="group-hover:text-stone-600 transition-colors">NOIR LUXURY</span>
                    <span className="bg-[#E53935] text-white text-[9px] font-bold px-2 py-0.5 rounded-[2px] tracking-wider leading-none shadow-2xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span>LIVE NOW</span>
                    </span>
                  </motion.button>
                </motion.div>

                {/* 2. SALE in Red with Smooth Hover */}
                <motion.div variants={menuItemVariants} className="border-b border-[#E5E0D8]">
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={() => handleNavClick('sale')}
                    className="w-full py-4 text-left text-[#E53935] hover:text-[#C62828] font-semibold transition-colors cursor-pointer"
                  >
                    SALE
                  </motion.button>
                </motion.div>

                {/* 3. NEW ARRIVALS in Red with Smooth Hover */}
                <motion.div variants={menuItemVariants} className="border-b border-[#E5E0D8]">
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={() => handleNavClick('new-arrivals')}
                    className="w-full py-4 text-left text-[#E53935] hover:text-[#C62828] font-semibold transition-colors cursor-pointer"
                  >
                    NEW ARRIVALS
                  </motion.button>
                </motion.div>

                {/* 4. COLLECTIONS with Accordion & Sub-items */}
                <motion.div variants={menuItemVariants} className="border-b border-[#E5E0D8]">
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                    className="w-full py-4 flex items-center justify-between text-left text-stone-900 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    <span>COLLECTIONS</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-250 ${
                        collectionsExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  {/* Sub-Items indented with Smooth Unfold */}
                  <AnimatePresence>
                    {collectionsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.24, ease: 'easeInOut' }}
                        className="overflow-hidden text-[11.5px] tracking-[0.14em] text-stone-700 font-normal"
                      >
                        <div className="border-t border-[#E5E0D8]/60">
                          <motion.button
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => handleNavClick('luxury-formals')}
                            className="w-full py-3.5 pl-2 text-left uppercase hover:text-stone-950 transition-colors cursor-pointer"
                          >
                            LUXURY FORMALS
                          </motion.button>
                        </div>
                        <div className="border-t border-[#E5E0D8]/60">
                          <motion.button
                            whileHover={{ x: 4 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => handleNavClick('chiffon')}
                            className="w-full py-3.5 pl-2 text-left uppercase hover:text-stone-950 transition-colors cursor-pointer"
                          >
                            CHIFFON
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* 5. BEST SELLERS */}
                <motion.div variants={menuItemVariants} className="border-b border-[#E5E0D8]">
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={() => handleNavClick('best-sellers')}
                    className="w-full py-4 text-left text-stone-900 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    BEST SELLERS
                  </motion.button>
                </motion.div>

                {/* 6. ♡ WISHLIST */}
                <motion.div variants={menuItemVariants} className="border-b border-[#E5E0D8]">
                  <motion.button
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    onClick={() => {
                      onClose();
                      onOpenWishlist();
                    }}
                    className="w-full py-4 flex items-center gap-2 text-stone-900 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>WISHLIST</span>
                    {wishlistCount > 0 && (
                      <span className="text-[11px] text-stone-500 font-normal">
                        ({wishlistCount})
                      </span>
                    )}
                  </motion.button>
                </motion.div>

                {/* Bottom Section: Log in & Boxed Socials */}
                <motion.div
                  variants={menuItemVariants}
                  className="pt-8 pb-8 space-y-4"
                >
                  <div>
                    <motion.button
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => {
                        onClose();
                        onOpenAccount();
                      }}
                      className="text-[13px] tracking-normal capitalize text-stone-700 hover:text-stone-950 font-light cursor-pointer"
                    >
                      Log in
                    </motion.button>
                  </div>

                  {/* 2-Column Boxed Social Media (Instagram | Facebook) */}
                  <div className="grid grid-cols-2 border border-[#D5D0C8] divide-x divide-[#D5D0C8] bg-white max-w-[130px] shadow-2xs">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.15 }}
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="py-2.5 flex items-center justify-center text-stone-900 hover:bg-[#FAF8F5] transition-colors"
                    >
                      <Instagram className="w-4 h-4 stroke-[1.4]" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.15 }}
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="py-2.5 flex items-center justify-center text-stone-900 hover:bg-[#FAF8F5] transition-colors"
                    >
                      <Facebook className="w-4 h-4 stroke-[1.4]" />
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
