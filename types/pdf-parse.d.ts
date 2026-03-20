declare module "pdf-parse" {
  interface PDFData {
    text?: string;
    numPages?: number;
    info?: any;
    metadata?: any;
  }
  
  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}
