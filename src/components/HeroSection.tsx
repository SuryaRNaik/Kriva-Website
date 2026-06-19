"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

// Gold Mandala Decoration
function GoldMandala({ size = 300, opacity = 0.08, spinning = true }: { size?: number; opacity?: number; spinning?: boolean }) {
  const rings = [30, 60, 90, 120, 140];
  const dots = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 300;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        opacity,
        animation: spinning ? "spin-slow 80s linear infinite" : "none",
        width: size,
        height: size,
      }}
    >
      {rings.map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r * scale * (size / 300)} stroke="#C9A227" strokeWidth="0.6" strokeDasharray="2 4" />
      ))}
      {spokes.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const r1 = 30 * scale * (size / 300);
        const r2 = 140 * scale * (size / 300);
        return (
          <line
            key={angle}
            x1={cx + r1 * Math.cos(rad)}
            y1={cy + r1 * Math.sin(rad)}
            x2={cx + r2 * Math.cos(rad)}
            y2={cy + r2 * Math.sin(rad)}
            stroke="#D4AF37"
            strokeWidth="0.4"
          />
        );
      })}
      {dots.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const r = 115 * scale * (size / 300);
        return (
          <circle
            key={angle}
            cx={cx + r * Math.cos(rad)}
            cy={cy + r * Math.sin(rad)}
            r={2.5}
            fill="#C9A227"
            fillOpacity="0.7"
          />
        );
      })}
      {/* Inner petal ring */}
      {[0, 60, 120, 180, 240, 300].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const r = 55 * scale * (size / 300);
        return (
          <ellipse
            key={angle}
            cx={cx + r * Math.cos(rad)}
            cy={cy + r * Math.sin(rad)}
            rx={12 * scale}
            ry={6 * scale}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.5"
            transform={`rotate(${angle}, ${cx + r * Math.cos(rad)}, ${cy + r * Math.sin(rad)})`}
          />
        );
      })}
    </svg>
  );
}

// Floating silk fabric wave
function SilkWave({ width = 200, height = 120, opacity = 0.1, delay = "0s", animClass = "animate-sway" }: {
  width?: number; height?: number; opacity?: number; delay?: string; animClass?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ opacity, animationDelay: delay, width, height }}
      className={animClass}
    >
      <path d={`M0 ${height * 0.5} C${width * 0.2} ${height * 0.15}, ${width * 0.4} ${height * 0.85}, ${width * 0.6} ${height * 0.4} C${width * 0.8} 0, ${width * 0.9} ${height * 0.65}, ${width} ${height * 0.3}`} stroke="#C9A227" strokeWidth="1.2" fill="none" />
      <path d={`M0 ${height * 0.6} C${width * 0.2} ${height * 0.25}, ${width * 0.4} ${height * 0.95}, ${width * 0.6} ${height * 0.5} C${width * 0.8} ${height * 0.1}, ${width * 0.9} ${height * 0.75}, ${width} ${height * 0.4}`} stroke="#D4AF37" strokeWidth="0.6" fill="none" />
      <path d={`M0 ${height * 0.45} C${width * 0.15} ${height * 0.1}, ${width * 0.35} ${height * 0.8}, ${width * 0.55} ${height * 0.35} C${width * 0.75} 0, ${width * 0.88} ${height * 0.6}, ${width} ${height * 0.25}`} stroke="#E8D48B" strokeWidth="0.4" fill="none" />
    </svg>
  );
}

