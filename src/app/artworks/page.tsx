import { getAllProducts } from "@/lib/products";
import ArtworksClient from "@/components/ArtworksClient";

export const revalidate = 0; // Fetch fresh data

export default async function ArtworksPage() {
  const allProducts = await getAllProducts();
  const artworks = allProducts.filter(
    p => p.category === "Tanjore Painting" || p.category === "Fabric Art"
  );

  return (
    <ArtworksClient initialProducts={artworks} />
  );
}
