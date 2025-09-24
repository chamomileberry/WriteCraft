import { useLocation } from 'wouter';
import ManuscriptEditor from '@/components/ManuscriptEditor';

interface ManuscriptEditPageProps {
  params: { id: string };
}

export default function ManuscriptEditPage({ params }: ManuscriptEditPageProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/manuscripts');
  };

  return (
    <div className="min-h-screen bg-background">
      <ManuscriptEditor 
        manuscriptId={params.id}
        onBack={handleBack}
      />
    </div>
  );
}