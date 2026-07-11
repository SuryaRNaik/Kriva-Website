"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Package, XCircle, FileText, Search, Settings2, PackageSearch, PackageCheck, Clock, Printer } from "lucide-react";
import toast from "react-hot-toast";

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
  items: { title: string; quantity: number; size?: string; image?: string; price: number | string }[];
  createdAt: string;
  orderStatus?: string;
  refundStatus?: string;
  cancellationReason?: string;
  refundId?: string;
  courierName?: string;
  trackingNumber?: string;
  dispatchDate?: string;
  expectedDeliveryDate?: string;
  shippingNotes?: string;
  shippingMode?: string;
  courierContact?: string;
  dispatchTime?: string;
  pickupLocation?: string;
  adminNotes?: string;
  deliveredBy?: string;
  receivedBy?: string;
  deliveryRemarks?: string;
  deliveryMethod?: string;
};

const TIMELINE_STAGES = [
  "Order Received",
  "Crafting in Progress",
  "Quality Check",
  "Packed",
  "Shipped",
  "Delivered"
];

const formatPrice = (price: string | number) => {
  if (typeof price === 'number') return price.toLocaleString('en-IN');
  const num = Number(price.replace(/[^0-9.-]+/g,""));
  return num.toLocaleString('en-IN');
};

