import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Clock, Star, Search, Filter } from "lucide-react";

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  author: string;
  tags: string[];
  excerpt: string;
}

// TODO: Replace with real guide data
const mockGuides: Guide[] = [
  {
    id: '1',
    title: 'Mastering Character Development',
    description: 'Learn how to create compelling, three-dimensional characters that readers will love',
    category: 'Character Writing',
    readTime: 12,
    difficulty: 'Intermediate',
    rating: 4.8,
    author: 'Sarah Mitchell',
    tags: ['characters', 'development', 'psychology'],
    excerpt: 'Great characters are the heart of any story. They drive the plot, engage readers emotionally, and make your narrative memorable...'
  },
  {
    id: '2',
    title: 'Dialogue That Sings',
    description: 'Techniques for writing natural, engaging dialogue that advances your story',
    category: 'Writing Craft',
    readTime: 8,
    difficulty: 'Beginner',
    rating: 4.6,
    author: 'Marcus Rodriguez',
    tags: ['dialogue', 'conversation', 'voice'],
    excerpt: 'Good dialogue serves multiple purposes: it reveals character, advances plot, and provides information naturally...'
  },
  {
    id: '3',
    title: 'World Building for Fantasy',
    description: 'Create immersive fantasy worlds with consistent rules and rich history',
    category: 'World Building',
    readTime: 15,
    difficulty: 'Advanced',
    rating: 4.9,
    author: 'Elena Blackwood',
    tags: ['fantasy', 'world-building', 'magic systems'],
    excerpt: 'A well-crafted fantasy world feels real to readers. It has its own geography, history, culture, and rules...'
  },
  {
    id: '4',
    title: 'Show Don\'t Tell Mastery',
    description: 'Transform exposition into engaging scenes that immerse readers',
    category: 'Writing Craft',
    readTime: 10,
    difficulty: 'Intermediate',
    rating: 4.7,
    author: 'David Chen',
    tags: ['show don\'t tell', 'exposition', 'immersion'],
    excerpt: 'Instead of telling readers what happened, show them through action, dialogue, and sensory details...'
  },
  {
    id: '5',
    title: 'Plot Pacing Fundamentals',
    description: 'Control the rhythm of your story to keep readers engaged',
    category: 'Story Structure',
    readTime: 14,
    difficulty: 'Intermediate',
    rating: 4.5,
    author: 'Rachel Green',
    tags: ['pacing', 'plot', 'tension'],
    excerpt: 'Pacing is the speed at which your story unfolds. Too fast and readers feel rushed; too slow and they lose interest...'
  },
  {
    id: '6',
    title: 'Writing Authentic Romance',
    description: 'Craft believable romantic relationships with emotional depth',
    category: 'Genre Writing',
    readTime: 11,
    difficulty: 'Beginner',
    rating: 4.4,
    author: 'Amy Foster',
    tags: ['romance', 'relationships', 'emotion'],
    excerpt: 'Romance isn\'t just about the destination—it\'s about the journey. Authentic relationships develop gradually...'
  }
];

const categories = ['All', 'Character Writing', 'Writing Craft', 'World Building', 'Story Structure', 'Genre Writing'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function WritingGuides() {
  const [guides] = useState<Guide[]>(mockGuides);
  const [filteredGuides, setFilteredGuides] = useState<Guide[]>(mockGuides);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedCategory, selectedDifficulty);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    applyFilters(searchQuery, category, selectedDifficulty);
  };

  const handleDifficultyFilter = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    applyFilters(searchQuery, selectedCategory, difficulty);
  };

  const applyFilters = (query: string, category: string, difficulty: string) => {
    let filtered = guides;

    if (query) {
      filtered = filtered.filter(guide => 
        guide.title.toLowerCase().includes(query.toLowerCase()) ||
        guide.description.toLowerCase().includes(query.toLowerCase()) ||
        guide.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (category !== 'All') {
      filtered = filtered.filter(guide => guide.category === category);
    }

    if (difficulty !== 'All') {
      filtered = filtered.filter(guide => guide.difficulty === difficulty);
    }

    setFilteredGuides(filtered);
    console.log('Filters applied:', { query, category, difficulty, resultCount: filtered.length });
  };

  const handleReadGuide = (guideId: string) => {
    console.log('Reading guide:', guideId);
    // TODO: Implement guide reading functionality
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-chart-4/10 text-chart-4';
      case 'Intermediate': return 'bg-chart-3/10 text-chart-3';
      case 'Advanced': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif font-bold">Writing Guides & Resources</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Expert advice and comprehensive guides to help you master the craft of writing
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides, topics, or authors..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                data-testid="input-guide-search"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-48" data-testid="select-guide-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDifficulty} onValueChange={handleDifficultyFilter}>
                <SelectTrigger className="w-40" data-testid="select-guide-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredGuides.length} of {guides.length} guides
      </div>

      {/* Guides Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <Card key={guide.id} className="group hover-elevate transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {guide.category}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {guide.title}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 text-chart-3">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm">{guide.rating}</span>
                </div>
              </div>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {guide.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.readTime}m read
                  </span>
                  <span>by {guide.author}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {guide.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button 
                onClick={() => handleReadGuide(guide.id)}
                className="w-full"
                data-testid={`button-read-guide-${guide.id}`}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Read Guide
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No guides found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}