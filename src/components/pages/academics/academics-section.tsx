import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calculator,
  Microscope,
  Palette,
  Globe,
  Music,
} from "lucide-react";
import Image from "next/image";

const AcademicsDepartments = () => {
  const departments = [
    {
      icon: BookOpen,
      title: "English & Literature",
      description:
        "Comprehensive language arts program focusing on critical thinking, writing, and communication.",
      courses: [
        "AP Literature",
        "Creative Writing",
        "Public Speaking",
        "Journalism",
      ],
    },
    {
      icon: Calculator,
      title: "Mathematics",
      description:
        "From algebra to advanced calculus, preparing students for STEM careers and higher education.",
      courses: ["AP Calculus", "Statistics", "Geometry", "Pre-Calculus"],
    },
    {
      icon: Microscope,
      title: "Sciences",
      description:
        "State-of-the-art laboratories and hands-on learning in all major scientific disciplines.",
      courses: ["AP Biology", "Chemistry", "Physics", "Environmental Science"],
    },
    {
      icon: Globe,
      title: "Social Studies",
      description:
        "Understanding history, government, and global cultures to create informed citizens.",
      courses: ["AP History", "Government", "Psychology", "Economics"],
    },
    {
      icon: Palette,
      title: "Arts",
      description:
        "Fostering creativity through visual arts, drama, and multimedia design programs.",
      courses: ["Studio Art", "Digital Design", "Theater", "Photography"],
    },
    {
      icon: Music,
      title: "Music & Performance",
      description:
        "Award-winning music programs including band, choir, and individual instruction.",
      courses: ["Concert Band", "Jazz Ensemble", "Choir", "Music Theory"],
    },
  ];

  return (
    <section id="academics" className="py-6">
      <div className="flex flex-col gap-6 px-4">
        {/* Header */}
        {/* <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Academic Excellence
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Our rigorous academic programs prepare students for success in
            college and beyond, with Advanced Placement courses, innovative STEM
            programs, and comprehensive arts education.
          </p>
        </div> */}

        {/* Featured Image and Stats */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Image
              width={400}
              height={400}
              src={"/images/ymss-student8.jpg"}
              alt="Student giving a speech"
              className="rounded-lg shadow-elegant w-full h-auto object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-main-blue-tint3">
              Preparing{" "}
              <span className="text-main-red">Tomorrow&apos;s Leaders</span>
            </h3>
            <p className="text-lg text-muted-foreground">
              Our comprehensive curriculum combines traditional academic
              excellence with innovative teaching methods and cutting-edge
              technology.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-main-blue-tint3">
                  32
                </div>
                <div className="text-sm text-main-red-tint3/80">AP Courses</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-main-blue-tint3">
                  4.2
                </div>
                <div className="text-sm text-main-red-tint3/80">
                  Average GPA
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-main-blue-tint3">
                  89%
                </div>
                <div className="text-sm text-main-red-tint3/80">
                  AP Pass Rate
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-main-blue-tint3">
                  15:1
                </div>
                <div className="text-sm text-main-red-tint3/80">
                  Student-Teacher Ratio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Departments */}
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-center text-main-blue-tint3">
            Academic Departments
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-main-blue-tint1 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <dept.icon size={25} className="text-main-blue-tint3" />
                  </div>
                  <CardTitle className="text-xl text-main-blue-tint3">
                    {dept.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {dept.description}
                  </p>
                  <div className="space-y-1">
                    <h5 className="font-semibold text-sm text-main-blue-tint3">
                      Featured Courses:
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {dept.courses.map((course, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-main-red-tint1/50 text-main-red-tint4 px-2 py-1 rounded-md"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademicsDepartments;
