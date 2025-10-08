import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FileText, Copy, Heart, Loader2, Sparkles, Check, ChevronsUpDown } from "lucide-react";
import type { Description } from "@shared/schema";
import { GENRE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";

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

export default function DescriptionGenerator() {
  const [descriptionType, setDescriptionType] = useState('armour');
  const [genre, setGenre] = useState('');
  const [descriptionTypeSearchOpen, setDescriptionTypeSearchOpen] = useState(false);
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);

  const generator = useGenerator<Description>({
    generateEndpoint: '/api/descriptions/generate',
    getGenerateParams: () => ({ 
      descriptionType, 
      genre: genre || undefined 
    }),
    itemTypeName: 'description',
    userId: 'guest',
    formatForClipboard: (desc) => `**${desc.title}**

Type: ${desc.descriptionType}
Genre: ${desc.genre || 'General'}

${desc.content}

Tags: ${desc.tags.join(', ')}`,
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedDescription = generator.result;

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

  const getDescriptionTypeLabel = () => {
    const allTypes = getAllDescriptionTypes();
    return allTypes.find(type => type.value === descriptionType)?.label || 'Select description type';
  };

  const getGenreLabel = () => {
    const allGenres = getAllGenres();
    return allGenres.find(g => g.value === genre)?.label || 'Any genre';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Description Generator</h1>
        <p className="text-muted-foreground text-lg">
          Create vivid and detailed descriptions for your world
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Generate Description
          </CardTitle>
          <CardDescription>
            Select a type and genre to generate a detailed description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description Type</label>
              <Popover open={descriptionTypeSearchOpen} onOpenChange={setDescriptionTypeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={descriptionTypeSearchOpen}
                    className="w-full justify-between"
                    data-testid="button-description-type-select"
                  >
                    {getDescriptionTypeLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search types..." data-testid="input-description-type-search" />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No type found.</CommandEmpty>
                      {Object.entries(DESCRIPTION_TYPE_CATEGORIES).map(([category, types]) => (
                        <CommandGroup key={category} heading={category}>
                          {types.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.value}
                              onSelect={(currentValue) => {
                                setDescriptionType(currentValue);
                                setDescriptionTypeSearchOpen(false);
                              }}
                              data-testid={`option-description-type-${type.value}`}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${descriptionType === type.value ? "opacity-100" : "opacity-0"}`}
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Genre (Optional)</label>
              <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={genreSearchOpen}
                    className="w-full justify-between"
                    data-testid="button-genre-select"
                  >
                    {getGenreLabel()}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search genres..." data-testid="input-genre-search" />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No genre found.</CommandEmpty>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setGenre("");
                          setGenreSearchOpen(false);
                        }}
                        data-testid="option-any-genre"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${genre === "" ? "opacity-100" : "opacity-0"}`}
                        />
                        Any genre
                      </CommandItem>
                      {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                        <CommandGroup key={category} heading={category}>
                          {genres.map((genreOption) => (
                            <CommandItem
                              key={genreOption}
                              value={genreOption}
                              onSelect={(currentValue) => {
                                setGenre(currentValue);
                                setGenreSearchOpen(false);
                              }}
                              data-testid={`option-genre-${genreOption}`}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${genre === genreOption ? "opacity-100" : "opacity-0"}`}
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

          <Button 
            onClick={generator.generate}
            disabled={generator.isGenerating}
            className="w-full"
            size="lg"
            data-testid="button-generate-description"
          >
            {generator.isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedDescription && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl" data-testid="text-description-title">
                  {generatedDescription.title}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{generatedDescription.descriptionType}</Badge>
                    {generatedDescription.genre && (
                      <Badge variant="secondary">{generatedDescription.genre}</Badge>
                    )}
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-description"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedDescription?.id}
                  data-testid="button-save-description"
                >
                  {generator.isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2 text-lg">Content</h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-description-content">
                {generatedDescription.content}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {generatedDescription.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
