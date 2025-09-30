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

  const handleNavigate = (view: string) => {
    setLocation(`/${view}`);
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header - fixed height, always visible */}
      <div className="flex-shrink-0">
        <Header onNavigate={handleNavigate} />
      </div>
      
      {/* Main content - takes remaining space */}
      <div className="flex-1 overflow-hidden min-h-0">
        <ProjectContainer 
          projectId={params.id}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
