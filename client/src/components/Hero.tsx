import { Sparkles, Pen, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onGetStarted?: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const handleGetStarted = () => {
    console.log('Get started clicked');
    if (onGetStarted) {
      onGetStarted();
    } else {
      document.getElementById('generators')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreGuides = () => {
    console.log('Explore guides clicked');
    document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-background via-background to-primary/5 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium">Your Creative Writing Companion</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Unleash Your
            <span className="text-primary"> Creative Potential</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover powerful writing tools, generators, and comprehensive guides designed to inspire 
            and support your creative writing journey. From character creation to plot development, 
            find everything you need in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              data-testid="button-get-started"
              className="text-lg px-8"
            >
              <Pen className="mr-2 h-5 w-5" />
              Start Creating
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleExploreGuides}
              data-testid="button-explore-guides"
              className="text-lg px-8"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Guides
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Generators</h3>
              <p className="text-muted-foreground">
                AI-powered tools for characters, plots, and settings
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-chart-2/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Guides</h3>
              <p className="text-muted-foreground">
                Curated writing tips and techniques from professionals
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-chart-3/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Creative Prompts</h3>
              <p className="text-muted-foreground">
                Endless inspiration for any genre or writing style
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}