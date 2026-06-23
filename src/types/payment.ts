// ─── Shared payment types ────────────────────────────────────────────────────
// Used across API routes, checkout page, and success/failure pages.
// Extend these when a real backend/database is wired in.

export interface OrderItem {
  id: string;
  title: string;
  price: string;       // formatted: "₹2,500"
  quantity: number;
  image: string;
  subtitle?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

/** Payload sent from checkout page → /api/payment/create-order */
export interface CreateOrderPayload {
  amount: number;          // in paise (₹1 = 100 paise)
  currency: string;        // "INR"
  receipt: string;         // unique receipt id e.g. "rcpt_<timestamp>"
  notes?: Record<string, string>;
}

/** Response from /api/payment/create-order */
export interface CreateOrderResponse {
  orderId: string;         // Razorpay order id
  amount: number;
  currency: string;
  keyId: string;           // Razorpay public key (safe to expose)
}

/** Payload sent from client → /api/payment/verify after Razorpay callback */
export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  orderType?: 'shop' | 'workshop';
  workshopDetails?: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

/** Response from /api/payment/verify */
export interface VerifyPaymentResponse {
  success: boolean;
  orderId: string;         // internal order reference
  message: string;
}

/** Stored order record (localStorage for now — swap with DB later) */
export interface StoredOrder {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  customer: CustomerDetails;
  items: OrderItem[];
  totalAmount: number;
  status: "paid" | "failed" | "pending";
  createdAt: string;
}

/** Razorpay checkout.js options (window.Razorpay constructor) */
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: Record<string, string>;
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
