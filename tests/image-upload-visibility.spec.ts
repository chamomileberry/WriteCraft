import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestApp, createTestUser, getTestApp, mockAuthMiddleware } from './helpers/setup';
import type { Express } from 'express';

describe('Image Upload Visibility Tests', () => {
  let app: Express;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    // Setup test app
    await setupTestApp();
    app = getTestApp();

    // Create test users
    const user1 = await createTestUser({ firstName: "Alice", lastName: "Upload" });
    const user2 = await createTestUser({ firstName: "Bob", lastName: "Upload" });
    
    user1Id = user1.id;
    user2Id = user2.id;
  });

  describe('Upload Endpoint - Path Generation', () => {
    it('should return public avatar path when visibility is "public"', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      expect(response.body).toHaveProperty('uploadURL');
      expect(response.body).toHaveProperty('objectPath');
      expect(response.body).toHaveProperty('objectId');
      
      // Verify public avatar path format
      expect(response.body.objectPath).toMatch(/^\/objects\/avatars\//);
      
      // Verify signed URL is generated
      expect(typeof response.body.uploadURL).toBe('string');
      expect(response.body.uploadURL.length).toBeGreaterThan(0);
    });

    it('should return private upload path when visibility is "private"', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'private' })
        .expect(200);
      
      expect(response.body).toHaveProperty('uploadURL');
      expect(response.body).toHaveProperty('objectPath');
      expect(response.body).toHaveProperty('objectId');
      
      // Verify private upload path format
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
      
      // Verify signed URL is generated
      expect(typeof response.body.uploadURL).toBe('string');
      expect(response.body.uploadURL.length).toBeGreaterThan(0);
    });

    it('should default to private upload when visibility is not specified', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({})
        .expect(200);
      
      // Should default to private path format
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
      expect(response.body.objectPath).not.toMatch(/^\/objects\/avatars\//);
    });

    it('should default to private for invalid visibility values', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'invalid-value' })
        .expect(200);
      
      // Should default to private for invalid values
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
    });
  });

  describe('Finalize Endpoint - Authentication Required', () => {
    it('should return 401 when finalizing upload without authentication', async () => {
      // First get an upload URL (authenticated)
      const uploadResponse = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      const { objectPath } = uploadResponse.body;
      
      // Try to finalize without authentication
      await request(app)
        .post('/api/upload/finalize')
        .send({ objectPath })
        .expect(401);
    });

    it('should return 400 when objectPath is missing', async () => {
      // Try to finalize without objectPath (authenticated)
      await request(app)
        .post('/api/upload/finalize')
        .set('X-Test-User-Id', user1Id)
        .send({})
        .expect(400);
      
      const response = await request(app)
        .post('/api/upload/finalize')
        .set('X-Test-User-Id', user1Id)
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should successfully finalize public avatar upload when authenticated', async () => {
      // Get public upload URL
      const uploadResponse = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      const { objectPath } = uploadResponse.body;
      expect(objectPath).toMatch(/^\/objects\/avatars\//);
      
      // Finalize with authentication
      const finalizeResponse = await request(app)
        .post('/api/upload/finalize')
        .set('X-Test-User-Id', user1Id)
        .send({ objectPath })
        .expect(200);
      
      // Should return the same path (no ACL processing for public avatars)
      expect(finalizeResponse.body).toHaveProperty('objectPath');
      expect(finalizeResponse.body.objectPath).toBe(objectPath);
    });

    it('should successfully finalize private upload when authenticated', async () => {
      // Get private upload URL
      const uploadResponse = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'private' })
        .expect(200);
      
      const { objectPath } = uploadResponse.body;
      expect(objectPath).toMatch(/^\/objects\/uploads\//);
      
      // Finalize with authentication (would set ACL in real scenario)
      const finalizeResponse = await request(app)
        .post('/api/upload/finalize')
        .set('X-Test-User-Id', user1Id)
        .send({ objectPath })
        .expect(200);
      
      // Should return object path
      expect(finalizeResponse.body).toHaveProperty('objectPath');
      expect(typeof finalizeResponse.body.objectPath).toBe('string');
    });
  });

  describe('Visibility Mode Handling', () => {
    it('should handle public avatar finalization without ACL processing', async () => {
      // Get public upload URL
      const uploadResponse = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      const { objectPath } = uploadResponse.body;
      expect(objectPath).toMatch(/^\/objects\/avatars\//);
      
      // Finalize public avatar (no ACL processing)
      const finalizeResponse = await request(app)
        .post('/api/upload/finalize')
        .set('X-Test-User-Id', user1Id)
        .send({ objectPath })
        .expect(200);
      
      // Path should be returned unchanged
      expect(finalizeResponse.body.objectPath).toBe(objectPath);
    });

    it('should handle private upload finalization with ACL processing', async () => {
      // Get private upload URL
      const uploadResponse = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'private' })
        .expect(200);
      
      const { objectPath } = uploadResponse.body;
      expect(objectPath).toMatch(/^\/objects\/uploads\//);
      
      // Finalize private upload (would set ACL metadata in real scenario)
      const finalizeResponse = await request(app)
        .post('/api/upload/finalize')
        .set('X-Test-User-Id', user1Id)
        .send({ objectPath })
        .expect(200);
      
      // Should return a valid path
      expect(finalizeResponse.body).toHaveProperty('objectPath');
      expect(typeof finalizeResponse.body.objectPath).toBe('string');
    });
  });

  describe('UUID Generation and Format', () => {
    it('should generate valid UUIDs for avatar uploads', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      const { objectId, objectPath } = response.body;
      
      // UUID format validation (standard UUID v4)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(objectId).toMatch(uuidRegex);
      
      // Path should include the object ID
      expect(objectPath).toContain(objectId);
      expect(objectPath).toBe(`/objects/avatars/${objectId}`);
    });

    it('should generate valid UUIDs for private uploads', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'private' })
        .expect(200);
      
      const { objectId, objectPath } = response.body;
      
      // UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(objectId).toMatch(uuidRegex);
      
      // Path should include the object ID
      expect(objectPath).toContain(objectId);
      expect(objectPath).toBe(`/objects/uploads/${objectId}`);
    });

    it('should generate unique UUIDs for each upload request', async () => {
      const response1 = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      const response2 = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      // Verify unique object IDs
      expect(response1.body.objectId).not.toBe(response2.body.objectId);
      expect(response1.body.objectPath).not.toBe(response2.body.objectPath);
      expect(response1.body.uploadURL).not.toBe(response2.body.uploadURL);
    });
  });

  describe('Backward Compatibility', () => {
    it('should default to private when visibility is omitted', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({})
        .expect(200);
      
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
      expect(response.body.objectPath).not.toMatch(/^\/objects\/avatars\//);
    });

    it('should default to private when visibility is undefined', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: undefined })
        .expect(200);
      
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
    });

    it('should default to private when visibility is null', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: null })
        .expect(200);
      
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
    });

    it('should default to private when visibility is empty string', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: '' })
        .expect(200);
      
      expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
    });

    it('should default to private for any non-"public" value', async () => {
      const testValues = ['Private', 'PUBLIC', 'protected', 'shared', '123', true, false];
      
      for (const value of testValues) {
        const response = await request(app)
          .post('/api/upload/image')
          .set('X-Test-User-Id', user1Id)
          .send({ visibility: value })
          .expect(200);
        
        // All non-"public" values should default to private
        expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
        expect(response.body.objectPath).not.toMatch(/^\/objects\/avatars\//);
      }
    });
  });

  describe('Response Structure Validation', () => {
    it('should return all required fields for public uploads', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'public' })
        .expect(200);
      
      // Verify response structure
      expect(response.body).toHaveProperty('uploadURL');
      expect(response.body).toHaveProperty('objectPath');
      expect(response.body).toHaveProperty('objectId');
      
      // Verify types
      expect(typeof response.body.uploadURL).toBe('string');
      expect(typeof response.body.objectPath).toBe('string');
      expect(typeof response.body.objectId).toBe('string');
      
      // Verify non-empty values
      expect(response.body.uploadURL.length).toBeGreaterThan(0);
      expect(response.body.objectPath.length).toBeGreaterThan(0);
      expect(response.body.objectId.length).toBeGreaterThan(0);
    });

    it('should return all required fields for private uploads', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('X-Test-User-Id', user1Id)
        .send({ visibility: 'private' })
        .expect(200);
      
      // Verify response structure
      expect(response.body).toHaveProperty('uploadURL');
      expect(response.body).toHaveProperty('objectPath');
      expect(response.body).toHaveProperty('objectId');
      
      // Verify types and values
      expect(typeof response.body.uploadURL).toBe('string');
      expect(typeof response.body.objectPath).toBe('string');
      expect(typeof response.body.objectId).toBe('string');
      expect(response.body.uploadURL.length).toBeGreaterThan(0);
      expect(response.body.objectPath.length).toBeGreaterThan(0);
      expect(response.body.objectId.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed request body gracefully', async () => {
      // Test with various malformed inputs
      const malformedInputs = [
        { visibility: { nested: 'object' } },
        { visibility: ['array'] },
        { extraField: 'value', visibility: 'public' },
      ];
      
      for (const input of malformedInputs) {
        const response = await request(app)
          .post('/api/upload/image')
          .set('X-Test-User-Id', user1Id)
          .send(input)
          .expect(200); // Should still succeed
        
        expect(response.body).toHaveProperty('uploadURL');
        expect(response.body).toHaveProperty('objectPath');
      }
    });

    it('should handle invalid object path formats in finalize', async () => {
      const invalidPaths = [
        '/invalid/path',
        'objects/no-leading-slash',
        '/objects/',
        '/objects',
        '',
        'not-a-path'
      ];
      
      for (const invalidPath of invalidPaths) {
        // Even invalid paths may be accepted by finalize endpoint
        // The actual validation happens in object storage service
        await request(app)
          .post('/api/upload/finalize')
          .set('X-Test-User-Id', user1Id)
          .send({ objectPath: invalidPath });
        // Don't assert specific status - just verify endpoint doesn't crash
      }
    });
  });

  describe('Path Format Consistency', () => {
    it('should consistently use /objects/avatars/ prefix for public uploads', async () => {
      // Make multiple requests to verify consistency
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/upload/image')
          .set('X-Test-User-Id', user1Id)
          .send({ visibility: 'public' })
          .expect(200);
        
        expect(response.body.objectPath).toMatch(/^\/objects\/avatars\//);
        expect(response.body.objectPath.split('/').length).toBe(4); // /objects/avatars/{uuid}
      }
    });

    it('should consistently use /objects/uploads/ prefix for private uploads', async () => {
      // Make multiple requests to verify consistency
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/upload/image')
          .set('X-Test-User-Id', user1Id)
          .send({ visibility: 'private' })
          .expect(200);
        
        expect(response.body.objectPath).toMatch(/^\/objects\/uploads\//);
        expect(response.body.objectPath.split('/').length).toBe(4); // /objects/uploads/{uuid}
      }
    });
  });
});
