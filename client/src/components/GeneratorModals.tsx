import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CharacterGenerator from "@/components/CharacterGenerator";
import PlotGenerator from "@/components/PlotGenerator";
import SettingGenerator from "@/components/SettingGenerator";
import CreatureGenerator from "@/components/CreatureGenerator";
import NameGenerator from "@/components/NameGenerator";
import ConflictGenerator from "@/components/ConflictGenerator";
import ThemeExplorer from "@/components/ThemeExplorer";
import MoodPalette from "@/components/MoodPalette";
import PlantGenerator from "@/components/PlantGenerator";
import DescriptionGenerator from "@/components/DescriptionGenerator";

export type GeneratorType = 
  | 'character-generator'
  | 'plot-generator'
  | 'setting-generator'
  | 'creature-generator'
  | 'name-generator'
  | 'conflict-generator'
  | 'theme-explorer'
  | 'mood-palette'
  | 'plant-generator'
  | 'description-generator'
  | null;

interface GeneratorModalsProps {
  activeGenerator: GeneratorType;
  onClose: () => void;
}

const GENERATOR_TITLES: Record<Exclude<GeneratorType, null>, string> = {
  'character-generator': 'Character Generator',
  'plot-generator': 'Plot Generator',
  'setting-generator': 'Setting Generator',
  'creature-generator': 'Creature Generator',
  'name-generator': 'Name Generator',
  'conflict-generator': 'Conflict Generator',
  'theme-explorer': 'Theme Explorer',
  'mood-palette': 'Mood Palette',
  'plant-generator': 'Plant Generator',
  'description-generator': 'Description Generator',
};

export function GeneratorModals({ activeGenerator, onClose }: GeneratorModalsProps) {
  const renderGenerator = () => {
    switch (activeGenerator) {
      case 'character-generator':
        return <CharacterGenerator />;
      case 'plot-generator':
        return <PlotGenerator />;
      case 'setting-generator':
        return <SettingGenerator />;
      case 'creature-generator':
        return <CreatureGenerator />;
      case 'name-generator':
        return <NameGenerator />;
      case 'conflict-generator':
        return <ConflictGenerator />;
      case 'theme-explorer':
        return <ThemeExplorer />;
      case 'mood-palette':
        return <MoodPalette />;
      case 'plant-generator':
        return <PlantGenerator />;
      case 'description-generator':
        return <DescriptionGenerator />;
      default:
        return null;
    }
  };

  if (!activeGenerator) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{GENERATOR_TITLES[activeGenerator]}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {renderGenerator()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
