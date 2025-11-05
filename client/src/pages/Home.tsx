import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ContentTypeModal from "@/components/ContentTypeModal";
import Hero from "@/components/Hero";
import ToolsShowcase from "@/components/ToolsShowcase";
import WritingGuides from "@/components/WritingGuides";
import CharacterGenerator from "@/components/CharacterGenerator";
import PlotGenerator from "@/components/PlotGenerator";
import WritingPrompts from "@/components/WritingPrompts";
import SettingGenerator from "@/components/SettingGenerator";
import CreatureGenerator from "@/components/CreatureGenerator";
import NameGenerator from "@/components/NameGenerator";
import ConflictGenerator from "@/components/ConflictGenerator";
import ThemeExplorer from "@/components/ThemeExplorer";
import MoodPalette from "@/components/MoodPalette";
import PlantGenerator from "@/components/PlantGenerator";
import DescriptionGenerator from "@/components/DescriptionGenerator";
import SavedItems from "@/components/SavedItems";
import ContentEditor from "@/components/ContentEditor";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { getMappingById } from "@shared/contentTypes";
import { useTheme } from "@/hooks/use-theme";

export default function Home() {
  const { isDark } = useTheme();
  const [location, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);

  const handleToolSelect = (toolId: string) => {
    if (toolId === "notebook") {
      setLocation("/notebook");
    } else if (toolId === "projects") {
      setLocation("/projects");
    } else {
      setActiveView(toolId);
    }
    console.log("Navigating to tool:", toolId);
  };

  const handleBackToHome = () => {
    setLocation("/");
    setActiveView("home");
    console.log("Navigating back to home");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Search query:", query);
  };

  const handleCreateNew = () => {
    setIsContentModalOpen(true);
    console.log("Opening content type modal");
  };

  const handleSelectContentType = (
    contentType: string,
    notebookId?: string,
  ) => {
    // Navigate to the appropriate editor based on content type
    console.log(
      "Selected content type:",
      contentType,
      "for notebook:",
      notebookId,
    );

    // Close the modal first
    setIsContentModalOpen(false);

    // Get the mapping for this content type
    const mapping = getMappingById(contentType);
    if (mapping) {
      // Navigate to the editor page using URL routing, include notebookId if provided
      const url = notebookId
        ? `/editor/${mapping.urlSegment}/new?notebookId=${notebookId}`
        : `/editor/${mapping.urlSegment}/new`;
      setLocation(url);
    } else {
      // Fallback to notebook if content type not found
      console.log(`No mapping found for content type: ${contentType}`);
      setLocation("/notebook");
    }
  };

  const renderContent = () => {
    // Handle content editing routes (e.g., "/characters/123/edit", "/locations/456/edit")
    const editRouteMatch = location.match(/^\/([^\/]+)\/([^\/]+)\/edit$/);
    if (editRouteMatch) {
      const [, contentType, contentId] = editRouteMatch;
      return (
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ContentEditor
              contentType={contentType}
              contentId={contentId}
              onBack={() => setLocation("/notebook")}
            />
          </div>
        </div>
      );
    }

    // Handle notebook URL route
    if (location === "/notebook") {
      return (
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="mb-6"
              data-testid="button-back-to-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <SavedItems onCreateNew={handleCreateNew} />
          </div>
        </div>
      );
    }

    switch (activeView) {
      case "character-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <CharacterGenerator />
            </div>
          </div>
        );

      case "notebook":
      case "saved-items": // Backward compatibility
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <SavedItems onCreateNew={handleCreateNew} />
            </div>
          </div>
        );

      case "plot-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <PlotGenerator />
            </div>
          </div>
        );

      case "writing-prompts":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <WritingPrompts />
            </div>
          </div>
        );

      case "setting-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <SettingGenerator />
            </div>
          </div>
        );

      case "creature-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <CreatureGenerator />
            </div>
          </div>
        );

      case "name-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <NameGenerator />
            </div>
          </div>
        );

      case "conflict-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <ConflictGenerator />
            </div>
          </div>
        );

      case "theme-explorer":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <ThemeExplorer />
            </div>
          </div>
        );

      case "mood-palette":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <MoodPalette />
            </div>
          </div>
        );

      case "plant-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <PlantGenerator />
            </div>
          </div>
        );

      case "description-generator":
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mb-6"
                data-testid="button-back-to-home"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <DescriptionGenerator />
            </div>
          </div>
        );

      default:
        return (
          <>
            <Hero onGetStarted={handleCreateNew} onNavigate={setLocation} />
            <ToolsShowcase onToolSelect={handleToolSelect} />
            <section id="guides" className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <WritingGuides />
              </div>
            </section>

            {/* Community Section */}
            <section className="py-16 bg-muted/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Join Our Community
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Connect with fellow writers, share your work, get feedback,
                    and stay updated on new features.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <iframe
                      src={`https://discord.com/widget?id=1432757366717284414&theme=${isDark ? "dark" : "light"}`}
                      width="350"
                      height="500"
                      frameBorder="0"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                      className="w-full rounded-lg shadow-lg"
                      title="Discord Community Widget"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleToolSelect}
        onCreateNew={handleCreateNew}
      />
      <main>{renderContent()}</main>
      <Footer />

      <ContentTypeModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSelectType={handleSelectContentType}
      />
    </div>
  );
}
