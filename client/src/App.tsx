import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import GuideDetail from "@/pages/GuideDetail";
import CharacterPage from "@/pages/CharacterPage";
import CharacterEditPage from "@/pages/CharacterEditPage";
import CharacterEditPageWithSidebar from "@/pages/CharacterEditPageWithSidebar";
import SettingPage from "@/pages/SettingPage";
import CreaturePage from "@/pages/CreaturePage";
import NotFound from "@/pages/not-found";
import ContentEditor from "@/components/ContentEditor";
import SavedItems from "@/components/SavedItems";
import { getMappingByUrlSegment } from "@shared/contentTypes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Notebook page component
function NotebookPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/'}
          className="mb-6"
          data-testid="button-back-to-home"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <SavedItems />
      </div>
    </div>
  );
}

// Content editor page component  
function EditorPage({ params }: { params: { type: string; id: string } }) {
  const mapping = getMappingByUrlSegment(params.type);
  if (!mapping) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentEditor 
          contentType={mapping.id}
          contentId={params.id}
          onBack={() => window.location.href = '/notebook'}
        />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/notebook" component={NotebookPage} />
      <Route path="/guides/:id" component={GuideDetail} />
      <Route path="/characters" component={CharacterPage} />
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
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
