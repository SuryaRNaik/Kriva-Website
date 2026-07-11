"use server";

import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function validateCartStock(items: { id: string, quantity: number }[]) {
  await dbConnect();

  const results = [];

  for (const item of items) {
    try {
      const product = await Product.findById(item.id);
      if (!product) {
        results.push({ id: item.id, valid: false, error: "Product not found" });
        continue;
      }
      if (product.stock < item.quantity) {
        results.push({
          id: item.id,
          valid: false,
          availableStock: product.stock,
          error: `Only ${product.stock} available in stock`,
        });
      } else {
        results.push({ id: item.id, valid: true });
      }
    } catch (e) {
      results.push({ id: item.id, valid: false, error: "Error checking stock" });
    }
  }

  return results;
}
