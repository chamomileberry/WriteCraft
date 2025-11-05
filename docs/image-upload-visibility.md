# Image Upload Visibility System

## Overview

The WriteCraft platform supports two types of image uploads with different visibility settings:

1. **Public uploads** - Accessible to everyone without authentication (e.g., profile photos)
2. **Private uploads** - Access-controlled with ownership validation (e.g., manuscript images)

## API Usage

### Upload Endpoint: `/api/upload/image`

**Authentication:** Not required (generates signed URL only)

**Request:**

```http
POST /api/upload/image
Content-Type: application/json

{
  "visibility": "public" | "private"
}
```

**Important:** While the upload endpoint doesn't require authentication to generate a signed URL, the finalize endpoint DOES require authentication. This prevents abuse while allowing flexible upload flows.

**Response:**

```json
{
  "uploadURL": "https://storage.googleapis.com/...",
  "objectPath": "/objects/avatars/{uuid}" or "/objects/uploads/{uuid}",
  "objectId": "{uuid}"
}
```

### Finalize Endpoint: `/api/upload/finalize`

**Authentication:** Required (session-based authentication via cookies)

**Request:**

```http
POST /api/upload/finalize
Content-Type: application/json
Cookie: connect.sid=<session-cookie>

{
  "objectPath": "/objects/avatars/{uuid}"
}
```

**Example:**

```javascript
// After uploading file to signed URL
const finalizeResponse = await fetch("/api/upload/finalize", {
  method: "POST",
  credentials: "include", // Include session cookies
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ objectPath }),
});
```

**Response:**

```json
{
  "objectPath": "/objects/avatars/{uuid}" or "/objects/uploads/{uuid}"
}
```

## Visibility Modes

### Public Mode (`visibility: "public"`)

**Use cases:**

- Profile photos/avatars
- Public user-generated content
- Shared assets accessible to all users

**Storage location:** `{PUBLIC_PATH}/avatars/{uuid}`

**Object path:** `/objects/avatars/{uuid}`

**Access control:** Publicly accessible without authentication

**Finalization:** No ACL policy set (public bucket permissions apply)

### Private Mode (`visibility: "private"` or omitted)

**Use cases:**

- Manuscript images
- Private worldbuilding content images
- User-specific assets

**Storage location:** `{PRIVATE_DIR}/uploads/{uuid}`

**Object path:** `/objects/uploads/{uuid}`

**Access control:** Requires authentication and ownership validation

**Finalization:** ACL policy set with owner and visibility metadata

## Frontend Implementation

### Using the ImageUpload Component

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

// Public upload (e.g., profile photo)
<ImageUpload
  value={profileImageUrl}
  onChange={setProfileImageUrl}
  visibility="public"
  label="Profile Photo"
  maxFileSize={5}
/>

// Private upload (default)
<ImageUpload
  value={contentImageUrl}
  onChange={setContentImageUrl}
  label="Content Image"
  maxFileSize={10}
/>
```

### Component Props

| Prop          | Type                    | Default                                       | Description                            |
| ------------- | ----------------------- | --------------------------------------------- | -------------------------------------- |
| `visibility`  | `'public' \| 'private'` | `'private'`                                   | Controls upload destination and access |
| `value`       | `string`                | -                                             | Current image URL                      |
| `onChange`    | `(url: string) => void` | -                                             | Callback when image changes            |
| `label`       | `string`                | `'Image'`                                     | Label for the upload field             |
| `maxFileSize` | `number`                | `5`                                           | Max file size in MB                    |
| `disabled`    | `boolean`               | `false`                                       | Disable the upload                     |
| `accept`      | `string`                | `'image/jpeg,image/png,image/gif,image/webp'` | Accepted file types                    |

## Backend Implementation

### ObjectStorageService Methods

```typescript
// Public upload URL generation
await objectStorageService.getPublicObjectUploadURL();
// Returns: { uploadURL: string, objectId: string }
// Path: {PUBLIC_PATH}/avatars/{uuid}

