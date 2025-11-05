import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, Plus } from "lucide-react";
import type { Character } from "@shared/schema";
import type { RelationshipType } from "./AddRelationshipDialog";

interface SelectCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationshipType: RelationshipType | null;
  characters: Character[];
  onSelectExisting: (characterId: string) => void;
  onCreateNew: (name: string) => void;
}

export function SelectCharacterDialog({
  open,
  onOpenChange,
  relationshipType,
  characters,
  onSelectExisting,
  onCreateNew,
}: SelectCharacterDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");

  const getRelationshipLabel = () => {
    switch (relationshipType) {
      case "parent":
        return "parent";
      case "spouse":
        return "spouse";
      case "child":
        return "child";
      case "sibling":
        return "sibling";
      default:
        return "person";
    }
  };

  const filteredCharacters = Array.isArray(characters)
    ? characters.filter((char) => {
        const fullName = [char.givenName, char.middleName, char.familyName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const nickname = char.nickname?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return fullName.includes(query) || nickname.includes(query);
      })
    : [];

  const getCharacterDisplayName = (char: Character) => {
    const parts = [char.givenName, char.middleName, char.familyName].filter(
      Boolean,
    );
    if (parts.length > 0) return parts.join(" ");
    if (char.nickname) return char.nickname;
    return "Unknown";
  };

  const getCharacterInitials = (char: Character) => {
    const displayName = getCharacterDisplayName(char);
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreateNew = () => {
    if (newName.trim()) {
      onCreateNew(newName.trim());
      setNewName("");
      setIsCreatingNew(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="dialog-select-character"
      >
        <DialogHeader>
          <DialogTitle>Select {getRelationshipLabel()}</DialogTitle>
          <DialogDescription>
            Choose an existing character or create a new one
          </DialogDescription>
        </DialogHeader>

        {!isCreatingNew ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search characters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-character"
              />
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredCharacters.map((char) => (
                  <Button
                    key={char.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 hover-elevate"
                    onClick={() => onSelectExisting(char.id)}
                    data-testid={`button-select-character-${char.id}`}
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage
                        src={char.imageUrl || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {getCharacterInitials(char) || (
                          <User className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="font-medium">
                        {getCharacterDisplayName(char)}
                      </div>
                      {char.dateOfBirth && (
                        <div className="text-xs text-muted-foreground">
                          b. {char.dateOfBirth}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
                {filteredCharacters.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No characters found
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full hover-elevate"
                onClick={() => setIsCreatingNew(true)}
                data-testid="button-create-new-character"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create new {getRelationshipLabel()}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Name</Label>
              <Input
                id="new-name"
                placeholder={`Enter ${getRelationshipLabel()} name`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateNew();
                  }
                }}
                data-testid="input-new-character-name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewName("");
                }}
                className="flex-1"
                data-testid="button-cancel-new"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNew}
                disabled={!newName.trim()}
                className="flex-1"
                data-testid="button-confirm-new"
              >
                Create
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
