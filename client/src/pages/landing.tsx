import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Feather, Globe, Lightbulb, Sparkles, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to WriteCraft</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Craft Your Creative Worlds
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              The ultimate toolkit for writers, worldbuilders, and storytellers. 
              Organize your ideas, generate content, and bring your creative vision to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                <Users className="w-5 h-5 mr-2" />
                Sign In to Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Create</h2>
          <p className="text-xl text-muted-foreground">
            Powerful tools designed for creative writers and worldbuilders
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover-elevate">
            <CardHeader>
              <Globe className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Worldbuilding Tools</CardTitle>
              <CardDescription>
                Create detailed species, cultures, religions, languages, and entire civilizations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Character Generator</CardTitle>
              <CardDescription>
                Build rich, multidimensional characters with detailed backgrounds and motivations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <BookOpen className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Project Management</CardTitle>
              <CardDescription>
                Organize your manuscripts, notes, and worldbuilding content in structured notebooks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Lightbulb className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Writing Prompts</CardTitle>
              <CardDescription>
                Generate creative prompts and overcome writer's block with AI assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Feather className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Rich Text Editor</CardTitle>
              <CardDescription>
                Write with powerful editing tools, AI assistance, and export to multiple formats
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <Sparkles className="w-10 h-10 text-primary mb-2" />
              <CardTitle>AI-Powered Features</CardTitle>
              <CardDescription>
                Get intelligent suggestions, content generation, and writing assistance
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join writers and worldbuilders using WriteCraft to bring their creative visions to life.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login-cta"
          >
            Sign In Now
          </Button>
        </div>
      </div>
    </div>
  );
}