// Private upload URL generation
await objectStorageService.getObjectEntityUploadURL();
// Returns: { uploadURL: string, objectId: string }
// Path: {PRIVATE_DIR}/uploads/{uuid}
```

### Object Serving

The `/objects/:objectPath(*)` route handles both visibility modes:

1. Searches public paths first (for avatars and public content)
2. Falls back to private entity storage
3. Applies appropriate cache headers based on visibility

```typescript
// Public avatar access (no auth required)
GET /objects/avatars/abc-123-def
→ 200 OK, Cache-Control: public, max-age=3600

// Private content access (auth required)
GET /objects/uploads/xyz-789-ghi
→ Requires authentication and ownership validation
```

## Environment Variables

| Variable                     | Description                          | Example                 |
| ---------------------------- | ------------------------------------ | ----------------------- |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Comma-separated public storage paths | `/bucket-name/public`   |
| `PRIVATE_OBJECT_DIR`         | Private storage directory            | `/bucket-name/.private` |

## Security Considerations

### Public Uploads

- **Upload URL generation:** No authentication required (generates signed URL only)
- **Finalize endpoint:** Requires authentication to prevent spam and associate uploads with users
- **File access:** Stored in public bucket with public read access
- **ACL policy:** Not needed (bucket-level public permissions apply)
- **Use cases:** User-facing content like avatars that need to be accessible without authentication

### Private Uploads

- **Upload URL generation:** No authentication required (generates signed URL only)
- **Finalize endpoint:** Requires authentication and sets ACL policy with owner metadata
- **File access:** Requires authentication and ownership validation
- **ACL policy:** Set with owner userId and visibility metadata
- **Use cases:** Sensitive or user-specific content that should not be publicly accessible

## Example Workflows

### Profile Photo Upload

1. User clicks "Edit Profile" in Account Settings
2. Component sends `POST /api/upload/image` with `visibility: "public"`
3. Backend returns signed URL for `{PUBLIC_PATH}/avatars/{uuid}`
4. Frontend uploads file to signed URL
5. Frontend calls `POST /api/upload/finalize` with object path
6. Backend returns object path (no ACL needed for public)
7. Frontend saves `/objects/avatars/{uuid}` to user profile
8. Avatar accessible everywhere without authentication

### Content Image Upload

1. User uploads image in worldbuilding editor
2. Component sends `POST /api/upload/image` (defaults to `visibility: "private"`)
3. Backend returns signed URL for `{PRIVATE_DIR}/uploads/{uuid}`
4. Frontend uploads file to signed URL
5. Frontend calls `POST /api/upload/finalize` with object path
6. Backend sets ACL policy with owner and visibility metadata
7. Frontend saves `/objects/uploads/{uuid}` to content
8. Image accessible only to owner with authentication

## Migration Notes

### Backward Compatibility

The system maintains backward compatibility with existing code:

- Default visibility is `"private"` (matches previous behavior)
- Existing ImageUpload components work without changes
- Private uploads continue using ACL-based access control
- Legacy object paths continue to work via fallback logic

### Updating Existing Features

To migrate an existing upload to public visibility:

```tsx
// Before (defaults to private)
<ImageUpload value={url} onChange={setUrl} />

// After (explicit public)
<ImageUpload value={url} onChange={setUrl} visibility="public" />
```

## Troubleshooting

### Image not loading (403 Forbidden)

**Symptom:** Avatar or image returns 403 error

**Cause:** Image uploaded to private storage but accessed publicly

**Solution:** Re-upload with `visibility: "public"` or implement authentication

### Image not found (404 Not Found)

**Symptom:** Image returns 404 error

**Cause:** Object path doesn't match storage location

**Solution:** Verify object path format matches visibility mode:

- Public: `/objects/avatars/{uuid}`
- Private: `/objects/uploads/{uuid}`

## Testing

See `tests/image-upload-visibility.spec.ts` for comprehensive test coverage of both visibility modes.
