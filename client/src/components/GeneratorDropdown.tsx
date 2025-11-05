import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Wand2,
  User,
  MapPin,
  Bug,
  Leaf,
  FileText,
  Zap,
  Palette,
  Smile,
  Sparkles,
  Lightbulb,
  ChevronDown,
} from "lucide-react";
import { GeneratorType } from "./GeneratorModals";

interface GeneratorDropdownProps {
  onSelectGenerator: (generator: GeneratorType) => void;
}

export const GENERATORS = [
  { id: "name-generator" as const, label: "Name Generator", icon: Wand2 },
  {
    id: "character-generator" as const,
    label: "Character Generator",
    icon: User,
  },
  {
    id: "setting-generator" as const,
    label: "Setting Generator",
    icon: MapPin,
  },
  { id: "creature-generator" as const, label: "Creature Generator", icon: Bug },
  { id: "plant-generator" as const, label: "Plant Generator", icon: Leaf },
  { id: "plot-generator" as const, label: "Plot Generator", icon: FileText },
  { id: "conflict-generator" as const, label: "Conflict Generator", icon: Zap },
  { id: "theme-explorer" as const, label: "Theme Explorer", icon: Sparkles },
  { id: "mood-palette" as const, label: "Mood Palette", icon: Palette },
  {
    id: "description-generator" as const,
    label: "Description Generator",
    icon: Smile,
  },
  { id: "writing-prompts" as const, label: "Writing Prompts", icon: Lightbulb },
];

export function GeneratorDropdown({
  onSelectGenerator,
}: GeneratorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedButton && !clickedDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setIsOpen(!isOpen);
  };

  // Update position when scrolling or resizing
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDropdown();
    }
  };

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const dropdownContent =
    isOpen &&
    createPortal(
      <div
        ref={dropdownRef}
        className="fixed w-64 z-50"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
        }}
        aria-label="Generator options"
        onMouseEnter={() => {
          clearCloseTimeout();
          setIsOpen(true);
        }}
        onMouseLeave={() => scheduleClose()}
      >
        <div className="bg-popover border border-border rounded-md shadow-lg p-2">
          <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
            Quick Access
          </div>
          <div className="space-y-1">
            {GENERATORS.map((generator) => {
              const Icon = generator.icon;
              return (
                <button
                  key={generator.id}
                  onClick={() => {
                    onSelectGenerator(generator.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover-elevate active-elevate-2 rounded-md transition-colors"
                  data-testid={`dropdown-${generator.id}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{generator.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          clearCloseTimeout();
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + 8,
              left: rect.left,
            });
          }
          setIsOpen(true);
        }}
        onMouseLeave={() => scheduleClose()}
        className="flex items-center gap-1 text-foreground hover:text-primary transition-colors whitespace-nowrap"
        data-testid="link-generators"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Generators
        <ChevronDown
          className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {dropdownContent}
    </div>
  );
}
