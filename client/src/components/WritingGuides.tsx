import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock, Search, Filter, Loader2, Plus, Edit3, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, FolderTree } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Guide, GuideCategory } from "@shared/schema";

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

interface CategoryWithChildren extends GuideCategory {
  children: CategoryWithChildren[];
  guideCount?: number;
}

export default function WritingGuides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if current user is admin
  const isAdmin = user?.isAdmin || false;

  // Fetch hierarchical categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<CategoryWithChildren[]>({
    queryKey: ['/api/guide-categories'],
  });

  // Build query parameters for API call
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append('query', searchQuery);
  if (selectedCategoryId) queryParams.append('categoryId', selectedCategoryId);
  if (selectedDifficulty !== 'All') queryParams.append('difficulty', selectedDifficulty);

  // Fetch guides from API
  const { data: guides = [], isLoading, error } = useQuery<Guide[]>({
    queryKey: ['/api/guides', searchQuery, selectedCategoryId, selectedDifficulty],
    queryFn: () => fetch(`/api/guides?${queryParams.toString()}`).then(res => res.json()),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Calculate guide count for each category
  const getCategoryGuideCount = (categoryId: string): number => {
    return guides.filter(guide => guide.categoryId === categoryId).length;
  };

  // Get selected category name for display
  const getSelectedCategoryName = (): string => {
    if (!selectedCategoryId) return 'All Categories';
    const findCategory = (cats: CategoryWithChildren[]): string | null => {
      for (const cat of cats) {
        if (cat.id === selectedCategoryId) return cat.name;
        const found = findCategory(cat.children);
        if (found) return found;
      }
      return null;
    };
    return findCategory(categories) || 'Unknown Category';
  };

  const handleReadGuide = (guideId: string) => {
    setLocation(`/guides/${guideId}`);
  };

  const handleNewGuide = () => {
    setLocation('/guides/new/edit');
  };

  const handleEditGuide = (guideId: string) => {
    setLocation(`/guides/${guideId}/edit`);
  };

  // Delete guide mutation
  const deleteGuideMutation = useMutation({
    mutationFn: async (guideId: string) => {
      const response = await apiRequest('DELETE', `/api/guides/${guideId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guides'] });
      toast({
        title: 'Guide deleted',
        description: 'The guide has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting guide:', error);
      toast({
        title: 'Error deleting guide',
        description: 'Failed to delete the guide. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteGuide = (guideId: string, guideTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${guideTitle}"? This action cannot be undone.`)) {
      deleteGuideMutation.mutate(guideId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-chart-4/10 text-chart-4';
      case 'Intermediate': return 'bg-chart-3/10 text-chart-3';
      case 'Advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  // Recursive component to render category tree
  const CategoryTreeItem = ({ category, level = 0 }: { category: CategoryWithChildren; level?: number }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    const isSelected = selectedCategoryId === category.id;
    const guideCount = getCategoryGuideCount(category.id);

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover-elevate transition-colors ${
            isSelected ? 'bg-accent text-accent-foreground' : ''
          }`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => handleCategorySelect(category.id)}
          data-testid={`category-item-${category.id}`}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategoryExpanded(category.id);
              }}
              className="p-0 hover:bg-transparent"
              data-testid={`button-toggle-${category.id}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          <FolderTree className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-sm truncate">{category.name}</span>
          {guideCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {guideCount}
            </Badge>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map((child) => (
              <CategoryTreeItem key={child.id} category={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <Card className="w-72 flex-shrink-0 h-fit sticky top-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Categories
            </CardTitle>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/admin/guide-categories')}
                data-testid="button-manage-categories"
                className="text-xs"
              >
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover-elevate transition-colors ${
                  !selectedCategoryId ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => handleCategorySelect(null)}
                data-testid="category-item-all"
              >
                <BookOpen className="h-4 w-4" />
                <span className="flex-1 text-sm">All Guides</span>
                <Badge variant="secondary" className="text-xs">
                  {guides.length}
                </Badge>
              </div>
              {isLoadingCategories ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                categories.map((category) => (
                  <CategoryTreeItem key={category.id} category={category} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-serif font-bold">Writing Guides & Resources</h2>
              <p className="text-muted-foreground max-w-2xl">
                Expert advice and comprehensive guides to help you master the craft of writing
              </p>
            </div>
            {isAdmin && (
              <Button onClick={handleNewGuide} data-testid="button-new-guide">
                <Plus className="h-4 w-4 mr-2" />
                New Guide
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search guides, topics, or authors..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-guide-search"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getSelectedCategoryName()}</span>
                </div>
                
                <Select value={selectedDifficulty} onValueChange={handleDifficultyFilter}>
                  <SelectTrigger className="w-40" data-testid="select-guide-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Showing {guides.length} guides
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load guides. Please try again.</p>
          </div>
        )}

        {/* Guides Grid */}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
          <Card key={guide.id} className="group hover-elevate transition-all duration-200">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {guide.category}
                </Badge>
                <Badge className={`text-xs flex-shrink-0 ${getDifficultyColor(guide.difficulty)}`}>
                  {guide.difficulty}
                </Badge>
                {isAdmin && (
                  <Badge 
                    variant={guide.published ? "default" : "outline"} 
                    className="text-xs flex-shrink-0"
                    data-testid={`badge-guide-status-${guide.id}`}
                  >
                    {guide.published ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {guide.title}
              </CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.readTime}m read
                  </span>
                  <span>by {guide.author}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {guide.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs flex-shrink-0">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2 min-w-0">
                <Button 
                  onClick={() => handleReadGuide(guide.id)}
                  className="flex-1 min-w-0"
                  data-testid={`button-read-guide-${guide.id}`}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read
                </Button>
                {isAdmin && (
                  <>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditGuide(guide.id)}
                      data-testid={`button-edit-guide-${guide.id}`}
                      className="flex-shrink-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteGuide(guide.id, guide.title)}
                      disabled={deleteGuideMutation.isPending}
                      data-testid={`button-delete-guide-${guide.id}`}
                      className="text-destructive hover:text-destructive hover:border-destructive flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
            </Card>
          ))}
          </div>
        )}

        {guides.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No guides found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}