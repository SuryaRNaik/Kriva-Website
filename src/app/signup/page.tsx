"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";
import BackButton from "@/components/BackButton";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      toast.success(data.message || "Account created successfully!");
      
      // Auto-login after successful signup
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        toast.error("Failed to auto-login. Please login manually.");
        router.push("/login");
      } else {
        router.push("/");
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center bg-[#FAF8F2]">
      <div className="max-w-5xl w-full mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#E8DCC8]/50">
          
          {/* Left side - Image */}
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-[600px] hidden md:block">
            <Image
              src="/images/style_lehenga.png" 
              alt="Kriva Studio Sign Up"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/60 via-[#2B2B2B]/10 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Join the Kriva Family
              </h2>
              <p className="text-white/90 text-sm tracking-wide">
                Create an account to track your orders, save multiple addresses, and experience seamless checkout.
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="md:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sign Up
              </h1>
              <p className="text-[#8A8070] text-sm">
                Create your account to get started.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <label className="block text-xs font-semibold text-[#444] uppercase tracking-wide mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm text-[#2B2B2B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm text-[#2B2B2B]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm text-[#2B2B2B]"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#444] uppercase tracking-wide mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm text-[#2B2B2B]"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-xl text-[#2B2B2B] font-semibold shadow-gold hover:opacity-90 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px bg-[#E0E0E0] flex-1" />
              <span className="text-xs text-[#8A8070] font-medium uppercase">Or continue with</span>
              <div className="h-px bg-[#E0E0E0] flex-1" />
            </div>

            <div className="mt-6">
              <button 
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E0E0E0] hover:bg-gray-50 transition-colors text-sm font-medium text-[#444]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-[#666]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#C9A227] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
