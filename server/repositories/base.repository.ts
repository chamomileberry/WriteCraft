import { AppError } from "../storage-types";

export class BaseRepository {
  /**
   * Asserts that content belongs to the specified user.
   * Throws typed AppError with specific reason if validation fails.
   *
   * **Note**: Override this method in subclasses to add notebook boundary checking.
   *
   * @throws {AppError} with code 'not_found' if content is undefined
   * @throws {AppError} with code 'forbidden' if user doesn't own content
   */
  ensureContentOwnership<
    T extends { userId?: string | null; notebookId?: string | null },
  >(content: T | undefined, userId: string): asserts content is T {
    if (!content) {
      throw AppError.notFound('Content not found');
    }

    if (content.userId !== userId) {
      throw AppError.forbidden(`Content does not belong to user ${userId}`);
    }
  }

  /**
   * Validates that content belongs to the specified user.
   * Returns boolean for backward compatibility.
   *
   * **Deprecated**: Use `ensureContentOwnership` for explicit error handling.
   *
   * @returns true if content passes validation, false otherwise
   */
  validateContentOwnership<
    T extends { userId?: string | null; notebookId?: string | null },
  >(content: T | undefined, userId: string): boolean {
    try {
      this.ensureContentOwnership(content, userId);
      return true;
    } catch (error) {
      if (error instanceof AppError &&
          (error.code === 'not_found' || error.code === 'forbidden')) {
        return false;
      }
      throw error;
    }
  }
}
