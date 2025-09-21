import { BookOpen, Heart, Github, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup submitted');
    // TODO: Implement newsletter signup
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-serif font-bold">WriteCraft</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your comprehensive creative writing companion. Unleash your storytelling potential with our 
              powerful tools and expert guidance.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" data-testid="link-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-github">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="link-email">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold">Writing Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#character-generator" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-character-gen">
                  Character Generator
                </a>
              </li>
              <li>
                <a href="#plot-generator" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-plot-gen">
                  Plot Generator
                </a>
              </li>
              <li>
                <a href="#writing-prompts" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-prompts">
                  Writing Prompts
                </a>
              </li>
              <li>
                <a href="#setting-generator" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-setting-gen">
                  Setting Generator
                </a>
              </li>
              <li>
                <a href="#name-generator" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-name-gen">
                  Name Generator
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#writing-guides" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-guides">
                  Writing Guides
                </a>
              </li>
              <li>
                <a href="#tutorials" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-tutorials">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#blog" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-blog">
                  Blog
                </a>
              </li>
              <li>
                <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-community">
                  Community
                </a>
              </li>
              <li>
                <a href="#support" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-support">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Inspired</h3>
            <p className="text-sm text-muted-foreground">
              Get weekly writing tips, new tool updates, and creative prompts delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSignup} className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                required
                className="text-sm"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" size="sm" className="w-full" data-testid="button-newsletter-signup">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} WriteCraft. All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-destructive fill-current" />
            <span>for writers everywhere</span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#privacy" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">
              Privacy Policy
            </a>
            <a href="#terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}