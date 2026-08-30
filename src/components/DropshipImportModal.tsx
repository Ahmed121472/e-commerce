import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DROPSHIP_CATALOG_PRESETS } from '../data/mockData';
import { DropshipPresetItem, ProductVariant } from '../types';
import {
  X,
  Sparkles,
  Link,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldAlert,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DropshipImportModal: React.FC = () => {
  const { isDropshipImportModalOpen, setIsDropshipImportModalOpen, importDropshipProduct } = useStore();

  // Active mode ('presets' or 'custom-url')
  const [mode, setMode] = useState<'presets' | 'custom-url'>('presets');

  // Custom supplier URL scraping form state
  const [supplierUrl, setSupplierUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [customForm, setCustomForm] = useState<{
    title: string;
    subtitle: string;
    description: string;
    category: 'Electronics' | 'Audio' | 'Wearables' | 'Accessories' | 'Home Office' | 'Lifestyle';
    images: string[];
    supplierName: string;
    supplierSku: string;
    supplierCost: number;
    shippingCost: number;
    markupPercentage: number;
    estimatedDeliveryDays: string;
    variants: ProductVariant[];
    tags: string[];
  }>({
    title: '',
    subtitle: '',
    description: '',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
    supplierName: 'CJ Dropshipping Fast-Line',
    supplierSku: 'CJ-SRC-' + Math.floor(10000 + Math.random() * 90000),
    supplierCost: 24.50,
    shippingCost: 5.50,
    markupPercentage: 160,
    estimatedDeliveryDays: '6-9 business days',
    variants: [
      { id: 'v1', name: 'Midnight Black', priceOffset: 0, stock: 80 },
      { id: 'v2', name: 'Silver Edition', priceOffset: 5, stock: 50 }
    ],
    tags: ['Dropship Direct', 'Trending', 'Tech']
  });

  // Selected preset state for customization before import
  const [selectedPreset, setSelectedPreset] = useState<DropshipPresetItem | null>(DROPSHIP_CATALOG_PRESETS[0] || null);
  const [presetMarkup, setPresetMarkup] = useState(150);

  if (!isDropshipImportModalOpen) return null;

  const handleSimulateUrlScrape = () => {
    if (!supplierUrl.trim()) return;
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      setCustomForm((prev) => ({
        ...prev,
        title: 'Precision Magnetic Levitating Moon Lamp with Wireless Base',
        subtitle: '3D Printed Moon Surface with 3 Dynamic Warmth Tones',
        description: 'Engineered with patented magnetic repulsion coils allowing the moon orb to float silently and spin 360° continuously in mid-air. Powered via induction base.',
        supplierName: supplierUrl.includes('aliexpress') ? 'AliExpress Premier Seller' : 'CJ Dropshipping Tech',
        supplierCost: 28.00,
        shippingCost: 6.00,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
        ]
      }));
    }, 1200);
  };

  const handleImportPreset = (preset: DropshipPresetItem) => {
    importDropshipProduct({
      title: preset.title,
      description: preset.description,
      category: preset.category,
      images: preset.images,
      supplierName: preset.supplierName,
      supplierSku: preset.supplierSku,
      supplierUrl: preset.supplierUrl,
      supplierCost: preset.supplierCost,
      shippingCost: preset.shippingCost,
      markupPercentage: presetMarkup,
      estimatedDeliveryDays: preset.estimatedDelivery,
      variants: preset.variants,
      tags: preset.tags
    });
    setIsDropshipImportModalOpen(false);
  };

  const handleImportCustom = () => {
    if (!customForm.title.trim()) return;
    importDropshipProduct({
      title: customForm.title,
      subtitle: customForm.subtitle,
      description: customForm.description,
      category: customForm.category,
      images: customForm.images,
      supplierName: customForm.supplierName,
      supplierSku: customForm.supplierSku,
      supplierUrl: supplierUrl || customForm.supplierName,
      supplierCost: customForm.supplierCost,
      shippingCost: customForm.shippingCost,
      markupPercentage: customForm.markupPercentage,
      estimatedDeliveryDays: customForm.estimatedDeliveryDays,
      variants: customForm.variants,
      tags: customForm.tags
    });
    setIsDropshipImportModalOpen(false);
  };

  // Financial calculations for preset
  const presetTotalCost = (selectedPreset?.supplierCost || 0) + (selectedPreset?.shippingCost || 0);
  const presetRetailPrice = Math.round(presetTotalCost * (1 + presetMarkup / 100) * 100) / 100;
  const presetProfit = (presetRetailPrice - (selectedPreset?.supplierCost || 0)).toFixed(2);

  // Financial calculations for custom
  const customTotalCost = customForm.supplierCost + customForm.shippingCost;
  const customRetailPrice = Math.round(customTotalCost * (1 + customForm.markupPercentage / 100) * 100) / 100;
  const customProfit = (customRetailPrice - customForm.supplierCost).toFixed(2);

  return (
    <AnimatePresence>
      <div id="dropship-import-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl rounded-3xl bg-[#0f1420] border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden my-8"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Dropship Sourcing Engine & Margin Calculator
                </h3>
                <p className="text-[11px] text-slate-400">1-Click import from global suppliers with real-time profit formula</p>
              </div>
            </div>

            <button
              id="close-dropship-modal-btn"
              onClick={() => setIsDropshipImportModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="px-6 pt-4 pb-2 flex items-center gap-2 border-b border-slate-800 bg-slate-900/60">
            <button
              id="dropship-mode-preset"
              onClick={() => setMode('presets')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === 'presets'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Supplier Verified Presets (AliExpress / CJ)
            </button>
            <button
              id="dropship-mode-custom"
              onClick={() => setMode('custom-url')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === 'custom-url'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Import via Supplier URL / SKU
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {mode === 'presets' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DROPSHIP_CATALOG_PRESETS.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setSelectedPreset(preset);
                          setPresetMarkup(preset.suggestedMarkup);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-950">
                            <img src={preset.images[0]} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                            {preset.supplierName}
                          </span>
                          <h4 className="font-display font-bold text-xs text-white line-clamp-2 mt-0.5">
                            {preset.title}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Cost: <strong className="text-white">${preset.supplierCost.toFixed(2)}</strong></span>
                          <span className="text-emerald-400 font-bold">~{preset.suggestedMarkup}% ROI</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Preset Details & Live Pricing Calculator */}
                {selectedPreset && (
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                          Configuring Sourcing & Margin
                        </span>
                        <h4 className="font-display font-bold text-lg text-white">
                          {selectedPreset.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                        SKU: {selectedPreset.supplierSku}
                      </span>
                    </div>

                    {/* Margin Slider */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-amber-400" />
                          Target Profit Markup Percentage
                        </label>
                        <span className="text-sm font-extrabold text-amber-400 font-display">
                          {presetMarkup}% Markup
                        </span>
                      </div>

                      <input
                        type="range"
                        min="50"
                        max="300"
                        step="5"
                        value={presetMarkup}
                        onChange={(e) => setPresetMarkup(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />

                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>50% (Budget)</span>
                        <span>150% (Recommended)</span>
                        <span>300% (High Margin)</span>
                      </div>
                    </div>

                    {/* Financial Equation Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/20 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Supplier Base Cost</span>
                        <strong className="text-sm font-bold text-white">${selectedPreset.supplierCost.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Air Shipping Buffer</span>
                        <strong className="text-sm font-bold text-slate-300">+${selectedPreset.shippingCost.toFixed(2)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Customer Retail Price</span>
                        <strong className="text-base font-display font-extrabold text-amber-400">
                          ${presetRetailPrice.toFixed(2)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Net Profit / Sale</span>
                        <strong className="text-base font-display font-extrabold text-emerald-400">
                          +${presetProfit}
                        </strong>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        id="publish-preset-dropship-btn"
                        onClick={() => handleImportPreset(selectedPreset)}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Publish Product to Live Storefront
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* CUSTOM URL SCRAPER FORM */
              <div className="space-y-5">
                {/* Scraper Input */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Paste Supplier Product URL (AliExpress, CJ Dropshipping, Taobao, or Printful)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://www.aliexpress.com/item/100500..."
                      value={supplierUrl}
                      onChange={(e) => setSupplierUrl(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      id="scrape-supplier-url-btn"
                      disabled={isScraping}
                      onClick={handleSimulateUrlScrape}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {isScraping ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Scraping Specs...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Fetch & Ingest</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={customForm.title}
                      onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                      placeholder="e.g. Precision Titanium Screwdriver Set"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={customForm.category}
                      onChange={(e) => setCustomForm({ ...customForm, category: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Home Office">Home Office</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={customForm.description}
                      onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                      placeholder="Product specifications, materials, and benefits..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Base Cost ($USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customForm.supplierCost}
                      onChange={(e) => setCustomForm({ ...customForm, supplierCost: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Markup Percentage (%)</label>
                    <input
                      type="number"
                      value={customForm.markupPercentage}
                      onChange={(e) => setCustomForm({ ...customForm, markupPercentage: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Formula Preview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block">Calculated Storefront Price</span>
                    <strong className="text-lg font-display text-amber-400 font-extrabold">${customRetailPrice.toFixed(2)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Profit per unit</span>
                    <strong className="text-lg font-display text-emerald-400 font-extrabold">+${customProfit}</strong>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    id="submit-custom-dropship-btn"
                    disabled={!customForm.title.trim()}
                    onClick={handleImportCustom}
                    className={`px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 ${
                      !customForm.title.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110 shadow-lg shadow-amber-500/20'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Save & Publish to Live Catalog
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
