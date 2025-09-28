import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Zap, Eye, Shield, Crown, Heart, TreePine, Mountain, Waves, Wind, Star, Feather, Package } from "lucide-react";
import { insertCreatureSchema, type InsertCreature, type Creature } from "@shared/schema";
import { useState } from "react";

interface CreatureFormProps {
  initialData?: Partial<Creature>;
  onSubmit: (data: InsertCreature) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
}

const creatureTypes = [
  { value: "beast", label: "Beast", icon: Feather },
  { value: "dragon", label: "Dragon", icon: Crown },
  { value: "elemental", label: "Elemental", icon: Zap },
  { value: "fey", label: "Fey", icon: Sparkles },
  { value: "fiend", label: "Fiend", icon: Shield },
  { value: "giant", label: "Giant", icon: Mountain },
  { value: "humanoid", label: "Humanoid", icon: Heart },
  { value: "monstrosity", label: "Monstrosity", icon: Eye },
  { value: "ooze", label: "Ooze", icon: Waves },
  { value: "plant", label: "Plant", icon: TreePine },
  { value: "undead", label: "Undead", icon: Shield },
  { value: "construct", label: "Construct", icon: Package },
  { value: "celestial", label: "Celestial", icon: Star },
  { value: "aberration", label: "Aberration", icon: Eye },
  { value: "magical", label: "Magical", icon: Sparkles },
  { value: "natural", label: "Natural", icon: TreePine },
  { value: "aquatic", label: "Aquatic", icon: Waves },
  { value: "aerial", label: "Aerial", icon: Wind },
  { value: "other", label: "Other", icon: Package }
];

const habitatTypes = [
  "Forest", "Mountain", "Desert", "Ocean", "River", "Lake", "Swamp", "Plains", 
  "Caves", "Underground", "Arctic", "Jungle", "Volcanic", "Sky", "Ethereal Plane",
  "Shadow Realm", "Magical Forest", "Ancient Ruins", "Urban", "Farmland"
];

const genres = [
  "Fantasy", "Sci-Fi", "Horror", "Modern", "Post-Apocalyptic", "Steampunk", 
  "Cyberpunk", "Medieval", "Ancient", "Futuristic", "Mythological", "Dark Fantasy"
];

export default function CreatureForm({ initialData, onSubmit, onGenerate, isLoading }: CreatureFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm<InsertCreature>({
    resolver: zodResolver(insertCreatureSchema.extend({
      abilities: insertCreatureSchema.shape.abilities.optional(),
    })),
    defaultValues: {
      name: initialData?.name ?? "",
      creatureType: initialData?.creatureType ?? "",
      habitat: initialData?.habitat ?? "",
      physicalDescription: initialData?.physicalDescription ?? "",
      abilities: initialData?.abilities ?? [],
      behavior: initialData?.behavior ?? "",
      culturalSignificance: initialData?.culturalSignificance ?? "",
      genre: initialData?.genre ?? "",
    },
  });

  // Convert abilities array to comma-separated string for display
  const [abilitiesText, setAbilitiesText] = useState(
    initialData?.abilities?.join(", ") ?? ""
  );

  const handleSubmit = (data: InsertCreature) => {
    // Convert comma-separated string back to array
    const formattedData = {
      ...data,
      abilities: abilitiesText ? abilitiesText.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    onSubmit(formattedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Feather className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Creature Editor</h1>
            <p className="text-muted-foreground">
              Design fantastical creatures for your world
            </p>
          </div>
        </div>
        
        {onGenerate && (
          <Button 
            onClick={onGenerate} 
            variant="outline" 
            disabled={isLoading}
            data-testid="button-generate-creature"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="physical">Physical & Behavior</TabsTrigger>
              <TabsTrigger value="abilities">Abilities & Culture</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Define the fundamental characteristics of your creature
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creature Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter creature name..." 
                              {...field} 
                              value={field.value ?? ""}
                              data-testid="input-creature-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="creatureType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creature Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-creature-type">
                                <SelectValue placeholder="Select creature type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {creatureTypes.map((type) => {
                                const IconComponent = type.icon;
                                return (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="habitat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habitat *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-creature-habitat">
                                <SelectValue placeholder="Select habitat" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {habitatTypes.map((habitat) => (
                                <SelectItem key={habitat} value={habitat}>
                                  {habitat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-creature-genre">
                                <SelectValue placeholder="Select genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="physical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Physical Description & Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="physicalDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physical Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the creature's appearance, size, coloring, distinctive features..."
                            className="min-h-24"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-creature-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Paint a vivid picture of what this creature looks like
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="behavior"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavior *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe how the creature acts, its temperament, hunting patterns, social behavior..."
                            className="min-h-24"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-creature-behavior"
                          />
                        </FormControl>
                        <FormDescription>
                          How does this creature interact with its environment and other beings?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="abilities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Abilities & Cultural Significance
                  </CardTitle>
                  <CardDescription>
                    Define the creature's powers and role in your world
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="abilities">Special Abilities</Label>
                    <Input 
                      id="abilities"
                      placeholder="Enter abilities separated by commas (e.g., Flight, Fire breath, Invisibility, Telepathy)"
                      value={abilitiesText}
                      onChange={(e) => setAbilitiesText(e.target.value)}
                      data-testid="input-creature-abilities"
                    />
                    <p className="text-sm text-muted-foreground">
                      Special powers, magical abilities, or unique traits this creature possesses
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="culturalSignificance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultural Significance *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the creature's role in society, mythology, religion, or folklore..."
                            className="min-h-24"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-creature-culture"
                          />
                        </FormControl>
                        <FormDescription>
                          How do people in your world view and interact with this creature?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isLoading} data-testid="button-save-creature">
              {isLoading ? "Saving..." : "Save Creature"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}