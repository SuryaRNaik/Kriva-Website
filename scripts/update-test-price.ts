import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const schema = new mongoose.Schema({}, { strict: false });
  const Product =
    mongoose.models.Product || mongoose.model("Product", schema);

  const products = await Product.find();

  console.log(products);

  process.exit(0);
}

run();