import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Crown } from "lucide-react";
import { Link } from "wouter";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  feature?: string;
}

export function UpgradePrompt({
  open,
  onOpenChange,
  title = "Upgrade Required",
  description,
  feature,
}: UpgradePromptProps) {
  const defaultDescription = feature
    ? `You've reached the limit for ${feature} on your current plan. Upgrade to unlock unlimited access.`
    : "Upgrade to a paid plan to access this feature and unlock unlimited creative potential.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <Link href="/pricing">
            <AlertDialogAction data-testid="button-view-plans-modal">
              View Plans
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
