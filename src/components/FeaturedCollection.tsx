"use client";

import Image from "next/image";
import Link from "next/link";

const artworks = [
  {
    id: "floral-tanjore",
    title: "Floral Tanjore",
    subtitle: "Gold leaf on wood panel",
    price: "₹10,500",
    image: "/images/art_floral.png",
    category: "Tanjore",
  },
  {
    id: "peacock-kalamkari",
    title: "Peacock Kalamkari",
    subtitle: "Hand-painted fabric art",
    price: "₹12,000",
    image: "/images/art_peacock.png",
    category: "Kalamkari",
  },
  {
    id: "royal-elephant",
    title: "Royal Elephant",
    subtitle: "Mixed media on canvas",
    price: "₹22,000",
    image: "/images/art_elephant.png",
    category: "Tanjore",
  },
  {
    id: "lotus-mandala",
    title: "Lotus Mandala",
    subtitle: "Gold leaf Tanjore painting",
    price: "₹15,500",
    image: "/images/art_lotus.png",
    category: "Mandala",
  },
  {
    id: "fabric-motif",
    title: "Fabric Motif Art",
    subtitle: "Fabric art with embroidery",
    price: "₹9,800",
    image: "/images/art_fabric.png",
    category: "Fabric Art",
  },
  {
    id: "tanjore-heritage",
    title: "Tanjore Heritage",
    subtitle: "Traditional Tanjore masterpiece",
    price: "₹28,000",
    image: "/images/art_floral.png",
    category: "Premium",
  },
];

export default function ArtworksGallery() {
  return (
    <section
      id="artworks-gallery"
      className="py-20 bg-white"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.35em] uppercase text-[#D81B60] mb-3 font-medium">
            Gallery
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#2D2D2D] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Artworks
          </h2>
          {/* Decorative underline */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-[#F0C4D4]" />
            <div className="w-2 h-2 rounded-full bg-[#D81B60]" />
            <div className="h-px w-16 bg-[#F0C4D4]" />
          </div>
        </div>

        {/* 3×2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art, index) => (
            <article
              key={art.id}
              id={`artwork-card-${art.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-[#F0C4D4]/60 card-hover"
              style={{
                boxShadow: "0 2px 12px rgba(216,27,96,0.06)",
                animationDelay: `${index * 0.08}s`,
              }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={art.image}
                  alt={`${art.title} - Tanjore painting by Kriva Studio`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Category badge */}
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold text-white tracking-wide"
                  style={{ background: "rgba(173,20,87,0.85)" }}
                >
                  {art.category}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3
                  className="text-base font-bold text-[#C2185B] mb-0.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {art.title}
                </h3>
                <p className="text-xs text-[#888] mb-3">{art.subtitle}</p>

                <div className="flex items-center justify-between">
                  <span
                    className="text-lg font-bold text-[#D81B60]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {art.price}
                  </span>
                  <Link
                    href={`/artworks/${art.id}`}
                    id={`view-artwork-${art.id}`}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#D81B60] border border-[#D81B60] hover:bg-[#D81B60] hover:text-white transition-all duration-300"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link
            href="/artworks"
            id="view-all-artworks"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold text-sm tracking-wide shadow-pink transition-all duration-300 hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #D81B60, #AD1457)" }}
          >
            View All Artworks
          </Link>
        </div>
      </div>
    </section>
  );
}
