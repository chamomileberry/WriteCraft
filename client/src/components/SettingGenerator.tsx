import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Map, MapPin, Clock, Users, Copy, Heart, Loader2, Sparkles, Check, ChevronsUpDown } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Setting } from "@shared/schema";

// Genre categories - same as character generator
const GENRE_CATEGORIES = {
  "General Fiction": [
    "fiction", "drama", "literary fiction", "political fiction", "musical fiction", 
    "sports fiction", "suspense fiction"
  ],
  "Science Fiction": [
    "science fiction", "cyberpunk", "dystopian", "post-apocalyptic", "steampunk", 
    "dieselpunk", "nanopunk", "solarpunk", "atompunk", "clockpunk", "postcyberpunk", 
    "utopian", "comedy sci-fi", "feminist sci-fi", "gothic sci-fi", "climate fiction", 
    "parallel world sci-fi", "libertarian sci-fi", "mecha sci-fi", "military sci-fi", 
    "social sci-fi", "anthropological sci-fi", "space opera", "space western", 
    "subterranean sci-fi", "tech noir", "alien invasion", "scientific romance", 
    "dying earth", "quantum fiction"
  ],
  "Fantasy": [
    "fantasy", "contemporary fantasy", "cozy fantasy", "dark fantasy", "high fantasy", 
    "fantasy comedy", "gothic fantasy", "historical fantasy", "low fantasy", "mythpunk", 
    "mythic fantasy", "mythopoeia", "magic realism", "romantic fantasy", "science fantasy", 
    "supernatural fantasy", "heroic fantasy", "portal fantasy", "medieval fantasy", 
    "prehistoric fantasy"
  ],
  "Horror": [
    "horror", "comedy horror", "gothic horror", "zombie horror", "dark romanticism", 
    "cosmic horror", "werewolf fiction", "vampire literature", "psychological horror", 
    "techno-horror", "apocalyptic", "zombie apocalypse", "monster literature", "weird fiction"
  ],
  "Mystery & Crime": [
    "mystery", "crime fiction", "detective", "historical mystery", "noir", "cozy mystery", 
    "legal thriller", "caper", "spy fiction"
  ],
  "Thriller": [
    "thriller", "psychological thriller", "techno-thriller", "political thriller"
  ],
  "Romance": [
    "romance", "paranormal romance", "contemporary romance", "medical romance", 
    "thriller romance", "historical romance", "inspirational romance", "romantic suspense", 
    "western romance", "young adult romance", "chivalric romance"
  ],
  "Western": [
    "western", "horror western", "science fiction western", "weird western", "fantasy western"
  ],
  "Young Adult & New Adult": [
    "young adult", "new adult"
  ],
  "Historical": [
    "historical fiction", "prehistoric fiction", "medieval fiction"
  ],
  "Comedy": [
    "comedy", "tragic comedy", "burlesque"
  ],
  "Drama": [
    "tragedy", "melodrama"
  ],
  "Superhero": [
    "superhero fantasy", "cape punk", "heroic noir"
  ],
  "Speculative & Experimental": [
    "xenofiction", "alternative history", "slipstream", "postmodern", "conte", "pulp fiction"
  ],
  "Action & Adventure": [
    "action-adventure", "nautical"
  ]
};

