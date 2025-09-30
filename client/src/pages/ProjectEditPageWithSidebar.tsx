import { useLocation } from 'wouter';
import { ProjectContainer } from '@/components/ProjectContainer';

interface ProjectEditPageWithSidebarProps {
  params: { id: string };
}

export default function ProjectEditPageWithSidebar({ params }: ProjectEditPageWithSidebarProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/projects');
  };

  return (
    <div className="h-screen bg-background">
      <ProjectContainer 
        projectId={params.id}
        onBack={handleBack}
      />
    </div>
  );
}
