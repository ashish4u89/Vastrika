# VASTRIKA — Premium Saree Commerce Platform & Retail Management Suite

A modern, scalable Indian saree commerce platform, progressive web application (PWA), and physical-store retail management system engineered for VASTRIKA (*"Elegance for Every You"*).

***

## User Review & Critical Decisions

> [!IMPORTANT]
> Since the initial clarification questions were skipped, we have adopted industry-standard, production-ready defaults aligned directly with the prompt specifications:
>
> 1. **Data Persistence & Backend Architecture**: Robust full-stack architecture with persistent local and browser-synced transactional storage (`localStorage` + state synchronization with indexed relational entities) and modular server-side payment/order verification endpoints (`/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`). Ready for seamless Firebase Firestore plug-in without schema rewriting.
> 2. **Role & POS Administration**: Instant multi-role switcher toolbar (`Owner / Admin`, `Store Manager`, `Billing Operator`, `Inventory Operator`, `Customer`) paired with PIN-authenticated POS access for store operators.
> 3. **Payment Gateway (Razorpay)**: Production-ready Razorpay Standard Checkout SDK flow operating in sandbox test mode with realistic signature hashing (`HMAC-SHA256`), idempotent webhook handling, and server-authoritative stock reservation.
> 4. **Pre-Seeded Catalog**: Full 15-collection catalog with authentic Indian saree fabrics (Kanjivaram Silk, Banarasi, Chanderi, Linen, Tussar, Georgette, Organza, Cotton Handloom) with realistic Indian Rupee prices and integer paise financial snapshots.

***

## 1. Overview & Core Concept

**VASTRIKA** is designed to serve working women, teachers, corporate professionals, everyday saree lovers, and wedding/festival shoppers with modern Indian elegance at accessible-to-mid-range price points.

The system delivers a unified single source of truth across three core interfaces:
1. **Customer Digital Storefront & Mobile PWA**: High-performance responsive shopping experience mirroring the approved reference design, featuring 15 curated collections, faceted filtering (fabric, occasion, color, price), live cart drawer, guest/account checkout, and Razorpay payments.
2. **Retail POS & Physical-Store Billing**: Rapid barcode/SKU search, real-time item addition, customer phone capture, tax breakdown (GST), payment mode selection (Cash, UPI, Card, Bank Transfer), instant receipt/invoice generation, and printable thermal/A4 invoices.
3. **Inventory & Executive Management Suite**: Bundle-to-piece intake (e.g. receiving two 6-piece bundles adds 12 pieces), reservation tracking, low-stock alerts, supplier purchase orders, and real-time P&L reporting (Gross Profit, COGS, Net Revenue, Margin %).

***

## 2. User Experience & Visual Design

### Reference Homepage Layout Reproduction
The homepage faithfully recreates the approved Vastrika visual layout:
- **A. Thin Maroon Promotional Bar**: Announcements, free shipping threshold (e.g., *"Free shipping on orders above ₹1,999 | Use code FESTIVE10 for 10% off"*), language/currency indicator.
- **B. Header**: Vastrika wordmark in editorial serif, brand tagline *"Elegance for Every You"*, debounced search bar with instant visual product suggestions, Account/Role menu, Wishlist badge count, and Cart badge with slide-out drawer trigger.
- **C. Categorized Navigation Bar**: Home, Sarees, Working Women, Office Wear, Festival Collection, Wedding Guest, New Arrivals, Bestsellers, Offers, and Quick Collections dropdown.
- **D. Hero Banner**: Elegant split composition with rich editorial imagery, brand headline *"Elegance for Every You"*, curated subtitle for working professionals, and primary CTA to explore the Working Women collection.
- **E. Featured Festival Sale Panel**: Curated seasonal spotlight with countdown context, promotional discount tags, and quick-add highlights.
- **F. Circular Category Shortcuts**: Visual circular icons for fast navigation across Silk, Cotton Handloom, Office Linen, Chiffon & Georgette, Festive Banarasi, and Daily Wear.
- **G. Three Promotional Banners**: Triple-card feature grid highlighting *Working Women*, *Festival Collection*, and *New Arrivals* with distinct editorial photography and direct routes.
- **H. Trust Strip**: 4-point reassurance grid: Free Express Delivery, 100% Authentic Handlooms, 7-Day Easy Returns, and Dedicated Customer Support.
- **I. Merchandising Sections**: Tabbed bestsellers, collection carousels, customer favorite sarees with live stock badges, quick-view modals, and price displays in ₹.
- **J. Comprehensive Footer**: Brand philosophy, verified customer service links, policy links (Shipping, Returns, Privacy, Terms), WhatsApp assistance link, store locator, and newsletter subscription form.

