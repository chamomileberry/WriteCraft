import { createApp } from "../../server/app";
import { storage } from "../../server/storage";
import { Express } from "express";
import { Server } from "http";
import { nanoid } from "nanoid";

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface TestNotebook {
  id: string;
  name: string;
  userId: string;
}

export interface TestCharacter {
  id: string;
  givenName: string;
  userId: string;
  notebookId: string;
}

let testApp: Express;
let testServer: Server;

export async function setupTestApp() {
  if (!testApp) {
    const { app, server } = await createApp();
    testApp = app;
    testServer = server;
  }
  return { app: testApp, server: testServer };
}

export function getTestApp() {
  if (!testApp) {
    throw new Error("Test app not initialized. Call setupTestApp() first.");
  }
  return testApp;
}

export async function createTestUser(
  overrides?: Partial<TestUser>,
): Promise<TestUser> {
  const randomId = nanoid().toLowerCase().replace(/_/g, "-"); // Ensure lowercase and replace underscores
  const userId = `test-user-${randomId}`;
  const email = overrides?.email || `test-${randomId}@example.com`;

  const user = await storage.createUser({
    id: userId,
    email,
    firstName: overrides?.firstName || "Test",
    lastName: overrides?.lastName || "User",
  });

  return {
    id: user.id,
    email: user.email!,
    firstName: user.firstName!,
    lastName: user.lastName!,
  };
}

export async function createTestNotebook(
  userId: string,
  overrides?: Partial<TestNotebook>,
): Promise<TestNotebook> {
  const notebook = await storage.createNotebook({
    name: overrides?.name || "Test Notebook",
    description: "Test notebook for automated tests",
    userId,
  });

  return {
    id: notebook.id,
    name: notebook.name,
    userId: notebook.userId,
  };
}

export async function createTestCharacter(
  userId: string,
  notebookId: string,
  overrides?: Partial<TestCharacter>,
): Promise<TestCharacter> {
  const character = await storage.createCharacter({
    givenName: overrides?.givenName || "Test Character",
    familyName: "Testington",
    occupation: "Software Tester",
    userId,
    notebookId,
  });

  return {
    id: character.id,
    givenName: character.givenName!,
    userId: character.userId,
    notebookId: character.notebookId!,
  };
}

export async function createTestLocation(userId: string, notebookId: string) {
  const location = await storage.createLocation({
    name: "Test Location",
    locationType: "City",
    description: "A test location",
    userId,
    notebookId,
  });

  return location;
}

export function mockAuthMiddleware(userId: string) {
  return (req: any, res: any, next: any) => {
    req.user = {
      claims: {
        sub: userId,
      },
    };
    next();
  };
}

export function createAuthenticatedRequest(app: Express, userId: string) {
  const mockReq = {
    app,
    user: {
      claims: {
        sub: userId,
      },
    },
  };
  return mockReq;
}

export async function cleanupTestData() {
  // Note: In a real implementation, you would:
  // 1. Track created test resources (users, notebooks, characters, etc.)
  // 2. Delete them in the correct order (respecting foreign key constraints)
  // 3. Or use database transactions and rollback
  //
  // For this MVP, we're documenting the pattern but not implementing full cleanup
  // as it would require extending the storage layer with batch delete operations
}
