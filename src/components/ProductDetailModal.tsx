import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductVariant, Product } from '../types';
import {
  X,
  Star,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Edit3,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Layers,
  TrendingUp,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductDetail,
    setSelectedProductDetail,
    role,
    isStoreOwner,
    isCustomerPreview,
    addToCart,
    updateProductInline,
    deleteProduct,
    openAIAssistant
  } = useStore();

  const product = selectedProductDetail;
  const isSeller = role === 'seller' && isStoreOwner && !isCustomerPreview;

  // Active view tab in seller mode ('preview' or 'edit')
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');

  // Customer selection state
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);

  // Seller Editor State
  const [editTitle, setEditTitle] = useState(product?.title || '');
  const [editSubtitle, setEditSubtitle] = useState(product?.subtitle || '');
  const [editDesc, setEditDesc] = useState(product?.description || '');
  const [editPrice, setEditPrice] = useState(product?.price.toString() || '');
  const [editCompareAt, setEditCompareAt] = useState(product?.compareAtPrice?.toString() || '');
  const [editCost, setEditCost] = useState(product?.costPrice?.toString() || '');
  const [editInventory, setEditInventory] = useState(product?.inventory.toString() || '0');
  const [editCategory, setEditCategory] = useState<Product['category']>(product?.category || 'Electronics');
  const [editBadge, setEditBadge] = useState(product?.badge || '');
  const [editTags, setEditTags] = useState(product?.tags.join(', ') || '');
  const [variantsList, setVariantsList] = useState<ProductVariant[]>(product?.variants || []);

  if (!product) return null;

  const currentPrice = product.price + (selectedVariant ? selectedVariant.priceOffset : 0);

  const handleSaveSellerEdits = () => {
    const p = parseFloat(editPrice) || product.price;
    const comp = editCompareAt ? parseFloat(editCompareAt) : null;
    const cost = editCost ? parseFloat(editCost) : product.costPrice;
    const inv = parseInt(editInventory, 10) || product.inventory;
    const tagsArr = editTags.split(',').map((t) => t.trim()).filter(Boolean);

    updateProductInline(product.id, {
      title: editTitle,
      subtitle: editSubtitle,
      description: editDesc,
      price: p,
      compareAtPrice: comp,
      costPrice: cost,
      inventory: inv,
      category: editCategory,
      badge: editBadge,
      tags: tagsArr,
      variants: variantsList
    });

    setActiveTab('preview');
  };

  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: 'var-' + Date.now(),
      name: 'New Option / Color',
      priceOffset: 0,
      stock: 10
    };
    setVariantsList([...variantsList, newVar]);
  };

  const handleUpdateVariant = (idx: number, updates: Partial<ProductVariant>) => {
    setVariantsList(variantsList.map((v, i) => (i === idx ? { ...v, ...updates } : v)));
  };

  const handleRemoveVariant = (idx: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== idx));
  };

  return (
    <AnimatePresence>
      <div id="product-detail-modal-overlay" className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl rounded-3xl bg-[#0f1420] border border-slate-800 shadow-2xl overflow-hidden my-8"
        >
          {/* Header & Tabs */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                {product.category}
              </span>
              {product.isDropshipped && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Dropshipped Direct
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isSeller && (
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      activeTab === 'preview' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Customer View
                  </button>
                  <button
                    onClick={() => {
                      // refresh inputs with current product state
                      setEditTitle(product.title);
                      setEditSubtitle(product.subtitle || '');
                      setEditDesc(product.description);
                      setEditPrice(product.price.toString());
                      setEditCompareAt(product.compareAtPrice?.toString() || '');
                      setEditCost(product.costPrice?.toString() || '');
                      setEditInventory(product.inventory.toString());
                      setEditCategory(product.category);
                      setEditBadge(product.badge || '');
                      setEditTags(product.tags.join(', '));
                      setVariantsList(product.variants || []);
                      setActiveTab('edit');
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      activeTab === 'edit' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    In-Situ Editor
                  </button>
                </div>
              )}

              <button
                id="close-product-detail-modal-btn"
                onClick={() => setSelectedProductDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          {activeTab === 'edit' && isSeller ? (
            /* SELLER EDIT FORM */
            <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle / Highlight</label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Markdown Supported)</label>
                  <textarea
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Retail Price ($USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Compare-At Price ($USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCompareAt}
                    onChange={(e) => setEditCompareAt(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g. 249.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Base Cost ($USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    Calculated Profit: ${(parseFloat(editPrice || '0') - parseFloat(editCost || '0')).toFixed(2)} per unit
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Available Stock / Inventory</label>
                  <input
                    type="number"
                    value={editInventory}
                    onChange={(e) => setEditInventory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Badge (Optional)</label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    placeholder="e.g. Bestseller, Limited Edition"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Variants Editor */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Product Variants & Colorways
                  </h4>
                  <button
                    onClick={handleAddVariant}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-slate-900 rounded-lg border border-amber-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {variantsList.map((variant, idx) => (
                    <div key={variant.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleUpdateVariant(idx, { name: e.target.value })}
                        placeholder="Variant Name"
                        className="flex-1 bg-slate-950 border border-slate-700 text-xs text-white px-2.5 py-1.5 rounded-lg"
                      />
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span>Price +/-:</span>
                        <input
                          type="number"
                          value={variant.priceOffset}
                          onChange={(e) => handleUpdateVariant(idx, { priceOffset: parseFloat(e.target.value) || 0 })}
                          className="w-16 bg-slate-950 border border-slate-700 text-xs text-white px-2 py-1.5 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <span>Stock:</span>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateVariant(idx, { stock: parseInt(e.target.value, 10) || 0 })}
                          className="w-16 bg-slate-950 border border-slate-700 text-xs text-white px-2 py-1.5 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save / Cancel Bar */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="save-in-situ-edits-btn"
                  onClick={handleSaveSellerEdits}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Changes to Live Catalog
                </button>
              </div>
            </div>
          ) : (
            /* CUSTOMER PRODUCT SHOWCASE */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
              {/* Media Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={product.images[selectedImageIdx] || product.images[0]}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  {product.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIdx === idx ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Free Global Air Express</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2-Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>30-Day Returns</span>
                  </div>
                </div>
              </div>

              {/* Product Info & Purchase Controls */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold text-white">{product.rating}</span>
                    </div>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{product.reviewCount} customer reviews</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-semibold">{product.inventory} in stock</span>
                  </div>

                  <h2 className="font-display text-2xl font-extrabold text-white leading-tight mb-2">
                    {product.title}
                  </h2>

                  {product.subtitle && (
                    <p className="text-sm font-medium text-amber-400/90 mb-3">{product.subtitle}</p>
                  )}

                  {/* Pricing Box */}
                  <div className="flex items-baseline gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
                    <span className="font-display text-3xl font-extrabold text-white">
                      ${currentPrice.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-base text-slate-500 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                    {product.compareAtPrice && (
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        SAVE ${(product.compareAtPrice - product.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  {/* Variants Chooser */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Select Edition / Colorway
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => {
                          const isSelected = selectedVariant?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariant(v)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {v.name}
                              {v.priceOffset !== 0 && (
                                <span className="ml-1 opacity-80">
                                  ({v.priceOffset > 0 ? `+$${v.priceOffset}` : `-$${Math.abs(v.priceOffset)}`})
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tags & AI Helper */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {product.tags.map((t) => (
                        <span key={t} className="px-2.5 py-1 rounded-md text-[11px] bg-slate-900 text-slate-400 border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      id="product-ask-ai-btn"
                      type="button"
                      onClick={() => {
                        setSelectedProductDetail(null);
                        openAIAssistant(`Tell me more about the ${product.title}. What are its main advantages, specs, and why should I choose it?`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ask AI about this product</span>
                    </button>
                  </div>
                </div>

                {/* Add to Cart Actions */}
                <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag CTA */}
                  <button
                    id="modal-add-to-bag-btn"
                    disabled={product.inventory <= 0}
                    onClick={() => {
                      addToCart(product, selectedVariant, quantity);
                      setSelectedProductDetail(null);
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                      product.inventory <= 0
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:brightness-110 shadow-amber-500/20'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-black" />
                    {product.inventory <= 0 ? 'Out of Stock' : `Add to Bag • $${(currentPrice * quantity).toFixed(2)}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
