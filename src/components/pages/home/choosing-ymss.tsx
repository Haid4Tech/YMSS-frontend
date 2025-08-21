import Image from "next/image";

const ChoosingYMSSSection = () => {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-12">Why Choose YMSS?</h2>
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
  );
};

export default ChoosingYMSSSection;
