import { getProductById, getRelatedProducts } from "@/lib/products";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";

export const revalidate = 0; // Fetch fresh data

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const product = await getProductById(id);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] pt-32 pb-12 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-[#2B2B2B]">Product not found</h1>
        <Link href="/" className="mt-6 text-[#C9A227] hover:underline">
          Go Back
        </Link>
      </div>
    );
  }

  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  );
}
