import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShippingAddress, Order } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Truck,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    cart,
    cartSubtotal,
    createOrder,
    setActiveLookupOrderId,
    setIsOrderTrackingModalOpen,
    userProfile,
    signInWithGooglePopup
  } = useStore();

  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Address form
  const [address, setAddress] = useState<ShippingAddress>(() => ({
    fullName: userProfile?.displayName || 'Jane Customer',
    email: userProfile?.email || 'customer@gmail.com',
    phone: userProfile?.phone || '+1 (555) 349-8821',
    street: userProfile?.savedAddress?.street || '450 Innovation Parkway, Suite 12B',
    city: userProfile?.savedAddress?.city || 'San Francisco',
    state: userProfile?.savedAddress?.state || 'CA',
    zip: userProfile?.savedAddress?.zip || '94105',
    country: userProfile?.savedAddress?.country || 'United States'
  }));

  // Keep address updated if user signs in
  React.useEffect(() => {
    if (userProfile) {
      setAddress((prev) => ({
        ...prev,
        fullName: userProfile.displayName || prev.fullName,
        email: userProfile.email || prev.email,
        phone: userProfile.phone || prev.phone,
        street: userProfile.savedAddress?.street || prev.street,
        city: userProfile.savedAddress?.city || prev.city,
        state: userProfile.savedAddress?.state || prev.state,
        zip: userProfile.savedAddress?.zip || prev.zip,
        country: userProfile.savedAddress?.country || prev.country
      }));
    }
  }, [userProfile]);

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('884');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutModalOpen) return null;

  const shippingFee = cartSubtotal > 150 ? 0 : 9.99;
  const tax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const total = Math.max(0, Math.round((cartSubtotal + shippingFee + tax) * 100) / 100);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.email || !address.street || !address.city) {
      alert('Please fill out all required shipping fields.');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const methodName =
        paymentMethod === 'apple_pay'
          ? 'Apple Pay / One-Touch'
          : paymentMethod === 'cod'
          ? 'Cash on Delivery (COD)'
          : 'Credit Card (Visa •••• 4242)';

      const order = createOrder(address, methodName, 0);
      setCreatedOrder(order);
      setStep('success');

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div id="checkout-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl rounded-3xl bg-[#0f1420] border border-slate-800 shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-bold text-base text-white">
                {step === 'success' ? 'Order Confirmed!' : 'Secure Express Checkout'}
              </h3>
            </div>
            <button
              id="close-checkout-modal-btn"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          {step !== 'success' && (
            <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step === 'shipping' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-black'}`}>
                  1
                </span>
                <span className={step === 'shipping' ? 'text-white font-bold' : 'text-slate-400'}>Shipping Address</span>
              </div>
              <div className="w-8 h-px bg-slate-800" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step === 'payment' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                  2
                </span>
                <span className={step === 'payment' ? 'text-white font-bold' : 'text-slate-500'}>Payment & Review</span>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto text-xs">
            {step === 'shipping' && (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Authentic Google Sign-in Banner for Guests */}
                {!userProfile && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#EA4335"
                            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Have a Google Account?</p>
                        <p className="text-[11px] text-slate-400">Sign in with Gmail for 1-click address autofill & instant invoice delivery.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => signInWithGooglePopup()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shrink-0 shadow-sm"
                    >
                      Sign In with Google
                    </button>
                  </div>
                )}

                <h4 className="text-sm font-bold text-white mb-2">1. Contact & Delivery Info</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Full Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Email Address (for receipt & tracking) *</label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">State / Prov</label>
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:brightness-110 flex items-center gap-2"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {step === 'payment' && (
              <div className="space-y-5">
                <h4 className="text-sm font-bold text-white mb-2">2. Payment Method</h4>

                {/* Methods Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-bold">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Apple / G-Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-bold">COD Option</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">CVC Code</label>
                        <input
                          type="password"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Itemized Order Review */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>Shipping To:</span>
                    <span className="text-white font-bold">{address.fullName}, {address.city}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>Items Count:</span>
                    <span className="text-white">{cart.length} distinct item(s)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
                    <span>Total Amount Charged:</span>
                    <span className="text-amber-400 font-display text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-slate-400 hover:text-white font-semibold"
                  >
                    Back to Address
                  </button>

                  <button
                    id="place-final-order-btn"
                    disabled={isProcessing}
                    onClick={handlePlaceOrder}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Authorize & Place Order (${total.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && createdOrder && (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                    Payment Successful
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-white mt-1">
                    Thank You for Your Order!
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Confirmation receipt and delivery tracking dispatched to <strong className="text-slate-200">{createdOrder.customerEmail}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Order Reference:</span>
                    <span className="font-mono text-sm font-extrabold text-amber-400">#{createdOrder.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Estimated Delivery:</span>
                    <span className="text-slate-200 font-medium">5-8 Business Days (Air Express)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Paid With:</span>
                    <span className="text-slate-200">{createdOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-white pt-1">
                    <span>Total Paid:</span>
                    <span className="text-amber-400 font-display">${createdOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    id="track-order-success-cta"
                    onClick={() => {
                      setActiveLookupOrderId(createdOrder.id);
                      setIsCheckoutModalOpen(false);
                      setIsOrderTrackingModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    Track Order Live Status
                  </button>

                  <button
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:brightness-110"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
