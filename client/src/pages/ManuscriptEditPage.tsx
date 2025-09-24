import { useLocation } from 'wouter';
import ManuscriptEditor from '@/components/ManuscriptEditor';
import Layout from '@/components/Layout';

interface ManuscriptEditPageProps {
  params: { id: string };
}

export default function ManuscriptEditPage({ params }: ManuscriptEditPageProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/manuscripts');
  };

  return (
    <Layout>
      <ManuscriptEditor 
        manuscriptId={params.id}
        onBack={handleBack}
      />
    </Layout>
  );
}