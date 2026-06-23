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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
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

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F2", paddingTop: "120px", paddingBottom: "80px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <BackButton />
        </div>
        
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#2B2B2B", fontFamily: "Georgia, serif", marginBottom: "32px" }}>
          Admin Dashboard
        </h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : (
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
                      onChange={(e) => updateStatus(order.orderId, e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
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
        )}
      </div>
    </div>
  );
}
