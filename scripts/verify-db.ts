import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    
    const schema = new mongoose.Schema({ id: String, price: Number, stock: Number }, { strict: false });
    const Product = mongoose.models.Product || mongoose.model("Product", schema);
    
    const product = await Product.findOne({ id: "dress-1" });
    
    if (product) {
      console.log(`DB_VERIFY: ID=${product.id}, PRICE=${product.price}, STOCK=${product.stock}`);
    } else {
      console.log("DB_VERIFY: Product dress-1 not found in database.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("DB_VERIFY ERROR:", error);
    process.exit(1);
  }
}

run();
