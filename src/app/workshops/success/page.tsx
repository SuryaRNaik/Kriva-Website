"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function WorkshopSuccessPage() {
  const [orderDetails, setOrderDetails] = useState<{orderId: string, email: string} | null>(null);

  useEffect(() => {
    // Retrieve mock order details
    const data = localStorage.getItem("kriva_workshop_order");
    if (data) {
      setOrderDetails(JSON.parse(data));
      // Clean up after displaying
      localStorage.removeItem("kriva_workshop_order");
    }
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-[#FAF8F2] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white p-8 md:p-12 text-center rounded-3xl shadow-lg border border-[#E8DCC8]">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Booking Confirmed!
        </h1>
        
        <p className="text-[#8A8070] mb-8 leading-relaxed">
          Your seat at the workshop has been successfully reserved. We can't wait to see you there!
        </p>

        {orderDetails && (
          <div className="bg-[#FAF8F2] rounded-xl p-6 mb-8 text-sm text-[#5A5548] text-left space-y-3">
            <div className="flex justify-between border-b border-[#E8DCC8] pb-2">
              <span className="font-semibold text-[#2B2B2B]">Order ID:</span>
              <span className="font-mono">{orderDetails.orderId}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8DCC8] pb-2">
              <span className="font-semibold text-[#2B2B2B]">Email:</span>
              <span>{orderDetails.email}</span>
            </div>
            <div className="mt-4 p-3 bg-white border border-[#E8DCC8] rounded-lg text-center">
              <p className="text-xs font-semibold text-[#C9A227]">
                Please check your inbox!
              </p>
              <p className="text-[11px] text-[#8A8070] mt-1">
                We've sent a confirmation email with venue details and timings.
              </p>
            </div>
          </div>
        )}

        <Link
          href="/workshops"
          className="inline-flex items-center justify-center w-full py-4 rounded-xl text-[#2B2B2B] font-bold shadow-gold transition-all duration-300 hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
        >
          View More Workshops
        </Link>
      </div>
    </div>
  );
}
