"use client";

import Link from "next/link";

const stats = [
  { value: "12+", label: "Workshops Held", id: "stat-workshops" },
  { value: "200+", label: "Students Trained", id: "stat-students" },
  { value: "4.9\u2605", label: "Average Rating", id: "stat-rating" },
];

export default function WorkshopsSection() {
  return (
    <section
      id="workshops"
      className="relative py-24 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #1A1A2E 0%, #16213E 40%, #0F0F1A 100%)",
      }}
    >
      {/* Decorative shapes */}
      <div
        className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "rgba(201,162,39,0.04)" }}
      />
      <div
        className="absolute bottom-[-60px] left-[-60px] w-[250px] h-[250px] rounded-full pointer-events-none"
        style={{ background: "rgba(201,162,39,0.04)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
        {/* Label */}
        <p className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] mb-4 font-medium">
          Learn &amp; Create
        </p>

        {/* Title */}
        <h2
          id="workshops-title"
          className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Art Workshops
        </h2>

        {/* Description */}
        <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-12">
          Explore diverse art forms through engaging workshops that blend creativity with craftsmanship. Whether it's Tanjore painting, Lippan art, fabric painting, keychain making, or seasonal DIY crafts, there's something for every artist at heart. No prior experience is needed\u2014just bring your enthusiasm and creativity\u2728
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.id}
              id={stat.id}
              className="py-6 px-4 rounded-2xl"
              style={{
                background: "rgba(201,162,39,0.08)",
                border: "1px solid rgba(201,162,39,0.15)",
              }}
            >
              <div
                className="text-3xl font-bold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/60 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/workshops"
          id="workshops-register-btn"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[#2B2B2B] font-semibold text-sm tracking-wide transition-all duration-300 hover:shadow-gold hover:scale-105"
          style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
        >
          Register for Next Workshop
        </Link>
      </div>
    </section>
  );
}
