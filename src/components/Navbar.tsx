"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingBag, Heart, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/artworks", label: "Collections" },
  { href: "/workshops", label: "Workshops" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, favorites } = useStore();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
          isScrolled ? "navbar-scrolled py-2" : "py-3 bg-[#FAF8F2]/95 shadow-sm"
        }`}
      >
        <nav className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" id="nav-logo" className="flex items-center gap-2">
            <Image
              src="/images/logo.jpg"
              alt="Kriva Studio by Ruchitha Reddy"
              width={56}
              height={56}
              className="rounded-full object-cover"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-base font-semibold text-[#2B2B2B] leading-tight" style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.2rem" }}>
                Kriva Studio
              </p>
              <p className="text-[10px] text-[#C9A227] tracking-wide leading-none">
                by Ruchitha Reddy
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8" id="nav-desktop-links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[#5A5548] hover:text-[#C9A227] transition-colors duration-250 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#C9A227] rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/favorites"
              aria-label="Favorites"
              className="p-2 text-[#8A8070] hover:text-[#C9A227] transition-colors relative"
            >
              <Heart size={20} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#C9A227] rounded-full" />
              )}
            </Link>
            
            <Link
              href="/login"
              aria-label="User Login"
              className="p-2 text-[#8A8070] hover:text-[#C9A227] transition-colors"
            >
              <User size={20} />
            </Link>

            <Link
              href="/cart"
              id="nav-cart"
              aria-label="Cart"
              className="p-2 text-[#8A8070] hover:text-[#C9A227] transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-[#C9A227] text-white text-[10px] font-bold rounded-full px-1 border-2 border-[#FAF8F2]">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>

          {/* Mobile hamburger */}
          <button
            id="nav-hamburger"
            className="md:hidden p-2 text-[#C9A227]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        id="nav-mobile-menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-400 ${
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ background: "rgba(250,248,242,0.98)", backdropFilter: "blur(12px)" }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A07830]" />

        <div className="flex flex-col items-center justify-center h-full gap-8">
          {/* Logo in menu */}
          <Image
            src="/images/logo.jpg"
            alt="Kriva Studio"
            width={80}
            height={80}
            className="rounded-full object-cover shadow-gold-sm"
          />

          <ul className="flex flex-col items-center gap-6 w-full px-8">
            {navLinks.map((link, i) => (
              <li
                key={link.href}
                className="w-full text-center"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(12px)",
                  transition: `all 0.4s ease ${i * 0.08}s`,
                }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-2xl font-semibold text-[#2B2B2B] hover:text-[#C9A227] transition-colors py-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            <li className="w-full text-center mt-4 flex justify-center gap-6">
               <Link
                href="/favorites"
                onClick={() => setMenuOpen(false)}
                className="p-3 bg-[#F5F0E6] text-[#C9A227] rounded-full relative"
              >
                <Heart size={24} />
                {favorites.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#C9A227] rounded-full" />
                )}
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="p-3 bg-[#F5F0E6] text-[#C9A227] rounded-full"
              >
                <User size={24} />
              </Link>
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="p-3 bg-[#F5F0E6] text-[#C9A227] rounded-full relative"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                   <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] bg-[#C9A227] text-white text-xs font-bold rounded-full px-1 border-2 border-white">
                   {cartCount}
                 </span>
                )}
              </Link>
            </li>
          </ul>

          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mt-4" />
        </div>
      </div>
    </>
  );
}
