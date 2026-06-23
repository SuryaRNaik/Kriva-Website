"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import BackButton from "@/components/BackButton";

// ─────────────────────────────────────────────────────────────
// PRODUCT CATALOGUE — Add / edit / remove products here.
// To mark a product as sold out, set  soldOut: true
// Categories: "Tanjore Painting" | "Fabric Art"
// ─────────────────────────────────────────────────────────────
const ALL_PRODUCTS = [
  // ── Tanjore Paintings ──────────────────────────────────────
  {
    id: "tanjore-ganesha",
    title: "Lord Ganesha",
    subtitle: "Gold-leaf Tanjore painting on wood board",
    category: "Tanjore Painting",
    image: "/images/tanjore_ganesha.png",
    price: 6500,
    originalPrice: 8000,
    rating: 4.9,
    soldOut: false,
    isNew: true,
  },
  {
    id: "tanjore-krishna",
    title: "Lord Krishna",
    subtitle: "Classic Tanjore deity art with gem inlay",
    category: "Tanjore Painting",
    image: "/images/tanjore_krishna.png",
    price: 7200,
    originalPrice: null,
    rating: 4.9,
    soldOut: false,
    isNew: false,
  },
  {
    id: "tanjore-lakshmi",
    title: "Goddess Lakshmi",
    subtitle: "Prosperity deity — gold foil & jewel finish",
    category: "Tanjore Painting",
    image: "/images/tanjore_lakshmi.png",
    price: 7800,
    originalPrice: null,
    rating: 5.0,
    soldOut: false,
    isNew: false,
  },
  // ── Fabric Art ─────────────────────────────────────────────
  {
    id: "art-elephant",
    title: "Royal Elephant",
    subtitle: "Hand-painted ceremonial elephant on silk",
    category: "Fabric Art",
    image: "/images/art_elephant.png",
    price: 3200,
    originalPrice: 4000,
    rating: 4.8,
    soldOut: false,
    isNew: false,
  },
  {
    id: "art-floral",
    title: "Floral Mandala",
    subtitle: "Intricate floral mandala on premium fabric",
    category: "Fabric Art",
    image: "/images/art_floral.png",
    price: 2800,
    originalPrice: null,
    rating: 4.9,
    soldOut: false,
    isNew: true,
  },
  {
    id: "art-lotus",
    title: "Golden Lotus",
    subtitle: "Sacred lotus motif in gold and ivory tones",
    category: "Fabric Art",
    image: "/images/art_lotus.png",
    price: 3000,
    originalPrice: null,
    rating: 4.8,
    soldOut: false,
    isNew: false,
  },
  {
    id: "art-peacock",
    title: "Peacock Dance",
    subtitle: "Vibrant peacock spread hand-painted on dupatta",
    category: "Fabric Art",
    image: "/images/art_peacock.png",
    price: 3500,
    originalPrice: 4200,
    rating: 4.9,
    soldOut: false,
    isNew: false,
  },
  {
    id: "art-fabric",
    title: "Heritage Fabric Piece",
    subtitle: "Traditional motifs on handwoven cotton",
    category: "Fabric Art",
    image: "/images/art_fabric.png",
    price: 5,
    originalPrice: null,
    rating: 4.7,
    soldOut: false,
    isNew: false,
  },
  {
    id: "lehenga-tulip",
    title: "Tulip Hand-Painted Lehenga",
    subtitle: "Signature orange tulip lehenga — one of a kind",
    category: "Fabric Art",
    image: "/images/lehenga.png",
    price: 4500,
    originalPrice: 5500,
    rating: 5.0,
    soldOut: false,
    isNew: false,
  },
  {
    id: "dress-blossom",
    title: "Blossom Hand-Painted Dress",
    subtitle: "Floral art on premium cotton fabric",
    category: "Fabric Art",
    image: "/images/bestseller_1.png",
    price: 2500,
    originalPrice: 3500,
    rating: 4.8,
    soldOut: false,
    isNew: false,
  },
  {
    id: "dress-geometric",
    title: "Geometric Rose Gown",
    subtitle: "Intricate geometric motif detailing",
    category: "Fabric Art",
    image: "/images/bestseller_2.png",
    price: 3200,
    originalPrice: 4200,
    rating: 4.9,
    soldOut: false,
    isNew: false,
  },
  {
    id: "dress-anarkali",
    title: "Blossom Anarkali",
    subtitle: "Traditional ethnic hand-painted anarkali",
    category: "Fabric Art",
    image: "/images/bestseller_3.png",
    price: 2800,
    originalPrice: 3800,
    rating: 4.8,
    soldOut: false,
    isNew: false,
  },
  {
    id: "dress-maxi",
    title: "Artisan Maxi Dress",
    subtitle: "Rich artistic motifs on flowing maxi",
    category: "Fabric Art",
    image: "/images/bestseller_4.png",
    price: 2000,
    originalPrice: 3000,
    rating: 4.7,
    soldOut: false,
    isNew: false,
  },
];

