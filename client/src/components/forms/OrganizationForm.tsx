import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  insertOrganizationSchema,
  type InsertOrganization,
  type Organization,
} from "@shared/schema";
import {
  ORGANIZATION_TYPES,
  INFLUENCE_LEVELS,
  FORM_GENRE_OPTIONS,
} from "@/config/form-options";
import { useState } from "react";
import { z } from "zod";
import { Building, Star, Flag, Users, Globe, Handshake } from "lucide-react";

interface OrganizationFormProps {
  initialData?: Partial<Organization>;
  onSubmit: (data: InsertOrganization) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
}

// Constants moved to centralized config

// Dedicated form schema that extends the base schema for optional array fields
const organizationFormSchema = insertOrganizationSchema.extend({
  allies: insertOrganizationSchema.shape.allies.optional(),
  enemies: insertOrganizationSchema.shape.enemies.optional(),
});

// Helper function to generate default values from schema and initial data
const getOrganizationFormDefaults = (initialData?: Partial<Organization>) => {
  const defaults: Partial<InsertOrganization> = {};

  // Get all keys from the schema shape
  const schemaKeys = Object.keys(
    organizationFormSchema.shape,
  ) as (keyof InsertOrganization)[];

  schemaKeys.forEach((key) => {
    const initialValue = initialData?.[key as keyof Organization];

    // Set appropriate defaults based on field type
    switch (key) {
      case "allies":
      case "enemies":
        defaults[key] = Array.isArray(initialValue) ? initialValue : [];
        break;
      default:
        defaults[key] =
          typeof initialValue === "string" || typeof initialValue === "number"
            ? initialValue
            : "";
    }
  });

  return defaults;
};

export default function OrganizationForm({
  initialData,
  onSubmit,
  onGenerate,
  isLoading,
}: OrganizationFormProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<InsertOrganization>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: getOrganizationFormDefaults(initialData),
  });

  const handleSubmit = (data: InsertOrganization) => {
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Organization Editor</h1>
            <p className="text-muted-foreground">
              Create powerful factions and institutions for your world
            </p>
          </div>
        </div>

        {onGenerate && (
          <Button
            onClick={onGenerate}
            variant="outline"
            disabled={isLoading}
            data-testid="button-generate-organization"
          >
            <Star className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="influence">Influence</TabsTrigger>
              <TabsTrigger value="relations">Relations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Define the fundamental characteristics of your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter organization name..."
                              {...field}
                              value={field.value ?? ""}
                              data-testid="input-organization-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-organization-type">
                                <SelectValue placeholder="Select organization type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ORGANIZATION_TYPES.map((type) => {
                                const IconComponent = type.icon;
                                return (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <IconComponent className="w-4 h-4" />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the organization's primary purpose and mission..."
                            className="min-h-20"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-purpose"
                          />
                        </FormControl>
                        <FormDescription>
                          What is this organization's reason for existing?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a detailed description of the organization..."
                            className="min-h-24"
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Overall characteristics, culture, and reputation
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-organization-genre">
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FORM_GENRE_OPTIONS.map((genre) => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="structure" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Organization Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="structure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organizational Structure</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the hierarchy, departments, ranks, and internal organization..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-structure"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadership"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leadership</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the leaders, their roles, and decision-making processes..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-leadership"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="members"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Members</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the membership, recruitment, size, and composition..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-members"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headquarters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headquarters</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Location of the main headquarters or base of operations..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="input-organization-headquarters"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="influence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Power & Influence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="influence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Influence Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ?? ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-organization-influence">
                              <SelectValue placeholder="Select influence level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INFLUENCE_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resources</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe financial resources, assets, territories, and capabilities..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-resources"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goals & Objectives</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the organization's current goals, ambitions, and long-term objectives..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-goals"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the organization's founding, major events, and historical development..."
                            {...field}
                            value={field.value ?? ""}
                            data-testid="textarea-organization-history"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake className="w-5 h-5" />
                    External Relations
                  </CardTitle>
                  <CardDescription>
                    Define relationships with other organizations and factions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="allies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allies & Partners</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter allied organizations separated by commas (e.g., Royal Guard, Merchant Guild, Temple of Light)"
                            value={field.value ? field.value.join(", ") : ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  : [],
                              )
                            }
                            data-testid="input-organization-allies"
                          />
                        </FormControl>
                        <FormDescription>
                          Organizations that support or work with this group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enemies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enemies & Rivals</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter enemy organizations separated by commas (e.g., Shadow Cult, Bandit Clans, Corrupt Officials)"
                            value={field.value ? field.value.join(", ") : ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean)
                                  : [],
                              )
                            }
                            data-testid="input-organization-enemies"
                          />
                        </FormControl>
                        <FormDescription>
                          Organizations that oppose or compete with this group
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-save-organization"
            >
              {isLoading ? "Saving..." : "Save Organization"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
