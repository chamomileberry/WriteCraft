import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Search, Upload, Loader2, ExternalLink, ImageIcon, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  photos: PexelsPhoto[];
}

interface ImageSelectorProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onFileUpload?: (file: File) => Promise<string>;
  label?: string;
  showUploadTab?: boolean;
  showAIGenerateTab?: boolean;
  characterData?: any; // Character data to auto-generate image prompts
}

interface AIGenerateResponse {
  imageUrl: string;
  revisedPrompt?: string;
}

export function ImageSelector({ 
  value, 
  onChange, 
  onFileUpload,
  label = "Image",
  showUploadTab = true,
  showAIGenerateTab = true,
  characterData
}: ImageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>(
    showUploadTab ? "upload" : showAIGenerateTab ? "ai-generate" : "stock"
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiQuality, setAiQuality] = useState<"standard" | "hd">("standard");
  const [aiSize, setAiSize] = useState<"1024x1024" | "1024x1792" | "1792x1024">("1024x1024");
  const { toast } = useToast();

  // Fetch curated photos by default, or search results if query exists
  const { data: pexelsData, isLoading } = useQuery<PexelsResponse>({
    queryKey: activeSearch 
      ? [`/api/pexels/search?query=${encodeURIComponent(activeSearch)}`] 
      : ['/api/pexels/curated'],
    enabled: selectedTab === "stock",
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // AI image generation mutation
  const aiGenerateMutation = useMutation({
    mutationFn: async (params: { prompt: string; quality: string; size: string }) => {
      const response = await apiRequest("POST", "/api/ideogram/generate", params);
      return await response.json() as AIGenerateResponse;
    },
    onSuccess: (data: AIGenerateResponse) => {
      onChange(data.imageUrl);
      toast({
        title: "Image generated successfully",
        description: "Your AI-generated image is ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Build image prompt from character data
  const buildCharacterImagePrompt = () => {
    if (!characterData) return "";
    
    const parts: string[] = [];
    
    // Age and gender
    if (characterData.age) parts.push(`${characterData.age}-year-old`);
    if (characterData.gender) parts.push(characterData.gender);
    
    // Species/ethnicity
    if (characterData.species) parts.push(characterData.species);
    else if (characterData.ethnicity) parts.push(characterData.ethnicity);
    
    // Physical description
    const physicalTraits: string[] = [];
    if (characterData.hairColor && characterData.hairStyle) {
      physicalTraits.push(`${characterData.hairStyle} ${characterData.hairColor} hair`);
    } else if (characterData.hairColor) {
      physicalTraits.push(`${characterData.hairColor} hair`);
    }
    
    if (characterData.eyeColor) physicalTraits.push(`${characterData.eyeColor} eyes`);
    if (characterData.skinTone) physicalTraits.push(`${characterData.skinTone} skin`);
    if (characterData.build) physicalTraits.push(`${characterData.build} build`);
    
    if (characterData.height) {
      physicalTraits.push(`${characterData.height} tall`);
    }
    
    // Combine parts
    let prompt = parts.join(" ");
    if (physicalTraits.length > 0) {
      prompt += " with " + physicalTraits.join(", ");
    }
    
    // Add distinctive features
    if (characterData.facialFeatures) {
      prompt += `, ${characterData.facialFeatures}`;
    }
    if (characterData.identifyingMarks) {
      prompt += `, ${characterData.identifyingMarks}`;
    }
    
    return prompt.trim();
  };

  const handleUseCharacterDetails = () => {
    const generatedPrompt = buildCharacterImagePrompt();
    if (generatedPrompt) {
      setAiPrompt(generatedPrompt);
      toast({
        title: "Prompt generated",
        description: "Character details have been added to the prompt. You can edit it before generating.",
      });
    } else {
      toast({
        title: "No character details",
        description: "Fill in some character details first to auto-generate a prompt.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
    }
  };

  const handleSelectPexelsImage = (photo: PexelsPhoto) => {
    // Use the large version for quality
    onChange(photo.src.large);
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for the image you want to generate.",
        variant: "destructive",
      });
      return;
    }

    aiGenerateMutation.mutate({
      prompt: aiPrompt,
      quality: aiQuality,
      size: aiSize,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    if (onFileUpload) {
      setIsUploading(true);
      try {
        const url = await onFileUpload(file);
        onChange(url);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    } else {
      // If no upload handler, just create a local object URL for preview
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      return;
    }

    setUploadedFile(imageFile);
    
    if (onFileUpload) {
      setIsUploading(true);
      try {
        const url = await onFileUpload(imageFile);
        onChange(url);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    } else {
      const objectUrl = URL.createObjectURL(imageFile);
      onChange(objectUrl);
    }
  };

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full" style={{ 
          gridTemplateColumns: `repeat(${[showUploadTab, showAIGenerateTab, true].filter(Boolean).length}, 1fr)` 
        }}>
          {showUploadTab && (
            <TabsTrigger value="upload" data-testid="tab-upload-image">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
          )}
          {showAIGenerateTab && (
            <TabsTrigger value="ai-generate" data-testid="tab-ai-generate">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </TabsTrigger>
          )}
          <TabsTrigger value="stock" data-testid="tab-stock-images">
            <Search className="h-4 w-4 mr-2" />
            Stock Images
          </TabsTrigger>
        </TabsList>

        {showUploadTab && (
          <TabsContent value="upload" className="space-y-4">
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-muted/50"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                {isDragging ? 'Drop image here' : 'Drag and drop an image, or choose a file'}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-upload-file"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
                data-testid="input-upload-image"
              />
              {uploadedFile && !isUploading && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>
          </TabsContent>
        )}

        {showAIGenerateTab && (
          <TabsContent value="ai-generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="ai-prompt">Image Description</Label>
                  {characterData && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUseCharacterDetails}
                      disabled={aiGenerateMutation.isPending}
                      data-testid="button-use-character-details"
                    >
                      <Sparkles className="mr-2 h-3 w-3" />
                      Use Character Details
                    </Button>
                  )}
                </div>
                <Textarea
                  id="ai-prompt"
                  placeholder="Describe the image you want to generate... (e.g., 'A fantasy character portrait of an elven warrior with silver hair')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  disabled={aiGenerateMutation.isPending}
                  data-testid="textarea-ai-prompt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-quality">Quality</Label>
                  <Select
                    value={aiQuality}
                    onValueChange={(value) => setAiQuality(value as "standard" | "hd")}
                    disabled={aiGenerateMutation.isPending}
                  >
                    <SelectTrigger id="ai-quality" data-testid="select-ai-quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ai-size">Size</Label>
                  <Select
                    value={aiSize}
                    onValueChange={(value) => setAiSize(value as "1024x1024" | "1024x1792" | "1792x1024")}
                    disabled={aiGenerateMutation.isPending}
                  >
                    <SelectTrigger id="ai-size" data-testid="select-ai-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                      <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                      <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAIGenerate}
                disabled={aiGenerateMutation.isPending || !aiPrompt.trim()}
                className="w-full"
                data-testid="button-generate-ai-image"
              >
                {aiGenerateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating... (this may take 10-20 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        )}

        <TabsContent value="stock" className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
              data-testid="input-search-pexels"
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={handleSearch}
              data-testid="button-search-pexels"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pexelsData?.photos && pexelsData.photos.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {pexelsData.photos.map((photo) => (
                  <Card
                    key={photo.id}
                    className={`cursor-pointer hover-elevate overflow-hidden ${
                      value === photo.src.large ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectPexelsImage(photo)}
                    data-testid={`image-pexels-${photo.id}`}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={photo.src.small}
                        alt={photo.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Photos provided by{" "}
                <a
                  href="https://www.pexels.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline inline-flex items-center gap-1"
                >
                  Pexels
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {activeSearch ? 'No images found. Try a different search.' : 'Start searching for images'}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {value && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Selected image:</p>
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
