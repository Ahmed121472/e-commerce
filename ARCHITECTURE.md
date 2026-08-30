# System Architecture & Diagrams

This document details the architectural blueprints, data flows, component structures, and state management models for the **Dual-Journey In-Situ E-Commerce Platform**.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client ["Client Browser (Single Unified Application)"]
        subgraph RoleContext ["Role & Auth Context"]
            AuthEngine["Auth & Session Manager"]
            ModeSwitch["View Mode: Customer vs. Seller HUD"]
        end

        subgraph CustomerUI ["Customer Journey Interface"]
            CatalogView["Product Catalog & Filters"]
            ProductDetail["Product Showcase & Variants"]
            CartDrawer["Persistent Cart & Summary"]
            CheckoutModal["Multi-Step Checkout"]
            OrderTracker["Customer Order Tracking"]
        end

        subgraph SellerUI ["In-Situ Seller Controls"]
            InlineEditor["Live WYSIWYG Product Editor"]
            DropshipModal["Dropship Supplier Importer"]
            MarginCalc["Margin & Pricing Engine"]
            OrderHUD["In-Place Order & Dispatch HUD"]
            PublishToggle["Direct Publish / Draft Switch"]
        end
    end

    subgraph Backend ["Backend API Layer (Express / Node.js)"]
        APIRouter["API Gateway & Route Handler"]
        AuthMiddleware["Role & Token Verification"]
        ProductService["Product Catalog Service"]
        DropshipService["Dropship Supplier Parser / Webhook"]
        OrderService["Order & Payment Processing"]
    end

    subgraph DataStorage ["Data & External Services"]
        DB[(Product & Order Database)]
        SupplierAPI["Dropship Suppliers (AliExpress / CJ / Printful)"]
        PaymentGateway["Payment Processing Gateway"]
    end

    ModeSwitch --> CustomerUI
    ModeSwitch --> SellerUI
    
    CustomerUI -->|Read Catalog / Create Orders| APIRouter
    SellerUI -->|Direct Mutations / Sourcing| APIRouter
    
    APIRouter --> AuthMiddleware
    AuthMiddleware --> ProductService
    AuthMiddleware --> DropshipService
    AuthMiddleware --> OrderService
    
    ProductService --> DB
    OrderService --> DB
    OrderService --> PaymentGateway
    DropshipService --> SupplierAPI
```

---

## 2. In-Situ UI Component Hierarchy

The UI structure avoids detached routing by wrapping live components in role-aware operational decorators.

```
App Root
├── RoleAuthProvider
├── StorefrontHeader
│   ├── Brand & Search Bar
│   ├── Category Navigation
│   ├── Cart Trigger Badge
│   └── Seller Mode Toggle / Profile Status
├── Main Storefront Canvas
│   ├── Banner / Featured Collection
│   ├── Filter & Sort Toolbar
│   ├── Product Grid (Dynamic Render)
│   │   ├── Customer Product Card (Hover zoom, Quick Add, Variant Picker)
│   │   ├── [Seller Mode] Inline Edit Overlay (Title, Price, Stock, Publish Status)
│   │   └── [Seller Mode] "Add New / Dropship Import" Action Card
├── Slide-out Panels & Overlays
│   ├── Product Detail Modal (With Customer Selector & Seller In-Place Edit)
│   ├── Cart & Checkout Drawer
│   ├── Customer Order Confirmation & Receipt View
│   ├── [Seller Mode] Dropship Import & Markup Config Modal
│   └── [Seller Mode] In-Place Order & Dispatch Management HUD
└── Storefront Footer
```

---

## 3. Dual-Journey Role-Based State Flow

```mermaid
stateDiagram-v2
    [*] --> Guest_Customer

    state "Customer Journey" as CustomerFlow {
        Guest_Customer --> BrowsingCatalog: Search & Filter
        BrowsingCatalog --> InspectingProduct: Select Product / Variant
        InspectingProduct --> AddingToCart: Add to Cart
        AddingToCart --> CartDrawer: Open Cart
        CartDrawer --> CheckoutFlow: Proceed to Checkout
        CheckoutFlow --> OrderPlaced: Submit Payment
        OrderPlaced --> TrackingOrder: View Receipt & Status
    }

    state "Seller Journey (In-Situ)" as SellerFlow {
        Guest_Customer --> Authenticated_Seller: Unlock Seller Mode
        Authenticated_Seller --> LiveEditing: Click on Product Card / Modal
        LiveEditing --> UpdatedProduct: Save Changes Instantly
        
        Authenticated_Seller --> DropshipImport: Open Import Tool
        DropshipImport --> MarginCalculation: Set Base Cost & Markup %
        MarginCalculation --> CatalogSynced: Publish to Live Grid
        
        Authenticated_Seller --> OrderDispatchHUD: Open Seller HUD
        OrderDispatchHUD --> FulfillOrder: Assign Tracking / Trigger Supplier Webhook
    }

    Authenticated_Seller --> Guest_Customer: Switch to Customer Preview
