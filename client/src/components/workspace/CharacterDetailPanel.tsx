import { useState, useEffect } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Loader2, User, Eye, Heart, Zap, MapPin, Clock, X, Edit, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertCharacterSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { Character } from '@shared/schema';

interface CharacterDetailPanelProps {
  characterId: string;
  panelId: string;
  onClose?: () => void;
  isCompact?: boolean;
}

type CharacterFormData = z.infer<typeof insertCharacterSchema>;

const CharacterDetailPanel = ({ characterId, panelId, onClose, isCompact = false }: CharacterDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const removePanel = useWorkspaceStore(state => state.removePanel);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ['/api/characters', characterId],
    enabled: !!characterId
  });

  const form = useForm<CharacterFormData>({
    resolver: zodResolver(insertCharacterSchema),
    defaultValues: {
      givenName: character?.givenName || '',
      familyName: character?.familyName || '',
      nickname: character?.nickname || '',
      age: character?.age?.toString() || '',
      gender: character?.gender || '',
      species: character?.species || '',
      pronouns: character?.pronouns || '',
      occupation: character?.occupation || '',
      currentLocation: character?.currentLocation || '',
      description: character?.physicalDescription || '',
      backstory: character?.backstory || '',
      personality: Array.isArray(character?.personality) ? character.personality.join(', ') : character?.personality || '',
      motivation: character?.motivation || '',
      flaws: character?.flaw || '',
      strengths: character?.strengths || '',
    }
  });

  // Reset form when character data loads
  React.useEffect(() => {
    if (character) {
      form.reset({
        givenName: character.givenName || '',
        familyName: character.familyName || '',
        nickname: character.nickname || '',
        age: character.age?.toString() || '',
        gender: character.gender || '',
        species: character.species || '',
        pronouns: character.pronouns || '',
        occupation: character.occupation || '',
        currentLocation: character.currentLocation || '',
        description: character.physicalDescription || '',
        backstory: character.backstory || '',
        personality: Array.isArray(character.personality) ? character.personality.join(', ') : character.personality || '',
        motivation: character.motivation || '',
        flaws: character.flaw || '',
        strengths: character.strengths || '',
      });
    }
  }, [character, form]);

  const updateCharacterMutation = useMutation({
    mutationFn: async (data: CharacterFormData) => {
      return apiRequest('PATCH', `/api/characters/${characterId}`, data);
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
      // Cancel editing and reset form
      form.reset();
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
            <p className="text-xs text-muted-foreground">{character.occupation}</p>
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
                        <Input {...field} className="h-7 text-xs" />
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
                        <Input {...field} className="h-7 text-xs" />
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
            </div>
            
            {character.physicalDescription && (
              <div className="text-xs">
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-muted-foreground">{character.physicalDescription}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="personality" className="space-y-3">
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
            
            {character.strength && (
              <div className="text-xs">
                <Zap className="h-3 w-3 inline mr-1" />
                <span className="font-medium">Strength:</span>
                <p className="mt-1 text-muted-foreground">{character.strength}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="background" className="space-y-3">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CharacterDetailPanel;