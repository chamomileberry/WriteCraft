import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ExternalLink, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { FamilyTreeMember } from '@shared/schema';

type FamilyTreeMemberWithCharacter = FamilyTreeMember & {
  character?: {
    id: string;
    givenName: string | null;
    familyName: string | null;
    middleName: string | null;
    nickname: string | null;
    imageUrl: string | null;
    dateOfBirth: string | null;
    dateOfDeath: string | null;
  } | null;
};

interface MemberEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: FamilyTreeMemberWithCharacter | null;
  notebookId: string;
  onSave: (memberId: string, updates: {
    inlineName?: string;
    inlineDateOfBirth?: string | null;
    inlineDateOfDeath?: string | null;
  }) => void;
  isLoading?: boolean;
}

export function MemberEditDialog({ 
  open, 
  onOpenChange, 
  member,
  notebookId,
  onSave,
  isLoading 
}: MemberEditDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Inline member fields
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');

  // Character fields (for character-based members)
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [charDateOfBirth, setCharDateOfBirth] = useState('');
  const [charDateOfDeath, setCharDateOfDeath] = useState('');

  // Fetch full character data if character-based
  const { data: fullCharacter, isLoading: characterLoading } = useQuery({
    queryKey: ['/api/characters', member?.characterId, { notebookId }],
    queryFn: () => fetch(`/api/characters/${member?.characterId}?notebookId=${notebookId}`).then(r => r.json()),
    enabled: !!member?.characterId && !!notebookId && open,
  });

  useEffect(() => {
    if (member) {
      // If member has character data, use that
      if (member.character) {
        const charName = member.character.nickname || 
          [member.character.givenName, member.character.familyName].filter(Boolean).join(' ') || 
          'Unnamed Character';
        setName(charName);
        setDateOfBirth(member.character.dateOfBirth || '');
        setDateOfDeath(member.character.dateOfDeath || '');
      } else {
        // Use inline data
        setName(member.inlineName || '');
        setDateOfBirth(member.inlineDateOfBirth || '');
        setDateOfDeath(member.inlineDateOfDeath || '');
      }
    }
  }, [member]);

  // Update character fields when full character data loads
  useEffect(() => {
    if (fullCharacter) {
      setGivenName(fullCharacter.givenName || '');
      setFamilyName(fullCharacter.familyName || '');
      setMiddleName(fullCharacter.middleName || '');
      setNickname(fullCharacter.nickname || '');
      setImageUrl(fullCharacter.imageUrl || '');
      setCharDateOfBirth(fullCharacter.dateOfBirth || '');
      setCharDateOfDeath(fullCharacter.dateOfDeath || '');
    }
  }, [fullCharacter]);

  // Mutation to update character
  const updateCharacterMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest(`/api/characters/${member?.characterId}?notebookId=${notebookId}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters', member?.characterId] });
      queryClient.invalidateQueries({ queryKey: ['/api/family-trees'] });
      toast({
        title: 'Character updated',
        description: 'Character details have been updated successfully',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to update character',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    if (!member) return;
    
    if (member.characterId) {
      // Save character data
      updateCharacterMutation.mutate({
        givenName: givenName || null,
        familyName: familyName || null,
        middleName: middleName || null,
        nickname: nickname || null,
        imageUrl: imageUrl || null,
        dateOfBirth: charDateOfBirth || null,
        dateOfDeath: charDateOfDeath || null,
      });
    } else {
      // Save inline member data
      onSave(member.id, {
        inlineName: name || undefined,
        inlineDateOfBirth: dateOfBirth || null,
        inlineDateOfDeath: dateOfDeath || null,
      });
      onOpenChange(false);
    }
  };

  const handleEditCharacter = () => {
    if (member?.characterId) {
      onOpenChange(false);
      setLocation(`/characters/${member.characterId}`);
    }
  };

  const getDisplayImage = () => {
    if (member?.character?.imageUrl) return member.character.imageUrl;
    if (member?.inlineImageUrl) return member.inlineImageUrl;
    return null;
  };

  const getInitials = () => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!member) return null;

  const isCharacterBased = !!member.characterId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCharacterBased ? 'Edit Character Details' : 'Edit Member Details'}
          </DialogTitle>
        </DialogHeader>
        
        {isCharacterBased && characterLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={isCharacterBased ? (imageUrl || undefined) : (getDisplayImage() || undefined)} 
                  className="object-cover"
                />
                <AvatarFallback>
                  {getInitials() || <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
            </div>

            {isCharacterBased ? (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="dates">Life Events</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="givenName">Given Name</Label>
                      <Input
                        id="givenName"
                        value={givenName}
                        onChange={(e) => setGivenName(e.target.value)}
                        placeholder="First name"
                        data-testid="input-given-name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="familyName">Family Name</Label>
                      <Input
                        id="familyName"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        placeholder="Last name"
                        data-testid="input-family-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Middle name (optional)"
                      data-testid="input-middle-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Preferred name or nickname"
                      data-testid="input-nickname"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      data-testid="input-image-url"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="dates" className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="charDob">Date of Birth</Label>
                    <Input
                      id="charDob"
                      value={charDateOfBirth}
                      onChange={(e) => setCharDateOfBirth(e.target.value)}
                      placeholder="e.g., 1990-01-01"
                      data-testid="input-char-dob"
                    />
                  </div>

                  <div>
                    <Label htmlFor="charDod">Date of Death</Label>
                    <Input
                      id="charDod"
                      value={charDateOfDeath}
                      onChange={(e) => setCharDateOfDeath(e.target.value)}
                      placeholder="e.g., 2050-12-31 (leave empty if alive)"
                      data-testid="input-char-dod"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEditCharacter}
                      className="w-full"
                      data-testid="button-full-edit"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Full Character Editor
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name..."
                    data-testid="input-inline-name"
                  />
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    placeholder="e.g., 1990-01-01"
                    data-testid="input-inline-dob"
                  />
                </div>

                <div>
                  <Label htmlFor="dod">Date of Death</Label>
                  <Input
                    id="dod"
                    value={dateOfDeath}
                    onChange={(e) => setDateOfDeath(e.target.value)}
                    placeholder="e.g., 2050-12-31 (leave empty if alive)"
                    data-testid="input-inline-dod"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || updateCharacterMutation.isPending || characterLoading} 
            data-testid="button-save"
          >
            {(isLoading || updateCharacterMutation.isPending) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}