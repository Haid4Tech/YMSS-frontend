import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[40vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/auth_pexels.jpg"
            alt="Contact Us"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/50" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white text-center z-10">
          <div className="container px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 slide-up">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto slide-up opacity-90">
              We&apos;re here to answer your questions and help you get started
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Address */}
          <div className="text-center p-6 bg-card rounded-xl shadow-lg hover-scale">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <Image
                src="/globe.svg"
                alt="Location"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Visit Us</h3>
            <p className="text-muted-foreground">
              123 School Street
              <br />
              Cityville, State 12345
              <br />
              United States
            </p>
          </div>

          {/* Phone */}
          <div className="text-center p-6 bg-card rounded-xl shadow-lg hover-scale">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <Image
                src="/phone.png"
                alt="Phone"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Call Us</h3>
            <p className="text-muted-foreground">
              Main: (555) 123-4567
              <br />
              Admissions: (555) 123-4568
              <br />
              Fax: (555) 123-4569
            </p>
          </div>

          {/* Email */}
          <div className="text-center p-6 bg-card rounded-xl shadow-lg hover-scale">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <Image
                src="/mail.png"
                alt="Email"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Email Us</h3>
            <p className="text-muted-foreground">
              info@ymss.edu
              <br />
              admissions@ymss.edu
              <br />
              support@ymss.edu
            </p>
          </div>
        </div>

        {/* Contact Form and Map */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-8">Send Us a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  placeholder="Enter message subject"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  className="w-full min-h-[150px] rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Enter your message"
                />
              </div>

              <Button size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>

          {/* Map */}
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-8">Find Us</h2>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              {/* Replace with actual map component */}
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">
                  Google Maps will be integrated here
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Office Hours</h2>
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Academic Year</h3>
              <p className="text-muted-foreground">
                Monday - Friday
                <br />
                8:00 AM - 4:00 PM
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Summer Hours</h3>
              <p className="text-muted-foreground">
                Monday - Thursday
                <br />
                9:00 AM - 3:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
