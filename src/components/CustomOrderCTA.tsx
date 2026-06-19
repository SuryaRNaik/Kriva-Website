"use client";

import Link from "next/link";
import { ArrowRight, Palette, MessageSquare, Truck } from "lucide-react";

const processSteps = [
  {
    num: "01",
    icon: <MessageSquare size={20} className="text-[#C9A84C]" />,
    title: "Share Your Vision",
    desc: "Tell us your preferred deity, theme, size, and any special details.",
  },
  {
    num: "02",
    icon: <Palette size={20} className="text-[#C9A84C]" />,
    title: "Artisan Creates",
    desc: "Our master artisans craft your painting with traditional techniques.",
  },
  {
    num: "03",
    icon: <Truck size={20} className="text-[#C9A84C]" />,
    title: "Delivered to You",
    desc: "Carefully packed and shipped directly to your doorstep.",
  },
];

export default function CustomOrderCTA() {
  return (
    <section
      id="custom-order-cta"
      className="relative overflow-hidden py-24 md:py-36"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #4A1010 0%, #6B1E1E 25%, #1A1A30 60%, #0F0F1A 100%)",
        }}
      />

      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 pattern-overlay opacity-40 pointer-events-none" />

      {/* Large decorative mandalas */}
      <div
        className="absolute -left-32 -top-32 w-96 h-96 pointer-events-none opacity-15"
        style={{ animationDelay: "0s" }}
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin-slow">
          {[30, 60, 90, 120, 140].map((r) => (
            <circle key={r} cx="150" cy="150" r={r} stroke="#C9A84C" strokeWidth="0.8" />
          ))}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <line
                key={angle}
                x1={150 + 30 * Math.cos(rad)} y1={150 + 30 * Math.sin(rad)}
                x2={150 + 140 * Math.cos(rad)} y2={150 + 140 * Math.sin(rad)}
                stroke="#C9A84C" strokeWidth="0.5"
              />
            );
          })}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x = 150 + 120 * Math.cos(rad);
            const y = 150 + 120 * Math.sin(rad);
            return <circle key={angle} cx={x} cy={y} r="3" fill="#C9A84C" fillOpacity="0.6" />;
          })}
        </svg>
      </div>

      <div
        className="absolute -right-24 -bottom-24 w-80 h-80 pointer-events-none opacity-10"
      >
        <svg viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-spin-slow" style={{ animationDirection: "reverse" }}>
          {[30, 60, 90, 120, 140].map((r) => (
            <circle key={r} cx="150" cy="150" r={r} stroke="#E8C96A" strokeWidth="0.8" strokeDasharray="3 5" />
          ))}
        </svg>
      </div>

      {/* Glow effects */}
      <div
        className="absolute top-0 left-1/3 w-80 h-80 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(201,168,76,0.15), transparent 70%)",
          transform: "translateY(-50%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Main CTA content */}
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-[#C9A84C] mb-4 font-medium">
              Commission Your Art
            </p>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FDF6E3] leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your Dream
              <br />
              <span className="text-gold-gradient italic">Painting,</span>
              <br />
              Made to Order
            </h2>

            <div className="w-20 h-0.5 bg-gradient-to-r from-[#C9A84C] to-transparent mb-6" />

            <p className="text-[#FDF6E3]/70 text-lg leading-relaxed mb-8 max-w-lg">
              Want a specific deity, a family portrait in Tanjore style, or a completely unique
              design? Our master artisans will bring your vision to life — painted entirely by
              hand, just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/custom-orders"
                id="custom-order-cta-btn-primary"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[#0F0F1A] font-semibold text-base tracking-wide transition-all duration-300 hover:scale-105 group"
                style={{
                  background: "linear-gradient(135deg, #F0D97A 0%, #C9A84C 50%, #A07830 100%)",
                  boxShadow: "0 4px 30px rgba(201,168,76,0.5)",
                }}
              >
                Request Custom Painting
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                id="custom-order-cta-btn-secondary"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-[#E8C96A] font-medium text-base tracking-wide border transition-all duration-300 hover:bg-white/5"
                style={{ borderColor: "rgba(201,168,76,0.4)" }}
              >
                Talk to an Artisan
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {["Free Consultation", "50% Advance Only", "Worldwide Shipping"].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
                  <span className="text-sm text-[#FDF6E3]/60">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Process steps */}
          <div
            className="p-8 rounded-3xl"
            style={{
              background: "rgba(15,15,26,0.6)",
              border: "1px solid rgba(201,168,76,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3
              className="text-2xl font-bold text-[#FDF6E3] mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How It Works
            </h3>

            <div className="flex flex-col gap-8">
              {processSteps.map((step, i) => (
                <div key={step.num} id={`process-step-${i + 1}`} className="flex gap-5">
                  {/* Number + line */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-[#C9A84C]"
                      style={{
                        background: "rgba(201,168,76,0.1)",
                        border: "1px solid rgba(201,168,76,0.3)",
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {step.num}
                    </div>
                    {i < processSteps.length - 1 && (
                      <div className="w-px h-8 bg-gradient-to-b from-[#C9A84C]/30 to-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      {step.icon}
                      <h4 className="text-base font-semibold text-[#FDF6E3]">{step.title}</h4>
                    </div>
                    <p className="text-sm text-[#FDF6E3]/55 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline note */}
            <div
              className="mt-8 p-4 rounded-xl"
              style={{
                background: "rgba(201,168,76,0.08)",
                border: "1px solid rgba(201,168,76,0.15)",
              }}
            >
              <p className="text-sm text-[#FDF6E3]/70">
                <span className="text-[#C9A84C] font-semibold">Delivery timeline:</span>{" "}
                Standard orders: 3–4 weeks · Premium large formats: 5–6 weeks
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
