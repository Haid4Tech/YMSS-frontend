import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AcademicsDepartments from "@/components/pages/academics/academics-section";

export default function Academics() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/kids_toys.jpg"
            alt="Academic Excellence"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white text-center z-10">
          <div className="container px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 slide-up">
              Academic Excellence
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto slide-up opacity-90">
              Discover our comprehensive academic programs designed to inspire
              and challenge
            </p>
          </div>
        </div>
      </section>

      {/* Academic Departments */}
      <section className="py-20 container mx-auto px-4">
        <AcademicsDepartments />
      </section>

      {/* Academic Features */}
      <section className="relative py-20 bg-main-blue-tint3">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={"space-y-10"}>
              <h2 className="text-3xl lg:text-4xl font-bold text-main-red-tint3">
                Academic Features
              </h2>
              <div className="space-y-8">
                <div className="border border-blue-tint1 flex gap-4 p-4 rounded-lg">
                  <div className="rounded-lg w-12 h-12 relative shrink-0">
                    <Image
                      className="object-contain"
                      src="/patterns/class_icon_2.svg"
                      alt="Small Classes"
                      fill
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-main-red-tint3">
                      Small Class Sizes
                    </h3>
                    <p className="text-main-blue-tint1">
                      15:1 student-teacher ratio ensures personalized attention
                    </p>
                  </div>
                </div>

                <div className="border border-blue-tint1 -rotate-2 p-4 rounded-lg flex gap-4">
                  <div className="rounded-lg w-12 h-12 relative shrink-0">
                    <Image
                      src="/patterns/funfact_icon_4.svg"
                      alt="Advanced Programs"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-main-red-tint3">
                      Cultural Activities
                    </h3>
                    <p className="text-main-blue-tint1">
                      Learning about the Nigerian diversity
                    </p>
                  </div>
                </div>

                <div className="border border-blue-tint1 p-4 rounded-lg flex gap-4">
                  <div className="p-2 rounded-lg w-12 h-12 relative shrink-0">
                    <Image
                      src="/patterns/teach_icon_1.svg"
                      alt="Modern Labs"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-main-red-tint3">
                      Leadership Programs
                    </h3>
                    <p className="text-main-blue-tint1">
                      AP and IB courses for college preparation
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={"/images/ymss-cultural2.jpg"}
                alt="Academic Features"
                fill
                className="object-cover hover-scale"
              />
            </div>
          </div>
        </div>

        {/* vectors */}
        <div className="circle-vector-large"></div>
      </section>

      {/* Academic Success */}
      <section className="py-20 container mx-auto px-4 space-y-15">
        <h2 className="text-4xl font-bold text-center text-main-blue-tint3">
          Academic Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-main-blue-tint3/10 rounded-xl p-8 text-center">
            <h3 className="text-4xl font-bold text-primary mb-2">98%</h3>
            <p className="text-lg font-medium">College Acceptance Rate</p>
          </div>
          <div className="bg-main-blue-tint3 rounded-xl p-8 text-center -translate-y-6">
            <h3 className="text-4xl font-bold text-main-blue-tint1 mb-2">
              85%
            </h3>
            <p className="text-lg font-medium text-main-blue-tint1">
              AP Exam Pass Rate
            </p>
          </div>
          <div className="bg-main-blue-tint3/10 rounded-xl p-8 text-center">
            <h3 className="text-4xl font-bold text-main-blue-tint3 mb-2">
              50+
            </h3>
            <p className="text-lg font-medium">Academic Clubs</p>
          </div>
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="px-8">
            <Link href="/admissions">Apply Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
