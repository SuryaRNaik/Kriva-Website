"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * SignatureBanner — split-layout showcase section.
 * Left: lehenga photo at natural ratio (object-contain, no cropping/stretching).
 * Right: charcoal panel with gold accents. Clean hard line separator.
 *
 * NEW SECTION — does not modify any existing component.
 */
export default function SignatureBanner() {
  return (
    <section
      id="signature-banner"
      className="w-full bg-white"
      aria-label="Signature handpainted collection"
    >
      {/* Outer wrapper — hard flex split, clean dividing line */}
      <div className="flex flex-col lg:flex-row" style={{ borderTop: "1px solid #E8DCC8", borderBottom: "1px solid #E8DCC8" }}>

        {/* ── Left: photo panel ── */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center py-10 lg:py-12"
          style={{ borderRight: "2px solid #C9A227", backgroundColor: "#FCF4F5" }}
        >
          <div className="relative w-full max-w-[360px] mx-auto px-6 lg:px-10">
            <Image
              src="/images/peacock_fabric.png"
              alt="White aesthetic fabric with a beautiful hand-painted peacock"
              width={800}
              height={800}
              quality={95}
              className="w-full h-auto rounded-xl shadow-md"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>

        {/* ── Right: charcoal content panel with gold accents ── */}
        <div
          id="signature-banner-content"
          className="w-full lg:w-1/2 flex items-center justify-center px-10 py-14"
          style={{ background: "linear-gradient(160deg, #4A252B 0%, #381B20 40%, #241114 100%)" }}
        >
          {/* Decorative corner frame */}
          <div
            className="absolute hidden lg:block pointer-events-none"
            style={{
              inset: "2rem",
              border: "1px solid rgba(201,162,39,0.2)",
              position: "relative",
              padding: "2.5rem",
            }}
          />

          {/* Text content */}
          <div className="text-center max-w-sm relative z-10">
            {/* Inner frame box */}
            <div
              className="p-8 lg:p-10"
              style={{ border: "1px solid rgba(201,162,39,0.3)", borderRadius: "4px" }}
            >
              <p
                id="banner-eyebrow"
                className="text-xs tracking-[0.35em] uppercase text-[#C9A227]/70 mb-5 font-medium"
              >
                Signature Collection
              </p>

              <h2
                id="banner-title"
                className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Our Signature
                <br />
                Handpainted Art
              </h2>

              <p
                id="banner-tagline"
                className="text-white/80 text-base mb-8 tracking-wide"
              >
                Timeless.&nbsp; Vibrant.&nbsp; Iconic.
              </p>

              <Link
                href="/artworks"
                id="banner-shop-btn"
                className="inline-block px-8 py-3 font-semibold text-sm tracking-wide transition-all duration-300 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)", color: "#2B2B2B", borderRadius: "4px" }}
              >
                Shop Artworks
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