// Needle + thread accent
function NeedleThread({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" style={{ opacity, width: 80, height: 80 }} className="animate-shimmer">
      {/* Needle body */}
      <line x1="15" y1="65" x2="65" y2="15" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
      {/* Needle eye */}
      <ellipse cx="63" cy="17" rx="4" ry="2.5" fill="none" stroke="#D4AF37" strokeWidth="1" transform="rotate(-45 63 17)" />
      {/* Thread loop */}
      <path d="M63 17 C70 8, 78 20, 70 28 C65 33, 55 28, 60 20" stroke="#E8D48B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Thread tail */}
      <path d="M15 65 C5 75, -5 80, 0 85" stroke="#C9A227" strokeWidth="0.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Gold embroidery circle
function EmbroiderCircle({ size = 60, opacity = 0.12, delay = "0s" }: { size?: number; opacity?: number; delay?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} fill="none" style={{ opacity, animationDelay: delay, width: size, height: size }} className="animate-float-slow">
      <circle cx={cx} cy={cy} r={r} stroke="#C9A227" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx={cx} cy={cy} r={r * 0.6} stroke="#D4AF37" strokeWidth="0.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line key={angle}
            x1={cx + r * 0.6 * Math.cos(rad)} y1={cy + r * 0.6 * Math.sin(rad)}
            x2={cx + r * Math.cos(rad)} y2={cy + r * Math.sin(rad)}
            stroke="#C9A227" strokeWidth="0.4"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill="#D4AF37" fillOpacity="0.6" />
    </svg>
  );
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #FAF8F2 0%, #F5F0E6 35%, #FBF7EE 65%, #FFFDF8 100%)",
      }}
    >
      {/* ── Decorative elements — client-only to prevent hydration mismatch ── */}
      {mounted && (
        <>
      {/* ── Large ambient glow blobs ── */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(201,162,39,0.07) 0%, transparent 65%)",
          transform: "translate(30%, -20%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(212,175,55,0.06) 0%, transparent 65%)",
          transform: "translate(-20%, 20%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(248,235,190,0.15) 0%, transparent 70%)",
          transform: "translate(-50%, -60%)",
        }}
      />

      {/* ── Large rotating mandala — top right ── */}
      <div className="absolute -top-24 -right-24 pointer-events-none">
        <GoldMandala size={420} opacity={0.07} spinning />
      </div>

      {/* ── Medium mandala — bottom left ── */}
      <div
        className="absolute -bottom-16 -left-16 pointer-events-none"
        style={{ animation: "spin-slow 100s linear infinite reverse" }}
      >
        <GoldMandala size={280} opacity={0.06} spinning={false} />
      </div>

      {/* ── Small mandala — mid left ── */}
      <div className="absolute top-1/3 -left-10 pointer-events-none">
        <GoldMandala size={160} opacity={0.09} spinning />
      </div>

      {/* ── Silk fabric waves ── */}
      <div className="absolute top-[15%] right-[8%] pointer-events-none">
        <SilkWave width={220} height={130} opacity={0.13} delay="0s" animClass="animate-sway" />
      </div>
      <div className="absolute bottom-[22%] left-[4%] pointer-events-none">
        <SilkWave width={180} height={100} opacity={0.10} delay="2s" animClass="animate-sway" />
      </div>
      <div className="absolute top-[55%] right-[3%] pointer-events-none">
        <SilkWave width={140} height={80} opacity={0.08} delay="1s" animClass="animate-float-slow" />
      </div>

      {/* ── Needle + thread elements ── */}
      <div className="absolute top-[40%] right-[6%] pointer-events-none">
        <NeedleThread opacity={0.18} />
      </div>
      <div
        className="absolute top-[20%] left-[12%] pointer-events-none"
        style={{ transform: "rotate(135deg)" }}
      >
        <NeedleThread opacity={0.12} />
      </div>

      {/* ── Embroidery circles ── */}
      <div className="absolute top-[25%] right-[22%] pointer-events-none">
        <EmbroiderCircle size={70} opacity={0.12} delay="0s" />
      </div>
      <div className="absolute bottom-[30%] left-[18%] pointer-events-none">
        <EmbroiderCircle size={50} opacity={0.09} delay="1.5s" />
      </div>
      <div className="absolute top-[65%] right-[15%] pointer-events-none">
        <EmbroiderCircle size={40} opacity={0.08} delay="3s" />
      </div>

      {/* ── Gold floating spheres ── */}
      <div
        className="absolute top-[28%] right-[18%] w-5 h-5 rounded-full pointer-events-none animate-float"
        style={{
          background: "radial-gradient(circle at 35% 35%, #F0D97A 0%, #C9A227 50%, #A07830 100%)",
          boxShadow: "0 4px 16px rgba(201,162,39,0.35)",
          opacity: 0.55,
        }}
      />
      <div
        className="absolute top-[55%] left-[10%] w-3.5 h-3.5 rounded-full pointer-events-none animate-float-slow"
        style={{
          background: "radial-gradient(circle at 35% 35%, #F0D97A 0%, #C9A227 60%, transparent 100%)",
          boxShadow: "0 2px 10px rgba(201,162,39,0.25)",
          opacity: 0.45,
          animationDelay: "1.5s",
        }}
      />
      <div
        className="absolute bottom-[35%] right-[28%] w-2.5 h-2.5 rounded-full pointer-events-none animate-float"
        style={{
          background: "radial-gradient(circle, #D4AF37 0%, transparent 100%)",
          opacity: 0.35,
          animationDelay: "0.8s",
        }}
      />
      <div
        className="absolute top-[18%] left-[30%] w-2 h-2 rounded-full pointer-events-none animate-float-slow"
        style={{
          background: "radial-gradient(circle, #E8D48B 0%, transparent 100%)",
          opacity: 0.3,
          animationDelay: "2.2s",
        }}
      />

      {/* ── Horizontal silk thread lines ── */}
      <svg className="absolute top-[12%] left-0 w-full h-8 pointer-events-none opacity-[0.04]" viewBox="0 0 1440 32" preserveAspectRatio="none">
        <path d="M0,16 C240,4 480,28 720,16 C960,4 1200,28 1440,16" stroke="#C9A227" strokeWidth="1" fill="none" />
        <path d="M0,20 C240,8 480,32 720,20 C960,8 1200,32 1440,20" stroke="#D4AF37" strokeWidth="0.5" fill="none" />
      </svg>
      <svg className="absolute bottom-[15%] left-0 w-full h-8 pointer-events-none opacity-[0.04]" viewBox="0 0 1440 32" preserveAspectRatio="none">
        <path d="M0,16 C360,28 720,4 1080,16 C1260,22 1380,10 1440,16" stroke="#C9A227" strokeWidth="1" fill="none" />
      </svg>
        </>
      )}

      {/* ── Bottom wave transition ── */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        <svg viewBox="0 0 1440 96" fill="none" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,48 C180,80 360,20 540,48 C720,76 900,20 1080,48 C1260,76 1380,30 1440,48 L1440,96 L0,96 Z" fill="white" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto pt-20">

        {/* Badge */}
        <div
          id="hero-badge"
          className="inline-flex items-center gap-2 mb-6 animate-fade-in"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          <Sparkles size={12} className="text-[#C9A227]" />
          <span className="text-[11px] tracking-[0.35em] uppercase text-[#C9A227] font-medium">
            Handcrafted with Love
          </span>
          <Sparkles size={12} className="text-[#C9A227]" />
        </div>

        {/* Decorative gold line above title */}
        <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: "0.15s", opacity: 0 }}>
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#C9A227]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#C9A227]" />
        </div>

        {/* Main title */}
        <h1
          id="hero-title"
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#2B2B2B] leading-tight mb-4 animate-fade-in"
          style={{
            fontFamily: "'Playfair Display', serif",
            animationDelay: "0.2s",
            opacity: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Kriva Art Studio
        </h1>

        {/* Italic tagline */}
        <p
          className="text-lg sm:text-xl text-[#C9A227] font-medium italic mb-4 animate-fade-in"
          style={{ fontFamily: "'Playfair Display', serif", animationDelay: "0.3s", opacity: 0 }}
        >
          Where Art Meets Fabric
        </p>

        {/* Subtitle */}
        <p
          id="hero-subtitle"
          className="text-sm sm:text-base text-[#5A5548] leading-relaxed mb-10 max-w-md mx-auto animate-fade-in"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          Unique hand-painted creations that transform fabric into wearable art — Tanjore paintings, silk sarees &amp; custom pieces, each one a masterpiece.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <Link
            href="/artworks"
            id="hero-cta"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[#2B2B2B] font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)",
              boxShadow: "0 4px 24px rgba(201,162,39,0.30)",
            }}
          >
            Shop Artworks
          </Link>
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[#2B2B2B] font-medium text-sm tracking-wide border border-[#C9A227]/50 hover:bg-[#F5F0E6] transition-all duration-300"
          >
            Explore Workshops
          </Link>
        </div>

        {/* Floating scroll hint */}
        <div
          className="mt-16 flex flex-col items-center gap-2 animate-fade-in"
          style={{ animationDelay: "1.2s", opacity: 0 }}
        >
          <div className="w-px h-10 bg-gradient-to-b from-[#C9A227]/50 to-transparent animate-float" />
          <span className="text-[9px] tracking-[0.4em] uppercase text-[#8A8070]/50">Scroll</span>
        </div>
      </div>
    </section>
  );
}
