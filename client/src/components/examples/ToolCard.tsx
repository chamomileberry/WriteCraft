import ToolCard from '../ToolCard';
import { Users, BookOpen, Zap } from 'lucide-react';

export default function ToolCardExample() {
  return (
    <div className="grid md:grid-cols-3 gap-6 p-6">
      <ToolCard
        title="Character Generator"
        description="Create detailed, unique characters with backstories, traits, and motivations."
        icon={Users}
        category="Character Development"
        features={[
          "Randomized personality traits",
          "Background generator",
          "Motivation builder",
          "Relationship dynamics"
        ]}
        onUse={() => console.log('Character generator used')}
        isPopular={true}
      />
      
      <ToolCard
        title="Plot Generator"
        description="Generate compelling plot structures and story arcs for any genre."
        icon={BookOpen}
        category="Story Structure"
        features={[
          "Three-act structure",
          "Conflict scenarios",
          "Plot twist ideas",
          "Character arcs"
        ]}
        onUse={() => console.log('Plot generator used')}
      />
      
      <ToolCard
        title="Writing Prompts"
        description="Spark creativity with genre-specific prompts and story starters."
        icon={Zap}
        category="Inspiration"
        features={[
          "Genre-specific prompts",
          "Difficulty levels",
          "Daily challenges",
          "Custom themes"
        ]}
        onUse={() => console.log('Writing prompts used')}
        isPopular={true}
      />
    </div>
  );
}