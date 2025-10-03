import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Star, Search, Filter, Loader2, Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Guide } from "@shared/schema";


const categories = ['All', 'Character Writing', 'Writing Craft', 'World Building', 'Story Structure', 'Genre Writing'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function WritingGuides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if current user is admin
  const isAdmin = user?.isAdmin || false;

  // Build query parameters for API call
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append('query', searchQuery);
  if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
  if (selectedDifficulty !== 'All') queryParams.append('difficulty', selectedDifficulty);

  // Fetch guides from API
  const { data: guides = [], isLoading, error } = useQuery<Guide[]>({
    queryKey: ['/api/guides', searchQuery, selectedCategory, selectedDifficulty],
    queryFn: () => fetch(`/api/guides?${queryParams.toString()}`).then(res => res.json()),
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
  };

  const handleReadGuide = (guideId: string) => {
    setLocation(`/guides/${guideId}`);
  };

  const handleNewGuide = () => {
    setLocation('/guides/new');
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
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
              <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-guide-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
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
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {guide.category}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </Badge>
                    {isAdmin && (
                      <Badge 
                        variant={guide.published ? "default" : "outline"} 
                        className="text-xs"
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
                </div>
                <div className="flex items-center gap-1 text-chart-3">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{guide.rating}</span>
                </div>
              </div>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {guide.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.readTime}m read
                  </span>
                  <span>by {guide.author}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {guide.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleReadGuide(guide.id)}
                  className="flex-1"
                  data-testid={`button-read-guide-${guide.id}`}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read
                </Button>
                {isAdmin && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleEditGuide(guide.id)}
                      data-testid={`button-edit-guide-${guide.id}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDeleteGuide(guide.id, guide.title)}
                      disabled={deleteGuideMutation.isPending}
                      data-testid={`button-delete-guide-${guide.id}`}
                      className="text-destructive hover:text-destructive hover:border-destructive"
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
  );
}