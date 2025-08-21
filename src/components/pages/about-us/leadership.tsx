import Image from "next/image";

const LeadershipSection = () => {
  return (
    <section className="py-20 container mx-auto px-4">
      <h2 className="text-4xl font-bold text-center mb-16 text-main-blue-tint3">
        Our Leadership
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Principal */}
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden">
            <Image
              src="/avatar.png"
              alt="Principal"
              fill
              className="object-cover hover-scale"
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">Dr. Sarah Johnson</h3>
          <p className="text-primary font-medium mb-4">Principal</p>
          <p className="text-muted-foreground">
            With over 20 years of experience in education leadership and a
            doctorate in Educational Administration.
          </p>
        </div>

        {/* Vice Principal */}
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden">
            <Image
              src="/avatar.png"
              alt="Vice Principal"
              fill
              className="object-cover hover-scale"
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">Prof. Michael Chen</h3>
          <p className="text-secondary font-medium mb-4">Vice Principal</p>
          <p className="text-muted-foreground">
            Specializes in curriculum development and student affairs
            management.
          </p>
        </div>

        {/* Academic Director */}
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden">
            <Image
              src="/avatar.png"
              alt="Academic Director"
              fill
              className="object-cover hover-scale"
            />
          </div>
          <h3 className="text-2xl font-bold mb-2">Dr. Emily Martinez</h3>
          <p className="text-accent font-medium mb-4">Academic Director</p>
          <p className="text-muted-foreground">
            Leading innovation in teaching methodologies and academic
            excellence.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
