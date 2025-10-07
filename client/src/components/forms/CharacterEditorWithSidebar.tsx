import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField as FormFieldComponent, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { AutocompleteField } from "@/components/ui/autocomplete-field";
import { TagsInput } from "@/components/ui/tags-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { ContentHero } from "@/components/ContentHero";
import AIFieldAssist from "@/components/AIFieldAssist";
import { 
  ChevronRight, ChevronDown, Menu, X, Wand2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { ContentTypeFormConfig, FormField } from "./types";
import { characterNavigation } from "@/config/character-editor-config";
import { generateFormSchema, getFormDefaultValues } from "@/lib/form-utils";
import { z } from "zod";


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

  // Use memoized form utilities

  const schema = useMemo(() => generateFormSchema(config), [config]);
  const defaultValues = useMemo(() => getFormDefaultValues(config, initialData), [config, initialData]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });


  const handleSubmit = (data: any) => {
    onSubmit(data);
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

  // Create sections with their tabs (memoized to prevent recalculation)
  const sectionsWithTabs = useMemo(() => 
    characterNavigation.map(section => ({
      ...section,
      tabs: (config.tabs || []).filter(tab => section.tabIds.includes(tab.id))
    })), [config]
  );

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
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                  <AIFieldAssist
                    fieldName={field.name}
                    fieldLabel={field.label}
                    currentValue={formField.value ?? ""}
                    characterContext={form.getValues()}
                    onGenerated={(newValue) => form.setValue(field.name, newValue)}
                  />
                </div>
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
          <FormFieldComponent
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                <FormControl>
                  <TagsInput 
                    value={Array.isArray(formField.value) ? formField.value : []}
                    onChange={(value) => formField.onChange(value || [])}
                    onBlur={formField.onBlur}
                    placeholder={field.placeholder || `Add ${field.label.toLowerCase()}...`}
                    maxTags={field.maxTags}
                    data-testid={`tags-input-${field.name}`}
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

      case "image":
        return (
          <FormFieldComponent
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormControl>
                  <ImageUpload
                    value={formField.value ?? ""}
                    onChange={formField.onChange}
                    onCaptionChange={
                      field.showCaption && field.captionFieldName
                        ? (caption) => form.setValue(field.captionFieldName!, caption)
                        : undefined
                    }
                    caption={
                      field.showCaption && field.captionFieldName
                        ? form.watch(field.captionFieldName)
                        : undefined
                    }
                    label={field.label}
                    accept={field.accept}
                    maxFileSize={field.maxFileSize}
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

      // Default field handler - includes autocomplete types  
      default:
        // Handle autocomplete field types
        if (field.type.startsWith("autocomplete-")) {
          return (
            <FormFieldComponent
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label} {field.required && "*"}</FormLabel>
                  <FormControl>
                    <AutocompleteField
                      contentType={field.type.replace('autocomplete-', '') as any}
                      placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
                      multiple={field.multiple || false}
                      value={formField.value}
                      onChange={formField.onChange}
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

        // Regular text input
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
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Article
            </Button>
          )}
        </div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto p-6">
                {activeSection === "identity" && (
                  <ContentHero 
                    imageUrl={form.watch('imageUrl')} 
                    imageCaption={form.watch('imageCaption')} 
                  />
                )}
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