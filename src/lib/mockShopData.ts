export type ShopProduct = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  image: string;
  soldOut: boolean;
  isNew: boolean;
};

export const MOCK_SHOP_DATA: Record<string, ShopProduct[]> = {
  "sarees": [
    { id: "saree-1", title: "Pastel Rose Saree", subtitle: "Hand-painted floral motifs on pure organza", price: 12500, originalPrice: 15000, rating: 4.9, image: "/images/mockup_saree.png", soldOut: false, isNew: true },
    { id: "saree-2", title: "Ivory Gold Saree", subtitle: "Elegant hand-painted borders", price: 11000, originalPrice: null, rating: 4.8, image: "/images/mockup_saree.png", soldOut: false, isNew: false },
    { id: "saree-3", title: "Blush Chiffon Saree", subtitle: "Delicate aesthetic details", price: 9500, originalPrice: 12000, rating: 4.7, image: "/images/mockup_saree.png", soldOut: false, isNew: false },
    { id: "saree-4", title: "Vintage Mint Saree", subtitle: "Classic hand-painted luxury piece", price: 13200, originalPrice: null, rating: 5.0, image: "/images/mockup_saree.png", soldOut: false, isNew: true },
    { id: "saree-5", title: "Orchid Silk Saree", subtitle: "Hand-painted orchids on pure silk", price: 14500, originalPrice: 16000, rating: 4.9, image: "/images/mockup_saree.png", soldOut: false, isNew: false },
    { id: "saree-6", title: "Midnight Blue Saree", subtitle: "Stars and floral fusion", price: 10500, originalPrice: null, rating: 4.8, image: "/images/mockup_saree.png", soldOut: true, isNew: false },
  ],
  "mens-wear": [
    { id: "mens-1", title: "Ivory Embroidered Kurta", subtitle: "Classic premium hand-painted details", price: 6500, originalPrice: 8000, rating: 4.8, image: "/images/mockup_mens.png", soldOut: false, isNew: true },
    { id: "mens-2", title: "Pastel Mint Kurta Set", subtitle: "Minimalist aesthetic for festive wear", price: 7200, originalPrice: null, rating: 4.7, image: "/images/mockup_mens.png", soldOut: false, isNew: false },
    { id: "mens-3", title: "Charcoal Silk Kurta", subtitle: "Deep elegant tones with subtle art", price: 8500, originalPrice: 10000, rating: 4.9, image: "/images/mockup_mens.png", soldOut: false, isNew: false },
    { id: "mens-4", title: "Blush Pink Kurta", subtitle: "Modern cut with traditional motifs", price: 6800, originalPrice: null, rating: 4.8, image: "/images/mockup_mens.png", soldOut: false, isNew: true },
    { id: "mens-5", title: "Royal Blue Kurta Set", subtitle: "Luxurious pure silk set", price: 9000, originalPrice: 11000, rating: 5.0, image: "/images/mockup_mens.png", soldOut: false, isNew: false },
    { id: "mens-6", title: "Golden Yellow Kurta", subtitle: "Vibrant Haldi special attire", price: 5500, originalPrice: null, rating: 4.6, image: "/images/mockup_mens.png", soldOut: true, isNew: false },
  ],
  "lehengas": [
    { id: "leh-1", title: "Rose Gold Lehenga", subtitle: "Exquisite hand-painted floral panels", price: 25000, originalPrice: 28000, rating: 5.0, image: "/images/mockup_lehenga.png", soldOut: false, isNew: true },
    { id: "leh-2", title: "Pastel Bloom Lehenga", subtitle: "Soft pinks and ivory detailing", price: 22000, originalPrice: null, rating: 4.9, image: "/images/mockup_lehenga.png", soldOut: false, isNew: false },
    { id: "leh-3", title: "Mint Green Lehenga", subtitle: "Elegant aesthetic for day weddings", price: 24500, originalPrice: 27000, rating: 4.8, image: "/images/mockup_lehenga.png", soldOut: false, isNew: false },
    { id: "leh-4", title: "Deep Maroon Lehenga", subtitle: "Classic bridal hand-painted luxury", price: 35000, originalPrice: null, rating: 5.0, image: "/images/mockup_lehenga.png", soldOut: false, isNew: true },
    { id: "leh-5", title: "Ivory Pearl Lehenga", subtitle: "Subtle hand-painted motifs on white", price: 28000, originalPrice: 32000, rating: 4.9, image: "/images/mockup_lehenga.png", soldOut: false, isNew: false },
    { id: "leh-6", title: "Lavender Dream Lehenga", subtitle: "Ethereal aesthetic flow", price: 26500, originalPrice: null, rating: 4.8, image: "/images/mockup_lehenga.png", soldOut: true, isNew: false },
  ],
  "suit-sets": [
    { id: "suit-1", title: "Blush Anarkali Suit", subtitle: "Flowing hand-painted elegance", price: 8500, originalPrice: 10500, rating: 4.9, image: "/images/mockup_suit.png", soldOut: false, isNew: true },
    { id: "suit-2", title: "Ivory Straight Cut Suit", subtitle: "Minimalist luxury everyday wear", price: 7200, originalPrice: null, rating: 4.8, image: "/images/mockup_suit.png", soldOut: false, isNew: false },
    { id: "suit-3", title: "Pastel Mint Sharara", subtitle: "Festive aesthetic with hand art", price: 9800, originalPrice: 1, rating: 5.0, image: "/images/mockup_suit.png", soldOut: false, isNew: true },
    { id: "suit-4", title: "Maroon Velvet Suit", subtitle: "Rich tones with subtle hand-paint", price: 11000, originalPrice: null, rating: 4.7, image: "/images/mockup_suit.png", soldOut: false, isNew: false },
    { id: "suit-5", title: "Mustard Yellow Suit", subtitle: "Vibrant traditional motifs", price: 7500, originalPrice: 9000, rating: 4.8, image: "/images/mockup_suit.png", soldOut: false, isNew: false },
    { id: "suit-6", title: "Lavender Suit Set", subtitle: "Soft pastel luxury outfit", price: 8200, originalPrice: null, rating: 4.9, image: "/images/mockup_suit.png", soldOut: true, isNew: false },
  ],
  "kids-wear": [
    { id: "kids-1", title: "Little Princess Lehenga", subtitle: "Cute pastel hand-painted details", price: 4500, originalPrice: 5500, rating: 4.9, image: "/images/mockup_kids.png", soldOut: false, isNew: true },
    { id: "kids-2", title: "Boys Ivory Kurta", subtitle: "Elegant and comfortable pure cotton", price: 3200, originalPrice: null, rating: 4.8, image: "/images/mockup_kids.png", soldOut: false, isNew: false },
    { id: "kids-3", title: "Mini Rose Anarkali", subtitle: "Adorable floral art outfit", price: 4800, originalPrice: 6000, rating: 5.0, image: "/images/mockup_kids.png", soldOut: false, isNew: false },
    { id: "kids-4", title: "Mint Boys Kurta Set", subtitle: "Playful motifs on traditional wear", price: 3500, originalPrice: null, rating: 4.7, image: "/images/mockup_kids.png", soldOut: false, isNew: true },
    { id: "kids-5", title: "Golden Yellow Kids Suit", subtitle: "Festive bright hand-painted art", price: 4200, originalPrice: 5000, rating: 4.8, image: "/images/mockup_kids.png", soldOut: false, isNew: false },
    { id: "kids-6", title: "Lavender Kids Dress", subtitle: "Soft comfortable premium fabric", price: 3800, originalPrice: null, rating: 4.9, image: "/images/mockup_kids.png", soldOut: true, isNew: false },
  ],
};

export const CATEGORY_TITLES: Record<string, string> = {
  "sarees": "Sarees",
  "mens-wear": "Mens Wear",
  "lehengas": "Lehengas",
  "suit-sets": "Suit Sets",
  "kids-wear": "Kids Wear",
};
