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
import { MapPin, Mountain, Building, Trees, Waves, Sun, Users, Coins, Crown, Shield, Scroll, Star, AlertTriangle } from "lucide-react";
import { insertLocationSchema, type InsertLocation, type Location } from "@shared/schema";
import { useState } from "react";

interface LocationFormProps {
  initialData?: Partial<Location>;
  onSubmit: (data: InsertLocation) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
}

const locationTypes = [
  { value: "city", label: "City", icon: Building },
  { value: "town", label: "Town", icon: Building },
  { value: "village", label: "Village", icon: Building },
  { value: "capital", label: "Capital", icon: Crown },
  { value: "fortress", label: "Fortress", icon: Shield },
  { value: "castle", label: "Castle", icon: Crown },
  { value: "port", label: "Port", icon: Waves },
  { value: "forest", label: "Forest", icon: Trees },
  { value: "mountain", label: "Mountain", icon: Mountain },
  { value: "desert", label: "Desert", icon: Sun },
  { value: "plains", label: "Plains", icon: MapPin },
  { value: "swamp", label: "Swamp", icon: Trees },
  { value: "island", label: "Island", icon: Waves },
  { value: "dungeon", label: "Dungeon", icon: AlertTriangle },
  { value: "temple", label: "Temple", icon: Star },
  { value: "ruins", label: "Ruins", icon: Scroll },
  { value: "tavern", label: "Tavern", icon: Building },
  { value: "market", label: "Market", icon: Coins },
  { value: "other", label: "Other", icon: MapPin }
];

const climateTypes = [
  "Tropical", "Subtropical", "Temperate", "Continental", "Polar", "Arid", "Mediterranean", 
  "Oceanic", "Subarctic", "Alpine", "Monsoon", "Magical", "Harsh", "Mild", "Variable"
];

const genres = [
  "Fantasy", "Sci-Fi", "Historical", "Modern", "Post-Apocalyptic", "Steampunk", 
  "Cyberpunk", "Medieval", "Victorian", "Ancient", "Futuristic", "Mythological"
];

