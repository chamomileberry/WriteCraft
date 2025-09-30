import { useLocation } from 'wouter';
import { ProjectContainer } from '@/components/ProjectContainer';
import Header from '@/components/Header';

interface ProjectEditPageWithSidebarProps {
  params: { id: string };
}

export default function ProjectEditPageWithSidebar({ params }: ProjectEditPageWithSidebarProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/projects');
  };

  const handleSearch = (query: string) => {
    setLocation(`/?search=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'notebook':
        setLocation('/notebook');
        break;
      case 'projects':
        setLocation('/projects');
        break;
      default:
        setLocation('/');
    }
  };

  const handleCreateNew = () => {
    setLocation('/?create=true');
  };

  return (
    <>
      {/* Global Navigation Header */}
      <Header 
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      
      {/* Main Content Area - fill remaining height */}
      <div style={{ height: 'calc(100vh - 64px)' }}>
        <ProjectContainer 
          projectId={params.id}
          onBack={handleBack}
        />
      </div>
    </>
  );
}
