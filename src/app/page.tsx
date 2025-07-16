import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";
import HeroSection from "@/components/pages/home/hero-section";
import FeaturedSections from "@/components/pages/home/featured-sections";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <MenuBar view={"main"} />
      <HeroSection />
      <FeaturedSections />
      <Footer />
    </main>
  );
}
