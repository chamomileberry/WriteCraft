import { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onCaptionChange?: (caption: string) => void;
  caption?: string;
  label?: string;
  accept?: string;
  maxFileSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onCaptionChange, 
  caption = '', 
  label = 'Image',
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  maxFileSize = 5,
  className,
  disabled = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(value || '');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Image must be less than ${maxFileSize}MB`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      // Get presigned upload URL and object path from server
      const uploadUrlResponse = await fetch('/api/upload/image', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, objectPath } = await uploadUrlResponse.json();

      // Upload file directly to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Finalize upload by setting ACL metadata
      const finalizeResponse = await fetch('/api/upload/finalize', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ objectPath })
      });

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload');
      }

      const { objectPath: finalPath } = await finalizeResponse.json();

      setImageUrl(finalPath);
      onChange(finalPath);

      toast({
        title: 'Upload successful',
        description: 'Your image has been uploaded'
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setImageUrl(urlInput.trim());
      onChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput('');
      toast({
        title: 'Image URL added',
        description: 'The image URL has been set'
      });
    }
  };

  const handleRemove = () => {
    setImageUrl('');
    onChange('');
    setUrlInput('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label>{label}</Label>}
      
      {imageUrl ? (
        <div className="relative inline-block max-w-full">
          <img 
            src={imageUrl} 
            alt={caption || "Uploaded image"} 
            className="max-w-full h-auto max-h-64 rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
            data-testid="button-remove-image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/50">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image or enter a URL
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || disabled}
                data-testid="button-upload-file"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(!showUrlInput)}
                disabled={uploading || disabled}
                data-testid="button-enter-url"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Enter URL
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled}
              capture="environment"
              data-testid="input-file"
            />
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                disabled={disabled}
                data-testid="input-url"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || disabled}
                data-testid="button-submit-url"
              >
                Add
              </Button>
            </div>
          )}
        </div>
      )}

      {onCaptionChange && (
        <div className="space-y-2">
          <Label htmlFor="image-caption">Caption (optional)</Label>
          <Input
            id="image-caption"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="Add a caption for this image"
            disabled={disabled}
            data-testid="input-caption"
          />
        </div>
      )}
    </div>
  );
}
