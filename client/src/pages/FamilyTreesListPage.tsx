import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { FamilyTree } from "@shared/schema";

export default function FamilyTreesListPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: familyTrees = [], isLoading } = useQuery<FamilyTree[]>({
    queryKey: ["/api/family-trees"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const handleCreateFamilyTree = () => {
    // Navigate to notebook to create a family tree
    setLocation("/notebook");
  };

  const handleViewFamilyTree = (id: string) => {
    setLocation(`/family-trees/${id}`);
  };

  const filteredFamilyTrees = familyTrees.filter((tree) =>
    tree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Family Trees
              </h1>
              <p className="text-muted-foreground mt-2">
                Map character relationships and genealogies across generations
              </p>
            </div>
            <Button onClick={handleCreateFamilyTree} data-testid="button-create-family-tree">
              <Plus className="w-4 h-4 mr-2" />
              Create Family Tree
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredFamilyTrees.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Family Trees Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first family tree to track character relationships and lineages
              </p>
              <Button onClick={handleCreateFamilyTree} data-testid="button-create-first-family-tree">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Family Tree
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFamilyTrees.map((tree) => (
              <Card 
                key={tree.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewFamilyTree(tree.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {tree.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tree.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-2">
                    Layout: <span className="capitalize">{tree.layoutMode}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewFamilyTree(tree.id);
                    }}
                    data-testid={`button-view-family-tree-${tree.id}`}
                  >
                    View Family Tree
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}