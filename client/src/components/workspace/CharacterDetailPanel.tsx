import { useState, useEffect } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Loader2, Eye, Heart, Zap, MapPin, Clock, X, Edit, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { AutocompleteField } from '@/components/ui/autocomplete-field';
import type { Character } from '@shared/schema';

interface CharacterDetailPanelProps {
  characterId: string;
  panelId: string;
  onClose?: () => void;
  isCompact?: boolean;
}

// Enhanced form schema that covers all character fields across all tabs
const characterFormSchema = z.object({
  // Identity tab fields
  givenName: z.string().optional().default(''),
  familyName: z.string().optional().default(''),
  nickname: z.string().optional().default(''),
  age: z.string().optional().default(''),
  gender: z.string().optional().default(''),
  species: z.string().optional().default(''),
  pronouns: z.string().optional().default(''),
  occupation: z.string().optional().default(''),
  currentLocation: z.string().optional().default(''),
  
  // Appearance tab fields
  height: z.string().optional().default(''),
  build: z.string().optional().default(''),
  hairColor: z.string().optional().default(''),
  eyeColor: z.string().optional().default(''),
  skinTone: z.string().optional().default(''),
  facialFeatures: z.string().optional().default(''),
  identifyingMarks: z.string().optional().default(''),
  description: z.string().optional().default(''),
  
  // Mind/Personality tab fields
  personality: z.string().optional().default(''),
  motivation: z.string().optional().default(''),
  flaws: z.string().optional().default(''),
  strengths: z.string().optional().default(''),
  
  // Background tab fields
  backstory: z.string().optional().default(''),
  placeOfBirth: z.string().optional().default(''),
  education: z.string().optional().default(''),
  workHistory: z.string().optional().default(''),
});

type CharacterFormData = z.infer<typeof characterFormSchema>;

