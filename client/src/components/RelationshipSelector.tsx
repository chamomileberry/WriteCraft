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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const RELATIONSHIP_TYPES = [
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'marriage', label: 'Marriage/Partner' },
  { value: 'adoption', label: 'Adoption' },
  { value: 'stepParent', label: 'Step Parent' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'custom', label: 'Custom' },
] as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[number]['value'];

interface RelationshipSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (relationshipType: RelationshipType, customLabel?: string) => void;
  sourceNodeLabel?: string;
  targetNodeLabel?: string;
}

export function RelationshipSelector({
  open,
  onOpenChange,
  onConfirm,
  sourceNodeLabel = 'Character A',
  targetNodeLabel = 'Character B',
}: RelationshipSelectorProps) {
  const [selectedType, setSelectedType] = useState<RelationshipType>('parent');
  const [customLabel, setCustomLabel] = useState('');

  const handleConfirm = () => {
    if (selectedType === 'custom' && !customLabel.trim()) {
      return; // Don't allow empty custom labels
    }
    onConfirm(selectedType, selectedType === 'custom' ? customLabel : undefined);
    // Reset state
    setSelectedType('parent');
    setCustomLabel('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setSelectedType('parent');
    setCustomLabel('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-relationship-selector">
        <DialogHeader>
          <DialogTitle>Add Relationship</DialogTitle>
          <DialogDescription>
            Define how <span className="font-medium">{sourceNodeLabel}</span> is related to{' '}
            <span className="font-medium">{targetNodeLabel}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="relationship-type">Relationship Type</Label>
            <Select 
              value={selectedType} 
              onValueChange={(value) => setSelectedType(value as RelationshipType)}
            >
              <SelectTrigger id="relationship-type" data-testid="select-relationship-type">
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={5}>
                {RELATIONSHIP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-label">Custom Label</Label>
              <Input
                id="custom-label"
                placeholder="e.g., Best Friend, Mentor, Rival"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                data-testid="input-custom-label"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel-relationship"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedType === 'custom' && !customLabel.trim()}
            data-testid="button-confirm-relationship"
          >
            Add Relationship
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
