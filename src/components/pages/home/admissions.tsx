"use client";

import { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { FileText, Users, CheckCircle } from "lucide-react";

const AdmissionsSection = () => {
  const [date] = useState<Date>(new Date());

  const admissionSteps = [
    {
      icon: FileText,
      title: "Complete Application",
      description:
        "Fill out our online application form with student information and academic history.",
    },
    {
      icon: Users,
      title: "Schedule Interview",
      description:
        "Meet with our admissions team to discuss your academic goals and interests.",
    },
    {
      icon: CheckCircle,
      title: "Submit Documents",
      description:
        "Provide transcripts, recommendations, and any required testing scores.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-stretch">
      {/* Image side */}
      <div className="relative h-[500px] w-full">
        <Image
          src="/images/ymss-students6.jpg"
          alt="students"
          fill
          className="object-cover"
        />

        {/* Base dark layer */}
        <div className="absolute inset-0 bg-[var(--main-blue-tint4)]/30"></div>
        {/* Gradient tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--main-blue)]/70 to-transparent"></div>
      </div>

      {/* Content side */}
      <div className="flex flex-col space-y-8 p-6 bg-white justify-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-main-blue">
            Admissions Open for{" "}
            <span className="text-main-red uppercase">
              {dayjs(date).format("YYYY")} -{" "}
              {dayjs(date).add(1, "year").format("YYYY")}
            </span>
          </h2>
          <p className="text-lg">
            Join our community of learners and discover your potential at{" "}
            <span className="font-semibold text-main-red">YMSS</span>.
            We&apos;re accepting applications for the upcoming academic year.
          </p>
        </div>

        <div className="space-y-10">
          {admissionSteps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <step.icon size={25} className="text-main-red" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-main-blue">
                  {step.title}
                </h4>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdmissionsSection;
