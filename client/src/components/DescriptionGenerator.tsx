import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FileText, Copy, Heart, Loader2, Sparkles, Check, ChevronsUpDown } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Description } from "@shared/schema";
import { GENRE_CATEGORIES } from "@shared/genres";

// Comprehensive description type categories
const DESCRIPTION_TYPE_CATEGORIES = {
  "Equipment & Gear": [
    { value: 'armour', label: 'Armour Description' },
    { value: 'weapon', label: 'Weapon Description' },
    { value: 'clothing', label: 'Clothing Description' },
    { value: 'uniform', label: 'Uniform Description' },
    { value: 'wand', label: 'Wand Description' },
    { value: 'item', label: 'Item Description' },
    { value: 'material', label: 'Material Description' }
  ],
  "Medical & Health": [
    { value: 'disease', label: 'Disease Description' },
    { value: 'illness', label: 'Illness Description' },
    { value: 'condition', label: 'Condition Description' },
    { value: 'ailment', label: 'Ailment Description' },
    { value: 'poison', label: 'Poison Description' },
    { value: 'potion', label: 'Potion Description' },
    { value: 'mental_health', label: 'Mental Health Description' }
  ],
  "Environment & Atmosphere": [
    { value: 'atmospheric', label: 'Atmospheric Description' },
    { value: 'climate', label: 'Climate Description' },
    { value: 'weather', label: 'Weather Description' },
    { value: 'storm', label: 'Storm Description' }
  ],
  "Culture & Society": [
    { value: 'holiday', label: 'Holiday Description' },
    { value: 'tradition', label: 'Tradition Description' },
    { value: 'ritual', label: 'Ritual Description' },
    { value: 'religion', label: 'Religion Description' },
    { value: 'society', label: 'Society Description' },
    { value: 'law', label: 'Law Description' }
  ],
  "Combat & Skills": [
    { value: 'martial_art', label: 'Martial Art Description' },
    { value: 'spell', label: 'Spell Description' }
  ],
  "Emotional & Psychological": [
    { value: 'dying', label: 'Dying Description' },
    { value: 'pain', label: 'Pain Description' },
    { value: 'tragedy', label: 'Tragedy Description' },
    { value: 'trauma', label: 'Trauma Description' },
    { value: 'hysteria', label: 'Hysteria Description' }
  ],
  "Mystical & Prophetic": [
    { value: 'prophecy', label: 'Prophecy Description' }
  ],
  "Food & Consumables": [
    { value: 'food', label: 'Food Description' },
    { value: 'drink', label: 'Drink Description' }
  ],
  "Literature & Media": [
    { value: 'book', label: 'Book Description' }
  ]
};

// Now using backend data - imported from shared/genres.ts

export default function DescriptionGenerator() {
  const [generatedDescription, setGeneratedDescription] = useState<Description | null>(null);
  const [descriptionType, setDescriptionType] = useState('armour');
  const [genre, setGenre] = useState('');
  const [descriptionTypeSearchOpen, setDescriptionTypeSearchOpen] = useState(false);
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);
  const { toast } = useToast();

  // Helper functions to get all description types and genres
  const getAllDescriptionTypes = () => {
    return Object.entries(DESCRIPTION_TYPE_CATEGORIES).flatMap(([category, types]) => 
      types.map(type => ({ ...type, category }))
    );
  };

  const getAllGenres = () => {
    return Object.entries(GENRE_CATEGORIES).flatMap(([category, genres]) => 
      genres.map(genre => ({ value: genre, label: genre, category }))
    );
  };

  // Get display names
  const getDescriptionTypeLabel = () => {
    const allTypes = getAllDescriptionTypes();
    return allTypes.find(type => type.value === descriptionType)?.label || 'Select description type';
  };

  const getGenreLabel = () => {
    const allGenres = getAllGenres();
    return allGenres.find(g => g.value === genre)?.label || 'Any genre';
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/descriptions/generate', { 
        descriptionType, 
        genre: genre || undefined 
      });
      return await res.json() as Description;
    },
    onSuccess: (description: Description) => {
      setGeneratedDescription(description);
      queryClient.invalidateQueries({ queryKey: ['/api/descriptions'] });
    },
    onError: (error) => {
      console.error('Failed to generate description:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create description. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (description: Description) => {
      const res = await apiRequest('POST', '/api/saved-items', {
        userId: 'guest', // Use guest user for consistency with Notebook
        itemType: 'description',
        itemId: description.id,
        itemData: description // Include the complete description data
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Description Saved!",
        description: "Your description has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'guest'] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Unable to save description. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedDescription) {
      saveMutation.mutate(generatedDescription);
    }
  };

  const handleCopy = () => {
    if (generatedDescription) {
      const descriptionText = `${generatedDescription.title}\n\n${generatedDescription.content}`;
      navigator.clipboard.writeText(descriptionText);
      toast({
        title: "Copied to Clipboard!",
        description: "Description has been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Description Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Generate detailed, immersive descriptions for any element of your story. From armour and weapons to atmospheric conditions and cultural traditions.
        </p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generation Options</CardTitle>
          <CardDescription>
            Customize your description generation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description Type</label>
              <Popover open={descriptionTypeSearchOpen} onOpenChange={setDescriptionTypeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={descriptionTypeSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-description-type"
                  >
                    {getDescriptionTypeLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search description types..." data-testid="input-description-type-search" />
                    <CommandList>
                      <CommandEmpty>No description type found.</CommandEmpty>
                      {Object.entries(DESCRIPTION_TYPE_CATEGORIES).map(([category, types]) => (
                        <CommandGroup key={category} heading={category}>
                          {types.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.label}
                              data-testid={`item-description-type-${type.value}`}
                              onSelect={() => {
                                setDescriptionType(type.value);
                                setDescriptionTypeSearchOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  descriptionType === type.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {type.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Genre (Optional)</label>
              <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={genreSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-genre"
                  >
                    {getGenreLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search genres..." data-testid="input-genre-search" />
                    <CommandList>
                      <CommandEmpty>No genre found.</CommandEmpty>
                      <CommandGroup heading="Any Genre">
                        <CommandItem
                          value="Any Genre"
                          data-testid="item-genre-any"
                          onSelect={() => {
                            setGenre('');
                            setGenreSearchOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              genre === '' ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          Any Genre
                        </CommandItem>
                      </CommandGroup>
                      {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                        <CommandGroup key={category} heading={category}>
                          {genres.map((genreOption) => (
                            <CommandItem
                              key={genreOption}
                              value={genreOption}
                              data-testid={`item-genre-${genreOption.replace(/[^a-z0-9]/g, '_')}`}
                              onSelect={() => {
                                setGenre(genreOption);
                                setGenreSearchOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  genre === genreOption ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {genreOption}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-description"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Description...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Description
            </>
          )}
        </Button>
      </div>

      {generatedDescription && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  {generatedDescription.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {getDescriptionTypeLabel()}
                  {genre && ` • ${genre}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-description-content">
                {generatedDescription.content}
              </p>
            </div>

            {generatedDescription.tags && generatedDescription.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {generatedDescription.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" data-testid={`tag-${index}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="default"
                data-testid="button-save-description"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Description
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-description"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </Button>

              <Button 
                onClick={handleGenerate}
                variant="outline"
                disabled={generateMutation.isPending}
                data-testid="button-regenerate-description"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedDescription && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Generate Descriptions</h3>
            <p className="text-muted-foreground">
              Choose your description type and optional genre, then click generate to create detailed, immersive descriptions for your story
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}