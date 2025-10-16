import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { TimelineEvent } from '@shared/schema';
import { insertTimelineEventSchema } from '@shared/schema';
import { Loader2 } from 'lucide-react';

// Extend the insert schema to omit fields managed separately
const eventFormSchema = insertTimelineEventSchema.omit({
  timelineId: true, // Passed separately in API call
  positionX: true, // Managed by canvas
  positionY: true, // Managed by canvas
  metadata: true, // Not needed in form
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timelineId: string;
  notebookId: string;
  event?: TimelineEvent | null;
}

export function EventEditDialog({
  open,
  onOpenChange,
  timelineId,
  notebookId,
  event,
}: EventEditDialogProps) {
  const { toast } = useToast();
  const isEditing = !!event;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: null,
      startDate: '',
      endDate: null,
      eventType: null,
      importance: 'moderate',
      category: null,
      color: null,
      icon: null,
      linkedContentId: null,
      linkedContentType: null,
    },
  });

  // Reset form when event changes or dialog opens
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || '',
        description: event.description || null,
        startDate: event.startDate || '',
        endDate: event.endDate || null,
        eventType: event.eventType || null,
        importance: (event.importance || 'moderate') as 'major' | 'moderate' | 'minor',
        category: event.category || null,
        color: event.color || null,
        icon: event.icon || null,
        linkedContentId: event.linkedContentId || null,
        linkedContentType: event.linkedContentType || null,
      });
    } else {
      form.reset({
        title: '',
        description: null,
        startDate: '',
        endDate: null,
        eventType: null,
        importance: 'moderate',
        category: null,
        color: null,
        icon: null,
        linkedContentId: null,
        linkedContentType: null,
      });
    }
  }, [event, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest('POST', '/api/timeline-events', {
        timelineId,
        notebookId,
        ...data,
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events', timelineId, notebookId] });
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      if (!event) throw new Error('No event to update');
      const response = await apiRequest('PATCH', `/api/timeline-events/${event.id}`, {
        timelineId,
        notebookId,
        ...data,
      });
      if (!response.ok) throw new Error('Failed to update event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeline-events', timelineId, notebookId] });
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the event details below'
              : 'Add a new event to your timeline'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} data-testid="input-event-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event description"
                      {...field}
                      value={field.value || ''}
                      data-testid="input-event-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1066 CE, Year 1, Day 5"
                        {...field}
                        data-testid="input-event-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional for range events"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-event-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-event-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[300]" sideOffset={5}>
                        <SelectItem value="battle">Battle</SelectItem>
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="birth">Birth</SelectItem>
                        <SelectItem value="death">Death</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="political">Political</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importance</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-event-importance">
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="z-[300]" sideOffset={5}>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Plot, Character Arc, World Events"
                      {...field}
                      value={field.value || ''}
                      data-testid="input-event-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                data-testid="button-cancel-event"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-save-event"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