const getStageColorClass = (stage: string, type: 'border' | 'bg' | 'ring' | 'text') => {
  const map: any = {
    'Order Received': { border: 'border-blue-500', bg: 'bg-blue-500', ring: 'ring-blue-500/20', text: 'text-blue-600' },
    'Crafting in Progress': { border: 'border-purple-500', bg: 'bg-purple-500', ring: 'ring-purple-500/20', text: 'text-purple-600' },
    'Quality Check': { border: 'border-orange-500', bg: 'bg-orange-500', ring: 'ring-orange-500/20', text: 'text-orange-600' },
    'Packed': { border: 'border-teal-500', bg: 'bg-teal-500', ring: 'ring-teal-500/20', text: 'text-teal-600' },
    'Shipped': { border: 'border-indigo-500', bg: 'bg-indigo-500', ring: 'ring-indigo-500/20', text: 'text-indigo-600' },
    'Delivered': { border: 'border-green-500', bg: 'bg-green-500', ring: 'ring-green-500/20', text: 'text-green-600' },
    'Cancelled': { border: 'border-red-500', bg: 'bg-red-500', ring: 'ring-red-500/20', text: 'text-red-600' },
  };
  return map[stage]?.[type] || '';
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Active" | "Cancelled" | "Delivered">("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, additionalData: any = {}) => {
    try {
      if (newStatus === "Shipped") {
        const orderToUpdate = orders.find(o => o.orderId === orderId);
        const mode = additionalData.shippingMode ?? orderToUpdate?.shippingMode;
        const tNum = additionalData.trackingNumber ?? orderToUpdate?.trackingNumber;
        if (mode && mode !== "Other" && !tNum) {
          toast.error("Tracking Number is required for " + mode);
          return;
        }
      }

      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingStatus: newStatus, ...additionalData }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.orderId === orderId ? { ...o, ...data.order } : o));
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, ...data.order });
        }
        toast.success("Order updated");
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error updating status");
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === "Cancelled") return o.orderStatus === "Cancelled";
    if (activeTab === "Delivered") return o.trackingStatus === "Delivered" && o.orderStatus !== "Cancelled";
    return o.trackingStatus !== "Delivered" && o.orderStatus !== "Cancelled";
  }).filter(o => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return o.orderId.toLowerCase().includes(search) ||
           o.customer?.name?.toLowerCase().includes(search) ||
           o.customer?.email?.toLowerCase().includes(search) ||
           o.customer?.phone?.includes(search) ||
           o.trackingNumber?.toLowerCase().includes(search) ||
           o.items?.some(i => i.title.toLowerCase().includes(search));
  });

  return (
    <div className="print:m-0 print:p-0">
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Manage Orders</h2>
          <p className="text-[#8A8070] text-sm mt-1">View, track, and update customer orders.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, name, tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg text-sm focus:border-[#C9A227] outline-none w-64 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="print:hidden flex border-b border-[#E8DCC8] mb-6">
        {(["Active", "Cancelled", "Delivered"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === tab ? "text-[#C9A227]" : "text-[#8A8070] hover:text-[#5A5548]"}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#C9A227]" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center print:hidden">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DCC8] flex flex-col items-center print:hidden">
          <PackageSearch size={48} className="text-[#E8DCC8] mb-4" />
          <p className="text-[#5A5548] font-medium">No {activeTab.toLowerCase()} orders found.</p>
        </div>
      ) : (
        <div className="space-y-6 print:hidden">
          {filteredOrders.map(order => {
            const expectedDate = new Date(new Date(order.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000);
            const daysRemaining = Math.ceil((expectedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
            <div key={order._id} className="bg-white rounded-2xl border border-[#E8DCC8] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* Order Header */}
              <div className="bg-[#FAF8F2] px-6 py-4 flex flex-wrap items-center justify-between border-b border-[#E8DCC8] gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-[#8A8070] font-bold uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-serif font-bold text-[#C9A227]">{order.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8070] font-bold uppercase tracking-wider mb-1">Date Placed</p>
                    <p className="font-medium text-[#2B2B2B]">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8070] font-bold uppercase tracking-wider mb-1">Total</p>
                    <p className="font-bold text-[#2B2B2B]">₹{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setInvoiceOrder(order)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#E8DCC8] rounded text-sm text-[#5A5548] hover:bg-[#FAF8F2] transition-colors bg-white font-medium"
                  >
                    <FileText size={16} />
                    View Invoice
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#C9A227] text-white rounded text-sm hover:bg-[#B38D1E] transition-colors font-medium shadow-sm"
                  >
                    <Settings2 size={16} />
                    Manage Details
                  </button>
                </div>
              </div>

              {/* Completion Date Banner (Admin Only) */}
              {activeTab === 'Active' && order.orderStatus !== 'Cancelled' && (
                <div className={`px-6 py-2 text-sm font-medium flex justify-between border-b border-[#E8DCC8] ${daysRemaining < 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  <span>Expected Completion: {expectedDate.toLocaleDateString()}</span>
                  <span>
                    {daysRemaining < 0 ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days remaining`}
                  </span>
                </div>
              )}

              <div className="p-6 flex flex-col lg:flex-row gap-8">
                
                {/* Products Summary */}
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wider mb-4 border-b border-[#E8DCC8] pb-2">Customer & Items</h4>
                  
                  <div className="mb-4">
                    <p className="font-bold text-[#2B2B2B]">{order.customer?.name}</p>
                    <p className="text-sm text-[#8A8070]">{order.customer?.email} • {order.customer?.phone}</p>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-[#FAF8F2] p-3 rounded-lg border border-[#E8DCC8]/50">
                        <div className="w-16 h-16 relative bg-white border border-[#E8DCC8] rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          ) : (
                            <Package size={20} className="text-[#E8DCC8]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#2B2B2B] truncate">{item.title}</p>
                          <p className="text-xs text-[#8A8070]">Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#2B2B2B]">₹{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline / Status */}
                <div className="lg:w-[400px]">
                  <h4 className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wider mb-4 border-b border-[#E8DCC8] pb-2">Order Status</h4>
                  
                  {order.orderStatus === "Cancelled" ? (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                      <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                        <XCircle size={18} /> Order Cancelled
                      </div>
                      <p className="text-sm text-red-800">Reason: {order.cancellationReason}</p>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs font-bold text-red-700 uppercase mb-1">Refund Status</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          order.refundStatus === "Completed" ? "bg-green-100 text-green-700" :
                          order.refundStatus === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{order.refundStatus || "Initiated"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-[#E8DCC8]">
                      {/* Interactive Visual Timeline */}
                      <div className="relative mb-6 pl-4 border-l-2 border-[#E8DCC8] space-y-6">
                        {TIMELINE_STAGES.map((stage, idx) => {
                          const currentStageIdx = TIMELINE_STAGES.indexOf(order.trackingStatus);
                          const isCompleted = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;
                          
                          return (
                            <div key={stage} className="relative cursor-pointer group" onClick={() => updateOrderStatus(order.orderId, stage)}>
                              <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 transition-colors
                                ${isCompleted ? getStageColorClass(stage, 'border') + ' ' + getStageColorClass(stage, 'bg') : 'border-[#E8DCC8] bg-white'}
                                ${isCurrent ? 'ring-4 ' + getStageColorClass(stage, 'ring') : ''}
                                group-hover:border-[#2B2B2B]
                              `} />
                              <p className={`text-sm font-medium transition-colors ${isCompleted ? getStageColorClass(stage, 'text') + ' font-bold' : 'text-[#8A8070] group-hover:text-[#5A5548]'}`}>
                                {stage}
                              </p>
                              {isCurrent && stage === 'Shipped' && order.trackingNumber && (
                                <p className="text-xs text-[#8A8070] mt-1 break-all">
                                  {order.courierName} • {order.trackingNumber}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-[#8A8070] text-center">Click any stage above to update the status.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Invoice Modal (Visible on Print) */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:block">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:border-none print:rounded-none">
            
            <div className="px-6 py-4 border-b border-[#E8DCC8] flex items-center justify-between bg-[#FAF8F2] print:hidden">
              <h3 className="font-serif text-xl font-bold text-[#2B2B2B]">Invoice - {invoiceOrder.orderId}</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-white rounded font-bold hover:bg-[#B38D1E] transition-colors"
                >
                  <Printer size={16} /> Print
                </button>
                <button onClick={() => setInvoiceOrder(null)} className="text-[#8A8070] hover:text-[#2B2B2B]">
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-white print:overflow-visible">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-[#C9A227] mb-2">Kriva Studio</h1>
                  <p className="text-[#8A8070] text-sm">Handcrafted with Tradition</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-[#2B2B2B] mb-2 uppercase tracking-widest text-gray-200 print:text-gray-400">Invoice</h2>
                  <p className="text-sm font-bold">#{invoiceOrder.orderId}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-between border-t border-b border-gray-200 py-6 mb-8 gap-8">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h4>
                  <p className="font-bold text-[#2B2B2B] text-lg">{invoiceOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{invoiceOrder.customer?.address}</p>
                  <p className="text-sm text-gray-600">{invoiceOrder.customer?.city} - {invoiceOrder.customer?.pincode}</p>
                  <p className="text-sm text-gray-600 mt-2">Email: {invoiceOrder.customer?.email}</p>
                  <p className="text-sm text-gray-600">Phone: {invoiceOrder.customer?.phone}</p>
                </div>
                <div className="flex-1 text-right">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Details</h4>
                  <p className="text-sm text-gray-600"><span className="font-medium">Total Paid:</span> ₹{formatPrice(invoiceOrder.totalAmount)}</p>
                  <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Payment ID:</span> {invoiceOrder.refundId || "Razorpay Payment"}</p>
                  <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Status:</span> {invoiceOrder.trackingStatus}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="py-3 font-bold text-gray-800">Item Description</th>
                    <th className="py-3 font-bold text-gray-800 text-center">Quantity</th>
                    <th className="py-3 font-bold text-gray-800 text-right">Unit Price</th>
                    <th className="py-3 font-bold text-gray-800 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items.map((item, idx) => {
                    const priceNum = typeof item.price === 'number' ? item.price : Number(item.price.replace(/[^0-9.-]+/g,""));
                    return (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-4">
                          <p className="font-bold text-[#2B2B2B]">{item.title}</p>
                          {item.size && <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>}
                        </td>
                        <td className="py-4 text-center">{item.quantity}</td>
                        <td className="py-4 text-right">₹{formatPrice(item.price)}</td>
                        <td className="py-4 text-right font-bold">₹{formatPrice(priceNum * item.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-8 flex justify-end">
                <div className="w-64 border-t-2 border-gray-800 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total Amount</span>
                    <span className="text-[#C9A227]">₹{formatPrice(invoiceOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 text-center text-sm text-gray-500 print:mt-24">
                <p>Thank you for shopping with Kriva Studio!</p>
                <p className="mt-1">If you have any questions about this invoice, contact support@krivastudio.in</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E8DCC8] flex items-center justify-between bg-[#FAF8F2]">
              <h3 className="font-serif text-xl font-bold text-[#2B2B2B]">Manage Order {selectedOrder.orderId}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-[#8A8070] hover:text-[#2B2B2B]">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Shipping & Customer */}
                <div>
                  <h4 className="font-bold text-[#2B2B2B] uppercase tracking-wider text-sm mb-4">Shipping Address</h4>
                  <div className="bg-[#FAF8F2] p-4 rounded-xl border border-[#E8DCC8] space-y-1 text-sm text-[#5A5548]">
                    <p className="font-bold text-[#2B2B2B]">{selectedOrder.customer?.name}</p>
                    <p>{selectedOrder.customer?.address}</p>
                    <p>{selectedOrder.customer?.city} - {selectedOrder.customer?.pincode}</p>
                    <p className="pt-2 mt-2 border-t border-[#E8DCC8]/50">📞 {selectedOrder.customer?.phone}</p>
                  </div>
                </div>

                {/* Logistics */}
                <div>
                  <h4 className="font-bold text-[#2B2B2B] uppercase tracking-wider text-sm mb-4 flex items-center justify-between">
                    Logistics Details
                    {TIMELINE_STAGES.indexOf(selectedOrder.trackingStatus) < 3 && (
                      <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded font-medium normal-case">
                        Editable after Packed
                      </span>
                    )}
                  </h4>
                  <div className="space-y-4">
                    <fieldset disabled={TIMELINE_STAGES.indexOf(selectedOrder.trackingStatus) < 3} className="space-y-4 disabled:opacity-60">
                      <div>
                        <label className="block text-xs font-bold text-[#8A8070] mb-1">Shipping Mode</label>
                        <select
                          value={selectedOrder.shippingMode || ""}
                          onChange={e => setSelectedOrder({...selectedOrder, shippingMode: e.target.value})}
                          className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm bg-white"
                        >
                          <option value="">Select Mode...</option>
                          <option value="Courier">Courier</option>
                          <option value="India Post">India Post</option>
                          <option value="Rapido Parcel">Rapido Parcel</option>
                          <option value="DTDC">DTDC</option>
                          <option value="BlueDart">BlueDart</option>
                          <option value="Delhivery">Delhivery</option>
                          <option value="Professional Courier">Professional Courier</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-[#8A8070] mb-1">Courier Name</label>
                          <input 
                            type="text" 
                            value={selectedOrder.courierName || ""}
                            onChange={e => setSelectedOrder({...selectedOrder, courierName: e.target.value})}
                            className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                            placeholder="e.g. BlueDart"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-[#8A8070] mb-1">Courier Contact</label>
                          <input 
                            type="text" 
                            value={selectedOrder.courierContact || ""}
                            onChange={e => setSelectedOrder({...selectedOrder, courierContact: e.target.value})}
                            className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8A8070] mb-1">Tracking Number / AWB</label>
                        <input 
                          type="text" 
                          value={selectedOrder.trackingNumber || ""}
                          onChange={e => setSelectedOrder({...selectedOrder, trackingNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-[2]">
                          <label className="block text-xs font-bold text-[#8A8070] mb-1">Dispatch Date</label>
                          <input 
                            type="date" 
                            value={selectedOrder.dispatchDate ? new Date(selectedOrder.dispatchDate).toISOString().split('T')[0] : ""}
                            onChange={e => setSelectedOrder({...selectedOrder, dispatchDate: e.target.value})}
                            className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-[#8A8070] mb-1">Time</label>
                          <input 
                            type="time" 
                            value={selectedOrder.dispatchTime || ""}
                            onChange={e => setSelectedOrder({...selectedOrder, dispatchTime: e.target.value})}
                            className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-[#8A8070] mb-1">Expected Delivery</label>
                          <input 
                            type="date" 
                            value={selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toISOString().split('T')[0] : ""}
                            onChange={e => setSelectedOrder({...selectedOrder, expectedDeliveryDate: e.target.value})}
                            className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-[#8A8070] mb-1">Pickup Location</label>
                          <input 
                            type="text" 
                            value={selectedOrder.pickupLocation || ""}
                            onChange={e => setSelectedOrder({...selectedOrder, pickupLocation: e.target.value})}
                            className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8A8070] mb-1">Delivery Notes (Visible to Customer)</label>
                        <textarea 
                          value={selectedOrder.shippingNotes || ""}
                          onChange={e => setSelectedOrder({...selectedOrder, shippingNotes: e.target.value})}
                          className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm resize-none h-20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8A8070] mb-1">Admin Notes (Internal)</label>
                        <textarea 
                          value={selectedOrder.adminNotes || ""}
                          onChange={e => setSelectedOrder({...selectedOrder, adminNotes: e.target.value})}
                          className="w-full px-3 py-2 border border-[#E8DCC8] rounded outline-none focus:border-[#C9A227] text-sm resize-none h-20 bg-gray-50"
                        />
                      </div>

                      {selectedOrder.trackingStatus === "Delivered" && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 mt-4 space-y-3">
                          <h5 className="font-bold text-green-800 text-xs uppercase mb-2">Delivery Confirmation</h5>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-green-700 mb-1">Delivered By</label>
                              <input 
                                type="text" 
                                value={selectedOrder.deliveredBy || ""}
                                onChange={e => setSelectedOrder({...selectedOrder, deliveredBy: e.target.value})}
                                className="w-full px-3 py-2 border border-green-200 rounded outline-none focus:border-green-400 text-sm bg-white"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-bold text-green-700 mb-1">Received By</label>
                              <input 
                                type="text" 
                                value={selectedOrder.receivedBy || ""}
                                onChange={e => setSelectedOrder({...selectedOrder, receivedBy: e.target.value})}
                                className="w-full px-3 py-2 border border-green-200 rounded outline-none focus:border-green-400 text-sm bg-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-green-700 mb-1">Delivery Remarks</label>
                            <input 
                              type="text" 
                              value={selectedOrder.deliveryRemarks || ""}
                              onChange={e => setSelectedOrder({...selectedOrder, deliveryRemarks: e.target.value})}
                              className="w-full px-3 py-2 border border-green-200 rounded outline-none focus:border-green-400 text-sm bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </fieldset>
                  </div>
                </div>

                {/* Refund Section (if cancelled) */}
                {selectedOrder.orderStatus === "Cancelled" && (
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-[#2B2B2B] uppercase tracking-wider text-sm mb-4">Refund Management</h4>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
                      <div>
                        <label className="block text-xs font-bold text-red-800 mb-1">Update Status</label>
                        <select 
                          value={selectedOrder.refundStatus || "Initiated"}
                          onChange={e => setSelectedOrder({...selectedOrder, refundStatus: e.target.value})}
                          className="px-3 py-2 border border-red-200 rounded outline-none text-sm bg-white"
                        >
                          <option value="Initiated">Initiated</option>
                          <option value="Pending">Pending</option>
                          <option value="Completed">Completed</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-red-800 mb-1">Refund Reference ID (Optional)</label>
                        <input 
                          type="text" 
                          value={selectedOrder.refundId || ""}
                          onChange={e => setSelectedOrder({...selectedOrder, refundId: e.target.value})}
                          className="w-full px-3 py-2 border border-red-200 rounded outline-none text-sm bg-white"
                          placeholder="Razorpay Refund ID"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E8DCC8] bg-[#FAF8F2] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-sm font-bold text-[#5A5548] hover:bg-[#E8DCC8] rounded-lg transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  updateOrderStatus(selectedOrder.orderId, selectedOrder.trackingStatus, {
                    shippingMode: selectedOrder.shippingMode,
                    courierName: selectedOrder.courierName,
                    courierContact: selectedOrder.courierContact,
                    trackingNumber: selectedOrder.trackingNumber,
                    dispatchDate: selectedOrder.dispatchDate,
                    dispatchTime: selectedOrder.dispatchTime,
                    expectedDeliveryDate: selectedOrder.expectedDeliveryDate,
                    pickupLocation: selectedOrder.pickupLocation,
                    shippingNotes: selectedOrder.shippingNotes,
                    adminNotes: selectedOrder.adminNotes,
                    deliveredBy: selectedOrder.deliveredBy,
                    receivedBy: selectedOrder.receivedBy,
                    deliveryRemarks: selectedOrder.deliveryRemarks,
                    refundStatus: selectedOrder.refundStatus,
                    refundId: selectedOrder.refundId
                  });
                  setSelectedOrder(null);
                }}
                className="px-5 py-2 text-sm font-bold bg-[#C9A227] text-white hover:bg-[#B38D1E] rounded-lg shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
