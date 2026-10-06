import React, { useState } from 'react';
import { X, CheckCircle, Truck, CreditCard, Banknote, Smartphone, ShieldCheck, Printer, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Currency, CheckoutForm } from '../types';
import { formatPrice } from '../data/currencies';
import { supabase } from '../lib/supabase';
import { submitOrderToSupabase } from '../lib/storeService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  orderNotes?: string;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  orderNotes = '',
  onClearCart,
}) => {
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: 'Lahore',
    postalCode: '54000',
    country: 'Pakistan',
    paymentMethod: 'cod',
    orderNotes,
  });

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotalPKR = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const discountAmountPKR = (subtotalPKR * discountPercent) / 100;
  const shippingAmountPKR = subtotalPKR >= 15000 ? 0 : 500;
  const finalTotalPKR = Math.max(0, subtotalPKR - discountAmountPKR + shippingAmountPKR);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'AHMAD10' || promoCode.trim().toUpperCase() === 'WELCOME10') {
      setDiscountPercent(10);
      setPromoMessage('Promo code applied: 10% luxury discount!');
    } else if (promoCode.trim().toUpperCase() === 'COUTURE15') {
      setDiscountPercent(15);
      setPromoMessage('VIP Promo code applied: 15% discount!');
    } else {
      setPromoMessage('Invalid coupon code. Try AHMAD10');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.phone || !formData.address) {
      alert('Please complete all required customer details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: authData } = await supabase.auth.getUser();

      const paymentMethodMap: Record<string, 'Cash on Delivery' | 'Card' | 'Bank Transfer'> = {
        cod: 'Cash on Delivery',
        card: 'Card',
        bank_transfer: 'Bank Transfer',
        easypaisa_jazzcash: 'Bank Transfer',
      };

      const result = await submitOrderToSupabase({
        userId: authData?.user?.id || null,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: formData.phone.trim(),
        shippingAddress: {
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        subtotal: subtotalPKR,
        stitchingTotal: items.reduce((sum, it) => sum + (it.selectedType === 'stitched' ? 4500 * it.quantity : 0), 0),
        addOnsTotal: items.reduce((sum, it) => sum + (it.addOns.boxPackaging ? 500 : 0) + (it.addOns.lining ? 2000 : 0), 0),
        shippingFee: shippingAmountPKR,
        discountAmount: discountAmountPKR,
        totalAmount: finalTotalPKR,
        currencyCode: currency.code,
        currencyRate: currency.rate,
        paymentMethod: paymentMethodMap[formData.paymentMethod] || 'Cash on Delivery',
        couponCode: promoCode || null,
        specialInstructions: formData.orderNotes || null,
        items,
      });

      setConfirmedOrderId(result.orderNumber);
      onClearCart();

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err) {
      console.error('Order submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] shadow-2xl overflow-hidden my-6 border border-stone-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="font-serif-luxury text-xl sm:text-2xl text-stone-950 uppercase tracking-[0.2em] font-normal">
              AHMAD&apos;S CHECKOUT
            </h2>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest mt-0.5">
              Secure Encrypted Payment &amp; Express Dispatch
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1.5 text-stone-500 hover:text-stone-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order Confirmed */}
        {confirmedOrderId ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">
                Order Received Successfully
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-stone-950 uppercase mt-1">
                Thank You, {formData.firstName}!
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
                Your order <span className="font-bold text-stone-900">#{confirmedOrderId}</span> has been placed. A confirmation email and WhatsApp dispatch update will be sent to <span className="font-semibold text-stone-900">{formData.phone}</span>.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="max-w-md mx-auto p-5 bg-white border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-stone-100 font-semibold text-stone-900">
                <span>Order Reference:</span>
                <span>#{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Recipient:</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Address:</span>
                <span className="text-right max-w-[200px] truncate">{formData.address}, {formData.city}, {formData.country}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment Method:</span>
                <span className="uppercase font-medium text-stone-900">{formData.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-100 text-sm font-semibold text-stone-950">
                <span>Amount Payable:</span>
                <span>{formatPrice(finalTotalPKR, currency)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 border border-stone-300 text-stone-800 text-xs uppercase tracking-wider font-medium hover:bg-stone-100 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-950 text-white text-xs uppercase tracking-widest font-semibold hover:bg-stone-800 cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form & Order Summary */
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
            {/* Left: Customer Info & Payment */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              {/* Customer Contact */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-stone-950 mb-3">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Fatima"
                      className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Malik"
                      className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="fatima@example.com"
                      className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-stone-950 mb-3">
                  2. Shipping Destination
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1">Country / Region</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full p-2.5 border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
                    >
                      <option value="Pakistan">Pakistan</option>
                      <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="United States">United States (USA)</option>
                      <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                      <option value="Canada">Canada</option>
                      <option value="Other">Other Worldwide</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House / Plot #, Street, Block, Phase"
                      className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-600 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Lahore / Karachi / Islamabad"
                        className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-600 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="54000"
                        className="w-full p-2.5 border border-stone-300 focus:outline-none focus:border-stone-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-stone-950 mb-3">
                  3. Payment Method
                </h3>
                <div className="space-y-2 text-xs">
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cod' ? 'border-stone-950 bg-white font-medium' : 'border-stone-200 bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className="accent-stone-900"
                    />
                    <Banknote className="w-4 h-4 text-stone-700" />
                    <div className="flex-1">
                      <p className="text-stone-900 font-semibold">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-stone-500">Pay cash upon delivery at your doorstep (Available across Pakistan).</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    formData.paymentMethod === 'card' ? 'border-stone-950 bg-white font-medium' : 'border-stone-200 bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                      className="accent-stone-900"
                    />
                    <CreditCard className="w-4 h-4 text-stone-700" />
                    <div className="flex-1">
                      <p className="text-stone-900 font-semibold">Credit / Debit Card</p>
                      <p className="text-[11px] text-stone-500">Visa, MasterCard, PayPak, UnionPay accepted worldwide.</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                    formData.paymentMethod === 'easypaisa_jazzcash' ? 'border-stone-950 bg-white font-medium' : 'border-stone-200 bg-[#FAF8F5]'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="easypaisa_jazzcash"
                      checked={formData.paymentMethod === 'easypaisa_jazzcash'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'easypaisa_jazzcash' })}
                      className="accent-stone-900"
                    />
                    <Smartphone className="w-4 h-4 text-stone-700" />
                    <div className="flex-1">
                      <p className="text-stone-900 font-semibold">EasyPaisa / JazzCash</p>
                      <p className="text-[11px] text-stone-500">Instant mobile wallet checkout confirmation.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Items & Subtotal */}
            <div className="lg:col-span-5 p-6 sm:p-8 bg-white flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-stone-950">
                  Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h3>

                {/* Items preview */}
                <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-14 object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-stone-900 truncate">{item.product.name}</p>
                          <p className="text-[11px] text-stone-500">
                            Qty: {item.quantity} · {item.selectedType}
                            {item.selectedType === 'stitched' && ` (${item.selectedSize})`}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-stone-950 shrink-0">
                        {formatPrice(item.unitPrice * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Discount code (try AHMAD10)"
                      className="flex-1 p-2 text-xs border border-stone-300 uppercase tracking-wider focus:outline-none focus:border-stone-900"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-stone-200 text-stone-900 text-xs font-semibold uppercase hover:bg-stone-300"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`text-[11px] mt-1 ${discountPercent > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-1.5 pt-3 border-t border-stone-200 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotalPKR, currency)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-{formatPrice(discountAmountPKR, currency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600">
                    <span>Shipping:</span>
                    <span>{shippingAmountPKR === 0 ? 'FREE Express' : formatPrice(shippingAmountPKR, currency)}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-950">
                    <span>Total Amount:</span>
                    <span>{formatPrice(finalTotalPKR, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="space-y-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#121110] hover:bg-stone-800 disabled:opacity-50 text-white text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>COMPLETE ORDER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-stone-700" />
                  <span>Guaranteed authentic · Hassle-free 7-day exchange</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
