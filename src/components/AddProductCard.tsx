import React from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Sparkles, PackagePlus } from 'lucide-react';
import { motion } from 'motion/react';

export const AddProductCard: React.FC = () => {
  const { role, isCustomerPreview, setIsDropshipImportModalOpen, setIsAddProductModalOpen } = useStore();

  if (role !== 'seller' || isCustomerPreview) {
    return null;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border-2 border-dashed border-amber-500/40 hover:border-amber-500/80 bg-gradient-to-b from-amber-500/5 via-slate-900/50 to-slate-950 p-6 flex flex-col items-center justify-center text-center group transition-all duration-300 min-h-[380px]"
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/5">
        <Sparkles className="w-7 h-7 text-amber-400" />
      </div>

      <h3 className="font-display font-bold text-lg text-white mb-1">
        Expand Your Catalog
      </h3>
      <p className="text-xs text-slate-400 max-w-[220px] mb-6 leading-relaxed">
        Import high-margin dropshipped products or list your own custom inventory in seconds.
      </p>

      <div className="w-full flex flex-col gap-2.5 max-w-[240px]">
        <button
          id="grid-source-dropship-btn"
          onClick={() => setIsDropshipImportModalOpen(true)}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-black" />
          1-Click Dropship Import
        </button>

        <button
          id="grid-create-custom-btn"
          onClick={() => setIsAddProductModalOpen(true)}
          className="w-full py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          Create Custom Item
        </button>
      </div>
    </motion.div>
  );
};
