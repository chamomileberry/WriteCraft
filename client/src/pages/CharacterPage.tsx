import CharacterGenerator from "@/components/CharacterGenerator";

export default function CharacterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <CharacterGenerator />
      </div>
    </div>
  );
}