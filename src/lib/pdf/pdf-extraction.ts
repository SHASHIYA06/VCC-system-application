/**
 * PDF Extraction Service
 * Handles extraction of individual pages from PDF files
 * 
 * NOTE: This file uses fs/promises which can cause Turbopack to trace the entire project.
 * The actual file system operations are only used at build time, not runtime.
 */

import { PDFDocument } from 'pdf-lib';

// Mark for Turbopack to avoid tracing the entire project
// This is a build-time utility, not a runtime dependency
/* eslint-disable @typescript-eslint/no-unused-vars */
const _turbopackIgnore = true;
/* eslint-enable @typescript-eslint/no-unused-vars */

export interface PdfExtractionOptions {
  sourcePath: string;
  outputDir?: string;
  pageNumber: number;
  outputFileName?: string;
}

export interface PdfPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Extract a single page from a PDF file
 * This function is only used during build time, not runtime
 */
export async function extractPdfPage(options: PdfExtractionOptions): Promise<string> {
  const { sourcePath, outputDir = '/tmp/pdf-pages', pageNumber, outputFileName } = options;

  try {
    // Read the source PDF
    const pdfBytes = await import('fs').then(({ promises: fs }) => fs.readFile(sourcePath));
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Validate page number
    const totalPages = pdfDoc.getPageCount();
    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error(`Invalid page number ${pageNumber}. PDF has ${totalPages} pages.`);
    }

    // Create a new PDF with just the requested page
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1]);
    newPdf.addPage(copiedPage);

    // Save the extracted page
    const newPdfBytes = await newPdf.save();
    
    // Ensure output directory exists
    await import('fs').then(({ promises: fs }) => fs.mkdir(outputDir, { recursive: true }));

    // Generate output filename
    const fileName = outputFileName || `page-${pageNumber}.pdf`;
    const outputPath = `${outputDir}/${fileName}`;

    // Write the file
    await import('fs').then(({ promises: fs }) => fs.writeFile(outputPath, newPdfBytes));

    return outputPath;
  } catch (error) {
    console.error('Error extracting PDF page:', error);
    throw error;
  }
}

/**
 * Get information about all pages in a PDF
 */
export async function getPdfPageInfo(sourcePath: string): Promise<PdfPageInfo[]> {
  try {
    const pdfBytes = await import('fs').then(({ promises: fs }) => fs.readFile(sourcePath));
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    return pages.map((page, index) => ({
      pageNumber: index + 1,
      width: page.getWidth(),
      height: page.getHeight(),
      rotation: page.getRotation().angle,
    }));
  } catch (error) {
    console.error('Error getting PDF page info:', error);
    throw error;
  }
}

/**
 * Extract multiple pages from a PDF
 */
export async function extractPdfPages(
  sourcePath: string,
  pageNumbers: number[],
  outputDir?: string
): Promise<string[]> {
  const results: string[] = [];

  for (const pageNumber of pageNumbers) {
    const outputPath = await extractPdfPage({
      sourcePath,
      pageNumber,
      outputDir,
    });
    results.push(outputPath);
  }

  return results;
}

/**
 * Extract a range of pages from a PDF
 */
export async function extractPdfPageRange(
  sourcePath: string,
  startPage: number,
  endPage: number,
  outputFileName?: string
): Promise<string> {
  try {
    const pdfBytes = await import('fs').then(({ promises: fs }) => fs.readFile(sourcePath));
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const totalPages = pdfDoc.getPageCount();
    if (startPage < 1 || endPage > totalPages || startPage > endPage) {
      throw new Error(`Invalid page range ${startPage}-${endPage}. PDF has ${totalPages} pages.`);
    }

    // Create a new PDF with the requested pages
    const newPdf = await PDFDocument.create();
    const pageIndices = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage - 1 + i
    );
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    // Save the extracted pages
    const newPdfBytes = await newPdf.save();
    
    const outputDir = '/tmp/pdf-pages';
    await import('fs').then(({ promises: fs }) => fs.mkdir(outputDir, { recursive: true }));

    const fileName = outputFileName || `pages-${startPage}-${endPage}.pdf`;
    const outputPath = `${outputDir}/${fileName}`;

    await import('fs').then(({ promises: fs }) => fs.writeFile(outputPath, newPdfBytes));

    return outputPath;
  } catch (error) {
    console.error('Error extracting PDF page range:', error);
    throw error;
  }
}
