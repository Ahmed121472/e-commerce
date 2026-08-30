import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Lock, Edit3, Globe, Crown } from 'lucide-react';
import { STORE_OWNER_EMAIL } from '../types';

export const Footer: React.FC = () => {
  const { role, setRole, isStoreOwner, isCustomerPreview, openOwnerAuthModal, setIsCustomerPreview } = useStore();

  return (
    <footer className="w-full bg-[#080a10] border-t border-slate-800/80 pt-12 pb-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-slate-800">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs mb-0.5">Global Tracked Express</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">Direct air cargo lines with real-time end-to-end tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs mb-0.5">Direct Factory Sourcing</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">Rigorous quality inspection & 2-year full hardware coverage.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs mb-0.5">30-Day Risk-Free Returns</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">No-hassle satisfaction guarantee with rapid refunds.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-xs mb-0.5">256-Bit Encrypted Checkout</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">Apple Pay, Google Pay, and Stripe enterprise security.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-display font-extrabold text-white tracking-tight">NOVA</span>
            <span className="text-slate-500 text-[11px]">© 2026 Direct Storefront & Supply. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            {role === 'seller' && isStoreOwner && !isCustomerPreview ? (
              <button
                onClick={() => {
                  setRole('customer');
                  setIsCustomerPreview(false);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 font-medium"
              >
                <Globe className="w-3 h-3" />
                Switch to Customer View
              </button>
            ) : (
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="hover:text-slate-300 cursor-pointer">Buyer Protection Policy</span>
                <span>•</span>
                <span className="hover:text-slate-300 cursor-pointer">2-Year Warranty</span>
                <span>•</span>
                <span className="hover:text-slate-300 cursor-pointer">Live Courier Tracking</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
