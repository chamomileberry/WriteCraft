import { Sparkles, Pen, BookOpen, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeroProps {
  onGetStarted?: () => void;
  onNavigate?: (path: string) => void;
}

export default function Hero({ onGetStarted, onNavigate }: HeroProps) {
  const handleGetStarted = () => {
    console.log('Start creating clicked');
    if (onGetStarted) {
      console.log('Opening content creation modal');
      onGetStarted();
    } else if (onNavigate) {
      console.log('No callback provided, navigating to notebook page via prop');
      onNavigate('/notebook');
    } else {
      console.log('No callback or navigation provided, using fallback redirect');
      window.location.href = '/notebook';
    }
  };

  const handleStartWriting = () => {
    console.log('Start writing clicked');
    if (onNavigate) {
      onNavigate('/projects');
    } else {
      window.location.href = '/projects';
    }
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              data-testid="button-start-creating"
              className="text-lg px-8"
            >
              <Pen className="mr-2 h-5 w-5" />
              Start Creating
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleStartWriting}
              data-testid="button-start-writing"
              className="text-lg px-8"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Start Writing
            </Button>
          </div>

          <div className="flex justify-center mb-12">
            <Link 
              href="/pricing" 
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group" 
              data-testid="link-view-pricing"
            >
              View Pricing & Plans
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
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