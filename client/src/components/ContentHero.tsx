import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";

interface ContentHeroProps {
  imageUrl?: string | null;
  imageCaption?: string | null;
  altText?: string;
}

export function ContentHero({
  imageUrl,
  imageCaption,
  altText = "Content image",
}: ContentHeroProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <Card className="mb-6 overflow-hidden" data-testid="content-hero">
      <AspectRatio ratio={16 / 9}>
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-full object-cover"
          data-testid="content-hero-image"
        />
      </AspectRatio>
      {imageCaption && (
        <div
          className="p-4 text-sm text-muted-foreground"
          data-testid="content-hero-caption"
        >
          {imageCaption}
        </div>
      )}
    </Card>
  );
}
