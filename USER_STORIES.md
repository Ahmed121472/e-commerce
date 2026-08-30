# User Stories & Acceptance Criteria

This document defines the functional user stories and acceptance criteria for both the **Customer** and **Seller / Merchant** journeys in the Dual-Journey In-Situ E-Commerce Platform.

---

## Story Index

- **Epic 1: Customer Shopping Journey**
  - [US-C01: Product Discovery & Filtering](#us-c01-product-discovery--filtering)
  - [US-C02: Product Detail & Variant Selection](#us-c02-product-detail--variant-selection)
  - [US-C03: Cart Management & Instant Calculation](#us-c03-cart-management--instant-calculation)
  - [US-C04: Guest & Express Checkout](#us-c04-guest--express-checkout)
  - [US-C05: Order Confirmation & Self-Service Tracking](#us-c05-order-confirmation--self-service-tracking)

- **Epic 2: Seller In-Situ Management Journey (No Admin Panel)**
  - [US-S01: In-Context Product Editing](#us-s01-in-context-product-editing)
  - [US-S02: On-Canvas Product Creation](#us-s02-on-canvas-product-creation)
  - [US-S03: Instant Publishing & Visibility Toggle](#us-s03-instant-publishing--visibility-toggle)
  - [US-S04: Dropship Sourcing & Margin Calculator](#us-s04-dropship-sourcing--margin-calculator)
  - [US-S05: In-Place Order Fulfillment & Status Dispatch](#us-s05-in-place-order-fulfillment--status-dispatch)
  - [US-S06: Instant Customer Preview Toggle](#us-s06-instant-customer-preview-toggle)

---

## Epic 1: Customer Shopping Journey

### US-C01: Product Discovery & Filtering
* **Priority**: Must Have (P0)
* **As a** customer visiting the store,
* **I want to** browse, search, and filter the product catalog by category, price range, and tags,
* **So that** I can quickly find the items I am interested in purchasing.

#### Acceptance Criteria
1. **Given** I am on the storefront page, **When** I type a keyword into the search bar, **Then** the product grid should update in real-time to display matching items.
2. **Given** the category navigation bar, **When** I click a category tag (e.g. "Electronics", "Apparel"), **Then** only items assigned to that category should be rendered.
3. **Given** multiple active filters, **When** no products match the query, **Then** a friendly "No products found" state with a clear-filters button should appear.

---

### US-C02: Product Detail & Variant Selection
* **Priority**: Must Have (P0)
* **As a** customer,
* **I want to** click on a product to view high-resolution imagery, detailed descriptions, and selectable options (size, color),
* **So that** I can evaluate the item before buying.

#### Acceptance Criteria
1. **Given** a product card, **When** I click it, **Then** an interactive product detail view should open with image gallery navigation and variant chips.
2. **Given** selectable variants with price differentials, **When** I switch variants, **Then** the displayed price and stock indicator should immediately update.
3. **Given** an out-of-stock variant, **When** I view it, **Then** the "Add to Cart" button should be disabled and show "Out of Stock".

---

### US-C03: Cart Management & Instant Calculation
* **Priority**: Must Have (P0)
* **As a** customer,
* **I want to** add items to a slide-out cart drawer and adjust quantities,
* **So that** I can manage my purchase without losing my place on the shopping page.

#### Acceptance Criteria
1. **Given** a product view, **When** I click "Add to Cart", **Then** the cart drawer should smoothly slide open showing the newly added item, updated subtotal, and badge counter.
2. **Given** items in the cart drawer, **When** I modify quantity or remove an item, **Then** line totals, tax estimates, and total amount must recalculate instantly.
3. **Given** an active cart session, **When** I refresh or reload the page, **Then** my cart contents should remain intact.

---

### US-C04: Guest & Express Checkout
* **Priority**: Must Have (P0)
* **As a** customer,
* **I want to** complete my order with shipping and payment info without being forced to create an account,
* **So that** I have a fast, frictionless checkout experience.

#### Acceptance Criteria
1. **Given** items in the cart, **When** I click "Proceed to Checkout", **Then** a clean multi-step checkout form should open requesting contact, shipping address, and payment details.
2. **Given** invalid or missing input in required fields, **When** I attempt to submit, **Then** clear validation cues should highlight the exact fields requiring correction.
3. **Given** valid checkout submission, **When** payment is verified, **Then** an order record is created and an order confirmation screen is displayed.

---

### US-C05: Order Confirmation & Self-Service Tracking
* **Priority**: Should Have (P1)
* **As a** customer who placed an order,
* **I want to** see an itemized receipt and lookup the shipping status using my Order ID,
* **So that** I know my purchase is confirmed and can monitor delivery.

#### Acceptance Criteria
1. **Given** a successful order completion, **When** the confirmation view renders, **Then** it must display the unique Order ID (e.g. `#ORD-4920`), estimated delivery timeframe, and printable receipt.
2. **Given** the order lookup modal, **When** I enter my Order ID and email address, **Then** the system should display the current stage (`Pending`, `Processing`, `Shipped`, or `Delivered`) and tracking number if available.

---

## Epic 2: Seller In-Situ Management Journey (No Admin Panel)

### US-S01: In-Context Product Editing
* **Priority**: Must Have (P0)
* **As an** authorized seller on the live website,
* **I want to** click directly on product titles, prices, descriptions, and images to edit them on the canvas,
* **So that** I do not have to switch to an external back-office admin dashboard.

#### Acceptance Criteria
1. **Given** seller authentication is active, **When** I hover over or click a product on the storefront, **Then** visual edit handles and inline editable inputs should activate.
2. **Given** inline modifications to pricing, inventory, or description, **When** I press "Save", **Then** the product record updates immediately with an optimistic UI update and server persistence.
3. **Given** a non-authenticated customer viewing the same page, **When** they look at the product, **Then** they must only see the finalized customer view with zero seller UI controls.

---

### US-S02: On-Canvas Product Creation
* **Priority**: Must Have (P0)
* **As a** seller,
* **I want to** add a new product directly from the live product grid via an "Add Product" action card,
* **So that** I can expand my catalog in real-time while maintaining visual context.

#### Acceptance Criteria
1. **Given** seller mode is active, **When** I scroll to the product grid, **Then** an intuitive "+ Add New Item" card should be visible as the first or last slot.
2. **Given** clicking the "+ Add New Item" card, **When** the creation modal opens, **Then** I can choose between "Manual Creation" and "Dropship Supplier Import".
3. **Given** manual creation form submission, **When** saved, **Then** the new product instantly renders within the live grid.

---

### US-S03: Instant Publishing & Visibility Toggle
* **Priority**: Must Have (P0)
* **As a** seller,
* **I want to** toggle a product's visibility between "Published", "Draft", and "Archived" with one click,
* **So that** I can control what customers see without deleting items.

#### Acceptance Criteria
1. **Given** a product card in seller mode, **When** I toggle the status switch to "Draft", **Then** the item should display a "Draft (Hidden from Customers)" badge in seller mode and disappear completely in customer mode.
2. **Given** out-of-stock items, **When** inventory reaches 0, **Then** the system should automatically flag the item as "Sold Out".

---

### US-S04: Dropship Sourcing & Margin Calculator
* **Priority**: Must Have (P0)
* **As a** seller,
* **I want to** paste a dropshipping supplier item URL or ID and apply a markup percentage rule,
* **So that** I can import supplier products and guarantee my profit margins automatically.

#### Acceptance Criteria
1. **Given** the Dropship Importer modal, **When** I provide a supplier link/SKU, **Then** the tool should auto-populate product specifications, supplier cost price, and default image assets.
2. **Given** an imported base supplier cost (e.g. $15.00), **When** I adjust the profit margin slider (e.g. 50%), **Then** the tool should automatically calculate and set the customer retail price ($22.50 + shipping buffer).
3. **Given** an imported dropshipped item, **When** it is saved to the store, **Then** it should record supplier metadata internally for automated fulfillment while showing clean branding to customers.

---

### US-S05: In-Place Order Fulfillment & Status Dispatch
* **Priority**: Must Have (P0)
* **As a** seller,
* **I want to** view customer orders in a floating or docked HUD on the live site and trigger fulfillment with one click,
* **So that** I can process orders rapidly without logging into an admin panel.

#### Acceptance Criteria
1. **Given** new incoming orders, **When** seller mode is active, **Then** a discrete badge on the seller toolbar should indicate the number of pending orders.
2. **Given** clicking the seller HUD, **When** the order sheet opens, **Then** I can see all itemized customer purchases with dropship supplier tags.
3. **Given** a dropshipped item in an order, **When** I click "Dispatch to Supplier", **Then** the system should simulate/forward the order to the supplier API and transition order status to "Processing/Shipped".
4. **Given** a custom item, **When** I input a carrier tracking number and click "Mark Shipped", **Then** the status updates and the customer can view the tracking code.

---

### US-S06: Instant Customer Preview Toggle
* **Priority**: Should Have (P1)
* **As a** seller,
* **I want to** toggle into "Customer Preview Mode" with a single click,
* **So that** I can verify exactly what prospective buyers experience without logging out.

#### Acceptance Criteria
1. **Given** seller mode is active, **When** I click the "Preview as Customer" toggle in the header, **Then** all seller edit controls, badges, and HUDs should hide instantly.
2. **Given** customer preview mode, **When** I click "Exit Preview", **Then** full seller editing capabilities should resume without requiring re-authentication.
