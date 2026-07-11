"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        
        const data = await res.json();
        
        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E8DCC8]/50 max-w-md w-full text-center">
      {status === "loading" && (
        <div className="py-12">
          <div className="w-12 h-12 border-4 border-[#E8DCC8] border-t-[#C9A227] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#2B2B2B]">Verifying...</h2>
          <p className="text-sm text-[#8A8070] mt-2">Please wait while we verify your email.</p>
        </div>
      )}
      
      {status === "success" && (
        <div className="py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#2B2B2B] mb-2">Verified!</h2>
          <p className="text-sm text-[#5A5548] mb-8">{message}</p>
          <Link href="/login" className="px-8 py-3 rounded-xl text-white font-semibold shadow-gold hover:opacity-90 transition-all bg-[#C9A227]">
            Go to Login
          </Link>
        </div>
      )}
      
      {status === "error" && (
        <div className="py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <XCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#2B2B2B] mb-2">Verification Failed</h2>
          <p className="text-sm text-[#5A5548] mb-8">{message}</p>
          <Link href="/login" className="text-[#C9A227] font-semibold hover:underline">
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-[#FAF8F2] px-6">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
