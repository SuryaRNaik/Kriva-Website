"use client";

import { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, X, Calendar, MapPin, Mail, Phone, DollarSign } from "lucide-react";
import toast from "react-hot-toast";

type CustomerStat = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  createdAt: string;
  totalOrders: number;
  activeOrders: number;
  cancelledOrders: number;
  deliveredOrders: number;
  totalSpent: number;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerStat | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (e) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Customers</h2>
          <p className="text-[#8A8070] text-sm mt-1">Manage customer profiles and order histories.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[#E8DCC8] rounded-lg text-sm focus:border-[#C9A227] outline-none w-72 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-[#E8DCC8] flex flex-col items-center">
          <Users size={48} className="text-[#E8DCC8] mb-4" />
          <p className="text-[#5A5548] font-medium">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DCC8] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#E8DCC8]">
                  <th className="py-4 px-6 text-xs font-bold text-[#8A8070] uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#8A8070] uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#8A8070] uppercase tracking-wider text-center">Total Orders</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#8A8070] uppercase tracking-wider text-right">Total Spent</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#8A8070] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]">
                {filteredCustomers.map(customer => (
                  <tr key={customer._id} className="hover:bg-[#FAF8F2]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8DCC8] flex items-center justify-center font-bold text-[#C9A227]">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2B2B2B]">{customer.name}</p>
                          <p className="text-xs text-[#8A8070]">Joined {new Date(customer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-[#5A5548]">{customer.email}</p>
                      <p className="text-xs text-[#8A8070] mt-0.5">{customer.phone || 'No phone'}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-[#5A5548] bg-[#FAF8F2] px-3 py-1 rounded-full border border-[#E8DCC8]">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-bold text-[#C9A227]">₹{customer.totalSpent.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-sm font-bold text-[#C9A227] hover:text-[#B38D1E] hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-[#E8DCC8] flex items-center justify-between bg-[#FAF8F2]">
              <h3 className="font-serif text-xl font-bold text-[#2B2B2B]">Customer Profile</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-[#8A8070] hover:text-[#2B2B2B]">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-[#E8DCC8] flex flex-shrink-0 items-center justify-center text-3xl font-bold text-[#C9A227] border-4 border-white shadow-md">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2B2B2B]">{selectedCustomer.name}</h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#5A5548]">
                    <div className="flex items-center gap-1.5"><Mail size={16} className="text-[#C9A227]" /> {selectedCustomer.email}</div>
                    {selectedCustomer.phone && <div className="flex items-center gap-1.5"><Phone size={16} className="text-[#C9A227]" /> {selectedCustomer.phone}</div>}
                    {selectedCustomer.city && <div className="flex items-center gap-1.5"><MapPin size={16} className="text-[#C9A227]" /> {selectedCustomer.city}</div>}
                    <div className="flex items-center gap-1.5"><Calendar size={16} className="text-[#C9A227]" /> Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-[#2B2B2B] border-b border-[#E8DCC8] pb-2 mb-4">Order Statistics</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#FAF8F2] p-4 rounded-xl border border-[#E8DCC8] text-center">
                  <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center text-[#5A5548] mb-2 shadow-sm"><ShoppingBag size={14} /></div>
                  <p className="text-2xl font-bold text-[#2B2B2B]">{selectedCustomer.totalOrders}</p>
                  <p className="text-[10px] font-bold text-[#8A8070] uppercase">Total Orders</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                  <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center text-green-600 mb-2 shadow-sm"><ShoppingBag size={14} /></div>
                  <p className="text-2xl font-bold text-green-700">{selectedCustomer.deliveredOrders}</p>
                  <p className="text-[10px] font-bold text-green-700 uppercase">Delivered</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                  <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center text-red-600 mb-2 shadow-sm"><ShoppingBag size={14} /></div>
                  <p className="text-2xl font-bold text-red-700">{selectedCustomer.cancelledOrders}</p>
                  <p className="text-[10px] font-bold text-red-700 uppercase">Cancelled</p>
                </div>
                <div className="bg-[#FAF8F2] p-4 rounded-xl border border-[#C9A227] text-center shadow-sm">
                  <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center text-[#C9A227] mb-2 shadow-sm"><DollarSign size={14} /></div>
                  <p className="text-xl font-bold text-[#C9A227]">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-[#8A8070] uppercase">Total Spent</p>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex gap-3 border border-blue-100">
                <span className="font-bold">Security Note:</span>
                For security and privacy reasons, admin accounts cannot view or modify customer passwords or initiate password resets.
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-[#E8DCC8] flex justify-end bg-gray-50">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2 bg-white border border-[#E8DCC8] text-[#5A5548] rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
