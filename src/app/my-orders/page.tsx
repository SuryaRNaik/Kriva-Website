"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";

export default function MyOrdersPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [cancelError, setCancelError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    setCancelSuccess("");
    setCancelError("");

    try {
      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || "Failed to fetch order");
      }
    } catch (err) {
      setError("An error occurred while fetching the order.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setCancelLoading(true);
    setCancelError("");
    try {
      const res = await fetch("/api/payment/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderId: order.orderId, cancellationReason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess("Your refund has been initiated successfully. Refunds usually reflect in your original payment method within 5–7 business days depending on your bank or payment provider.");
        setShowCancelModal(false);
        setOrder(data.order); // Update order with new status
      } else {
        setCancelError(data.error || "Failed to process cancellation.");
      }
    } catch (err) {
      setCancelError("An error occurred while processing the cancellation.");
    } finally {
      setCancelLoading(false);
    }
  };

  const renderCancellationStatus = () => {
    if (!order) return null;
    
    if (order.orderStatus === "Cancelled") {
      return (
        <div style={{ background: "#FFEBEE", padding: "12px", borderRadius: "8px", marginTop: "16px" }}>
          <p style={{ margin: 0, color: "#C62828", fontWeight: "bold" }}>Order Cancelled</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#C62828" }}>Refund Status: {order.refundStatus}</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#C62828" }}>Refund ID: {order.refundId}</p>
          {order.refundDate && <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#C62828" }}>Refund Date: {new Date(order.refundDate).toLocaleDateString()}</p>}
        </div>
      );
    }

    const now = new Date();
    const deadline = new Date(order.cancellationDeadline);
    const isPastDeadline = now > deadline;
    const isCrafting = order.trackingStatus !== "Order Received";
    const canCancel = !isPastDeadline && !isCrafting;

    if (canCancel) {
      const remainingHours = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
      return (
        <div style={{ marginTop: "16px" }}>
          <p style={{ color: "#2E7D32", fontWeight: "bold" }}>Cancellation Available</p>
          <p style={{ fontSize: "14px", color: "#666" }}>Cancellation window closes in approx. {remainingHours} hours.</p>
          <button 
            onClick={() => setShowCancelModal(true)}
            style={{ marginTop: "12px", padding: "10px 20px", background: "#fff", border: "1px solid #C62828", color: "#C62828", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
          >
            Cancel Order
          </button>
        </div>
      );
    } else {
      return (
        <div style={{ marginTop: "16px" }}>
          <p style={{ color: "#666", fontWeight: "bold" }}>Cancellation Closed</p>
          {isCrafting ? (
            <p style={{ fontSize: "14px", color: "#8A8070" }}>Cancellation is no longer available because your order is currently: {order.trackingStatus}</p>
          ) : (
            <p style={{ fontSize: "14px", color: "#8A8070" }}>The 3-working-day cancellation window has expired.</p>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F2", paddingTop: "120px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>
        
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#2B2B2B", fontFamily: "Georgia, serif", marginBottom: "8px" }}>
          Track & Manage Orders
        </h1>
        <p style={{ color: "#8A8070", marginBottom: "32px" }}>Enter your email and order ID to view your order details or initiate a cancellation.</p>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "40px" }}>
          <input 
            type="email" 
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: "1 1 250px", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E8DCC8" }}
          />
          <input 
            type="text" 
            placeholder="Order ID (e.g. ORD-12345...)"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ flex: "1 1 250px", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E8DCC8" }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ padding: "12px 32px", borderRadius: "8px", background: "#C9A227", color: "#fff", fontWeight: "bold", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Searching..." : "Find Order"}
          </button>
        </form>

        {error && <p style={{ color: "#C62828", background: "#FFEBEE", padding: "12px", borderRadius: "8px" }}>{error}</p>}
        {cancelSuccess && <p style={{ color: "#2E7D32", background: "#E8F5E9", padding: "16px", borderRadius: "8px", marginBottom: "24px", lineHeight: "1.5" }}>{cancelSuccess}</p>}
        {cancelError && <p style={{ color: "#C62828", background: "#FFEBEE", padding: "12px", borderRadius: "8px", marginBottom: "24px" }}>{cancelError}</p>}

        {order && (
          <div style={{ background: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #E8DCC8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              <div>
                <h2 style={{ margin: 0, color: "#C9A227", fontFamily: "Georgia, serif" }}>{order.orderId}</h2>
                <p style={{ margin: "8px 0 0 0", color: "#666" }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p style={{ margin: "4px 0 0 0", color: "#666", fontWeight: "bold" }}>Status: {order.trackingStatus}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: "bold", color: "#2B2B2B" }}>Total: ₹{order.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div style={{ marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#2B2B2B" }}>Order Items</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {order.items.map((item: any, i: number) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i === order.items.length - 1 ? "none" : "1px solid #eee" }}>
                    <span>{item.title} (x{item.quantity})</span>
                    <span>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#2B2B2B" }}>Tracking & Shipping</h3>
              
              {order.orderStatus !== 'Cancelled' ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                    {['Order Received', 'Crafting in Progress', 'Quality Check', 'Packed', 'Shipped', 'Delivered'].map((step, index, array) => {
                      const currentStepIndex = array.indexOf(order.trackingStatus);
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step} style={{ display: "flex", alignItems: "center", gap: "12px", opacity: isCompleted ? 1 : 0.4 }}>
                          <div style={{ 
                            width: "20px", height: "20px", borderRadius: "50%", 
                            background: isCompleted ? "#C9A227" : "#E8DCC8", 
                            display: "flex", alignItems: "center", justifyContent: "center" 
                          }}>
                            {isCompleted && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff" }} />}
                          </div>
                          <span style={{ fontWeight: isCurrent ? "bold" : "normal", color: "#2B2B2B" }}>{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {(order.courierName || order.trackingNumber || order.expectedDeliveryDate) && (
                    <div style={{ background: "#FAF8F2", padding: "16px", borderRadius: "8px", border: "1px solid #E8DCC8" }}>
                      {order.deliveryMethod && <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}><strong>Delivery Method:</strong> {order.deliveryMethod}</p>}
                      {order.courierName && <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}><strong>Courier / Partner:</strong> {order.courierName}</p>}
                      {order.trackingNumber && <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}><strong>Tracking Number / Ref:</strong> {order.trackingNumber}</p>}
                      {order.dispatchDate && <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}><strong>Dispatch Date:</strong> {new Date(order.dispatchDate).toLocaleDateString()}</p>}
                      {order.expectedDeliveryDate && <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}><strong>Expected Delivery:</strong> {new Date(order.expectedDeliveryDate).toLocaleDateString()}</p>}
                      {order.shippingNotes && <p style={{ margin: "0", fontSize: "14px" }}><strong>Notes:</strong> {order.shippingNotes}</p>}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: "#C62828" }}>Tracking unavailable for cancelled orders.</p>
              )}
            </div>

            <div style={{ marginTop: "32px", borderTop: "1px solid #eee", paddingTop: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", color: "#2B2B2B" }}>Cancellation & Refunds</h3>
              {renderCancellationStatus()}
            </div>
          </div>
        )}

        {showCancelModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
            <div style={{ background: "#fff", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "500px" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#2B2B2B" }}>Cancel Order</h3>
              <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>Please let us know why you are cancelling this order. This helps us improve our service.</p>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "100px", marginBottom: "24px", fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelLoading}
                  style={{ padding: "10px 20px", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Keep Order
                </button>
                <button 
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  style={{ padding: "10px 20px", background: "#C62828", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: cancelLoading ? "not-allowed" : "pointer" }}
                >
                  {cancelLoading ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
