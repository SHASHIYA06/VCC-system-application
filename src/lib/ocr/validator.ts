import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

export const OCR_JSON_SCHEMA_VERSION = '1.0.0';
export const OCR_DOCUMENT_TYPE = 'beml-vcc-ocr';

const DRAWING_NO_RE = /^\d{3}-\d{5}[A-Z]?$/;
const PAGE_MARKER_RE = /^page-(\d+)$/i;
const INLINE_PAGE_MARKER_RE = /\bpage-(\d+)\b/i;
const EXPLICIT_DRG_RE = /DRG\s*No\.?\s*([A-Z0-9-]+[A-Z]?)/i;
const BEML_DRG_RE = /\b(\d{3}-\d{5}[A-Z]?)\b/;
const SHEET_RE = /\b(?:SHEET|SHT(?:\s*No\.)?)\s*(\d+)\s+OF\s+(\d+)\b/i;

export type ValidationIssue = {
  code: string;
  path: string;
  message: string;
};

export class OcrValidationError extends Error {
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[]) {
    super(message);
    this.name = 'OcrValidationError';
    this.issues = issues;
  }
}

const CanonicalOcrPageSchema = z.object({
  pageNo: z.number().int().positive(),
  pageMarker: z.string().regex(PAGE_MARKER_RE),
  drawingNo: z.string().regex(DRAWING_NO_RE),
  sheetNo: z.number().int().positive(),
  sheetCount: z.number().int().positive(),
  text: z.string().min(80),
}).strict();

const CanonicalOcrDocumentSchema = z.object({
  schemaVersion: z.literal(OCR_JSON_SCHEMA_VERSION),
  documentType: z.literal(OCR_DOCUMENT_TYPE),
  projectCode: z.string().min(1),
  sourceFilename: z.string().min(1),
  exportedAt: z.string().datetime({ offset: true }),
  pageCount: z.number().int().positive(),
  pages: z.array(CanonicalOcrPageSchema).min(1),
}).strict();

export type CanonicalOcrPage = z.infer<typeof CanonicalOcrPageSchema>;
export type CanonicalOcrDocument = z.infer<typeof CanonicalOcrDocumentSchema>;

function issue(code: string, path: string, message: string): ValidationIssue {
  return { code, path, message };
}

export function normalizeOcrText(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/[‐–—]/g, '-')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractInlinePageNo(text: string): number | null {
  const match = text.match(INLINE_PAGE_MARKER_RE);
  return match ? Number(match[1]) : null;
}

export function extractDrawingNo(text: string): string | null {
  const explicit = text.match(EXPLICIT_DRG_RE);
  if (explicit?.[1]) {
    const candidate = explicit[1].replace(/\s+/g, '');
    if (DRAWING_NO_RE.test(candidate)) return candidate;
  }
  const beml = text.match(BEML_DRG_RE);
  if (beml?.[1] && DRAWING_NO_RE.test(beml[1])) return beml[1];
  return null;
}

export function extractSheetMeta(text: string): { sheetNo: number; sheetCount: number } | null {
  const match = text.match(SHEET_RE);
  if (!match) return null;
  const sheetNo = Number(match[1]);
  const sheetCount = Number(match[2]);
  if (!Number.isFinite(sheetNo) || !Number.isFinite(sheetCount)) return null;
  return { sheetNo, sheetCount };
}

export function inferCanonicalPage(pageNo: number, rawText: string): CanonicalOcrPage {
  const text = normalizeOcrText(rawText);
  const drawingNo = extractDrawingNo(text);
  const sheet = extractSheetMeta(text);

  if (!drawingNo) {
    throw new OcrValidationError('Unable to infer drawing number from OCR page', [
      issue('MISSING_DRAWING_NO', `pages[${pageNo - 1}].drawingNo`, `No drawing number found on page ${pageNo}`),
    ]);
  }

  if (!sheet) {
    throw new OcrValidationError('Unable to infer sheet metadata from OCR page', [
      issue('MISSING_SHEET_META', `pages[${pageNo - 1}]`, `No sheet metadata found on page ${pageNo}`),
    ]);
  }

  const inlinePageNo = extractInlinePageNo(text);
  if (inlinePageNo !== null && inlinePageNo !== pageNo) {
    throw new OcrValidationError('Page marker does not match inferred page number', [
      issue('PAGE_MARKER_MISMATCH', `pages[${pageNo - 1}].pageMarker`, `Inline page marker page-${inlinePageNo} does not match pageNo ${pageNo}`),
    ]);
  }

  return {
    pageNo,
    pageMarker: `page-${pageNo}`,
    drawingNo,
    sheetNo: sheet.sheetNo,
    sheetCount: sheet.sheetCount,
    text,
  };
}

