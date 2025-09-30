import { useState } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/Header';
import { ProjectContainer } from '@/components/ProjectContainer';
import ContentTypeModal from '@/components/ContentTypeModal';
import { getMappingById } from '@shared/contentTypes';

interface ProjectEditPageWithSidebarProps {
  params: { id: string };
}

export default function ProjectEditPageWithSidebar({ params }: ProjectEditPageWithSidebarProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  const handleBack = () => {
    setLocation('/projects');
  };

  const handleNavigate = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'projects') {
      setLocation('/projects');
    } else if (toolId === 'generators') {
      setLocation('/generators');
    } else if (toolId === 'guides') {
      setLocation('/guides');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreateNew = () => {
    setIsContentModalOpen(true);
  };

  const handleSelectContentType = (contentType: string, notebookId?: string) => {
    setIsContentModalOpen(false);
    const mapping = getMappingById(contentType);
    if (mapping) {
      const url = notebookId 
        ? `/editor/${mapping.urlSegment}/new?notebookId=${notebookId}`
        : `/editor/${mapping.urlSegment}/new`;
      setLocation(url);
    } else {
      setLocation('/notebook');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      <div className="h-full">
        <ProjectContainer 
          projectId={params.id}
          onBack={handleBack}
        />
      </div>
      
      <ContentTypeModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSelectType={handleSelectContentType}
      />
    </div>
  );
}
