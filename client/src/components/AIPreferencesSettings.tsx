import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserPreferences {
  id: string;
  userId: string;
  experienceLevel?: string | null;
  preferredGenres?: string[] | null;
  writingGoals?: string[] | null;
  feedbackStyle?: string | null;
  targetWordCount?: number | null;
  writingSchedule?: string | null;
  preferredTone?: string | null;
  responseFormat?: string | null;
  detailLevel?: string | null;
  examplesPreference?: string | null;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
  betaBannerDismissed?: boolean;
  createdAt: string;
  updatedAt: string;
}

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner Writer" },
  { value: "intermediate", label: "Intermediate Writer" },
  { value: "advanced", label: "Advanced Writer" },
  { value: "new_to_worldbuilding", label: "New to Worldbuilding" },
  { value: "experienced_worldbuilder", label: "Experienced Worldbuilder" },
];

const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical Fiction",
  "Horror",
  "Literary Fiction",
  "Young Adult",
  "Middle Grade",
  "Contemporary",
  "Dystopian",
  "Urban Fantasy",
  "Epic Fantasy",
  "Space Opera",
  "Cyberpunk",
  "Steampunk",
  "Magical Realism",
];

const COMMON_WRITING_GOALS = [
  "Finish novel",
  "Improve dialogue",
  "Develop characters",
  "Build world",
  "Master pacing",
  "Improve prose",
  "Publish book",
  "Complete draft",
  "Enhance descriptions",
  "Write consistently",
];

const FEEDBACK_STYLES = [
  { value: "direct", label: "Direct & Straightforward" },
  { value: "gentle", label: "Gentle & Encouraging" },
  { value: "technical", label: "Technical & Detailed" },
  { value: "conceptual", label: "Conceptual & Big Picture" },
];

const WRITING_SCHEDULES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "whenever", label: "Whenever I Can" },
];

const RESPONSE_FORMATS = [
  { value: "bullets", label: "Bullet Points" },
  { value: "paragraphs", label: "Full Paragraphs" },
  { value: "mixed", label: "Mixed Format" },
  { value: "adaptive", label: "Adaptive (AI Chooses)" },
];

const DETAIL_LEVELS = [
  { value: "brief", label: "Brief & Concise" },
  { value: "moderate", label: "Moderate Detail" },
  { value: "comprehensive", label: "Comprehensive & In-Depth" },
];

const EXAMPLES_PREFERENCES = [
  { value: "frequent", label: "Frequent Examples" },
  { value: "occasional", label: "Occasional Examples" },
  { value: "minimal", label: "Minimal Examples" },
];

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "balanced", label: "Balanced" },
];

