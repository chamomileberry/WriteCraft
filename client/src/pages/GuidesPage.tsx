import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import WritingGuides from "@/components/WritingGuides";
import ContentTypeModal from "@/components/ContentTypeModal";
import { getMappingById } from "@shared/contentTypes";

export default function GuidesPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);

  const handleToolSelect = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'manuscripts') {
      setLocation('/manuscripts');
    } else if (toolId === 'generators') {
      setLocation('/generators');
    }
    console.log('Navigating to tool:', toolId);
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

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleToolSelect}
        onCreateNew={handleCreateNew}
      />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <WritingGuides />
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