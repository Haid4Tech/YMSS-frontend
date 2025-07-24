import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kids_toys.jpg"
          alt="School Environment"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[90vh] text-white text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 slide-up">
          Empowering Future Leaders
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto slide-up opacity-90">
          Welcome to YMSS, where academic excellence meets character
          development. Join us in shaping tomorrow&apos;s innovators and
          leaders.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 slide-up">
          <Button asChild size="lg">
            <Link href="/admissions">Apply Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/academics">Explore Programs</Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl mx-auto">
          <div className="glass-card rounded-xl p-6 text-center fade-in">
            <h3 className="text-4xl font-bold mb-2">98%</h3>
            <p className="text-sm opacity-90">Graduation Rate</p>
          </div>
          <div
            className="glass-card rounded-xl p-6 text-center fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="text-4xl font-bold mb-2">15:1</h3>
            <p className="text-sm opacity-90">Student-Teacher Ratio</p>
          </div>
          <div
            className="glass-card rounded-xl p-6 text-center fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <h3 className="text-4xl font-bold mb-2">100+</h3>
            <p className="text-sm opacity-90">Extracurricular Activities</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
