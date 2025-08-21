import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ArrowRight,
  Trophy,
  GraduationCap,
  Users,
  Star,
} from "lucide-react";

const News = () => {
  const newsItems = [
    {
      id: 1,
      category: "Achievement",
      title: "Springfield High Drama Club Wins State Championship",
      excerpt:
        "Our talented drama students brought home the gold with their outstanding performance of 'Our Town' at the state drama competition.",
      date: "March 15, 2024",
      icon: Trophy,
      featured: true,
    },
    {
      id: 2,
      category: "Academic",
      title: "National Merit Scholars Announced",
      excerpt:
        "Twelve Springfield High seniors have been named National Merit Semifinalists, the highest number in school history.",
      date: "March 10, 2024",
      icon: GraduationCap,
      featured: true,
    },
    {
      id: 3,
      category: "Community",
      title: "Spring Food Drive Exceeds Goal",
      excerpt:
        "Students, staff, and families donated over 5,000 items to support local food banks, surpassing our goal by 150%.",
      date: "March 8, 2024",
      icon: Users,
      featured: false,
    },
    {
      id: 4,
      category: "Academic",
      title: "New STEM Lab Opens with Cutting-Edge Technology",
      excerpt:
        "Our state-of-the-art STEM laboratory features the latest in robotics, 3D printing, and virtual reality technology.",
      date: "March 5, 2024",
      icon: Star,
      featured: false,
    },
    {
      id: 5,
      category: "Sports",
      title: "Eagles Basketball Advances to Regional Finals",
      excerpt:
        "Both varsity teams secured victories in the quarterfinals and are heading to the regional championship games.",
      date: "March 1, 2024",
      icon: Trophy,
      featured: false,
    },
    {
      id: 6,
      category: "Community",
      title: "Student Art Exhibition Opens at City Gallery",
      excerpt:
        "Twenty-five student artworks are featured in 'Young Voices,' a month-long exhibition at downtown Springfield Gallery.",
      date: "February 28, 2024",
      icon: Star,
      featured: false,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Achievement":
        return "bg-main-blue-tint2";
      case "Sports":
        return "bg-secondary text-secondary-foreground";
      case "Academic":
        return "bg-main-blue text-primary-foreground";
      case "Community":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section id="news" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-main-blue mb-4">
            School News & Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay up-to-date with the latest news, achievements, and upcoming
            events from the Springfield High School community.
          </p>
        </div>

        {/* Featured News */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {newsItems
            .filter((item) => item.featured)
            .map((item) => (
              <Card
                key={item.id}
                className="shadow-elegant hover:shadow-2xl transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <div className="w-10 h-10 bg-main-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon size={20} className="text-main-blue-tint1" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-main-blue leading-tight">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {item.date}
                    </div>
                    <Button variant="ghost" size="sm" className="group/btn">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Regular News */}
        <div>
          <h3 className="text-2xl font-bold text-main-blue-tint3 mb-8">
            Recent Updates
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {newsItems
              .filter((item) => !item.featured)
              .map((item) => (
                <Card
                  key={item.id}
                  className="shadow-card hover:shadow-elegant transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        variant="outline"
                        className="text-xs text-main-blue"
                      >
                        {item.category}
                      </Badge>
                      <item.icon size={18} className="text-main-red" />
                    </div>
                    <CardTitle className="text-base text-main-blue leading-tight">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {item.date}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Newsletter Signup */}
          <div className="text-center bg-muted/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-main-blue mb-4">
              Stay Connected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to our weekly newsletter to receive the latest news,
              event announcements, and important updates directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="bg-main-blue hover:opacity-90 transition-opacity">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
