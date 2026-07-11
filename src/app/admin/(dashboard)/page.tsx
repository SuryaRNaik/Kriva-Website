"use client";

import { useEffect, useState } from "react";
import { PackageSearch, TrendingUp, Clock, PackageCheck, Truck, XCircle, Users, BarChart3, ShoppingBag } from "lucide-react";

type Stats = {
  todaysOrdersCount: number;
  revenueToday: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  totalCustomers: number;
  conversionRate: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
};

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Reverse monthly revenue to show oldest to newest left to right
          if (data.stats.monthlyRevenue) {
            data.stats.monthlyRevenue = data.stats.monthlyRevenue.reverse();
          }
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A227]"></div>
      </div>
    );
  }

  // Helper to get max revenue for chart scaling
  const maxRevenue = stats?.monthlyRevenue ? Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1) : 1;

  const statCards = [
    { title: "Today's Revenue", value: `₹${(stats?.revenueToday || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { title: "Today's Orders", value: stats?.todaysOrdersCount || 0, icon: PackageSearch, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Customers", value: stats?.totalCustomers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Avg. Order Value", value: `₹${Math.round(stats?.avgOrderValue || 0).toLocaleString('en-IN')}`, icon: BarChart3, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "Conversion Rate", value: `${stats?.conversionRate || 0}%`, icon: PackageCheck, color: "text-[#C9A227]", bg: "bg-[#FAF8F2]" },
  ];

  return (
    <div className="pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2B2B2B]">Dashboard Overview</h2>
          <p className="text-[#8A8070] mt-1">Here is what's happening with your store today.</p>
        </div>
        <div className="bg-[#FAF8F2] border border-[#E8DCC8] px-4 py-2 rounded-xl text-right">
          <p className="text-xs font-bold text-[#8A8070] uppercase">Total Lifetime Revenue</p>
          <p className="text-xl font-bold text-[#C9A227]">₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DCC8] flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300 group">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs text-[#8A8070] font-bold uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[#2B2B2B] mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8DCC8]">
          <h3 className="font-serif text-lg font-bold text-[#2B2B2B] mb-6 border-b border-[#E8DCC8] pb-4">Revenue (Last 6 Months)</h3>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-4">
            {stats?.monthlyRevenue?.map((data, idx) => {
              const heightPercent = data.revenue > 0 ? Math.max((data.revenue / maxRevenue) * 100, 5) : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full h-full flex items-end justify-center">
                    <div 
                      className="w-full max-w-[40px] bg-[#E8DCC8] rounded-t-lg transition-all duration-500 group-hover:bg-[#C9A227]"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2B2B2B] text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        ₹{data.revenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#8A8070]">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8DCC8] flex flex-col">
          <h3 className="font-serif text-lg font-bold text-[#2B2B2B] mb-6 border-b border-[#E8DCC8] pb-4">Top Selling Products</h3>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {!stats?.topProducts || stats.topProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[#8A8070] opacity-50">
                <ShoppingBag size={32} className="mb-2" />
                <p className="text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="space-y-5">
                {stats.topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F2] border border-[#C9A227] text-[#C9A227] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2B2B2B] text-sm truncate" title={product.name}>{product.name}</p>
                      <p className="text-xs text-[#8A8070]">{product.sold} units sold</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#C9A227] text-sm">₹{product.revenue.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
