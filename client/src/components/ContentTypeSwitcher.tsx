import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CONTENT_TYPES } from "@/config/content-types";

interface ContentTypeSwitcherProps {
  savedItemId: string;
  currentType: string;
  notebookId: string;
  onSuccess?: () => void;
}

export function ContentTypeSwitcher({
  savedItemId,
  currentType,
  notebookId,
  onSuccess
}: ContentTypeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateTypeMutation = useMutation({
    mutationFn: async (newType: string) => {
      return await apiRequest("PATCH", `/api/saved-items/${savedItemId}/type`, {
        newItemType: newType
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items", user?.id, notebookId] });
      toast({
        title: "Type updated",
        description: "Content type has been changed successfully",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTypeChange = (newType: string) => {
    if (newType === currentType) return;
    updateTypeMutation.mutate(newType);
    setIsOpen(false);
  };

  const groupedTypes = CONTENT_TYPES.filter(type => type.id !== currentType)
    .reduce((acc, type) => {
      if (!acc[type.category]) {
        acc[type.category] = [];
      }
      acc[type.category].push(type);
      return acc;
    }, {} as Record<string, typeof CONTENT_TYPES>);

  return (
    <Select
      open={isOpen}
      onOpenChange={setIsOpen}
      onValueChange={handleTypeChange}
      disabled={updateTypeMutation.isPending}
    >
      <SelectTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={updateTypeMutation.isPending}
          data-testid={`button-change-type-${savedItemId}`}
        >
          <>
            {updateTypeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeftRight className="h-4 w-4" />
            )}
            <span className="ml-2">Change Type</span>
          </>
        </Button>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {Object.entries(groupedTypes).map(([category, types]) => (
          <SelectGroup key={category}>
            <SelectLabel>{category}</SelectLabel>
            {types.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem
                  key={type.id}
                  value={type.id}
                  data-testid={`option-type-${type.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{type.name}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
