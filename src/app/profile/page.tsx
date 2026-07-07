"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";
import { CheckCircle, Package, LogOut, Edit3, MapPin, User, Phone, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/customer/profile");
      const data = await res.json();
      if (data.success) {
        setProfile(data.customer);
        setFormData({
          phone: data.customer.phone || "",
          address: data.customer.address || "",
          city: data.customer.city || "",
          pincode: data.customer.pincode || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully");
        setProfile(data.customer);
        setEditing(false);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading || status === "loading") {
    return <div className="min-h-screen pt-32 pb-12 text-center text-[#8A8070]">Loading...</div>;
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#FAF8F2]">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header / Back */}
        <div className="mb-8 flex items-center justify-between">
          <BackButton />
        </div>

        {/* Profile Header section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#C9A227] flex items-center justify-center text-3xl text-white font-bold shadow-md shrink-0">
            {getInitials(profile?.name)}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {profile?.name}
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle size={12} />
                Verified
              </span>
            </div>
            <p className="text-[#8A8070] flex items-center justify-center md:justify-start gap-2 mb-2">
              <Mail size={14} /> {profile?.email}
            </p>
            <p className="text-xs text-[#A89F91] flex items-center justify-center md:justify-start gap-1">
              <Calendar size={12} />
              Joined {new Date(profile?.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Card 1: Account Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-6 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-[#2B2B2B] flex items-center gap-2 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              <User size={18} className="text-[#C9A227]" />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#8A8070] uppercase tracking-wide mb-1">Name</p>
                <p className="text-[#444] font-medium">{profile?.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8A8070] uppercase tracking-wide mb-1">Email</p>
                <p className="text-[#444] font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#8A8070] uppercase tracking-wide mb-1">Phone</p>
                <p className="text-[#444] font-medium">{profile?.phone || <span className="text-[#A89F91] italic">Not added</span>}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Saved Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#2B2B2B] flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <MapPin size={18} className="text-[#C9A227]" />
                Saved Address
              </h2>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)} 
                  className="text-xs font-bold text-[#C9A227] border border-[#C9A227] px-3 py-1 rounded-full hover:bg-[#F5F0E6] transition-colors flex items-center gap-1"
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="flex-1">
                {profile?.address ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-[#8A8070] uppercase tracking-wide mb-1">Street Address</p>
                      <p className="text-[#444] font-medium leading-relaxed">{profile.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[#8A8070] uppercase tracking-wide mb-1">City</p>
                        <p className="text-[#444] font-medium">{profile.city}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#8A8070] uppercase tracking-wide mb-1">Pincode</p>
                        <p className="text-[#444] font-medium">{profile.pincode}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-4">
                    <MapPin size={32} className="text-[#D4AF37]/40 mb-3" />
                    <p className="text-[#8A8070] text-sm">No address saved yet. Add your delivery details for faster checkout.</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-sm outline-none focus:border-[#C9A227]" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#444] mb-1">Full Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-sm outline-none focus:border-[#C9A227]" required />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#444] mb-1">City</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-sm outline-none focus:border-[#C9A227]" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#444] mb-1">Pincode</label>
                    <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full px-3 py-2 border border-[#E0E0E0] rounded-xl text-sm outline-none focus:border-[#C9A227]" required />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 px-4 py-2 bg-[#C9A227] hover:bg-[#A07830] transition-colors text-white rounded-xl text-sm font-bold shadow-sm">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-[#E0E0E0] text-[#666] hover:bg-gray-50 transition-colors rounded-xl text-sm font-bold">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Dedicated Action Card for Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8DCC8] p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F0E6] flex items-center justify-center text-[#C9A227]">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                My Orders
              </h2>
              <p className="text-sm text-[#8A8070] mt-1">
                Track, cancel and manage your purchases.
              </p>
            </div>
          </div>
          <Link href="/my-orders" className="w-full md:w-auto">
            <button className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] whitespace-nowrap">
              View Orders &rarr;
            </button>
          </Link>
        </div>

        {/* Subtle Logout Button */}
        <div className="flex justify-center border-t border-[#E8DCC8] pt-8">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
