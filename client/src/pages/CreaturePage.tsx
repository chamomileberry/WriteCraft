import CreatureGenerator from "@/components/CreatureGenerator";

export default function CreaturePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <CreatureGenerator />
      </div>
    </div>
  );
}