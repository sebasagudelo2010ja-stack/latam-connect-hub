import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import GeoBanner from "@/components/GeoBanner";
import CountriesSection from "@/components/CountriesSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main>
      <HeroSection />
      <CountriesSection />
    </main>
    <Footer />
    <GeoBanner />
  </div>
);

export default Index;
