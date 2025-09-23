import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField as FormFieldComponent, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { AutocompleteField } from "@/components/ui/autocomplete-field";
import { 
  User, Eye, Brain, Zap, BookOpen, MessageCircle, 
  ChevronRight, ChevronDown, Menu, X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ContentTypeFormConfig, FormField } from "./types";
import { z } from "zod";

// Navigation structure for character editor
const characterNavigation = [
  {
    id: "identity",
    label: "Identity",
    icon: User,
    description: "Basic information and identity",
    tabIds: ["basic", "identity"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Eye,
    description: "Physical appearance and traits",
    tabIds: ["physical"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "mind",
    label: "Mind & Personality",
    icon: Brain,
    description: "Personality, relationships, and mental traits",
    tabIds: ["personality", "relations"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "powers",
    label: "Skills & Powers",
    icon: Zap,
    description: "Abilities, skills, and special powers",
    tabIds: ["abilities"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "background",
    label: "Life & Background",
    icon: BookOpen,
    description: "History, lifestyle, and cultural background",
    tabIds: ["background", "lifestyle", "speech", "spiritual", "legacy"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  },
  {
    id: "prompts",
    label: "Prompts",
    icon: MessageCircle,
    description: "Writing prompts and inspiration",
    tabIds: ["prompts"],
    color: "bg-card dark:bg-card border-border dark:border-border"
  }
];

interface CharacterEditorWithSidebarProps {
  config: ContentTypeFormConfig;
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void;
  onGenerate?: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

export default function CharacterEditorWithSidebar({ 
  config, 
  initialData, 
  onSubmit, 
  onGenerate, 
  isLoading,
  isCreating 
}: CharacterEditorWithSidebarProps) {
  const [activeSection, setActiveSection] = useState("identity");
  const [activeTab, setActiveTab] = useState("basic");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["identity"]));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagValues, setTagValues] = useState<Record<string, string>>({});

  // Generate schema from config
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

  // Get default values from config and initial data
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
                defaults[field.name] = Array.isArray(initialValue) ? initialValue : [];
              } else {
                defaults[field.name] = initialValue ?? "";
              }
            } else {
              defaults[field.name] = initialValue ?? "";
            }
        }
      });
    });
    
    return defaults;
  };

  const schema = generateSchema(config);
  const defaultValues = getDefaultValues(config, initialData);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Initialize tag values for display
  useEffect(() => {
    const tagFields: Record<string, string> = {};
    (config.tabs || []).forEach(tab => {
      tab.fields.forEach(field => {
        if (field.type === "tags") {
          const value = initialData?.[field.name];
          if (typeof value === "string") {
            tagFields[field.name] = value ? value : "";
          } else if (Array.isArray(value)) {
            tagFields[field.name] = value.join(", ");
          } else {
            tagFields[field.name] = "";
          }
        }
      });
    });
    setTagValues(tagFields);
  }, [config, initialData]);

  const handleSubmit = (data: any) => {
    // Convert tag strings back to arrays
    const processedData = { ...data };
    (config.tabs || []).forEach(tab => {
      tab.fields.forEach(field => {
        if (field.type === "tags") {
          const tagValue = tagValues[field.name];
          processedData[field.name] = tagValue ? tagValue.split(",").map(s => s.trim()).filter(Boolean) : [];
        }
      });
    });
    onSubmit(processedData);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleTabSelect = (sectionId: string, tabId: string) => {
    setActiveSection(sectionId);
    setActiveTab(tabId);
    setSidebarOpen(false); // Close mobile sidebar after selection
  };

  // Find current tab configuration
  const currentTab = (config.tabs || []).find(tab => tab.id === activeTab);
  const currentSection = characterNavigation.find(section => section.id === activeSection);

  // Create sections with their tabs
  const sectionsWithTabs = characterNavigation.map(section => ({
    ...section,
    tabs: (config.tabs || []).filter(tab => section.tabIds.includes(tab.id))
  }));

  // Render individual field
  const renderField = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <FormFieldComponent
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
          <FormFieldComponent
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
          <FormFieldComponent
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
                    {field.options?.map((option: string) => (
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
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label} {field.required && "*"}</Label>
            <Input 
              id={field.name}
              placeholder={field.placeholder}
              value={tagValues[field.name] || ""}
              onChange={(e) => setTagValues(prev => ({ ...prev, [field.name]: e.target.value }))}
              data-testid={`input-${field.name}`}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <FormFieldComponent
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
                  <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      // Autocomplete field types
      case "autocomplete-character":
      case "autocomplete-location":
      case "autocomplete-organization":
      case "autocomplete-species":
      case "autocomplete-profession":
      case "autocomplete-weapon":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label} {field.required && "*"}</Label>
            <AutocompleteField
              contentType={field.type.replace('autocomplete-', '') as any}
              placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
              multiple={field.multiple || false}
              value={form.getValues(field.name)}
              onChange={(value: any) => form.setValue(field.name, value)}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      // Default text input
      default:
        return (
          <FormFieldComponent
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

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-card border-r transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Character Editor</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {sectionsWithTabs.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              const isActive = activeSection === section.id;
              const Icon = section.icon;

              return (
                <div key={section.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start p-3 h-auto font-normal",
                      isActive && "bg-muted font-medium"
                    )}
                    onClick={() => {
                      toggleSection(section.id);
                      if (section.tabs.length > 0) {
                        handleTabSelect(section.id, section.tabs[0].id);
                      }
                    }}
                    data-testid={`button-section-${section.id}`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {section.description}
                      </div>
                    </div>
                    {section.tabs.length > 1 && (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 ml-2" />
                      ) : (
                        <ChevronRight className="w-4 h-4 ml-2" />
                      )
                    )}
                  </Button>

                  {/* Sub-tabs */}
                  {isExpanded && section.tabs.length > 1 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.tabs.map((tab) => (
                        <Button
                          key={tab.id}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-sm",
                            activeTab === tab.id && "bg-muted font-medium"
                          )}
                          onClick={() => handleTabSelect(section.id, tab.id)}
                          data-testid={`button-tab-${tab.id}`}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Tab count badge for sections with multiple tabs */}
                  {section.tabs.length > 1 && !isExpanded && (
                    <div className="ml-14 -mt-1 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {section.tabs.length} sections
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              {currentSection && (
                <p className="text-sm text-muted-foreground">
                  {currentSection.label} - {currentTab?.label}
                </p>
              )}
            </div>
          </div>

          {onGenerate && (
            <Button 
              onClick={onGenerate} 
              variant="outline" 
              disabled={isLoading}
              data-testid="button-generate-content"
            >
              Generate with AI
            </Button>
          )}
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto p-6">
                {currentTab && currentSection && (
                  <Card className={cn("mb-6", currentSection.color)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <currentSection.icon className="w-5 h-5" />
                        {currentTab.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {currentTab.fields.map(field => (
                          <div key={field.name} className={
                            field.type === "textarea" ? "md:col-span-2" : ""
                          }>
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Footer with submit button inside form */}
            <div className="border-t bg-card p-4">
              <div className="max-w-4xl mx-auto flex justify-end gap-3">
                <Button type="button" variant="outline" data-testid="button-cancel-content">
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-save-content"
                >
                  {isCreating ? "Create Character" : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>

      </div>
    </div>
  );
}