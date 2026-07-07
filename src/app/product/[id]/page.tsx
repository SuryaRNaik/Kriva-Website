"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Heart, ShoppingBag, Minus, Plus, ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getProductById, getRelatedProducts, Product } from "@/lib/products";


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  const [mainImage, setMainImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
      position: 'absolute',
      inset: 0,
      zIndex: 10,
      pointerEvents: 'none'
    });
  };
  const handleMouseLeave = () => setZoomStyle({ display: 'none' });
  
  const { addToCart, toggleFavorite, isFavorite } = useStore();

  useEffect(() => {
    if (productId) {
      const p = getProductById(productId);
      if (p) {
        setProduct(p);
        setMainImage(p.gallery[0]);
        setRelatedProducts(getRelatedProducts(p, 4));
      }
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] pt-32 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-[#2B2B2B]">Product not found</h1>
        <button onClick={() => router.back()} className="mt-6 text-[#C9A227] hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const favorited = isFavorite(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (product.soldOut) return;
    addToCart({
      id: product.id,
      title: product.title,
      subtitle: `Size: ${selectedSize}`,
      price: "₹" + product.price.toLocaleString("en-IN"),
      image: product.image,
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (product.soldOut) return;
    handleAddToCart();
    setTimeout(() => router.push("/checkout"), 500);
  };

  const handleFavorite = () => {
    toggleFavorite({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      price: "₹" + product.price.toLocaleString("en-IN"),
      image: product.image,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2]">
      {/* ── Breadcrumb & Navigation ── */}
      <div className="pt-28 pb-6 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-[#8A8070] hover:text-[#C9A227] transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="text-xs text-[#8A8070] hidden sm:block">
            <Link href="/" className="hover:text-[#C9A227]">Home</Link>
            <span className="mx-2 text-[#E8DCC8]">/</span>
            <Link href={`/shop/${product.categorySlug}`} className="hover:text-[#C9A227]">{product.category}</Link>
            <span className="mx-2 text-[#E8DCC8]">/</span>
            <span className="text-[#2B2B2B] font-medium">{product.title}</span>
          </div>
        </div>
      </div>

      {/* ── Main Product Section ── */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Desktop Image with Zoom */}
            <div 
              className="relative aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-[#E8DCC8] hidden md:block cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Image src={mainImage} alt={product.title} fill className="object-cover" priority />
              <div style={zoomStyle} />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px] z-20">
                  <span className="px-6 py-2 bg-[#2B2B2B] text-white font-bold tracking-widest uppercase rounded-full">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Swipeable Carousel */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-3xl border border-[#E8DCC8] w-full">
              {product.gallery.map((img, idx) => (
                <div key={idx} className="relative w-full aspect-[4/5] shrink-0 snap-center">
                  <Image src={img} alt={`${product.title} ${idx + 1}`} fill className="object-cover" priority={idx === 0} />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="px-6 py-2 bg-[#2B2B2B] text-white font-bold tracking-widest uppercase rounded-full">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Thumbnails (Desktop Only) */}
            <div className="hidden md:flex gap-4 overflow-x-auto scrollbar-hide py-2">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-24 h-32 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    mainImage === img ? "border-[#C9A227] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col pt-4">
            <p className="text-[11px] tracking-[0.35em] uppercase text-[#C9A227] font-medium mb-3">
              {product.category}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B2B2B] leading-tight mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.title}
            </h1>
            <p className="text-[#8A8070] text-sm md:text-base mb-6">
              {product.subtitle}
            </p>

            <div className="flex flex-wrap items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-[#C9A227]"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-[#aaa] line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              {discount && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold text-[#2B2B2B] tracking-wide"
                      style={{ background: "linear-gradient(135deg,#F0D97A,#C9A227)" }}>
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="prose prose-sm text-[#5A5548] mb-8 leading-relaxed">
              <p>{product.details.description}</p>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${product.stock > 0 ? "bg-[#22c55e]" : "bg-red-500"}`}></span>
              <span className="text-sm font-semibold text-[#5A5548]">
                {product.stock === 0 ? "Out of Stock" : product.stock <= 3 ? `Only ${product.stock} left in stock` : "In Stock"}
              </span>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wide">Size</span>
                  <button className="text-xs text-[#C9A227] underline underline-offset-2">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? "bg-[#2B2B2B] text-white shadow-lg scale-110"
                          : "bg-white text-[#5A5548] border border-[#E8DCC8] hover:border-[#C9A227]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-10 flex items-center gap-6">
              <span className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wide">Quantity</span>
              <div className="flex items-center gap-4 bg-white border border-[#E8DCC8] rounded-full px-4 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#8A8070] hover:text-[#C9A227] disabled:opacity-30">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-semibold text-[#2B2B2B]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-[#8A8070] hover:text-[#C9A227]">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold text-[#2B2B2B] transition-all hover:opacity-90 disabled:opacity-50 hover:scale-[1.02]"
                style={{ background: added ? "#22c55e" : "linear-gradient(135deg,#F0D97A 0%,#C9A227 50%,#A07830 100%)" }}
              >
                <ShoppingBag size={18} />
                {product.stock === 0 ? "Sold Out" : added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center py-4 rounded-full text-sm font-bold text-white bg-[#2B2B2B] transition-all hover:bg-[#1A1A2E] disabled:opacity-50 hover:scale-[1.02]"
              >
                Buy It Now
              </button>
              <button
                onClick={handleFavorite}
                className="p-4 rounded-full bg-white border border-[#E8DCC8] text-[#2B2B2B] hover:border-[#C9A227] transition-all shrink-0 hover:scale-[1.05]"
              >
                <Heart size={20} className={favorited ? "fill-[#C9A227] text-[#C9A227]" : ""} />
              </button>
            </div>

            {/* Product Details Accodion / Blocks */}
            <div className="border-t border-[#E8DCC8] pt-8 space-y-6">
              {product.details.craftsmanshipDetails && (
                <div>
                  <h3 className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wide mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> Craftsmanship
                  </h3>
                  <p className="text-sm text-[#5A5548] leading-relaxed pl-3.5">
                    {product.details.craftsmanshipDetails}
                  </p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> Fabric Details
                </h3>
                <p className="text-sm text-[#5A5548] leading-relaxed pl-3.5">
                  {product.details.fabricDetails}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2B2B2B] uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" /> Care Instructions
                </h3>
                <p className="text-sm text-[#5A5548] leading-relaxed pl-3.5">
                  {product.details.careInstructions}
                </p>
              </div>
              <div className="bg-[#FAF0D9]/40 p-4 rounded-xl border border-[#F0D97A]/30 flex flex-col gap-3">
                <p className="text-sm text-[#2B2B2B] font-medium flex items-center gap-2">
                  <span className="text-lg">⏳</span> Estimated Crafting Time: <span className="font-bold text-[#C9A227]">{product.details.craftingTime}</span>
                </p>
                {product.details.estimatedDeliveryTime && (
                  <p className="text-sm text-[#2B2B2B] font-medium flex items-center gap-2">
                    <span className="text-lg">🚚</span> Estimated Delivery: <span className="font-bold text-[#C9A227]">{product.details.estimatedDeliveryTime}</span>
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <div className="bg-white py-20 border-t border-[#E8DCC8]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-[#2B2B2B] mb-10 text-center"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(rel => {
                const relDiscount = rel.originalPrice ? Math.round(((rel.originalPrice - rel.price) / rel.originalPrice) * 100) : null;
                return (
                  <Link key={rel.id} href={`/product/${rel.id}`} className="group block">
                    <div className="relative aspect-[4/5] bg-[#FAF8F2] rounded-2xl overflow-hidden mb-4">
                      <Image src={rel.image} alt={rel.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      {relDiscount && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold text-[#2B2B2B] tracking-wide"
                              style={{ background: "linear-gradient(135deg,#F0D97A,#C9A227)" }}>
                          {relDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#2B2B2B] leading-snug mb-1"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                      {rel.title}
                    </h3>
                    <p className="text-sm font-bold text-[#C9A227]"
                       style={{ fontFamily: "'Playfair Display', serif" }}>
                      ₹{rel.price.toLocaleString("en-IN")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
