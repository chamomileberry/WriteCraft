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

// Helper function to get correct API endpoint for content type
function getApiEndpoint(contentType: string): string {
  switch (contentType) {
    case 'family-tree': return 'family-trees';
    case 'ceremony': return 'ceremonies';
    case 'policy': return 'policies';
    case 'species': return 'species'; // species is already plural
    default: return `${contentType}s`;
  }
}

export interface AutocompleteOption {
  id: string;
  name: string;
  type?: string;
}

interface AutocompleteFieldProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  contentType: "location" | "character" | "religion" | "tradition" | "language" | "organization" | "species" | "culture" | "location-type" | "family-tree" | "timeline" | "ceremony" | "map" | "music" | "dance" | "law" | "policy" | "potion" | "profession";
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  options?: Array<{ value: string; label: string; icon?: any }>; // For static options like location types
}

export function AutocompleteField({
  value,
  onChange,
  placeholder = "Search or create...",
  contentType,
  multiple = false,
  disabled = false,
  className,
  options,
}: AutocompleteFieldProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const queryClient = useQueryClient();

  // Convert value to array for consistent handling
  const currentValues = multiple 
    ? Array.isArray(value) ? value : (value ? [value] : [])
    : (value ? [value as string] : []);

  // Search existing items (skip for static options like location-type)
  const apiEndpoint = getApiEndpoint(contentType);
  const { data: items = [], isLoading } = useQuery({
    queryKey: [`/api/${apiEndpoint}`, searchValue],
    queryFn: async () => {
      // Handle static options like location-type
      if (contentType === "location-type" && options) {
        const filteredOptions = searchValue.trim() 
          ? options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase()))
          : options;
        return filteredOptions.map(option => ({
          id: option.value,
          name: option.label,
          type: "location type",
        }));
      }
      
      // Build URL with search parameter only if search value exists
      const searchParam = searchValue.trim() ? `?search=${encodeURIComponent(searchValue)}` : '';
      const response = await fetch(`/api/${apiEndpoint}${searchParam}`, {
        headers: {
          'X-User-Id': 'demo-user' // TODO: Replace with actual user authentication
        }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.locationType || item.occupation || item.religionType || item.traditionType || item.languageFamily || item.organizationType || item.speciesType || item.cultureType || item.treeType || item.timelineType || item.significance || item.mapType || item.musicalStyle || item.danceStyle || item.lawType || item.policyType || item.potionType || contentType,
      }));
    },
    enabled: true,
  });

  // Create new item mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      // Handle static options like location-type - no creation needed
      if (contentType === "location-type") {
        return { id: name, name, type: "location type" };
      }
      
      let payload: any = { name, genre: "Fantasy" };
      
      switch (contentType) {
        case "location":
          payload = { ...payload, locationType: "other", description: `Auto-created location: ${name}` };
          break;
        case "character":
          payload = { ...payload, age: 25, occupation: "Unknown" };
          break;
        case "religion":
          payload = { ...payload, religionType: "other", domain: "Unknown", description: `Auto-created religion: ${name}` };
          break;
        case "tradition":
          payload = { ...payload, traditionType: "cultural", significance: "Unknown", description: `Auto-created tradition: ${name}` };
          break;
        case "language":
          payload = { ...payload, languageFamily: "Unknown", speakers: "Unknown", complexity: "Medium", description: `Auto-created language: ${name}` };
          break;
        case "organization":
          payload = { ...payload, organizationType: "guild", influence: "local", description: `Auto-created organization: ${name}` };
          break;
        case "species":
          payload = { ...payload, classification: "humanoid", habitat: "Various", intelligence: "Sentient", physicalDescription: `Auto-created species: ${name}`, behavior: "Neutral", diet: "Varied" };
          break;
        case "culture":
          payload = { ...payload, cultureType: "regional", influence: "moderate", description: `Auto-created culture: ${name}` };
          break;
        case "family-tree":
          payload = { ...payload, treeType: "lineage", rootPerson: "Unknown", currentStatus: "active", description: `Auto-created family tree: ${name}` };
          break;
        case "timeline":
          payload = { ...payload, timelineType: "historical", timeScale: "years", scope: "general", description: `Auto-created timeline: ${name}` };
          break;
        case "ceremony":
          payload = { ...payload, significance: "cultural", participants: "community", frequency: "annual", description: `Auto-created ceremony: ${name}` };
          break;
        case "map":
          payload = { ...payload, mapType: "regional", scale: "medium", style: "realistic", description: `Auto-created map: ${name}` };
          break;
        case "music":
          payload = { ...payload, difficulty: "intermediate", length: "3-5 minutes", musicalStyle: "traditional", description: `Auto-created music: ${name}` };
          break;
        case "dance":
          payload = { ...payload, difficulty: "beginner", duration: "5-10 minutes", danceStyle: "folk", description: `Auto-created dance: ${name}` };
          break;
        case "law":
          payload = { ...payload, lawType: "civil", jurisdiction: "local", enforcement: "moderate", description: `Auto-created law: ${name}` };
          break;
        case "policy":
          payload = { ...payload, policyType: "administrative", scope: "local", authority: "government", description: `Auto-created policy: ${name}` };
          break;
        case "potion":
          payload = { ...payload, potionType: "healing", rarity: "common", effects: ["healing"], description: `Auto-created potion: ${name}` };
          break;
        default:
          payload = { ...payload, description: `Auto-created ${contentType}: ${name}` };
      }
      
      // Add user context header for proper scoping
      const response = await fetch(`/api/${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'demo-user' // TODO: Replace with actual user authentication
        },
        body: JSON.stringify(payload)
      });
      return await response.json();
    },
    onSuccess: (newItem) => {
      // Invalidate queries to refresh the search results
      queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}`] });
      
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
      // For location-type, use the value instead of label if available
      if (contentType === "location-type" && options) {
        const selectedOption = options.find(opt => opt.label === itemName);
        onChange(selectedOption ? selectedOption.value : itemName);
      } else {
        onChange(itemName);
      }
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
  const availableItems = (items || []).filter((item: AutocompleteOption) => 
    item && item.name && !currentValues.includes(item.name)
  );

  // Check if search value exactly matches existing item
  const exactMatch = (items || []).find((item: AutocompleteOption) => 
    item && item.name && item.name.toLowerCase() === searchValue.toLowerCase()
  );

  // Don't show create option for static content types like location-type
  const showCreateOption = contentType !== "location-type" && (
    (searchValue.trim() && !exactMatch) || // Show when typing and no exact match
    (!searchValue.trim() && (items || []).length === 0) // Show when empty and no items exist
  );

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
                {isLoading ? "Searching..." : 
                  searchValue.trim() 
                    ? `No ${contentType}s match "${searchValue}".`
                    : `No ${contentType}s found. Type to create a new one.`
                }
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
                    disabled={createMutation.isPending || !searchValue.trim()}
                    data-testid={`option-create-${contentType}`}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createMutation.isPending 
                      ? `Creating ${searchValue}...`
                      : searchValue.trim()
                        ? `Create "${searchValue}"`
                        : `Type a name to create new ${contentType}`
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