### Visual Identity & Theme Tokens
- **Primary Color**: Deep Maroon / Royal Burgundy (`#5E1324`, `#781D32`)
- **Background Canvas**: Warm Ivory / Crisp Cream (`#FAF7F2`, `#FDFBF7`, `#FFFFFF`)
- **Accent Color**: Muted Antique Gold (`#C5A059`, `#B38E44`)
- **Structural Neutrals**: Warm Sand Beige (`#EFE8DC`), Soft Charcoal (`#2A2523`), Muted Slate (`#6B6560`)
- **Typography**: 
  - *Headings & Display*: Editorial Serif (`Playfair Display`, `Cormorant Garamond`)
  - *Body Prose & UI*: Clean Geometric Sans (`Plus Jakarta Sans`, `DM Sans`)
  - *Financials & SKU Numbers*: Tabular Monospace (`JetBrains Mono`, `tabular-nums`)

***

## 3. Key Product Decisions & Trade-Offs

| Decision Area | Chosen Approach | Rationale & Trade-offs |
| :--- | :--- | :--- |
| **Unified Inventory Source** | Shared inventory ledger between Web Storefront and In-Store POS | Eliminates overselling; online checkouts temporarily reserve stock with a 15-minute lease, while POS immediate checkout finalizes instantly. |
| **Financial Representation** | Integer paise storage (₹1.00 = `100` paise) with line-item cost snapshots | Prevents floating-point rounding errors and preserves historical Gross Profit accuracy even when catalog prices are updated. |
| **Payment Verification** | Server-side signature validation (`orderId + paymentId + secret`) with idempotency key logging | Conforms to strict PCI/Razorpay standards; never trusts client-supplied payment success flags. |
| **Role-Based Access (RBAC)** | Five explicit roles (`Owner/Admin`, `Store Manager`, `Billing Operator`, `Inventory Operator`, `Customer`) | Ensures billing staff can generate receipts without seeing COGS/vendor margins, while inventory clerks can only adjust stock. |
| **Mobile Shopping & PWA** | Responsive touch-first UI + Web App Manifest + Service Worker install prompt | Fast home screen installability on Android/iOS without requiring app store approval, sharing the identical live inventory. |

***

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VASTRIKA UNIFIED CLIENT                         │
│                                                                        │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│   │  Customer Storefront│  │ Physical Store POS  │  │ Admin / Reports│ │
│   │  - Hero & Categories│  │ - Fast SKU Barcode  │  │ - Real-time P&L│ │
│   │  - Product Grid/PDP │  │ - Multi-tender Pay  │  │ - COGS vs Rev  │ │
│   │  - Cart & Razorpay  │  │ - Thermal Invoices  │  │ - Stock Audit  │ │
│   └──────────┬──────────┘  └──────────┬──────────┘  └────────┬───────┘ │
│              │                        │                      │         │
│              └────────────────────────┼──────────────────────┘         │
│                                       ▼                                │
│                   Unified State & Commerce Engine                      │
│            (Cart, Wishlist, Active Session, Role Context)              │
└───────────────────────────────────────┬────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND & LOGIC CONTROLLERS                       │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌─────────────────┐ │
│  │ Inventory Controller │  │ Payment Controller │  │ Order & Invoice │ │
│  │ - Bundle Conversion  │  │ - Create Order API │  │ - GST Breakdown │ │
│  │ - Stock Reservation  │  │ - HMAC Verification│  │ - Snapshot Cost  │ │
│  │ - Damaged / Returns  │  │ - Webhook Idempot. │  │ - A4/Thermal Doc│ │
│  └──────────┬───────────┘  └─────────┬──────────┘  └─────────┬───────┘ │
└─────────────┼────────────────────────┼───────────────────────┼─────────┘
              │                        │                       │
              ▼                        ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PERSISTENT DATA STORE                             │
