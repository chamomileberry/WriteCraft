declare module 'rtf-parser' {
  export function string(
    rtfString: string,
    callback: (err: Error | null, doc: any) => void
  ): void;
}
