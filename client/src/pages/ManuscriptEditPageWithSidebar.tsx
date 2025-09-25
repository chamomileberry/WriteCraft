import { useLocation } from 'wouter';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ManuscriptEditor from '@/components/ManuscriptEditor';
import DocumentSidebar from '@/components/DocumentSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ManuscriptEditPageWithSidebarProps {
  params: { id: string };
}

export default function ManuscriptEditPageWithSidebar({ params }: ManuscriptEditPageWithSidebarProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/manuscripts');
  };

  // Custom sidebar width for document organization
  const style = {
    "--sidebar-width": "20rem",     // 320px for better content organization
    "--sidebar-width-icon": "4rem", // default icon width
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {/* Document Tree Sidebar */}
        <DocumentSidebar 
          type="manuscript"
          currentDocumentId={params.id}
          userId="guest" // Using guest user for now
        />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
          {/* Header with sidebar toggle and back button */}
          <header className="flex items-center justify-between p-2 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                data-testid="button-back-to-manuscripts"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Manuscripts
              </Button>
            </div>
          </header>
          
          {/* Editor Content */}
          <main className="flex-1 overflow-hidden">
            <ManuscriptEditor 
              manuscriptId={params.id}
              onBack={handleBack}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}