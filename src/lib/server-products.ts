// Secure server-side product definitions to prevent price manipulation

export const SERVER_PRODUCTS: Record<string, { price: number }> = {
  // Tanjore Paintings
  "tanjore-ganesha": { price: 6500 },
  "tanjore-krishna": { price: 7200 },
  "tanjore-lakshmi": { price: 7800 },
  
  // Fabric Art
  "art-elephant": { price: 3200 },
  "art-floral": { price: 2800 },
  "art-lotus": { price: 3000 },
  "art-peacock": { price: 3500 },
  "art-fabric": { price: 2500 },
  "lehenga-tulip": { price: 4500 },
  "dress-blossom": { price: 2500 },
  "dress-geometric": { price: 3200 },
  "dress-anarkali": { price: 2800 },
  "dress-maxi": { price: 2000 },
  
  // Best Sellers (matches above)
  "dress-1": { price: 2500 },
  "dress-2": { price: 3200 },
  "dress-3": { price: 2800 },
  "dress-4": { price: 2000 },

  // Featured Collection
  "floral-tanjore": { price: 10500 },
  "peacock-kalamkari": { price: 12000 },
  "royal-elephant": { price: 22000 },
  "lotus-mandala": { price: 15500 },
  "fabric-motif": { price: 9800 },
  "tanjore-heritage": { price: 28000 },
};

export const SERVER_WORKSHOPS: Record<string, { price: number }> = {
  "Tanjore Painting — Beginner Batch": { price: 5 },
};
