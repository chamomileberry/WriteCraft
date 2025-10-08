import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Map, MapPin, Clock, Users, Copy, Heart, Loader2, Sparkles, Check, ChevronsUpDown, Cloud } from "lucide-react";
import type { Setting } from "@shared/schema";
import { GENRE_CATEGORIES, SETTING_TYPE_CATEGORIES } from "@shared/genres";
import { useGenerator } from "@/hooks/useGenerator";

export default function SettingGenerator() {
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedSettingType, setSelectedSettingType] = useState<string>("");
  const [genreSearchOpen, setGenreSearchOpen] = useState(false);
  const [settingTypeSearchOpen, setSettingTypeSearchOpen] = useState(false);

  const generator = useGenerator<Setting>({
    generateEndpoint: '/api/settings/generate',
    getGenerateParams: () => ({
      genre: selectedGenre && selectedGenre !== "any" ? selectedGenre : undefined,
      settingType: selectedSettingType && selectedSettingType !== "any" ? selectedSettingType : undefined
    }),
    itemTypeName: 'setting',
    formatForClipboard: (setting) => `**${setting.name}**
      
**Location:** ${setting.location}
**Time Period:** ${setting.timePeriod}
**Population:** ${setting.population}
**Climate:** ${setting.climate}

**Description:**
${setting.description}

**Atmosphere:**
${setting.atmosphere}

**Cultural Elements:**
${setting.culturalElements.join(', ')}

**Notable Features:**
${setting.notableFeatures.join(', ')}`,
    prepareSavePayload: (setting) => ({
      userId: 'guest',
      itemType: 'setting',
      itemId: setting.id,
      itemData: setting
    }),
    invalidateOnSave: [['/api/saved-items']],
  });

  const generatedSetting = generator.result;

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
                    {Object.entries(SETTING_TYPE_CATEGORIES).map(([category, settingTypes]) => (
                      <CommandGroup key={category} heading={category}>
                        {settingTypes.map((settingType) => (
                          <CommandItem
                            key={settingType}
                            value={settingType}
                            onSelect={(currentValue) => {
                              setSelectedSettingType(currentValue === selectedSettingType ? "" : currentValue);
                              setSettingTypeSearchOpen(false);
                            }}
                            data-testid={`option-setting-type-${settingType}`}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${selectedSettingType === settingType ? "opacity-100" : "opacity-0"}`}
                            />
                            {settingType}
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
            onClick={generator.generate}
            disabled={generator.isGenerating}
            className="w-full"
            size="lg"
            data-testid="button-generate-setting"
          >
            {generator.isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Setting...
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">{generatedSetting.name}</CardTitle>
                <CardDescription className="text-base">
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {generatedSetting.location}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {generatedSetting.timePeriod}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {generatedSetting.population}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Cloud className="h-3 w-3" />
                      {generatedSetting.climate}
                    </Badge>
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.copyToClipboard}
                  data-testid="button-copy-setting"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generator.saveToCollection}
                  disabled={generator.isSaving || !generatedSetting?.id}
                  data-testid="button-save-setting"
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
              <h4 className="font-semibold mb-2 text-lg">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {generatedSetting.description}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2 text-lg">Atmosphere</h4>
              <p className="text-muted-foreground leading-relaxed">
                {generatedSetting.atmosphere}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Cultural Elements</h4>
              <div className="flex flex-wrap gap-2">
                {generatedSetting.culturalElements.map((element, idx) => (
                  <Badge key={idx} variant="secondary">
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3 text-lg">Notable Features</h4>
              <div className="flex flex-wrap gap-2">
                {generatedSetting.notableFeatures.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
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