```

---

## 4. Dropshipping Ingestion & Pricing Calculation Pipeline

When an authorized seller imports a dropshipped product, the ingestion pipeline automatically computes retail prices and margins based on configurable formula rules.

```mermaid
sequenceDiagram
    autonumber
    actor Seller as Seller / Merchant
    participant UI as In-Situ Dropship Modal
    participant Backend as Dropship Service
    participant Supplier as Supplier API / Source
    participant Catalog as Product Store

    Seller->>UI: Enter Supplier URL or Product ID & Base Margin (e.g., 45%)
    UI->>Backend: POST /api/dropship/fetch (Source URL)
    Backend->>Supplier: Scrape / Query Product Metadata & Cost
    Supplier-->>Backend: Return Raw Title, Images, Variants, Supplier Cost ($12.00)
    Backend-->>UI: Return Ingested Product Draft
    
    Note over UI: Dynamic Formula:<br/>Retail Price = Supplier Cost × (1 + Margin%) + Shipping Buffer<br/>e.g., $12.00 × 1.45 + $2.50 = $19.90
    
    UI->>UI: Seller previews markup, adjusts description, selects variants
    Seller->>UI: Click "Publish to Storefront"
    UI->>Backend: POST /api/products (Product Data + Dropship Flag + Supplier Ref)
    Backend->>Catalog: Persist New Product Document
    Catalog-->>UI: Live Item Added
    UI-->>Seller: Product immediately visible on storefront grid
```

---

## 5. Order Processing & Fulfillment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Seller
    participant Storefront as Live Storefront
    participant OrderService as Order Service
    participant Supplier as Dropship Supplier / Carrier

    Customer->>Storefront: Add items to cart & submit checkout
    Storefront->>OrderService: POST /api/orders (Items, Shipping, Payment)
    OrderService-->>Storefront: Return Order Confirmation (ID #ORD-8821)
    Storefront-->>Customer: Render Order Confirmation Receipt

    Note over OrderService,Seller: Order triggers real-time notification badge on Seller HUD

    Seller->>Storefront: Opens Seller HUD on live site
    Storefront->>OrderService: GET /api/orders
    OrderService-->>Storefront: Itemized Orders with Supplier References
    
    alt Dropshipped Product
        Seller->>Storefront: Click "1-Click Dispatch to Supplier"
        Storefront->>OrderService: POST /api/orders/ORD-8821/fulfill
        OrderService->>Supplier: Forward Shipping Payload & Auto-Order
        Supplier-->>OrderService: Acknowledge Fulfillment & Tracking Code
    else Custom / In-House Product
        Seller->>Storefront: Manually Enter Tracking Number
        Storefront->>OrderService: POST /api/orders/ORD-8821/tracking
    end

    OrderService-->>Storefront: Update Order Status -> 'Shipped'
    Customer->>Storefront: Check Order Status via Lookup -> 'In Transit'
```

---

## 6. Data Model & Schema Structure

```
+-------------------------------------------------------------------+
|                            Product                                |
+-------------------------------------------------------------------+
| id: string (UUID)                                                 |
| title: string                                                     |
| description: string (Markdown supported)                          |
| category: string                                                  |
| tags: string[]                                                    |
| images: string[]                                                  |
| price: number                                                     |
| compareAtPrice: number | null                                     |
| costPrice: number (Seller visible only)                           |
| isDropshipped: boolean                                            |
| dropshipDetails: {                                                |
|   supplierName: string,                                           |
|   supplierSku: string,                                            |
|   supplierUrl: string,                                            |
|   markupPercentage: number                                        |
| } | null                                                          |
| inventory: number                                                 |
| status: "published" | "draft" | "archived"                        |
| variants: [                                                       |
|   { id: string, name: string, priceOffset: number, stock: number }|
| ]                                                                 |
| createdAt: timestamp                                              |
| updatedAt: timestamp                                              |
+-------------------------------------------------------------------+
                                  | 1
                                  | 
                                  | N
+-------------------------------------------------------------------+
|                           OrderItem                               |
+-------------------------------------------------------------------+
| productId: string (Ref Product)                                   |
| productTitle: string                                              |
| variantId: string | null                                          |
| variantName: string | null                                        |
| unitPrice: number                                                 |
| quantity: number                                                  |
| subtotal: number                                                  |
| isDropshipped: boolean                                            |
| supplierSku: string | null                                        |
+-------------------------------------------------------------------+
                                  | N
                                  |
                                  | 1
+-------------------------------------------------------------------+
|                             Order                                 |
+-------------------------------------------------------------------+
| id: string (e.g. "ORD-9281")                                      |
| customerEmail: string                                             |
| customerName: string                                              |
| shippingAddress: {                                                |
|   street: string, city: string, state: string, zip: string, country|
| }                                                                 |
| items: OrderItem[]                                                |
| pricing: {                                                        |
|   subtotal: number, shipping: number, tax: number, total: number   |
| }                                                                 |
| status: "pending" | "processing" | "shipped" | "delivered"        |
| trackingNumber: string | null                                     |
| fulfillmentMethod: "manual" | "dropship_auto"                     |
| createdAt: timestamp                                              |
+-------------------------------------------------------------------+
```
