import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Sparkles } from 'lucide-react';
import { type PremiumSample, isSampleLocked } from '@/lib/premiumSamples';
import type { SubscriptionTier } from '@shared/types/subscription';
import { useLocation } from 'wouter';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PremiumSampleCardProps {
  sample: PremiumSample;
  userTier: SubscriptionTier;
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  author: 'Author',
  professional: 'Professional',
  team: 'Team',
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: 'bg-muted text-muted-foreground',
  author: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  professional: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  team: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const QUALITY_LABELS = {
  basic: 'Basic Quality',
  enhanced: 'Enhanced',
  premium: 'Premium',
  elite: 'Elite',
};

const QUALITY_ICONS = {
  basic: 1,
  enhanced: 2,
  premium: 3,
  elite: 4,
};

export function PremiumSampleCard({ sample, userTier }: PremiumSampleCardProps) {
  const [, setLocation] = useLocation();
  const [showFullSample, setShowFullSample] = useState(false);
  const isLocked = isSampleLocked(sample, userTier);

  const handleViewSample = () => {
    if (isLocked) {
      setLocation('/pricing');
    } else {
      setShowFullSample(true);
    }
  };

  return (
    <>
      <Card
        className={`hover-elevate transition-all ${isLocked ? 'opacity-60' : ''}`}
        data-testid={`card-premium-sample-${sample.id}`}
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                {!isLocked && <Unlock className="h-4 w-4 text-primary" />}
                {sample.title}
              </CardTitle>
              <CardDescription className="mt-1">{sample.category}</CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={TIER_COLORS[sample.tier]}>
              {TIER_LABELS[sample.tier]} Tier
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {[...Array(QUALITY_ICONS[sample.quality])].map((_, i) => (
                <Sparkles key={i} className="h-3 w-3" />
              ))}
              {QUALITY_LABELS[sample.quality]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {isLocked ? 'Unlock this tier to see the full sample...' : sample.content.summary}
          </p>

          <Button
            variant={isLocked ? 'default' : 'outline'}
            className="w-full"
            onClick={handleViewSample}
            data-testid={`button-view-sample-${sample.id}`}
          >
            {isLocked ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Upgrade to View
              </>
            ) : (
              'View Full Sample'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Full Sample Dialog */}
      <Dialog open={showFullSample} onOpenChange={setShowFullSample}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{sample.title}</DialogTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className={TIER_COLORS[sample.tier]}>
                  {TIER_LABELS[sample.tier]}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {[...Array(QUALITY_ICONS[sample.quality])].map((_, i) => (
                    <Sparkles key={i} className="h-3 w-3" />
                  ))}
                </Badge>
              </div>
            </div>
            <DialogDescription>{sample.category} Sample</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-muted-foreground">{sample.content.summary}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Full Content</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">{sample.content.details}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                This is a {QUALITY_LABELS[sample.quality].toLowerCase()} sample showing what you can
                generate with {TIER_LABELS[sample.tier]} tier features.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
