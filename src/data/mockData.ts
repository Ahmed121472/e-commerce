import { Product, Order, DropshipPresetItem } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Aura ANC Wireless Noise-Cancelling Headphones',
    subtitle: 'Studio-Grade Acoustic Architecture with 40h Battery Life',
    description: 'Immerse yourself in precision sound with titanium dynamic drivers, hybrid adaptive active noise cancellation, and plush memory foam earcups designed for all-day listening.',
    category: 'Audio',
    tags: ['Wireless', 'ANC', 'Hi-Fi', 'Bluetooth 5.3'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    price: 189.00,
    compareAtPrice: 249.00,
    costPrice: 62.00,
    isDropshipped: true,
    dropshipDetails: {
      supplierName: 'CJ Dropshipping Tech',
      supplierSku: 'CJ-AU-9921-MATTE',
      supplierUrl: 'https://cjdropshipping.com/product/aura-anc-hi-res-9921',
      supplierCost: 62.00,
      shippingCost: 8.50,
      markupPercentage: 168,
      estimatedDeliveryDays: '6-9 days (US/EU Direct Express)',
      autoFulfill: true
    },
    inventory: 48,
    status: 'published',
    rating: 4.9,
    reviewCount: 142,
    variants: [
      { id: 'var-1a', name: 'Matte Obsidian Black', priceOffset: 0, stock: 24, sku: 'AU-BLK' },
      { id: 'var-1b', name: 'Champagne Silver', priceOffset: 10, stock: 16, sku: 'AU-SLV' },
      { id: 'var-1c', name: 'Midnight Navy', priceOffset: 0, stock: 8, sku: 'AU-NVY' }
    ],
    badge: 'Direct Dropship',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'prod-2',
    title: 'Horizon Chrono Smart Health & GPS Watch',
    subtitle: 'Sapphire Crystal Display with Dual-Frequency Multi-GNSS',
    description: 'Constructed from aerospace-grade titanium and scratch-resistant sapphire crystal. Features 24/7 biometric tracking, blood oxygen monitoring, ECG sensors, and 14-day battery life.',
    category: 'Wearables',
    tags: ['Smartwatch', 'Titanium', 'Health', 'Waterproof 50M'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    price: 269.00,
    compareAtPrice: 320.00,
    costPrice: 94.00,
    isDropshipped: true,
    dropshipDetails: {
      supplierName: 'AliExpress Direct Express',
      supplierSku: 'ALI-EXP-HORIZON-46MM',
      supplierUrl: 'https://aliexpress.com/item/horizon-gps-titanium-watch',
      supplierCost: 94.00,
      shippingCost: 5.00,
      markupPercentage: 171,
      estimatedDeliveryDays: '7-12 days (YunExpress ePacket)',
      autoFulfill: true
    },
    inventory: 32,
    status: 'published',
    rating: 4.8,
    reviewCount: 98,
    variants: [
      { id: 'var-2a', name: '46mm Space Gray / Silicone', priceOffset: 0, stock: 18, sku: 'HOR-46-GRY' },
      { id: 'var-2b', name: '46mm Titanium / Leather Band', priceOffset: 30, stock: 14, sku: 'HOR-46-LTH' }
    ],
    badge: 'Bestseller',
    createdAt: '2026-08-10T12:00:00Z',
    updatedAt: '2026-08-22T09:15:00Z'
  },
  {
    id: 'prod-3',
    title: 'Lumina Ergonomic Magnetic Desk Light Bar',
    subtitle: 'Auto-Dimming Ambient Dual-Source Screen Bar for Eye Protection',
    description: 'Zero screen glare with asymmetric optical design. Features wireless rotary remote controller, dual ambient RGB backlight, and stepless color temperature adjustment from 2700K to 6500K.',
    category: 'Home Office',
    tags: ['Workspace', 'Desk Setup', 'Lighting', 'Ergonomic'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80'
    ],
    price: 89.00,
    compareAtPrice: 119.00,
    costPrice: 28.00,
    isDropshipped: true,
    dropshipDetails: {
      supplierName: 'CJ Dropshipping Warehouse',
      supplierSku: 'CJ-LUMINA-PRO-RGB',
      supplierUrl: 'https://cjdropshipping.com/product/lumina-desk-lightbar',
      supplierCost: 28.00,
      shippingCost: 6.20,
      markupPercentage: 160,
      estimatedDeliveryDays: '5-8 days (USPS Priority line)',
      autoFulfill: true
    },
    inventory: 64,
    status: 'published',
    rating: 4.7,
    reviewCount: 64,
    variants: [
      { id: 'var-3a', name: 'Matte Anodized Black', priceOffset: 0, stock: 40, sku: 'LUM-BLK' },
      { id: 'var-3b', name: 'Lunar Silver', priceOffset: 5, stock: 24, sku: 'LUM-SLV' }
    ],
    badge: 'Popular',
    createdAt: '2026-08-12T08:00:00Z',
    updatedAt: '2026-08-25T11:00:00Z'
  },
  {
    id: 'prod-4',
    title: 'Apex Machined Mechanical Keyboard (Hot-Swap 75%)',
    subtitle: 'Gasket-Mounted CNC Aluminum Chassis with South-Facing RGB',
    description: 'Precision CNC machined 6063 aluminum case with 5-layer sound dampening foam, factory lubed tactile switches, and PBT dye-sublimation gradient keycaps. Tri-mode connectivity (2.4G/BT/Type-C).',
    category: 'Electronics',
    tags: ['Mechanical Keyboard', 'Custom', 'Aluminum', 'Hot-Swap'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
    ],
    price: 159.00,
    compareAtPrice: 199.00,
    costPrice: 58.00,
    isDropshipped: false, // In-house / edited merchant inventory
    inventory: 19,
    status: 'published',
    rating: 5.0,
    reviewCount: 82,
    variants: [
      { id: 'var-4a', name: 'Pre-lubed Matcha Tactile Switches', priceOffset: 0, stock: 11, sku: 'APX-MTC' },
      { id: 'var-4b', name: 'Silent Glacier Linear Switches', priceOffset: 15, stock: 8, sku: 'APX-LIN' }
    ],
    badge: 'In-House Stock',
    createdAt: '2026-08-01T15:00:00Z',
    updatedAt: '2026-08-26T16:45:00Z'
  },
  {
    id: 'prod-5',
    title: 'Nomad RFID-Shielded Modular Cardholder Wallet',
    subtitle: 'Aerospace Grade 3K Carbon Fiber with Integrated Cash Band',
    description: 'Ultra-thin minimalist EDC wallet holding up to 12 cards without stretching. Military-grade RFID blocking shields against wireless theft. Includes quick-draw thumb trigger.',
    category: 'Accessories',
    tags: ['EDC', 'Minimalist', 'Carbon Fiber', 'RFID Protected'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
    ],
    price: 48.00,
    compareAtPrice: 65.00,
    costPrice: 11.50,
    isDropshipped: true,
    dropshipDetails: {
      supplierName: 'AliExpress Direct Merchant',
      supplierSku: 'ALI-NMD-WALLET-3K',
      supplierUrl: 'https://aliexpress.com/item/carbon-fiber-rfid-wallet',
      supplierCost: 11.50,
      shippingCost: 3.00,
      markupPercentage: 231,
      estimatedDeliveryDays: '7-10 days',
      autoFulfill: true
    },
    inventory: 85,
    status: 'published',
    rating: 4.6,
    reviewCount: 210,
    variants: [
      { id: 'var-5a', name: '3K Matte Carbon Weave', priceOffset: 0, stock: 50, sku: 'NMD-CRB' },
      { id: 'var-5b', name: 'Gunmetal Anodized Aluminum', priceOffset: -4, stock: 35, sku: 'NMD-ALU' }
    ],
    badge: 'Direct Dropship',
    createdAt: '2026-08-18T14:00:00Z',
    updatedAt: '2026-08-24T18:20:00Z'
  },
  {
    id: 'prod-6',
    title: 'Zenith 3-in-1 Foldable MagSafe Travel Stand',
    subtitle: 'Fast 15W Qi2 Certified Wireless Station for iPhone, Watch & Pods',
    description: 'Foldable into wallet size for effortless travel. Seamlessly charges phone, smartwatch, and earbuds simultaneously with weighted anti-slip zinc alloy base.',
    category: 'Electronics',
    tags: ['MagSafe', 'Wireless Charger', 'Travel', 'Qi2'],
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80'
    ],
    price: 69.00,
    compareAtPrice: 89.00,
    costPrice: 18.00,
    isDropshipped: true,
    dropshipDetails: {
      supplierName: 'Printful & CJ Hardware',
      supplierSku: 'CJ-MAG-FOLD-15W',
      supplierUrl: 'https://cjdropshipping.com/product/zenith-magsafe-travel-charger',
      supplierCost: 18.00,
      shippingCost: 4.50,
      markupPercentage: 206,
      estimatedDeliveryDays: '5-9 days',
      autoFulfill: true
    },
    inventory: 50,
    status: 'published',
    rating: 4.8,
    reviewCount: 77,
    variants: [
      { id: 'var-6a', name: 'Stealth Matte Black', priceOffset: 0, stock: 30, sku: 'ZN-BLK' },
      { id: 'var-6b', name: 'Alpine Pure White', priceOffset: 0, stock: 20, sku: 'ZN-WHT' }
    ],
    badge: 'Trending',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-27T10:00:00Z'
  }
];

