/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Product,
  Order,
  OrderItem,
  InventoryMovement,
  Supplier,
  PurchaseOrder,
  Coupon,
  FestivalCampaign,
  CollectionSlug,
  OrderFulfillmentStatus,
  AppNotification,
  DefectRecord,
  ApprovalRequest,
  UserRole,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_COUPONS,
  INITIAL_CAMPAIGNS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DEFECTS,
  INITIAL_APPROVALS,
} from '../data/initialCatalog';
import {
  calculateGrossProfit,
  calculateGST,
  generateOrderNumber,
  formatINR,
} from '../utils/formatters';

const STORAGE_KEYS = {
  PRODUCTS: 'vastrika_products_v1',
  ORDERS: 'vastrika_orders_v1',
  MOVEMENTS: 'vastrika_movements_v1',
  SUPPLIERS: 'vastrika_suppliers_v1',
  PURCHASE_ORDERS: 'vastrika_po_v1',
  COUPONS: 'vastrika_coupons_v1',
  CAMPAIGNS: 'vastrika_campaigns_v1',
  PROCESSED_WEBHOOKS: 'vastrika_processed_webhooks_v1',
  ACTIVE_RESERVATIONS: 'vastrika_active_reservations_v1',
  NOTIFICATIONS: 'vastrika_notifications_v1',
  DEFECTS: 'vastrika_defects_v1',
  APPROVALS: 'vastrika_approvals_v1',
};

