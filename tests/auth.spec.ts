import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { setupTestApp, createTestUser, createTestNotebook, createTestCharacter, getTestApp } from './helpers/setup';
import type { Express } from 'express';

describe('Authentication & Authorization Tests', () => {
  let app: Express;
  let user1Id: string;
  let user2Id: string;
  let user1NotebookId: string;
  let user2NotebookId: string;
  let user1CharacterId: string;
  let user2CharacterId: string;

  beforeAll(async () => {
    // Setup test app
    await setupTestApp();
    app = getTestApp();

    // Create two test users with their notebooks and characters
    const user1 = await createTestUser({ firstName: "Alice", lastName: "Test" });
    const user2 = await createTestUser({ firstName: "Bob", lastName: "Test" });
    
    user1Id = user1.id;
    user2Id = user2.id;

    // Create notebooks for each user
    const notebook1 = await createTestNotebook(user1Id, { name: "Alice's Notebook" });
    const notebook2 = await createTestNotebook(user2Id, { name: "Bob's Notebook" });
    
    user1NotebookId = notebook1.id;
    user2NotebookId = notebook2.id;

    // Create characters for each user
    const char1 = await createTestCharacter(user1Id, user1NotebookId, { givenName: "Alice's Character" });
    const char2 = await createTestCharacter(user2Id, user2NotebookId, { givenName: "Bob's Character" });
    
    user1CharacterId = char1.id;
    user2CharacterId = char2.id;
  });

  describe('401 Unauthenticated Tests', () => {
    it('should return 401 for unauthenticated GET /api/characters/:id request', async () => {
      const response = await request(app)
        .get(`/api/characters/${user1CharacterId}`)
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated POST /api/characters request', async () => {
      const response = await request(app)
        .post('/api/characters')
        .send({
          givenName: "Unauthorized Character",
          notebookId: user1NotebookId
        })
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated GET /api/notebooks request', async () => {
      const response = await request(app)
        .get('/api/notebooks')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated DELETE /api/characters/:id request', async () => {
      const response = await request(app)
        .delete(`/api/characters/${user1CharacterId}`)
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for unauthenticated GET /api/auth/user request', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('404 Cross-User Authorization Tests', () => {
    it('should return 404 when User 2 tries to access User 1\'s character', async () => {
      const response = await request(app)
        .get(`/api/characters/${user1CharacterId}`)
        .set('X-Test-User-Id', user2Id)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 when User 2 tries to delete User 1\'s notebook', async () => {
      const response = await request(app)
        .delete(`/api/notebooks/${user1NotebookId}`)
        .set('X-Test-User-Id', user2Id)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 when User 2 tries to update User 1\'s character', async () => {
      const response = await request(app)
        .put(`/api/characters/${user1CharacterId}`)
        .set('X-Test-User-Id', user2Id)
        .send({
          givenName: "Hacked Name"
        })
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('200 Success Tests (Ownership Validation)', () => {
    it('should return 200 when User 1 accesses their own character', async () => {
      const response = await request(app)
        .get(`/api/characters/${user1CharacterId}`)
        .set('X-Test-User-Id', user1Id)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', user1CharacterId);
      expect(response.body).toHaveProperty('givenName');
    });

    it('should return 201 when User 1 creates a character in their notebook', async () => {
      const response = await request(app)
        .post('/api/characters')
        .set('X-Test-User-Id', user1Id)
        .send({
          givenName: "New Test Character",
          familyName: "Created",
          notebookId: user1NotebookId
        })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('givenName', 'New Test Character');
      expect(response.body).toHaveProperty('notebookId', user1NotebookId);
    });

    it('should return 200 when User 1 lists their own notebooks', async () => {
      const response = await request(app)
        .get('/api/notebooks')
        .set('X-Test-User-Id', user1Id)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userId', user1Id);
    });

    it('should return 200 when User 1 updates their own character', async () => {
      const response = await request(app)
        .put(`/api/characters/${user1CharacterId}`)
        .set('X-Test-User-Id', user1Id)
        .send({
          givenName: "Updated Name"
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('givenName', 'Updated Name');
    });

    it('should return 204 when User 1 deletes their own character', async () => {
      // Create a character specifically for deletion test
      const createResponse = await request(app)
        .post('/api/characters')
        .set('X-Test-User-Id', user1Id)
        .send({
          givenName: "To Be Deleted",
          notebookId: user1NotebookId
        })
        .expect(201);
      
      const characterToDelete = createResponse.body.id;
      
      await request(app)
        .delete(`/api/characters/${characterToDelete}`)
        .set('X-Test-User-Id', user1Id)
        .expect(204);
      
      // Verify it's actually deleted
      await request(app)
        .get(`/api/characters/${characterToDelete}`)
        .set('X-Test-User-Id', user1Id)
        .expect(404);
    });
  });
});

