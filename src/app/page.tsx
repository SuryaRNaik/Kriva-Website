import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BestSellers from "@/components/BestSellers";
import ShopByStyle from "@/components/ShopByStyle";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import SignatureBanner from "@/components/SignatureBanner";
import { getBestsellers } from "@/lib/products";

export const revalidate = 0; // Ensures fresh data for the homepage

export default async function HomePage() {
  const bestSellers = await getBestsellers(4);

  return (
    <main id="main-content">
      <Navbar />
      <HeroSection />
      <SignatureBanner />
      <ShopByStyle />
      <BestSellers products={bestSellers} />
      <WhyChooseUs />
      <Footer />
    </main>
  );
}
