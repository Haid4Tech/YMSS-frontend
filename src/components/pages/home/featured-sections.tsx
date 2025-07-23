import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedSections() {
  return (
    <div className="py-20 bg-background">
      {/* Latest News & Events */}
      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Latest News & Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* News Card 1 */}
          <div className="bg-card rounded-xl overflow-hidden shadow-lg hover-scale">
            <div className="relative h-48">
              <Image
                src="/announcement.png"
                alt="School News"
                width={200}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <span className="text-sm text-accent font-medium">News</span>
              <h3 className="text-xl font-bold mt-2 mb-3">
                National Science Fair Winners
              </h3>
              <p className="text-muted-foreground mb-4">
                Our students secured top positions in the National Science Fair
                2024.
              </p>
              <Button variant="link" asChild>
                <Link href="/news">Read More →</Link>
              </Button>
            </div>
          </div>

          {/* Event Card */}
          <div className="bg-card rounded-xl overflow-hidden shadow-lg hover-scale">
            <div className="relative h-48">
              <Image
                src="/calendar.png"
                alt="School Event"
                width={200}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <span className="text-sm text-secondary font-medium">Event</span>
              <h3 className="text-xl font-bold mt-2 mb-3">Annual Sports Day</h3>
              <p className="text-muted-foreground mb-4">
                Join us for an exciting day of sports and activities.
              </p>
              <Button variant="link" asChild>
                <Link href="/events">Learn More →</Link>
              </Button>
            </div>
          </div>

          {/* Achievement Card */}
          <div className="bg-card rounded-xl overflow-hidden shadow-lg hover-scale">
            <div className="relative h-48">
              <Image
                src="/result.png"
                alt="School Achievement"
                width={200}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <span className="text-sm text-primary font-medium">
                Achievement
              </span>
              <h3 className="text-xl font-bold mt-2 mb-3">
                100% College Acceptance
              </h3>
              <p className="text-muted-foreground mb-4">
                Class of 2024 achieves 100% college acceptance rate.
              </p>
              <Button variant="link" asChild>
                <Link href="/achievements">Discover More →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose YMSS?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image
                src="/teacher.png"
                alt="Expert Faculty"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-3">Expert Faculty</h3>
            <p className="text-muted-foreground">
              Learn from experienced educators dedicated to student success.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image
                src="/class.png"
                alt="Modern Facilities"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-3">Modern Facilities</h3>
            <p className="text-muted-foreground">
              State-of-the-art labs, library, and sports facilities.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image
                src="/subject.png"
                alt="Diverse Programs"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-3">Diverse Programs</h3>
            <p className="text-muted-foreground">
              Comprehensive curriculum with diverse extracurricular activities.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <Image
                src="/globe.svg"
                alt="Global Perspective"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Perspective</h3>
            <p className="text-muted-foreground">
              International programs and cultural exchange opportunities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
