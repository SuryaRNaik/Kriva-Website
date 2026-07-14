"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  PackageSearch, 
  Box, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Search,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  console.log("=== ADMIN DASHBOARD LAYOUT ===");
  console.log("Session:", session);
  console.log("User:", session?.user);
  console.log("Role:", (session?.user as any)?.role);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUnreadMessages(data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Failed to fetch unread count");
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    window.addEventListener('messages-updated', fetchUnreadCount);
    return () => window.removeEventListener('messages-updated', fetchUnreadCount);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  const NAV_ITEMS = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: PackageSearch },
    { name: "Inventory", href: "/admin/inventory", icon: Box },
    { name: "Products", href: "/admin/products", icon: PackageSearch },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare, badge: unreadMessages > 0 ? unreadMessages : null },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#FAF8F2] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-[#E8DCC8] w-64 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:relative flex flex-col shadow-sm`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#E8DCC8]">
          <span className="font-serif text-2xl font-bold text-[#C9A227]">Kriva Admin</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#5A5548]">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {NAV_ITEMS.map((item: any) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${isActive ? 'bg-[#C9A227] text-white shadow-md' : 'text-[#5A5548] hover:bg-[#FAF8F2]'}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-[#8A8070]"} />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="absolute right-4 text-[10px] font-bold bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full shadow-sm">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E8DCC8]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-[#C62828] hover:bg-[#FFEBEE] rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E8DCC8] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-[#5A5548]">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#2B2B2B]">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'} 👋
              </h1>
              <p className="text-sm text-[#8A8070]">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#FAF8F2] px-4 py-2 rounded-full border border-[#E8DCC8]">
              <Search size={18} className="text-[#8A8070] mr-2" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="bg-transparent border-none outline-none text-sm w-64 text-[#2B2B2B]"
              />
            </div>
            
            <div className="h-10 w-10 rounded-full bg-[#E8DCC8] flex items-center justify-center border-2 border-[#C9A227] text-[#C9A227] font-bold font-serif overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                (session?.user?.name || "A").charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
