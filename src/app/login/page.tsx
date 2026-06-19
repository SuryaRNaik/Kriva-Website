"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center bg-[#FAF8F2]">
      <div className="max-w-5xl w-full mx-auto px-6">
        {/* Back button */}
        <div className="mb-6">
          <BackButton />
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#E8DCC8]/50">
          
          {/* Left side - Image */}
          <div className="md:w-1/2 relative min-h-[300px] md:min-h-[600px] hidden md:block">
            <Image
              src="/images/style_lehenga.png" // Reusing the high-quality lehenga image
              alt="Kriva Studio Login"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/60 via-[#2B2B2B]/10 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10 text-white">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Welcome to Kriva
              </h2>
              <p className="text-white/90 text-sm tracking-wide">
                Sign in to save your favorite handpainted artworks and manage your orders.
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="md:w-1/2 p-10 lg:p-14 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sign In
              </h1>
              <p className="text-[#8A8070] text-sm">
                Enter your credentials to access your account.
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xs font-semibold text-[#444] uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm text-[#2B2B2B]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#444] uppercase tracking-wide">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#C9A227] hover:underline font-medium">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8070]" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E0E0E0] focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all text-sm text-[#2B2B2B]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="remember" className="rounded text-[#C9A227] focus:ring-[#C9A227] w-4 h-4 border-[#E0E0E0]" />
                <label htmlFor="remember" className="text-sm text-[#666]">
                  Remember me for 30 days
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-[#2B2B2B] font-semibold shadow-gold hover:opacity-90 transition-all duration-300 transform active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px bg-[#E0E0E0] flex-1" />
              <span className="text-xs text-[#8A8070] font-medium uppercase">Or continue with</span>
              <div className="h-px bg-[#E0E0E0] flex-1" />
            </div>

            <div className="mt-6 flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E0E0E0] hover:bg-gray-50 transition-colors text-sm font-medium text-[#444]">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E0E0E0] hover:bg-gray-50 transition-colors text-sm font-medium text-[#444]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-[#666]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#C9A227] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
