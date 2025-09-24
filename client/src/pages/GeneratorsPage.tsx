import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ToolsShowcase from "@/components/ToolsShowcase";
import CharacterGenerator from "@/components/CharacterGenerator";
import PlotGenerator from "@/components/PlotGenerator";
import SettingGenerator from "@/components/SettingGenerator";
import CreatureGenerator from "@/components/CreatureGenerator";
import NameGenerator from "@/components/NameGenerator";
import ConflictGenerator from "@/components/ConflictGenerator";
import ThemeExplorer from "@/components/ThemeExplorer";
import MoodPalette from "@/components/MoodPalette";
import PlantGenerator from "@/components/PlantGenerator";
import DescriptionGenerator from "@/components/DescriptionGenerator";
import ContentTypeModal from "@/components/ContentTypeModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getMappingById } from "@shared/contentTypes";

export default function GeneratorsPage() {
  const [location, setLocation] = useLocation();
  const [activeView, setActiveView] = useState<string>('generators');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);

  const handleToolSelect = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'manuscripts') {
      setLocation('/manuscripts');
    } else {
      setActiveView(toolId);
    }
    console.log('Navigating to tool:', toolId);
  };

  const handleBackToGenerators = () => {
    setActiveView('generators');
    console.log('Navigating back to generators');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  const handleCreateNew = () => {
    setIsContentModalOpen(true);
    console.log('Opening content type modal');
  };

  const handleSelectContentType = (contentType: string) => {
    console.log('Selected content type:', contentType);
    setIsContentModalOpen(false);
    const mapping = getMappingById(contentType);
    if (mapping) {
      setLocation(`/editor/${mapping.urlSegment}/new`);
    } else {
      console.log(`No mapping found for content type: ${contentType}`);
      setLocation('/notebook');
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'generators':
        return <ToolsShowcase onToolSelect={handleToolSelect} />;
      case 'character-generator':
        return <CharacterGenerator />;
      case 'plot-generator':
        return <PlotGenerator />;
      case 'setting-generator':
        return <SettingGenerator />;
      case 'creature-generator':
        return <CreatureGenerator />;
      case 'name-generator':
        return <NameGenerator />;
      case 'conflict-generator':
        return <ConflictGenerator />;
      case 'theme-explorer':
        return <ThemeExplorer />;
      case 'mood-palette':
        return <MoodPalette />;
      case 'plant-generator':
        return <PlantGenerator />;
      case 'description-generator':
        return <DescriptionGenerator />;
      default:
        return <ToolsShowcase onToolSelect={handleToolSelect} />;
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
      
      <main className="flex-1">
        {activeView !== 'generators' && (
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="outline"
              onClick={handleBackToGenerators}
              className="mb-4"
              data-testid="button-back-to-generators"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Generators
            </Button>
          </div>
        )}
        
        <div className="container mx-auto px-4 py-8">
          {renderActiveView()}
        </div>
      </main>

      {/* Content Type Modal */}
      <ContentTypeModal 
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSelectType={handleSelectContentType}
      />
    </div>
  );
}