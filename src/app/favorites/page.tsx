"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import BackButton from "@/components/BackButton";

export default function FavoritesPage() {
  const { favorites, toggleFavorite, addToCart } = useStore();

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-10 border-b border-[#E8DCC8]/50 pb-6">
          <div>
            <div className="mb-3">
              <BackButton />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              My Favorites
            </h1>
            <p className="text-[#8A8070] text-sm">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-[#C9A227] hover:underline"
          >
            Continue Shopping
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-[#FAF8F2] rounded-2xl border border-dashed border-[#E8DCC8]">
            <Heart className="mx-auto text-[#E8DCC8] mb-4" size={48} />
            <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your wishlist is empty
            </h2>
            <p className="text-[#666] mb-8">
              Save your favorite handpainted artworks and collections here.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 rounded-full text-[#2B2B2B] font-semibold text-sm tracking-wide shadow-gold transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #F0D97A 0%, #C9A227 50%, #A07830 100%)" }}
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E8DCC8]/60 relative flex flex-col transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-[300px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <button
                    onClick={() => toggleFavorite(item)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-[#C9A227] hover:bg-white transition-colors z-10 shadow-sm"
                    title="Remove from favorites"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-lg font-bold text-[#C9A227] mb-1 leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#8A8070] mb-4">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className="text-lg font-bold text-[#C9A227]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.price}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-[#2B2B2B] bg-[#C9A227] hover:bg-[#A07830] transition-colors"
                    >
                      <ShoppingBag size={14} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
