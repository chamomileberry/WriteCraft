import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

interface QuizResult {
  structure: string;
  title: string;
  description: string;
  bestFor: string[];
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "genre",
    question: "What genre are you primarily writing in?",
    options: [
      { value: "action-adventure", label: "Action/Adventure/Superhero" },
      { value: "tragedy", label: "Tragedy/Drama" },
      { value: "comedy-romance", label: "Comedy/Romance/Character-driven" },
      { value: "mystery-thriller", label: "Mystery/Thriller/Crime" },
      { value: "fantasy-scifi", label: "Fantasy/Science Fiction/Epic" },
      { value: "literary", label: "Literary Fiction/Character Study" }
    ]
  },
  {
    id: "focus",
    question: "What's your story's primary focus?",
    options: [
      { value: "character-growth", label: "Character transformation and growth" },
      { value: "plot-driven", label: "Fast-paced plot and events" },
      { value: "world-building", label: "Complex world and mythology" },
      { value: "mystery-solving", label: "Solving puzzles and mysteries" },
      { value: "emotional-journey", label: "Emotional relationships and conflicts" }
    ]
  },
  {
    id: "complexity",
    question: "How complex do you want your story structure?",
    options: [
      { value: "simple", label: "Simple and straightforward" },
      { value: "moderate", label: "Moderate complexity with clear beats" },
      { value: "detailed", label: "Highly detailed with specific milestones" },
      { value: "flexible", label: "Flexible framework I can adapt" }
    ]
  },
  {
    id: "experience",
    question: "What's your writing experience level?",
    options: [
      { value: "beginner", label: "Beginner - I need clear guidance" },
      { value: "intermediate", label: "Intermediate - I know the basics" },
      { value: "advanced", label: "Advanced - I want sophisticated tools" },
      { value: "experimental", label: "I like to experiment with structure" }
    ]
  }
];

const STRUCTURE_RESULTS: Record<string, QuizResult> = {
  "three-act": {
    structure: "three-act",
    title: "Three-Act Structure",
    description: "The classic beginning, middle, and end structure used in most modern storytelling.",
    bestFor: ["Beginners", "Commercial fiction", "Screenwriting", "Clear narratives"],
    explanation: "Perfect for writers who want a simple, proven framework that's easy to understand and implement."
  },
  "freytag": {
    structure: "freytag",
    title: "Freytag's Pyramid",
    description: "A dramatic structure featuring rising action, climax, and falling action, ideal for tragedies.",
    bestFor: ["Tragedies", "Classical drama", "Character downfall", "Literary fiction"],
    explanation: "Best suited for tragic stories where the protagonist faces a significant downfall or moral reckoning."
  },
  "hero-journey": {
    structure: "hero-journey",
    title: "The Hero's Journey",
    description: "Joseph Campbell's monomyth featuring a hero's transformation through trials and tribulations.",
    bestFor: ["Adventure", "Fantasy", "Sci-fi", "Coming-of-age", "Personal transformation"],
    explanation: "Ideal for epic adventures where your protagonist undergoes significant personal growth and transformation."
  },
  "story-circle": {
    structure: "story-circle",
    title: "The Story Circle",
    description: "Dan Harmon's simplified hero's journey focusing on character needs and growth.",
    bestFor: ["Character-driven stories", "Comedy", "Romance", "TV writing", "Emotional arcs"],
    explanation: "Perfect for character-focused narratives where emotional growth and relationships are central to the story."
  },
  "snowflake": {
    structure: "snowflake",
    title: "The Snowflake Method",
    description: "A systematic approach to building complex narratives from simple concepts.",
    bestFor: ["Complex plots", "Multiple characters", "World-building", "Planning-heavy writers"],
    explanation: "Excellent for writers who love detailed planning and want to develop intricate, well-structured narratives."
  },
  "fichtean": {
    structure: "fichtean",
    title: "Fichtean Curve",
    description: "A structure emphasizing multiple rising crises and conflicts throughout the story.",
    bestFor: ["Thrillers", "Mysteries", "Suspense", "Fast-paced action"],
    explanation: "Great for high-tension stories that need to maintain constant momentum and escalating stakes."
  },
  "save-cat": {
    structure: "save-cat",
    title: "Save the Cat Beat Sheet",
    description: "Blake Snyder's detailed 15-beat structure originally designed for screenwriting.",
    bestFor: ["Screenwriting", "Commercial fiction", "Genre fiction", "Structured plotting"],
    explanation: "Perfect for writers who want a highly detailed roadmap with specific page/time markers for each story beat."
  },
  "seven-point": {
    structure: "seven-point",
    title: "Seven-Point Story Structure",
    description: "Dan Wells' structure focusing on four plot turns and three pinch points.",
    bestFor: ["Fantasy", "Sci-fi", "Adventure", "Plot-heavy stories", "Series writing"],
    explanation: "Excellent for complex genre fiction where you need to balance multiple plot threads and character arcs."
  }
};

interface StoryStructureQuizProps {
  open: boolean;
  onClose: () => void;
  onSelectStructure: (structure: string) => void;
}

export default function StoryStructureQuiz({ open, onClose, onSelectStructure }: StoryStructureQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [QUIZ_QUESTIONS[currentQuestion].id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const { genre, focus, complexity, experience } = answers;
    
    // Logic to determine best structure based on answers
    let recommendedStructure = "three-act"; // default
    
    if (genre === "tragedy") {
      recommendedStructure = "freytag";
    } else if (genre === "action-adventure" || focus === "character-growth") {
      recommendedStructure = "hero-journey";
    } else if (genre === "comedy-romance" || focus === "emotional-journey") {
      recommendedStructure = "story-circle";
    } else if (genre === "mystery-thriller" || focus === "plot-driven") {
      recommendedStructure = "fichtean";
    } else if (complexity === "detailed" || experience === "advanced") {
      if (focus === "world-building") {
        recommendedStructure = "snowflake";
      } else {
        recommendedStructure = "save-cat";
      }
    } else if (genre === "fantasy-scifi" && complexity !== "simple") {
      recommendedStructure = "seven-point";
    }

    setResult(STRUCTURE_RESULTS[recommendedStructure]);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  const useThisStructure = () => {
    if (result) {
      onSelectStructure(result.structure);
      onClose();
      resetQuiz();
    }
  };

  const currentQuestionData = QUIZ_QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === QUIZ_QUESTIONS.length - 1;
  const canProceed = answers[currentQuestionData?.id];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find Your Perfect Story Structure</DialogTitle>
          <DialogDescription>
            Answer a few questions to discover which story structure best fits your writing project
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
              <div className="flex gap-1">
                {QUIZ_QUESTIONS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentQuestion ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentQuestionData?.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[currentQuestionData?.id] || ""}
                  onValueChange={handleAnswer}
                  data-testid="quiz-radio-group"
                >
                  {currentQuestionData?.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                data-testid="button-quiz-prev"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={nextQuestion}
                disabled={!canProceed}
                data-testid="button-quiz-next"
              >
                {isLastQuestion ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Get Result
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Recommended: {result.title}
                </CardTitle>
                <CardDescription>{result.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Best for:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.bestFor.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Why this works for you:</h4>
                  <p className="text-muted-foreground">{result.explanation}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={useThisStructure} data-testid="button-use-structure">
                Use This Structure
              </Button>
              <Button variant="outline" onClick={resetQuiz} data-testid="button-retake-quiz">
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}