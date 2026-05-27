/**
 * VCC PDF File Resolution Utility
 * Maps drawing numbers to their actual PDF files in public/DOCUMENTS/
 * 
 * Drawing Number Pattern:
 *   942-381xx, 942-382xx → CAB drawings
 *   942-383xx            → DMC Underframe
 *   942-384xx            → DMC Ceiling
 *   942-385xx            → TC Underframe
 *   942-386xx            → TC Ceiling
 *   942-387xx            → MC Ceiling
 *   942-38xxx            → General schematic (main OCR file)
 *   942-58xxx            → System schematic drawings (main OCR file)
 */

export const PDF_FILES = {
  MAIN: 'KMRCL VCC Drawings_OCR.pdf',
  CAB1: 'CAB_PIN DRAWINGS.pdf',
  CAB2: 'CAB_PIN DRAWINGS 2.pdf',
  DMC_UF: 'DMC UF_PIN DRAWINGS.pdf',
  DMC_CEIL: 'DMC_CEILING.pdf',
  TC_UF: 'TC _UF PIN DRAWINGS.pdf',
  TC_CEIL: 'TC_CEILING PIN DRAWINGS.pdf',
  MC_UF: 'MC_UF.pdf',
  MC_CEIL: 'MC_CEILING_PIN DRAWINGS.pdf',
  VCC_DESC: 'VCC DESCRIPTION 13.12.2017.pdf',
} as const;

export type PdfFileKey = keyof typeof PDF_FILES;
export type PdfFileName = (typeof PDF_FILES)[PdfFileKey];

/**
 * Resolve which PDF file contains a given drawing number.
 */
export function resolveDrawingToPdfFile(drawingNo: string): PdfFileName {
  const upper = drawingNo.toUpperCase().replace(/\s+/g, '');

  if (upper.match(/942-?38[12]/)) return PDF_FILES.CAB1;
  if (upper.match(/942-?383/))    return PDF_FILES.DMC_UF;
  if (upper.match(/942-?384/))    return PDF_FILES.DMC_CEIL;
  if (upper.match(/942-?385/))    return PDF_FILES.TC_UF;
  if (upper.match(/942-?386/))    return PDF_FILES.TC_CEIL;
  if (upper.match(/942-?387/))    return PDF_FILES.MC_CEIL;

  // All other 942-38x and 942-58x → main OCR schematic file
  return PDF_FILES.MAIN;
}

/**
 * Build a complete /api/pdf/<filename> URL for a drawing number.
 * Falls back to main OCR file if no specific match.
 */
export function getPdfApiUrl(drawingNo: string, sourceFile?: string | null): string {
  if (sourceFile && sourceFile.endsWith('.pdf')) {
    return `/api/pdf/${encodeURIComponent(sourceFile)}`;
  }
  const filename = resolveDrawingToPdfFile(drawingNo || '');
  return `/api/pdf/${encodeURIComponent(filename)}`;
}

/**
 * Check if a drawing number corresponds to a PIN drawing.
 */
export function isPinDrawing(drawingNo: string): boolean {
  return /942-?38[1-9]/i.test(drawingNo);
}

/**
 * Get the car type from a drawing number.
 * CAB = 942-381/382, DMC = 942-383/384, TC = 942-385, MC = 942-386/387
 */
export function getCarTypeFromDrawingNo(drawingNo: string): string {
  const upper = drawingNo.toUpperCase();
  if (upper.match(/942-?38[12]/)) return 'CAB';
  if (upper.match(/942-?383/) || upper.match(/942-?384/)) return 'DMC';
  if (upper.match(/942-?385/)) return 'TC';
  if (upper.match(/942-?386/) || upper.match(/942-?387/)) return 'MC';
  return 'GENERAL';
}

/**
 * Normalize a drawing number for comparison.
 * Removes hyphens, uppercases, strips trailing page suffix.
 */
export function normalizeDrawingNo(drawingNo: string): {
  normalized: string;
  base: string;
  pageSuffix: string;
} {
  const upper = drawingNo.trim().toUpperCase();
  const withoutHyphens = upper.replace(/-/g, '');
  // Extract trailing alphabetic page suffix (A, B, C, D)
  const match = withoutHyphens.match(/^(.*?)([A-D]?)$/);
  const base = match?.[1] || withoutHyphens;
  const pageSuffix = match?.[2] || '';
  return {
    normalized: withoutHyphens,
    base,
    pageSuffix,
  };
}

/**
 * Build a list of page variant drawing numbers.
 * e.g., "942-58120" → ["942-58120", "942-58120A", "942-58120B", ...]
 */
export function getPageVariants(drawingNo: string): string[] {
  const base = drawingNo.replace(/[A-D]$/, '').replace(/-/g, '');
  return [base, `${base}A`, `${base}B`, `${base}C`, `${base}D`];
}
