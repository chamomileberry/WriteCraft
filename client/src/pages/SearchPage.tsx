import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, FileText, Users, Map, Scroll, ExternalLink } from "lucide-react";
import ContentTypeModal from "@/components/ContentTypeModal";
import { getMappingById } from "@shared/contentTypes";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  category?: string;
  content?: string;
  createdAt?: string;
}

const CONTENT_TYPE_ICONS: Record<string, any> = {
  'guide': BookOpen,
  'manuscript': FileText,
  'character': Users,
  'setting': Map,
  'profession': Scroll,
  'species': Users,
  'default': FileText
};

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);

  // Get search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [location]);

  const handleToolSelect = (toolId: string) => {
    if (toolId === 'notebook') {
      setLocation('/notebook');
    } else if (toolId === 'manuscripts') {
      setLocation('/manuscripts');
    } else if (toolId === 'generators') {
      setLocation('/generators');
    } else if (toolId === 'guides') {
      setLocation('/guides');
    }
    console.log('Navigating to tool:', toolId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL params
    const newUrl = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
    window.history.replaceState({}, '', newUrl);
    console.log('Search query:', query);
  };

  const handleCreateNew = () => {
    setIsContentModalOpen(true);
    console.log('Opening content type modal');
  };

  const handleSelectContentType = (contentType: string) => {
    console.log('Selected content type:', contentType);
    setIsContentModalOpen(false);
    const mapping = getMappingById(contentType);
    if (mapping) {
      setLocation(`/editor/${mapping.urlSegment}/new`);
    } else {
      console.log(`No mapping found for content type: ${contentType}`);
      setLocation('/notebook');
    }
  };

  // Search API call
  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on content type
    switch (result.type) {
      case 'guide':
        setLocation(`/guides/${result.id}`);
        break;
      case 'manuscript':
        setLocation(`/manuscripts/${result.id}/edit`);
        break;
      case 'character':
        setLocation(`/characters/${result.id}/edit`);
        break;
      case 'setting':
        setLocation(`/settings/${result.id}/edit`);
        break;
      case 'profession':
        setLocation(`/professions/${result.id}/edit`);
        break;
      case 'species':
        setLocation(`/species/${result.id}/edit`);
        break;
      default:
        // Try to find a mapping for this content type
        const mapping = getMappingById(result.type);
        if (mapping) {
          setLocation(`/editor/${mapping.urlSegment}/${result.id}`);
        } else {
          setLocation('/notebook');
        }
    }
  };

  const getIcon = (type: string) => {
    return CONTENT_TYPE_ICONS[type] || CONTENT_TYPE_ICONS.default;
  };

  const groupResultsByType = (results: SearchResult[]) => {
    const grouped: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      if (!grouped[result.type]) {
        grouped[result.type] = [];
      }
      grouped[result.type].push(result);
    });
    return grouped;
  };

  const groupedResults = groupResultsByType(searchResults);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleToolSelect}
        onCreateNew={handleCreateNew}
      />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-serif font-bold">Search Results</h1>
              
              {/* Large Search Input for Mobile */}
              <div className="sm:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tools, guides, manuscripts, and more..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-mobile"
                  />
                </div>
              </div>
              
              {searchQuery && (
                <p className="text-muted-foreground">
                  Showing results for "<span className="font-medium">{searchQuery}</span>"
                </p>
              )}
            </div>

            {/* Search Results */}
            {!searchQuery.trim() && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Search WriteCraft</h3>
                    <p className="text-muted-foreground mb-4">
                      Find tools, guides, manuscripts, characters, and more across your creative workspace.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary">Tools</Badge>
                      <Badge variant="secondary">Guides</Badge>
                      <Badge variant="secondary">Manuscripts</Badge>
                      <Badge variant="secondary">Characters</Badge>
                      <Badge variant="secondary">Settings</Badge>
                      <Badge variant="secondary">Professions</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {searchQuery.trim() && isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {searchQuery.trim() && !isLoading && error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-destructive">Failed to search. Please try again.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {searchQuery.trim() && !isLoading && !error && searchResults.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search terms or explore our tools and guides.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setLocation('/generators')}>
                        Browse Generators
                      </Button>
                      <Button variant="outline" onClick={() => setLocation('/guides')}>
                        Browse Guides
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {searchQuery.trim() && !isLoading && !error && searchResults.length > 0 && (
              <div className="space-y-6">
                {Object.entries(groupedResults).map(([type, results]) => {
                  const IconComponent = getIcon(type);
                  return (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold capitalize">
                          {type}s ({results.length})
                        </h2>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.map((result) => (
                          <Card 
                            key={result.id} 
                            className="group hover-elevate cursor-pointer" 
                            onClick={() => handleResultClick(result)}
                            data-testid={`search-result-${result.id}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
                                  <CardTitle className="text-base line-clamp-2">
                                    {result.title}
                                  </CardTitle>
                                </div>
                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                              </div>
                              {result.subtitle && (
                                <CardDescription className="line-clamp-2">
                                  {result.subtitle}
                                </CardDescription>
                              )}
                            </CardHeader>
                            
                            {result.content && (
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                  {result.content}
                                </p>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Content Type Modal */}
      <ContentTypeModal 
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSelectType={handleSelectContentType}
      />
    </div>
  );
}