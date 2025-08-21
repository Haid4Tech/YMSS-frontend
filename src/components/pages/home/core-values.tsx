import { Award, Users, Target, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CoreValues = () => {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description:
        "We strive for the highest standards in academics, athletics, and character development.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building strong relationships between students, families, and the broader community.",
    },
    {
      icon: Target,
      title: "Innovation",
      description:
        "Embracing new technologies and teaching methods to prepare students for the future.",
    },
    {
      icon: BookOpen,
      title: "Lifelong Learning",
      description:
        "Instilling a passion for continuous learning and personal growth.",
    },
  ];

  return (
    <div>
      <h3 className="text-3xl font-bold text-center text-main-blue py-12">
        Our Core Values
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:bg-main-blue hover:shadow-xl transition-all duration-300 group"
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-main-blue group-hover:bg-main-blue-tint1 rounded-lg flex items-center justify-center mx-auto mb-4">
                <value.icon
                  size={25}
                  className="text-main-blue-tint1 group-hover:text-main-blue"
                />
              </div>
              <h4 className="text-xl font-semibold text-main-blue mb-3 group-hover:text-main-blue-tint1">
                {value.title}
              </h4>
              <p className="text-muted-foreground group-hover:text-main-blue-tint1">
                {value.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoreValues;
