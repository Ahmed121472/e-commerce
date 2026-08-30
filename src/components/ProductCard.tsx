import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import {
  Star,
  ShoppingBag,
  Sparkles,
  Edit3,
  Check,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  TrendingUp,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    role,
    isStoreOwner,
    isCustomerPreview,
    addToCart,
    setSelectedProductDetail,
    updateProductInline,
    toggleProductStatus,
    deleteProduct
  } = useStore();

  const isSeller = role === 'seller' && isStoreOwner && !isCustomerPreview;

  // Inline editing state for quick card edits
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(product.price.toString());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(product.title);

  const profit = (product.price - (product.costPrice || 0)).toFixed(2);
  const profitMarginPercent = product.costPrice
    ? Math.round(((product.price - product.costPrice) / product.costPrice) * 100)
    : 0;

  const handleSavePrice = () => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num > 0) {
      updateProductInline(product.id, { price: num });
    } else {
      setTempPrice(product.price.toString());
    }
    setIsEditingPrice(false);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      updateProductInline(product.id, { title: tempTitle.trim() });
    } else {
      setTempTitle(product.title);
    }
    setIsEditingTitle(false);
  };

  const handleStockDelta = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextInv = Math.max(0, product.inventory + delta);
    updateProductInline(product.id, { inventory: nextInv });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isSeller
          ? 'bg-[#101522] border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-black/40'
          : 'bg-[#0f1420] border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-amber-500/5'
      }`}
    >
      {/* Top Media & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 cursor-pointer" onClick={() => setSelectedProductDetail(product)}>
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            {product.isDropshipped && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-black shadow-md">
                <Sparkles className="w-3 h-3" />
                Dropship Direct
              </span>
            )}
            {product.badge && !product.isDropshipped && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-slate-900/90 text-amber-300 border border-amber-500/30 shadow-md backdrop-blur-md">
                {product.badge}
              </span>
            )}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-500 text-white shadow-md">
                SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </span>
            )}
          </div>

          {/* In-Situ Seller Status Switcher */}
          {isSeller && (
            <div className="pointer-events-auto flex items-center gap-1">
              <button
                id={`card-toggle-status-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProductStatus(product.id);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-lg flex items-center gap-1 transition-all ${
                  product.status === 'published'
                    ? 'bg-emerald-500/90 text-slate-950 hover:bg-emerald-400'
                    : 'bg-amber-500/90 text-slate-950 hover:bg-amber-400'
                }`}
                title="Click to toggle Published / Draft status"
              >
                {product.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {product.status === 'published' ? 'Live' : 'Draft'}
              </button>
            </div>
          )}
        </div>

        {/* Out of Stock banner if zero inventory */}
        {product.inventory <= 0 && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-lg bg-rose-500/90 text-white font-bold text-xs uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium text-amber-400/90 tracking-wide uppercase text-[11px]">{product.category}</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-white">{product.rating}</span>
              <span className="text-[11px] text-slate-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title: Inline Editable in Seller Mode */}
          {isSeller ? (
            <div className="relative mb-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    autoFocus
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    className="w-full text-sm font-bold bg-slate-900 text-white px-2 py-1 rounded border border-amber-500 focus:outline-none"
                  />
                  <button onClick={handleSaveTitle} className="p-1 bg-amber-500 text-black rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className="group/title flex items-start justify-between gap-1 cursor-pointer hover:bg-slate-800/40 p-1 -m-1 rounded transition-colors"
                  title="Click to edit title inline"
                >
                  <h3 className="font-display font-bold text-slate-100 text-sm leading-snug line-clamp-2">
                    {product.title}
                  </h3>
                  <Edit3 className="w-3 h-3 text-amber-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 mt-0.5" />
                </div>
              )}
            </div>
          ) : (
            <h3
              onClick={() => setSelectedProductDetail(product)}
              className="font-display font-bold text-slate-100 text-sm leading-snug line-clamp-2 mb-2 hover:text-amber-300 transition-colors cursor-pointer"
            >
              {product.title}
            </h3>
          )}

          {/* Subtitle snippet */}
          {product.subtitle && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-3">{product.subtitle}</p>
          )}

          {/* In-Situ Seller Margin & Supplier Breakdown */}
          {isSeller && (
            <div className="mb-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>Base Cost: <strong className="text-slate-200">${(product.costPrice || 0).toFixed(2)}</strong></span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <TrendingUp className="w-3 h-3" />
                  +${profit} profit ({profitMarginPercent}%)
                </span>
              </div>

              {product.dropshipDetails && (
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[140px] text-amber-400/90 font-medium">
                    {product.dropshipDetails.supplierName}
                  </span>
                  <span className="font-mono text-slate-500">{product.dropshipDetails.supplierSku}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer: Pricing & Action Button */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 mt-auto">
          {/* Price: Inline Editable in Seller Mode */}
          <div>
            {isSeller ? (
              <div>
                {isEditingPrice ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-amber-400 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      autoFocus
                      onBlur={handleSavePrice}
                      onKeyDown={(e) => e.key === 'Enter' && handleSavePrice()}
                      className="w-20 text-sm font-extrabold bg-slate-900 text-white px-1.5 py-0.5 rounded border border-amber-500 focus:outline-none"
                    />
                    <button onClick={handleSavePrice} className="p-1 bg-amber-500 text-black rounded text-[10px]">
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingPrice(true)}
                    className="group/price flex items-baseline gap-1.5 cursor-pointer hover:bg-slate-800/40 px-1 py-0.5 -mx-1 rounded transition-colors"
                    title="Click to edit price directly"
                  >
                    <span className="font-display font-extrabold text-base text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-slate-500 line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                    <Edit3 className="w-2.5 h-2.5 text-amber-400 opacity-0 group-hover/price:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <Package className="w-2.5 h-2.5 text-slate-500" />
                  <span>Stock: {product.inventory}</span>
                  <button onClick={(e) => handleStockDelta(5, e)} className="text-amber-400 hover:underline font-bold">+5</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-extrabold text-lg text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-xs text-slate-500 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-emerald-400 font-medium">Free Express Shipping</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isSeller ? (
            <div className="flex items-center gap-1">
              <button
                id={`card-edit-modal-btn-${product.id}`}
                onClick={() => setSelectedProductDetail(product)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                title="Open detailed product editor"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                Edit
              </button>
              <button
                id={`card-delete-btn-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remove "${product.title}" from catalog?`)) {
                    deleteProduct(product.id);
                  }
                }}
                className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id={`card-add-to-cart-btn-${product.id}`}
              disabled={product.inventory <= 0}
              onClick={() => addToCart(product)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                product.inventory <= 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black shadow-amber-500/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {product.inventory <= 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
