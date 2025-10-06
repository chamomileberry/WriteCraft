import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileJson, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ImportJob {
  id: string;
  userId: string;
  notebookId: string | null;
  filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  itemsProcessed: number;
  totalItems: number;
  errors: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const { data: importHistory, isLoading: isLoadingHistory } = useQuery<ImportJob[]>({
    queryKey: ['/api/import/history'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

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
      setSelectedFile(null);
      setUploadProgress(0);
      toast({
        title: "Import started",
        description: "Your World Anvil content is being imported. This may take a few minutes.",
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
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid file type",
          description: "Please select a ZIP file from World Anvil export.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
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
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Import from World Anvil</h1>
        <p className="text-muted-foreground">
          Import your existing worldbuilding content from World Anvil. Export your world as JSON (requires Guild membership), then upload the ZIP file here.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload World Anvil Export
            </CardTitle>
            <CardDescription>
              Select the ZIP file from your World Anvil JSON export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                disabled={uploadMutation.isPending}
                data-testid="input-import-file"
                className="flex-1"
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
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

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <span className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
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
            <CardTitle>How to Export from World Anvil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Log in to your World Anvil account (Guild membership required for JSON export)</li>
              <li>Go to your world's dashboard</li>
              <li>Click on "Export" in the left sidebar</li>
              <li>Select "JSON Export" format</li>
              <li>Download the generated ZIP file</li>
              <li>Upload the ZIP file using the form above</li>
            </ol>
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
                  className="flex items-center gap-4 p-4 border rounded-lg hover-elevate"
                  data-testid={`import-job-${job.id}`}
                >
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
                      {job.status === 'completed' && (
                        <span>
                          {job.itemsProcessed} items imported
                        </span>
                      )}
                      {job.status === 'processing' && job.totalItems > 0 && (
                        <span>
                          {job.itemsProcessed} / {job.totalItems} items
                        </span>
                      )}
                    </div>
                    {job.errors && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {job.errors}
                      </p>
                    )}
                  </div>
                  {job.status === 'completed' && job.totalItems > 0 && (
                    <div className="text-right">
                      <Progress 
                        value={100} 
                        className="w-24 h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No import history yet. Upload your first World Anvil export to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