type SortKey = "default" | "price-asc" | "price-desc";
type FilterKey = "All" | "Tanjore Painting" | "Fabric Art";

const FILTERS: FilterKey[] = ["All", "Tanjore Painting", "Fabric Art"];

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN");

// ── Star display ──────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-[#C9A227]">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="10" height="10" viewBox="0 0 20 20" fill={s <= Math.round(rating) ? "#C9A227" : "none"} stroke="#C9A227" strokeWidth="1.5">
          <polygon points="10,2 12.9,7.5 19,8.3 14.5,12.6 15.8,18.6 10,15.5 4.2,18.6 5.5,12.6 1,8.3 7.1,7.5" />
        </svg>
      ))}
      <span className="text-[10px] text-[#8A8070] ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

// ── Product Card ──────────────────────────────────────────────
function ProductCard({ product }: { product: typeof ALL_PRODUCTS[0] }) {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const [added, setAdded] = useState(false);
  const favorited = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.soldOut) return;
    addToCart({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      price: fmt(product.price),
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      price: fmt(product.price),
      image: product.image,
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8DCC8] flex flex-col transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,162,39,0.13)] hover:-translate-y-1">
      {/* Image area */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${product.soldOut ? "opacity-60 grayscale" : ""}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.soldOut && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#2B2B2B] text-white tracking-wide">
              Sold Out
            </span>
          )}
          {!product.soldOut && product.isNew && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2B2B2B] tracking-wide"
              style={{ background: "linear-gradient(135deg,#F0D97A,#C9A227)" }}>
              New
            </span>
          )}
          {!product.soldOut && discount && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2B2B2B] tracking-wide"
              style={{ background: "linear-gradient(135deg,#F0D97A,#C9A227)" }}>
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Category pill — top right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wide text-white"
            style={{ background: "rgba(43,43,43,0.70)", backdropFilter: "blur(6px)" }}>
            {product.category === "Tanjore Painting" ? "Tanjore" : "Fabric Art"}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2B2B]/80 via-[#2B2B2B]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 z-10" />

        {/* Hover action buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350 z-20">
          <button
            onClick={handleAddToCart}
            disabled={product.soldOut}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-[#2B2B2B] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: added ? "#22c55e" : "linear-gradient(135deg,#F0D97A 0%,#C9A227 50%,#A07830 100%)" }}
          >
            <ShoppingBag size={13} />
            {product.soldOut ? "Sold Out" : added ? "Added! ✓" : "Add to Cart"}
          </button>
          <button
            onClick={handleFavorite}
            className="p-2.5 rounded-xl bg-white/90 text-[#2B2B2B] hover:bg-white transition-colors"
            title={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={15} className={favorited ? "fill-[#C9A227] text-[#C9A227]" : ""} />
          </button>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-4 flex flex-col gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#2B2B2B] leading-snug"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {product.title}
          </h3>
          <p className="text-[11px] text-[#8A8070] mt-0.5 leading-relaxed">{product.subtitle}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] text-[#aaa] line-through">{fmt(product.originalPrice)}</span>
            )}
            <span className="text-base font-bold text-[#C9A227]"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {fmt(product.price)}
            </span>
          </div>
          <Stars rating={product.rating} />
        </div>
      </div>
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function ArtworksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.filter(
      (p) => activeFilter === "All" || p.category === activeFilter
    );
    if (sortKey === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortKey === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [activeFilter, sortKey]);

  const sortLabel: Record<SortKey, string> = {
    default: "Sort",
    "price-asc": "Price: Low → High",
    "price-desc": "Price: High → Low",
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2]">

      {/* ── Hero Strip ───────────────────────────────────────── */}
      <div
        className="relative pt-24 pb-8 px-6 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#FAF8F2 0%,#F5F0E6 60%,#FAF8F2 100%)" }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right,rgba(201,162,39,0.07) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />

        <div className="max-w-6xl mx-auto">
          <div className="mb-3"><BackButton /></div>
          {/* Breadcrumb */}
          <p className="text-xs text-[#8A8070] mb-3">
            <Link href="/" className="hover:text-[#C9A227] transition-colors">Home</Link>
            <span className="mx-2 text-[#E8DCC8]">›</span>
            <span className="text-[#C9A227]">Collections</span>
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.35em] uppercase text-[#C9A227] font-medium mb-2">
                Kriva Studio
              </p>
              <h1
                className="text-4xl sm:text-5xl font-bold text-[#2B2B2B] leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Collections
              </h1>
              <p className="text-[#8A8070] text-sm mt-2 max-w-sm leading-relaxed">
                Handcrafted originals — every piece painted entirely by hand by Ruchitha Reddy.
              </p>
            </div>
            {/* Desktop stat */}
            <div className="hidden sm:flex items-center gap-6 text-xs text-[#8A8070]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>13+</div>
                <div>Unique Pieces</div>
              </div>
              <div className="w-px h-8 bg-[#E8DCC8]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>100%</div>
                <div>Hand Painted</div>
              </div>
              <div className="w-px h-8 bg-[#E8DCC8]" />
              <div className="text-center">
                <div className="text-2xl font-bold text-[#C9A227]" style={{ fontFamily: "'Playfair Display', serif" }}>4.9★</div>
                <div>Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Filter + Sort Bar ─────────────────────────── */}
      <div className="sticky top-[64px] z-30 bg-white/95 border-b border-[#E8DCC8]"
        style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeFilter === f
                    ? "text-[#2B2B2B]"
                    : "text-[#8A8070] bg-transparent hover:text-[#C9A227]"
                }`}
                style={activeFilter === f
                  ? { background: "linear-gradient(135deg,#F0D97A 0%,#C9A227 50%,#A07830 100%)" }
                  : {}}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Right: count + sort */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-[#8A8070] hidden sm:block">
              {filtered.length} piece{filtered.length !== 1 ? "s" : ""}
            </span>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#5A5548] border border-[#E8DCC8] hover:border-[#C9A227] transition-colors bg-white"
              >
                <SlidersHorizontal size={12} />
                {sortLabel[sortKey]}
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#E8DCC8] rounded-xl shadow-lg overflow-hidden z-50 min-w-[180px]">
                  {(["default", "price-asc", "price-desc"] as SortKey[]).map((k) => (
                    <button
                      key={k}
                      onClick={() => { setSortKey(k); setShowSort(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                        sortKey === k
                          ? "text-[#C9A227] bg-[#FAF8F2]"
                          : "text-[#5A5548] hover:bg-[#FAF8F2] hover:text-[#C9A227]"
                      }`}
                    >
                      {k === "default" ? "Default" : sortLabel[k]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-[#E8DCC8]">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              No pieces in this category yet
            </h3>
            <p className="text-sm text-[#8A8070]">Check back soon — new collections are always in progress.</p>
            <button
              onClick={() => setActiveFilter("All")}
              className="mt-6 px-6 py-2.5 rounded-full text-xs font-semibold text-[#2B2B2B] transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#F0D97A 0%,#C9A227 100%)" }}
            >
              View All Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ── Custom Order Banner ───────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div
          className="relative rounded-2xl overflow-hidden px-10 py-12 text-center"
          style={{ background: "linear-gradient(135deg,#2B2B2B 0%,#1A1A2E 100%)" }}
        >
          {/* Faint mandala bg */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <svg viewBox="0 0 300 300" width="320" height="320" fill="none">
              {[40,80,120].map((r) => (
                <circle key={r} cx="150" cy="150" r={r} stroke="#C9A227" strokeWidth="1" strokeDasharray="4 6" />
              ))}
            </svg>
          </div>
          <p className="text-[11px] tracking-[0.35em] uppercase text-[#C9A227] font-medium mb-3 relative z-10">
            Made Just For You
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 relative z-10"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-white/65 text-sm max-w-md mx-auto mb-8 leading-relaxed relative z-10">
            We take custom orders — a Tanjore painting of your deity, a hand-painted saree, or a personalized fabric piece. Just get in touch.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-[#2B2B2B] transition-all hover:opacity-90 hover:scale-105 relative z-10"
            style={{ background: "linear-gradient(135deg,#F0D97A 0%,#C9A227 50%,#A07830 100%)" }}
          >
            Request a Custom Piece →
          </Link>
        </div>
      </div>

    </div>
  );
}
