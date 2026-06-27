"use client";

import { useState, useEffect } from "react";
import BackButton from "@/components/BackButton";

type Order = {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  totalAmount: number;
  trackingStatus: string;
  items: { title: string; quantity: number }[];
  createdAt: string;
  orderStatus?: string;
  refundStatus?: string;
  refundId?: string;
  refundDate?: string;
  cancellationReason?: string;
};

type Product = {
  _id: string;
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
};

const STATUSES = [
  "Order Received",
  "Crafting in Progress",
  "Quality Check",
  "Ready for Dispatch",
  "Shipped",
  "Delivered"
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else {
      fetchInventory();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (e) {
      console.error("Failed to fetch inventory", e);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, trackingStatus: newStatus } : o));
      } else {
        alert("Failed to update status");
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const updateProductStock = async (id: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      } else {
        alert("Failed to update stock");
      }
    } catch (e) {
      alert("Error updating stock");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F2", paddingTop: "120px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>
        
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#2B2B2B", fontFamily: "Georgia, serif", marginBottom: "24px" }}>
          Admin Dashboard
        </h1>

        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button 
            onClick={() => setActiveTab("orders")}
            style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", border: "none", background: activeTab === "orders" ? "#C9A227" : "#E8DCC8", color: activeTab === "orders" ? "#fff" : "#5A5548" }}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab("inventory")}
            style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", border: "none", background: activeTab === "inventory" ? "#C9A227" : "#E8DCC8", color: activeTab === "inventory" ? "#fff" : "#5A5548" }}
          >
            Inventory
          </button>
        </div>

        {loading ? (
          <p>Loading {activeTab}...</p>
        ) : activeTab === "orders" ? (
          <div style={{ display: "grid", gap: "20px" }}>
            {orders.map((order) => (
              <div key={order._id} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #E8DCC8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#C9A227", fontFamily: "Georgia, serif" }}>{order.orderId}</h3>
                    <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <div style={{ marginTop: "12px" }}>
                      <strong>{order.customer?.name}</strong>
                      <p style={{ margin: "2px 0", fontSize: "14px" }}>{order.customer?.email} | {order.customer?.phone}</p>
                      <p style={{ margin: "2px 0", fontSize: "14px" }}>{order.customer?.address}, {order.customer?.city} - {order.customer?.pincode}</p>
                    </div>
                  </div>
                  <div>
                    {order.orderStatus === "Cancelled" && (
                      <div style={{ background: "#FFEBEE", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                        <p style={{ margin: 0, color: "#C62828", fontWeight: "bold" }}>CANCELLED</p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#C62828" }}>Reason: {order.cancellationReason}</p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#C62828" }}>Refund: {order.refundStatus} ({order.refundId})</p>
                      </div>
                    )}
                    <h4 style={{ margin: "0 0 8px 0" }}>Items</h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
                      {order.items.map((item, i) => (
                        <li key={i}>{item.title} (x{item.quantity})</li>
                      ))}
                    </ul>
                    <p style={{ marginTop: "12px", fontWeight: "bold" }}>Total: ₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ minWidth: "200px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase" }}>Update Status</label>
                    <select 
                      value={order.trackingStatus} 
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                      disabled={order.orderStatus === "Cancelled"}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p>No orders found in the database.</p>}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {products.map((product) => (
              <div key={product.id} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #E8DCC8" }}>
                <h3 style={{ margin: "0 0 4px 0", color: "#2B2B2B", fontFamily: "Georgia, serif" }}>{product.name}</h3>
                <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#8A8070", textTransform: "uppercase" }}>ID: {product.id}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontWeight: "bold", color: "#C9A227" }}>₹{product.price.toLocaleString('en-IN')}</span>
                  <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", background: product.stock > 0 ? "#E8F5E9" : "#FFEBEE", color: product.stock > 0 ? "#2E7D32" : "#C62828" }}>
                    {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button 
                    onClick={() => updateProductStock(product.id, product.stock - 1)}
                    style={{ padding: "8px 12px", border: "1px solid #E8DCC8", background: "#fff", borderRadius: "6px", cursor: "pointer" }}
                  >-</button>
                  <input 
                    type="number" 
                    value={product.stock}
                    onChange={(e) => updateProductStock(product.id, parseInt(e.target.value) || 0)}
                    style={{ width: "60px", padding: "8px", border: "1px solid #E8DCC8", borderRadius: "6px", textAlign: "center" }}
                  />
                  <button 
                    onClick={() => updateProductStock(product.id, product.stock + 1)}
                    style={{ padding: "8px 12px", border: "1px solid #E8DCC8", background: "#fff", borderRadius: "6px", cursor: "pointer" }}
                  >+</button>
                  <button 
                    onClick={() => updateProductStock(product.id, 0)}
                    style={{ marginLeft: "auto", padding: "8px 12px", border: "none", background: "#FFEBEE", color: "#C62828", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Mark OOS
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && <p>No products found in the database.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
