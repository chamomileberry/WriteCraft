import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  User,
  Calendar,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Guide } from "@shared/schema";
import Header from "@/components/Header";
import { useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (path: string) => {
    // Handle relative paths from Header navigation
    const absolutePath = path.startsWith("/") ? path : `/${path}`;
    setLocation(absolutePath);
  };

  // Fetch guide from API
  const {
    data: guide,
    isLoading,
    error,
  } = useQuery<Guide>({
    queryKey: ["/api/guides", id],
    queryFn: () => fetch(`/api/guides/${id}`).then((res) => res.json()),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/guides/${id}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Guide deleted",
        description: "The guide has been successfully deleted.",
      });
      // Invalidate all guide-related queries (including filtered ones)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) && query.queryKey[0] === "/api/guides"
          );
        },
      });
      setLocation("/guides");
    },
    onError: (error: any) => {
      console.error("Error deleting guide:", error);
      toast({
        title: "Error deleting guide",
        description: "Failed to delete the guide. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setLocation(`/guides/${id}/edit`);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this guide? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-chart-4/10 text-chart-4";
      case "Intermediate":
        return "bg-chart-3/10 text-chart-3";
      case "Advanced":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted";
    }
  };

  // Set page title for SEO
  if (guide) {
    document.title = `${guide.title} - Writing Tools Platform`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", guide.description);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
      />
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="button-back-to-guides"
          >
            <Link href="/guides">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guides
            </Link>
          </Button>

          {guide && (
            <div className="flex items-center gap-2">
              <Button onClick={handleEdit} data-testid="button-edit-guide">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Guide
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid="button-delete-guide"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          )}
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
            <p className="text-destructive">
              Failed to load guide. Please try again.
            </p>
          </div>
        )}

        {/* Guide Content */}
        {guide && !isLoading && !error && (
          <>
            {/* Guide Header */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {guide.category}
                  </Badge>
                  <Badge
                    className={`text-xs ${getDifficultyColor(guide.difficulty)}`}
                  >
                    {guide.difficulty}
                  </Badge>
                </div>

                <CardTitle className="text-3xl font-serif">
                  {guide.title}
                </CardTitle>

                <CardDescription className="text-lg">
                  {guide.description}
                </CardDescription>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>by {guide.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{guide.readTime}m read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {guide.createdAt
                        ? new Date(guide.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {guide.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Guide Content */}
            <Card>
              <CardContent className="pt-6">
                <div
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(guide.content),
                  }}
                />
              </CardContent>
            </Card>

            {/* Related Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <Button asChild data-testid="button-explore-more-guides">
                    <Link href="/">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explore More Guides
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
