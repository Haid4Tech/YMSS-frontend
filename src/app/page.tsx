import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";
import HeroSection from "@/components/pages/home/hero-section";
import AdmissionsSection from "@/components/pages/home/admissions";
import CoreValues from "@/components/pages/home/core-values";
import ExpectBanner from "@/components/pages/home/expect-banner";
import News from "@/components/pages/home/news-section";
// import ChoosingYMSSSection from "@/components/pages/home/choosing-ymss";

export default function Home() {
  return (
    <main className="min-h-screen space-y-10">
      <MenuBar view={"main"} />
      <HeroSection />
      <AdmissionsSection />
      <div className={"px-5 lg:px-10 xl:px-15"}>
        <ExpectBanner />
      </div>
      <div className="px-5">
        <CoreValues />
      </div>

      <News />
      <Footer />
    </main>
  );
}
