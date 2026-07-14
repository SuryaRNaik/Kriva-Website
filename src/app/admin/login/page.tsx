"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid admin credentials");
      } else {
        toast.success("Welcome back, Admin!");
        // Use hard navigation to ensure cookies are fresh and middleware intercepts correctly
        window.location.href = "/admin";
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F2] p-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#E8DCC8]/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C9A227]/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl relative z-10 border border-[#E8DCC8]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#FAF8F2] rounded-full flex items-center justify-center border-2 border-[#C9A227] mb-4">
            <Lock className="text-[#C9A227]" size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#2B2B2B]">Admin Access</h1>
          <p className="text-[#8A8070] mt-2 text-center text-sm">
            Please sign in with your administrator credentials to manage Kriva Studio.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-2 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DCC8] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-colors bg-[#FAF8F2]"
              placeholder="admin@krivastudio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B2B2B] mb-2 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E8DCC8] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-colors bg-[#FAF8F2]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C9A227] hover:bg-[#B38D1E] text-white py-3.5 rounded-lg font-bold tracking-wide transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 uppercase"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-[#8A8070]">
            Secure area. Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
