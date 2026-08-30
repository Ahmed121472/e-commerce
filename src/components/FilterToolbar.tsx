import React from 'react';
import { useStore } from '../context/StoreContext';
import { SlidersHorizontal, Sparkles, Check, ArrowDownUp, Tag, Package, EyeOff } from 'lucide-react';
import { Product } from '../types';

const CATEGORIES: Array<string> = [
  'All',
  'Audio',
  'Wearables',
  'Electronics',
  'Accessories',
  'Home Office',
  'Lifestyle'
];

export const FilterToolbar: React.FC = () => {
  const { filters, setFilters, role, isStoreOwner, isCustomerPreview, filteredProducts, products } = useStore();
  const isSeller = role === 'seller' && isStoreOwner && !isCustomerPreview;

  const handleCategoryChange = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
  };

  const clearAllFilters = () => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: '',
      category: 'All',
      onlyDropshipped: false,
      onlyInStock: false,
      sellerStatusFilter: 'all',
      sortBy: 'featured'
    }));
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.onlyDropshipped ||
    filters.onlyInStock ||
    filters.searchQuery ||
    filters.sellerStatusFilter !== 'all';

  return (
    <div id="product-filter-toolbar" className="w-full pt-8 pb-4">
      {/* Category Pills */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat === 'All' && <Tag className="w-3 h-3" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort and Count */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredProducts.length}</strong> items
          </span>

          <div className="relative flex items-center">
            <select
              id="sort-by-select"
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-800 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
            >
              <option value="featured">Featured Collection</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Secondary filter chips (Dropship toggle, Stock toggle, Seller Draft toggle) */}
      <div className="flex items-center justify-between gap-3 pt-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dropship Exclusive Switch */}
          <button
            id="toggle-dropship-filter"
            onClick={() => setFilters((prev) => ({ ...prev, onlyDropshipped: !prev.onlyDropshipped }))}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
              filters.onlyDropshipped
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Direct Dropshipped Only
            {filters.onlyDropshipped && <Check className="w-3 h-3" />}
          </button>

          {/* In-Stock Only Switch */}
          <button
            id="toggle-stock-filter"
            onClick={() => setFilters((prev) => ({ ...prev, onlyInStock: !prev.onlyInStock }))}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
              filters.onlyInStock
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3 h-3 text-emerald-400" />
            In Stock Only
            {filters.onlyInStock && <Check className="w-3 h-3" />}
          </button>

          {/* Seller Drafts / Published Filter (Only when in Seller mode) */}
          {isSeller && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                id="seller-filter-all"
                onClick={() => setFilters((prev) => ({ ...prev, sellerStatusFilter: 'all' }))}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  filters.sellerStatusFilter === 'all'
                    ? 'bg-slate-800 text-amber-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Status
              </button>
              <button
                id="seller-filter-published"
                onClick={() => setFilters((prev) => ({ ...prev, sellerStatusFilter: 'published' }))}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  filters.sellerStatusFilter === 'published'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Published
              </button>
              <button
                id="seller-filter-draft"
                onClick={() => setFilters((prev) => ({ ...prev, sellerStatusFilter: 'draft' }))}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  filters.sellerStatusFilter === 'draft'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                Drafts ({products.filter((p) => p.status === 'draft').length})
              </button>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            id="clear-all-filters-btn"
            onClick={clearAllFilters}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
