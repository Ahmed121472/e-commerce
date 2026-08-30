import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Plus, Layers, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const {
    role,
    isStoreOwner,
    isCustomerPreview,
    products,
    setIsDropshipImportModalOpen,
    setIsAddProductModalOpen,
    filters,
    setFilters,
    openAuthModal,
    userProfile,
    setIsCustomerPortalOpen
  } = useStore();

  const isSeller = role === 'seller' && isStoreOwner && !isCustomerPreview;
  const dropshipCount = products.filter((p) => p.isDropshipped).length;
  const publishedCount = products.filter((p) => p.status === 'published').length;

  return (
    <section className="relative overflow-hidden pt-8 pb-10 border-b border-slate-800/60 bg-gradient-to-b from-[#0e1320] via-[#0c0f17] to-[#0c0f17]">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text and Highlights */}
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Curated High-End Tech, EDC & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
                Direct Dropship Sourcing
              </span>
            </h1>

            <p className="mt-3.5 text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
              Discover precision-engineered workspace gear and smart EDC essentials.
              {isSeller
                ? ' As a merchant, edit any product directly on this page, adjust real-time profit markups, and source from global suppliers with 1 click.'
                : ' Enjoy factory-direct pricing, global trackable express shipping, and a seamless checkout experience.'}
            </p>

            {/* Action Buttons based on Role */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {isSeller ? (
                <>
                  <button
                    id="hero-source-dropship-cta"
                    onClick={() => setIsDropshipImportModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    Source Dropship Product
                  </button>
                  <button
                    id="hero-add-custom-product-cta"
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    Create Custom Item
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="#product-catalog-grid"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Explore Catalog
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {userProfile ? (
                    <button
                      id="hero-customer-account-btn"
                      onClick={() => setIsCustomerPortalOpen(true)}
                      className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-semibold text-sm transition-all flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>My Customer Orders</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        id="hero-customer-signup-btn"
                        onClick={() => openAuthModal('signup')}
                        className="px-4 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                      >
                        <span>Customer Sign Up</span>
                      </button>
                      <button
                        id="hero-customer-signin-btn"
                        onClick={() => openAuthModal('signin')}
                        className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm transition-all"
                      >
                        Sign In
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, onlyDropshipped: true }))}
                    className="px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-sm transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    Direct Dropship
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Metrics / Guarantees Card */}
          {isSeller ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full lg:w-80 p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/30 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Live Seller Catalog Pulse
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  Merchant Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3.5">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Live Products</span>
                  <span className="text-xl font-display font-extrabold text-white mt-0.5 block">{publishedCount} items</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Dropshipped</span>
                  <span className="text-xl font-display font-extrabold text-amber-400 mt-0.5 block">{dropshipCount} items</span>
                </div>
              </div>

              <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Supplier Sourcing Margin
                  </span>
                  <span className="font-bold text-amber-300">~165% avg</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Automated retail pricing formulas based on base cost + express air freight.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full lg:w-80 p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-md space-y-3.5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Direct Buyer Guarantees
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Verified Store
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Trackable Global Delivery</h4>
                    <p className="text-[11px] text-slate-400">Instant tracking number and automated Gmail delivery updates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Direct-to-Consumer Value</h4>
                    <p className="text-[11px] text-slate-400">Curated hardware and accessories with 30-day money-back guarantee.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
