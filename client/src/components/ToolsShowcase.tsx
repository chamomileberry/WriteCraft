import { useState } from "react";
import ToolCard from "./ToolCard";
import { Users, BookOpen, Zap, Map, FileText, Target, Lightbulb, Palette, Rabbit, Leaf, PenTool, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  features: string[];
  isPopular?: boolean;
}

// TODO: Replace with dynamic tool data
const allTools: Tool[] = [
  {
    id: 'character-generator',
    title: 'Character Generator',
    description: 'Create detailed, unique characters with backstories, traits, and motivations.',
    icon: Users,
    category: 'Character Development',
    features: [
      'Randomized personality traits',
      'Background generator',
      'Motivation builder',
      'Relationship dynamics'
    ],
    isPopular: true
  },
  {
    id: 'setting-generator',
    title: 'Setting Generator',
    description: 'Build immersive worlds and locations for your stories.',
    icon: Map,
    category: 'World Building',
    features: [
      'Location details',
      'Atmosphere builder',
      'Cultural elements',
      'Historical context'
    ]
  },
  {
    id: 'creature-generator',
    title: 'Creature Generator',
    description: 'Create fascinating creatures and beings for your fantasy worlds.',
    icon: Rabbit,
    category: 'World Building',
    features: [
      'Real and fantasy creatures',
      'Unique abilities',
      'Behavioral patterns',
      'Cultural significance'
    ]
  },
  {
    id: 'plant-generator',
    title: 'Plant Generator',
    description: 'Generate detailed plant descriptions with botanical accuracy for your stories.',
    icon: Leaf,
    category: 'World Building',
    features: [
      'Scientific names',
      'Care instructions',
      'Habitat details',
      'Seasonal information'
    ]
  },
  {
    id: 'writing-prompts',
    title: 'Writing Prompts',
    description: 'Spark creativity with genre-specific prompts and story starters.',
    icon: Zap,
    category: 'Inspiration',
    features: [
      'Genre-specific prompts',
      'Difficulty levels',
      'Daily challenges',
      'Custom themes'
    ],
    isPopular: true
  },
  {
    id: 'description-generator',
    title: 'Description Generator',
    description: 'Create detailed, immersive descriptions for any element of your story.',
    icon: PenTool,
    category: 'Writing Craft',
    features: [
      'Equipment descriptions',
      'Atmospheric conditions',
      'Cultural elements',
      'Medical conditions'
    ]
  },
  {
    id: 'name-generator',
    title: 'Name Generator',
    description: 'Find perfect names for characters, places, and fantasy elements.',
    icon: FileText,
    category: 'Character Development',
    features: [
      'Character names',
      'Place names',
      'Fantasy races',
      'Cultural variations'
    ]
  },
  {
    id: 'plot-generator',
    title: 'Plot Generator',
    description: 'Generate compelling plot structures and story arcs for any genre.',
    icon: BookOpen,
    category: 'Story Structure',
    features: [
      'Customizable plot structure',
      'Conflict scenarios',
      'Plot twist ideas',
      'Character arcs'
    ]
  },
  {
    id: 'conflict-generator',
    title: 'Conflict Generator',
    description: 'Create engaging conflicts and obstacles for your story.',
    icon: Target,
    category: 'Story Structure',
    features: [
      'Internal conflicts',
      'External challenges',
      'Relationship tensions',
      'Plot complications'
    ]
  },
  {
    id: 'theme-explorer',
    title: 'Theme Explorer',
    description: 'Discover and develop meaningful themes for your narrative.',
    icon: Lightbulb,
    category: 'Story Development',
    features: [
      'Theme suggestions',
      'Symbolic elements',
      'Thematic questions',
      'Moral dilemmas'
    ]
  },
  {
    id: 'mood-palette',
    title: 'Mood Palette',
    description: 'Set the perfect tone and atmosphere for your scenes.',
    icon: Palette,
    category: 'Writing Craft',
    features: [
      'Mood descriptors',
      'Sensory details',
      'Color associations',
      'Weather elements'
    ]
  }
];

const categories = ['All Tools', 'Character Development', 'Story Structure', 'Inspiration', 'World Building', 'Story Development', 'Writing Craft'];

interface ToolsShowcaseProps {
  onToolSelect?: (toolId: string) => void;
}

export default function ToolsShowcase({ onToolSelect }: ToolsShowcaseProps) {
  const [tools] = useState<Tool[]>(allTools);
  const [filteredTools, setFilteredTools] = useState<Tool[]>(allTools);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Tools');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedCategory);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    applyFilters(searchQuery, category);
  };

  const applyFilters = (query: string, category: string) => {
    let filtered = tools;

    if (query) {
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category !== 'All Tools') {
      filtered = filtered.filter(tool => tool.category === category);
    }

    setFilteredTools(filtered);
    console.log('Tools filtered:', { query, category, resultCount: filtered.length });
  };

  const handleToolUse = (toolId: string) => {
    console.log('Tool selected:', toolId);
    onToolSelect?.(toolId);
  };

  return (
    <section id="generators" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">Writing Tools & Generators</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover powerful tools to inspire your creativity and streamline your writing process
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search writing tools..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-testid="input-tools-search"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="lg:w-64" data-testid="select-tools-category">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-6">
          Showing {filteredTools.length} of {tools.length} tools
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              category={tool.category}
              features={tool.features}
              onUse={() => handleToolUse(tool.id)}
              isPopular={tool.isPopular}
            />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or category filter
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Tools');
                setFilteredTools(tools);
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}