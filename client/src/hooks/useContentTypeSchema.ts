import { useMemo } from "react";
import { z } from "zod";
import { getContentTypeSchema } from "@shared/schema-mapping";

/**
 * Hook to get the Zod validation schema for a content type
 * @param contentType - The content type ID
 * @returns The Zod schema or null if not found
 */
export function useContentTypeSchema(contentType: string): z.ZodTypeAny | null {
  return useMemo(() => {
    return getContentTypeSchema(contentType);
  }, [contentType]);
}
