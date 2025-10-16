import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import Landing from "@/pages/landing";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Home from "@/pages/Home";
import SearchPage from "@/pages/SearchPage";
import GeneratorsPage from "@/pages/GeneratorsPage";
import GuidesPage from "@/pages/GuidesPage";
import GuideDetail from "@/pages/GuideDetail";
import GuideEditPage from "@/pages/GuideEditPage";
import AccountSettings from "@/pages/AccountSettings";
import CharacterPage from "@/pages/CharacterPage";
import CharacterEditPageWithSidebar from "@/pages/CharacterEditPageWithSidebar";
import SettingPage from "@/pages/SettingPage";
import CreaturePage from "@/pages/CreaturePage";
import ProjectPage from "@/pages/ProjectPage";
import ProjectEditPage from "@/pages/ProjectEditPage";
import ProjectEditPageWithSidebar from "@/pages/ProjectEditPageWithSidebar";
import GuideEditPageWithSidebar from "@/pages/GuideEditPageWithSidebar";
import NoteEditPage from "@/pages/NoteEditPage";
import ImportPage from "@/pages/ImportPage";
import CharacterConsolidatePage from "@/pages/CharacterConsolidatePage";
import BannedPhrasesManagement from "@/pages/BannedPhrasesManagement";
import TimelineViewPage from "@/pages/TimelineViewPage";
import ConversationManager from "@/pages/ConversationManager";
import NotFound from "@/pages/not-found";
import ContentEditor from "@/components/ContentEditor";
import SavedItems from "@/components/SavedItems";
import ContentTypeModal from "@/components/ContentTypeModal";
import { getMappingByUrlSegment, getMappingById } from "@shared/contentTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

// Notebook page component
function NotebookPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [notebookPopoverOpen, setNotebookPopoverOpen] = useState(false);
  const [mountNotebookSwitcher, setMountNotebookSwitcher] = useState(true);

  const handleNavigate = (toolId: string) => {
    if (toolId === 'notebook') {
      // Already on notebook page
      return;
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
    // Force close popover and unmount NotebookSwitcher
    setNotebookPopoverOpen(false);
    setMountNotebookSwitcher(false);
    
    // Wait for popover to fully close and unmount before opening modal
    setTimeout(() => {
      setIsContentModalOpen(true);
      // Remount NotebookSwitcher after modal is open
      setTimeout(() => {
        setMountNotebookSwitcher(true);
      }, 100);
    }, 100);
  };

  const handleSelectContentType = (contentType: string, notebookId?: string) => {
    setIsContentModalOpen(false);
    setNotebookPopoverOpen(false); // Ensure popover stays closed
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-6"
          data-testid="button-back-to-home"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        {mountNotebookSwitcher && (
          <SavedItems 
            onCreateNew={handleCreateNew} 
            notebookPopoverOpen={notebookPopoverOpen}
            onNotebookPopoverOpenChange={setNotebookPopoverOpen}
          />
        )}
      </div>
      
      <ContentTypeModal
        isOpen={isContentModalOpen}
        onClose={() => {
          setIsContentModalOpen(false);
          setNotebookPopoverOpen(false);
          // Ensure NotebookSwitcher is mounted when returning to page
          if (!mountNotebookSwitcher) {
            setMountNotebookSwitcher(true);
          }
        }}
        onSelectType={handleSelectContentType}
      />
    </div>
  );
}

// Content editor page component  
function EditorPage({ params }: { params: { type: string; id: string } }) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const mapping = getMappingByUrlSegment(params.type);
  
  if (!mapping) {
    return <NotFound />;
  }

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
    setLocation('/notebook');
  };

  return (
    <Layout>
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentEditor 
          contentType={mapping.id}
          contentId={params.id}
          onBack={() => setLocation('/notebook')}
        />
      </div>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/account" component={AccountSettings} />
      <Route path="/search" component={SearchPage} />
      <Route path="/generators" component={GeneratorsPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route path="/guides/new" component={GuideEditPage} />
      <Route path="/notebook" component={NotebookPage} />
      <Route path="/notebook/consolidate" component={CharacterConsolidatePage} />
      <Route path="/admin/banned-phrases" component={BannedPhrasesManagement} />
      <Route path="/import" component={ImportPage} />
      <Route path="/projects" component={ProjectPage} />
      <Route path="/projects/:id/edit" component={ProjectEditPageWithSidebar} />
      <Route path="/projects/:id/edit-basic" component={ProjectEditPage} />
      <Route path="/guides/:id" component={GuideDetail} />
      <Route path="/guides/:id/edit" component={GuideEditPageWithSidebar} />
      <Route path="/guides/:id/edit-basic" component={GuideEditPage} />
      <Route path="/notes/:id/edit" component={NoteEditPage} />
      <Route path="/characters" component={CharacterPage} />
      <Route path="/characters/new" component={(props: any) => <EditorPage params={{ type: "characters", id: "new" }} />} />
      <Route path="/characters/:id" component={({ params }: { params: { id: string } }) => <EditorPage params={{ type: "characters", id: params.id }} />} />
      <Route path="/characters/:id/edit" component={CharacterEditPageWithSidebar} />
      <Route path="/characters/:id/edit-sidebar" component={CharacterEditPageWithSidebar} />
      <Route path="/settings" component={SettingPage} />
      <Route path="/creatures" component={CreaturePage} />
      <Route path="/editor/:type/:id" component={EditorPage} />
      <Route path="/:type/:id/edit" component={EditorPage} />
      <Route path="/timelines/:id" component={TimelineViewPage} />
      <Route path="/conversations" component={ConversationManager} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="h-screen flex flex-col">
      <WorkspaceShell>
        <Router />
      </WorkspaceShell>
    </div>
  );
}

export default App;
