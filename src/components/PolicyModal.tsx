import React from 'react';
import { X, ShieldCheck, Truck, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

export type PolicyType = 'terms' | 'returns' | 'delivery' | 'privacy';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: PolicyType;
  onOpenType: (type: PolicyType) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policyType,
  onOpenType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {policyType === 'delivery' && <Truck className="w-5 h-5 text-stone-900" />}
            {policyType === 'returns' && <RotateCcw className="w-5 h-5 text-stone-900" />}
            {policyType === 'terms' && <FileText className="w-5 h-5 text-stone-900" />}
            {policyType === 'privacy' && <ShieldCheck className="w-5 h-5 text-stone-900" />}
            <h2 className="font-serif-luxury text-xl text-stone-950 uppercase tracking-wider font-normal">
              {policyType === 'delivery' && 'Worldwide Delivery & Shipping Policy'}
              {policyType === 'returns' && '7-Day Return & Exchange Policy'}
              {policyType === 'terms' && 'Terms of Service & Originality Guarantee'}
              {policyType === 'privacy' && 'Privacy & Secure Data Policy'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-stone-400 hover:text-stone-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 text-xs overflow-x-auto">
          <button
            onClick={() => onOpenType('delivery')}
            className={`px-4 py-2.5 uppercase font-medium tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
              policyType === 'delivery'
                ? 'bg-[#FAF8F5] text-stone-950 border-b-2 border-stone-950 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Delivery &amp; Customs
          </button>
          <button
            onClick={() => onOpenType('returns')}
            className={`px-4 py-2.5 uppercase font-medium tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
              policyType === 'returns'
                ? 'bg-[#FAF8F5] text-stone-950 border-b-2 border-stone-950 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Return &amp; Exchange
          </button>
          <button
            onClick={() => onOpenType('terms')}
            className={`px-4 py-2.5 uppercase font-medium tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
              policyType === 'terms'
                ? 'bg-[#FAF8F5] text-stone-950 border-b-2 border-stone-950 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Terms &amp; Guarantee
          </button>
          <button
            onClick={() => onOpenType('privacy')}
            className={`px-4 py-2.5 uppercase font-medium tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
              policyType === 'privacy'
                ? 'bg-[#FAF8F5] text-stone-950 border-b-2 border-stone-950 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Privacy
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-stone-700 leading-relaxed">
          {policyType === 'delivery' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs">Prepaid Customs &amp; Taxes Worldwide</p>
                  <p className="text-[11px] text-emerald-800">
                    All international orders to the UK, USA, UAE, Saudi Arabia, and Canada have customs duties, import tariffs, and VAT 100% pre-covered by Ahmad&apos;s. No surprise fees upon delivery!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold uppercase tracking-wider text-stone-900">
                  1. Domestic Shipping (Pakistan)
                </h4>
                <p>
                  • Orders placed inside Pakistan (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and all other cities) are dispatched within 24 hours via TCS Express / Leopard Courier.
                </p>
                <p>
                  • <strong>Standard Transit Time:</strong> 2 to 3 working days.
                </p>
                <p>
                  • <strong>Cash on Delivery (COD):</strong> Gladly supported with zero extra handling fees.
                </p>
                <p>
                  • <strong>Free Shipping:</strong> Automatically applied to all orders above Rs. 15,000.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-200">
                <h4 className="font-semibold uppercase tracking-wider text-stone-900">
                  2. International Shipping (Worldwide)
                </h4>
                <p>
                  • Dispatched via DHL Express / FedEx Priority with real-time end-to-end tracking code sent to your WhatsApp and Email.
                </p>
                <p>
                  • <strong>Transit Time:</strong> 5 to 7 business days worldwide.
                </p>
              </div>
            </div>
          )}

          {policyType === 'returns' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-100 border-l-2 border-stone-900 text-stone-800">
                <p className="font-semibold text-xs">7-Day Unconditional Exchange Window</p>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  We stand 100% behind the purity and craftsmanship of every ensemble crafted at Ahmad&apos;s House of Fashion.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold uppercase tracking-wider text-stone-900">
                  Exchange Conditions
                </h4>
                <p>
                  1. <strong>Unstitched Suits:</strong> Eligible for exchange or store credit within 7 days of delivery in original packaging with tags intact.
                </p>
                <p>
                  2. <strong>Stitched &amp; Custom Orders:</strong> Bespoke stitched suits undergo 3-tier quality control by our lead master tailor. In the rare event of a size variation, our alterations team will adjust or replace your garment free of cost.
                </p>
                <p>
                  3. <strong>Defect or Transit Damage:</strong> Immediate replacement dispatched within 24 hours upon contacting our WhatsApp Concierge at 0332-6109729.
                </p>
              </div>
            </div>
          )}

          {policyType === 'terms' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold uppercase tracking-wider text-stone-900">
                  100% Original Designer Guarantee
                </h4>
                <p>
                  All products sold at <span className="font-semibold text-stone-900">ahmads.pk</span> are 100% authentic, hand-embellished master creations featuring premium raw silk, pure organza, chiffon, and hand-worked zardozi tilla.
                </p>
                <p>
                  Any color variation observed is solely due to studio lighting angles and screen gamut calibration. All dresses are inspected against our high-fashion quality standard before dispatch.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-200">
                <h4 className="font-semibold uppercase tracking-wider text-stone-900">
                  Pricing &amp; Payment Terms
                </h4>
                <p>
                  All displayed prices include mandatory luxury sales tax where applicable. Orders confirmed with Cash on Delivery (COD) will be verified via an automated WhatsApp message or phone call prior to final courier dispatch.
                </p>
              </div>
            </div>
          )}

          {policyType === 'privacy' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold uppercase tracking-wider text-stone-900">
                  Data Security &amp; Confidentiality
                </h4>
                <p>
                  Ahmad&apos;s House of Fashion respects your privacy. We never sell, share, or disclose your telephone number, delivery address, or email to third-party marketing firms.
                </p>
                <p>
                  Online card payments are processed via bank-grade 256-bit SSL tokenized gateways (Visa, MasterCard, PayPak). Your payment credentials never touch our web servers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-4 border-t border-stone-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-950 text-white uppercase tracking-widest text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