export function AIPreferencesSettings() {
  const { toast } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [feedbackStyle, setFeedbackStyle] = useState("");
  const [targetWordCount, setTargetWordCount] = useState<number | undefined>();
  const [writingSchedule, setWritingSchedule] = useState("");
  const [preferredTone, setPreferredTone] = useState("");
  const [responseFormat, setResponseFormat] = useState("");
  const [detailLevel, setDetailLevel] = useState("");
  const [examplesPreference, setExamplesPreference] = useState("");

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/user/preferences"],
  });

  // Update state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setSelectedGenres(preferences.preferredGenres || []);
      setSelectedGoals(preferences.writingGoals || []);
      setExperienceLevel(preferences.experienceLevel || "");
      setFeedbackStyle(preferences.feedbackStyle || "");
      setTargetWordCount(preferences.targetWordCount || undefined);
      setWritingSchedule(preferences.writingSchedule || "");
      setPreferredTone(preferences.preferredTone || "");
      setResponseFormat(preferences.responseFormat || "");
      setDetailLevel(preferences.detailLevel || "");
      setExamplesPreference(preferences.examplesPreference || "");
    }
  }, [preferences]);

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const response = await apiRequest(
        "PATCH",
        "/api/user/preferences",
        updates,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      toast({
        title: "Preferences saved",
        description: "Your AI preferences have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update AI preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate({
      experienceLevel: experienceLevel || null,
      preferredGenres: selectedGenres.length > 0 ? selectedGenres : null,
      writingGoals: selectedGoals.length > 0 ? selectedGoals : null,
      feedbackStyle: feedbackStyle || null,
      targetWordCount: targetWordCount || null,
      writingSchedule: writingSchedule || null,
      preferredTone: preferredTone || null,
      responseFormat: responseFormat || null,
      detailLevel: detailLevel || null,
      examplesPreference: examplesPreference || null,
    });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals((prev) => [...prev, customGoal.trim()]);
      setCustomGoal("");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Preferences
          </CardTitle>
          <CardDescription>
            Customize how the AI writing assistant interacts with you
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Preferences
        </CardTitle>
        <CardDescription>
          Customize how the AI writing assistant interacts with you to match
          your writing style and goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Level */}
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger data-testid="select-experience-level">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Helps the AI tailor suggestions to your skill level
          </p>
        </div>

        {/* Preferred Genres */}
        <div className="space-y-2">
          <Label>Preferred Genres</Label>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenres.includes(genre) ? "default" : "outline"}
                className="cursor-pointer hover-elevate"
                onClick={() => toggleGenre(genre)}
                data-testid={`badge-genre-${genre.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {genre}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Select genres you write or plan to write
          </p>
        </div>

        {/* Writing Goals */}
        <div className="space-y-2">
          <Label>Writing Goals</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_WRITING_GOALS.map((goal) => (
              <Badge
                key={goal}
                variant={selectedGoals.includes(goal) ? "default" : "outline"}
                className="cursor-pointer hover-elevate"
                onClick={() => toggleGoal(goal)}
                data-testid={`badge-goal-${goal.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {goal}
              </Badge>
            ))}
            {selectedGoals
              .filter((goal) => !COMMON_WRITING_GOALS.includes(goal))
              .map((goal) => (
                <Badge
                  key={goal}
                  variant="default"
                  className="cursor-pointer hover-elevate"
                  onClick={() => toggleGoal(goal)}
                >
                  {goal}
                </Badge>
              ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add custom goal..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomGoal();
                }
              }}
              data-testid="input-custom-goal"
            />
            <Button
              onClick={handleAddCustomGoal}
              variant="outline"
              size="sm"
              data-testid="button-add-custom-goal"
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Define your writing objectives for personalized guidance
          </p>
        </div>

        {/* Target Word Count */}
        <div className="space-y-2">
          <Label htmlFor="target-word-count">
            Target Word Count (Optional)
          </Label>
          <Input
            id="target-word-count"
            type="number"
            min="0"
            placeholder="e.g., 80000"
            value={targetWordCount || ""}
            onChange={(e) =>
              setTargetWordCount(
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
            data-testid="input-target-word-count"
          />
          <p className="text-xs text-muted-foreground">
            Your overall writing goal in words
          </p>
        </div>

        {/* Writing Schedule */}
        <div className="space-y-2">
          <Label>Writing Schedule</Label>
          <Select value={writingSchedule} onValueChange={setWritingSchedule}>
            <SelectTrigger data-testid="select-writing-schedule">
              <SelectValue placeholder="How often do you write?" />
            </SelectTrigger>
            <SelectContent>
              {WRITING_SCHEDULES.map((schedule) => (
                <SelectItem key={schedule.value} value={schedule.value}>
                  {schedule.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feedback Style */}
        <div className="space-y-2">
          <Label>Feedback Style</Label>
          <Select value={feedbackStyle} onValueChange={setFeedbackStyle}>
            <SelectTrigger data-testid="select-feedback-style">
              <SelectValue placeholder="How should the AI provide feedback?" />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose how the AI delivers suggestions and critiques
          </p>
        </div>

        {/* Preferred Tone */}
        <div className="space-y-2">
          <Label>Assistant Tone</Label>
          <Select value={preferredTone} onValueChange={setPreferredTone}>
            <SelectTrigger data-testid="select-preferred-tone">
              <SelectValue placeholder="What tone should the AI use?" />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Response Format */}
        <div className="space-y-2">
          <Label>Response Format</Label>
          <Select value={responseFormat} onValueChange={setResponseFormat}>
            <SelectTrigger data-testid="select-response-format">
              <SelectValue placeholder="How should responses be formatted?" />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Detail Level */}
        <div className="space-y-2">
          <Label>Detail Level</Label>
          <Select value={detailLevel} onValueChange={setDetailLevel}>
            <SelectTrigger data-testid="select-detail-level">
              <SelectValue placeholder="How detailed should responses be?" />
            </SelectTrigger>
            <SelectContent>
              {DETAIL_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Examples Preference */}
        <div className="space-y-2">
          <Label>Examples Preference</Label>
          <Select
            value={examplesPreference}
            onValueChange={setExamplesPreference}
          >
            <SelectTrigger data-testid="select-examples-preference">
              <SelectValue placeholder="How often should the AI provide examples?" />
            </SelectTrigger>
            <SelectContent>
              {EXAMPLES_PREFERENCES.map((pref) => (
                <SelectItem key={pref.value} value={pref.value}>
                  {pref.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Control how often the AI provides concrete examples
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updatePreferencesMutation.isPending}
            data-testid="button-save-ai-preferences"
          >
            {updatePreferencesMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
