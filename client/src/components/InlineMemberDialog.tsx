import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface InlineMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  isLoading?: boolean;
}

export function InlineMemberDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: InlineMemberDialogProps) {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) {
      return; // Don't allow empty names
    }
    onConfirm(name.trim());
    // Reset state
    setName('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-inline-member">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Create a new family member node without linking to an existing character.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Name</Label>
            <Input
              id="member-name"
              data-testid="input-member-name"
              placeholder="Enter name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            data-testid="button-cancel-inline-member"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!name.trim() || isLoading}
            data-testid="button-confirm-inline-member"
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
