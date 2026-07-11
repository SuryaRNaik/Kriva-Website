"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import BackButton from "@/components/BackButton";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        toast.success("Reset link sent!");
      } else {
        toast.error(data.error || "Failed to send reset link");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col justify-center bg-[#FAF8F2]">
      <div className="max-w-md w-full mx-auto px-6">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-[#E8DCC8]/50 p-8 md:p-10">
          <h1 className="text-2xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Forgot Password
          </h1>
          
          {submitted ? (
            <div className="mt-4">
              <p className="text-[#5A5548] text-sm mb-6">
                If an account exists for <strong>{email}</strong>, we have sent a password reset link. Please check your inbox (and spam folder).
              </p>
              <Link href="/login" className="block w-full py-3.5 text-center rounded-xl text-white font-semibold shadow-gold bg-[#C9A227] hover:opacity-90 transition-all">
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[#8A8070] text-sm mb-8">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
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
                
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 rounded-xl text-[#2B2B2B] font-semibold shadow-gold hover:opacity-90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