// Updated setting type categories with all new additions
const SETTING_TYPE_CATEGORIES = {
  "Geographic Regions": [
    "world", "country", "state/province", "county", "city", "town", "village", 
    "settlement", "kingdom", "empire", "realm", "ghost town", "abandoned city", "lost city"
  ],
  "Natural Environments": [
    "forest", "mountain range", "desert", "field", "meadow", "river", "lake", "waterfall", 
    "oasis", "garden", "canyon", "ridge", "spring", "cliff", "crater", "ocean", "bay", 
    "beach", "island", "archipelagos", "cave", "lagoon", "national park", "reservoir", 
    "dunes", "valley", "rainforest", "savannah", "grassland", "bog", "swamp", "tar pit", 
    "marshland", "glacier", "hot springs", "geyser", "Everglades", "estuary", "cove", 
    "grove", "glen", "animal pasture", "trail", "causeway", "pond", "salt flats", 
    "tundra", "wasteland", "badlands", "wildlife reserve", "cavern", "lair"
  ],
  "Residential Buildings": [
    "house", "apartment", "condo", "cabin", "townhouse", "mansion", "cottage", "villa", 
    "apartment building", "condo building", "trailer", "camper van", "caravan"
  ],
  "Commercial Establishments": [
    "restaurant", "store", "mall", "bookstore", "department store", "hardware store", 
    "bank", "pharmacy", "bar", "tavern", "pub", "diner", "coffee shop", "fast food restaurant", 
    "juice bar", "karaoke bar", "lounge", "dance club", "brothel", "marketplace", 
    "farmer's market", "market stall", "food truck", "furniture store", "antique shop", 
    "gift shop", "toy store", "clothing store", "boutique", "consignment shop", "bodega", 
    "convenience store", "dollar store", "electronics store", "fabric store", "outlet", 
    "liquor store", "florist", "fish market", "food court", "deli", "butcher shop", 
    "bakery", "ice cream shop", "pizza shop", "sandwich shop", "game store", "gas station", 
    "mechanic shop", "car dealership", "car wash", "hobby store", "jewelry store", 
    "music store", "camera store", "candy shop", "emporium", "general store", "feed store", 
    "pet store", "outlet store", "drive-thru", "Internet cafe", "real estate agency", 
    "retailer", "sausage stand", "grocery store", "supermarket", "tailor", "tanning salon", 
    "tax advisor", "tea house", "tea room", "thrift store", "travel agency", "wig store", 
    "upholstery shop"
  ],
  "Public & Government Buildings": [
    "library", "community centre", "civic centre", "city hall", "government building", 
    "parliament building", "courthouse", "court room", "police station", "fire hall", 
    "fire department", "fire station", "post office", "embassy", "immigration centre", 
    "information centre", "convention centre", "print shop", "town square", "trade centre", 
    "forbidden city", "government agency", "intelligence agency", "news station"
  ],
  "Entertainment Venues": [
    "movie theatre", "cinema", "theatre", "drive-in theatre", "opera house", "arena", 
    "stadium", "aquarium", "arcade", "amusement park", "water park", "playground", 
    "carnival", "festival", "fair", "circus", "colosseum", "boardwalk", "casino", 
    "roller rink", "jazz club", "speak easy", "concert hall", "amphitheatre", "concert", 
    "music festival", "concession stand", "jousting arena", "gala", "rodeo"
  ],
  "Transportation & Infrastructure": [
    "airport", "terminal", "bus stop", "highway", "road", "street", "crescent", "bridge", 
    "pier", "harbour", "wharf", "marina", "garage", "parking garage", "railway", "subway", 
    "speedway", "arch", "gateway", "dam", "lighthouse", "tower", "clock tower", "quay", 
    "seaport", "walkway", "train station", "tram station", "truck stop", "union station"
  ],
  "Religious & Spiritual Buildings": [
    "church", "chapel", "cathedral", "mosque", "shrine", "pyramid", "monastery", "abbey"
  ],
  "Educational Institutions": [
    "school", "college", "university", "high school", "elementary school", "middle school", 
    "boarding school", "campus", "classroom", "academy"
  ],
  "Healthcare Facilities": [
    "hospital", "clinic", "medical centre", "infirmary", "emergency room", "hospital room", 
    "operating room", "doctor's office", "dentist", "optometrist", "chiropractor", 
    "orthodontist", "physiotherapist", "massage therapist", "wellness centre"
  ],
  "Sports & Recreation": [
    "gym", "pool", "racetrack", "sports field", "aquatic centre", "recreation centre", 
    "martial arts studio", "dance studio", "baseball diamond", "ice rink", "tennis court", 
    "basketball court", "ski hill", "lodge", "resort", "campground", "trailer park"
  ],
  "Industrial & Agricultural": [
    "factory", "warehouse", "farm", "farmhouse", "vineyard", "barn", "granary", "silo", 
    "mine", "quarry", "oil rig", "mill", "lumberyard", "dump", "recycling depot", 
    "junkyard", "abattoir", "sand pit", "gravel pit", "slaughter house", "ranch", 
    "corral", "bunkhouse"
  ],
  "Vehicles & Mobile Settings": [
    "space station", "rocket ship", "pirate ship", "caravan", "trailer", "camper van", 
    "food truck", "submarine", "naval ship", "house boat", "zeppelin"
  ],
  "Interior Spaces": [
    "room", "kitchen", "bedroom", "living room", "bathroom", "boardroom", "office", 
    "basement", "cellar", "balcony", "hall", "dining hall", "cafeteria", "dorm room", 
    "vault", "dungeon", "prison", "courtyard"
  ],
  "Personal Care & Services": [
    "salon", "barber's shop", "spa", "nail salon", "hair salon", "saloon", "bathhouse", "laundromat"
  ],
  "Cultural & Arts": [
    "museum", "art gallery", "gallery", "auditorium", "studio", "production studio", 
    "television set", "movie set", "recording studio", "radio station", "orchestra pit"
  ],
  "Military & Historical": [
    "castle", "barracks", "army base", "battlefield", "camp", "monument", "memorial", 
    "cemetery", "wall", "barrier", "tomb", "gravesite", "graveyard", "crypt", 
    "underground bunker", "nuclear bunker", "barricade", "military park"
  ],
  "Specialized Buildings": [
    "apothecary", "blacksmith forge", "crematorium", "morgue", "funeral home", "aviary", 
    "zoological park", "nursery", "space centre", "lawyer's chambers", "landmark", "hotel", 
    "hostel", "motel", "bed and breakfast", "inn", "bistro", "brewery", "palace", "sky deck", 
    "hangar", "storage facility", "rocket centre", "launchpad", "fishing hut", "watch tower", 
    "water tower", "research centre", "research lab", "nuclear power plant", "nuclear launch site", 
    "wax museum", "boathouse", "botanical gardens", "pavilion", "pergola", "pagoda", 
    "research station", "observatory", "treehouse"
  ],
  "Celestial & Fantastical": [
    "planet", "realm", "satellite", "star"
  ]
};

