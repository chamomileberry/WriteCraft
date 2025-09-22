import { useState } from "react";
import Header from "@/components/Header";
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
import SavedItems from "@/components/SavedItems";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleToolSelect = (toolId: string) => {
    setActiveView(toolId);
    console.log('Navigating to tool:', toolId);
  };

  const handleBackToHome = () => {
    setActiveView('home');
    console.log('Navigating back to home');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'character-generator':
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

      case 'saved-items':
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
              <SavedItems />
            </div>
          </div>
        );
      
      case 'plot-generator':
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
      
      case 'writing-prompts':
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

      case 'setting-generator':
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

      case 'creature-generator':
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

      case 'name-generator':
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

      case 'conflict-generator':
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

      case 'theme-explorer':
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

      case 'mood-palette':
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
        
      default:
        return (
          <>
            <Hero />
            <ToolsShowcase onToolSelect={handleToolSelect} />
            <section id="guides" className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <WritingGuides />
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} searchQuery={searchQuery} onNavigate={handleToolSelect} />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}