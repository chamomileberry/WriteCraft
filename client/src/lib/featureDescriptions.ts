export interface FeatureDescription {
  title: string;
  description: string;
  comparison?: {
    free?: string;
    author?: string;
    professional?: string;
    team?: string;
  };
}

export const FEATURE_DESCRIPTIONS: Record<string, FeatureDescription> = {
  projects: {
    title: 'Projects',
    description: 'Organize your writing work into separate projects. Each project can contain multiple notebooks, characters, settings, and other creative elements.',
    comparison: {
      free: '1 project',
      author: '5 projects',
      professional: '25 projects',
      team: 'Unlimited',
    },
  },
  notebooks: {
    title: 'Notebooks',
    description: 'Create notebooks within each project to organize chapters, scenes, research notes, and more. Each notebook has its own timeline and content organization.',
    comparison: {
      free: '1 notebook/project',
      author: '10 notebooks/project',
      professional: 'Unlimited',
      team: 'Unlimited',
    },
  },
  aiGenerations: {
    title: 'AI Generations',
    description: 'Use AI to generate characters, plot structures, settings, descriptions, and more. Each generation counts toward your daily limit.',
    comparison: {
      free: '10/day',
      author: '100/day',
      professional: 'Unlimited',
      team: 'Unlimited (shared)',
    },
  },
  collaboration: {
    title: 'Team Collaboration',
    description: 'Invite team members to collaborate on your projects. Share access, assign permissions, and work together in real-time.',
    comparison: {
      free: 'Not available',
      author: 'Not available',
      professional: 'Not available',
      team: 'Up to 5 members',
    },
  },
  apiAccess: {
    title: 'API Access',
    description: 'Integrate WriteCraft with your own tools and workflows using our REST API. Perfect for custom automation and integrations.',
    comparison: {
      free: 'Not available',
      author: 'Not available',
      professional: 'Full access',
      team: 'Full access',
    },
  },
  prioritySupport: {
    title: 'Priority Support',
    description: 'Get faster response times and dedicated support from our team. Your questions and issues will be prioritized.',
    comparison: {
      free: 'Community support',
      author: 'Email support',
      professional: 'Priority email support',
      team: 'Priority + chat support',
    },
  },
  exportFormats: {
    title: 'Export Formats',
    description: 'Export your work in various formats for publishing, editing, or sharing. Different tiers support different export options.',
    comparison: {
      free: 'TXT, MD',
      author: 'TXT, MD, DOCX',
      professional: 'TXT, MD, DOCX, PDF, EPUB',
      team: 'All formats + API',
    },
  },
  aiWritingAssistant: {
    title: 'AI Writing Assistant',
    description: 'Get real-time writing suggestions, style improvements, and contextual help from our AI writing assistant powered by Claude.',
    comparison: {
      free: 'Basic suggestions',
      author: 'Advanced suggestions',
      professional: 'Unlimited + custom prompts',
      team: 'Unlimited + team templates',
    },
  },
  timelineViews: {
    title: 'Timeline Views',
    description: 'Visualize your story timeline in multiple formats: list view, canvas view (spatial), and Gantt chart (duration-based).',
    comparison: {
      free: 'List view only',
      author: 'List + Canvas',
      professional: 'All views',
      team: 'All views + sharing',
    },
  },
  advancedSearch: {
    title: 'Advanced Search',
    description: 'Search across all your projects, notebooks, and content with advanced filters, regex support, and content type filtering.',
    comparison: {
      free: 'Basic search',
      author: 'Advanced search',
      professional: 'Advanced + saved searches',
      team: 'Advanced + team search',
    },
  },
  versionHistory: {
    title: 'Version History',
    description: 'Track changes to your work over time and restore previous versions. See who made changes and when in team projects.',
    comparison: {
      free: '7 days history',
      author: '30 days history',
      professional: '1 year history',
      team: 'Unlimited history',
    },
  },
  customTemplates: {
    title: 'Custom Templates',
    description: 'Create and save custom templates for characters, plots, settings, and more. Reuse your favorite structures across projects.',
    comparison: {
      free: 'Not available',
      author: '5 templates',
      professional: 'Unlimited templates',
      team: 'Unlimited + team sharing',
    },
  },
};

// Helper function to get feature description by key
export function getFeatureDescription(key: string): FeatureDescription | null {
  return FEATURE_DESCRIPTIONS[key] || null;
}
