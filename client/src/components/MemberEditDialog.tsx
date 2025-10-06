import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';
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
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');

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

  const handleSave = () => {
    if (!member) return;
    
    // Only save if this is an inline member (no character ID)
    if (!member.characterId) {
      onSave(member.id, {
        inlineName: name || undefined,
        inlineDateOfBirth: dateOfBirth || null,
        inlineDateOfDeath: dateOfDeath || null,
      });
    }
    onOpenChange(false);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isCharacterBased ? 'View Character Details' : 'Edit Member Details'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={getDisplayImage() || undefined} />
              <AvatarFallback>
                {getInitials() || <User className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCharacterBased}
                placeholder="Enter name..."
              />
              {isCharacterBased && (
                <p className="text-xs text-muted-foreground mt-1">
                  This member is linked to a character. Edit the character to update details.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={isCharacterBased}
                placeholder="e.g., 1990-01-01"
              />
            </div>

            <div>
              <Label htmlFor="dod">Date of Death</Label>
              <Input
                id="dod"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                disabled={isCharacterBased}
                placeholder="e.g., 2050-12-31 (leave empty if alive)"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {isCharacterBased ? (
            <Button onClick={handleEditCharacter} data-testid="button-edit-character">
              <ExternalLink className="w-4 h-4 mr-2" />
              Edit Character
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isLoading} data-testid="button-save-member">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}