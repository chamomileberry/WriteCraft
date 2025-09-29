import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCharacterSchema, type UpdateCharacter, type Character } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useNotebookStore } from "@/stores/notebookStore";
import { 
  ArrowLeft, 
  Save, 
  User, 
  FileText, 
  Heart, 
  MapPin, 
  Eye,
  Brain,
  Zap,
  Smile,
  Users,
  Home,
  MessageCircle,
  Star,
  Sparkles
} from "lucide-react";

export default function CharacterEditPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeNotebookId } = useNotebookStore();

  // Extract notebookId from query parameters, fallback to active notebook
  const urlParams = new URLSearchParams(window.location.search);
  const queryNotebookId = urlParams.get('notebookId');
  const notebookId = queryNotebookId || activeNotebookId;

  // Fetch character data - include notebookId in query parameters
  const { data: character, isLoading, error } = useQuery({
    queryKey: ['/api/characters', id, notebookId],
    queryFn: async () => {
      if (!notebookId) {
        throw new Error('No active notebook selected. Please create or select a notebook first.');
      }
      const response = await apiRequest('GET', `/api/characters/${id}?notebookId=${notebookId}`);
      return response.json();
    },
    enabled: !!id && !!notebookId,
  });

  // Create form-specific partial schema to handle tab-based fields
  const characterFormSchema = updateCharacterSchema.partial();
  
  // Form setup with all fields, converting null values to empty strings
  const form = useForm<UpdateCharacter>({
    resolver: zodResolver(characterFormSchema),
    shouldUnregister: false, // Preserve values across tabs
    defaultValues: {},
  });

  // Field generation state and mutation
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  
  const generateFieldMutation = useMutation({
    mutationFn: async ({ fieldName }: { fieldName: string }) => {
      // Get current form values to provide fresh context to AI
      const currentFormValues = form.getValues();
      const response = await apiRequest("POST", `/api/characters/${id}/generate-field`, { 
        fieldName,
        currentFormData: currentFormValues 
      });
      const data = await response.json();
      return data.content;
    },
    onSuccess: (content, { fieldName }) => {
      form.setValue(fieldName as keyof UpdateCharacter, content);
      toast({
        title: "Field Generated",
        description: `AI has generated content for ${fieldName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate field content. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setGeneratingField(null);
    },
  });

  const handleGenerateField = (fieldName: string) => {
    setGeneratingField(fieldName);
    generateFieldMutation.mutate({ fieldName });
  };

  // Generate button component
  const GenerateButton = ({ fieldName, className = "" }: { fieldName: string; className?: string }) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={`ml-2 ${className}`}
      onClick={() => handleGenerateField(fieldName)}
      disabled={generatingField === fieldName || !character}
      data-testid={`button-generate-${fieldName}`}
    >
      <Sparkles className="h-3 w-3 mr-1" />
      {generatingField === fieldName ? "Generating..." : "Generate with AI"}
    </Button>
  );

  // Update form values when character loads
  useEffect(() => {
    if (character) {
      const formData = Object.fromEntries(
        Object.entries(character).map(([key, value]) => {
          if (value === null || value === undefined) {
            // Handle arrays - these should be empty arrays when null
            if (key === 'personality' || key === 'languages' || key === 'skills' || 
                key === 'culturalElements' || key === 'notableFeatures') {
              return [key, []];
            }
            // Handle numbers - these should be undefined when null
            if (key === 'age' || key === 'weight') {
              return [key, undefined];
            }
            // Handle all other fields (strings/text) - convert null to empty string
            // This includes all the new prompt fields and other text fields
            return [key, ""];
          }
          // If value is an array but currently null, convert to empty array
          if (Array.isArray(value) && value === null) {
            return [key, []];
          }
          return [key, value];
        })
      );
      form.reset(formData);
    }
  }, [character, form]);

  // Update character mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateCharacter) => {
      if (!notebookId) {
        throw new Error('No notebook ID available for update');
      }
      const response = await fetch(`/api/characters/${id}?notebookId=${notebookId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update character');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Character Updated",
        description: "Your character has been successfully updated!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/characters', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items', 'null'] });
    },
    onError: (error) => {
      console.error('Error updating character:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update character. Please try again.",
        variant: "destructive",
      });
    },
  });


  const onSubmit = (data: UpdateCharacter) => {
    // Clean payload: remove empty/unchanged fields to avoid overwriting stored data
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        // Remove empty strings and undefined values
        if (value === "" || value === undefined) return false;
        
        // Remove empty arrays to prevent overwriting stored arrays
        if (Array.isArray(value) && value.length === 0) return false;
        
        // Keep all other valid values
        return true;
      })
    ) as UpdateCharacter;
    
    updateMutation.mutate(cleanedData);
  };

  // Handle missing notebook gracefully
  if (!notebookId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">No active notebook selected. Please create or select a notebook first.</p>
            <div className="flex justify-center">
              <Button onClick={() => setLocation('/notebook')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Notebooks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Failed to load character.'}</p>
            <div className="flex justify-center">
              <Button onClick={() => setLocation('/notebook')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">Character not found.</p>
            <div className="flex justify-center">
              <Button onClick={() => setLocation('/notebook')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Notebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={() => setLocation('/')}
            variant="outline"
            size="sm"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Character</h1>
            <p className="text-muted-foreground">Enhance and develop your character{character?.name ? `: ${character.name}` : ''}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 gap-1">
                <TabsTrigger value="basic" className="flex items-center gap-1 px-2 text-xs">
                  <User className="h-3 w-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="identity" className="flex items-center gap-1 px-2 text-xs">
                  <Heart className="h-3 w-3" />
                  Identity
                </TabsTrigger>
                <TabsTrigger value="physical" className="flex items-center gap-1 px-2 text-xs">
                  <Eye className="h-3 w-3" />
                  Physical
                </TabsTrigger>
                <TabsTrigger value="abilities" className="flex items-center gap-1 px-2 text-xs">
                  <Zap className="h-3 w-3" />
                  Abilities
                </TabsTrigger>
                <TabsTrigger value="personality" className="flex items-center gap-1 px-2 text-xs">
                  <Smile className="h-3 w-3" />
                  Personality
                </TabsTrigger>
                <TabsTrigger value="relationships" className="flex items-center gap-1 px-2 text-xs">
                  <Users className="h-3 w-3" />
                  Relations
                </TabsTrigger>
                <TabsTrigger value="background" className="flex items-center gap-1 px-2 text-xs">
                  <FileText className="h-3 w-3" />
                  Background
                </TabsTrigger>
                <TabsTrigger value="lifestyle" className="flex items-center gap-1 px-2 text-xs">
                  <Home className="h-3 w-3" />
                  Lifestyle
                </TabsTrigger>
                <TabsTrigger value="speech" className="flex items-center gap-1 px-2 text-xs">
                  <MessageCircle className="h-3 w-3" />
                  Speech
                </TabsTrigger>
                <TabsTrigger value="spiritual" className="flex items-center gap-1 px-2 text-xs">
                  <Star className="h-3 w-3" />
                  Spiritual
                </TabsTrigger>
                <TabsTrigger value="prompts" className="flex items-center gap-1 px-2 text-xs">
                  <Brain className="h-3 w-3" />
                  Prompts
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Core character details and personality traits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="givenName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Given Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="First name"
                                data-testid="input-character-given-name"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="familyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Family Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Last name"
                                data-testid="input-character-family-name"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Middle Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Middle name(s)"
                                data-testid="input-character-middle-name"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nickname</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="What friends call them"
                                data-testid="input-character-nickname"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="honorificTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Honorific Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Sir, Lady, Dr., etc."
                                data-testid="input-character-honorific-title"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Mr., Ms., Lord, etc."
                                data-testid="input-character-prefix"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="suffix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suffix</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Jr., Sr., III, etc."
                                data-testid="input-character-suffix"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maidenName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maiden Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Name before marriage"
                                data-testid="input-character-maiden-name"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25" 
                                data-testid="input-character-age"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              Occupation
                              <GenerateButton fieldName="occupation" />
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Character's job or role" 
                                data-testid="input-character-occupation"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
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
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-character-genre">
                                  <SelectValue placeholder="Select genre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fantasy">Fantasy</SelectItem>
                                <SelectItem value="science-fiction">Science Fiction</SelectItem>
                                <SelectItem value="mystery">Mystery</SelectItem>
                                <SelectItem value="romance">Romance</SelectItem>
                                <SelectItem value="thriller">Thriller</SelectItem>
                                <SelectItem value="literary">Literary Fiction</SelectItem>
                                <SelectItem value="historical">Historical Fiction</SelectItem>
                                <SelectItem value="contemporary">Contemporary</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="backstory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Backstory
                            <GenerateButton fieldName="backstory" />
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Character's background and history..."
                              className="min-h-[100px]"
                              data-testid="textarea-character-backstory"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="motivation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              Motivation
                              <GenerateButton fieldName="motivation" />
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What drives this character?"
                                data-testid="textarea-character-motivation"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="flaw"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center justify-between">
                              Character Flaw
                              <GenerateButton fieldName="flaw" />
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Character's main weakness or flaw"
                                data-testid="textarea-character-flaw"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="strength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Character Strength
                            <GenerateButton fieldName="strength" />
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Character's main strength or positive trait"
                              data-testid="textarea-character-strength"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Identity Tab */}
              <TabsContent value="identity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Identity & Gender
                    </CardTitle>
                    <CardDescription>
                      Character's gender identity, sexuality, and personal presentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sex</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Biological sex assigned at birth"
                                data-testid="input-character-sex"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="genderIdentity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender Identity</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="How the character identifies"
                                data-testid="input-character-gender-identity"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pronouns"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pronouns</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="they/them, she/her, he/him, etc."
                                data-testid="input-character-pronouns"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="species"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Species</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Human, elf, alien, etc."
                                data-testid="input-character-species"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="genderUnderstanding"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender Understanding</FormLabel>
                          <FormDescription>
                            How does the character understand gender and what is their gender identity?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the character's relationship with gender..."
                              className="min-h-[100px]"
                              data-testid="textarea-character-gender-understanding"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sexualOrientation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexual Orientation</FormLabel>
                          <FormDescription>
                            What is the character's sexual orientation?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the character's sexuality and romantic attractions..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-sexual-orientation"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Physical Attributes Tab */}
              <TabsContent value="physical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Physical Attributes
                    </CardTitle>
                    <CardDescription>
                      Detailed physical appearance and characteristics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="heightDetail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="5'8&quot;, 172cm, tall, etc."
                                data-testid="input-character-height-detail"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight/Build</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Average, slender, muscular, etc."
                                data-testid="input-character-weight"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skinTone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skin Tone</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Pale, olive, dark, etc."
                                data-testid="input-character-skin-tone"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eyeColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eye Color</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Brown, blue, green, hazel, etc."
                                data-testid="input-character-eye-color"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hairColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Color</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Black, blonde, red, etc."
                                data-testid="input-character-hair-color"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hairTexture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hair Texture</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Straight, wavy, curly, coily, etc."
                                data-testid="input-character-hair-texture"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="strikingFeatures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Most Striking Features
                            <GenerateButton fieldName="strikingFeatures" />
                          </FormLabel>
                          <FormDescription>
                            What are their most characteristic or striking features?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Piercing gaze, infectious smile, etc."
                              className="min-h-[80px]"
                              data-testid="textarea-character-striking-features"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marksPiercingsTattoos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Distinguishing Marks
                            <GenerateButton fieldName="marksPiercingsTattoos" />
                          </FormLabel>
                          <FormDescription>
                            Birthmarks, piercings, tattoos, or other identifying features
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Dragon tattoo on left arm, scar above left eyebrow, etc."
                              className="min-h-[80px]"
                              data-testid="textarea-character-marks-piercings-tattoos"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Family, relationships, and personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="currentLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Where they currently live"
                                data-testid="input-character-current-location"
                                {...field} 
                                value={field.value || ""} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="family"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family</FormLabel>
                          <FormDescription>
                            Describe their family relationships and dynamics
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Parents, siblings, children, etc."
                              className="min-h-[100px]"
                              data-testid="textarea-character-family"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="religiousBelief"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religious Beliefs</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Character's spiritual or religious views"
                              data-testid="textarea-character-religious-belief"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Character Development Tab */}
              <TabsContent value="development" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Character Development
                    </CardTitle>
                    <CardDescription>
                      Professional background, skills, and accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormDescription>
                            What is the character's education level and experience?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Educational background, training, certifications..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-education"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work History</FormLabel>
                          <FormDescription>
                            What is their work history and career progression?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Previous jobs, career changes, major projects..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-work-history"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accomplishments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Major Accomplishments</FormLabel>
                          <FormDescription>
                            What major accomplishments has this character achieved?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Awards, achievements, successful projects..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-accomplishments"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valuesEthicsMorals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Values, Ethics & Morals</FormLabel>
                          <FormDescription>
                            What are the character's values, ethics, and morals?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Core beliefs, moral compass, ethical standards..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-values-ethics-morals"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Writing Prompts Tab */}
              <TabsContent value="prompts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Character Development Prompts
                    </CardTitle>
                    <CardDescription>
                      Detailed character exploration through guided questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="upbringing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Upbringing & Background
                            <GenerateButton fieldName="upbringing" />
                          </FormLabel>
                          <FormDescription>
                            What was their upbringing like? How did their childhood shape them?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe their childhood, formative experiences, family dynamics..."
                              className="min-h-[100px]"
                              data-testid="textarea-character-upbringing"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="negativeEvents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Negative Events & Trauma
                            <GenerateButton fieldName="negativeEvents" />
                          </FormLabel>
                          <FormDescription>
                            What negative events, failures, embarrassments, or traumas have impacted this character?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Difficult experiences that shaped their personality and worldview..."
                              className="min-h-[100px]"
                              data-testid="textarea-character-negative-events"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mentalHealth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Mental Health
                            <GenerateButton fieldName="mentalHealth" />
                          </FormLabel>
                          <FormDescription>
                            How would you describe the character's mental health and emotional wellbeing?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Mental state, emotional patterns, coping mechanisms..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-mental-health"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="intellectualTraits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Intellectual Traits
                            <GenerateButton fieldName="intellectualTraits" />
                          </FormLabel>
                          <FormDescription>
                            What are the character's intellectual traits and thinking patterns?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Learning style, problem-solving approach, areas of expertise..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-intellectual-traits"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="physicalCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Physical Condition
                            <GenerateButton fieldName="physicalCondition" />
                          </FormLabel>
                          <FormDescription>
                            How would you describe their physical condition in terms of fitness, health, and any conditions?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Fitness level, health status, physical limitations or abilities..."
                              className="min-h-[80px]"
                              data-testid="textarea-character-physical-condition"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Abilities & Skills Tab */}
              <TabsContent value="abilities" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Supernatural Abilities & Powers
                    </CardTitle>
                    <CardDescription>
                      Special abilities, powers, and extraordinary capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="supernaturalPowers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Supernatural or Extraordinary Powers
                            <GenerateButton fieldName="supernaturalPowers" />
                          </FormLabel>
                          <FormDescription>
                            Does the character have any supernatural or extraordinary powers, mutations, or special abilities?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe any supernatural powers, magical abilities, mutations, or extraordinary capabilities..."
                              className="min-h-[100px]"
                              data-testid="textarea-supernatural-powers"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mainSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Main Skills & Strengths
                            <GenerateButton fieldName="mainSkills" />
                          </FormLabel>
                          <FormDescription>
                            What are the character's main skills, strengths, positive character aspects, and proficiencies?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="List key skills, talents, competencies, and areas of expertise..."
                              className="min-h-[100px]"
                              data-testid="textarea-main-skills"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lackingSkills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Lacking Skills & Knowledge
                            <GenerateButton fieldName="lackingSkills" />
                          </FormLabel>
                          <FormDescription>
                            What skills or knowledge are they lacking? What areas do they struggle with?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Areas where they lack expertise, knowledge gaps, weak points..."
                              className="min-h-[80px]"
                              data-testid="textarea-lacking-skills"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="typicalAttire"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Typical Attire & Accessories
                            <GenerateButton fieldName="typicalAttire" />
                          </FormLabel>
                          <FormDescription>
                            What is the character's typical attire and accessories?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe their usual clothing style, favorite outfits, accessories..."
                              className="min-h-[80px]"
                              data-testid="textarea-typical-attire"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="keyEquipment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Key Equipment & Specialized Items
                            <GenerateButton fieldName="keyEquipment" />
                          </FormLabel>
                          <FormDescription>
                            Is there key equipment or specialized items used by the character?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Tools, weapons, specialized gear, important possessions..."
                              className="min-h-[80px]"
                              data-testid="textarea-key-equipment"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personality & Traits Tab */}
              <TabsContent value="personality" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smile className="h-5 w-5" />
                      Personality & Character Traits
                    </CardTitle>
                    <CardDescription>
                      Deep personality characteristics, flaws, and behavioral patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="characterFlaws"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Character Flaws & Vices
                            <GenerateButton fieldName="characterFlaws" />
                          </FormLabel>
                          <FormDescription>
                            What flaws do they have? Do they have any addictions, vices, defects, or secret beliefs?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Character flaws, addictions, bad habits, secret beliefs, moral weaknesses..."
                              className="min-h-[100px]"
                              data-testid="textarea-character-flaws"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="likes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Likes & Preferences
                            <GenerateButton fieldName="likes" />
                          </FormLabel>
                          <FormDescription>
                            What are the character's likes and preferences?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Things they enjoy, preferences, favorite activities, foods, music..."
                              className="min-h-[80px]"
                              data-testid="textarea-likes"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dislikes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Dislikes & Pet Peeves
                            <GenerateButton fieldName="dislikes" />
                          </FormLabel>
                          <FormDescription>
                            What are the character's dislikes and things that annoy them?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Things they dislike, pet peeves, triggers, aversions..."
                              className="min-h-[80px]"
                              data-testid="textarea-dislikes"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="behavioralTraits"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Behavioral Traits & Particularities
                            <GenerateButton fieldName="behavioralTraits" />
                          </FormLabel>
                          <FormDescription>
                            Do they have any unique behavioral traits or particularities?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Unique habits, quirks, behavioral patterns, strange behaviors..."
                              className="min-h-[80px]"
                              data-testid="textarea-behavioral-traits"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="charisma"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Charisma & Social Characteristics
                            <GenerateButton fieldName="charisma" />
                          </FormLabel>
                          <FormDescription>
                            How would you describe their charisma, confidence, ego, extroversion, etiquette and mannerisms?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Social skills, confidence level, charisma, ego, social mannerisms..."
                              className="min-h-[80px]"
                              data-testid="textarea-charisma"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="habitualGestures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Habitual Gestures & Mannerisms
                            <GenerateButton fieldName="habitualGestures" />
                          </FormLabel>
                          <FormDescription>
                            What are the habitual gestures, mannerisms, ways of speaking or behaving of the character?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Recurring gestures, nervous habits, speaking patterns, behavioral tics..."
                              className="min-h-[80px]"
                              data-testid="textarea-habitual-gestures"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Relationships & Social Tab */}
              <TabsContent value="relationships" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Relationships & Social Connections
                    </CardTitle>
                    <CardDescription>
                      Key relationships, leadership roles, and social connections
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="keyRelationships"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Key Relationships
                            <GenerateButton fieldName="keyRelationships" />
                          </FormLabel>
                          <FormDescription>
                            What are the character's key relationships, including allies, enemies, and familial ties?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Important relationships, family connections, close friends, romantic partners..."
                              className="min-h-[100px]"
                              data-testid="textarea-key-relationships"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Allies & Friends
                            <GenerateButton fieldName="allies" />
                          </FormLabel>
                          <FormDescription>
                            Who are their allies, friends, and trusted companions?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Close allies, trusted friends, mentors, supporters..."
                              className="min-h-[80px]"
                              data-testid="textarea-allies"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="enemies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Enemies & Rivals
                            <GenerateButton fieldName="enemies" />
                          </FormLabel>
                          <FormDescription>
                            Who are their enemies, rivals, or antagonists?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Enemies, rivals, people who oppose them, ongoing conflicts..."
                              className="min-h-[80px]"
                              data-testid="textarea-enemies"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="overseeingDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Leadership & Domain
                            <GenerateButton fieldName="overseeingDomain" />
                          </FormLabel>
                          <FormDescription>
                            Is this character overseeing or ruling over a domain or group of people? How long have they been in this position?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Leadership roles, domains ruled, groups managed, duration in position..."
                              className="min-h-[80px]"
                              data-testid="textarea-overseeing-domain"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Background & History Tab */}
              <TabsContent value="background" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Background & Legacy
                    </CardTitle>
                    <CardDescription>
                      Historical background, legacy, and economic status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="legacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Legacy & Influence
                            <GenerateButton fieldName="legacy" />
                          </FormLabel>
                          <FormDescription>
                            If the character is deceased, what influence have they had on the world and what is their legacy—how are they remembered by others?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Lasting impact, how they're remembered, influence on others or events..."
                              className="min-h-[100px]"
                              data-testid="textarea-legacy"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="wealthClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Wealth & Economic Status
                            <GenerateButton fieldName="wealthClass" />
                          </FormLabel>
                          <FormDescription>
                            How would you describe the wealth of this character in terms of class, dependencies, debts, funds, disposable income, assets and investments?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Economic class, income level, debts, assets, investments, financial situation..."
                              className="min-h-[100px]"
                              data-testid="textarea-wealth-class"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lifestyle & Preferences Tab */}
              <TabsContent value="lifestyle" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Lifestyle & Daily Life
                    </CardTitle>
                    <CardDescription>
                      Hobbies, interests, and daily life preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="hobbies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Hobbies & Interests
                            <GenerateButton fieldName="hobbies" />
                          </FormLabel>
                          <FormDescription>
                            What hobbies, interests, and activities does the character enjoy?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Hobbies, pastimes, recreational activities, interests, passions..."
                              className="min-h-[80px]"
                              data-testid="textarea-hobbies"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pets & Animal Companions</FormLabel>
                          <FormDescription>
                            Does the character have any pets or animal companions?
                          </FormDescription>
                          <FormControl>
                            <Input 
                              placeholder="Pet names and types, animal companions..."
                              data-testid="input-pets"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hygieneValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Hygiene & Self-Care
                            <GenerateButton fieldName="hygieneValue" />
                          </FormLabel>
                          <FormDescription>
                            How much does the character value hygiene and self-care?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Approach to personal hygiene, grooming habits, self-care routines..."
                              className="min-h-[60px]"
                              data-testid="textarea-hygiene-value"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Speech & Communication Tab */}
              <TabsContent value="speech" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Speech & Communication
                    </CardTitle>
                    <CardDescription>
                      Speech patterns, communication style, and verbal characteristics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="famousQuotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Famous Quotes & Catchphrases
                            <GenerateButton fieldName="famousQuotes" />
                          </FormLabel>
                          <FormDescription>
                            Does the character have any famous quotes or catchphrases?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Memorable quotes, catchphrases, signature sayings..."
                              className="min-h-[80px]"
                              data-testid="textarea-famous-quotes"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="speechParticularities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Speech Characteristics
                            <GenerateButton fieldName="speechParticularities" />
                          </FormLabel>
                          <FormDescription>
                            Are there any particularities in terms of the character's speech, tone of voice, pitch, accent, dialect, impediments, catch phrases, common phrases, compliments, insults, greetings, farewell, swearing or metaphors?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Speech patterns, accent, dialect, voice characteristics, verbal habits..."
                              className="min-h-[120px]"
                              data-testid="textarea-speech-particularities"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Spiritual & Beliefs Tab */}
              <TabsContent value="spiritual" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Spiritual & Religious Views
                    </CardTitle>
                    <CardDescription>
                      Religious beliefs, spiritual practices, and philosophical views
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="religiousViews"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Religious Views & Beliefs
                            <GenerateButton fieldName="religiousViews" />
                          </FormLabel>
                          <FormDescription>
                            What are the character's religious views and spiritual practices?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Religious beliefs, faith, spiritual philosophy, relationship with divinity..."
                              className="min-h-[100px]"
                              data-testid="textarea-religious-views"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="spiritualPractices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            Spiritual Practices & Rituals
                            <GenerateButton fieldName="spiritualPractices" />
                          </FormLabel>
                          <FormDescription>
                            What spiritual practices, rituals, or ceremonies do they participate in?
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Prayer habits, meditation, rituals, spiritual disciplines, religious observances..."
                              className="min-h-[80px]"
                              data-testid="textarea-spiritual-practices"
                              {...field} 
                              value={field.value || ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/')}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-save-character"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save Character'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}