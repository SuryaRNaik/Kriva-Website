import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await connectDB();
  
  // Note: params.id is the _id from MongoDB
  const product = await Product.findById(params.id).lean();
  
  if (!product) {
    notFound();
  }

  // Convert ObjectIds to string to avoid serialization issues
  const safeProduct = JSON.parse(JSON.stringify(product));

  return <ProductForm initialData={safeProduct} isEdit={true} />;
}
