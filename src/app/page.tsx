import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";
import HeroSection from "@/components/pages/home/hero-section";
import AdmissionsSection from "@/components/pages/home/admissions";
import CoreValues from "@/components/pages/home/core-values";
import ExpectBanner from "@/components/pages/home/expect-banner";
import News from "@/components/pages/home/news-section";

import Image from "next/image";
// import ChoosingYMSSSection from "@/components/pages/home/choosing-ymss";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <MenuBar view={"main"} />
      <div className="space-y-10">
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
      </div>

      {/* vector */}
      <div className={"absolute top-[40%] left-5 opacity-50 z-10"}>
        <Image
          width={80}
          height={80}
          src={"/patterns/bulb-vector.svg"}
          alt={""}
        />
      </div>
    </main>
  );
}
