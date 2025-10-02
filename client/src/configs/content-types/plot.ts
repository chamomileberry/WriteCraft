import { ContentTypeFormConfig } from '../../components/forms/types';
import * as Fields from '@/lib/field-definitions';

export const plotConfig: ContentTypeFormConfig = {
  title: "Plot Editor",
  description: "Structure compelling stories",
  icon: "BookOpen", 
  tabs: [
    {
      id: "structure",
      label: "Story Structure",
      icon: "BookOpen",
      fields: [
        Fields.createImageField("plot"),
        { name: "setup", label: "Setup", type: "textarea", placeholder: "Introduce characters, world, and status quo...", description: "Set the stage for your story" },
        { name: "incitingIncident", label: "Inciting Incident", type: "textarea", placeholder: "The event that kicks off the main story...", description: "What disrupts the normal world?" },
        { name: "firstPlotPoint", label: "First Plot Point", type: "textarea", placeholder: "The protagonist commits to the journey...", description: "The point of no return" },
        { name: "midpoint", label: "Midpoint", type: "textarea", placeholder: "Major revelation or turning point...", description: "Everything changes here" }
      ]
    },
    {
      id: "climax",
      label: "Climax & Resolution", 
      icon: "Zap",
      fields: [
        { name: "secondPlotPoint", label: "Second Plot Point", type: "textarea", placeholder: "All hope seems lost...", description: "The darkest moment" },
        { name: "climax", label: "Climax", type: "textarea", placeholder: "The final confrontation...", description: "The ultimate showdown" },
        { name: "resolution", label: "Resolution", type: "textarea", placeholder: "How everything wraps up...", description: "The new normal" }
      ]
    },
    {
      id: "themes",
      label: "Themes & Conflict",
      icon: "Heart",
      fields: [
        { name: "theme", label: "Theme", type: "textarea", placeholder: "The deeper meaning or message...", description: "What is your story really about?" },
        { name: "conflict", label: "Central Conflict", type: "textarea", placeholder: "The main struggle or tension...", description: "What opposition drives the story?" },
        Fields.createGenreField(),
        { name: "storyStructure", label: "Story Structure", type: "select", options: ["Three-Act", "Hero's Journey", "Save the Cat", "Freytag's Pyramid", "Other"] }
      ]
    }
  ]
};

export default plotConfig;