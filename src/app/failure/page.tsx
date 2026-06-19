"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function FailurePage() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#FAF8F2] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 md:p-12 text-center rounded-3xl shadow-lg border border-[#E8DCC8]">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Payment Failed
        </h1>
        
        <p className="text-[#8A8070] mb-8 leading-relaxed">
          Unfortunately, your payment could not be processed. Don't worry, no charges were made.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center w-full py-4 rounded-xl text-[#2B2B2B] font-bold shadow-gold transition-all duration-300 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
          >
            Try Again
          </Link>
          <Link
            href="/cart"
            className="inline-flex items-center justify-center w-full py-4 rounded-xl text-[#8A8070] font-bold border border-[#E8DCC8] hover:border-[#C9A227] hover:text-[#C9A227] transition-all duration-300 bg-white"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
