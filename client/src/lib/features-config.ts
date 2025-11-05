import {
  LucideIcon,
  Users,
  BookOpen,
  Zap,
  Map,
  FileText,
  Target,
  Lightbulb,
  Palette,
  Rabbit,
  Leaf,
  PenTool,
} from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  route: string;
}

export const FEATURES: Feature[] = [
  {
    id: "character-generator",
    title: "Character Generator",
    description:
      "Create detailed, unique characters with backstories, traits, and motivations.",
    icon: Users,
    category: "Character Development",
    route: "/generators#character-generator",
  },
  {
    id: "setting-generator",
    title: "Setting Generator",
    description: "Build immersive worlds and locations for your stories.",
    icon: Map,
    category: "World Building",
    route: "/generators#setting-generator",
  },
  {
    id: "creature-generator",
    title: "Creature Generator",
    description:
      "Create fascinating creatures and beings for your fantasy worlds.",
    icon: Rabbit,
    category: "World Building",
    route: "/generators#creature-generator",
  },
  {
    id: "plant-generator",
    title: "Plant Generator",
    description:
      "Generate detailed plant descriptions with botanical accuracy for your stories.",
    icon: Leaf,
    category: "World Building",
    route: "/generators#plant-generator",
  },
  {
    id: "writing-prompts",
    title: "Writing Prompts",
    description:
      "Spark creativity with genre-specific prompts and story starters.",
    icon: Zap,
    category: "Inspiration",
    route: "/generators#writing-prompts",
  },
  {
    id: "description-generator",
    title: "Description Generator",
    description:
      "Create detailed, immersive descriptions for any element of your story.",
    icon: PenTool,
    category: "Writing Craft",
    route: "/generators#description-generator",
  },
  {
    id: "name-generator",
    title: "Name Generator",
    description:
      "Find perfect names for characters, places, and fantasy elements.",
    icon: FileText,
    category: "Character Development",
    route: "/generators#name-generator",
  },
  {
    id: "plot-generator",
    title: "Plot Generator",
    description:
      "Generate compelling plot structures and story arcs for any genre.",
    icon: BookOpen,
    category: "Story Structure",
    route: "/generators#plot-generator",
  },
  {
    id: "conflict-generator",
    title: "Conflict Generator",
    description: "Create engaging conflicts and obstacles for your story.",
    icon: Target,
    category: "Story Structure",
    route: "/generators#conflict-generator",
  },
  {
    id: "theme-explorer",
    title: "Theme Explorer",
    description: "Discover and develop meaningful themes for your narrative.",
    icon: Lightbulb,
    category: "Story Development",
    route: "/generators#theme-explorer",
  },
  {
    id: "mood-palette",
    title: "Mood Palette",
    description: "Set the perfect tone and atmosphere for your scenes.",
    icon: Palette,
    category: "Writing Craft",
    route: "/generators#mood-palette",
  },
];

export function searchFeatures(query: string): Feature[] {
  const lowerQuery = query.toLowerCase();
  return FEATURES.filter(
    (feature) =>
      feature.title.toLowerCase().includes(lowerQuery) ||
      feature.description.toLowerCase().includes(lowerQuery) ||
      feature.category.toLowerCase().includes(lowerQuery),
  );
}
