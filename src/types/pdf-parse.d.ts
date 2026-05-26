declare module 'pdf-parse' {
  function pdfParse(dataBuffer: Buffer, options?: unknown): Promise<{
    numpages: number;
    numrender: number;
    info: unknown;
    metadata: unknown;
    text: string;
    version: string;
  }>;
  export default pdfParse;
}
