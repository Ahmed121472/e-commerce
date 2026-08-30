import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import {
  X,
  PackageCheck,
  Sparkles,
  TrendingUp,
  DollarSign,
  Truck,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Filter,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SellerOrderHUD: React.FC = () => {
  const {
    isSellerOrderHUDOpen,
    setIsSellerOrderHUDOpen,
    orders,
    fulfillDropshipOrder,
    updateOrderTracking,
    pendingOrdersCount,
    totalSellerProfit,
    totalRevenue,
    openEmailModal
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);

  // Manual tracking update input
  const [manualTracking, setManualTracking] = useState('');
  const [manualCarrier, setManualCarrier] = useState('USPS Priority Air');

  if (!isSellerOrderHUDOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const handleUpdateTracking = (orderId: string) => {
    if (!manualTracking.trim()) return;
    updateOrderTracking(orderId, manualTracking.trim(), manualCarrier, 'shipped');
    setManualTracking('');
  };

  return (
    <AnimatePresence>
      <div id="seller-order-hud-overlay" className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-[#0c0f17] border-l border-amber-500/30 shadow-2xl flex flex-col h-full z-50 text-slate-100"
        >
          {/* Top Bar */}
          <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <PackageCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  In-Situ Seller Order & Fulfillment Hub
                </h3>
                <p className="text-[11px] text-slate-400">Zero separate admin panel • Manage live store dispatches</p>
              </div>
            </div>

            <button
              id="close-seller-hud-btn"
              onClick={() => setIsSellerOrderHUDOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Revenue</span>
              <strong className="text-base font-display font-extrabold text-white mt-0.5 block">
                ${totalRevenue.toFixed(2)}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Net Profit Earned</span>
              <strong className="text-base font-display font-extrabold text-emerald-400 mt-0.5 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                ${totalSellerProfit.toFixed(2)}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Pending Fulfillment</span>
              <strong className="text-base font-display font-extrabold text-amber-400 mt-0.5 block">
                {pendingOrdersCount} orders
              </strong>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {['all', 'pending', 'processing', 'shipped'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                    filterStatus === st
                      ? 'bg-amber-500 text-black'
                      : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {filteredOrders.length} orders
            </span>
          </div>

          {/* Orders List & Selected Detail */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No orders matching filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const hasDropshipItems = order.items.some((i) => i.isDropshipped);

                return (
                  <div
                    key={order.id}
                    className={`p-4 rounded-2xl border transition-all text-xs space-y-3 ${
                      order.status === 'pending'
                        ? 'bg-[#141a29] border-amber-500/40 shadow-lg shadow-black/40'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-amber-400">
                            #{order.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'shipped'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : order.status === 'processing'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium mt-0.5">
                          {order.customerName} • <span className="text-slate-400">{order.customerEmail}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-display font-extrabold text-sm text-white block">
                          ${order.total.toFixed(2)}
                        </span>
                        <span className="text-emerald-400 font-bold text-[11px]">
                          +${(order.totalProfit || 0).toFixed(2)} profit
                        </span>
                      </div>
                    </div>

                    {/* Purchased Items List */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <img src={item.productImage} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded object-cover bg-slate-900" />
                            <div>
                              <p className="font-semibold text-slate-200 line-clamp-1">{item.productTitle}</p>
                              {item.isDropshipped && (
                                <span className="text-[10px] text-amber-400 font-mono">
                                  Dropship SKU: {item.supplierSku || 'DIRECT-EXP'}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-slate-300 font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address snippet */}
                    <p className="text-[11px] text-slate-400">
                      Destination: {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </p>

                    {/* Action Hub per Order */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                      {order.trackingNumber ? (
                        <div className="text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Tracking: {order.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Unfulfilled</span>
                      )}

                      <div className="flex items-center gap-2">
                        {order.customerEmail && (
                          <button
                            id={`email-order-btn-${order.id}`}
                            onClick={() => openEmailModal(order.id, order.customerEmail)}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                            title="Send email receipt or tracking notification"
                          >
                            <Mail className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Email Client</span>
                          </button>
                        )}

                        {hasDropshipItems && !order.dropshipDispatched && (
                          <button
                            id={`dispatch-dropship-btn-${order.id}`}
                            onClick={() => fulfillDropshipOrder(order.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:brightness-110 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            1-Click Dispatch to Supplier
                          </button>
                        )}

                        {order.status !== 'shipped' && (
                          <button
                            onClick={() => {
                              const tr = prompt('Enter Carrier Tracking Number:', 'USPS' + Math.floor(1000000 + Math.random() * 9000000));
                              if (tr) {
                                updateOrderTracking(order.id, tr, 'USPS Express Direct', 'shipped');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                          >
                            Mark Shipped
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
