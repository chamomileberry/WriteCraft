import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectCategorizedOptions {
  [category: string]: string[];
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  options?: SearchableSelectOption[];
  categorizedOptions?: SearchableSelectCategorizedOptions;
  formatLabel?: (value: string) => string;
  className?: string;
  testId?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyText = "No option found.",
  searchPlaceholder = "Search...",
  options = [],
  categorizedOptions = {},
  formatLabel,
  className = "w-full justify-between",
  testId,
  allowEmpty = false,
  emptyLabel = "Any"
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);

  const defaultFormatLabel = (val: string) => {
    if (!val) return "";
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const displayLabel = formatLabel || defaultFormatLabel;

  const displayValue = value ? displayLabel(value) : placeholder;

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
  };

  const renderFlatOptions = () => (
    <>
      {allowEmpty && (
        <CommandItem
          value=""
          onSelect={() => handleSelect("")}
          data-testid={testId ? `${testId}-any` : undefined}
        >
          <Check className={`mr-2 h-4 w-4 ${value === "" ? "opacity-100" : "opacity-0"}`} />
          {emptyLabel}
        </CommandItem>
      )}
      {options.map((option) => (
        <CommandItem
          key={option.value}
          value={option.value}
          onSelect={() => handleSelect(option.value)}
          data-testid={testId ? `${testId}-${option.value}` : undefined}
        >
          <Check className={`mr-2 h-4 w-4 ${value === option.value ? "opacity-100" : "opacity-0"}`} />
          {option.label}
        </CommandItem>
      ))}
    </>
  );

  const renderCategorizedOptions = () => (
    <>
      {allowEmpty && (
        <CommandItem
          value=""
          onSelect={() => handleSelect("")}
          data-testid={testId ? `${testId}-any` : undefined}
        >
          <Check className={`mr-2 h-4 w-4 ${value === "" ? "opacity-100" : "opacity-0"}`} />
          {emptyLabel}
        </CommandItem>
      )}
      {Object.entries(categorizedOptions).map(([category, items]) => (
        <CommandGroup key={category} heading={category}>
          {items.map((item) => (
            <CommandItem
              key={item}
              value={item}
              onSelect={() => handleSelect(item)}
              data-testid={testId ? `${testId}-${item}` : undefined}
            >
              <Check className={`mr-2 h-4 w-4 ${value === item ? "opacity-100" : "opacity-0"}`} />
              {displayLabel(item)}
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={className}
          data-testid={testId}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-60">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {Object.keys(categorizedOptions).length > 0 
              ? renderCategorizedOptions() 
              : renderFlatOptions()
            }
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}