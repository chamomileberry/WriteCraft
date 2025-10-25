import { BookOpen, Heart } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
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
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold">Writing Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/generators" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-character-gen">
                  Character Generator
                </Link>
              </li>
              <li>
                <Link href="/generators" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-plot-gen">
                  Plot Generator
                </Link>
              </li>
              <li>
                <Link href="/generators" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-prompts">
                  Writing Prompts
                </Link>
              </li>
              <li>
                <Link href="/generators" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-setting-gen">
                  Setting Generator
                </Link>
              </li>
              <li>
                <Link href="/generators" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-name-gen">
                  Name Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Help */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-help">
                  Help & Documentation
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-feedback">
                  Send Feedback
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-settings">
                  Account Settings
                </Link>
              </li>
            </ul>
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
        </div>
      </div>
    </footer>
  );
}
