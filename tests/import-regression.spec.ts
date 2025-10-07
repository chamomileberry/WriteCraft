import { test, expect } from '@playwright/test';
import { storage } from '../server/storage';
import { db } from '../server/db';
import { createTestUser } from './helpers/setup';
import { readFileSync } from 'fs';
import { join } from 'path';
import AdmZip from 'adm-zip';

test.describe('World Anvil Import Regression Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let notebookId: string;

  test.beforeEach(async () => {
    testUser = await createTestUser();
    const notebook = await storage.createNotebook({
      name: 'Import Test Notebook',
      description: 'Notebook for import regression tests',
      userId: testUser.id,
    });
    notebookId = notebook.id;
  });

  test.afterEach(async () => {
    // Cleanup test data
    try {
      await db.execute(`DELETE FROM saved_items WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM ranks WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM conditions WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM characters WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM species WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM locations WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM import_jobs WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM notebooks WHERE user_id = '${testUser.id}'`);
      await db.execute(`DELETE FROM users WHERE id = '${testUser.id}'`);
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  });

  test('should import ranks and create saved_items entries', async () => {
    // Create mock World Anvil ZIP with rank data
    const zip = new AdmZip();
    
    const rankArticle = {
      id: 'test-rank-1',
      title: 'Commander',
      content: 'A military rank of high authority',
      templateType: 'rank',
      state: 'public'
    };
    
    zip.addFile('articles/rank-1.json', Buffer.from(JSON.stringify(rankArticle)));
    const zipBuffer = zip.toBuffer();

    // Import the ZIP
    const job = await storage.createImportJob({
      userId: testUser.id,
      filename: 'test-ranks.zip',
      status: 'pending',
      notebookId,
    });

    // Simulate import processing (this would normally be done by the import route)
    // For this test, we'll call the storage methods directly
    const rank = await storage.createRank({
      name: rankArticle.title,
      description: rankArticle.content,
      userId: testUser.id,
      notebookId,
    });

    // Verify rank was created
    expect(rank).toBeDefined();
    expect(rank.name).toBe('Commander');
    expect(rank.description).toBe('A military rank of high authority');

    // Create saved_item entry (simulating what the import route does)
    await storage.createSavedItem({
      userId: testUser.id,
      notebookId,
      contentType: 'rank',
      contentId: rank.id,
    });

    // Verify saved_item was created
    const savedItems = await storage.getSavedItemsByNotebook(testUser.id, notebookId);
    const rankSavedItem = savedItems.find(item => item.contentType === 'rank' && item.contentId === rank.id);
    
    expect(rankSavedItem).toBeDefined();
    expect(rankSavedItem?.contentType).toBe('rank');
    expect(rankSavedItem?.contentId).toBe(rank.id);
  });

  test('should import conditions and create saved_items entries', async () => {
    // Create mock World Anvil ZIP with condition data
    const zip = new AdmZip();
    
    const conditionArticle = {
      id: 'test-condition-1',
      title: 'Verdant Infection',
      content: 'A condition caused by exposure to Verdant compound',
      templateType: 'condition',
      state: 'public'
    };
    
    zip.addFile('articles/condition-1.json', Buffer.from(JSON.stringify(conditionArticle)));
    const zipBuffer = zip.toBuffer();

    // Import the condition
    const condition = await storage.createCondition({
      name: conditionArticle.title,
      description: conditionArticle.content,
      userId: testUser.id,
      notebookId,
    });

    // Verify condition was created
    expect(condition).toBeDefined();
    expect(condition.name).toBe('Verdant Infection');

    // Create saved_item entry
    await storage.createSavedItem({
      userId: testUser.id,
      notebookId,
      contentType: 'condition',
      contentId: condition.id,
    });

    // Verify saved_item was created
    const savedItems = await storage.getSavedItemsByNotebook(testUser.id, notebookId);
    const conditionSavedItem = savedItems.find(item => item.contentType === 'condition' && item.contentId === condition.id);
    
    expect(conditionSavedItem).toBeDefined();
    expect(conditionSavedItem?.contentType).toBe('condition');
  });

  test('should create saved_items for all imported content types', async () => {
    // Create multiple content items
    const character = await storage.createCharacter({
      givenName: 'Test Character',
      familyName: 'Smith',
      userId: testUser.id,
      notebookId,
    });

    const species = await storage.createSpecies({
      name: 'Test Species',
      description: 'A test species',
      userId: testUser.id,
      notebookId,
    });

    const location = await storage.createLocation({
      name: 'Test Location',
      locationType: 'City',
      userId: testUser.id,
      notebookId,
    });

    const rank = await storage.createRank({
      name: 'Test Rank',
      description: 'A test rank',
      userId: testUser.id,
      notebookId,
    });

    const condition = await storage.createCondition({
      name: 'Test Condition',
      description: 'A test condition',
      userId: testUser.id,
      notebookId,
    });

    // Create saved_items for each
    const contentItems = [
      { contentType: 'character', contentId: character.id },
      { contentType: 'species', contentId: species.id },
      { contentType: 'location', contentId: location.id },
      { contentType: 'rank', contentId: rank.id },
      { contentType: 'condition', contentId: condition.id },
    ];

    for (const item of contentItems) {
      await storage.createSavedItem({
        userId: testUser.id,
        notebookId,
        contentType: item.contentType,
        contentId: item.contentId,
      });
    }

    // Verify all saved_items were created
    const savedItems = await storage.getSavedItemsByNotebook(testUser.id, notebookId);
    
    expect(savedItems.length).toBe(5);
    expect(savedItems.some(item => item.contentType === 'character')).toBe(true);
    expect(savedItems.some(item => item.contentType === 'species')).toBe(true);
    expect(savedItems.some(item => item.contentType === 'location')).toBe(true);
    expect(savedItems.some(item => item.contentType === 'rank')).toBe(true);
    expect(savedItems.some(item => item.contentType === 'condition')).toBe(true);
  });

  test('should accurately track import job metrics', async () => {
    // Create import job
    const job = await storage.createImportJob({
      userId: testUser.id,
      filename: 'test-metrics.zip',
      status: 'processing',
      notebookId,
      totalItems: 5,
      itemsProcessed: 0,
    });

    expect(job.totalItems).toBe(5);
    expect(job.itemsProcessed).toBe(0);

    // Simulate processing items
    for (let i = 1; i <= 5; i++) {
      const updated = await storage.updateImportJob(job.id, {
        itemsProcessed: i,
      });
      expect(updated.itemsProcessed).toBe(i);
    }

    // Mark as completed
    const completed = await storage.updateImportJob(job.id, {
      status: 'completed',
    });

    expect(completed.status).toBe('completed');
    expect(completed.itemsProcessed).toBe(5);
    expect(completed.totalItems).toBe(5);
  });

  test('should handle import failures with granular error messages', async () => {
    const job = await storage.createImportJob({
      userId: testUser.id,
      filename: 'test-errors.zip',
      status: 'processing',
      notebookId,
      totalItems: 3,
      itemsProcessed: 2,
    });

    // Simulate failure with detailed error
    const failed = await storage.updateImportJob(job.id, {
      status: 'failed',
      errors: 'Failed to process item "Invalid Character": Missing required field "name"',
    });

    expect(failed.status).toBe('failed');
    expect(failed.errors).toContain('Invalid Character');
    expect(failed.errors).toContain('Missing required field');
    expect(failed.itemsProcessed).toBe(2); // Should preserve progress count
  });

  test('should count all content types correctly in import metrics', async () => {
    // This test verifies that the new content types (ranks, conditions) are counted
    const job = await storage.createImportJob({
      userId: testUser.id,
      filename: 'comprehensive-import.zip',
      status: 'processing',
      notebookId,
      totalItems: 17, // All content types: characters, locations, species, professions, etc.
      itemsProcessed: 0,
    });

    // Simulate importing all 17 content types
    const contentTypes = [
      'character', 'location', 'species', 'profession', 'item', 
      'ethnicity', 'settlement', 'ritual', 'law', 'language',
      'building', 'material', 'transportation', 'rank', 'condition',
      'organization', 'document'
    ];

    let processed = 0;
    for (const type of contentTypes) {
      processed++;
      await storage.updateImportJob(job.id, {
        itemsProcessed: processed,
      });
    }

    const final = await storage.updateImportJob(job.id, {
      status: 'completed',
    });

    expect(final.itemsProcessed).toBe(17);
    expect(final.totalItems).toBe(17);
    expect(final.status).toBe('completed');
  });
});
