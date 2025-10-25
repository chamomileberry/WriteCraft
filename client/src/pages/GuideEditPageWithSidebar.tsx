import { useLocation } from 'wouter';
import GuideEditor from '@/components/GuideEditor';
import Header from '@/components/Header';
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

  const handleSearch = (query: string) => {
    setLocation(`/?search=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'notebook':
        setLocation('/notebook');
        break;
      case 'manuscripts':
        setLocation('/manuscripts');
        break;
      default:
        setLocation('/');
    }
  };

  const handleCreateNew = () => {
    setLocation('/?create=true');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Header */}
      <Header 
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />

      <div className="flex h-[calc(100vh-4rem)] w-full">
        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
          {/* Document-specific header with back button */}
          <header className="flex items-center justify-between p-3 sm:p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBack}
                data-testid="button-back-to-guides"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Guides</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </header>

          {/* Editor Content */}
          <main className="flex-1 overflow-y-auto">
            <GuideEditor 
              guideId={params.id}
              onBack={handleBack}
            />
          </main>
        </div>
      </div>
    </div>
  );
}