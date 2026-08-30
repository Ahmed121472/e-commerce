import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Search,
  Sparkles,
  PackageCheck,
  Eye,
  Edit3,
  Globe,
  Trash2,
  Truck,
  Database,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Store,
  ShieldCheck,
  UserPlus,
  LogIn,
  Crown,
  KeyRound,
  Mail
} from 'lucide-react';
import { STORE_OWNER_EMAIL } from '../types';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    isCustomerPreview,
    setIsCustomerPreview,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    filters,
    setFilters,
    setIsDropshipImportModalOpen,
    setIsAddProductModalOpen,
    setIsOrderTrackingModalOpen,
    setIsSellerOrderHUDOpen,
    pendingOrdersCount,
    clearStoreData,
    isFirestoreConnected,
    firestoreSyncStatus,
    currentUser,
    userProfile,
    isStoreOwner,
    openAuthModal,
    openOwnerAuthModal,
    logout,
    switchRole,
    setIsCustomerPortalOpen,
    openAIAssistant,
    openEmailModal
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isSellerActive = role === 'seller' && isStoreOwner && !isCustomerPreview;

  return (
    <header id="storefront-header" className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0c0f17]/95 backdrop-blur-xl">
      {/* Top utility bar for exclusive store owner controls (Only when in Seller mode and not customer preview) */}
      {isSellerActive && (
        <div id="seller-status-bar" className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-semibold tracking-wide flex items-center gap-1.5 text-amber-300">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Store Owner Suite Active ({STORE_OWNER_EMAIL})
              </span>
              <span className="text-slate-400 hidden sm:inline">— Direct in-line edits and live dropship integration</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="header-toggle-customer-preview"
                onClick={() => setIsCustomerPreview(true)}
                className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:text-white font-medium transition-all flex items-center gap-1.5"
              >
                <Eye className="w-3 h-3" />
                Preview as Customer
              </button>

              <button
                id="header-source-dropship-btn"
                onClick={() => setIsDropshipImportModalOpen(true)}
                className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-medium transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Source Dropship Item
              </button>

              <button
                id="header-seller-hud-btn"
                onClick={() => setIsSellerOrderHUDOpen(true)}
                className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 hover:text-white font-medium transition-all flex items-center gap-1.5 relative"
              >
                <PackageCheck className="w-3 h-3 text-cyan-400" />
                Seller Order HUD
                {pendingOrdersCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                id="header-email-hub-btn"
                onClick={() => openEmailModal()}
                className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 font-medium transition-all flex items-center gap-1"
              >
                <Mail className="w-3 h-3 text-indigo-400" />
                Email & Alerts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating preview banner if owner is testing Customer Preview */}
      {isStoreOwner && role === 'seller' && isCustomerPreview && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-1.5 text-xs text-emerald-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Viewing as Customer — All owner controls & editing tools are hidden
            </span>
            <button
              onClick={() => setIsCustomerPreview(false)}
              className="px-2 py-0.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold border border-emerald-500/40 text-[11px]"
            >
              Return to Seller Suite
            </button>
          </div>
        </div>
      )}

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6 shrink-0">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0c0f17] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  NOVA
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 font-semibold">
                  {isStoreOwner && role === 'seller' ? (isCustomerPreview ? 'PREVIEW' : 'OWNER SELLER') : 'STORE'}
                </span>
                <span
                  id="firestore-cloud-status-badge"
                  title={isFirestoreConnected ? (firestoreSyncStatus === 'syncing' ? 'Firestore: Syncing...' : 'Firestore: Real-time Cloud Live') : 'Firestore: Local/Offline Mode'}
                  className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isFirestoreConnected
                      ? firestoreSyncStatus === 'syncing'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isFirestoreConnected
                      ? firestoreSyncStatus === 'syncing'
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400 animate-pulse'
                      : 'bg-slate-500'
                  }`} />
                  <Database className="w-2.5 h-2.5" />
                  <span>{isFirestoreConnected ? (firestoreSyncStatus === 'syncing' ? 'Syncing...' : 'Live Cloud') : 'Offline'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">Direct Sourcing & Storefront</p>
            </div>
          </a>
        </div>

        {/* Center: Search Engine */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search products, categories, SKU, or supplier..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {filters.searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: User Auth, Role Controls & Cart */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Customer Order Tracking Lookup */}
          <button
            id="track-order-header-btn"
            onClick={() => setIsOrderTrackingModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all"
          >
            <Truck className="w-4 h-4 text-slate-400" />
            <span>Track Order</span>
          </button>

          {/* Quick Customer Portal Button */}
          {userProfile && (
            <button
              id="customer-portal-header-btn"
              onClick={() => setIsCustomerPortalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Orders</span>
            </button>
          )}

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            {userProfile ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-xs text-slate-200"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isStoreOwner ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {isStoreOwner ? '👑' : (userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'C')}
                  </div>
                  <div className="text-left hidden xl:block max-w-[110px] truncate">
                    <div className="font-semibold text-slate-200 truncate">{userProfile.displayName || 'Account'}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-mono">
                      {isStoreOwner ? 'Store Owner' : 'Customer'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div
                      id="user-profile-dropdown"
                      className="absolute right-0 mt-2 w-64 z-50 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 space-y-1 text-xs"
                    >
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                        <p className="font-bold text-white truncate">{userProfile.displayName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{userProfile.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                          isStoreOwner ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isStoreOwner ? 'Verified Store Owner' : 'Customer Shopper'}
                        </span>
                      </div>

                      {/* Customer Orders Option */}
                      <button
                        id="dropdown-customer-orders-btn"
                        onClick={() => {
                          setIsCustomerPortalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-950/30 rounded-xl transition-all text-left"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-semibold">My Orders & Account</div>
                          <div className="text-[10px] text-slate-400">Order tracking & address</div>
                        </div>
                      </button>

                      {/* Universal Email & Notifications Hub */}
                      <button
                        id="dropdown-email-hub-btn"
                        onClick={() => {
                          openEmailModal();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/30 rounded-xl transition-all text-left"
                      >
                        <Mail className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="font-semibold">Email & Notifications Hub</div>
                          <div className="text-[10px] text-slate-400">Gmail, Hotmail, Outlook receipts</div>
                        </div>
                      </button>

                      {/* Store Owner Controls (Only for Verified Owner) */}
                      {isStoreOwner && (
                        <>
                          <button
                            id="dropdown-seller-hud-btn"
                            onClick={() => {
                              setIsSellerOrderHUDOpen(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 rounded-xl transition-all text-left"
                          >
                            <PackageCheck className="w-4 h-4 text-amber-400" />
                            <div>
                              <div className="font-semibold">Seller Order HUD</div>
                              <div className="text-[10px] text-slate-400">Fulfillment & supplier actions</div>
                            </div>
                          </button>

                          <button
                            id="dropdown-switch-role-btn"
                            onClick={() => {
                              const nextRole = role === 'seller' ? 'customer' : 'seller';
                              switchRole(nextRole);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-left"
                          >
                            {role === 'seller' ? (
                              <>
                                <Globe className="w-4 h-4 text-emerald-400" />
                                <div>
                                  <div className="font-medium">Switch to Customer View</div>
                                  <div className="text-[10px] text-slate-500">Shop as a buyer</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <Store className="w-4 h-4 text-amber-400" />
                                <div>
                                  <div className="font-medium">Switch to Seller Mode</div>
                                  <div className="text-[10px] text-slate-500">Manage products & orders</div>
                                </div>
                              </>
                            )}
                          </button>

                          <button
                            id="dropdown-clear-store-btn"
                            onClick={() => {
                              if (confirm('Are you sure you want to remove all products and orders to start completely clean?')) {
                                clearStoreData();
                              }
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-all text-left"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                            <span>Wipe All Store Data (Clean Slate)</span>
                          </button>
                        </>
                      )}

                      {/* Sign Out */}
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-all text-left border-t border-slate-800/60 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="header-google-signin-btn"
                  onClick={() => openAuthModal('signin')}
                  className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-100 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-sm group"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Assistant Trigger Button (Universal for Shoppers & Store Owner) */}
          <button
            id="header-ai-assistant-btn"
            onClick={() => openAIAssistant()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-all group shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="text-xs font-semibold">AI Concierge</span>
          </button>

          {/* Cart Trigger */}
          <button
            id="open-cart-drawer-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-300 transition-all group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">Bag</p>
              <p className="text-xs font-bold text-slate-200 leading-tight">
                ${cartSubtotal.toFixed(2)}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
