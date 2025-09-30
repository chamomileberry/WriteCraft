import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Home from "@/pages/Home";
import SearchPage from "@/pages/SearchPage";
import GeneratorsPage from "@/pages/GeneratorsPage";
import GuidesPage from "@/pages/GuidesPage";
import GuideDetail from "@/pages/GuideDetail";
import GuideEditPage from "@/pages/GuideEditPage";
import CharacterPage from "@/pages/CharacterPage";
import CharacterEditPageWithSidebar from "@/pages/CharacterEditPageWithSidebar";
import SettingPage from "@/pages/SettingPage";
import CreaturePage from "@/pages/CreaturePage";
import ProjectPage from "@/pages/ProjectPage";
import ProjectEditPage from "@/pages/ProjectEditPage";
import ProjectEditPageWithSidebar from "@/pages/ProjectEditPageWithSidebar";
import GuideEditPageWithSidebar from "@/pages/GuideEditPageWithSidebar";
import NoteEditPage from "@/pages/NoteEditPage";
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
        <SavedItems onCreateNew={handleCreateNew} />
      </div>
      
      <ContentTypeModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSelectType={handleSelectContentType}
      />
    </div>
  );
}

// Content editor page component  
function EditorPage({ params }: { params: { type: string; id: string } }) {
  const [, setLocation] = useLocation();
  const mapping = getMappingByUrlSegment(params.type);
  if (!mapping) {
    return <NotFound />;
  }

  return (
    <Layout>
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
      <Route path="/search" component={SearchPage} />
      <Route path="/generators" component={GeneratorsPage} />
      <Route path="/guides" component={GuidesPage} />
      <Route path="/guides/new" component={GuideEditPage} />
      <Route path="/notebook" component={NotebookPage} />
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
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="h-screen flex flex-col">
          <WorkspaceShell>
            <Router />
          </WorkspaceShell>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
