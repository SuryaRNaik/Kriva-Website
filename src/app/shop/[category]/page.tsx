import { getProductsByCategory } from "@/lib/products";
import { CATEGORY_TITLES } from "@/lib/constants";
import ShopCategoryClient from "@/components/ShopCategoryClient";

export const revalidate = 0; // Fetch fresh data

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categorySlug = params.category;
  const categoryTitle = CATEGORY_TITLES[categorySlug] || "Collection";
  const allProducts = await getProductsByCategory(categorySlug);

  return (
    <ShopCategoryClient 
      initialProducts={allProducts} 
      categorySlug={categorySlug} 
      categoryTitle={categoryTitle} 
    />
  );
}
