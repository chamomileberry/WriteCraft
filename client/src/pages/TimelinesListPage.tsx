import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { Timeline } from "@shared/schema";

export default function TimelinesListPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: timelines = [], isLoading } = useQuery<Timeline[]>({
    queryKey: ["/api/timelines"],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocation(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const handleCreateTimeline = () => {
    // Navigate to notebook to create a timeline
    setLocation("/notebook");
  };

  const handleViewTimeline = (id: string) => {
    setLocation(`/timelines/${id}`);
  };

  const filteredTimelines = timelines.filter(
    (timeline) =>
      timeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      timeline.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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
                <Calendar className="h-8 w-8 text-primary" />
                Timelines
              </h1>
              <p className="text-muted-foreground mt-2">
                Visualize and organize events in your stories chronologically
              </p>
            </div>
            <Button
              onClick={handleCreateTimeline}
              data-testid="button-create-timeline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Timeline
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTimelines.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Timelines Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first timeline to track events, plot points, and
                story chronology
              </p>
              <Button
                onClick={handleCreateTimeline}
                data-testid="button-create-first-timeline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Timeline
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTimelines.map((timeline) => (
              <Card
                key={timeline.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewTimeline(timeline.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {timeline.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {timeline.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="capitalize">{timeline.timelineType}</span>
                    <span className="capitalize">{timeline.timeScale}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTimeline(timeline.id);
                    }}
                    data-testid={`button-view-timeline-${timeline.id}`}
                  >
                    View Timeline
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
