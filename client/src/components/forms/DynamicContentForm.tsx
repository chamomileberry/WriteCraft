import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, User, Eye, Heart, MapPin, Sword, Zap, Wrench, Building, 
  Hammer, Scroll, BookOpen, Save, Loader2 
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { FormField as FormFieldConfig, ContentTypeFormConfig } from './types';
import { AutocompleteField } from "@/components/ui/autocomplete-field";

interface DynamicContentFormProps {
  config: ContentTypeFormConfig;
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

// Icon mapping
const iconMap = {
  User, Eye, Heart, MapPin, Sword, Zap, Wrench, Building, Hammer, Scroll, BookOpen, Sparkles
};

// Helper to get icon component
const getIcon = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || User;
};

// Generate Zod schema from form config
const generateSchema = (config: ContentTypeFormConfig) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};
  
  (config.tabs || []).forEach(tab => {
    tab.fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (field.type) {
        case "number":
          fieldSchema = z.number().nullable();
          break;
        case "tags":
          fieldSchema = z.array(z.string()).nullable();
          break;
        case "checkbox":
          fieldSchema = z.boolean().nullable();
          break;
        // All autocomplete types - schema depends on multiple property
        case "autocomplete-location":
        case "autocomplete-character":
        case "autocomplete-tradition":
        case "autocomplete-organization":
        case "autocomplete-species":
        case "autocomplete-culture":
        case "autocomplete-weapon":
        case "autocomplete-building":
        case "autocomplete-plot":
        case "autocomplete-document":
        case "autocomplete-accessory":
        case "autocomplete-clothing":
        case "autocomplete-material":
        case "autocomplete-settlement":
        case "autocomplete-society":
        case "autocomplete-faction":
        case "autocomplete-military-unit":
        case "autocomplete-family-tree":
        case "autocomplete-timeline":
        case "autocomplete-ceremony":
        case "autocomplete-map":
        case "autocomplete-music":
        case "autocomplete-dance":
        case "autocomplete-law":
        case "autocomplete-policy":
        case "autocomplete-potion":
        case "autocomplete-profession":
        case "autocomplete-language":
        case "autocomplete-religion":
          // Schema depends on multiple property: true = array, false/undefined = string
          fieldSchema = field.multiple === true 
            ? z.array(z.string()).nullable()
            : z.string().nullable();
          break;
        default:
          fieldSchema = z.string().nullable();
      }
      
      if (field.required) {
        if (field.type === "tags" || 
            (field.type.startsWith("autocomplete-") && field.multiple === true)) {
          fieldSchema = z.array(z.string()).min(1, `${field.label} is required`);
        } else if (field.type === "number") {
          fieldSchema = z.number({ required_error: `${field.label} is required` });
        } else {
          fieldSchema = z.string().min(1, `${field.label} is required`);
        }
      }
      
      schemaObject[field.name] = fieldSchema;
    });
  });
  
  return z.object(schemaObject);
};

// Get default values from config
const getDefaultValues = (config: ContentTypeFormConfig, initialData?: Record<string, any>) => {
  const defaults: Record<string, any> = {};
  
  (config.tabs || []).forEach(tab => {
    tab.fields.forEach(field => {
      const initialValue = initialData?.[field.name];
      
      switch (field.type) {
        case "number":
          defaults[field.name] = initialValue ?? null;
          break;
        case "tags":
          // Convert comma-separated string to array or use array directly
          if (typeof initialValue === "string") {
            defaults[field.name] = initialValue ? initialValue.split(",").map(s => s.trim()).filter(Boolean) : [];
          } else if (Array.isArray(initialValue)) {
            defaults[field.name] = initialValue;
          } else {
            defaults[field.name] = [];
          }
          break;
        case "checkbox":
          defaults[field.name] = initialValue ?? false;
          break;
        default:
          // Handle autocomplete types based on their multiple property
          if (field.type.startsWith("autocomplete-")) {
            if (field.multiple === true) {
              // Multi-value autocomplete fields should be arrays
              if (typeof initialValue === "string") {
                defaults[field.name] = initialValue ? initialValue.split(",").map(s => s.trim()).filter(Boolean) : [];
              } else if (Array.isArray(initialValue)) {
                defaults[field.name] = initialValue;
              } else {
                defaults[field.name] = [];
              }
            } else {
              // Single-value autocomplete fields (multiple === false or undefined) should be strings
              defaults[field.name] = initialValue ?? "";
            }
          } else {
            // Regular text fields
            defaults[field.name] = initialValue ?? "";
          }
      }
    });
  });
  
  return defaults;
};

export default function DynamicContentForm({ 
  config, 
  initialData, 
  onSubmit, 
  onGenerate, 
  isLoading,
  isCreating 
}: DynamicContentFormProps) {
  const [activeTab, setActiveTab] = useState((config.tabs || [])[0]?.id || "basic");
  
  const schema = generateSchema(config);
  const defaultValues = getDefaultValues(config, initialData);
  
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  // Render individual field
  const renderField = (field: FormFieldConfig) => {
    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={field.placeholder}
                    className="min-h-24"
                    {...formField}
                    value={formField.value ?? ""}
                    data-testid={`textarea-${field.name}`}
                    rows={field.rows}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder={field.placeholder}
                    {...formField}
                    value={formField.value ?? ""}
                    onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : null)}
                    data-testid={`input-${field.name}`}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value ?? ""}>
                  <FormControl>
                    <SelectTrigger data-testid={`select-${field.name}`}>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "tags":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={field.placeholder}
                    value={Array.isArray(formField.value) ? formField.value.join(", ") : (formField.value || "")}
                    onChange={(e) => {
                      const stringValue = e.target.value;
                      const arrayValue = stringValue ? stringValue.split(",").map(s => s.trim()).filter(Boolean) : [];
                      formField.onChange(arrayValue);
                    }}
                    data-testid={`input-${field.name}`}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "checkbox":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                    data-testid={`checkbox-${field.name}`}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.label}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
              </FormItem>
            )}
          />
        );

      // All autocomplete field types - consolidated into single case
      default:
        // Handle all autocomplete field types
        if (field.type.startsWith("autocomplete-")) {
          const contentType = field.type.replace("autocomplete-", "");
          const isMultiple = field.multiple ?? true;
          
          return (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                  <FormControl>
                    <AutocompleteField
                      value={formField.value || (isMultiple ? [] : "")}
                      onChange={(value) => formField.onChange(value)}
                      placeholder={field.placeholder}
                      contentType={contentType as any}
                      multiple={isMultiple}
                    />
                  </FormControl>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }

        // Default text field case
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={field.placeholder}
                    {...formField}
                    value={formField.value ?? ""}
                    data-testid={`input-${field.name}`}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  const HeaderIcon = getIcon(config.icon);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <HeaderIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-muted-foreground">
              {isCreating ? `Create a new ${config.description.toLowerCase()}` : config.description}
            </p>
          </div>
        </div>
        
        {onGenerate && (
          <Button 
            onClick={onGenerate} 
            variant="outline" 
            disabled={isLoading}
            data-testid="button-generate-content"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate with AI
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 h-auto">
              {(config.tabs || []).map((tab) => {
                const TabIcon = getIcon(tab.icon);
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {(config.tabs || []).map((tab) => {
              const TabIcon = getIcon(tab.icon);
              return (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TabIcon className="w-5 h-5" />
                        {tab.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {tab.fields.map(field => (
                          <div key={field.name} className={
                            field.type === "textarea" ? "md:col-span-2" : ""
                          }>
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isLoading} data-testid="button-save-content">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isCreating ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreating ? "Create" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}