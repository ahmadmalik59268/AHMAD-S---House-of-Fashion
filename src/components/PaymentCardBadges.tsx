import React from 'react';

export const PaymentCardBadges: React.FC = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center md:justify-start">
      {/* 1. VISA Card */}
      <div
        className="h-7 px-2.5 py-1 bg-white border border-stone-200/90 rounded-md shadow-2xs flex items-center justify-center transition-transform hover:scale-105"
        title="Visa Verified Payment"
      >
        <svg className="h-3.5 w-auto" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19.34 0.5L12.67 15.5H8.35L5.09 3.5C4.9 2.76 4.72 2.49 4.14 2.16C3.19 1.65 1.59 1.18 0.17 0.88L0.26 0.5H6.96C7.84 0.5 8.62 1.09 8.81 2.06L10.5 11.09L14.7 0.5H19.34ZM36.31 10.74C36.33 6.64 30.65 6.41 30.69 4.58C30.7 4.02 31.24 3.42 32.4 3.27C32.97 3.2 34.56 3.14 36.36 3.97L37.07 0.69C36.1 0.33 34.85 0 33.27 0C29.21 0 26.35 2.15 26.33 5.23C26.3 7.51 28.34 8.78 29.9 9.54C31.5 10.32 32.04 10.82 32.03 11.53C32.02 12.62 30.72 13.1 29.51 13.12C27.46 13.15 26.27 12.56 25.32 12.12L24.58 15.58C25.53 16.02 27.29 16.39 29.1 16.42C33.39 16.42 36.3 14.3 36.31 10.74ZM47.08 15.5H50.89L47.58 0.5H44.05C43.24 0.5 42.57 0.97 42.27 1.69L36.11 15.5H40.54L41.42 13.06H46.84L47.08 15.5ZM42.63 9.77L44.84 3.69L46.12 9.77H42.63ZM25.5 0.5L22.08 15.5H17.89L21.31 0.5H25.5Z"
            fill="#1A1F71"
          />
        </svg>
      </div>

      {/* 2. MasterCard */}
      <div
        className="h-7 px-2.5 py-1 bg-white border border-stone-200/90 rounded-md shadow-2xs flex items-center justify-center transition-transform hover:scale-105"
        title="Mastercard SecureCode"
      >
        <svg className="h-4.5 w-auto" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="24" rx="2" fill="white" />
          <circle cx="13" cy="12" r="7.5" fill="#EB001B" />
          <circle cx="23" cy="12" r="7.5" fill="#F79E1B" />
          <path
            d="M18 6.75C19.5 8.15 20.45 10 20.45 12C20.45 14 19.5 15.85 18 17.25C16.5 15.85 15.55 14 15.55 12C15.55 10 16.5 8.15 18 6.75Z"
            fill="#FF5F00"
          />
        </svg>
      </div>

      {/* 3. EasyPaisa Badge */}
      <div
        className="h-7 px-2.5 py-1 bg-[#00A859] border border-[#00914c] rounded-md shadow-2xs flex items-center gap-1.5 transition-transform hover:scale-105 text-white"
        title="Easypaisa Mobile Account & QR"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-[10px] font-bold tracking-tight uppercase font-sans">easypaisa</span>
      </div>

      {/* 4. JazzCash Badge */}
      <div
        className="h-7 px-2.5 py-1 bg-[#231F20] border border-stone-800 rounded-md shadow-2xs flex items-center gap-1 transition-transform hover:scale-105"
        title="JazzCash Mobile Account & Debit Card"
      >
        <span className="text-[#FFCC00] font-black text-[11px] italic tracking-tighter">Jazz</span>
        <span className="text-white font-bold text-[10px] uppercase tracking-tight">Cash</span>
      </div>

      {/* 5. Cash on Delivery (COD) Luxury Badge */}
      <div
        className="h-7 px-2.5 py-1 bg-stone-900 border border-stone-950 rounded-md shadow-2xs flex items-center gap-1.5 transition-transform hover:scale-105 text-stone-100"
        title="Cash on Delivery Across Pakistan"
      >
        <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="12" x="2" y="6" rx="2"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M6 12h.01M18 12h.01"/>
        </svg>
        <span className="text-[10px] font-bold tracking-wider uppercase font-serif-luxury text-amber-200">
          COD Pakistan
        </span>
      </div>

      {/* 6. UnionPay / 1Link */}
      <div
        className="h-7 px-2.5 py-1 bg-white border border-stone-200/90 rounded-md shadow-2xs flex items-center justify-center transition-transform hover:scale-105"
        title="UnionPay & 1Link Interbank Transfer"
      >
        <div className="flex items-center">
          <span className="h-3.5 w-2 bg-[#E21E26] rounded-l-xs inline-block" />
          <span className="h-3.5 w-2 bg-[#00479D] inline-block" />
          <span className="h-3.5 w-2 bg-[#008169] rounded-r-xs inline-block" />
          <span className="ml-1 text-[9px] font-bold text-stone-800 tracking-tighter">UnionPay</span>
        </div>
      </div>

      {/* 7. 256-Bit SSL Encryption Badge */}
      <div
        className="h-7 px-2 py-1 bg-stone-100 border border-stone-200 rounded-md shadow-2xs flex items-center gap-1 text-stone-600 transition-transform hover:scale-105"
        title="256-Bit Bank-Grade SSL Secure Checkout"
      >
        <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span className="text-[9px] font-semibold text-stone-700 tracking-tight">100% Secure</span>
      </div>
    </div>
  );
};
