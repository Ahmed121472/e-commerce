import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Package,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  LogOut,
  ShoppingBag,
  Store
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

export const CustomerAccountModal: React.FC = () => {
  const {
    isCustomerPortalOpen,
    setIsCustomerPortalOpen,
    userProfile,
    isStoreOwner,
    orders,
    logout,
    switchRole,
    addToCart,
    setActiveLookupOrderId,
    setIsOrderTrackingModalOpen,
    openEmailModal,
    addToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  if (!isCustomerPortalOpen) return null;

  // Filter orders matching the logged in customer
  const customerEmail = userProfile?.email?.toLowerCase() || '';
  const customerOrders = orders.filter(
    (o) => o.customerEmail?.toLowerCase() === customerEmail || customerEmail.includes('customer') || customerEmail.includes('shopper')
  );

  const handleTrackOrder = (orderId: string) => {
    setIsCustomerPortalOpen(false);
    setActiveLookupOrderId(orderId);
    setIsOrderTrackingModalOpen(true);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      // Re-add to bag
      addToCart({
        id: item.productId,
        title: item.productTitle,
        description: 'Customer re-order from history',
        category: 'Accessories',
        tags: [],
        images: [item.productImage],
        price: item.unitPrice,
        isDropshipped: item.isDropshipped,
        inventory: 99,
        status: 'published',
        rating: 5,
        reviewCount: 1,
        variants: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, undefined, item.quantity);
    });
    setIsCustomerPortalOpen(false);
    addToast('Re-Ordered!', `Added items from ${order.id} back to your shopping bag.`, 'success');
  };

  return (
    <div
      id="customer-account-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsCustomerPortalOpen(false)}
    >
      <div
        id="customer-account-modal"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.displayName || 'Google Profile'}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-2xl border border-slate-700 object-cover shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {userProfile?.displayName || 'Customer Account'}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {userProfile?.email?.endsWith('@gmail.com') ? 'Google Account' : 'Verified Shopper'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{userProfile?.email || 'shopper@gmail.com'}</p>
            </div>
          </div>

          <button
            id="close-customer-account-button"
            onClick={() => setIsCustomerPortalOpen(false)}
            className="p-2 text-slate-400 transition-colors rounded-xl hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 shrink-0">
          <button
            id="customer-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({customerOrders.length})</span>
          </button>
          <button
            id="customer-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Customer Profile</span>
          </button>
          <button
            id="customer-tab-addresses"
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'addresses'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Address</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">No Orders Yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    You haven't placed any orders yet. Browse our direct catalog to find high-grade electronics and accessories.
                  </p>
                  <button
                    onClick={() => setIsCustomerPortalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Start Shopping Now
                  </button>
                </div>
              ) : (
                customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-300">{order.id}</span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                              order.status === 'delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : order.status === 'shipped' || order.status === 'processing'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-white">${order.total.toFixed(2)}</span>
                        <div className="text-[10px] text-slate-400">{order.items.length} item(s)</div>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-800 border border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="font-medium text-slate-200 line-clamp-1">{item.productTitle}</p>
                              <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          <span className="font-medium text-slate-300">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracking details if available */}
                    {order.trackingNumber && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 text-cyan-300">
                          <Truck className="w-4 h-4 text-cyan-400" />
                          <span>
                            {order.carrier || 'USPS Express'}: <strong className="font-mono">{order.trackingNumber}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Live Dispatch
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleTrackOrder(order.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>View Live Tracking</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsCustomerPortalOpen(false);
                            openEmailModal(order.id, order.customerEmail || userProfile?.email);
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Receipt</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Reorder Items</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Overview</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-white">{userProfile?.displayName || 'Jane Shopper'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Email Address</span>
                    <span className="font-semibold text-white">{userProfile?.email}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Member Tier</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {userProfile?.memberTier || 'Direct Member'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">Account Type</span>
                    <span className="font-semibold text-slate-200">Direct Customer</span>
                  </div>
                </div>
              </div>

              {/* Store Owner Access / Notice */}
              {isStoreOwner ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-amber-300">Store Owner Controls</h5>
                    <p className="text-[11px] text-amber-200/80">You are verified as the exclusive seller ({userProfile?.email}). Switch to seller mode to manage products & orders.</p>
                  </div>
                  <button
                    onClick={() => {
                      switchRole('seller');
                      setIsCustomerPortalOpen(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Switch to Seller</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Exclusive Single-Seller Protection</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This platform is strictly operated by a single authorized merchant (sarn2008ahmed@gmail.com). Customer accounts enjoy guaranteed direct sourcing, buyer protection, and tracking.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED ADDRESS */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Shipping Address</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Default
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <p className="font-bold text-white">{userProfile?.displayName || 'Jane Shopper'}</p>
                  <p className="text-slate-300">
                    {userProfile?.savedAddress?.street || '450 Innovation Parkway, Suite 12B'}
                  </p>
                  <p className="text-slate-300">
                    {userProfile?.savedAddress?.city || 'San Francisco'}, {userProfile?.savedAddress?.state || 'CA'} {userProfile?.savedAddress?.zip || '94105'}
                  </p>
                  <p className="text-slate-400">{userProfile?.savedAddress?.country || 'United States'}</p>
                  <p className="text-slate-500 text-[11px] pt-1">
                    Phone: {userProfile?.phone || '+1 (555) 349-8821'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              logout();
              setIsCustomerPortalOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={() => setIsCustomerPortalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
