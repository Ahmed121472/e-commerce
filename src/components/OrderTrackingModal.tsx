import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Search,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OrderTrackingModal: React.FC = () => {
  const {
    isOrderTrackingModalOpen,
    setIsOrderTrackingModalOpen,
    orders,
    activeLookupOrderId,
    setActiveLookupOrderId,
    openEmailModal
  } = useStore();

  const [inputOrderId, setInputOrderId] = useState(activeLookupOrderId || '');
  const [searchedOrder, setSearchedOrder] = useState(() => {
    if (activeLookupOrderId) {
      return orders.find((o) => o.id.toLowerCase() === activeLookupOrderId.toLowerCase()) || null;
    }
    return orders[0] || null;
  });

  if (!isOrderTrackingModalOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) => o.id.toLowerCase() === inputOrderId.trim().toLowerCase()
    );
    setSearchedOrder(found || null);
  };

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = searchedOrder ? getStepProgress(searchedOrder.status) : 1;

  return (
    <AnimatePresence>
      <div id="order-tracking-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
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
              <Truck className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-base text-white">Live Customer Order Tracking</h3>
            </div>
            <button
              onClick={() => {
                setIsOrderTrackingModalOpen(false);
                setActiveLookupOrderId(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g. ORD-9842)..."
                  value={inputOrderId}
                  onChange={(e) => setInputOrderId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold"
              >
                Track
              </button>
            </form>

            {searchedOrder ? (
              <div className="space-y-6">
                {/* Order Meta Bar */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Tracking Order</span>
                    <h4 className="font-display font-extrabold text-lg text-amber-400 font-mono">
                      #{searchedOrder.id}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] inline-block ${
                      searchedOrder.status === 'delivered'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : searchedOrder.status === 'shipped'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {searchedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Steps */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {/* Step 1 */}
                    <div className="text-center space-y-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        currentStep >= 1 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white block">Confirmed</span>
                      <span className="text-[10px] text-slate-500 block">Payment Verified</span>
                    </div>

                    {/* Step 2 */}
                    <div className="text-center space-y-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        currentStep >= 2 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white block">Processing</span>
                      <span className="text-[10px] text-slate-500 block">Supplier Packing</span>
                    </div>

                    {/* Step 3 */}
                    <div className="text-center space-y-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        currentStep >= 3 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white block">In Transit</span>
                      <span className="text-[10px] text-slate-500 block">Air Express</span>
                    </div>

                    {/* Step 4 */}
                    <div className="text-center space-y-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        currentStep >= 4 ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white block">Delivered</span>
                      <span className="text-[10px] text-slate-500 block">To Doorstep</span>
                    </div>
                  </div>
                </div>

                {/* Carrier & Tracking Number Box */}
                {searchedOrder.trackingNumber && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Carrier / Dispatch Line</span>
                      <strong className="text-cyan-300 font-bold">{searchedOrder.carrier || 'Global Express Direct'}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Tracking Code</span>
                      <span className="font-mono text-white font-bold">{searchedOrder.trackingNumber}</span>
                    </div>
                  </div>
                )}

                {/* Ordered Items */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h5 className="font-bold text-white">Itemized Package Contents</h5>
                  <div className="space-y-2">
                    {searchedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                        <div className="flex items-center gap-2">
                          <img src={item.productImage} alt="" referrerPolicy="no-referrer" className="w-9 h-9 rounded-lg object-cover bg-slate-950" />
                          <div>
                            <p className="font-bold text-slate-200 line-clamp-1">{item.productTitle}</p>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity} {item.variantName ? `• ${item.variantName}` : ''}</p>
                          </div>
                        </div>
                        <span className="font-bold text-white">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>Order Total:</span>
                    <span className="text-amber-400 font-display">${searchedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Email Notification Trigger */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Need a Copy in Your Inbox?</div>
                    <div className="text-[11px] text-slate-400">
                      Send formatted invoice and courier tracking link to Gmail, Hotmail, or Outlook.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      openEmailModal(searchedOrder.id, searchedOrder.customerEmail || searchedOrder.shippingAddress?.email);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Me Receipt</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No order found matching ID "{inputOrderId}". Check your order confirmation email.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
