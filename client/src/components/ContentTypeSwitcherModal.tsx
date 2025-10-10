import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as SelectPrimitive from "@radix-ui/react-select";
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
import { CONTENT_TYPES } from "@/config/content-types";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ContentTypeSwitcherModalProps {
  savedItemId: string;
  currentType: string;
  notebookId: string;
  userId?: string;
  itemName?: string;
  itemDescription?: string;
}

export function ContentTypeSwitcherModal({
  savedItemId,
  currentType,
  notebookId,
  userId,
  itemName,
  itemDescription,
}: ContentTypeSwitcherModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(currentType);
  const { toast } = useToast();

  const updateTypeMutation = useMutation({
    mutationFn: async (newType: string) => {
      const response = await apiRequest(
        "PATCH",
        `/api/saved-items/${savedItemId}/type`,
        { newItemType: newType }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update item type");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/saved-items", userId, notebookId],
      });
      toast({
        title: "Type updated",
        description: `Item type changed successfully`,
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
  };

  const handleConfirm = () => {
    if (selectedType && selectedType !== currentType) {
      updateTypeMutation.mutate(selectedType);
    }
  };

  const groupedTypes = CONTENT_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof CONTENT_TYPES>);

  const currentTypeInfo = CONTENT_TYPES.find((t) => t.id === currentType);
  const selectedTypeInfo = CONTENT_TYPES.find((t) => t.id === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-testid={`button-change-type-${savedItemId}`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="ml-2">Change Type</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Item Type</DialogTitle>
          <DialogDescription className="space-y-1">
            {itemName && (
              <div className="font-medium text-foreground">
                {itemName}
              </div>
            )}
            {itemDescription && (
              <div className="text-sm line-clamp-2">
                {itemDescription}
              </div>
            )}
            <div className="text-sm">
              Current type: <span className="font-medium">{currentTypeInfo?.name || currentType}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Type</label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger data-testid="select-new-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] z-[300]" position="popper" sideOffset={5}>
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{category}</SelectLabel>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTypeInfo && selectedType !== currentType && (
            <div className="text-sm text-muted-foreground">
              This will change the item to: {selectedTypeInfo.name}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={updateTypeMutation.isPending}
            data-testid="button-cancel-type-change"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              updateTypeMutation.isPending || selectedType === currentType
            }
            data-testid="button-confirm-type-change"
          >
            {updateTypeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
