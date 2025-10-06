import { useQuery } from '@tanstack/react-query';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';

interface Character {
  id: string;
  givenName: string | null;
  familyName: string | null;
  middleName: string | null;
  nickname: string | null;
  imageUrl: string | null;
  dateOfBirth: string | null;
  dateOfDeath: string | null;
  notebookId: string;
}

interface CharacterGalleryProps {
  notebookId: string;
  existingMembers?: any[];
}

export function CharacterGallery({ notebookId, existingMembers = [] }: CharacterGalleryProps) {
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters', notebookId],
    queryFn: async () => {
      const response = await fetch(`/api/characters?notebookId=${notebookId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch characters');
      return response.json();
    },
    enabled: !!notebookId
  });

  const getDisplayName = (character: Character): string => {
    if (character.nickname) return character.nickname;
    
    const parts = [character.givenName, character.middleName, character.familyName].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    
    return 'Unnamed Character';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="h-32 border-t bg-card/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading characters...</p>
      </div>
    );
  }

  // Filter out characters that are already in the tree
  const existingCharacterIds = new Set(
    existingMembers
      .filter(member => member.characterId)
      .map(member => member.characterId)
  );
  
  const availableCharacters = characters.filter(
    character => !existingCharacterIds.has(character.id)
  );

  if (characters.length === 0) {
    return (
      <div className="h-32 border-t bg-card/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No characters in this notebook. Create some characters to add them to your family tree.</p>
      </div>
    );
  }

  if (availableCharacters.length === 0) {
    return (
      <div className="h-32 border-t bg-card/50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">All characters from this notebook have been added to the tree.</p>
      </div>
    );
  }

  return (
    <div className="h-32 border-t bg-card/50 p-2" data-testid="character-gallery">
      <p className="text-xs font-medium text-muted-foreground mb-2 px-2">Characters</p>
      <ScrollArea className="h-20">
        <div className="flex gap-2 pb-2">
          {availableCharacters.map((character) => {
            const displayName = getDisplayName(character);
            const initials = getInitials(displayName);
            
            const handleDragStart = (e: React.DragEvent) => {
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData('application/json', JSON.stringify({
                type: 'character',
                character: character
              }));
            };
            
            return (
              <Card
                key={character.id}
                draggable
                onDragStart={handleDragStart}
                className="flex-shrink-0 w-16 p-2 flex flex-col items-center gap-1 hover-elevate cursor-grab active:cursor-grabbing"
                data-testid={`character-card-${character.id}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={character.imageUrl || undefined} alt={displayName} />
                  <AvatarFallback>
                    {character.imageUrl ? initials : <User className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs text-center line-clamp-1 w-full" title={displayName}>
                  {displayName}
                </p>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
