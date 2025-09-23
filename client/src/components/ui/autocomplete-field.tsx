import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";

export interface AutocompleteOption {
  id: string;
  name: string;
  type?: string;
}

interface AutocompleteFieldProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  contentType: "location" | "character";
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AutocompleteField({
  value,
  onChange,
  placeholder = "Search or create...",
  contentType,
  multiple = false,
  disabled = false,
  className,
}: AutocompleteFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  // Convert value to array for consistent handling
  const currentValues = multiple 
    ? Array.isArray(value) ? value : (value ? [value] : [])
    : (value ? [value as string] : []);

  // Search existing items
  const { data: items = [], isLoading } = useQuery({
    queryKey: [`/api/${contentType}s`, searchValue],
    queryFn: async () => {
      if (!searchValue.trim()) return [];
      const response = await fetch(`/api/${contentType}s?search=${encodeURIComponent(searchValue)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: { id: string; name: string; locationType?: string; occupation?: string }) => ({
        id: item.id,
        name: item.name,
        type: item.locationType || item.occupation || contentType,
      }));
    },
    enabled: searchValue.length > 0,
  });

  // Create new item mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = contentType === "location" 
        ? { name, locationType: "other", description: `Auto-created location: ${name}` }
        : { name, age: 25, occupation: "Unknown", genre: "Fantasy" };
      
      const response = await apiRequest("POST", `/api/${contentType}s`, payload);
      return await response.json();
    },
    onSuccess: (newItem) => {
      // Invalidate queries to refresh the search results
      queryClient.invalidateQueries({ queryKey: [`/api/${contentType}s`] });
      
      // Add the new item to current selection
      const newValue = multiple 
        ? [...currentValues, newItem.name]
        : newItem.name;
      onChange(newValue);
      setSearchValue("");
      setOpen(false);
    },
  });

  const handleSelect = (itemName: string) => {
    if (multiple) {
      if (currentValues.includes(itemName)) {
        // Remove if already selected
        onChange(currentValues.filter(v => v !== itemName));
      } else {
        // Add to selection
        onChange([...currentValues, itemName]);
      }
    } else {
      onChange(itemName);
      setOpen(false);
    }
    setSearchValue("");
  };

  const handleRemove = (itemName: string) => {
    if (multiple) {
      onChange(currentValues.filter(v => v !== itemName));
    } else {
      onChange("");
    }
  };

  const handleCreateNew = () => {
    if (searchValue.trim()) {
      createMutation.mutate(searchValue.trim());
    }
  };

  // Filter out already selected items
  const availableItems = items.filter((item: AutocompleteOption) => 
    !currentValues.includes(item.name)
  );

  // Check if search value exactly matches existing item
  const exactMatch = items.find((item: AutocompleteOption) => 
    item.name.toLowerCase() === searchValue.toLowerCase()
  );

  const showCreateOption = searchValue.trim() && !exactMatch;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Display selected items as badges (for multiple mode) */}
      {multiple && currentValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {currentValues.map((itemName) => (
            <Badge
              key={itemName}
              variant="secondary"
              className="text-sm"
              data-testid={`badge-${contentType}-${itemName}`}
            >
              {itemName}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemove(itemName)}
                data-testid={`button-remove-${itemName}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Autocomplete input */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            data-testid={`button-${contentType}-autocomplete`}
          >
            <span className="truncate">
              {!multiple && currentValues.length > 0 
                ? currentValues[0]
                : placeholder
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput
              placeholder={`Search ${contentType}s...`}
              value={searchValue}
              onValueChange={setSearchValue}
              data-testid={`input-search-${contentType}`}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : `No ${contentType}s found.`}
              </CommandEmpty>
              
              {availableItems.length > 0 && (
                <CommandGroup heading={`Existing ${contentType}s`}>
                  {availableItems.map((item: AutocompleteOption) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => handleSelect(item.name)}
                      data-testid={`option-${contentType}-${item.name}`}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentValues.includes(item.name) 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.type && (
                          <span className="text-xs text-muted-foreground">
                            {item.type}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showCreateOption && (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="text-primary"
                    disabled={createMutation.isPending}
                    data-testid={`option-create-${contentType}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createMutation.isPending 
                      ? `Creating ${searchValue}...`
                      : `Create "${searchValue}"`
                    }
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}