export type UserRole = 'customer' | 'seller';

export const STORE_OWNER_EMAIL = 'sarn2008ahmed@gmail.com';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isOwner?: boolean;
  storeName?: string;
  avatarUrl?: string;
  phone?: string;
  savedAddress?: {
    street: string;
    city: string;
    state?: string;
    zip: string;
    country: string;
  };
  memberTier?: 'Member' | 'Gold VIP' | 'Direct Premier';
  createdAt: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceOffset: number;
  stock: number;
  sku?: string;
}

export interface DropshipDetails {
  supplierName: string;
  supplierSku: string;
  supplierUrl: string;
  supplierCost: number;
  shippingCost: number;
  markupPercentage: number;
  estimatedDeliveryDays: string;
  autoFulfill: boolean;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: 'Electronics' | 'Audio' | 'Wearables' | 'Accessories' | 'Home Office' | 'Lifestyle';
  tags: string[];
  images: string[];
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number; // Internal supplier cost
  isDropshipped: boolean;
  dropshipDetails?: DropshipDetails;
  inventory: number;
  status: 'published' | 'draft' | 'archived';
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  badge?: string; // e.g. "Bestseller", "Direct Dropship", "40% OFF"
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // Unique cart item ID (productId + variantId)
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  supplierCost?: number;
  quantity: number;
  subtotal: number;
  isDropshipped: boolean;
  supplierSku?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  total: number;
  totalProfit?: number; // Calculated seller profit
  status: OrderStatus;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  trackingNumber?: string;
  carrier?: string;
  dropshipDispatched?: boolean;
  dropshipDispatchDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  onlyDropshipped: boolean;
  onlyInStock: boolean;
  sellerStatusFilter: 'all' | 'published' | 'draft';
}

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

export interface DropshipPresetItem {
  id: string;
  title: string;
  description: string;
  category: Product['category'];
  images: string[];
  supplierName: string;
  supplierSku: string;
  supplierUrl: string;
  supplierCost: number;
  shippingCost: number;
  suggestedMarkup: number;
  estimatedDelivery: string;
  stock: number;
  variants: ProductVariant[];
  tags: string[];
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientProvider: 'gmail' | 'outlook' | 'hotmail' | 'yahoo' | 'icloud' | 'custom';
  subject: string;
  type: 'order_confirmation' | 'tracking_update' | 'owner_alert' | 'ai_transcript' | 'custom';
  orderId?: string;
  sentAt: string;
  status: 'delivered' | 'sent_via_gmail_api' | 'queued';
  previewHtml: string;
}

export interface EmailSettings {
  autoSendOrderConfirmation: boolean;
  autoSendTrackingUpdates: boolean;
  notifyStoreOwnerOnSale: boolean;
  connectedGmailAccount: string | null;
  defaultSenderName: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: string;
    label: string;
    payload?: any;
  };
  recommendedProductIds?: string[];
  functionExecuted?: {
    name: string;
    description: string;
    details?: string;
  };
  suggestedProducts?: string[];
  followUpSuggestions?: string[];
}

