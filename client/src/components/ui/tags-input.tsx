import { useState, useRef, forwardRef } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
}

export const TagsInput = forwardRef<HTMLDivElement, TagsInputProps>(
  (
    {
      value = [],
      onChange,
      onBlur,
      placeholder = "Type and press Enter to add tags...",
      className,
      disabled = false,
      maxTags,
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (tagText: string) => {
      const trimmedTag = tagText.trim();
      if (!trimmedTag) return;

      // Check if tag already exists (case insensitive)
      if (value.some((tag) => tag.toLowerCase() === trimmedTag.toLowerCase())) {
        setInputValue("");
        return;
      }

      // Check max tags limit
      if (maxTags && value.length >= maxTags) {
        setInputValue("");
        return;
      }

      const newTags = [...value, trimmedTag];
      onChange?.(newTags);
      setInputValue("");
    };

    const removeTag = (indexToRemove: number) => {
      const newTags = value.filter((_, index) => index !== indexToRemove);
      onChange?.(newTags);
    };

    const removeLastTag = () => {
      if (value.length > 0) {
        const newTags = value.slice(0, -1);
        onChange?.(newTags);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          e.preventDefault();
          addTag(inputValue);
          break;
        case "Backspace":
          if (inputValue === "" && value.length > 0) {
            e.preventDefault();
            removeLastTag();
          }
          break;
        case ",":
          e.preventDefault();
          addTag(inputValue);
          break;
        case "Tab":
          if (inputValue.trim()) {
            e.preventDefault();
            addTag(inputValue);
          }
          break;
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-10 p-2 border border-input rounded-md bg-background text-sm ring-offset-background transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onClick={handleContainerClick}
        data-testid="tags-input-container"
      >
        {/* Render existing tags */}
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="px-2 py-1 text-xs gap-1 hover-elevate"
            data-testid={`tag-${index}`}
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors"
                data-testid={`remove-tag-${index}`}
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Input for new tags */}
        {(!maxTags || value.length < maxTags) && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-24 border-0 p-0 h-auto bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            data-testid="tags-input-field"
          />
        )}

        {/* Helper text for max tags */}
        {maxTags && value.length >= maxTags && (
          <span className="text-xs text-muted-foreground">
            Maximum {maxTags} tags
          </span>
        )}
      </div>
    );
  },
);

TagsInput.displayName = "TagsInput";
