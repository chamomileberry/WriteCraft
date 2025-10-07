import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { setupTestApp, createTestUser, getTestApp } from './helpers/setup';
import type { Express } from 'express';

describe('Project CRUD Smoke Tests', () => {
  let app: Express;
  let user1Id: string;
  let user2Id: string;
  let user1ProjectId: string;

  beforeAll(async () => {
    await setupTestApp();
    app = getTestApp();

    const user1 = await createTestUser({ firstName: "Alice", lastName: "Writer" });
    const user2 = await createTestUser({ firstName: "Bob", lastName: "Author" });
    
    user1Id = user1.id;
    user2Id = user2.id;
  });

  describe('Project CRUD Operations', () => {
    it('should create a new project successfully', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('X-Test-User-Id', user1Id)
        .send({
          title: "My Novel",
          description: "A great story",
          genre: "Fantasy"
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'My Novel');
      expect(response.body).toHaveProperty('userId', user1Id);
      user1ProjectId = response.body.id;
    });

    it('should retrieve user\'s own projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('X-Test-User-Id', user1Id)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('userId', user1Id);
    });

    it('should retrieve a specific project by ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${user1ProjectId}`)
        .set('X-Test-User-Id', user1Id)
        .expect(200);
      
      expect(response.body).toHaveProperty('id', user1ProjectId);
      expect(response.body).toHaveProperty('title', 'My Novel');
    });

    it('should update a project successfully', async () => {
      const response = await request(app)
        .put(`/api/projects/${user1ProjectId}`)
        .set('X-Test-User-Id', user1Id)
        .send({
          title: "My Updated Novel",
          description: "An even better story"
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('title', 'My Updated Novel');
      expect(response.body).toHaveProperty('description', 'An even better story');
    });

    it('should return 404 when user tries to access another user\'s project', async () => {
      const response = await request(app)
        .get(`/api/projects/${user1ProjectId}`)
        .set('X-Test-User-Id', user2Id)
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should return 404 when user tries to update another user\'s project', async () => {
      const response = await request(app)
        .put(`/api/projects/${user1ProjectId}`)
        .set('X-Test-User-Id', user2Id)
        .send({
          title: "Hacked Title"
        })
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should return generic error message on server errors', async () => {
      // Try to update with invalid data type
      const response = await request(app)
        .put(`/api/projects/${user1ProjectId}`)
        .set('X-Test-User-Id', user1Id)
        .send({
          wordCount: "not-a-number" // Invalid type
        })
        .expect(400);
      
      // Should get validation error, not internal details
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });

    it('should delete a project successfully', async () => {
      // Create a project to delete
      const createResponse = await request(app)
        .post('/api/projects')
        .set('X-Test-User-Id', user1Id)
        .send({
          title: "To Be Deleted",
          description: "Temporary project"
        })
        .expect(200);
      
      const projectToDelete = createResponse.body.id;
      
      await request(app)
        .delete(`/api/projects/${projectToDelete}`)
        .set('X-Test-User-Id', user1Id)
        .expect(200);
      
      // Verify it's deleted
      await request(app)
        .get(`/api/projects/${projectToDelete}`)
        .set('X-Test-User-Id', user1Id)
        .expect(404);
    });

    it('should return 404 when user tries to delete another user\'s project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${user1ProjectId}`)
        .set('X-Test-User-Id', user2Id)
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('Project Section Operations', () => {
    let sectionId: string;

    it('should create a project section successfully', async () => {
      const response = await request(app)
        .post(`/api/projects/${user1ProjectId}/sections`)
        .set('X-Test-User-Id', user1Id)
        .send({
          title: "Chapter 1",
          type: "page",
          content: "<p>Once upon a time...</p>"
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Chapter 1');
      sectionId = response.body.id;
    });

    it('should retrieve project sections', async () => {
      const response = await request(app)
        .get(`/api/projects/${user1ProjectId}/sections`)
        .set('X-Test-User-Id', user1Id)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update a section successfully', async () => {
      const response = await request(app)
        .put(`/api/projects/${user1ProjectId}/sections/${sectionId}`)
        .set('X-Test-User-Id', user1Id)
        .send({
          title: "Chapter 1 - Updated",
          content: "<p>Once upon a time, in a land far away...</p>"
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('title', 'Chapter 1 - Updated');
    });

    it('should return 404 when another user tries to update section', async () => {
      const response = await request(app)
        .put(`/api/projects/${user1ProjectId}/sections/${sectionId}`)
        .set('X-Test-User-Id', user2Id)
        .send({
          title: "Hacked Chapter"
        })
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should delete a section successfully', async () => {
      await request(app)
        .delete(`/api/projects/${user1ProjectId}/sections/${sectionId}`)
        .set('X-Test-User-Id', user1Id)
        .expect(200);
    });
  });
});
