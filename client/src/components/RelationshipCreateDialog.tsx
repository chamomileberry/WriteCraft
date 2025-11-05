import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TimelineEvent } from "@shared/schema";
import { Loader2 } from "lucide-react";

const relationshipFormSchema = z.object({
  toEventId: z.string().min(1, "Target event is required"),
  relationshipType: z.enum(["causes", "precedes", "concurrent", "related"]),
  description: z.string().nullable(),
});

type RelationshipFormData = z.infer<typeof relationshipFormSchema>;

interface RelationshipCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceEvent: TimelineEvent | null;
  availableEvents: TimelineEvent[];
  timelineId: string;
  notebookId: string;
}

export function RelationshipCreateDialog({
  open,
  onOpenChange,
  sourceEvent,
  availableEvents,
  timelineId,
  notebookId,
}: RelationshipCreateDialogProps) {
  const { toast } = useToast();

  const form = useForm<RelationshipFormData>({
    resolver: zodResolver(relationshipFormSchema),
    defaultValues: {
      toEventId: "",
      relationshipType: "related",
      description: null,
    },
  });

  // Reset form when dialog closes or source event changes
  useEffect(() => {
    if (open) {
      form.reset({
        toEventId: "",
        relationshipType: "related",
        description: null,
      });
    }
  }, [open, sourceEvent, form]);

  // Create relationship mutation
  const createMutation = useMutation({
    mutationFn: async (data: RelationshipFormData) => {
      const response = await apiRequest("POST", "/api/timeline-relationships", {
        timelineId,
        notebookId,
        fromEventId: sourceEvent?.id,
        ...data,
      });
      if (!response.ok) throw new Error("Failed to create relationship");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/timeline-relationships", timelineId, notebookId],
      });
      toast({
        title: "Success",
        description: "Relationship created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create relationship",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RelationshipFormData) => {
    createMutation.mutate(data);
  };

  // Filter out the source event from available targets
  const targetEvents = availableEvents.filter((e) => e.id !== sourceEvent?.id);

  const isLoading = createMutation.isPending;

  if (!sourceEvent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create Relationship</DialogTitle>
          <DialogDescription>
            Create a relationship from "{sourceEvent.title}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toEventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Event *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-target-event">
                        <SelectValue placeholder="Select target event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      className="z-[300]"
                      sideOffset={5}
                    >
                      {targetEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                      {targetEvents.length === 0 && (
                        <div className="p-2 text-sm text-muted-foreground">
                          No other events available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-relationship-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      className="z-[300]"
                      sideOffset={5}
                    >
                      <SelectItem value="causes">Causes</SelectItem>
                      <SelectItem value="precedes">Precedes</SelectItem>
                      <SelectItem value="concurrent">Concurrent</SelectItem>
                      <SelectItem value="related">Related</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="Optional description of the relationship"
                      {...field}
                      value={field.value || ""}
                      data-testid="input-relationship-description"
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
                data-testid="button-cancel-relationship"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || targetEvents.length === 0}
                data-testid="button-create-relationship"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Relationship
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
