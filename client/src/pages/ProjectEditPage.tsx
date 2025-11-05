import { useLocation } from "wouter";
import ProjectEditor from "@/components/ProjectEditor";
import Layout from "@/components/Layout";

interface ProjectEditPageProps {
  params: { id: string };
}

export default function ProjectEditPage({ params }: ProjectEditPageProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/projects");
  };

  return (
    <Layout>
      <ProjectEditor projectId={params.id} onBack={handleBack} />
    </Layout>
  );
}
