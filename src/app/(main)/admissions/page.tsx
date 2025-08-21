import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MessageCircleMore,
  Send,
  NotebookText,
  Plus,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function Admissions() {
  const admissionSteps = [
    {
      step: 1,
      title: "Submit Application",
      description:
        "Complete the online application form with all required documents",
      icon: Send,
      color: "primary",
    },
    {
      step: 2,
      title: "Entrance Assessment",
      description: "Take our comprehensive entrance exam and skills assessment",
      icon: NotebookText,
      color: "secondary",
    },
    {
      step: 3,
      title: "Interview",
      description: "Personal interview with our admissions team",
      icon: MessageCircleMore,
      color: "accent",
    },
    {
      step: 4,
      title: "Decision & Enrollment",
      description: "Receive admission decision and complete enrollment process",
      icon: Plus,
      color: "primary",
    },
  ];

  const faqs = [
    {
      question: "What are the age requirements for admission?",
      answer:
        "Students must be between 14-18 years old for high school admission.",
    },
    {
      question: "What documents are required for application?",
      answer:
        "Required documents include previous academic records, identification, and recommendation letters.",
    },
    {
      question: "Are there scholarship opportunities available?",
      answer:
        "Yes, we offer merit-based and need-based scholarships to qualified students.",
    },
    {
      question: "When is the application deadline?",
      answer:
        "Regular admission deadline is March 1st for the following academic year.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/auth_pexels.jpg"
            alt="Admissions"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white text-center z-10">
          <div className="container px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 slide-up">
              Join Our Community
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto slide-up opacity-90">
              Begin your journey towards academic excellence and personal growth
            </p>
            <Button size="lg" className="mt-8 text-white px-8">
              Apply Now
            </Button>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          Admission Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {admissionSteps.map((step) => (
            <div
              key={step.step}
              className="bg-card rounded-xl p-8 shadow-lg hover-scale relative"
            >
              <div className="absolute -top-4 -left-4 p-1 border-3 border-main-red-tint3 rounded-full">
                <div className=" w-10 h-10 rounded-full bg-main-blue-tint3 flex items-center justify-center text-white font-bold">
                  {step.step}
                </div>
              </div>

              <div className="w-16 h-16 relative mb-6">
                <step.icon size={40} className="text-main-red-tint3" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-main-blue-tint3">
                {step.title}
              </h3>
              <p className="text-main-blue-tint3/80">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/kids_toys.jpg"
                alt="School Requirements"
                fill
                className="object-cover hover-scale"
              />
            </div>
            <div className={"space-y-12"}>
              <h2 className="text-3xl font-bold text-main-blue-tint3">
                Admission Requirements
              </h2>
              <div className="space-y-10">
                <div className="flex gap-4 items-start">
                  <div className="bg-main-blue-tint3/10 p-2 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check size={25} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-main-blue-tint3">
                      Academic Records
                    </h3>
                    <p className="text-muted-foreground">
                      Previous academic transcripts showing consistent
                      performance
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-main-blue-tint3/30 p-2 rounded-full flex items-center justify-center shrink-0">
                    <Check size={25} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-main-blue-tint3">
                      Recommendations
                    </h3>
                    <p className="text-muted-foreground">
                      At least one letters of recommendation from current or
                      previous teachers
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-main-blue-tint3/60 p-2 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Check size={25} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-main-blue-tint3">
                      Personal Statement
                    </h3>
                    <p className="text-muted-foreground">
                      Essay describing your academic goals and interests
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 container mx-auto px-4 space-y-10">
        <h2 className="text-4xl font-bold text-center text-main-blue-tint3">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-6 shadow-lg hover-scale"
            >
              <h3 className="text-xl font-bold mb-3 text-main-blue-tint3">
                {faq.question}
              </h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground mb-6">
            Have more questions? We&apos;re here to help!
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact-us">Contact Admissions</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
