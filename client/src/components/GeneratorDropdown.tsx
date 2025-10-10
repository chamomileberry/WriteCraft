import { useState, useRef, useEffect } from "react";
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
  ChevronDown
} from "lucide-react";
import { GeneratorType } from "./GeneratorModals";

interface GeneratorDropdownProps {
  onSelectGenerator: (generator: GeneratorType) => void;
}

export const GENERATORS = [
  { id: 'name-generator' as const, label: 'Name Generator', icon: Wand2 },
  { id: 'character-generator' as const, label: 'Character Generator', icon: User },
  { id: 'setting-generator' as const, label: 'Setting Generator', icon: MapPin },
  { id: 'creature-generator' as const, label: 'Creature Generator', icon: Bug },
  { id: 'plant-generator' as const, label: 'Plant Generator', icon: Leaf },
  { id: 'plot-generator' as const, label: 'Plot Generator', icon: FileText },
  { id: 'conflict-generator' as const, label: 'Conflict Generator', icon: Zap },
  { id: 'theme-explorer' as const, label: 'Theme Explorer', icon: Sparkles },
  { id: 'mood-palette' as const, label: 'Mood Palette', icon: Palette },
  { id: 'description-generator' as const, label: 'Description Generator', icon: Smile },
  { id: 'writing-prompts' as const, label: 'Writing Prompts', icon: Lightbulb },
];

export function GeneratorDropdown({ onSelectGenerator }: GeneratorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 text-foreground hover:text-primary transition-colors whitespace-nowrap" 
        data-testid="link-generators"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Generators
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 pt-2 w-64 z-50"
          aria-label="Generator options"
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
        </div>
      )}
    </div>
  );
}
