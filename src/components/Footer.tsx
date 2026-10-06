import React, { useState } from 'react';
import { ArrowRight, Check, Phone, Mail, Clock, MapPin, Instagram, Facebook } from 'lucide-react';
import { PolicyType } from './PolicyModal';

interface FooterProps {
  onSelectCollection: (col: string) => void;
  onOpenSizeGuide: () => void;
  onOpenReviews: () => void;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCollection,
  onOpenSizeGuide,
  onOpenReviews,
  onOpenPolicy,
  onOpenAdmin,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="bg-[#FAF8F5] border-t border-stone-200/80 text-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Main Footer 3 Columns matching reference layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
          {/* Column 1: Contact Us */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-widest text-stone-950 text-xs">
              CONTACT US
            </h4>
            <div className="space-y-2 text-stone-600">
              <p className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 font-medium">Timings:</strong> 12PM - 9PM Monday - Saturday
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                <span>
                  <strong className="text-stone-900 font-medium">Email:</strong>{' '}
                  <a href="mailto:info.ahmads.pk@gmail.com" className="hover:underline text-stone-900 font-medium underline">
                    info.ahmads.pk@gmail.com
                  </a>
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                <span>
                  <strong className="text-stone-900 font-medium">Phone Number:</strong>{' '}
                  <a href="tel:+923326109729" className="hover:underline text-stone-900 font-medium underline">
                    +92 332-6109729
                  </a>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 font-medium">Address:</strong> LGF #103 Gulberg Lahore, Pakistan
                </span>
              </p>
            </div>
          </div>

          {/* Column 2: Policies */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-widest text-stone-950 text-xs">
              POLICIES
            </h4>
            <ul className="space-y-2 text-stone-600">
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-stone-950 transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('returns')}
                  className="hover:text-stone-950 transition-colors cursor-pointer"
                >
                  Return &amp; Exchange
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('delivery')}
                  className="hover:text-stone-950 transition-colors cursor-pointer"
                >
                  Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-stone-950 transition-colors cursor-pointer"
                >
                  FAQs &amp; Size Guide
                </button>
              </li>
              {onOpenAdmin && (
                <li>
                  <button
                    onClick={onOpenAdmin}
                    className="hover:text-stone-950 text-stone-600 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🛡️</span>
                    <span>Admin &amp; Staff Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Sign Up and Save */}
          <div className="space-y-3">
            <h4 className="font-semibold uppercase tracking-widest text-stone-950 text-xs">
              SIGN UP AND SAVE
            </h4>
            <p className="text-stone-600 leading-relaxed">
              Be the first to know about our biggest and best sales. We&apos;ll never send more than one email a month.
            </p>

            <form onSubmit={handleSubscribe} className="pt-1">
              <div className="flex border-b border-stone-800 pb-1.5 items-center">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full text-xs bg-transparent focus:outline-none placeholder-stone-400 text-stone-900"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="p-1 text-stone-900 hover:text-stone-600 cursor-pointer"
                >
                  {subscribed ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  )}
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-700 mt-1">Thank you for subscribing!</p>
              )}
            </form>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM CENTERED COPYRIGHT, PAYMENT ICONS & MANAGED BY SECTION (EXACT REFERENCE MATCH) */}
        <div className="mt-14 pt-8 border-t border-stone-200/60 flex flex-col items-center justify-center text-center space-y-3.5">
          {/* Centered Payment Badges: AMEX, Mastercard, VISA */}
          <div className="flex items-center justify-center gap-2">
            {/* 1. American Express (AMEX) Badge */}
            <div
              className="h-6 w-9 bg-[#006FCF] rounded-xs flex items-center justify-center shadow-2xs overflow-hidden"
              title="American Express"
            >
              <span className="text-[8px] font-black text-white tracking-tighter uppercase font-sans leading-none">
                AMEX
              </span>
            </div>

            {/* 2. MasterCard Badge */}
            <div
              className="h-6 w-9 bg-[#222222] rounded-xs flex items-center justify-center shadow-2xs overflow-hidden"
              title="Mastercard"
            >
              <div className="flex items-center -space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] inline-block opacity-90" />
                <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] inline-block opacity-90" />
              </div>
            </div>

            {/* 3. VISA Badge */}
            <div
              className="h-6 w-9 bg-[#1A1F71] rounded-xs flex items-center justify-center shadow-2xs overflow-hidden"
              title="Visa"
            >
              <span className="text-[9px] font-black text-white tracking-wider italic font-sans">
                VISA
              </span>
            </div>
          </div>

          {/* Copyright line */}
          <p className="text-[11px] text-stone-600 font-medium">
            © 2026 AHMAD&apos;S - House of Fashion
          </p>

          {/* Developed and Managed by: */}
          <div className="flex flex-col items-center justify-center space-y-1 text-[11px] text-stone-900 font-bold">
            <span className="tracking-tight">Developed and Managed by:</span>
            
            {/* ECOMATIVES Agency Logo */}
            <div className="flex flex-col items-center justify-center pt-0.5 group">
              <svg className="h-6 w-auto text-[#00A884]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Stylized geometric E agency mark */}
                <path d="M20 4L8 16H24L20 20H8L20 32L32 20H16L20 16H32L20 4Z" fill="#00A884" />
              </svg>
              <span className="text-[8px] font-black tracking-widest text-[#00A884] uppercase font-sans mt-0.5">
                ECOMATIVES
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
