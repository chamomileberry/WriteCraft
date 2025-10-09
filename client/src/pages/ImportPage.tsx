import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileJson, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, AlertTriangle, FileArchive } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import Header from "@/components/Header";
import { useNotebookStore } from "@/stores/notebookStore";

interface ImportJob {
  id: string;
  userId: string;
  notebookId: string | null;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  itemsProcessed: number;
  totalItems: number;
  errors: string | null;
  errorMessage?: string | null;
  results?: {
    imported: string[];
    failed: Array<{ title: string; error: string }>;
    skipped: string[];
  } | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export default function ImportPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { activeNotebookId, getActiveNotebook } = useNotebookStore();
  
  const activeNotebook = getActiveNotebook();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleNavigate = (path: string) => {
    setLocation(path);
  };

  const handleCreateNew = () => {
    setLocation('/notebook');
  };

  const { data: importHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useQuery<ImportJob[]>({
    queryKey: ['/api/import/history'],
    refetchInterval: (data) => {
      // Poll every 2 seconds if there's a processing job
      if (!data || !Array.isArray(data)) return false;
      const hasProcessingJob = data.some(job => job.status === 'processing' || job.status === 'pending');
      return hasProcessingJob ? 2000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      
      // Append all files with the same field name
      files.forEach(file => {
        formData.append('file', file);
      });
      
      if (activeNotebook) {
        formData.append('notebookId', activeNotebook.id);
        console.log(`[Import] Uploading ${files.length} file(s) to notebook: ${activeNotebook.id} (${activeNotebook.name})`);
      } else {
        console.warn('[Import] No active notebook selected - import will use default');
      }

      const response = await fetch('/api/import/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/import/history'] });
      if (activeNotebook) {
        queryClient.invalidateQueries({ queryKey: ['/api/saved-items/notebook', activeNotebook.id] });
      }
      setSelectedFiles([]);
      setUploadProgress(0);
      toast({
        title: "Import started",
        description: "Your content is being imported. This may take a few minutes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate all files are ZIP (World Anvil) or document formats (Campfire: HTML, RTF, DOCX, PDF)
      const invalidFiles = files.filter(file => {
        const lowerName = file.name.toLowerCase();
        return !lowerName.endsWith('.zip') && 
               !lowerName.endsWith('.html') && 
               !lowerName.endsWith('.rtf') &&
               !lowerName.endsWith('.docx') &&
               !lowerName.endsWith('.pdf');
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid file type",
          description: "Please select ZIP (World Anvil) or Campfire document files (HTML, RTF, DOCX, PDF).",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {
    if (!activeNotebook) {
      toast({
        title: "No notebook selected",
        description: "Please select or create a notebook before uploading.",
        variant: "destructive",
      });
      return;
    }
    if (selectedFiles.length > 0) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  const getStatusIcon = (status: ImportJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ImportJob['status']) => {
    const variants: Record<ImportJob['status'], string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onNavigate={handleNavigate}
        onCreateNew={handleCreateNew}
      />
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Import Content</h1>
          <p className="text-muted-foreground">
            Import your existing worldbuilding content from World Anvil (ZIP) or Campfire (HTML, RTF, DOCX, PDF). Select one or more files to import.
          </p>
          {!activeNotebook ? (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select or create a notebook first. Imports need a destination notebook.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                📚 Imports will be added to: <strong>{activeNotebook.name}</strong>
              </p>
            </div>
          )}
        </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Import Files
            </CardTitle>
            <CardDescription>
              Select ZIP file(s) from World Anvil or Campfire document files (HTML, RTF, DOCX, PDF)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".zip,.html,.rtf,.docx,.pdf"
                multiple
                onChange={handleFileSelect}
                disabled={uploadMutation.isPending || !activeNotebook}
                data-testid="input-import-file"
                className="flex-1"
              />
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploadMutation.isPending || !activeNotebook}
                data-testid="button-upload-import"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Import
                  </>
                )}
              </Button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const fileName = file.name.toLowerCase();
                  const isZip = fileName.endsWith('.zip');
                  const isHtml = fileName.endsWith('.html');
                  const isRtf = fileName.endsWith('.rtf');
                  const isDocx = fileName.endsWith('.docx');
                  const isPdf = fileName.endsWith('.pdf');
                  
                  const FileIcon = isZip ? FileArchive : FileJson;
                  let fileType = 'Unknown';
                  if (isZip) fileType = 'World Anvil ZIP';
                  else if (isHtml) fileType = 'Campfire HTML';
                  else if (isRtf) fileType = 'Campfire RTF';
                  else if (isDocx) fileType = 'Campfire DOCX';
                  else if (isPdf) fileType = 'Campfire PDF';
                  
                  return (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{fileType}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {uploadMutation.isPending && uploadProgress > 0 && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">World Anvil (ZIP)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Log in to your World Anvil account (Guild membership required)</li>
                <li>Go to your world's dashboard</li>
                <li>Click on "Export" in the left sidebar</li>
                <li>Select "JSON Export" format</li>
                <li>Download the generated ZIP file</li>
                <li>Upload the ZIP file using the form above</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium mb-2">Campfire (Documents)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Open Campfire and go to your project</li>
                <li>Navigate to each module (Characters, Locations, etc.)</li>
                <li>Export each module as HTML, RTF, DOCX, or PDF</li>
                <li>Select all exported document files and upload them together</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            View your previous import jobs and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : importHistory && importHistory.length > 0 ? (
            <div className="space-y-4">
              {importHistory.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg overflow-hidden"
                  data-testid={`import-job-${job.id}`}
                >
                  <div className="flex items-center gap-4 p-4 hover-elevate">
                    {getStatusIcon(job.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{job.filename}</p>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {format(new Date(job.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {job.status === 'completed' && job.results && (
                          <span>
                            {job.results.imported.length} imported
                            {job.results.failed.length > 0 && `, ${job.results.failed.length} failed`}
                            {job.results.skipped.length > 0 && `, ${job.results.skipped.length} skipped`}
                          </span>
                        )}
                        {(job.status === 'processing' || job.status === 'pending') && (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {job.totalItems > 0 ? (
                              <>
                                <span className="font-medium">
                                  {job.itemsProcessed || 0} / {job.totalItems} items
                                </span>
                                {(job.itemsProcessed || 0) > 0 && (
                                  <span className="text-xs">
                                    ({Math.round(((job.itemsProcessed || 0) / job.totalItems) * 100)}%)
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="font-medium">Starting import...</span>
                            )}
                          </span>
                        )}
                      </div>
                      {(job.errors || job.errorMessage) && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {job.errors || job.errorMessage}
                        </p>
                      )}
                    </div>
                    {job.totalItems > 0 && (
                      <div className="text-right">
                        <Progress 
                          value={job.status === 'completed' ? 100 : Math.round((job.itemsProcessed / job.totalItems) * 100)} 
                          className="w-24 h-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Detailed results section */}
                  {job.status === 'completed' && job.results && (job.results.failed.length > 0 || job.results.skipped.length > 0) && (
                    <Collapsible>
                      <div className="border-t">
                        <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-2 text-sm hover-elevate">
                          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                          <span className="text-muted-foreground">
                            View details ({job.results.failed.length + job.results.skipped.length} items)
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="space-y-3 mt-2">
                            {job.results.failed.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  Failed Items ({job.results.failed.length})
                                </h4>
                                <div className="space-y-2">
                                  {job.results.failed.map((item, idx) => (
                                    <Alert key={idx} variant="destructive" className="text-sm">
                                      <AlertDescription>
                                        <span className="font-medium">{item.title}:</span>{' '}
                                        {item.error}
                                      </AlertDescription>
                                    </Alert>
                                  ))}
                                </div>
                              </div>
                            )}

                            {job.results.skipped.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2 text-amber-600 dark:text-amber-400">
                                  Skipped Items ({job.results.skipped.length})
                                </h4>
                                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                  {job.results.skipped.slice(0, 10).map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                  {job.results.skipped.length > 10 && (
                                    <li className="text-xs">...and {job.results.skipped.length - 10} more</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No world-building import history yet. Upload your export to get started. Supported file 
                types: ZIP (World Anvil), HTML, RTF, DOCX, PDF (Campfire)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}