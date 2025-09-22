import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Heart, Copy, Trash2, User, Map, Feather, Scroll, BookMarked, Loader2, PenTool, Edit } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface SavedItem {
  id: string;
  userId: string;
  itemType: string;
  itemId: string;
  itemData?: any;
  createdAt: string;
}

interface Character {
  id: string;
  name: string;
  age: number;
  occupation: string;
  personality: string[];
  backstory: string;
  motivation: string;
  flaw: string;
  strength: string;
  gender?: string;
  genre?: string;
}

interface Setting {
  id: string;
  name: string;
  location: string;
  timePeriod: string;
  population: string;
  climate: string;
  description: string;
  atmosphere: string;
  culturalElements: string[];
  notableFeatures: string[];
  genre?: string;
}

interface Creature {
  id: string;
  name: string;
  creatureType: string;
  habitat: string;
  physicalDescription: string;
  abilities: string[];
  behavior: string;
  culturalSignificance: string;
  genre?: string;
}

interface Description {
  id: string;
  title: string;
  content: string;
  descriptionType: string;
  genre?: string;
}

export default function SavedItems() {
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch saved items
  const { data: savedItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/saved-items', 'null'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/saved-items/null');
      return response.json() as Promise<SavedItem[]>;
    },
  });

  // Unsave mutation
  const unsaveMutation = useMutation({
    mutationFn: async ({ itemType, itemId }: { itemType: string; itemId: string }) => {
      const response = await apiRequest('DELETE', '/api/saved-items', {
        userId: 'null',
        itemType,
        itemId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item has been removed from your notebook.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleUnsave = (itemType: string, itemId: string) => {
    unsaveMutation.mutate({ itemType, itemId });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to Clipboard!",
      description: "Content has been copied to your clipboard.",
    });
  };

  // Filter items by type
  const filterItemsByType = (type?: string) => {
    if (!type || type === "all") return savedItems;
    return savedItems.filter(item => item.itemType === type);
  };

  const renderCharacterCard = (item: SavedItem) => {
    const character = item.itemData as Character;
    if (!character) return null;

    const characterText = `**${character.name}** (Age: ${character.age})
**Occupation:** ${character.occupation}
**Personality:** ${character.personality.join(', ')}
**Backstory:** ${character.backstory}
**Motivation:** ${character.motivation}
**Strength:** ${character.strength}
**Flaw:** ${character.flaw}`;

    return (
      <Card key={item.id} className="hover-elevate">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {character.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {character.age} year old {character.occupation}
              </CardDescription>
              <div className="flex gap-2 mt-2">
                {character.gender && (
                  <Badge variant="outline">{character.gender}</Badge>
                )}
                {character.genre && (
                  <Badge variant="outline">{character.genre}</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(`/characters/${character.id}/edit`)}
                data-testid="button-edit-character"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(characterText)}
                data-testid="button-copy-character"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUnsave('character', character.id)}
                disabled={unsaveMutation.isPending}
                data-testid="button-unsave-character"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Personality:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {character.personality.map((trait, index) => (
                  <Badge key={index} variant="secondary">{trait}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-semibold">Backstory:</span>
              <p className="text-sm text-muted-foreground mt-1">{character.backstory}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSettingCard = (item: SavedItem) => {
    const setting = item.itemData as Setting;
    if (!setting) return null;

    const settingText = `Setting: ${setting.name}

Location: ${setting.location}
Time Period: ${setting.timePeriod}
Population: ${setting.population}
Climate: ${setting.climate}

Description:
${setting.description}

Atmosphere:
${setting.atmosphere}

Cultural Elements:
${setting.culturalElements.join(', ')}

Notable Features:
${setting.notableFeatures.join(', ')}`;

    return (
      <Card key={item.id} className="hover-elevate">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                {setting.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {setting.location} • {setting.timePeriod}
              </CardDescription>
              {setting.genre && (
                <Badge variant="outline" className="mt-2">{setting.genre}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(settingText)}
                data-testid="button-copy-setting"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUnsave('setting', setting.id)}
                disabled={unsaveMutation.isPending}
                data-testid="button-unsave-setting"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Description:</span>
              <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
            </div>
            <div>
              <span className="font-semibold">Atmosphere:</span>
              <p className="text-sm text-muted-foreground mt-1">{setting.atmosphere}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCreatureCard = (item: SavedItem) => {
    const creature = item.itemData as Creature;
    if (!creature) return null;

    const creatureText = `Creature: ${creature.name}
Type: ${creature.creatureType}
Habitat: ${creature.habitat}

Physical Description:
${creature.physicalDescription}

Abilities:
${creature.abilities.join(', ')}

Behavior:
${creature.behavior}

Cultural Significance:
${creature.culturalSignificance}`;

    return (
      <Card key={item.id} className="hover-elevate">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Feather className="h-5 w-5 text-primary" />
                {creature.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {creature.creatureType} • {creature.habitat}
              </CardDescription>
              {creature.genre && (
                <Badge variant="outline" className="mt-2">{creature.genre}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(creatureText)}
                data-testid="button-copy-creature"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUnsave('creature', creature.id)}
                disabled={unsaveMutation.isPending}
                data-testid="button-unsave-creature"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Physical Description:</span>
              <p className="text-sm text-muted-foreground mt-1">{creature.physicalDescription}</p>
            </div>
            <div>
              <span className="font-semibold">Behavior:</span>
              <p className="text-sm text-muted-foreground mt-1">{creature.behavior}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDescriptionCard = (item: SavedItem) => {
    const description = item.itemData as Description;
    if (!description) return null;

    const descriptionText = `${description.title}

${description.content}`;

    return (
      <Card key={item.id} className="hover-elevate">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-primary" />
                {description.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {description.descriptionType}
              </CardDescription>
              {description.genre && (
                <Badge variant="outline" className="mt-2">{description.genre}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(descriptionText)}
                data-testid="button-copy-description"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleUnsave('description', description.id)}
                disabled={unsaveMutation.isPending}
                data-testid="button-unsave-description"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Content:</span>
              <p className="text-sm text-muted-foreground mt-1">{description.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    const filteredItems = filterItemsByType(activeTab);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load saved items. Please try again.</p>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12">
          <BookMarked className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No saved items found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Start creating and saving content with our generators!
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          switch (item.itemType) {
            case 'character':
              return renderCharacterCard(item);
            case 'setting':
              return renderSettingCard(item);
            case 'creature':
              return renderCreatureCard(item);
            case 'description':
              return renderDescriptionCard(item);
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const getItemCount = (type?: string) => {
    return filterItemsByType(type).length;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">My Notebook</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Your saved characters, settings, creatures, and other creative content all in one place.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all-items">
            All ({getItemCount('all')})
          </TabsTrigger>
          <TabsTrigger value="character" data-testid="tab-characters">
            Characters ({getItemCount('character')})
          </TabsTrigger>
          <TabsTrigger value="setting" data-testid="tab-settings">
            Settings ({getItemCount('setting')})
          </TabsTrigger>
          <TabsTrigger value="creature" data-testid="tab-creatures">
            Creatures ({getItemCount('creature')})
          </TabsTrigger>
          <TabsTrigger value="description" data-testid="tab-descriptions">
            Descriptions ({getItemCount('description')})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="character" className="mt-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="setting" className="mt-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="creature" className="mt-6">
          {renderContent()}
        </TabsContent>
        <TabsContent value="description" className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}