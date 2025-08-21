import Image from "next/image";
import LeadershipSection from "@/components/pages/about-us/leadership";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/auth_pexels.jpg"
            alt="School Campus"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white text-center z-10">
          <div className="container px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 slide-up">
              About YMSS
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto slide-up opacity-90">
              Building tomorrow&apos;s leaders through excellence in education
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              To provide exceptional education that nurtures intellectual
              curiosity, fosters personal growth, and develops responsible
              global citizens who are prepared to lead and serve in an
              ever-changing world.
            </p>
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-lg text-muted-foreground">
              To be a leading educational institution that inspires innovation,
              embraces diversity, and empowers students to achieve their fullest
              potential while making positive contributions to society.
            </p>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/kids_toys.jpg"
              alt="School Life"
              fill
              className="object-cover hover-scale"
            />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-main-blue-tint3">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary/20" />

            {/* Timeline Items */}
            <div className="space-y-20">
              {/* 1990 */}
              <div className="relative">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-main-blue-tint3 text-white px-4 py-2 rounded-full text-lg font-semibold">
                    2013
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-lg max-w-xl mx-auto hover-scale">
                  <h3 className="text-xl font-bold mb-3 text-main-blue-tint3">
                    Foundation
                  </h3>
                  <p className="text-muted-foreground">
                    YMSS was established with a vision to provide quality
                    education to the community.
                  </p>
                </div>
              </div>

              {/* 2000 */}
              <div className="relative">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-main-blue-tint3 text-white px-4 py-2 rounded-full text-lg font-semibold">
                    2000
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-lg max-w-xl mx-auto hover-scale">
                  <h3 className="text-xl font-bold mb-3 text-main-blue-tint3">
                    Campus Expansion
                  </h3>
                  <p className="text-muted-foreground">
                    Major campus expansion with new facilities and modern
                    infrastructure.
                  </p>
                </div>
              </div>

              {/* 2010 */}
              <div className="relative">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-main-blue-tint3 text-white px-4 py-2 rounded-full text-lg font-semibold">
                    2010
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-lg max-w-xl mx-auto hover-scale">
                  <h3 className="text-xl font-bold mb-3 text-main-blue-tint3">
                    Digital Innovation
                  </h3>
                  <p className="text-muted-foreground">
                    Integration of technology in education and launch of smart
                    classrooms.
                  </p>
                </div>
              </div>

              {/* 2020 */}
              <div className="relative">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-main-blue-tint3 text-white px-4 py-2 rounded-full text-lg font-semibold">
                    2020
                  </div>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-lg max-w-xl mx-auto hover-scale">
                  <h3 className="text-xl font-bold mb-3 text-main-blue-tint3">
                    Global Recognition
                  </h3>
                  <p className="text-muted-foreground">
                    Achieved international accreditation and established global
                    partnerships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <LeadershipSection />
    </div>
  );
}