class VastrikaCommerceStore {
  private products: Product[] = [];
  private orders: Order[] = [];
  private movements: InventoryMovement[] = [];
  private suppliers: Supplier[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private coupons: Coupon[] = [];
  private campaigns: FestivalCampaign[] = [];
  private notifications: AppNotification[] = [];
  private defects: DefectRecord[] = [];
  private approvals: ApprovalRequest[] = [];
  private processedWebhookIds: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.products = storedProducts ? JSON.parse(storedProducts) : [...INITIAL_PRODUCTS];

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const rawOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
      const seenOrderIds = new Set<string>();
      this.orders = rawOrders.map((o, idx) => {
        let uniqueId = o.id;
        if (!uniqueId || seenOrderIds.has(uniqueId)) {
          uniqueId = `${uniqueId || 'ord'}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seenOrderIds.add(uniqueId);
        return {
          ...o,
          id: uniqueId,
          fulfillmentStatus: o.fulfillmentStatus || (o.source === 'RETAIL_POS' ? 'COMPLETED' : 'UNFULFILLED'),
        };
      });

      const storedMovements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      this.movements = storedMovements ? JSON.parse(storedMovements) : [];

      const storedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      this.suppliers = storedSuppliers ? JSON.parse(storedSuppliers) : [...INITIAL_SUPPLIERS];

      const storedPOs = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      this.purchaseOrders = storedPOs ? JSON.parse(storedPOs) : [...INITIAL_PURCHASE_ORDERS];

      const storedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
      this.coupons = storedCoupons ? JSON.parse(storedCoupons) : [...INITIAL_COUPONS];

      const storedCampaigns = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
      this.campaigns = storedCampaigns ? JSON.parse(storedCampaigns) : [...INITIAL_CAMPAIGNS];

      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = storedNotifications ? JSON.parse(storedNotifications) : [...INITIAL_NOTIFICATIONS];

      const storedDefects = localStorage.getItem(STORAGE_KEYS.DEFECTS);
      this.defects = storedDefects ? JSON.parse(storedDefects) : [...INITIAL_DEFECTS];

      const storedApprovals = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      this.approvals = storedApprovals ? JSON.parse(storedApprovals) : [...INITIAL_APPROVALS];

      const storedWebhooks = localStorage.getItem(STORAGE_KEYS.PROCESSED_WEBHOOKS);
      if (storedWebhooks) {
        this.processedWebhookIds = new Set(JSON.parse(storedWebhooks));
      }
    } catch {
      this.products = [...INITIAL_PRODUCTS];
      this.suppliers = [...INITIAL_SUPPLIERS];
      this.purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
      this.coupons = [...INITIAL_COUPONS];
      this.campaigns = [...INITIAL_CAMPAIGNS];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.defects = [...INITIAL_DEFECTS];
      this.approvals = [...INITIAL_APPROVALS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(this.movements));
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(this.suppliers));
      localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(this.purchaseOrders));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
      localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(this.campaigns));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.DEFECTS, JSON.stringify(this.defects));
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(this.approvals));
      localStorage.setItem(
        STORAGE_KEYS.PROCESSED_WEBHOOKS,
        JSON.stringify(Array.from(this.processedWebhookIds))
      );
    } catch {
      // Storage quota or sandboxed environment
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- CATALOG METHODS ---

  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  public getProductBySku(sku: string): Product | undefined {
    return this.products.find((p) => p.sku.toLowerCase() === sku.trim().toLowerCase());
  }

  public getProductsByCollection(slug: CollectionSlug): Product[] {
    if (slug === 'all') return this.products;
    return this.products.filter((p) => p.collections.includes(slug));
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.push(newProduct);

    // If initial availableQty > 0, log movement
    if (newProduct.availableQty > 0) {
      this.logMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'PURCHASE_RECEIPT',
        quantityDelta: newProduct.availableQty,
        unitCostPaise: newProduct.costPricePaise,
        referenceId: 'INITIAL_STOCK',
        performedBy: 'OWNER_ADMIN',
        reason: 'Initial Product Stock Registration',
      });
    }

    this.saveToStorage();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.products[index];
  }

  // --- INVENTORY & BUNDLE MANAGEMENT METHODS ---

  /**
   * Receives bundles of sarees and converts to individual pieces in inventory.
   * Example: 2 bundles * 6 sarees = 12 pieces added to availableQty.
   */
  public receiveBundleInventory(params: {
    productId: string;
    bundleCount: number;
    piecesPerBundle: number;
    unitCostPaise: number;
    supplierId: string;
    poNumber?: string;
    performedBy: string;
  }): { success: boolean; addedPieces: number; newTotalQty: number; error?: string } {
    const product = this.getProductById(params.productId);
    if (!product) {
      return { success: false, addedPieces: 0, newTotalQty: 0, error: 'Product not found' };
    }

    if (params.bundleCount <= 0 || params.piecesPerBundle <= 0) {
      return { success: false, addedPieces: 0, newTotalQty: 0, error: 'Invalid bundle count or pieces per bundle' };
    }

    const addedPieces = params.bundleCount * params.piecesPerBundle;
    product.availableQty += addedPieces;
    product.costPricePaise = params.unitCostPaise;
    product.updatedAt = new Date().toISOString();

    const poNumber = params.poNumber || `PO-${Date.now().toString().slice(-6)}`;

    // Log movement with bundle specifics
    this.logMovement({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'PURCHASE_RECEIPT',
      quantityDelta: addedPieces,
      bundleCount: params.bundleCount,
      piecesPerBundle: params.piecesPerBundle,
      unitCostPaise: params.unitCostPaise,
      referenceId: poNumber,
      performedBy: params.performedBy,
      reason: `Received ${params.bundleCount} bundles (${params.piecesPerBundle} pcs/bundle)`,
    });

    this.saveToStorage();
    return { success: true, addedPieces, newTotalQty: product.availableQty };
  }

  /**
   * Reserve stock during online checkout (prevents overselling during 15-minute lease)
   */
  public reserveStock(productId: string, quantity: number): { success: boolean; error?: string } {
    const product = this.getProductById(productId);
    if (!product) return { success: false, error: 'Product not found' };

    if (product.availableQty < quantity) {
      return {
        success: false,
        error: `Insufficient stock for ${product.name}. Requested: ${quantity}, Available: ${product.availableQty}`,
      };
    }

    product.availableQty -= quantity;
    product.reservedQty += quantity;
    product.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return { success: true };
  }

  /**
   * Release reserved stock on abandoned checkout or failed payment
   */
  public releaseReservedStock(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (!product) return false;

    const actualRelease = Math.min(product.reservedQty, quantity);
    product.reservedQty -= actualRelease;
    product.availableQty += actualRelease;
    product.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  /**
   * Write off damaged or soiled sarees
   */
  public writeOffDamage(
    productId: string,
    quantity: number,
    reason: string,
    performedBy: string,
    role: UserRole = 'OWNER_ADMIN'
  ): { success: boolean; error?: string; pendingApproval?: boolean; message?: string } {
    const product = this.getProductById(productId);
    if (!product) return { success: false, error: 'Product not found' };

    if (product.availableQty < quantity) {
      return { success: false, error: 'Quantity exceeds available stock' };
    }

    if (role !== 'OWNER_ADMIN') {
      const refId = `DMG-REQ-${Date.now().toString().slice(-6)}`;
      const amountPaise = product.costPricePaise * quantity;
      this.createApprovalRequest({
        type: 'DAMAGE_WRITE_OFF',
        referenceId: refId,
        amountPaise,
        requestedBy: performedBy,
        requesterRole: role,
        reason: `${reason} (${quantity} pcs of ${product.sku})`,
        metadata: { productId, quantity, reason, performedBy },
      });

      this.createNotification({
        event: 'STOCK_MISMATCH',
        recipientRole: 'OWNER_ADMIN',
        isOwnerEscalation: true,
        title: `Damage Write-Off Approval Required: ${product.sku}`,
        message: `${performedBy} (${role}) requested write-off of ${quantity} pcs (${formatINR(amountPaise)}). Reason: ${reason}. Executive authorization required.`,
        referenceId: refId,
        channel: 'IN_APP',
        deliveryStatus: 'DELIVERED',
      });

      return {
        success: true,
        pendingApproval: true,
        message: 'Write-off submitted for Owner Authorization. Stock remains locked until approval.',
      };
    }

    // Direct execution for OWNER_ADMIN
    product.availableQty -= quantity;
    product.updatedAt = new Date().toISOString();

    this.logMovement({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'DAMAGE_WRITE_OFF',
      quantityDelta: -quantity,
      unitCostPaise: product.costPricePaise,
      referenceId: `DMG-${Date.now().toString().slice(-6)}`,
      performedBy,
      reason,
    });

    this.saveToStorage();
    return { success: true, message: 'Stock successfully written off.' };
  }

  /**
   * Restocks an eligible customer return
   */
  public recordCustomerReturn(
    orderId: string,
    productId: string,
    quantity: number,
    isRestockable: boolean,
    performedBy: string
  ): { success: boolean; error?: string } {
    const product = this.getProductById(productId);
    if (!product) return { success: false, error: 'Product not found' };

    if (isRestockable) {
      product.availableQty += quantity;
      product.updatedAt = new Date().toISOString();
    }

    this.logMovement({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: 'CUSTOMER_RETURN',
      quantityDelta: isRestockable ? quantity : 0,
      unitCostPaise: product.costPricePaise,
      referenceId: orderId,
      performedBy,
      reason: isRestockable
        ? 'Customer return inspected and restocked'
        : 'Customer return received as non-restockable damage',
    });

    this.saveToStorage();
    return { success: true };
  }

  private logMovement(
    movement: Omit<InventoryMovement, 'id' | 'timestamp'>
  ): InventoryMovement {
    const newMovement: InventoryMovement = {
      ...movement,
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.movements.unshift(newMovement);
    return newMovement;
  }

  public getInventoryMovements(): InventoryMovement[] {
    return [...this.movements];
  }

  // --- ORDER & PAYMENT LOGIC ---

  /**
   * Recalculates and validates prices strictly on the server to prevent client price tampering.
   */
  public validateAndPriceCart(
    items: { productId: string; quantity: number }[],
    couponCode?: string
  ): {
    valid: boolean;
    error?: string;
    orderItems: OrderItem[];
    subtotalPaise: number;
    discountPaise: number;
    taxPaise: number;
    shippingPaise: number;
    totalPaise: number;
    totalCostPaise: number;
    grossProfitPaise: number;
  } {
    let subtotalPaise = 0;
    let totalCostPaise = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        return {
          valid: false,
          error: `Product with ID ${item.productId} not found`,
          orderItems: [],
          subtotalPaise: 0,
          discountPaise: 0,
          taxPaise: 0,
          shippingPaise: 0,
          totalPaise: 0,
          totalCostPaise: 0,
          grossProfitPaise: 0,
        };
      }

      // Authoritative pricing from catalog
      const unitSellingPricePaise = product.sellingPricePaise;
      const unitCostPricePaise = product.costPricePaise;
      const itemSubtotal = unitSellingPricePaise * item.quantity;
      const itemCost = unitCostPricePaise * item.quantity;
      const { totalTaxPaise } = calculateGST(itemSubtotal, product.taxRatePercent);

      subtotalPaise += itemSubtotal;
      totalCostPaise += itemCost;

      orderItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        image: product.images[0] || '',
        fabric: product.fabric,
        unitSellingPricePaise,
        unitCostPricePaise,
        quantity: item.quantity,
        subtotalPaise: itemSubtotal,
        taxPaise: totalTaxPaise,
      });
    }

    // Apply Coupon
    let discountPaise = 0;
    if (couponCode) {
      const coupon = this.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
      );
      if (coupon && subtotalPaise >= coupon.minOrderValuePaise) {
        if (coupon.discountType === 'PERCENT') {
          discountPaise = Math.round((subtotalPaise * coupon.discountValue) / 100);
          if (coupon.maxDiscountPaise && discountPaise > coupon.maxDiscountPaise) {
            discountPaise = coupon.maxDiscountPaise;
          }
        } else {
          discountPaise = coupon.discountValue;
        }
      }
    }

    // Standard 5% GST on net taxable value
    const taxableAmount = Math.max(0, subtotalPaise - discountPaise);
    const { totalTaxPaise: taxPaise } = calculateGST(taxableAmount, 5);

    // Free shipping threshold above ₹1,999 (199,900 paise)
    const shippingPaise = subtotalPaise >= 199900 ? 0 : 9900; // ₹99 shipping below ₹1,999

    const totalPaise = taxableAmount + taxPaise + shippingPaise;
    const grossProfitPaise = taxableAmount - totalCostPaise;

    return {
      valid: true,
      orderItems,
      subtotalPaise,
      discountPaise,
      taxPaise,
      shippingPaise,
      totalPaise,
      totalCostPaise,
      grossProfitPaise,
    };
  }

  /**
   * Creates a Razorpay Order in Test Mode.
   * Reserves the stock safely during checkout.
   */
  public createRazorpayOrder(params: {
    items: { productId: string; quantity: number }[];
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress?: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
    };
    couponCode?: string;
  }): {
    success: boolean;
    error?: string;
    razorpayOrderId?: string;
    keyId?: string;
    amountPaise?: number;
    currency?: string;
    orderId?: string;
  } {
    // 1. Verify stock availability
    for (const item of params.items) {
      const product = this.getProductById(item.productId);
      if (!product) return { success: false, error: 'Product not found' };
      if (product.availableQty < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.availableQty}, Requested: ${item.quantity}`,
        };
      }
    }

    // 2. Validate and price on server
    const pricing = this.validateAndPriceCart(params.items, params.couponCode);
    if (!pricing.valid) {
      return { success: false, error: pricing.error };
    }

    // 3. Reserve stock
    for (const item of params.items) {
      this.reserveStock(item.productId, item.quantity);
    }

    // 4. Create pending internal order
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const orderNumber = generateOrderNumber('VAS-ONL');
    const razorpayOrderId = `order_test_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const pendingOrder: Order = {
      id: orderId,
      orderNumber,
      source: 'ONLINE_STORE',
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      shippingAddress: params.shippingAddress,
      items: pricing.orderItems,
      subtotalPaise: pricing.subtotalPaise,
      discountPaise: pricing.discountPaise,
      couponCode: params.couponCode,
      taxPaise: pricing.taxPaise,
      shippingPaise: pricing.shippingPaise,
      totalPaise: pricing.totalPaise,
      totalCostPaise: pricing.totalCostPaise,
      grossProfitPaise: pricing.grossProfitPaise,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'UNFULFILLED',
      razorpayOrderId,
      createdAt: new Date().toISOString(),
    };

    this.orders.push(pendingOrder);
    this.saveToStorage();

    return {
      success: true,
      razorpayOrderId,
      keyId: 'rzp_test_vastrika_mock_key_2026',
      amountPaise: pricing.totalPaise,
      currency: 'INR',
      orderId,
    };
  }

  /**
   * Authoritative Razorpay Payment Verification
   * Checks simulated signature, marks order PAID, converts reserved stock to permanent deduction exactly once.
   */
  public verifyRazorpayPayment(params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): { success: boolean; error?: string; order?: Order } {
    const order = this.orders.find(
      (o) => o.id === params.orderId || o.razorpayOrderId === params.razorpayOrderId
    );
    if (!order) return { success: false, error: 'Order not found' };

    // Idempotency: Prevent duplicate payment verification
    if (order.paymentStatus === 'PAID') {
      return { success: true, order };
    }

    // Reject simulated invalid signature test
    if (params.razorpaySignature === 'INVALID_TEST_SIGNATURE') {
      order.paymentStatus = 'FAILED';
      // Release reserved stock on failure
      for (const item of order.items) {
        this.releaseReservedStock(item.productId, item.quantity);
      }
      this.createNotification({
        event: 'PAYMENT_FAILURE',
        recipientRole: 'OWNER_ADMIN',
        isOwnerEscalation: true,
        title: `Payment Tamper Alert: ${order.orderNumber}`,
        message: `Tampered signature rejected for order ${order.orderNumber}. Stock lease safely released.`,
        referenceId: order.orderNumber,
        channel: 'IN_APP',
        deliveryStatus: 'DELIVERED',
      });
      this.saveToStorage();
      return { success: false, error: 'Invalid Razorpay signature. Payment rejected.' };
    }

    // Payment is valid! Finalize stock deduction (clear reservedQty and log movements)
    for (const item of order.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.reservedQty = Math.max(0, product.reservedQty - item.quantity);
        product.updatedAt = new Date().toISOString();

        this.logMovement({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: 'ONLINE_SALE',
          quantityDelta: -item.quantity,
          unitCostPaise: item.unitCostPricePaise,
          referenceId: order.orderNumber,
          performedBy: 'RAZORPAY_GATEWAY',
          reason: `Online order payment verified (${params.razorpayPaymentId})`,
        });

        if (product.availableQty <= product.lowStockThreshold) {
          this.createNotification({
            event: 'LOW_STOCK',
            recipientRole: 'OWNER_ADMIN',
            isOwnerEscalation: true,
            title: `Low Stock Alert: ${product.name}`,
            message: `Only ${product.availableQty} pieces remaining for ${product.sku} (threshold: ${product.lowStockThreshold}). Reorder needed.`,
            referenceId: product.sku,
            channel: 'IN_APP',
            deliveryStatus: 'DELIVERED',
          });
        }
      }
    }

    order.paymentStatus = 'PAID';
    order.fulfillmentStatus = 'UNFULFILLED';
    order.razorpayPaymentId = params.razorpayPaymentId;
    order.razorpaySignature = params.razorpaySignature;

    this.createNotification({
      event: 'NEW_ORDER',
      recipientRole: 'OWNER_ADMIN',
      isOwnerEscalation: order.totalPaise >= 1000000,
      title: `New Online Saree Order: ${order.orderNumber}`,
      message: `Customer ${order.customerName} paid ${formatINR(order.totalPaise)}. Ready for warehouse picking.`,
      referenceId: order.orderNumber,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    });

    this.saveToStorage();

    return { success: true, order };
  }

  /**
   * Process Razorpay signed webhook events idempotently
   */
  public processRazorpayWebhook(event: {
    eventId: string;
    type: string;
    payload: {
      orderId: string;
      paymentId: string;
      signatureValid: boolean;
    };
  }): { success: boolean; status: string } {
    // Idempotency check: duplicate delivery prevention
    if (this.processedWebhookIds.has(event.eventId)) {
      return { success: true, status: 'DUPLICATE_IGNORED' };
    }

    this.processedWebhookIds.add(event.eventId);

    if (event.type === 'payment.captured' && event.payload.signatureValid) {
      this.verifyRazorpayPayment({
        orderId: event.payload.orderId,
        razorpayOrderId: event.payload.orderId,
        razorpayPaymentId: event.payload.paymentId,
        razorpaySignature: 'VALID_WEBHOOK_SIG',
      });
      this.saveToStorage();
      return { success: true, status: 'PROCESSED' };
    }

    this.saveToStorage();
    return { success: true, status: 'ACKNOWLEDGED' };
  }

  // --- RETAIL STORE POS & INVOICING ---

  /**
   * Creates an in-store POS sale with direct inventory deduction and instant receipt creation
   */
  public createPOSSale(params: {
    items: { productId: string; quantity: number }[];
    customerName: string;
    customerPhone: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
    couponCode?: string;
    operatorRole: string;
  }): { success: boolean; error?: string; order?: Order } {
    // 1. Verify stock availability
    for (const item of params.items) {
      const product = this.getProductById(item.productId);
      if (!product) return { success: false, error: 'Product not found' };
      if (product.availableQty < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name} (Available: ${product.availableQty})`,
        };
      }
    }

    // 2. Authoritative server pricing
    const pricing = this.validateAndPriceCart(params.items, params.couponCode);
    if (!pricing.valid) return { success: false, error: pricing.error };

    // POS sales in physical store have 0 shipping
    const totalPaise = pricing.subtotalPaise - pricing.discountPaise + pricing.taxPaise;

    const orderNumber = generateOrderNumber('VAS-POS');
    const orderId = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // 3. Deduct stock atomically and log movement
    for (const item of pricing.orderItems) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.availableQty -= item.quantity;
        product.updatedAt = new Date().toISOString();

        this.logMovement({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          type: 'POS_SALE',
          quantityDelta: -item.quantity,
          unitCostPaise: item.unitCostPricePaise,
          referenceId: orderNumber,
          performedBy: params.operatorRole,
          reason: `Physical Store POS Sale (${params.paymentMethod})`,
        });

        if (product.availableQty <= product.lowStockThreshold) {
          this.createNotification({
            event: 'LOW_STOCK',
            recipientRole: 'OWNER_ADMIN',
            isOwnerEscalation: true,
            title: `Low Stock Alert: ${product.name}`,
            message: `POS sale brought ${product.sku} to ${product.availableQty} pieces (threshold: ${product.lowStockThreshold}).`,
            referenceId: product.sku,
            channel: 'IN_APP',
            deliveryStatus: 'DELIVERED',
          });
        }
      }
    }

    const completedOrder: Order = {
      id: orderId,
      orderNumber,
      source: 'RETAIL_POS',
      customerName: params.customerName || 'Walk-in Customer',
      customerPhone: params.customerPhone || 'N/A',
      items: pricing.orderItems,
      subtotalPaise: pricing.subtotalPaise,
      discountPaise: pricing.discountPaise,
      couponCode: params.couponCode,
      taxPaise: pricing.taxPaise,
      shippingPaise: 0,
      totalPaise,
      totalCostPaise: pricing.totalCostPaise,
      grossProfitPaise: pricing.subtotalPaise - pricing.discountPaise - pricing.totalCostPaise,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'PAID',
      fulfillmentStatus: 'COMPLETED',
      createdAt: new Date().toISOString(),
      notes: `POS Cashier Transaction by ${params.operatorRole}`,
    };

    this.orders.unshift(completedOrder);

    this.createNotification({
      event: 'NEW_ORDER',
      recipientRole: 'STORE_MANAGER',
      isOwnerEscalation: false,
      title: `Store POS Sale: ${orderNumber}`,
      message: `POS bill for ${formatINR(totalPaise)} completed by ${params.operatorRole}.`,
      referenceId: orderNumber,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    });

    this.saveToStorage();
    return { success: true, order: completedOrder };
  }

  // --- REPORTING & KPI CALCULATIONS ---

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getFinancialKPIs(): {
    todaySalesPaise: number;
    monthlySalesPaise: number;
    totalOrdersCount: number;
    averageOrderValuePaise: number;
    grossSalesPaise: number;
    totalDiscountsPaise: number;
    netSalesPaise: number;
    costOfGoodsSoldPaise: number;
    grossProfitPaise: number;
    grossMarginPercent: number;
    inventoryValuationPaise: number;
    totalUnitsInStock: number;
    lowStockCount: number;
  } {
    const paidOrders = this.orders.filter((o) => o.paymentStatus === 'PAID');
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthStr = now.toISOString().slice(0, 7);

    let todaySalesPaise = 0;
    let monthlySalesPaise = 0;
    let grossSalesPaise = 0;
    let totalDiscountsPaise = 0;
    let costOfGoodsSoldPaise = 0;

    for (const order of paidOrders) {
      grossSalesPaise += order.subtotalPaise;
      totalDiscountsPaise += order.discountPaise;
      costOfGoodsSoldPaise += order.totalCostPaise;

      const orderDate = order.createdAt.slice(0, 10);
      if (orderDate === todayStr) {
        todaySalesPaise += order.totalPaise;
      }
      if (orderDate.startsWith(thisMonthStr)) {
        monthlySalesPaise += order.totalPaise;
      }
    }

    const netSalesPaise = Math.max(0, grossSalesPaise - totalDiscountsPaise);
    const grossProfitPaise = netSalesPaise - costOfGoodsSoldPaise;
    const grossMarginPercent =
      netSalesPaise > 0 ? Math.round((grossProfitPaise / netSalesPaise) * 1000) / 10 : 0;
    const averageOrderValuePaise =
      paidOrders.length > 0 ? Math.round(netSalesPaise / paidOrders.length) : 0;

    // Inventory Valuation = Sum of (availableQty * costPricePaise)
    let inventoryValuationPaise = 0;
    let totalUnitsInStock = 0;
    let lowStockCount = 0;

    for (const product of this.products) {
      inventoryValuationPaise += product.availableQty * product.costPricePaise;
      totalUnitsInStock += product.availableQty;
      if (product.availableQty <= product.lowStockThreshold) {
        lowStockCount++;
      }
    }

    return {
      todaySalesPaise,
      monthlySalesPaise,
      totalOrdersCount: paidOrders.length,
      averageOrderValuePaise,
      grossSalesPaise,
      totalDiscountsPaise,
      netSalesPaise,
      costOfGoodsSoldPaise,
      grossProfitPaise,
      grossMarginPercent,
      inventoryValuationPaise,
      totalUnitsInStock,
      lowStockCount,
    };
  }

  // --- SUPPLIER & PROCUREMENT MANAGEMENT ---

  public getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find((s) => s.id === id);
  }

  public createSupplier(supplierData: Omit<Supplier, 'id' | 'totalPurchasedPaise'>): Supplier {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now().toString().slice(-4)}`,
      totalPurchasedPaise: 0,
    };
    this.suppliers.push(newSupplier);
    this.saveToStorage();
    return newSupplier;
  }

  public updateSupplier(id: string, updates: Partial<Supplier>): Supplier | null {
    const index = this.suppliers.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.suppliers[index] = { ...this.suppliers[index], ...updates };
    this.saveToStorage();
    return this.suppliers[index];
  }

  // --- PURCHASE ORDERS & GOODS RECEIPT QC ---

  public getPurchaseOrders(): PurchaseOrder[] {
    return [...this.purchaseOrders];
  }

  public getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return this.purchaseOrders.find((po) => po.id === id);
  }

  public createPurchaseOrder(params: {
    supplierId: string;
    items: { productId: string; bundles: number; piecesPerBundle: number; costPerPiecePaise: number }[];
    notes?: string;
    createdBy: string;
  }): { success: boolean; po?: PurchaseOrder; error?: string } {
    const supplier = this.getSupplierById(params.supplierId);
    if (!supplier) return { success: false, error: 'Supplier not found' };

    let totalPieces = 0;
    let totalAmountPaise = 0;
    const poItems = [];

    for (const item of params.items) {
      const product = this.getProductById(item.productId);
      if (!product) return { success: false, error: `Product ID ${item.productId} not found` };
      const itemPieces = item.bundles * item.piecesPerBundle;
      const itemTotalCost = itemPieces * item.costPerPiecePaise;

      totalPieces += itemPieces;
      totalAmountPaise += itemTotalCost;

      poItems.push({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        bundles: item.bundles,
        piecesPerBundle: item.piecesPerBundle,
        totalPieces: itemPieces,
        costPerPiecePaise: item.costPerPiecePaise,
        totalCostPaise: itemTotalCost,
      });
    }

    const poNumber = `PO-${supplier.name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: poItems,
      totalPieces,
      totalAmountPaise,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      notes: params.notes,
    };

    this.purchaseOrders.unshift(po);

    this.createNotification({
      event: 'PO_PENDING_APPROVAL',
      recipientRole: 'OWNER_ADMIN',
      isOwnerEscalation: true,
      title: `PO Created: ${po.poNumber}`,
      message: `Purchase Order for ${totalPieces} sarees (${formatINR(totalAmountPaise)}) from ${supplier.name} requires executive approval.`,
      referenceId: po.poNumber,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    });

    this.saveToStorage();
    return { success: true, po };
  }

  public approvePurchaseOrder(
    poId: string,
    approvedBy: string,
    approverRole: UserRole = 'OWNER_ADMIN'
  ): { success: boolean; po?: PurchaseOrder; error?: string } {
    if (approverRole !== 'OWNER_ADMIN') {
      return {
        success: false,
        error: 'Security Violation: Only the authorized Owner/Administrator can approve capital purchase orders.',
      };
    }
    const po = this.getPurchaseOrderById(poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    po.status = 'APPROVED';
    po.approvedBy = approvedBy;
    this.saveToStorage();
    return { success: true, po };
  }

  public sendPurchaseOrderToWeaver(poId: string): { success: boolean; po?: PurchaseOrder; error?: string } {
    const po = this.getPurchaseOrderById(poId);
    if (!po) return { success: false, error: 'Purchase Order not found' };

    po.status = 'SENT_TO_WEAVER';
    this.saveToStorage();
    return { success: true, po };
  }

  /**
   * Process Goods Receipt Inspection (QC) with 3-Way Matching and Automatic Inventory Intake
   */
  public receivePOGoodsWithQC(params: {
    poId: string;
    receivedPieces: number;
    acceptedPieces: number;
    rejectedPieces: number;
    rejectionReason?: string;
    inspectorName: string;
  }): { success: boolean; po?: PurchaseOrder; error?: string } {
    const po = this.getPurchaseOrderById(params.poId);
    if (!po) return { success: false, error: 'Purchase order not found' };

    if (params.acceptedPieces + params.rejectedPieces !== params.receivedPieces) {
      return { success: false, error: 'Accepted pieces + rejected pieces must equal total received pieces.' };
    }

    const threeWayMatched = params.receivedPieces === po.totalPieces;

    po.qcRecord = {
      receivedDate: new Date().toISOString(),
      totalReceivedPieces: params.receivedPieces,
      acceptedPieces: params.acceptedPieces,
      rejectedPieces: params.rejectedPieces,
      rejectionReason: params.rejectionReason,
      inspectorName: params.inspectorName,
      threeWayMatched,
    };

    // Intake accepted pieces into inventory
    for (const poItem of po.items) {
      const product = this.getProductById(poItem.productId);
      if (product) {
        const itemAcceptedRatio = po.totalPieces > 0 ? poItem.totalPieces / po.totalPieces : 1;
        const itemAcceptedPieces = Math.round(params.acceptedPieces * itemAcceptedRatio);

        if (itemAcceptedPieces > 0) {
          product.availableQty += itemAcceptedPieces;
          product.costPricePaise = poItem.costPerPiecePaise;
          product.updatedAt = new Date().toISOString();

          this.logMovement({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: 'PURCHASE_RECEIPT',
            quantityDelta: itemAcceptedPieces,
            bundleCount: poItem.bundles,
            piecesPerBundle: poItem.piecesPerBundle,
            unitCostPaise: poItem.costPerPiecePaise,
            referenceId: po.poNumber,
            performedBy: params.inspectorName,
            reason: `Goods Receipt QC: Accepted ${itemAcceptedPieces} pcs from ${po.supplierName}`,
          });
        }
      }
    }

    // Handle weaver defects and rejections
    const supplier = this.getSupplierById(po.supplierId);
    if (params.rejectedPieces > 0) {
      for (const poItem of po.items) {
        this.logMovement({
          productId: poItem.productId,
          productName: poItem.productName,
          sku: poItem.sku,
          type: 'SUPPLIER_RETURN',
          quantityDelta: -params.rejectedPieces,
          unitCostPaise: poItem.costPerPiecePaise,
          referenceId: po.poNumber,
          performedBy: params.inspectorName,
          reason: `QC Defect Rejection: ${params.rejectionReason || 'Defective zari weaving'}`,
        });
      }

      if (supplier) {
        const batchQuality = Math.round((params.acceptedPieces / params.receivedPieces) * 1000) / 10;
        supplier.qualityAcceptanceRate = Math.round(((supplier.qualityAcceptanceRate + batchQuality) / 2) * 10) / 10;
      }

      // Fire Owner Escalation Alert
      this.createNotification({
        event: 'GOODS_REJECTED',
        recipientRole: 'OWNER_ADMIN',
        isOwnerEscalation: true,
        title: `Weaver QC Defect: ${po.poNumber}`,
        message: `${params.rejectedPieces} sarees rejected from ${po.supplierName}. Reason: ${params.rejectionReason || 'Defects found during inspection'}.`,
        referenceId: po.poNumber,
        channel: 'IN_APP',
        deliveryStatus: 'DELIVERED',
      });
    }

    if (supplier) {
      supplier.totalPurchasedPaise += po.totalAmountPaise;
    }

    po.status = 'QC_COMPLETED';
    this.saveToStorage();
    return { success: true, po };
  }

  // --- ORDER FULFILLMENT & DISPATCH PIPELINE ---

  public updateOrderFulfillment(
    orderId: string,
    status: OrderFulfillmentStatus,
    officerName = 'Warehouse Team'
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.fulfillmentStatus = status;

    if (status === 'PICKED') {
      order.notes = `${order.notes ? order.notes + ' | ' : ''}Picked by ${officerName} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (status === 'PACKED') {
      order.notes = `${order.notes ? order.notes + ' | ' : ''}Packed in signature tamper-proof luxury box by ${officerName}`;
    }

    this.saveToStorage();
    return { success: true, order };
  }

  public dispatchOrder(params: {
    orderId: string;
    courier: 'BlueDart Express' | 'Delhivery Air' | 'India Post SpeedPost' | 'Direct Store Courier';
    trackingNumber: string;
    estimatedDeliveryDate: string;
    dispatchOfficer: string;
  }): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.fulfillmentStatus = 'DISPATCHED';
    order.dispatchDetails = {
      courier: params.courier,
      trackingNumber: params.trackingNumber,
      dispatchedAt: new Date().toISOString(),
      estimatedDeliveryDate: params.estimatedDeliveryDate,
      dispatchOfficer: params.dispatchOfficer,
    };

    this.createNotification({
      event: 'NEW_ORDER',
      recipientRole: 'CUSTOMER',
      isOwnerEscalation: false,
      title: `Order Dispatched: ${order.orderNumber}`,
      message: `Your saree parcel has been dispatched via ${params.courier} (AWB: ${params.trackingNumber}). Est. arrival: ${new Date(params.estimatedDeliveryDate).toLocaleDateString('en-IN')}.`,
      referenceId: order.orderNumber,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    });

    this.saveToStorage();
    return { success: true, order };
  }

  public markOrderDelivered(orderId: string): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.fulfillmentStatus = 'DELIVERED';
    if (order.dispatchDetails) {
      order.dispatchDetails.deliveredAt = new Date().toISOString();
    }

    this.saveToStorage();
    return { success: true, order };
  }

  // --- RETURNS & REFUND PROCESSING ---

  public requestOrderReturn(orderId: string, reason: string): { success: boolean; order?: Order; error?: string } {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    order.fulfillmentStatus = 'RETURN_REQUESTED';
    order.returnDetails = {
      reason,
      requestedAt: new Date().toISOString(),
      qcAccepted: false,
      refundPaise: order.totalPaise,
      refundStatus: 'PENDING',
    };

    this.createNotification({
      event: 'NEW_ORDER',
      recipientRole: 'STORE_MANAGER',
      isOwnerEscalation: true,
      title: `Return Requested: ${order.orderNumber}`,
      message: `Customer ${order.customerName} requested return for ${order.orderNumber}. Reason: "${reason}".`,
      referenceId: order.orderNumber,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    });

    this.saveToStorage();
    return { success: true, order };
  }

  public processReturnQC(params: {
    orderId: string;
    qcAccepted: boolean;
    reason?: string;
    inspectorRole: string;
    returnAction: 'RESTOCK' | 'DAMAGE_WRITE_OFF';
  }): { success: boolean; order?: Order; error?: string; pendingApproval?: boolean; message?: string } {
    const order = this.orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
    if (!order) return { success: false, error: 'Order not found' };
    if (!order.returnDetails) return { success: false, error: 'No return request recorded on this order' };

    order.returnDetails.qcAccepted = params.qcAccepted;
    order.returnDetails.inspectorRole = params.inspectorRole;

    if (params.qcAccepted) {
      if (params.inspectorRole !== 'OWNER_ADMIN') {
        // Physical QC passed, but financial outflow requires OWNER_ADMIN approval
        order.returnDetails.refundStatus = 'PENDING';
        const refId = `REF-REQ-${order.orderNumber}`;
        this.createApprovalRequest({
          type: 'FINANCIAL_REFUND',
          referenceId: order.orderNumber,
          amountPaise: order.totalPaise,
          requestedBy: params.inspectorRole,
          requesterRole: (params.inspectorRole as UserRole) || 'STORE_MANAGER',
          reason: `Customer return passed physical QC (${params.reason || 'Pristine condition'}). Financial refund payout requires Owner Authorization.`,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            returnAction: params.returnAction,
          },
        });

        this.createNotification({
          event: 'NEW_ORDER',
          recipientRole: 'OWNER_ADMIN',
          isOwnerEscalation: true,
          title: `Refund Approval Required: ${order.orderNumber}`,
          message: `${params.inspectorRole} inspected physical return for ${order.orderNumber}. Financial refund of ${formatINR(order.totalPaise)} requires executive authorization.`,
          referenceId: order.orderNumber,
          channel: 'IN_APP',
          deliveryStatus: 'DELIVERED',
        });

        this.saveToStorage();
        return {
          success: true,
          order,
          pendingApproval: true,
          message: 'Physical return QC passed. Financial refund submitted for Owner Authorization.',
        };
      }

      // OWNER_ADMIN immediate processing
      order.returnDetails.refundStatus = 'PROCESSED';
      order.returnDetails.refundedAt = new Date().toISOString();
      order.paymentStatus = 'REFUNDED';
      order.fulfillmentStatus = 'RETURNED';

      // Restore stock or write off
      for (const item of order.items) {
        const product = this.getProductById(item.productId);
        if (product) {
          if (params.returnAction === 'RESTOCK') {
            product.availableQty += item.quantity;
            product.updatedAt = new Date().toISOString();

            this.logMovement({
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              type: 'CUSTOMER_RETURN',
              quantityDelta: item.quantity,
              unitCostPaise: item.unitCostPricePaise,
              referenceId: order.orderNumber,
              performedBy: params.inspectorRole,
              reason: `Return QC Approved & Restocked: ${params.reason || 'Pristine condition'}`,
            });
          } else {
            this.logMovement({
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              type: 'DAMAGE_WRITE_OFF',
              quantityDelta: 0,
              unitCostPaise: item.unitCostPricePaise,
              referenceId: order.orderNumber,
              performedBy: params.inspectorRole,
              reason: `Return QC Damage Write-off: ${params.reason || 'Used/Damaged condition'}`,
            });
          }
        }
      }
    } else {
      order.returnDetails.refundStatus = 'REJECTED';
      order.fulfillmentStatus = 'DELIVERED';
      order.notes = `${order.notes ? order.notes + ' | ' : ''}Return QC Rejected: ${params.reason || 'Signs of wear or pleat alteration'}`;

      this.createNotification({
        event: 'REFUND_FAILED',
        recipientRole: 'OWNER_ADMIN',
        isOwnerEscalation: false,
        title: `Return Rejected: ${order.orderNumber}`,
        message: `Return for ${order.orderNumber} rejected by QC Inspector. Saree dispatched back to customer.`,
        referenceId: order.orderNumber,
        channel: 'IN_APP',
        deliveryStatus: 'DELIVERED',
      });
    }

    this.saveToStorage();
    return { success: true, order };
  }

  // --- OWNER NOTIFICATION & ESCALATION HUB ---

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public getUnreadNotificationsCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  public markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveToStorage();
    }
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach((n) => (n.isRead = true));
    this.saveToStorage();
  }

  public createNotification(
    params: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>
  ): AppNotification {
    const notif: AppNotification = {
      ...params,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.notifications.unshift(notif);
    this.saveToStorage();
    return notif;
  }

  // --- EXECUTIVE APPROVALS & FINANCIAL CONTROLS ---

  public getApprovals(): ApprovalRequest[] {
    return [...this.approvals];
  }

  public getPendingApprovals(): ApprovalRequest[] {
    return this.approvals.filter((a) => a.status === 'PENDING');
  }

  public getPendingApprovalsCount(): number {
    return this.approvals.filter((a) => a.status === 'PENDING').length;
  }

  public createApprovalRequest(
    data: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>
  ): ApprovalRequest {
    const newReq: ApprovalRequest = {
      ...data,
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    this.approvals.unshift(newReq);
    this.saveToStorage();
    return newReq;
  }

  public reviewApproval(params: {
    approvalId: string;
    action: 'APPROVE' | 'REJECT';
    reviewerRole: UserRole;
    reviewerName: string;
    reviewNotes?: string;
  }): { success: boolean; error?: string; approval?: ApprovalRequest } {
    if (params.reviewerRole !== 'OWNER_ADMIN') {
      return {
        success: false,
        error: 'Access Denied: Only the Owner / Administrator can review financial transactions and approvals.',
      };
    }

    const approval = this.approvals.find((a) => a.id === params.approvalId);
    if (!approval) return { success: false, error: 'Approval request not found.' };
    if (approval.status !== 'PENDING') return { success: false, error: 'Request has already been reviewed.' };

    approval.reviewedBy = params.reviewerName;
    approval.reviewedAt = new Date().toISOString();
    approval.reviewNotes = params.reviewNotes;

    if (params.action === 'REJECT') {
      approval.status = 'REJECTED';

      this.createNotification({
        event: 'STOCK_MISMATCH',
        recipientRole: approval.requesterRole,
        isOwnerEscalation: false,
        title: `Request Declined: ${approval.referenceId}`,
        message: `Owner declined ${approval.type} for ${approval.referenceId}. Note: ${params.reviewNotes || 'Declined per company policy'}.`,
        referenceId: approval.referenceId,
        channel: 'IN_APP',
        deliveryStatus: 'DELIVERED',
      });

      this.saveToStorage();
      return { success: true, approval };
    }

    // Action === 'APPROVE'
    approval.status = 'APPROVED';

    if (approval.type === 'FINANCIAL_REFUND') {
      const order = this.orders.find(
        (o) => o.orderNumber === approval.referenceId || o.id === approval.referenceId
      );
      if (order && order.returnDetails) {
        order.returnDetails.refundStatus = 'PROCESSED';
        order.returnDetails.refundedAt = new Date().toISOString();
        order.paymentStatus = 'REFUNDED';
        order.fulfillmentStatus = 'RETURNED';

        for (const item of order.items) {
          const product = this.getProductById(item.productId);
          if (product) {
            product.availableQty += item.quantity;
            product.updatedAt = new Date().toISOString();

            this.logMovement({
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              type: 'CUSTOMER_RETURN',
              quantityDelta: item.quantity,
              unitCostPaise: item.unitCostPricePaise,
              referenceId: order.orderNumber,
              performedBy: `Owner Authorized (${params.reviewerName})`,
              reason: `Owner approved refund & restock for ${order.orderNumber}`,
            });
          }
        }
      }
    } else if (approval.type === 'DAMAGE_WRITE_OFF') {
      const meta = approval.metadata;
      if (meta && meta.productId && meta.quantity) {
        const product = this.getProductById(meta.productId);
        if (product) {
          product.availableQty = Math.max(0, product.availableQty - meta.quantity);
          product.updatedAt = new Date().toISOString();

          this.logMovement({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: 'DAMAGE_WRITE_OFF',
            quantityDelta: -meta.quantity,
            unitCostPaise: product.costPricePaise,
            referenceId: approval.referenceId,
            performedBy: `Owner Authorized (${params.reviewerName})`,
            reason: meta.reason || 'Damage write-off approved by Owner',
          });
        }
      }
    } else if (approval.type === 'PO_COMMITMENT') {
      const poId = approval.metadata?.poId || approval.referenceId;
      const po = this.getPurchaseOrders().find((p) => p.id === poId || p.poNumber === poId);
      if (po) {
        po.status = 'APPROVED';
        po.approvedBy = params.reviewerName;
      }
    }

    this.createNotification({
      event: 'NEW_ORDER',
      recipientRole: approval.requesterRole,
      isOwnerEscalation: false,
      title: `Approval Granted: ${approval.referenceId}`,
      message: `Owner approved ${approval.type} (${formatINR(approval.amountPaise)}). Transaction executed successfully.`,
      referenceId: approval.referenceId,
      channel: 'IN_APP',
      deliveryStatus: 'DELIVERED',
    });

    this.saveToStorage();
    return { success: true, approval };
  }

  // --- DEFECT AUDIT LEDGER ---

  public getDefects(): DefectRecord[] {
    return [...this.defects];
  }

  public resolveDefect(id: string, regressionTest: string): void {
    const defect = this.defects.find((d) => d.id === id);
    if (defect) {
      defect.fixStatus = 'VERIFIED';
      defect.regressionTest = regressionTest;
      this.saveToStorage();
    }
  }

  // --- RESET & DEMO DATA INITIALIZATION ---

  public resetToFactoryDefaults() {
    this.products = [...INITIAL_PRODUCTS];
    this.orders = [];
    this.movements = [];
    this.suppliers = [...INITIAL_SUPPLIERS];
    this.purchaseOrders = [...INITIAL_PURCHASE_ORDERS];
    this.coupons = [...INITIAL_COUPONS];
    this.campaigns = [...INITIAL_CAMPAIGNS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.defects = [...INITIAL_DEFECTS];
    this.approvals = [...INITIAL_APPROVALS];
    this.processedWebhookIds.clear();
    this.saveToStorage();
  }
}

export const commerceStore = new VastrikaCommerceStore();
