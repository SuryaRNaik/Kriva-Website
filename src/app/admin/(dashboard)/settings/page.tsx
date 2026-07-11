"use client";

import { useState, useEffect } from "react";
import { Save, Download, Store, Settings, Mail, Shield, User } from "lucide-react";
import toast from "react-hot-toast";

type AdminSettings = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  cancellationWindowHours: number;
  defaultProductionDays: number;
  defaultDeliveryDays: number;
  lowStockThreshold: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSenderName: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (e) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const exportOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch");
      
      const orders = data.orders;
      const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Total Amount", "Status", "Tracking Number"];
      const csvData = orders.map((o: any) => [
        o.orderId,
        new Date(o.createdAt).toLocaleDateString(),
        `"${o.customer?.name || ''}"`,
        o.customer?.email,
        o.totalAmount,
        o.trackingStatus,
        o.trackingNumber || ''
      ].join(","));
      
      const csv = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kriva_orders_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (e) {
      toast.error("Failed to export orders");
    }
  };

  const exportCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (!data.success) throw new Error("Failed to fetch");
      
      const customers = data.customers;
      const headers = ["Name", "Email", "Phone", "Joined Date", "Total Orders", "Total Spent"];
      const csvData = customers.map((c: any) => [
        `"${c.name}"`,
        c.email,
        c.phone || '',
        new Date(c.createdAt).toLocaleDateString(),
        c.totalOrders,
        c.totalSpent
      ].join(","));
      
      const csv = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kriva_customers_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (e) {
      toast.error("Failed to export customers");
    }
  };

  if (loading) return <div className="py-20 text-center">Loading settings...</div>;
  if (!settings) return <div className="py-20 text-center text-red-500">Failed to load settings.</div>;

  const tabs = [
    { id: "store", label: "Store Information", icon: Store },
    { id: "business", label: "Business Settings", icon: Settings },
    { id: "smtp", label: "Email / SMTP", icon: Mail },
    { id: "admin", label: "Admin Profile", icon: User },
    { id: "export", label: "Data Export", icon: Download },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Platform Settings</h2>
        <p className="text-[#8A8070] text-sm mt-1">Configure global store preferences and exports.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-bold ${
                  activeTab === tab.id 
                    ? "bg-[#C9A227] text-white shadow-sm" 
                    : "text-[#5A5548] hover:bg-white border border-transparent hover:border-[#E8DCC8]"
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-[#E8DCC8] p-6 md:p-8 shadow-sm">
          {activeTab !== "export" && activeTab !== "admin" ? (
            <form onSubmit={handleSave} className="space-y-6">
              
              {activeTab === "store" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-[#2B2B2B] border-b border-[#E8DCC8] pb-2">Store Information</h3>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Store Name</label>
                    <input type="text" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Support Email</label>
                    <input type="email" value={settings.storeEmail} onChange={e => setSettings({...settings, storeEmail: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Support Phone</label>
                    <input type="text" value={settings.storePhone} onChange={e => setSettings({...settings, storePhone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Physical Address</label>
                    <textarea value={settings.storeAddress} onChange={e => setSettings({...settings, storeAddress: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm h-24 resize-none" />
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-[#2B2B2B] border-b border-[#E8DCC8] pb-2">Business Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Cancellation Window (Hours)</label>
                      <input type="number" value={settings.cancellationWindowHours} onChange={e => setSettings({...settings, cancellationWindowHours: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Low Stock Threshold</label>
                      <input type="number" value={settings.lowStockThreshold} onChange={e => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Default Production (Days)</label>
                      <input type="number" value={settings.defaultProductionDays} onChange={e => setSettings({...settings, defaultProductionDays: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Default Delivery (Days)</label>
                      <input type="number" value={settings.defaultDeliveryDays} onChange={e => setSettings({...settings, defaultDeliveryDays: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "smtp" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-[#2B2B2B] border-b border-[#E8DCC8] pb-2">Email / SMTP Configuration</h3>
                  <p className="text-sm text-[#8A8070] mb-4">Configure your mail server for sending order updates and invoices.</p>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">SMTP Host</label>
                    <input type="text" value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} placeholder="e.g. smtp.gmail.com" className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">SMTP Port</label>
                      <input type="number" value={settings.smtpPort} onChange={e => setSettings({...settings, smtpPort: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">Sender Name</label>
                      <input type="text" value={settings.smtpSenderName} onChange={e => setSettings({...settings, smtpSenderName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">SMTP Username / Email</label>
                    <input type="text" value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8A8070] uppercase tracking-wider mb-2">SMTP Password / App Password</label>
                    <input type="password" value={settings.smtpPass} onChange={e => setSettings({...settings, smtpPass: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#E8DCC8] outline-none focus:border-[#C9A227] text-sm" />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-[#E8DCC8] flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-8 py-3 bg-[#C9A227] text-white rounded-xl font-bold hover:bg-[#B38D1E] transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
                >
                  <Save size={18} /> {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          ) : activeTab === "admin" ? (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#2B2B2B] border-b border-[#E8DCC8] pb-2">Admin Profile</h3>
              <p className="text-sm text-[#8A8070]">Admin profile credentials are managed securely through environment variables and server configuration for production safety.</p>
              <div className="bg-[#FAF8F2] p-6 rounded-xl border border-[#E8DCC8] space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="text-[#C9A227]" size={24} />
                  <div>
                    <p className="font-bold text-[#2B2B2B]">Admin Security</p>
                    <p className="text-xs text-[#8A8070]">Role-based access is active.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#2B2B2B] border-b border-[#E8DCC8] pb-2">Data Export</h3>
              <p className="text-sm text-[#8A8070] mb-6">Download your platform data as CSV files for external accounting or analytics.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF8F2] p-6 rounded-xl border border-[#E8DCC8] flex flex-col items-start gap-4">
                  <div>
                    <h4 className="font-bold text-[#2B2B2B]">Export Orders</h4>
                    <p className="text-xs text-[#8A8070] mt-1">Download all historic orders including amounts and statuses.</p>
                  </div>
                  <button onClick={exportOrders} className="mt-auto flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DCC8] text-[#5A5548] rounded-lg font-bold hover:border-[#C9A227] hover:text-[#C9A227] transition-all text-sm">
                    <Download size={16} /> Download CSV
                  </button>
                </div>

                <div className="bg-[#FAF8F2] p-6 rounded-xl border border-[#E8DCC8] flex flex-col items-start gap-4">
                  <div>
                    <h4 className="font-bold text-[#2B2B2B]">Export Customers</h4>
                    <p className="text-xs text-[#8A8070] mt-1">Download customer database with total spent metrics.</p>
                  </div>
                  <button onClick={exportCustomers} className="mt-auto flex items-center gap-2 px-4 py-2 bg-white border border-[#E8DCC8] text-[#5A5548] rounded-lg font-bold hover:border-[#C9A227] hover:text-[#C9A227] transition-all text-sm">
                    <Download size={16} /> Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