const ALL_GENRES = Object.values(GENRE_CATEGORIES).flat();
const ALL_SETTING_TYPES = Object.values(SETTING_TYPE_CATEGORIES).flat();

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
      const res = await apiRequest('POST', '/api/settings', setting);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Setting Saved!",
        description: "Your setting has been saved to your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: () => {
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
      const settingText = `Setting: ${generatedSetting.name}

Location: ${generatedSetting.location}
Time Period: ${generatedSetting.timePeriod}
Population: ${generatedSetting.population}
Climate: ${generatedSetting.climate}

Description:
${generatedSetting.description}

Atmosphere:
${generatedSetting.atmosphere}

Cultural Elements:
${generatedSetting.culturalElements.join(', ')}

Notable Features:
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
        <h1 className="text-4xl font-serif font-bold mb-4 text-foreground">Setting Generator</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create immersive worlds and locations for your stories. Generate detailed settings with atmosphere, culture, and unique features using AI.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Customize Your Setting</CardTitle>
          <CardDescription>
            Select a genre and setting type to generate a more targeted setting for your story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Genre Selection */}
            <div className="space-y-2">
              <Label htmlFor="genre-select">Genre (Optional)</Label>
              <Popover open={genreSearchOpen} onOpenChange={setGenreSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={genreSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-genre"
                  >
                    {selectedGenre && selectedGenre !== "any" ? selectedGenre : selectedGenre === "any" ? "Any Genre" : "Select a genre..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search genres..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No genre found.</CommandEmpty>
                      <CommandItem
                        value="any"
                        onSelect={() => {
                          setSelectedGenre("any");
                          setGenreSearchOpen(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedGenre === "any" ? "opacity-100" : "opacity-0"}`} />
                        Any Genre
                      </CommandItem>
                      {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                        <CommandGroup key={category} heading={category}>
                          {genres.map((genre) => (
                            <CommandItem
                              key={genre}
                              value={genre}
                              onSelect={() => {
                                setSelectedGenre(genre);
                                setGenreSearchOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedGenre === genre ? "opacity-100" : "opacity-0"}`} />
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
              <Label htmlFor="setting-type-select">Setting Type (Optional)</Label>
              <Popover open={settingTypeSearchOpen} onOpenChange={setSettingTypeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={settingTypeSearchOpen}
                    className="w-full justify-between"
                    data-testid="select-setting-type"
                  >
                    {selectedSettingType && selectedSettingType !== "any" ? selectedSettingType : selectedSettingType === "any" ? "Any Setting Type" : "Select a setting type..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search setting types..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No setting type found.</CommandEmpty>
                      <CommandItem
                        value="any"
                        onSelect={() => {
                          setSelectedSettingType("any");
                          setSettingTypeSearchOpen(false);
                        }}
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedSettingType === "any" ? "opacity-100" : "opacity-0"}`} />
                        Any Setting Type
                      </CommandItem>
                      {Object.entries(SETTING_TYPE_CATEGORIES).map(([category, types]) => (
                        <CommandGroup key={category} heading={category}>
                          {types.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                setSelectedSettingType(type);
                                setSettingTypeSearchOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selectedSettingType === type ? "opacity-100" : "opacity-0"}`} />
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
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mb-8">
        <Button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          size="lg"
          className="px-8 py-6 text-lg"
          data-testid="button-generate-setting"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Setting...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Setting
            </>
          )}
        </Button>
      </div>

      {generatedSetting && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2" data-testid="text-setting-name">
                  <Map className="h-6 w-6 text-primary" />
                  {generatedSetting.name}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {generatedSetting.description}
                </CardDescription>
                <div className="flex gap-2 mt-3">
                  {generatedSetting.genre && (
                    <Badge variant="outline" data-testid="badge-genre">
                      {generatedSetting.genre}
                    </Badge>
                  )}
                  {generatedSetting.settingType && (
                    <Badge variant="outline" data-testid="badge-setting-type">
                      {generatedSetting.settingType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Location:</span>
                  <span data-testid="text-setting-location">{generatedSetting.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Time Period:</span>
                  <span data-testid="text-setting-time-period">{generatedSetting.timePeriod}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Population:</span>
                  <span data-testid="text-setting-population">{generatedSetting.population}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Climate:</span>
                  <span data-testid="text-setting-climate">{generatedSetting.climate}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Atmosphere */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Atmosphere</h3>
              <p className="text-muted-foreground" data-testid="text-setting-atmosphere">
                {generatedSetting.atmosphere}
              </p>
            </div>

            <Separator />

            {/* Cultural Elements */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Cultural Elements</h3>
              <div className="flex flex-wrap gap-2">
                {generatedSetting.culturalElements.map((element: string, index: number) => (
                  <Badge key={index} variant="secondary" data-testid={`badge-cultural-element-${index}`}>
                    {element}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notable Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Notable Features</h3>
              <div className="space-y-2">
                {generatedSetting.notableFeatures.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span data-testid={`text-notable-feature-${index}`}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                variant="default"
                data-testid="button-save-setting"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Save Setting
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleCopy}
                variant="outline"
                data-testid="button-copy-setting"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!generatedSetting && (
        <Card className="text-center py-12">
          <CardContent>
            <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Create a Setting</h3>
            <p className="text-muted-foreground">
              Click the generate button to create a detailed world for your story
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}