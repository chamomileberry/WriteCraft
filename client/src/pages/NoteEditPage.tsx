import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ContentEditor from '@/components/ContentEditor';
import Layout from '@/components/Layout';

interface NoteEditPageProps {
  params: { id: string };
}

export default function NoteEditPage({ params }: NoteEditPageProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch the note to determine its parent context (manuscript or guide)
  const { data: note } = useQuery({
    queryKey: ['/api/notes', params.id],
    queryFn: () => fetch(`/api/notes/${params.id}`).then(res => res.json()),
    enabled: !!params.id,
  });

  const handleBack = () => {
    // Invalidate cache to ensure sidebar shows updated notes when we return
    if (note?.userId) {
      queryClient.invalidateQueries({ queryKey: ['/api/notes', note.userId, note.type] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders', note.userId] });
    }

    // Navigate back to the appropriate editor based on the note's parent context
    if (note?.manuscriptId) {
      setLocation(`/manuscripts/${note.manuscriptId}/edit`);
    } else if (note?.guideId) {
      setLocation(`/guides/${note.guideId}/edit`);
    } else {
      // Fallback to history.back() if we can't determine parent context
      window.history.back();
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentEditor 
          contentType="notes"
          contentId={params.id}
          onBack={handleBack}
        />
      </div>
    </Layout>
  );
}