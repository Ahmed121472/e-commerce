import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Product,
  CartItem,
  Order,
  UserRole,
  UserProfile,
  FilterState,
  NotificationToast,
  ProductVariant,
  ShippingAddress,
  DropshipDetails,
  STORE_OWNER_EMAIL
} from '../types';
import {
  subscribeToProducts,
  subscribeToOrders,
  syncProductToFirestore,
  removeProductFromFirestore,
  syncOrderToFirestore,
  updateOrderInFirestore,
  clearAllStoreData
} from '../lib/firestoreService';
import {
  onAuthChanged,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  updateUserRole,
  saveUserProfile,
  loginAsStoreOwner,
  getLocalSession,
  isUserStoreOwner
} from '../lib/authService';
import {
  sendOrderConfirmationEmail,
  sendTrackingUpdateEmail
} from '../lib/gmailService';

interface StoreContextType {
  // Auth & Profile
  currentUser: User | null;
  userProfile: UserProfile | null;
  isStoreOwner: boolean;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup' | 'owner';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'signin' | 'signup' | 'owner') => void;
  openAuthModal: (mode?: 'signin' | 'signup' | 'owner') => void;
  openOwnerAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, role?: UserRole, storeName?: string) => Promise<void>;
  signInWithGooglePopup: () => Promise<void>;
  loginOwnerMaster: (passOrPin?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;

  // Role & Mode
  role: UserRole;
  setRole: (role: UserRole) => void;
  isCustomerPreview: boolean;
  setIsCustomerPreview: (preview: boolean) => void;
  toggleSellerMode: () => void;

  // Cloud Firestore Status
  isFirestoreConnected: boolean;
  firestoreSyncStatus: 'synced' | 'syncing' | 'offline';

  // Products
  products: Product[];
  filteredProducts: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateProductInline: (productId: string, updates: Partial<Product>) => Promise<void>;
  toggleProductStatus: (productId: string) => Promise<void>;
  addProduct: (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  deleteProduct: (productId: string) => void;
  importDropshipProduct: (params: {
    title: string;
    subtitle?: string;
    description: string;
    category: Product['category'];
    images: string[];
    supplierName: string;
    supplierSku: string;
    supplierUrl: string;
    supplierCost: number;
    shippingCost: number;
    markupPercentage: number;
    estimatedDeliveryDays: string;
    variants: ProductVariant[];
    tags: string[];
  }) => Product;
  clearStoreData: () => Promise<void>;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, selectedVariant?: ProductVariant, quantity?: number) => void;
  updateCartItemQty: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Modals & Sheets
  selectedProductDetail: Product | null;
  setSelectedProductDetail: (product: Product | null) => void;
  isDropshipImportModalOpen: boolean;
  setIsDropshipImportModalOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  isOrderTrackingModalOpen: boolean;
  setIsOrderTrackingModalOpen: (open: boolean) => void;
  isCustomerPortalOpen: boolean;
  setIsCustomerPortalOpen: (open: boolean) => void;
  isSellerOrderHUDOpen: boolean;
  setIsSellerOrderHUDOpen: (open: boolean) => void;
  activeLookupOrderId: string | null;
  setActiveLookupOrderId: (id: string | null) => void;

  // Email & Notifications Center
  isEmailModalOpen: boolean;
  setIsEmailModalOpen: (open: boolean) => void;
  emailModalTargetOrderId: string | null;
  emailModalInitialRecipient: string | null;
  openEmailModal: (targetOrderId?: string, initialRecipient?: string) => void;
  closeEmailModal: () => void;

  // AI Assistant
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  aiInitialPrompt: string | null;
  openAIAssistant: (prompt?: string) => void;
  closeAIAssistant: () => void;

  // Orders & Fulfillment
  orders: Order[];
  createOrder: (address: ShippingAddress, paymentMethod: string, promoDiscount?: number) => Order;
  fulfillDropshipOrder: (orderId: string) => Promise<void>;
  updateOrderTracking: (orderId: string, trackingNumber: string, carrier: string, status?: Order['status']) => Promise<void>;
  pendingOrdersCount: number;
  totalSellerProfit: number;
  totalRevenue: number;

  // Toasts
  toasts: NotificationToast[];
  addToast: (title: string, message: string, type?: NotificationToast['type']) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_PRODUCTS_KEY = 'nova_products_clean_v2';
const LOCAL_ORDERS_KEY = 'nova_orders_clean_v2';
const LOCAL_CART_KEY = 'nova_cart_clean_v2';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth & Profile State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = getLocalSession();
    if (saved) return saved;
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'owner'>('signin');

  // Computed Store Owner Flag - Strictly only for sarn2008ahmed@gmail.com
  const isStoreOwner = Boolean(
    userProfile && (userProfile.isOwner === true || isUserStoreOwner(userProfile.email))
  );

  // Role State (synced with userProfile: only authenticated store owner can be seller)
  const [role, setRole] = useState<UserRole>(() => {
    const session = getLocalSession();
    if (session && isUserStoreOwner(session.email)) {
      return session.role || 'seller';
    }
    return 'customer';
  });
  const [isCustomerPreview, setIsCustomerPreview] = useState<boolean>(false);

  // Firestore connection states
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [firestoreSyncStatus, setFirestoreSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // 2. Clean Products State (No demo mock items)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // 3. Clean Orders State (No demo mock items)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CART_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Auth state listener
  useEffect(() => {
    const unsubAuth = onAuthChanged((user, profile) => {
      setCurrentUser(user);
      if (profile) {
        setUserProfile(profile);
        setRole(profile.role);
      }
      setIsAuthLoading(false);
    });

    return () => unsubAuth();
  }, []);

  // Firestore Real-Time Subscriptions for Products & Orders
  useEffect(() => {
    const unsubProducts = subscribeToProducts(
      (firestoreProducts) => {
        setProducts(firestoreProducts || []);
        try {
          localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(firestoreProducts || []));
        } catch {}
        setIsFirestoreConnected(true);
        setFirestoreSyncStatus('synced');
      },
      (err) => {
        console.warn('Firestore Products subscription error:', err);
        setIsFirestoreConnected(false);
        setFirestoreSyncStatus('offline');
      }
    );

    const unsubOrders = subscribeToOrders(
      (firestoreOrders) => {
        setOrders(firestoreOrders || []);
        try {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(firestoreOrders || []));
        } catch {}
        setIsFirestoreConnected(true);
        setFirestoreSyncStatus('synced');
      },
      (err) => {
        console.warn('Firestore Orders subscription error:', err);
        setIsFirestoreConnected(false);
        setFirestoreSyncStatus('offline');
      }
    );

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // 5. Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    minPrice: 0,
    maxPrice: 2000,
    sortBy: 'featured',
    onlyDropshipped: false,
    onlyInStock: false,
    sellerStatusFilter: 'all'
  });

  // 6. Modals and Navigation State
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isDropshipImportModalOpen, setIsDropshipImportModalOpen] = useState<boolean>(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState<boolean>(false);
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState<boolean>(false);
  const [isSellerOrderHUDOpen, setIsSellerOrderHUDOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeLookupOrderId, setActiveLookupOrderId] = useState<string | null>(null);

  // Email & Notifications Center State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailModalTargetOrderId, setEmailModalTargetOrderId] = useState<string | null>(null);
  const [emailModalInitialRecipient, setEmailModalInitialRecipient] = useState<string | null>(null);

  const openEmailModal = (targetOrderId?: string, initialRecipient?: string) => {
    setEmailModalTargetOrderId(targetOrderId || null);
    setEmailModalInitialRecipient(initialRecipient || null);
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailModalTargetOrderId(null);
    setEmailModalInitialRecipient(null);
  };

  // AI Assistant State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const openAIAssistant = (prompt?: string) => {
    if (prompt) {
      setAiInitialPrompt(prompt);
    }
    setIsAIAssistantOpen(true);
  };

  const closeAIAssistant = () => {
    setIsAIAssistantOpen(false);
    setAiInitialPrompt(null);
  };

  // 7. Toast Notifications
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const addToast = (title: string, message: string, type: NotificationToast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: NotificationToast = {
      id,
      title,
      message,
      type,
      timestamp: Date.now()
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Operations
  const openAuthModal = (mode: 'signin' | 'signup' | 'owner' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const openOwnerAuthModal = () => {
    setAuthMode('owner');
    setIsAuthModalOpen(true);
  };

  const signIn = async (email: string, pass: string) => {
    const { profile } = await signInWithEmail(email, pass);
    setUserProfile(profile);
    setRole(profile.role);
    if (profile.isOwner || profile.role === 'seller') {
      addToast('Store Owner Authenticated', `Welcome back, ${profile.displayName}! Seller Management unlocked.`, 'success');
    } else {
      addToast('Welcome Back!', `Signed in as Customer (${profile.displayName})`, 'success');
    }
  };

  const signUp = async (email: string, pass: string, name: string, _role?: UserRole, storeName?: string) => {
    const { profile } = await signUpWithEmail(email, pass, name, 'customer', storeName);
    setUserProfile(profile);
    setRole(profile.role);
    addToast('Account Created!', `Welcome to the store, ${profile.displayName}!`, 'success');
  };

  const signInWithGooglePopup = async () => {
    const { profile } = await signInWithGoogle('customer');
    setUserProfile(profile);
    setRole(profile.role);
    addToast('Signed In with Google', `Welcome back, ${profile.displayName}!`, 'success');
  };

  const loginOwnerMaster = async (customPin?: string) => {
    const { profile } = await loginAsStoreOwner(customPin);
    setUserProfile(profile);
    setRole('seller');
    setIsCustomerPreview(false);
    addToast('Store Owner Access Granted', `Logged in as exclusive seller (${STORE_OWNER_EMAIL})`, 'success');
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch {}
    setUserProfile(null);
    setCurrentUser(null);
    setRole('customer'); // default to customer when signed out
    setIsCustomerPreview(false);
    addToast('Signed Out', 'You have been logged out of your account.', 'info');
  };

  const switchRole = async (newRole: UserRole) => {
    if (newRole === 'seller' && !isStoreOwner) {
      addToast('Access Restricted', 'Only the verified Store Owner has seller privileges.', 'warning');
      openOwnerAuthModal();
      return;
    }
    setRole(newRole);
    if (userProfile && isStoreOwner) {
      const updated: UserProfile = { ...userProfile, role: newRole };
      setUserProfile(updated);
      if (currentUser) {
        try {
          await updateUserRole(currentUser.uid, newRole);
        } catch {}
      }
    }
    addToast('Mode Updated', `Viewing as ${newRole === 'seller' ? 'STORE OWNER / SELLER' : 'CUSTOMER'}`, 'info');
  };

  const toggleSellerMode = () => {
    if (!isStoreOwner) {
      openOwnerAuthModal();
      return;
    }
    const newRole = role === 'seller' ? 'customer' : 'seller';
    switchRole(newRole);
  };

  // Product Operations
  const updateProductInline = async (productId: string, updates: Partial<Product>) => {
    let updatedProduct: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          updatedProduct = updated;
          return updated;
        }
        return p;
      })
    );

    if (selectedProductDetail && selectedProductDetail.id === productId) {
      setSelectedProductDetail((prev) => (prev ? { ...prev, ...updates } : null));
    }

    addToast('Product Updated', 'Changes saved directly to the live catalog.', 'success');

    if (updatedProduct) {
      setFirestoreSyncStatus('syncing');
      try {
        await syncProductToFirestore(updatedProduct);
        setFirestoreSyncStatus('synced');
      } catch (err) {
        console.warn('Could not sync inline update to Firestore:', err);
        setFirestoreSyncStatus('offline');
      }
    }
  };

  const toggleProductStatus = async (productId: string) => {
    let targetProduct: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStatus = p.status === 'published' ? 'draft' : 'published';
          addToast(
            'Status Changed',
            `Product "${p.title.slice(0, 24)}..." is now ${nextStatus.toUpperCase()}`,
            nextStatus === 'published' ? 'success' : 'warning'
          );
          const updated: Product = { ...p, status: nextStatus, updatedAt: new Date().toISOString() };
          targetProduct = updated;
          return updated;
        }
        return p;
      })
    );

    if (targetProduct) {
      setFirestoreSyncStatus('syncing');
      try {
        await syncProductToFirestore(targetProduct);
        setFirestoreSyncStatus('synced');
      } catch (err) {
        console.warn('Could not sync status change to Firestore:', err);
        setFirestoreSyncStatus('offline');
      }
    }
  };

  const addProduct = (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...newProductData,
      id: 'prod_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('Item Created', `"${newProduct.title}" added to your live catalog.`, 'success');

    // Sync to Firestore
    setFirestoreSyncStatus('syncing');
    syncProductToFirestore(newProduct)
      .then(() => setFirestoreSyncStatus('synced'))
      .catch((err) => {
        console.warn('Could not save new product to Firestore:', err);
        setFirestoreSyncStatus('offline');
      });

    return newProduct;
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProductDetail?.id === productId) {
      setSelectedProductDetail(null);
    }
    addToast('Product Removed', 'The item has been deleted from the catalog.', 'warning');

    // Remove from Firestore
    setFirestoreSyncStatus('syncing');
    removeProductFromFirestore(productId)
      .then(() => setFirestoreSyncStatus('synced'))
      .catch((err) => {
        console.warn('Could not delete product from Firestore:', err);
        setFirestoreSyncStatus('offline');
      });
  };

  const importDropshipProduct = (params: {
    title: string;
    subtitle?: string;
    description: string;
    category: Product['category'];
    images: string[];
    supplierName: string;
    supplierSku: string;
    supplierUrl: string;
    supplierCost: number;
    shippingCost: number;
    markupPercentage: number;
    estimatedDeliveryDays: string;
    variants: ProductVariant[];
    tags: string[];
  }): Product => {
    const totalCost = params.supplierCost + params.shippingCost;
    const markupFactor = 1 + params.markupPercentage / 100;
    const calculatedPrice = Math.round(totalCost * markupFactor * 100) / 100;
    const calculatedCompareAt = Math.round(calculatedPrice * 1.35 * 100) / 100;

    const dropshipDetails: DropshipDetails = {
      supplierName: params.supplierName,
      supplierSku: params.supplierSku,
      supplierUrl: params.supplierUrl,
      supplierCost: params.supplierCost,
      shippingCost: params.shippingCost,
      markupPercentage: params.markupPercentage,
      estimatedDeliveryDays: params.estimatedDeliveryDays,
      autoFulfill: true
    };

    const newProduct: Product = {
      id: 'ds_' + Math.random().toString(36).substring(2, 9),
      title: params.title,
      subtitle: params.subtitle || `Sourced directly from ${params.supplierName}`,
      description: params.description,
      category: params.category,
      tags: [...params.tags, 'dropship', params.supplierName.toLowerCase()],
      images: params.images,
      price: calculatedPrice,
      compareAtPrice: calculatedCompareAt,
      costPrice: params.supplierCost,
      isDropshipped: true,
      dropshipDetails,
      inventory: 999, // Dropship virtual warehouse
      status: 'published',
      rating: 4.8,
      reviewCount: Math.floor(Math.random() * 40) + 12,
      variants: params.variants.length > 0 ? params.variants : [
        { id: 'v1', name: 'Standard Edition', priceOffset: 0, stock: 999 }
      ],
      badge: 'Direct Supplier',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProducts((prev) => [newProduct, ...prev]);
    addToast(
      'Dropship Product Imported!',
      `"${newProduct.title.slice(0, 30)}..." published to Firestore with $${(calculatedPrice - params.supplierCost).toFixed(2)} profit margin.`,
      'success'
    );

    // Sync to Firestore
    setFirestoreSyncStatus('syncing');
    syncProductToFirestore(newProduct)
      .then(() => setFirestoreSyncStatus('synced'))
      .catch((err) => {
        console.warn('Could not sync dropship product to Firestore:', err);
        setFirestoreSyncStatus('offline');
      });

    return newProduct;
  };

  const clearStoreData = async () => {
    setProducts([]);
    setOrders([]);
    setCart([]);
    localStorage.removeItem(LOCAL_PRODUCTS_KEY);
    localStorage.removeItem(LOCAL_ORDERS_KEY);
    localStorage.removeItem(LOCAL_CART_KEY);
    addToast('Store Cleared', 'All products and orders have been removed for a clean slate.', 'info');

    setFirestoreSyncStatus('syncing');
    try {
      await clearAllStoreData();
      setFirestoreSyncStatus('synced');
    } catch (err) {
      console.warn('Error clearing Firestore:', err);
      setFirestoreSyncStatus('offline');
    }
  };

  // Cart Operations
  const addToCart = (product: Product, selectedVariant?: ProductVariant, quantity: number = 1) => {
    const variantId = selectedVariant?.id || 'default';
    const cartItemId = `${product.id}_${variantId}`;
    const unitPrice = product.price + (selectedVariant?.priceOffset || 0);

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product,
            selectedVariant,
            quantity,
            unitPrice
          }
        ];
      }
    });

    setIsCartOpen(true);
    addToast('Added to Bag', `${quantity}x "${product.title}" added to your cart.`, 'success');
  };

  const updateCartItemQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    addToast('Item Removed', 'Product removed from your shopping bag.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Orders Operations
  const createOrder = (address: ShippingAddress, paymentMethod: string, promoDiscount: number = 0): Order => {
    const shippingFee = cartSubtotal > 150 ? 0 : 9.99;
    const tax = Math.round(cartSubtotal * 0.075 * 100) / 100;
    const total = Math.max(0, cartSubtotal + shippingFee + tax - promoDiscount);

    // Calculate seller profit
    const totalProfit = cart.reduce((sum, item) => {
      const cost = item.product.costPrice || item.product.price * 0.55;
      const marginPerUnit = item.unitPrice - cost;
      return sum + marginPerUnit * item.quantity;
    }, 0);

    const hasDropshipItems = cart.some((item) => item.product.isDropshipped);

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      customerName: address.fullName,
      customerEmail: address.email,
      shippingAddress: address,
      items: cart.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.images[0],
        variantId: item.selectedVariant?.id,
        variantName: item.selectedVariant?.name,
        unitPrice: item.unitPrice,
        supplierCost: item.product.costPrice,
        quantity: item.quantity,
        subtotal: item.unitPrice * item.quantity,
        isDropshipped: item.product.isDropshipped,
        supplierSku: item.product.dropshipDetails?.supplierSku
      })),
      subtotal: cartSubtotal,
      shippingFee,
      discount: promoDiscount,
      tax,
      total,
      totalProfit: Math.round(totalProfit * 100) / 100,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod,
      dropshipDispatched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Persist order to Firestore
    setFirestoreSyncStatus('syncing');
    syncOrderToFirestore(newOrder)
      .then(() => setFirestoreSyncStatus('synced'))
      .catch((err) => {
        console.warn('Could not save new order to Firestore:', err);
        setFirestoreSyncStatus('offline');
      });

    // Automated Email Confirmation Dispatch (Gmail, Outlook/Hotmail, Yahoo, Custom)
    if (address.email) {
      sendOrderConfirmationEmail(newOrder, address.email, address.fullName)
        .then((res) => {
          if (res.success) {
            addToast('Email Receipt Dispatched', `Confirmation sent to ${address.email} (${res.provider?.toUpperCase()})`, 'info');
          }
        })
        .catch(() => {});
    }

    // Sync to Express backend API
    try {
      fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: address.fullName,
          customerEmail: address.email,
          shippingAddress: address,
          items: newOrder.items,
          subtotal: cartSubtotal,
          shippingFee,
          discount: promoDiscount,
          tax,
          total,
          totalProfit: newOrder.totalProfit,
          paymentMethod
        })
      }).catch(() => {});
    } catch {}

    return newOrder;
  };

  const fulfillDropshipOrder = async (orderId: string) => {
    const autoTracking = 'DS-' + Math.random().toString(36).substring(2, 9).toUpperCase() + 'US';
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            dropshipDispatched: true,
            dropshipDispatchDate: new Date().toISOString(),
            status: 'processing',
            trackingNumber: autoTracking,
            carrier: 'Supplier Direct / USPS Express',
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );

    addToast(
      'Supplier Webhook Triggered!',
      `Order ${orderId} dispatched to dropship supplier. Auto-tracking: ${autoTracking}`,
      'success'
    );

    // Auto-email tracking update if customer has email
    if (targetOrder?.shippingAddress?.email) {
      sendTrackingUpdateEmail(
        orderId,
        autoTracking,
        'Supplier Direct / USPS Express',
        targetOrder.shippingAddress.email,
        targetOrder.shippingAddress.fullName
      ).then((res) => {
        if (res.success) {
          addToast('Tracking Email Sent', `Courier tracking update sent to ${targetOrder.shippingAddress.email}`, 'info');
        }
      }).catch(() => {});
    }

    // Notify backend
    try {
      fetch(`/api/orders/${orderId}/dropship-dispatch`, { method: 'POST' }).catch(() => {});
    } catch {}

    // Sync to Firestore
    setFirestoreSyncStatus('syncing');
    try {
      await updateOrderInFirestore(orderId, {
        dropshipDispatched: true,
        dropshipDispatchDate: new Date().toISOString(),
        status: 'processing',
        trackingNumber: autoTracking,
        carrier: 'Supplier Direct / USPS Express'
      });
      setFirestoreSyncStatus('synced');
    } catch (err) {
      console.warn('Could not sync order fulfillment to Firestore:', err);
      setFirestoreSyncStatus('offline');
    }
  };

  const updateOrderTracking = async (
    orderId: string,
    trackingNumber: string,
    carrier: string,
    status: Order['status'] = 'shipped'
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            trackingNumber,
            carrier,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );

    addToast('Tracking Updated', `Order ${orderId} marked as ${status.toUpperCase()} (${trackingNumber})`, 'success');

    // Auto-email tracking update if customer has email
    if (targetOrder?.shippingAddress?.email) {
      sendTrackingUpdateEmail(
        orderId,
        trackingNumber,
        carrier,
        targetOrder.shippingAddress.email,
        targetOrder.shippingAddress.fullName
      ).then((res) => {
        if (res.success) {
          addToast('Tracking Email Sent', `Dispatched delivery email to ${targetOrder.shippingAddress.email}`, 'info');
        }
      }).catch(() => {});
    }

    // Sync to Firestore
    setFirestoreSyncStatus('syncing');
    try {
      await updateOrderInFirestore(orderId, {
        trackingNumber,
        carrier,
        status
      });
      setFirestoreSyncStatus('synced');
    } catch (err) {
      console.warn('Could not sync order tracking to Firestore:', err);
      setFirestoreSyncStatus('offline');
    }
  };

  // Aggregated Stats
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const totalSellerProfit = orders.reduce((sum, o) => sum + (o.totalProfit || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Filtered Products computation
  const isViewingAsCustomer = role === 'customer' || isCustomerPreview;

  const filteredProducts = products.filter((p) => {
    // In customer view, exclude drafts and archived items
    if (isViewingAsCustomer && p.status !== 'published') {
      return false;
    }

    // Seller status filter
    if (!isViewingAsCustomer && filters.sellerStatusFilter !== 'all') {
      if (p.status !== filters.sellerStatusFilter) return false;
    }

    // Category filter
    if (filters.category !== 'All' && p.category !== filters.category) {
      return false;
    }

    // Dropship-only filter
    if (filters.onlyDropshipped && !p.isDropshipped) {
      return false;
    }

    // In-Stock filter
    if (filters.onlyInStock && p.inventory <= 0) {
      return false;
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      const matchSupplier = p.dropshipDetails?.supplierName.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchTags && !matchSupplier) {
        return false;
      }
    }

    // Price range
    if (p.price < filters.minPrice || p.price > filters.maxPrice) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return 0; // featured default
  });

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        userProfile,
        isStoreOwner,
        isAuthLoading,
        isAuthModalOpen,
        authMode,
        setIsAuthModalOpen,
        setAuthMode,
        openAuthModal,
        openOwnerAuthModal,
        signIn,
        signUp,
        signInWithGooglePopup,
        loginOwnerMaster,
        logout,
        switchRole,

        role,
        setRole,
        isCustomerPreview,
        setIsCustomerPreview,
        toggleSellerMode,

        isFirestoreConnected,
        firestoreSyncStatus,

        products,
        filteredProducts,
        filters,
        setFilters,
        updateProductInline,
        toggleProductStatus,
        addProduct,
        deleteProduct,
        importDropshipProduct,
        clearStoreData,

        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,

        selectedProductDetail,
        setSelectedProductDetail,
        isDropshipImportModalOpen,
        setIsDropshipImportModalOpen,
        isAddProductModalOpen,
        setIsAddProductModalOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        isOrderTrackingModalOpen,
        setIsOrderTrackingModalOpen,
        isCustomerPortalOpen,
        setIsCustomerPortalOpen,
        isSellerOrderHUDOpen,
        setIsSellerOrderHUDOpen,
        activeLookupOrderId,
        setActiveLookupOrderId,

        isEmailModalOpen,
        setIsEmailModalOpen,
        emailModalTargetOrderId,
        emailModalInitialRecipient,
        openEmailModal,
        closeEmailModal,

        isAIAssistantOpen,
        setIsAIAssistantOpen,
        aiInitialPrompt,
        openAIAssistant,
        closeAIAssistant,

        orders,
        createOrder,
        fulfillDropshipOrder,
        updateOrderTracking,
        pendingOrdersCount,
        totalSellerProfit,
        totalRevenue,

        toasts,
        addToast,
        dismissToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
