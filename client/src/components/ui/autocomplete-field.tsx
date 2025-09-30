import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotebookStore } from "@/stores/notebookStore";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
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

// Helper function to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
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
  const { activeNotebookId } = useNotebookStore();

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
        name: contentType === 'character' 
          ? `${item.givenName || ''}${item.familyName ? ' ' + item.familyName : ''}`.trim() || item.nickname || 'Unnamed Character'
          : item.name,
        type: item.locationType || item.occupation || item.religionType || item.traditionType || item.languageFamily || item.organizationType || item.speciesType || item.cultureType || item.treeType || item.timelineType || item.significance || item.mapType || item.musicalStyle || item.danceStyle || item.lawType || item.policyType || item.potionType || contentType,
      }));
    },
    enabled: true,
  });

  // Query to resolve IDs to names for display (for professions and species with UUID values)
  const currentValueIds = currentValues.filter(val => isUUID(val));
  const { data: resolvedNames = {} } = useQuery({
    queryKey: [`/api/${apiEndpoint}/resolve`, currentValueIds],
    queryFn: async () => {
      if (currentValueIds.length === 0 || (contentType !== 'profession' && contentType !== 'species')) return {};
      
      const nameMap: { [id: string]: string } = {};
      
      // Fetch details for each UUID
      for (const id of currentValueIds) {
        try {
          const response = await fetch(`/api/${apiEndpoint}/${id}`, {
            headers: {
              'X-User-Id': 'demo-user'
            }
          });
          if (response.ok) {
            const item = await response.json();
            nameMap[id] = item.name;
          }
        } catch (error) {
          console.warn('Failed to resolve ID to name:', id, error);
        }
      }
      
      return nameMap;
    },
    enabled: currentValueIds.length > 0 && (contentType === 'profession' || contentType === 'species'),
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
          payload = { ...payload, organizationType: "guild", purpose: "General organization", influence: "local", description: `Auto-created organization: ${name}` };
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
        case "profession":
          payload = { 
            ...payload, 
            professionType: "general", 
            description: `Auto-created profession: ${name}`,
            skillsRequired: [],
            responsibilities: "Various duties related to " + name.toLowerCase(),
            workEnvironment: "Varies",
            socialStatus: "middle",
            riskLevel: "low",
            physicalDemands: "Moderate",
            mentalDemands: "Moderate",
            commonTools: [],
            relatedProfessions: [],
            seasonalWork: false
          };
          break;
        default:
          payload = { ...payload, description: `Auto-created ${contentType}: ${name}` };
      }
      
      // Add notebookId to payload - required for all content creation
      if (activeNotebookId) {
        payload.notebookId = activeNotebookId;
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
    onSuccess: async (newItem) => {
      // Invalidate queries to refresh the search results
      queryClient.invalidateQueries({ queryKey: [`/api/${apiEndpoint}`] });
      
      // Save the newly created item to the notebook's saved_items
      if (activeNotebookId && newItem.id) {
        try {
          await apiRequest('POST', '/api/saved-items', {
            itemType: contentType,
            itemId: newItem.id,
            notebookId: activeNotebookId,
            itemData: newItem
          });
          
          // Invalidate saved items queries so notebook view refreshes
          queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
        } catch (error) {
          console.warn('Failed to save new item to notebook:', error);
          // Don't block the user flow if saving fails
        }
      }
      
      // Add the new item to current selection
      const newValue = multiple 
        ? [...currentValues, contentType === "profession" ? newItem.id : newItem.name]
        : contentType === "profession" ? newItem.id : newItem.name;
      onChange(newValue);
      setSearchValue("");
      setOpen(false);
    },
  });

  const handleSelect = (itemName: string) => {
    // Clear search value first to reset UI state
    setSearchValue("");
    
    if (multiple) {
      if (contentType === "profession") {
        // For professions in multiple mode, work with IDs
        const selectedItem = items.find((item: AutocompleteOption) => item.name === itemName);
        const itemId = selectedItem ? selectedItem.id : itemName;
        
        if (currentValues.includes(itemId)) {
          // Remove if already selected
          onChange(currentValues.filter(v => v !== itemId));
        } else {
          // Add to selection
          onChange([...currentValues, itemId]);
        }
      } else {
        // For other content types, use names
        if (currentValues.includes(itemName)) {
          // Remove if already selected
          onChange(currentValues.filter(v => v !== itemName));
        } else {
          // Add to selection
          onChange([...currentValues, itemName]);
        }
      }
    } else {
      // For location-type, use the value instead of label if available
      if (contentType === "location-type" && options) {
        const selectedOption = options.find(opt => opt.label === itemName);
        onChange(selectedOption ? selectedOption.value : itemName);
      } else if (contentType === "profession" || contentType === "species") {
        // For professions and species, store the ID but display the name
        const selectedItem = items.find((item: AutocompleteOption) => item.name === itemName);
        const newValue = selectedItem ? selectedItem.id : itemName;
        onChange(newValue);
      } else {
        onChange(itemName);
      }
      setOpen(false);
    }
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

  // Helper function to get display name for a value
  const getDisplayName = (val: string) => {
    if ((contentType === 'profession' || contentType === 'species') && isUUID(val)) {
      // Try resolved names cache first
      if (resolvedNames[val]) {
        return resolvedNames[val];
      }
      
      // Fall back to items array for newly selected items
      const item = items.find((item: AutocompleteOption) => item.id === val);
      if (item) {
        return item.name;
      }
      
      return val;
    }
    return val;
  };

  // Filter out already selected items - need to handle both names and IDs
  const availableItems = (items || []).filter((item: AutocompleteOption) => {
    if (!item || !item.name) return false;
    
    // For professions and species, check against both names and resolved IDs
    if (contentType === 'profession' || contentType === 'species') {
      return !currentValues.includes(item.name) && !currentValues.includes(item.id);
    };
    
    return !currentValues.includes(item.name);
  });

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
              {getDisplayName(itemName)}
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
                ? getDisplayName(currentValues[0])
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