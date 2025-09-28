import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Map, MapPin, Clock, Users, Copy, Heart, Loader2, Sparkles, Check, ChevronsUpDown, Cloud } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Setting } from "@shared/schema";
import { GENRE_CATEGORIES, SETTING_TYPE_CATEGORIES } from "../../../server/genres";

// Now using backend data - imported from server/genres.ts


export default function SettingGenerator() {
  const [generatedSetting, setGeneratedSetting] = useState<Setting | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedSettingType, setSelectedSettingType] = useState<string>("");
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);
  const [settingTypeSearchOpen, setSettingTypeSearchOpen] = useState(false);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/settings/generate', {
        genre: selectedGenre && selectedGenre !== "any" ? selectedGenre : undefined,
        settingType: selectedSettingType && selectedSettingType !== "any" ? selectedSettingType : undefined
      });
      return await res.json() as Setting;
    },
    onSuccess: (setting: Setting) => {
      setGeneratedSetting(setting);
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      console.error('Failed to generate setting:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to create setting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (setting: Setting) => {
      const res = await apiRequest('POST', '/api/saved-items', {
        userId: 'guest', // Use guest user for consistency
        itemType: 'setting',
        itemId: setting.id,
        itemData: setting // Include the complete setting data
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Setting Saved!",
        description: "Setting has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: (error) => {
      console.error('Failed to save setting:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save setting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (generatedSetting) {
      saveMutation.mutate(generatedSetting);
    }
  };

  const handleCopy = () => {
    if (generatedSetting) {
      const settingText = `**${generatedSetting.name}**
      
**Location:** ${generatedSetting.location}
**Time Period:** ${generatedSetting.timePeriod}
**Population:** ${generatedSetting.population}
**Climate:** ${generatedSetting.climate}

**Description:**
${generatedSetting.description}

**Atmosphere:**
${generatedSetting.atmosphere}

**Cultural Elements:**
${generatedSetting.culturalElements.join(', ')}

**Notable Features:**
${generatedSetting.notableFeatures.join(', ')}`;

      navigator.clipboard.writeText(settingText);
      toast({
        title: "Copied to Clipboard!",
        description: "Setting details have been copied to your clipboard.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Setting Generator</h1>
        <p className="text-muted-foreground text-lg">
          Create immersive worlds and locations for your stories
        </p>
      </div>

      {/* Generation Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Generate Setting
          </CardTitle>
          <CardDescription>
            Customize your setting by selecting preferences below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genre Selection */}
          <div className="space-y-2">
            <Label>Genre (Optional)</Label>
            <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={genreSearchOpen}
                  className="w-full justify-between"
                  data-testid="button-genre-select"
                >
                  {selectedGenre ? selectedGenre : "Any Genre"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search genres..." data-testid="input-genre-search" />
                  <CommandList>
                    <CommandEmpty>No genre found.</CommandEmpty>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setSelectedGenre("");
                        setGenreSearchOpen(false);
                      }}
                      data-testid="option-any-genre"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${selectedGenre === "" ? "opacity-100" : "opacity-0"}`}
                      />
                      Any Genre
                    </CommandItem>
                    {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                      <CommandGroup key={category} heading={category}>
                        {genres.map((genre) => (
                          <CommandItem
                            key={genre}
                            value={genre}
                            onSelect={(currentValue) => {
                              setSelectedGenre(currentValue === selectedGenre ? "" : currentValue);
                              setGenreSearchOpen(false);
                            }}
                            data-testid={`option-genre-${genre}`}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedGenre === genre ? "opacity-100" : "opacity-0"}`}
                            />
                            {genre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Setting Type Selection */}
          <div className="space-y-2">
            <Label>Setting Type (Optional)</Label>
            <Popover open={settingTypeSearchOpen} onOpenChange={setSettingTypeSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={settingTypeSearchOpen}
                  className="w-full justify-between"
                  data-testid="button-setting-type-select"
                >
                  {selectedSettingType ? selectedSettingType : "Any Setting Type"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search setting types..." data-testid="input-setting-type-search" />
                  <CommandList>
                    <CommandEmpty>No setting type found.</CommandEmpty>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setSelectedSettingType("");
                        setSettingTypeSearchOpen(false);
                      }}
                      data-testid="option-any-setting-type"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${selectedSettingType === "" ? "opacity-100" : "opacity-0"}`}
                      />
                      Any Setting Type
                    </CommandItem>
                    {Object.entries(SETTING_TYPE_CATEGORIES).map(([category, types]) => (
                      <CommandGroup key={category} heading={category}>
                        {types.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={(currentValue) => {
                              setSelectedSettingType(currentValue === selectedSettingType ? "" : currentValue);
                              setSettingTypeSearchOpen(false);
                            }}
                            data-testid={`option-setting-type-${type}`}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedSettingType === type ? "opacity-100" : "opacity-0"}`}
                            />
                            {type}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={generateMutation.isPending} 
            className="w-full" 
            size="lg"
            data-testid="button-generate-setting"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Setting
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Setting Display */}
      {generatedSetting && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MapPin className="h-6 w-6 text-primary" />
                  {generatedSetting.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {generatedSetting.location} • {generatedSetting.timePeriod}
                </CardDescription>
                <div className="flex gap-2 mt-3">
                  {generatedSetting.genre && (
                    <Badge variant="outline" data-testid="badge-genre">{generatedSetting.genre}</Badge>
                  )}
                  {generatedSetting.settingType && (
                    <Badge variant="outline" data-testid="badge-setting-type">{generatedSetting.settingType}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  data-testid="button-copy-setting"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-setting"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Population
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-population">
                  {generatedSetting.population}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  Climate
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-climate">
                  {generatedSetting.climate}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Time Period
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-time-period">
                  {generatedSetting.timePeriod}
                </p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {generatedSetting.description}
              </p>
            </div>

            <Separator />

            {/* Atmosphere */}
            <div className="space-y-3">
              <h3 className="font-semibold">Atmosphere</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-atmosphere">
                {generatedSetting.atmosphere}
              </p>
            </div>

            <Separator />

            {/* Cultural Elements and Notable Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Cultural Elements</h3>
                <div className="flex flex-wrap gap-2" data-testid="list-cultural-elements">
                  {generatedSetting.culturalElements.map((element, index) => (
                    <Badge key={index} variant="secondary">
                      {element}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Notable Features</h3>
                <div className="flex flex-wrap gap-2" data-testid="list-notable-features">
                  {generatedSetting.notableFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}