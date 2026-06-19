import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BestSellers from "@/components/BestSellers";
import ShopByStyle from "@/components/ShopByStyle";
import WhyChooseUs from "@/components/WhyChooseUs";
import Footer from "@/components/Footer";
import SignatureBanner from "@/components/SignatureBanner";

export default function HomePage() {
  return (
    <main id="main-content">
      <Navbar />
      <HeroSection />
      <SignatureBanner />
      <ShopByStyle />
      <BestSellers />
      <WhyChooseUs />
      <Footer />
    </main>
  );
}
