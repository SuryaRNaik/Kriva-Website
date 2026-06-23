"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

// Custom social SVG icons
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="bg-white border-t border-[#E8DCC8]"
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
        {/* Main grid: 3 columns like reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/krivanewlogo.png"
                alt="Kriva Studio"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
              <div>
                <p
                  className="text-lg font-bold text-[#2B2B2B]"
                  style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.15rem" }}
                >
                  Kriva Art Studio
                </p>
              </div>
            </div>
            <p className="text-sm text-[#8A8070] leading-relaxed max-w-[220px]">
              Preserving the timeless beauty of Indian art through handmade Tanjore paintings and fabric art.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-5">
              <a href="#" id="footer-instagram" aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-[#E8DCC8] flex items-center justify-center text-[#C9A227] hover:bg-[#F5F0E6] transition-colors"
              >
                <InstagramIcon />
              </a>
              <a href="#" id="footer-facebook" aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-[#E8DCC8] flex items-center justify-center text-[#C9A227] hover:bg-[#F5F0E6] transition-colors"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="text-sm font-semibold text-[#C9A227] tracking-wider uppercase mb-5"
            >
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/artworks", label: "Artworks" },
                { href: "/workshops", label: "Workshops" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#666] hover:text-[#C9A227] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-[#C9A227] tracking-wider uppercase mb-5">
              Contact Us
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:krivaartsstudio@gmail.com"
                id="footer-email"
                className="flex items-center gap-2.5 text-sm text-[#666] hover:text-[#C9A227] transition-colors"
              >
                <Mail size={14} className="text-[#C9A227]" />
                krivaartsstudio@gmail.com
              </a>
              <a
                href="tel:+91 9964877270"
                id="footer-phone"
                className="flex items-center gap-2.5 text-sm text-[#666] hover:text-[#C9A227] transition-colors"
              >
                <Phone size={14} className="text-[#C9A227]" />
                +91 9964877270
              </a>
              <div className="flex items-start gap-2.5 text-sm text-[#666]">
                <MapPin size={14} className="text-[#C9A227] mt-0.5 flex-shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#E8DCC8] text-center">
          <p className="text-xs text-[#aaa]">
            © {year} Kriva Arts Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