export default function LocationForm({ initialData, onSubmit, onGenerate, isLoading }: LocationFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  const form = useForm<InsertLocation>({
    resolver: zodResolver(insertLocationSchema.extend({
      notableFeatures: insertLocationSchema.shape.notableFeatures.optional(),
      landmarks: insertLocationSchema.shape.landmarks.optional(),
      threats: insertLocationSchema.shape.threats.optional(),
      resources: insertLocationSchema.shape.resources.optional(),
    })),
    defaultValues: {
      name: initialData?.name ?? "",
      locationType: initialData?.locationType ?? "",
      description: initialData?.description ?? "",
      geography: initialData?.geography ?? "",
      climate: initialData?.climate ?? "",
      population: initialData?.population ?? "",
      government: initialData?.government ?? "",
      economy: initialData?.economy ?? "",
      culture: initialData?.culture ?? "",
      history: initialData?.history ?? "",
      notableFeatures: initialData?.notableFeatures ?? [],
      landmarks: initialData?.landmarks ?? [],
      threats: initialData?.threats ?? [],
      resources: initialData?.resources ?? [],
      genre: initialData?.genre ?? "",
    },
  });

  // Convert array fields to comma-separated strings for display
  const [notableFeaturesText, setNotableFeaturesText] = useState(
    initialData?.notableFeatures?.join(", ") ?? ""
  );
  const [landmarksText, setLandmarksText] = useState(
    initialData?.landmarks?.join(", ") ?? ""
  );
  const [threatsText, setThreatsText] = useState(
    initialData?.threats?.join(", ") ?? ""
  );
  const [resourcesText, setResourcesText] = useState(
    initialData?.resources?.join(", ") ?? ""
  );

  const handleSubmit = (data: InsertLocation) => {
    // Convert comma-separated strings back to arrays
    const formattedData = {
      ...data,
      notableFeatures: notableFeaturesText ? notableFeaturesText.split(",").map(s => s.trim()).filter(Boolean) : [],
      landmarks: landmarksText ? landmarksText.split(",").map(s => s.trim()).filter(Boolean) : [],
      threats: threatsText ? threatsText.split(",").map(s => s.trim()).filter(Boolean) : [],
      resources: resourcesText ? resourcesText.split(",").map(s => s.trim()).filter(Boolean) : [],
    };
    onSubmit(formattedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Location Editor</h1>
            <p className="text-muted-foreground">
              Create detailed locations for your world
            </p>
          </div>
        </div>
        
        {onGenerate && (
          <Button 
            onClick={onGenerate} 
            variant="outline" 
            disabled={isLoading}
            data-testid="button-generate-location"
          >
            <Star className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="society">Society</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Define the fundamental characteristics of your location
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter location name..." 
                              {...field} 
                              data-testid="input-location-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="locationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-location-type">
                                <SelectValue placeholder="Select location type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locationTypes.map((type) => {
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the location's overall appearance, feel, and significance..."
                            className="min-h-24"
                            {...field}
                            data-testid="textarea-location-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Paint a vivid picture of what visitors would experience
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-location-genre">
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

                    <FormField
                      control={form.control}
                      name="climate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Climate</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger data-testid="select-location-climate">
                                <SelectValue placeholder="Select climate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {climateTypes.map((climate) => (
                                <SelectItem key={climate} value={climate}>
                                  {climate}
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

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mountain className="w-5 h-5" />
                    Geographic Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="geography"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geography</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the physical landscape, terrain, and natural features..."
                            {...field}
                            value={field.value || ''}
                            data-testid="textarea-location-geography"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="population"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Population</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 'About 5,000 residents' or 'Sparsely populated'"
                            {...field}
                            value={field.value || ''}
                            data-testid="input-location-population"
                          />
                        </FormControl>
                        <FormDescription>
                          Include rough numbers and demographic information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>History</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the location's founding, major events, and historical significance..."
                            {...field}
                            value={field.value || ''}
                            data-testid="textarea-location-history"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="society" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Society & Governance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="government"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Government</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the political system, leadership, and governance structure..."
                            {...field}
                            value={field.value || ''}
                            data-testid="textarea-location-government"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="economy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Economy</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe trade, commerce, major industries, and economic activities..."
                            {...field}
                            value={field.value || ''}
                            data-testid="textarea-location-economy"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="culture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Culture</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe customs, traditions, beliefs, and cultural practices..."
                            {...field}
                            value={field.value || ''}
                            data-testid="textarea-location-culture"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Notable Features
                  </CardTitle>
                  <CardDescription>
                    Add specific details that make this location unique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notable-features">Notable Features</Label>
                    <Input 
                      id="notable-features"
                      placeholder="Enter features separated by commas (e.g., Ancient tower, Magical fountain, Hidden passage)"
                      value={notableFeaturesText}
                      onChange={(e) => setNotableFeaturesText(e.target.value)}
                      data-testid="input-location-features"
                    />
                    <p className="text-sm text-muted-foreground">
                      Unique architectural elements, magical phenomena, or distinctive characteristics
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmarks">Landmarks</Label>
                    <Input 
                      id="landmarks"
                      placeholder="Enter landmarks separated by commas (e.g., Great Library, Temple of Shadows, Market Square)"
                      value={landmarksText}
                      onChange={(e) => setLandmarksText(e.target.value)}
                      data-testid="input-location-landmarks"
                    />
                    <p className="text-sm text-muted-foreground">
                      Important buildings, monuments, or recognizable locations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="threats">Threats & Dangers</Label>
                    <Input 
                      id="threats"
                      placeholder="Enter threats separated by commas (e.g., Bandits, Wild beasts, Cursed areas)"
                      value={threatsText}
                      onChange={(e) => setThreatsText(e.target.value)}
                      data-testid="input-location-threats"
                    />
                    <p className="text-sm text-muted-foreground">
                      Potential dangers, hostile creatures, or hazardous areas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resources">Resources</Label>
                    <Input 
                      id="resources"
                      placeholder="Enter resources separated by commas (e.g., Iron ore, Fertile farmland, Fresh water)"
                      value={resourcesText}
                      onChange={(e) => setResourcesText(e.target.value)}
                      data-testid="input-location-resources"
                    />
                    <p className="text-sm text-muted-foreground">
                      Natural resources, valuable materials, or exploitable assets
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isLoading} data-testid="button-save-location">
              {isLoading ? "Saving..." : "Save Location"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}