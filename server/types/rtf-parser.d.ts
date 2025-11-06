declare module 'rtf-parser' {
  /**
   * RTF document structure returned by the parser
   */
  export interface RTFDocument {
    content: RTFContent[];
    style?: RTFStyle;
    [key: string]: unknown;
  }

  /**
   * RTF content item - can be a string or nested content with styling
   */
  export type RTFContent = string | RTFContentItem;

  export interface RTFContentItem {
    content?: RTFContent[];
    style?: RTFStyle;
    [key: string]: unknown;
  }

  export interface RTFStyle {
    bold?: boolean;
    b?: boolean;
    italic?: boolean;
    underline?: boolean;
    [key: string]: unknown;
  }

  /**
   * Parse RTF string and return structured document
   * @param rtfString - The RTF content as a string
   * @param callback - Callback with error or parsed document
   */
  export function string(
    rtfString: string,
    callback: (err: Error | null, doc: RTFDocument) => void
  ): void;
}
