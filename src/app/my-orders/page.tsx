"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { PackageX, PackageSearch, PackageCheck, Clock, CheckCircle2, Truck, Box, Package } from "lucide-react";

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Guest tracking states
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  // Cancellation states
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [activeOrderToCancel, setActiveOrderToCancel] = useState<any>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMyOrders();
    }
  }, [status]);

  const fetchMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/customer/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoadingOrders(false);
    }
  };

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

  const initiateCancel = (orderToCancel: any) => {
    setActiveOrderToCancel(orderToCancel);
    setShowCancelModal(true);
    setCancelError("");
    setCancelSuccess("");
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;

    setCancelLoading(true);
    setCancelError("");
    
    const targetEmail = status === "authenticated" ? session?.user?.email : email;

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: targetEmail, 
          orderId: activeOrderToCancel.orderId, 
          cancellationReason: cancelReason 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelSuccess("Your refund has been initiated successfully.");
        setShowCancelModal(false);
        if (status === "authenticated") {
          fetchMyOrders();
        } else {
          setOrder(data.order);
        }
      } else {
        setCancelError(data.error || "Failed to process cancellation.");
      }
    } catch (err) {
      setCancelError("An error occurred while processing the cancellation.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case "Cancelled":
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      case "Delivered":
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Delivered</span>;
      default:
        return <span className="bg-[#F5F0E6] text-[#C9A227] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{statusStr}</span>;
    }
  };

  // Timeline Component
  const OrderTimeline = ({ currentStatus }: { currentStatus: string }) => {
    if (currentStatus === "Cancelled") {
      return (
        <div className="flex items-center gap-4 mt-6 mb-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><Box size={12} /></div>
            <span className="text-[10px] uppercase font-bold text-gray-500">Received</span>
          </div>
          <div className="h-px bg-red-200 flex-1 relative top-[-8px]"></div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600"><PackageX size={12} /></div>
            <span className="text-[10px] uppercase font-bold text-red-600">Cancelled</span>
          </div>
        </div>
      );
    }

    const steps = [
      { id: "Order Received", icon: Box },
      { id: "Preparing", icon: Clock },
      { id: "Shipped", icon: Truck },
      { id: "Delivered", icon: CheckCircle2 }
    ];

    let currentIndex = steps.findIndex(s => s.id === currentStatus);
    if (currentIndex === -1) currentIndex = 0; // Default

    return (
      <div className="flex items-center justify-between mt-6 mb-2">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isLast = idx === steps.length - 1;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className={`flex items-center ${!isLast ? "flex-1" : ""}`}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? "border-[#C9A227] bg-[#C9A227] text-white" : "border-gray-200 bg-white text-gray-300"}`}>
                  <Icon size={14} />
                </div>
                <span className={`text-[10px] uppercase font-bold text-center w-16 ${isCompleted ? "text-[#C9A227]" : "text-gray-400"}`}>
                  {step.id}
                </span>
              </div>
              {!isLast && (
                <div className={`h-1 flex-1 mx-2 rounded-full relative top-[-10px] ${idx < currentIndex ? "bg-[#C9A227]" : "bg-gray-100"}`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderOrderCard = (o: any) => {
    const isCancelled = o.orderStatus === "Cancelled";
    
    const now = new Date();
    const deadline = new Date(o.cancellationDeadline);
    const isPastDeadline = now > deadline;
    const isCrafting = o.trackingStatus !== "Order Received";
    const canCancel = !isPastDeadline && !isCrafting && !isCancelled;
    const remainingHours = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));

    return (
      <div key={o._id} className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-6 hover:shadow-md transition-shadow">
        
        {/* Card Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#F0EBE1] pb-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-sm text-[#8A8070] font-medium uppercase tracking-wider">Order {o.orderId}</p>
              {getStatusBadge(o.orderStatus === "Cancelled" ? "Cancelled" : o.trackingStatus)}
            </div>
            <p className="text-[#2B2B2B] text-sm">Placed on {new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-[#8A8070] uppercase tracking-wider mb-1">Total Paid</p>
            <p className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>₹{o.totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Product Area */}
        <div className="space-y-4">
          {o.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-4 items-center bg-[#FAF8F2] p-3 rounded-xl border border-[#F0EBE1]">
              <div className="w-16 h-16 bg-[#F5F0E6] rounded-lg border border-[#E8DCC8] flex items-center justify-center shrink-0 overflow-hidden relative">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                ) : (
                  <Package size={20} className="text-[#D4AF37]/50" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#2B2B2B] line-clamp-1">{item.title}</p>
                <div className="flex gap-4 text-xs text-[#666] mt-1">
                  <span>Qty: <strong className="text-[#444]">{item.quantity}</strong></span>
                  {item.size && <span>Size: <strong className="text-[#444]">{item.size}</strong></span>}
                </div>
              </div>
              <div className="font-bold text-[#444]">₹{item.price}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="my-8 px-2">
          <OrderTimeline currentStatus={isCancelled ? "Cancelled" : o.trackingStatus} />
        </div>

        {/* Footer Actions (Cancel / Refund Status) */}
        <div className="border-t border-[#F0EBE1] pt-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
          
          {/* Status Message Area */}
          <div className="flex-1">
            {isCancelled ? (
              <div className="flex items-center gap-3">
                {o.refundStatus === "Completed" && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Refund Completed</span>}
                {o.refundStatus === "Initiated" && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Refund Initiated</span>}
                {o.refundStatus === "Failed" && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Refund Failed</span>}
                {o.refundStatus === "Pending" && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Refund Pending</span>}
                {o.cancellationReason && <span className="text-xs text-[#8A8070] italic">Reason: {o.cancellationReason}</span>}
              </div>
            ) : canCancel ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 size={12}/> Cancellation Available</span>
                <span className="text-[#8A8070]">closes in ~{remainingHours}h</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md">Cancellation Closed</span>
                <span className="text-[#8A8070]">
                  {isCrafting ? `Order is ${o.trackingStatus.toLowerCase()}` : 'Window expired'}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {canCancel && (
            <button 
              onClick={() => initiateCancel(o)}
              className="px-6 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-bold transition-colors w-full md:w-auto text-center"
            >
              Cancel Order
            </button>
          )}

        </div>

      </div>
    );
  };

  if (status === "loading") {
    return <div className="min-h-screen pt-32 text-center text-[#8A8070]">Loading...</div>;
  }

  // Filter orders if logged in
  const activeOrders = orders.filter(o => o.orderStatus !== "Cancelled" && o.trackingStatus !== "Delivered");
  const cancelledOrders = orders.filter(o => o.orderStatus === "Cancelled");
  const deliveredOrders = orders.filter(o => o.orderStatus !== "Cancelled" && o.trackingStatus === "Delivered");

  return (
    <div className="min-h-screen bg-[#FAF8F2] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="mb-8">
          <BackButton />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {status === "authenticated" ? "My Orders" : "Track & Manage Orders"}
        </h1>
        
        {status === "unauthenticated" && (
          <p className="text-[#8A8070] mb-8 text-sm">
            Enter your email and order ID to view details. <Link href="/login" className="text-[#C9A227] hover:underline font-semibold">Log in</Link> to see all your orders in one place.
          </p>
        )}

        {cancelSuccess && (
          <div className="bg-[#E8F5E9] border border-[#4CAF50] text-[#2E7D32] p-4 rounded-xl mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} />
            <p className="text-sm font-medium">{cancelSuccess}</p>
          </div>
        )}

        {/* Guest Tracking Form */}
        {status === "unauthenticated" && (
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8]">
            <input 
              type="email" 
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[#E0E0E0] outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-sm"
            />
            <input 
              type="text" 
              placeholder="Order ID (e.g., ORD-XXXXX)"
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[#E0E0E0] outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-sm"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-bold rounded-xl disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-md transition-all active:scale-[0.98] whitespace-nowrap"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        )}

        {error && <p className="text-red-500 mb-6 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
        {cancelError && <p className="text-red-500 mb-6 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{cancelError}</p>}

        {/* Guest Single Order View */}
        {status === "unauthenticated" && order && (
          <div className="mt-8">
             <h2 className="text-xl font-bold text-[#2B2B2B] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Search Result</h2>
             {renderOrderCard(order)}
          </div>
        )}

        {/* Logged in Orders grouped by sections */}
        {status === "authenticated" && (
          <div className="space-y-12">
            {loadingOrders ? (
              <div className="flex justify-center items-center py-20 text-[#8A8070]"><Clock className="animate-spin mr-2"/> Loading your orders...</div>
            ) : (
              <>
                {/* Active Orders Section */}
                <section>
                  <h2 className="text-xl font-bold text-[#2B2B2B] mb-6 flex items-center gap-2 border-b border-[#E8DCC8] pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    <PackageSearch className="text-[#C9A227]" size={20} /> Active Orders
                  </h2>
                  {activeOrders.length > 0 ? (
                    <div className="space-y-6">
                      {activeOrders.map(o => renderOrderCard(o))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8DCC8] border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                      <PackageSearch size={40} className="text-[#D4AF37]/30 mb-3" />
                      <p className="text-[#8A8070] font-medium">No Active Orders</p>
                      <p className="text-xs text-[#A89F91] mt-1">Looks like you don't have any ongoing orders right now.</p>
                      <Link href="/artworks" className="mt-4 px-6 py-2 bg-[#F5F0E6] text-[#C9A227] rounded-full text-sm font-bold hover:bg-[#E8DCC8] transition-colors">Start Shopping</Link>
                    </div>
                  )}
                </section>

                {/* Cancelled Orders Section */}
                {(cancelledOrders.length > 0 || activeOrders.length === 0) && (
                  <section>
                    <h2 className="text-xl font-bold text-[#2B2B2B] mb-6 flex items-center gap-2 border-b border-[#E8DCC8] pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      <PackageX className="text-red-400" size={20} /> Cancelled Orders
                    </h2>
                    {cancelledOrders.length > 0 ? (
                      <div className="space-y-6">
                        {cancelledOrders.map(o => renderOrderCard(o))}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#E8DCC8] border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                        <PackageX size={40} className="text-red-200/50 mb-3" />
                        <p className="text-[#8A8070] font-medium">No Cancelled Orders</p>
                      </div>
                    )}
                  </section>
                )}

                {/* Delivered Orders Section */}
                <section>
                  <h2 className="text-xl font-bold text-[#2B2B2B] mb-6 flex items-center gap-2 border-b border-[#E8DCC8] pb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    <PackageCheck className="text-green-600" size={20} /> Delivered Orders
                  </h2>
                  {deliveredOrders.length > 0 ? (
                    <div className="space-y-6">
                      {deliveredOrders.map(o => renderOrderCard(o))}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E8DCC8] border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                      <PackageCheck size={40} className="text-green-200/50 mb-3" />
                      <p className="text-[#8A8070] font-medium">No Delivered Orders</p>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-[#2B2B2B]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full relative shadow-xl transform scale-100 transition-transform">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                &times;
              </button>
              
              <h3 className="text-2xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Cancel Order</h3>
              <p className="text-sm text-[#8A8070] mb-6">
                Please tell us why you're cancelling this order. This helps us improve our service.
              </p>

              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="I changed my mind..."
                className="w-full h-32 p-4 rounded-xl border border-[#E0E0E0] mb-6 outline-none resize-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-sm"
              />

              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
                >
                  Keep Order
                </button>
                <button 
                  onClick={handleCancelOrder}
                  disabled={cancelLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
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
