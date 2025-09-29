import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProjectEditor from '@/components/ProjectEditor';
import DocumentSidebar from '@/components/DocumentSidebar';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface ProjectEditPageWithSidebarProps {
  params: { id: string };
}

export default function ProjectEditPageWithSidebar({ params }: ProjectEditPageWithSidebarProps) {
  const [, setLocation] = useLocation();
  const { resetLayout } = useWorkspaceStore();

  // Clear workspace when navigating to a new project
  useEffect(() => {
    resetLayout();
  }, [params.id, resetLayout]);

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

  // Custom sidebar width for document organization
  const style = {
    "--sidebar-width": "20rem",     // 320px for better content organization
    "--sidebar-width-icon": "4rem", // default icon width
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Header */}
      <Header 
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      
      <SidebarProvider defaultOpen={true} style={style as React.CSSProperties}>
        <div className="flex h-[calc(100vh-4rem)] w-full">
          {/* Document Tree Sidebar */}
          <DocumentSidebar 
            type="project"
            currentDocumentId={params.id}
            userId="guest" // Using guest user for now
          />
          
          {/* Main Content Area */}
          <div className="flex flex-col flex-1">
            {/* Document-specific header with sidebar toggle and back button */}
            <header className="flex items-center justify-between p-2 border-b bg-background">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleBack}
                  data-testid="button-back-to-projects"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
              </div>
            </header>
            
            {/* Editor Content */}
            <main className="flex-1 overflow-hidden">
              <ProjectEditor 
                projectId={params.id}
                onBack={handleBack}
              />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}