// Helper function to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const CharacterDetailPanel = ({ characterId, panelId, onClose, isCompact = false }: CharacterDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const removePanel = useWorkspaceStore(state => state.removePanel);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ['/api/characters', characterId],
    enabled: !!characterId
  });

  // Query to resolve profession UUID to name if occupation contains a UUID
  const professionId = character?.occupation && isUUID(character.occupation) ? character.occupation : null;
  const { data: professionName } = useQuery({
    queryKey: ['/api/professions', professionId],
    queryFn: async () => {
      if (!professionId) return null;
      const response = await fetch(`/api/professions/${professionId}`, {
        headers: { 'X-User-Id': 'demo-user' }
      });
      if (!response.ok) return null;
      const profession = await response.json();
      return profession.name;
    },
    enabled: !!professionId,
  });

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(characterFormSchema),
    defaultValues: {
      // Identity tab defaults
      givenName: '',
      familyName: '',
      nickname: '',
      age: '',
      gender: '',
      species: '',
      pronouns: '',
      occupation: '',
      currentLocation: '',
      
      // Appearance tab defaults
      height: '',
      build: '',
      hairColor: '',
      eyeColor: '',
      skinTone: '',
      facialFeatures: '',
      identifyingMarks: '',
      description: '',
      
      // Mind/Personality tab defaults
      personality: '',
      motivation: '',
      flaws: '',
      strengths: '',
      
      // Background tab defaults
      backstory: '',
      placeOfBirth: '',
      education: '',
      workHistory: '',
    }
  });

  // Reset form when character data loads - use resolved profession name if available
  React.useEffect(() => {
    if (character) {
      form.reset({
        // Identity tab fields
        givenName: character.givenName || '',
        familyName: character.familyName || '',
        nickname: character.nickname || '',
        age: character.age?.toString() || '',
        gender: character.gender || '',
        species: character.species || '',
        pronouns: character.pronouns || '',
        occupation: professionName || character.occupation || '',
        currentLocation: character.currentLocation || '',
        
        // Appearance tab fields
        height: character.height || '',
        build: character.build || '',
        hairColor: character.hairColor || '',
        eyeColor: character.eyeColor || '',
        skinTone: character.skinTone || '',
        facialFeatures: character.facialFeatures || '',
        identifyingMarks: character.identifyingMarks || '',
        description: character.physicalDescription || '',
        
        // Mind/Personality tab fields
        personality: Array.isArray(character.personality) ? character.personality.join(', ') : character.personality || '',
        motivation: character.motivation || '',
        flaws: character.flaw || '',
        strengths: character.strengths || character.strength || '', // Handle both possible field names
        
        // Background tab fields
        backstory: character.backstory || '',
        placeOfBirth: character.placeOfBirth || '',
        education: character.education || '',
        workHistory: character.workHistory || '',
      });
    }
  }, [character, professionName, form]);

  const updateCharacterMutation = useMutation({
    mutationFn: async (data: CharacterFormData) => {
      // Convert form data to backend format - handle all tabs
      const updateData: Partial<Character> = {
        // Identity fields
        givenName: data.givenName || null,
        familyName: data.familyName || null,
        nickname: data.nickname || null,
        age: data.age ? parseInt(data.age) || null : null,
        gender: data.gender || null,
        species: data.species || null,
        pronouns: data.pronouns || null,
        occupation: data.occupation || null,
        currentLocation: data.currentLocation || null,
        
        // Appearance fields
        height: data.height || null,
        build: data.build || null,
        hairColor: data.hairColor || null,
        eyeColor: data.eyeColor || null,
        skinTone: data.skinTone || null,
        facialFeatures: data.facialFeatures || null,
        identifyingMarks: data.identifyingMarks || null,
        physicalDescription: data.description || null,
        
        // Mind/Personality fields
        personality: data.personality ? data.personality.split(',').map(s => s.trim()).filter(Boolean) : null,
        motivation: data.motivation || null,
        flaw: data.flaws || null,
        strengths: data.strengths || null,
        
        // Background fields
        backstory: data.backstory || null,
        placeOfBirth: data.placeOfBirth || null,
        education: data.education || null,
        workHistory: data.workHistory || null,
      };
      
      return apiRequest('PATCH', `/api/characters/${characterId}`, updateData);
    },
    onSuccess: () => {
      toast({ title: 'Character updated successfully' });
      // Invalidate all character queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      queryClient.refetchQueries({ queryKey: ['/api/characters', characterId] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: 'Error updating character', description: error.message, variant: 'destructive' });
    }
  });

  const onSubmit = (data: CharacterFormData) => {
    updateCharacterMutation.mutate(data);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing and reset form to current character values
      if (character) {
        form.reset({
          // Identity tab fields
          givenName: character.givenName || '',
          familyName: character.familyName || '',
          nickname: character.nickname || '',
          age: character.age?.toString() || '',
          gender: character.gender || '',
          species: character.species || '',
          pronouns: character.pronouns || '',
          occupation: professionName || character.occupation || '',
          currentLocation: character.currentLocation || '',
          
          // Appearance tab fields
          height: character.height || '',
          build: character.build || '',
          hairColor: character.hairColor || '',
          eyeColor: character.eyeColor || '',
          skinTone: character.skinTone || '',
          facialFeatures: character.facialFeatures || '',
          identifyingMarks: character.identifyingMarks || '',
          description: character.physicalDescription || '',
          
          // Mind/Personality tab fields
          personality: Array.isArray(character.personality) ? character.personality.join(', ') : character.personality || '',
          motivation: character.motivation || '',
          flaws: character.flaw || '',
          strengths: character.strengths || character.strength || '', // Handle both possible field names
          
          // Background tab fields
          backstory: character.backstory || '',
          placeOfBirth: character.placeOfBirth || '',
          education: character.education || '',
          workHistory: character.workHistory || '',
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleClose = () => {
    removePanel(panelId);
    onClose?.();
  };

  const getDisplayName = (character: Character) => {
    return [character.givenName, character.familyName].filter(Boolean).join(' ').trim() ||
           character.nickname ||
           character.honorificTitle ||
           'Untitled Character';
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !character) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Character Not Found</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The character could not be loaded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between flex-shrink-0 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">{getDisplayName(character)}</CardTitle>
          {character.occupation && (
            <p className="text-xs text-muted-foreground">
              {professionName || character.occupation}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditToggle}
            disabled={updateCharacterMutation.isPending}
            data-testid="button-edit-character"
          >
            {isEditing ? <X className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
          </Button>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateCharacterMutation.isPending}
              data-testid="button-save-character"
            >
              <Save className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-panel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto">
        <Tabs defaultValue="identity" className="h-full">
          <TabsList className="grid w-full grid-cols-4 mb-3">
            <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs">Appearance</TabsTrigger>
            <TabsTrigger value="personality" className="text-xs">Mind</TabsTrigger>
            <TabsTrigger value="background" className="text-xs">Background</TabsTrigger>
          </TabsList>
          
          <TabsContent value="identity" className="space-y-3">
            {isEditing ? (
              <Form {...form}>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="givenName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Given Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="familyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Family Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Age</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Gender</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="species"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Species</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pronouns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Pronouns</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nickname</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-7 text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Occupation</FormLabel>
                      <FormControl>
                        <AutocompleteField
                          value={field.value}
                          onChange={field.onChange}
                          contentType="profession"
                          placeholder="Search or create profession..."
                          className="h-7 text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Current Location</FormLabel>
                      <FormControl>
                        <AutocompleteField
                          value={field.value}
                          onChange={field.onChange}
                          contentType="location"
                          placeholder="Search or create location..."
                          className="h-7 text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {character.age && (
                    <div>
                      <span className="font-medium">Age:</span> {character.age}
                    </div>
                  )}
                  {character.gender && (
                    <div>
                      <span className="font-medium">Gender:</span> {character.gender}
                    </div>
                  )}
                  {character.species && (
                    <div>
                      <span className="font-medium">Species:</span> {character.species}
                    </div>
                  )}
                  {character.pronouns && (
                    <div>
                      <span className="font-medium">Pronouns:</span> {character.pronouns}
                    </div>
                  )}
                </div>
                
                {character.nickname && (
                  <div className="text-xs">
                    <span className="font-medium">Nickname:</span> {character.nickname}
                  </div>
                )}
                
                {character.currentLocation && (
                  <div className="text-xs">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    <span className="font-medium">Location:</span> {character.currentLocation}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-3">
            {isEditing ? (
              <Form {...form}>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Height</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="build"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Build</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hairColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Hair Color</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="eyeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Eye Color</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skinTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Skin Tone</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="facialFeatures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Facial Features</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-7 text-xs" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="identifyingMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Identifying Marks</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-7 text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Physical Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {character.height && (
                    <div>
                      <span className="font-medium">Height:</span> {character.height}
                    </div>
                  )}
                  {character.build && (
                    <div>
                      <span className="font-medium">Build:</span> {character.build}
                    </div>
                  )}
                  {character.hairColor && (
                    <div>
                      <span className="font-medium">Hair:</span> {character.hairColor}
                    </div>
                  )}
                  {character.eyeColor && (
                    <div>
                      <span className="font-medium">Eyes:</span> {character.eyeColor}
                    </div>
                  )}
                  {character.skinTone && (
                    <div>
                      <span className="font-medium">Skin:</span> {character.skinTone}
                    </div>
                  )}
                  {character.facialFeatures && (
                    <div>
                      <span className="font-medium">Facial Features:</span> {character.facialFeatures}
                    </div>
                  )}
                  {character.identifyingMarks && (
                    <div>
                      <span className="font-medium">Identifying Marks:</span> {character.identifyingMarks}
                    </div>
                  )}
                </div>
                
                {character.physicalDescription && (
                  <div className="text-xs">
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-muted-foreground">{character.physicalDescription}</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="personality" className="space-y-3">
            {isEditing ? (
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Personality Traits</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-7 text-xs" placeholder="List traits separated by commas" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Motivation</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flaws"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Flaws</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strengths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Strengths</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            ) : (
              <>
                {character.personality && character.personality.length > 0 && (
                  <div>
                    <span className="font-medium text-xs">Traits:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {character.personality.map((trait, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {character.motivation && (
                  <div className="text-xs">
                    <Heart className="h-3 w-3 inline mr-1" />
                    <span className="font-medium">Motivation:</span>
                    <p className="mt-1 text-muted-foreground">{character.motivation}</p>
                  </div>
                )}
                
                {character.flaw && (
                  <div className="text-xs">
                    <span className="font-medium">Flaw:</span>
                    <p className="mt-1 text-muted-foreground">{character.flaw}</p>
                  </div>
                )}
                
                {(character.strengths || character.strength) && (
                  <div className="text-xs">
                    <Zap className="h-3 w-3 inline mr-1" />
                    <span className="font-medium">Strength:</span>
                    <p className="mt-1 text-muted-foreground">{character.strengths || character.strength}</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="background" className="space-y-3">
            {isEditing ? (
              <Form {...form}>
                <FormField
                  control={form.control}
                  name="backstory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Backstory</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Place of Birth</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-7 text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Education</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Work History</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="text-xs" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </Form>
            ) : (
              <>
                {character.backstory && (
                  <div className="text-xs">
                    <Clock className="h-3 w-3 inline mr-1" />
                    <span className="font-medium">Backstory:</span>
                    <p className="mt-1 text-muted-foreground">{character.backstory}</p>
                  </div>
                )}
                
                {character.placeOfBirth && (
                  <div className="text-xs">
                    <span className="font-medium">Birthplace:</span> {character.placeOfBirth}
                  </div>
                )}
                
                {character.education && (
                  <div className="text-xs">
                    <span className="font-medium">Education:</span>
                    <p className="mt-1 text-muted-foreground">{character.education}</p>
                  </div>
                )}
                
                {character.workHistory && (
                  <div className="text-xs">
                    <span className="font-medium">Work History:</span>
                    <p className="mt-1 text-muted-foreground">{character.workHistory}</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterDetailPanel;