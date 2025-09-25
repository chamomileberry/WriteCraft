import { useLocation } from 'wouter';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import GuideEditor from '@/components/GuideEditor';
import DocumentSidebar from '@/components/DocumentSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface GuideEditPageWithSidebarProps {
  params: { id: string };
}

export default function GuideEditPageWithSidebar({ params }: GuideEditPageWithSidebarProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/guides');
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
          type="guide"
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
                data-testid="button-back-to-guides"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guides
              </Button>
            </div>
          </header>
          
          {/* Editor Content */}
          <main className="flex-1 overflow-hidden">
            <GuideEditor 
              guideId={params.id}
              onBack={handleBack}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}