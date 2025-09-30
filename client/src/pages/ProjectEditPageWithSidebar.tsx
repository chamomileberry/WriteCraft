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
    <div className="h-screen bg-background flex flex-col">
      <Header onNavigate={handleNavigate} />
      <div className="flex-1 overflow-hidden">
        <ProjectContainer 
          projectId={params.id}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
