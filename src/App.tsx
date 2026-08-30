import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FilterToolbar } from './components/FilterToolbar';
import { ProductCard } from './components/ProductCard';
import { AddProductCard } from './components/AddProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DropshipImportModal } from './components/DropshipImportModal';
import { AddProductModal } from './components/AddProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { SellerOrderHUD } from './components/SellerOrderHUD';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { EmailHubModal } from './components/EmailHubModal';
import { Footer } from './components/Footer';
import { Sparkles, PackageCheck, PackageOpen, Plus, Store, ShoppingBag, Bot } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

const StorefrontContent: React.FC = () => {
  const {
    products,
    filteredProducts,
    role,
    isStoreOwner,
    isCustomerPreview,
    filters,
    setFilters,
    setIsDropshipImportModalOpen,
    setIsAddProductModalOpen,
    setIsSellerOrderHUDOpen,
    pendingOrdersCount,
    openAuthModal,
    openOwnerAuthModal,
    openAIAssistant,
    userProfile
  } = useStore();

  const isSeller = role === 'seller' && isStoreOwner && !isCustomerPreview;

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0f17] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Top Store Header with Dual Journey Switcher & Auth */}
      <Header />

      {/* Hero Showcase with Platform Pulse */}
      <HeroBanner />

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Dynamic Category & Filter Toolbar */}
        <FilterToolbar />

        {/* Product Grid */}
        <div id="product-catalog-grid" className="pt-6">
          {filteredProducts.length === 0 ? (
            products.length === 0 ? (
              // Store has 0 products (clean database)
              <div className="text-center py-16 px-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 my-4 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  {isSeller ? 'Your Store Catalog is Ready' : 'Catalog Being Stocked'}
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  {isSeller
                    ? 'All demo data has been cleared. You can now add your own custom products or import real-time items directly from dropship suppliers.'
                    : 'New high-end tech, accessories, and EDC gear are currently being curated for this collection. Sign in for arrival alerts or ask our AI Concierge.'}
                </p>

                {isSeller ? (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      id="empty-state-add-product-btn"
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Product</span>
                    </button>
                    <button
                      id="empty-state-dropship-btn"
                      onClick={() => setIsDropshipImportModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Import From Dropship Suppliers</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      id="empty-state-customer-signup-btn"
                      onClick={() => openAuthModal('signup')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Customer Sign Up / Join</span>
                    </button>
                    <button
                      id="empty-state-customer-signin-btn"
                      onClick={() => openAuthModal('signin')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all"
                    >
                      <span>Customer Sign In</span>
                    </button>
                    <button
                      id="empty-state-ask-ai-btn"
                      onClick={() => openAIAssistant('Can you tell me about the products and features coming soon to this store?')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ask AI Concierge</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Products exist but filter query returned 0 matches
              <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 my-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-1">No matching products found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  No items match your active filter criteria. Try clearing search keywords or changing category filters.
                </p>
                <button
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      searchQuery: '',
                      category: 'All',
                      onlyDropshipped: false,
                      onlyInStock: false,
                      sellerStatusFilter: 'all'
                    }))
                  }
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {/* In-Grid Seller Sourcing & Add Card */}
              {isSeller && <AddProductCard />}

              {/* Product Cards */}
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Floating Seller Quick Action Pill */}
      {isSeller && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
          <button
            id="floating-seller-hud-btn"
            onClick={() => setIsSellerOrderHUDOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <PackageCheck className="w-4 h-4 text-amber-400" />
            <span>Orders & Fulfillment</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {pendingOrdersCount} new
              </span>
            )}
          </button>

          <button
            id="floating-source-dropship-btn"
            onClick={() => setIsDropshipImportModalOpen(true)}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform"
            title="1-Click Sourcing Modal"
          >
            <Sparkles className="w-4 h-4 text-black" />
          </button>
        </div>
      )}

      {/* Floating AI Concierge Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-ai-assistant-btn"
          onClick={() => openAIAssistant()}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-105 transition-all group border border-indigo-400/30"
        >
          <Sparkles className="w-4 h-4 text-indigo-200 group-hover:scale-125 transition-transform animate-pulse" />
          <span>Ask AI Concierge</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Modals, Drawers & Auth */}
      <AuthModal />
      <CustomerAccountModal />
      <ProductDetailModal />
      <DropshipImportModal />
      <AddProductModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <SellerOrderHUD />
      <AIAssistantModal />
      <EmailHubModal />
      <ToastContainer />

      {/* Store Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StorefrontContent />
    </StoreProvider>
  );
}
