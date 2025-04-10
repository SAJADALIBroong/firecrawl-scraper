declare module 'pdf-parse/lib/pdf-parse.js' {
    interface PDFData {
        text: string;
        numpages: number;
        info: {
            PDFFormatVersion: string;
            IsAcroFormPresent: boolean;
            IsXFAPresent: boolean;
            [key: string]: unknown;
        };
        metadata: {
            CreationDate?: string;
            Creator?: string;
            Producer?: string;
            [key: string]: unknown;
        };
        version: string;
    }

    function PDFParse(buffer: Buffer): Promise<PDFData>;
    export default PDFParse;
} 