export const DROPSHIP_CATALOG_PRESETS: DropshipPresetItem[] = [
  {
    id: 'preset-1',
    title: 'Prism Ambient Kinetic Sand Lamp with App Control',
    description: 'Hypnotic magnetic moving sand art combined with 16-million color dynamic ambient halo lighting. Controlled via smartphone app or touch sensor.',
    category: 'Lifestyle',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    supplierName: 'CJ Dropshipping Lifestyle',
    supplierSku: 'CJ-PRISM-SAND-RGB',
    supplierUrl: 'https://cjdropshipping.com/product/prism-kinetic-sand-lamp',
    supplierCost: 21.50,
    shippingCost: 6.00,
    suggestedMarkup: 150, // -> Retail: ~$59.00
    estimatedDelivery: '6-10 days Direct Line',
    stock: 120,
    variants: [
      { id: 'pv-1a', name: 'Deep Ocean Blue Sand', priceOffset: 0, stock: 60 },
      { id: 'pv-1b', name: 'Sahara Sunset Gold Sand', priceOffset: 5, stock: 60 }
    ],
    tags: ['Atmosphere', 'Desk Decor', 'Trending TikTok', 'LED']
  },
  {
    id: 'preset-2',
    title: 'AeroPulse Handheld High-Velocity Turbo Air Duster',
    description: '130,000 RPM brushless motor delivering 52m/s gale-force airflow. Perfect for cleaning electronics, camera gear, keyboard switches, and camping inflatables.',
    category: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    ],
    supplierName: 'AliExpress Premier Electronics',
    supplierSku: 'ALI-TURBO-BLAST-130K',
    supplierUrl: 'https://aliexpress.com/item/turbo-air-duster-brushless',
    supplierCost: 19.80,
    shippingCost: 4.20,
    suggestedMarkup: 160, // -> Retail: ~$54.00
    estimatedDelivery: '7-12 days ePacket',
    stock: 95,
    variants: [
      { id: 'pv-2a', name: 'Matte Carbon Gray', priceOffset: 0, stock: 50 },
      { id: 'pv-2b', name: 'Cyber Cyberpunk Orange', priceOffset: 3, stock: 45 }
    ],
    tags: ['Tech Gear', 'Cleaning', 'High Speed', 'Brushless']
  },
  {
    id: 'preset-3',
    title: 'Solace Thermal Smart Mug with Precision Temperature Control',
    description: 'Keeps your coffee or tea at your exact preferred drinking temperature (120°F - 145°F) for up to 3 hours on a single charge or all day on the charging coaster.',
    category: 'Home Office',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80'
    ],
    supplierName: 'CJ Dropshipping Home',
    supplierSku: 'CJ-MUG-SMART-TEMP',
    supplierUrl: 'https://cjdropshipping.com/product/solace-temp-controlled-mug',
    supplierCost: 32.00,
    shippingCost: 7.50,
    suggestedMarkup: 140, // -> Retail: ~$89.00
    estimatedDelivery: '5-8 days Express',
    stock: 60,
    variants: [
      { id: 'pv-3a', name: 'Matte Black 14oz', priceOffset: 0, stock: 35 },
      { id: 'pv-3b', name: 'Ceramic Ivory 14oz', priceOffset: 5, stock: 25 }
    ],
    tags: ['Coffee', 'Desk Tech', 'Smart Home', 'Luxury']
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9842',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.v@example.com',
    shippingAddress: {
      fullName: 'Marcus Vance',
      email: 'marcus.v@example.com',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-1',
        productTitle: 'Aura ANC Wireless Noise-Cancelling Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        variantId: 'var-1a',
        variantName: 'Matte Obsidian Black',
        unitPrice: 189.00,
        supplierCost: 62.00,
        quantity: 1,
        subtotal: 189.00,
        isDropshipped: true,
        supplierSku: 'CJ-AU-9921-MATTE'
      }
    ],
    subtotal: 189.00,
    shippingFee: 0,
    discount: 0,
    tax: 15.12,
    total: 204.12,
    totalProfit: 127.00,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'Apple Pay',
    dropshipDispatched: true,
    dropshipDispatchDate: '2026-08-26T14:15:00Z',
    trackingNumber: 'CJUS882941029US',
    carrier: 'CJ / USPS Direct',
    createdAt: '2026-08-26T13:40:00Z',
    updatedAt: '2026-08-26T14:15:00Z'
  },
  {
    id: 'ORD-9843',
    customerName: 'Sophia Lin',
    customerEmail: 'sophia.lin@example.com',
    shippingAddress: {
      fullName: 'Sophia Lin',
      email: 'sophia.lin@example.com',
      phone: '+1 (555) 890-1234',
      street: '1280 Sunset Boulevard',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90026',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-3',
        productTitle: 'Lumina Ergonomic Magnetic Desk Light Bar',
        productImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
        variantId: 'var-3a',
        variantName: 'Matte Anodized Black',
        unitPrice: 89.00,
        supplierCost: 28.00,
        quantity: 2,
        subtotal: 178.00,
        isDropshipped: true,
        supplierSku: 'CJ-LUMINA-PRO-RGB'
      },
      {
        productId: 'prod-5',
        productTitle: 'Nomad RFID-Shielded Modular Cardholder Wallet',
        productImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        variantId: 'var-5a',
        variantName: '3K Matte Carbon Weave',
        unitPrice: 48.00,
        supplierCost: 11.50,
        quantity: 1,
        subtotal: 48.00,
        isDropshipped: true,
        supplierSku: 'ALI-NMD-WALLET-3K'
      }
    ],
    subtotal: 226.00,
    shippingFee: 0,
    discount: 10.00,
    tax: 18.08,
    total: 234.08,
    totalProfit: 158.50,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card (Visa)',
    dropshipDispatched: false,
    createdAt: '2026-08-27T08:12:00Z',
    updatedAt: '2026-08-27T08:12:00Z'
  }
];
