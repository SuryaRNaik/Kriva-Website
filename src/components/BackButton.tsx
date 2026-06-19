"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#5A5548] bg-white border border-[#E8DCC8] hover:border-[#C9A227] hover:text-[#C9A227] transition-all duration-200 shadow-sm"
    >
      <ArrowLeft size={15} />
      Back to Home
    </Link>
  );
}