│  - Products & Collections (15 Collections, Multi-tagging)              │
│  - Inventory Movements & Bundles (Audit Logged)                        │
│  - Orders, OrderItems, Invoices & Payments (Integer Paise)             │
│  - Suppliers & Purchase Orders (Cost Protected)                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Data Entities & Schema
- **`Product`**: `id`, `sku`, `name`, `slug`, `description`, `images`, `category`, `collections[]`, `fabric`, `color`, `lengthMeters`, `blousePiece` (Included/Unstitched), `careInstructions`, `supplierId`, `costPricePaise`, `sellingPricePaise`, `discountPercent`, `taxRatePercent` (5% Saree GST), `availableQty`, `reservedQty`, `status`.
- **`InventoryMovement`**: `id`, `productId`, `sku`, `type` (`PURCHASE_RECEIPT`, `ONLINE_SALE`, `POS_SALE`, `CUSTOMER_RETURN`, `SUPPLIER_RETURN`, `DAMAGE_WRITE_OFF`, `AUDIT_ADJUSTMENT`), `quantityDelta`, `bundleCount`, `piecesPerBundle`, `referenceId`, `performedBy`, `timestamp`.
- **`Order` / `Invoice`**: `id`, `orderNumber`, `source` (`ONLINE` / `STORE_POS`), `customerId`, `customerName`, `customerPhone`, `items[]` (`productId`, `sku`, `title`, `unitSellingPricePaise`, `unitCostPricePaise`, `qty`, `taxPaise`), `subtotalPaise`, `taxTotalPaise`, `discountTotalPaise`, `shippingPaise`, `totalPaise`, `paymentMethod` (`RAZORPAY`, `CASH`, `UPI`, `CARD`, `NETBANKING`), `paymentStatus` (`PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `REFUNDED`), `razorpayOrderId`, `razorpayPaymentId`, `createdAt`.
- **`Supplier` & `PurchaseOrder`**: `id`, `supplierName`, `contact`, `orders[]` with bundle breakdown.

***

## 5. Implementation Roadmap & Phases

### Phase 1: Brand System & Approved Reference Visual Layout
- Build the top promotional announcement bar with discount codes and free delivery banner.
- Build the 3-zone header with wordmark, search suggestions, role menu, and cart/wishlist indicators.
- Construct the primary category bar covering all 15 saree collections.
- Recreate the hero banner (*"Elegance for Every You"*), festival sale panel, circular category shortcuts, and triple promotional cards.
- Implement the 4-point trust strip and comprehensive editorial footer.

### Phase 2: Catalog, Product Grid & Rich PDP
- Pre-seed authentic saree catalog with high-fidelity imagery and complete fabric/blouse specifications.
- Build collection routes (`/collections/working-women`, `/collections/festival`, etc.) with filters (Price range, Fabric, Occasion, Color) and sorting.
- Build rich Product Detail Page (PDP) with sticky image gallery, fabric drape details, blouse-piece info, PIN-code delivery estimator, and real-time inventory count.

### Phase 3: Persistent Inventory & Bundle Management
- Implement the inventory ledger: bundle receipt calculation (e.g. $2 \times 6 = 12$ pieces).
- Create supplier management, purchase order recording, and stock movement audit log.
- Build damage write-off and return adjustment tools with role-restricted validation.

### Phase 4: Cart, Checkout, Stock Reservation & Razorpay Flow
- Persistent cart drawer with quantity steppers and coupon code application.
- Server-side stock verification before order initiation.
- Razorpay order creation (`/api/payments/create-order`), client-side checkout launch, and HMAC signature verification (`/api/payments/verify`).
- Stock reservation release timeout for abandoned checkouts.

### Phase 5: Retail POS & Physical Billing Module
- Barcode/SKU instant search with keyboard shortcuts.
- Real-time customer phone lookup, GST calculation, and multi-tender payment processing (Cash, UPI, Card).
- Instant printable thermal receipt and A4 GST tax invoice formatting.

### Phase 6: Executive Dashboard & Accounting Reports
- Real-time financial KPI cards: Today's Sales, Monthly Sales, COGS, Gross Profit, Gross Margin %, Average Order Value.
- Detailed report breakdowns: Product profitability, SKU performance, supplier expenditure, and inventory valuation.

### Phase 7: PWA, Mobile Optimization & Automated Test Suite
- PWA manifest, service worker registration, and in-app install banner with iOS Safari guidance.
- Execute the 15 required automated unit/integration test cases validating stock deduction, bundle math, profit formulas, signature verification, and RBAC protection.
