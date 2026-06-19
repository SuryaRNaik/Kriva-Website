"use client";

import Image from "next/image";
import Link from "next/link";

const styles = [
  {
    title: "SAREES",
    href: "/shop/sarees",
    image: "/images/style_saree.png",
    gridClass: "col-span-1 md:col-span-2",
  },
  {
    title: "MENS WEAR",
    href: "/shop/mens-wear",
    image: "/images/style_mens.png",
    gridClass: "col-span-1 md:col-span-2",
  },
  {
    title: "LEHENGAS",
    href: "/shop/lehengas",
    image: "/images/style_lehenga.png",
    gridClass: "col-span-1 md:col-span-2",
  },
  {
    title: "SUIT SETS",
    href: "/shop/suit-sets",
    image: "/images/style_suits.png",
    gridClass: "col-span-1 md:col-span-3",
  },
  {
    title: "KIDS WEAR",
    href: "/shop/kids-wear",
    image: "/images/style_kids.png",
    gridClass: "col-span-1 md:col-span-3",
  },
];

export default function ShopByStyle() {
  return (
    <section className="py-20 bg-[#FAF8F2]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Section header with gold accent */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#2B2B2B] uppercase tracking-wide mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Shop By Style
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#E8DCC8]" />
            <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <div className="h-px w-16 bg-[#E8DCC8]" />
          </div>
        </div>

        {/* 6-column grid for 3 on top, 2 on bottom on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 lg:gap-6">
          {styles.map((style, index) => (
            <Link
              href={style.href}
              key={index}
              className={`group relative overflow-hidden flex ${style.gridClass} h-[400px] md:h-[500px] rounded-lg shadow-sm`}
            >
              <Image
                src={style.image}
                alt={style.title}
                fill
                quality={90}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Text */}
              <div className="absolute bottom-6 left-0 right-0 text-center z-10">
                <h3
                  className="text-white text-xl md:text-2xl tracking-[0.1em] font-medium uppercase"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {style.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
