import { useParams, useLocation } from "wouter";
import { useEffect } from "react";
import GuideEditor from "@/components/GuideEditor";
import Layout from "@/components/Layout";

export default function GuideEditPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  // Determine if this is a new guide or editing existing
  const isNewGuide = !id || id === "new";
  const guideId = id || "new";

  // Handle when a new guide is created
  const handleGuideCreated = (newGuideId: string) => {
    // Update the URL to reflect the new guide ID
    setLocation(`/guides/${newGuideId}/edit`);
  };

  const handleBack = () => {
    setLocation("/guides");
  };

  // Set page title for SEO
  useEffect(() => {
    document.title = isNewGuide
      ? "New Guide - Writing Tools Platform"
      : "Edit Guide - Writing Tools Platform";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        isNewGuide
          ? "Create a new writing guide to share your knowledge and expertise with other writers."
          : "Edit your writing guide to improve content and share better advice with fellow writers.",
      );
    }
  }, [isNewGuide]);

  return (
    <Layout>
      <GuideEditor
        guideId={guideId}
        onBack={handleBack}
        onGuideCreated={handleGuideCreated}
      />
    </Layout>
  );
}
