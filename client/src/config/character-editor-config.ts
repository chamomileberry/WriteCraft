import { User, Eye, Brain, Zap, BookOpen } from "lucide-react";

export interface CharacterNavigationSection {
  id: string;
  label: string;
  icon: any;
  description: string;
  tabIds: string[];
  color: string;
}

export const characterNavigation: CharacterNavigationSection[] = [
  {
    id: "identity",
    label: "Identity",
    icon: User,
    description: "Basic information and identity",
    tabIds: ["basic"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Eye,
    description: "Physical appearance and traits",
    tabIds: ["physical", "facial", "marks"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "mind",
    label: "Mind & Personality",
    icon: Brain,
    description: "Personality, relationships, and mental traits",
    tabIds: ["personality", "flaws"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "powers",
    label: "Skills & Powers",
    icon: Zap,
    description: "Abilities, skills, and special powers",
    tabIds: ["skills", "supernatural", "equipment"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "background",
    label: "Life & Background",
    icon: BookOpen,
    description: "History, lifestyle, and cultural background",
    tabIds: ["background", "legacy"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  }
];