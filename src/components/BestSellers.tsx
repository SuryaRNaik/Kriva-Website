"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";

import { ALL_PRODUCTS } from "@/lib/products";

const bestSellers = ALL_PRODUCTS.slice(0, 4);

export default function BestSellers() {
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  return (
    <section id="bestsellers" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.35em] uppercase text-[#C9A227] mb-3 font-medium">
            High Demand
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#2B2B2B] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Best Sellers
          </h2>
          {/* Decorative underline */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-16 bg-[#E8DCC8]" />
            <div className="w-2 h-2 rounded-full bg-[#C9A227]" />
            <div className="h-px w-16 bg-[#E8DCC8]" />
          </div>
        </div>

        {/* 4 Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((item, index) => {
            const favorited = isFavorite(item.id);
            const discount = item.originalPrice ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : null;
            return (
              <Link
                href={`/product/${item.id}`}
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8DCC8] card-hover relative flex flex-col block cursor-pointer"
                style={{
                  boxShadow: "0 2px 12px rgba(201,162,39,0.06)",
                  animationDelay: `${index * 0.08}s`,
                }}
              >
                {/* Image */}
                <div className="relative h-[320px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Discount badge */}
                  {discount && (
                    <span 
                      className="absolute top-3 left-3 bg-[#C9A227] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm z-10"
                      style={{ background: "linear-gradient(135deg, #F0D97A, #C9A227)" }}
                    >
                      {discount}% OFF
                    </span>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFavorite({...item, price: "₹"+item.price}); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm z-10 transition-transform hover:scale-110"
                  >
                    <Heart 
                      size={16} 
                      className={favorited ? "fill-[#C9A227] text-[#C9A227]" : "text-[#8A8070]"} 
                    />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-lg font-bold text-[#2B2B2B] mb-1 leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8A8070] mb-4">{item.subtitle}</p>
                  </div>

                  <div className="flex flex-col mt-auto gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#8A8070] line-through decoration-[#8A8070]/60">
                        {item.originalPrice ? "₹" + item.originalPrice.toLocaleString('en-IN') : ""}
                      </span>
                      <span
                        className="text-xl font-bold text-[#C9A227]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => { e.preventDefault(); addToCart({...item, price: "₹"+item.price}); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold text-[#2B2B2B] transition-all duration-300 transform active:scale-[0.98] opacity-90 hover:opacity-100"
                      style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-[#2B2B2B] font-semibold text-sm tracking-wide shadow-gold transition-all duration-300 hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
          >
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
