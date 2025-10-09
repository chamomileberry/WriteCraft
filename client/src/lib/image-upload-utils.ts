/**
 * Utility functions for image upload to object storage
 */

interface UploadOptions {
  visibility?: 'public' | 'private';
  maxFileSize?: number; // in MB
}

export async function uploadImageFile(
  file: File, 
  options: UploadOptions = {}
): Promise<string> {
  const { visibility = 'private', maxFileSize = 5 } = options;

  // Validate file size
  if (file.size > maxFileSize * 1024 * 1024) {
    throw new Error(`Image must be less than ${maxFileSize}MB`);
  }

  // Get presigned upload URL and object path from server
  const uploadUrlResponse = await fetch('/api/upload/image', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ visibility })
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

  return finalPath;
}
