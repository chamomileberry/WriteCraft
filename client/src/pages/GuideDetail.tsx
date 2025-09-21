import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Star, ArrowLeft, User, Calendar } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Guide } from "@shared/schema";

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();

  // Fetch guide from API
  const { data: guide, isLoading, error } = useQuery<Guide>({
    queryKey: ['/api/guides', id],
    queryFn: () => fetch(`/api/guides/${id}`).then(res => res.json()),
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-chart-4/10 text-chart-4';
      case 'Intermediate': return 'bg-chart-3/10 text-chart-3';
      case 'Advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  // Set page title for SEO
  if (guide) {
    document.title = `${guide.title} - Writing Tools Platform`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', guide.description);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild data-testid="button-back-to-guides">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guides
          </Link>
        </Button>
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
          <p className="text-destructive">Failed to load guide. Please try again.</p>
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
                <Badge className={`text-xs ${getDifficultyColor(guide.difficulty)}`}>
                  {guide.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-chart-3">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{guide.rating}</span>
                </div>
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
                  <span>{guide.createdAt ? new Date(guide.createdAt).toLocaleDateString() : 'Unknown'}</span>
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
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {guide.content}
                </div>
              </div>
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
  );
}