function mapZodIssues(err: z.ZodError): ValidationIssue[] {
  return err.issues.map((i) =>
    issue(`SCHEMA_${i.code.toUpperCase()}`, i.path.length ? i.path.join('.') : '$', i.message),
  );
}

function validateBusinessRules(doc: CanonicalOcrDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (doc.pageCount !== doc.pages.length) {
    issues.push(issue('PAGE_COUNT_MISMATCH', 'pageCount', `pageCount=${doc.pageCount} but pages.length=${doc.pages.length}`));
  }

  const seenPageNos = new Set<number>();

  for (let i = 0; i < doc.pages.length; i++) {
    const page = doc.pages[i];
    const p = `pages[${i}]`;

    if (seenPageNos.has(page.pageNo)) {
      issues.push(issue('DUPLICATE_PAGE_NO', `${p}.pageNo`, `Duplicate pageNo ${page.pageNo}`));
    }
    seenPageNos.add(page.pageNo);

    if (page.pageNo !== i + 1) {
      issues.push(issue('NON_CONTIGUOUS_PAGE_NO', `${p}.pageNo`, `Expected pageNo ${i + 1} but found ${page.pageNo}`));
    }

    if (page.pageMarker.toLowerCase() !== `page-${page.pageNo}`) {
      issues.push(issue('PAGE_MARKER_MISMATCH', `${p}.pageMarker`, `Expected page-${page.pageNo} but found ${page.pageMarker}`));
    }

    if (page.text !== normalizeOcrText(page.text)) {
      issues.push(issue('TEXT_NOT_NORMALIZED', `${p}.text`, 'Page text is not normalized'));
    }

    const extractedDrawingNo = extractDrawingNo(page.text);
    if (!extractedDrawingNo) {
      issues.push(issue('TEXT_MISSING_DRAWING_NO', `${p}.text`, 'Page text does not contain detectable drawing number'));
    } else if (extractedDrawingNo !== page.drawingNo) {
      issues.push(issue('DRAWING_NO_MISMATCH', `${p}.drawingNo`, `Declared ${page.drawingNo} does not match text ${extractedDrawingNo}`));
    }

    if (page.sheetNo > page.sheetCount) {
      issues.push(issue('INVALID_SHEET_RANGE', `${p}.sheetNo`, `sheetNo ${page.sheetNo} > sheetCount ${page.sheetCount}`));
    }
  }

  return issues;
}

export function validateCanonicalOcrDocument(input: unknown): CanonicalOcrDocument {
  let parsed: CanonicalOcrDocument;
  try {
    parsed = CanonicalOcrDocumentSchema.parse(input);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new OcrValidationError('OCR JSON failed schema validation', mapZodIssues(err));
    }
    throw err;
  }

  const issues = validateBusinessRules(parsed);
  if (issues.length) {
    throw new OcrValidationError('OCR JSON failed business validation', issues);
  }

  return parsed;
}

export function validateCanonicalOcrFile(filePath: string): CanonicalOcrDocument {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
  const json = JSON.parse(raw) as unknown;
  return validateCanonicalOcrDocument(json);
}

export function printValidationSummary(doc: CanonicalOcrDocument): void {
  console.log(JSON.stringify({
    ok: true,
    schemaVersion: doc.schemaVersion,
    projectCode: doc.projectCode,
    pageCount: doc.pageCount,
    drawings: [...new Set(doc.pages.map(p => p.drawingNo))],
  }, null, 2));
}