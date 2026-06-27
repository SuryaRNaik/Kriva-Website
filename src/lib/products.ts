export type ProductDetails = {
  description: string;
  fabricDetails: string;
  careInstructions: string;
  craftingTime: string;
};

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  image: string;
  gallery: string[];
  soldOut: boolean;
  isNew: boolean;
  details: ProductDetails;
};

const defaultDetails: ProductDetails = {
  description: "A stunning handcrafted piece by Kriva Studio, designed to bring elegance and traditional artistry to your wardrobe or home. Every motif is carefully hand-painted by Ruchitha Reddy.",
  fabricDetails: "Premium quality fabric/material sourced for durability and aesthetic appeal.",
  careInstructions: "Dry clean only. Do not iron directly on the painted motifs.",
  craftingTime: "10-15 Days",
};

function generateGallery(mainImage: string): string[] {
  return [mainImage, mainImage, mainImage];
}

const rawProducts = [
  // ── Best Sellers / Fabric Art ──
  { id: "dress-1", title: "Blossom Hand-Painted Dress", subtitle: "Floral art on premium fabric", category: "Fabric Art", categorySlug: "fabric-art", price: 2500, originalPrice: 3500, rating: 4.8, image: "/images/bestseller_1.png", soldOut: false, isNew: false },
  { id: "dress-2", title: "Geometric Rose Gown", subtitle: "Intricate motif detailing", category: "Fabric Art", categorySlug: "fabric-art", price: 3200, originalPrice: 4200, rating: 4.9, image: "/images/bestseller_2.png", soldOut: false, isNew: false },
  { id: "dress-3", title: "Pink Blossom Anarkali", subtitle: "Traditional ethnic hand-painted anarkali", category: "Fabric Art", categorySlug: "fabric-art", price: 2800, originalPrice: 3800, rating: 4.8, image: "/images/bestseller_3.png", soldOut: false, isNew: false },
  { id: "dress-4", title: "Artisan Maxi Dress", subtitle: "Rich artistic motifs on flowing maxi", category: "Fabric Art", categorySlug: "fabric-art", price: 2000, originalPrice: 3000, rating: 4.7, image: "/images/bestseller_4.png", soldOut: false, isNew: false },
  { id: "lehenga-tulip", title: "Tulip Hand-Painted Lehenga", subtitle: "Signature orange tulip lehenga — one of a kind", category: "Fabric Art", categorySlug: "fabric-art", price: 4500, originalPrice: 5500, rating: 5.0, image: "/images/lehenga.png", soldOut: false, isNew: false },
  { id: "art-elephant", title: "Royal Elephant", subtitle: "Hand-painted ceremonial elephant on silk", category: "Fabric Art", categorySlug: "fabric-art", price: 3200, originalPrice: 4000, rating: 4.8, image: "/images/art_elephant.png", soldOut: false, isNew: false },
  { id: "art-floral", title: "Floral Mandala", subtitle: "Intricate floral mandala on premium fabric", category: "Fabric Art", categorySlug: "fabric-art", price: 2800, originalPrice: null, rating: 4.9, image: "/images/art_floral.png", soldOut: false, isNew: true },
  { id: "art-lotus", title: "Golden Lotus", subtitle: "Sacred lotus motif in gold and ivory tones", category: "Fabric Art", categorySlug: "fabric-art", price: 3000, originalPrice: null, rating: 4.8, image: "/images/art_lotus.png", soldOut: false, isNew: false },
  { id: "art-peacock", title: "Peacock Dance", subtitle: "Vibrant peacock spread hand-painted on dupatta", category: "Fabric Art", categorySlug: "fabric-art", price: 3500, originalPrice: 4200, rating: 4.9, image: "/images/art_peacock.png", soldOut: false, isNew: false },
  { id: "art-fabric", title: "Heritage Fabric Piece", subtitle: "Traditional motifs on handwoven cotton", category: "Fabric Art", categorySlug: "fabric-art", price: 5000, originalPrice: null, rating: 4.7, image: "/images/art_fabric.png", soldOut: false, isNew: false },

  // ── Tanjore Paintings ──
  { id: "tanjore-ganesha", title: "Lord Ganesha", subtitle: "Gold-leaf Tanjore painting on wood board", category: "Tanjore Painting", categorySlug: "tanjore-painting", price: 6500, originalPrice: 8000, rating: 4.9, image: "/images/tanjore_ganesha.png", soldOut: false, isNew: true },
  { id: "tanjore-krishna", title: "Lord Krishna", subtitle: "Classic Tanjore deity art with gem inlay", category: "Tanjore Painting", categorySlug: "tanjore-painting", price: 7200, originalPrice: null, rating: 4.9, image: "/images/tanjore_krishna.png", soldOut: false, isNew: false },
  { id: "tanjore-lakshmi", title: "Goddess Lakshmi", subtitle: "Prosperity deity — gold foil & jewel finish", category: "Tanjore Painting", categorySlug: "tanjore-painting", price: 7800, originalPrice: null, rating: 5.0, image: "/images/tanjore_lakshmi.png", soldOut: false, isNew: false },

  // ── Sarees ──
  { id: "saree-1", title: "Pastel Rose Saree", subtitle: "Hand-painted floral motifs on pure organza", category: "Sarees", categorySlug: "sarees", price: 12500, originalPrice: 15000, rating: 4.9, image: "/images/mockup_saree.png", soldOut: false, isNew: true },
  { id: "saree-2", title: "Ivory Gold Saree", subtitle: "Elegant hand-painted borders", category: "Sarees", categorySlug: "sarees", price: 11000, originalPrice: null, rating: 4.8, image: "/images/mockup_saree.png", soldOut: false, isNew: false },
  { id: "saree-3", title: "Blush Chiffon Saree", subtitle: "Delicate aesthetic details", category: "Sarees", categorySlug: "sarees", price: 9500, originalPrice: 12000, rating: 4.7, image: "/images/mockup_saree.png", soldOut: false, isNew: false },
  { id: "saree-4", title: "Vintage Mint Saree", subtitle: "Classic hand-painted luxury piece", category: "Sarees", categorySlug: "sarees", price: 13200, originalPrice: null, rating: 5.0, image: "/images/mockup_saree.png", soldOut: false, isNew: true },
  { id: "saree-5", title: "Orchid Silk Saree", subtitle: "Hand-painted orchids on pure silk", category: "Sarees", categorySlug: "sarees", price: 14500, originalPrice: 16000, rating: 4.9, image: "/images/mockup_saree.png", soldOut: false, isNew: false },
  { id: "saree-6", title: "Midnight Blue Saree", subtitle: "Stars and floral fusion", category: "Sarees", categorySlug: "sarees", price: 10500, originalPrice: null, rating: 4.8, image: "/images/mockup_saree.png", soldOut: true, isNew: false },

  // ── Mens Wear ──
  { id: "mens-1", title: "Ivory Embroidered Kurta", subtitle: "Classic premium hand-painted details", category: "Mens Wear", categorySlug: "mens-wear", price: 6500, originalPrice: 8000, rating: 4.8, image: "/images/mockup_mens.png", soldOut: false, isNew: true },
  { id: "mens-2", title: "Pastel Mint Kurta Set", subtitle: "Minimalist aesthetic for festive wear", category: "Mens Wear", categorySlug: "mens-wear", price: 7200, originalPrice: null, rating: 4.7, image: "/images/mockup_mens.png", soldOut: false, isNew: false },
  { id: "mens-3", title: "Charcoal Silk Kurta", subtitle: "Deep elegant tones with subtle art", category: "Mens Wear", categorySlug: "mens-wear", price: 8500, originalPrice: 10000, rating: 4.9, image: "/images/mockup_mens.png", soldOut: false, isNew: false },
  { id: "mens-4", title: "Blush Pink Kurta", subtitle: "Modern cut with traditional motifs", category: "Mens Wear", categorySlug: "mens-wear", price: 6800, originalPrice: null, rating: 4.8, image: "/images/mockup_mens.png", soldOut: false, isNew: true },
  { id: "mens-5", title: "Royal Blue Kurta Set", subtitle: "Luxurious pure silk set", category: "Mens Wear", categorySlug: "mens-wear", price: 9000, originalPrice: 11000, rating: 5.0, image: "/images/mockup_mens.png", soldOut: false, isNew: false },
  { id: "mens-6", title: "Golden Yellow Kurta", subtitle: "Vibrant Haldi special attire", category: "Mens Wear", categorySlug: "mens-wear", price: 5500, originalPrice: null, rating: 4.6, image: "/images/mockup_mens.png", soldOut: true, isNew: false },

  // ── Lehengas ──
  { id: "leh-1", title: "Rose Gold Lehenga", subtitle: "Exquisite hand-painted floral panels", category: "Lehengas", categorySlug: "lehengas", price: 25000, originalPrice: 28000, rating: 5.0, image: "/images/mockup_lehenga.png", soldOut: false, isNew: true },
  { id: "leh-2", title: "Pastel Bloom Lehenga", subtitle: "Soft pinks and ivory detailing", category: "Lehengas", categorySlug: "lehengas", price: 22000, originalPrice: null, rating: 4.9, image: "/images/mockup_lehenga.png", soldOut: false, isNew: false },
  { id: "leh-3", title: "Mint Green Lehenga", subtitle: "Elegant aesthetic for day weddings", category: "Lehengas", categorySlug: "lehengas", price: 24500, originalPrice: 27000, rating: 4.8, image: "/images/mockup_lehenga.png", soldOut: false, isNew: false },
  { id: "leh-4", title: "Deep Maroon Lehenga", subtitle: "Classic bridal hand-painted luxury", category: "Lehengas", categorySlug: "lehengas", price: 35000, originalPrice: null, rating: 5.0, image: "/images/mockup_lehenga.png", soldOut: false, isNew: true },
  { id: "leh-5", title: "Ivory Pearl Lehenga", subtitle: "Subtle hand-painted motifs on white", category: "Lehengas", categorySlug: "lehengas", price: 28000, originalPrice: 32000, rating: 4.9, image: "/images/mockup_lehenga.png", soldOut: false, isNew: false },
  { id: "leh-6", title: "Lavender Dream Lehenga", subtitle: "Ethereal aesthetic flow", category: "Lehengas", categorySlug: "lehengas", price: 26500, originalPrice: null, rating: 4.8, image: "/images/mockup_lehenga.png", soldOut: true, isNew: false },

  // ── Suit Sets ──
  { id: "suit-1", title: "Blush Anarkali Suit", subtitle: "Flowing hand-painted elegance", category: "Suit Sets", categorySlug: "suit-sets", price: 8500, originalPrice: 10500, rating: 4.9, image: "/images/mockup_suit.png", soldOut: false, isNew: true },
  { id: "suit-2", title: "Ivory Straight Cut Suit", subtitle: "Minimalist luxury everyday wear", category: "Suit Sets", categorySlug: "suit-sets", price: 7200, originalPrice: null, rating: 4.8, image: "/images/mockup_suit.png", soldOut: false, isNew: false },
  { id: "suit-3", title: "Pastel Mint Sharara", subtitle: "Festive aesthetic with hand art", category: "Suit Sets", categorySlug: "suit-sets", price: 9800, originalPrice: 12000, rating: 5.0, image: "/images/mockup_suit.png", soldOut: false, isNew: true },
  { id: "suit-4", title: "Maroon Velvet Suit", subtitle: "Rich tones with subtle hand-paint", category: "Suit Sets", categorySlug: "suit-sets", price: 11000, originalPrice: null, rating: 4.7, image: "/images/mockup_suit.png", soldOut: false, isNew: false },
  { id: "suit-5", title: "Mustard Yellow Suit", subtitle: "Vibrant traditional motifs", category: "Suit Sets", categorySlug: "suit-sets", price: 7500, originalPrice: 9000, rating: 4.8, image: "/images/mockup_suit.png", soldOut: false, isNew: false },
  { id: "suit-6", title: "Lavender Suit Set", subtitle: "Soft pastel luxury outfit", category: "Suit Sets", categorySlug: "suit-sets", price: 8200, originalPrice: null, rating: 4.9, image: "/images/mockup_suit.png", soldOut: true, isNew: false },

  // ── Kids Wear ──
  { id: "kids-1", title: "Little Princess Lehenga", subtitle: "Cute pastel hand-painted details", category: "Kids Wear", categorySlug: "kids-wear", price: 4500, originalPrice: 5500, rating: 4.9, image: "/images/mockup_kids.png", soldOut: false, isNew: true },
  { id: "kids-2", title: "Boys Ivory Kurta", subtitle: "Elegant and comfortable pure cotton", category: "Kids Wear", categorySlug: "kids-wear", price: 3200, originalPrice: null, rating: 4.8, image: "/images/mockup_kids.png", soldOut: false, isNew: false },
  { id: "kids-3", title: "Mini Rose Anarkali", subtitle: "Adorable floral art outfit", category: "Kids Wear", categorySlug: "kids-wear", price: 4800, originalPrice: 6000, rating: 5.0, image: "/images/mockup_kids.png", soldOut: false, isNew: false },
  { id: "kids-4", title: "Mint Boys Kurta Set", subtitle: "Playful motifs on traditional wear", category: "Kids Wear", categorySlug: "kids-wear", price: 3500, originalPrice: null, rating: 4.7, image: "/images/mockup_kids.png", soldOut: false, isNew: true },
  { id: "kids-5", title: "Golden Yellow Kids Suit", subtitle: "Festive bright hand-painted art", category: "Kids Wear", categorySlug: "kids-wear", price: 4200, originalPrice: 5000, rating: 4.8, image: "/images/mockup_kids.png", soldOut: false, isNew: false },
  { id: "kids-6", title: "Lavender Kids Dress", subtitle: "Soft comfortable premium fabric", category: "Kids Wear", categorySlug: "kids-wear", price: 3800, originalPrice: null, rating: 4.9, image: "/images/mockup_kids.png", soldOut: true, isNew: false },
];

export const ALL_PRODUCTS: Product[] = rawProducts.map(p => ({
  ...p,
  gallery: generateGallery(p.image),
  details: defaultDetails,
}));

export function getProductById(id: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(slug: string): Product[] {
  return ALL_PRODUCTS.filter(p => p.categorySlug === slug);
}

export function getRelatedProducts(product: Product, limit: number = 4): Product[] {
  return ALL_PRODUCTS
    .filter(p => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit);
}

export const CATEGORY_TITLES: Record<string, string> = {
  "sarees": "Sarees",
  "mens-wear": "Mens Wear",
  "lehengas": "Lehengas",
  "suit-sets": "Suit Sets",
  "kids-wear": "Kids Wear",
  "fabric-art": "Fabric Art",
  "tanjore-painting": "Tanjore Painting"
};
