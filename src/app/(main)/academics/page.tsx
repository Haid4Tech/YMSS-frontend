import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Academics() {
  const departments = [
    {
      name: "Science & Technology",
      icon: "/subject.png",
      description:
        "Advanced labs for Physics, Chemistry, Biology, and Computer Science",
      subjects: ["Physics", "Chemistry", "Biology", "Computer Science"],
      color: "primary",
    },
    {
      name: "Arts & Humanities",
      icon: "/class.png",
      description: "Rich programs in Literature, History, and Creative Arts",
      subjects: ["Literature", "History", "Fine Arts", "Music"],
      color: "secondary",
    },
    {
      name: "Mathematics",
      icon: "/result.png",
      description:
        "Comprehensive mathematics curriculum from basic to advanced levels",
      subjects: ["Algebra", "Geometry", "Calculus", "Statistics"],
      color: "accent",
    },
  ];

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
        <h2 className="text-4xl font-bold text-center mb-16">
          Our Departments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className="bg-card rounded-xl p-8 shadow-lg hover-scale"
            >
              <div className="w-16 h-16 relative mb-6">
                <Image
                  src={dept.icon}
                  alt={dept.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">{dept.name}</h3>
              <p className="text-muted-foreground mb-6">{dept.description}</p>
              <div className="space-y-2">
                {dept.subjects.map((subject) => (
                  <div
                    key={subject}
                    className="bg-background rounded-lg p-3 text-sm font-medium"
                  >
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Academic Features</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 relative shrink-0">
                    <Image
                      src="/teacher.png"
                      alt="Small Classes"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Small Class Sizes
                    </h3>
                    <p className="text-muted-foreground">
                      15:1 student-teacher ratio ensures personalized attention
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 relative shrink-0">
                    <Image
                      src="/globe.svg"
                      alt="Advanced Programs"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Advanced Programs
                    </h3>
                    <p className="text-muted-foreground">
                      AP and IB courses for college preparation
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 relative shrink-0">
                    <Image
                      src="/class.png"
                      alt="Modern Labs"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Modern Laboratories
                    </h3>
                    <p className="text-muted-foreground">
                      State-of-the-art facilities for hands-on learning
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/auth_pexels.jpg"
                alt="Academic Features"
                fill
                className="object-cover hover-scale"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Academic Success */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Academic Success
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-primary/10 rounded-xl p-8 text-center">
            <h3 className="text-4xl font-bold text-primary mb-2">98%</h3>
            <p className="text-lg font-medium">College Acceptance Rate</p>
          </div>
          <div className="bg-secondary/10 rounded-xl p-8 text-center">
            <h3 className="text-4xl font-bold text-secondary mb-2">85%</h3>
            <p className="text-lg font-medium">AP Exam Pass Rate</p>
          </div>
          <div className="bg-accent/10 rounded-xl p-8 text-center">
            <h3 className="text-4xl font-bold text-accent mb-2">50+</h3>
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
