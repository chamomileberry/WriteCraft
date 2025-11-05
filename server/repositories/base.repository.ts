export class BaseRepository {
  validateContentOwnership<
    T extends { userId?: string | null; notebookId?: string | null },
  >(content: T | undefined, userId: string): boolean {
    if (!content) return false;
    return content.userId === userId;
  }
}
