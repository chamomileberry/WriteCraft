import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import { Link, useLocation } from "wouter";
import { HelpChatWidget } from "@/components/HelpChatWidget";

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Help & Documentation</h1>
          </div>
          <p className="text-muted-foreground">
            Learn how to make the most of WriteCraft's features and tools
          </p>
        </div>

        <div className="space-y-6">
          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
              <CardDescription>
                Get started with WriteCraft in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  1. Create Your First Notebook
                </h3>
                <p className="text-sm text-muted-foreground">
                  Notebooks help you organize your writing projects. Go to the
                  Dashboard and click "Create Notebook" to get started. You can
                  have multiple notebooks for different stories or projects.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">
                  2. Generate Characters & World Elements
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use our AI-powered generators to create characters, plots,
                  settings, and more. Access them from the Generators menu in
                  the navigation.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">
                  3. Organize with Projects
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create Projects to group related characters, settings, and
                  story elements together. Projects help you manage complex
                  stories with multiple interconnected parts.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">
                  4. Use Timelines & Family Trees
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your story's chronology with Timelines, and track
                  character relationships with Family Trees. These visual tools
                  help maintain consistency in your narrative.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger data-testid="faq-notebooks">
                    What are Notebooks and how do I use them?
                  </AccordionTrigger>
                  <AccordionContent>
                    Notebooks are containers for organizing your creative work.
                    Each notebook can hold characters, settings, plots, and
                    other story elements. You can create separate notebooks for
                    different writing projects, stories, or worldbuilding
                    universes. Think of them as individual workspaces for each
                    of your creative endeavors.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger data-testid="faq-generators">
                    How do the AI generators work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our AI generators use advanced language models to create
                    detailed characters, plots, settings, and other story
                    elements based on your inputs. Simply provide some basic
                    parameters (genre, themes, etc.) and the generator will
                    create unique content for you. You can regenerate as many
                    times as you like, and edit any generated content to fit
                    your needs.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger data-testid="faq-export">
                    Can I export my data?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes! You can export all your WriteCraft data as a JSON file
                    from your Account Settings. This includes all characters,
                    plots, projects, notebooks, guides, timelines, family trees,
                    and canvases across all your notebooks. Go to Settings →
                    Data Export to download your complete data archive.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger data-testid="faq-collaboration">
                    Can I share my work with others?
                  </AccordionTrigger>
                  <AccordionContent>
                    You can share individual guides and documentation with other
                    users by using the sharing features in the Guide editor.
                    Collaboration features for notebooks and projects are being
                    developed and will be available in a future update.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger data-testid="faq-privacy">
                    Is my writing data private and secure?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, your data is private by default. All content you create
                    is stored securely and is only accessible to you unless you
                    explicitly choose to share it. We use industry-standard
                    encryption and security practices to protect your creative
                    work.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger data-testid="faq-billing">
                    How does billing work?
                  </AccordionTrigger>
                  <AccordionContent>
                    WriteCraft offers flexible subscription plans. You can view
                    your current plan, upgrade, or manage your subscription from
                    Account Settings → Billing & Subscription. You can also
                    pause your subscription if you need a break, and your data
                    will be safely preserved.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Tool Guides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tool Usage Guides
              </CardTitle>
              <CardDescription>
                Learn how to use specific WriteCraft tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Character Generator</h4>
                  <p className="text-sm text-muted-foreground">
                    Create detailed characters with backgrounds, personalities,
                    and relationships. Customize genre, age, role, and other
                    attributes to generate unique characters for your story.
                  </p>
                  <Link href="/generators">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-character-guide"
                    >
                      Try Character Generator
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Plot Generator</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate plot ideas, story arcs, and narrative structures.
                    Select your genre and themes to create compelling storylines
                    with conflicts and resolutions.
                  </p>
                  <Link href="/generators">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-plot-guide"
                    >
                      Try Plot Generator
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Setting Generator</h4>
                  <p className="text-sm text-muted-foreground">
                    Build vivid locations and environments for your stories.
                    Generate detailed settings with atmosphere, history, and
                    unique characteristics.
                  </p>
                  <Link href="/generators">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-setting-guide"
                    >
                      Try Setting Generator
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Timeline Builder</h4>
                  <p className="text-sm text-muted-foreground">
                    Create visual timelines to track events in your story.
                    Maintain chronological consistency and plan your narrative
                    structure with ease.
                  </p>
                  <Link href="/timelines">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-timeline-guide"
                    >
                      View Timelines
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Family Tree</h4>
                  <p className="text-sm text-muted-foreground">
                    Map out character relationships and genealogies. Perfect for
                    epic sagas with multiple generations and complex family
                    dynamics.
                  </p>
                  <Link href="/family-trees">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-family-tree-guide"
                    >
                      View Family Trees
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Writing Assistant</h4>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered writing help, suggestions, and feedback. The
                    assistant can help with brainstorming, editing, and
                    developing your ideas.
                  </p>
                  <Link href="/conversations">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="link-assistant-guide"
                    >
                      Open Assistant
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Need More Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>
                We're here to support your creative journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you can't find the answer you're looking for, we'd love to
                hear from you!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/feedback">
                  <Button data-testid="button-send-feedback">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Feedback or Report a Bug
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Help Chat Widget */}
      <HelpChatWidget />
    </div>
  );
}
