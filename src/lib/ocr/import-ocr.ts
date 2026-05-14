import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { runOcrImport } from './parser-registry';

type CliOptions = {
  json?: string;
  txt?: string;
  projectCode: string;
  sourceFilename: string;
};

type PageInput = {
  pageNo: number;
  text: string;
};

type UnknownJson = Record<string, unknown>;

const prisma = new PrismaClient();

function parseArgs(argv: string[]): CliOptions {
  const out: CliOptions = {
    projectCode: 'KMRCL-RS3R-VCC',
    sourceFilename: 'ocr-import',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];

    if (a === '--json') out.json = argv[i + 1];
    if (a === '--txt') out.txt = argv[i + 1];
    if (a === '--project') out.projectCode = argv[i + 1];
    if (a === '--source') out.sourceFilename = argv[i + 1];
  }

  if (!out.json && !out.txt) {
    throw new Error('Provide either --json <file> or --txt <file>');
  }

  if (out.json && out.txt) {
    throw new Error('Use only one input source: --json or --txt');
  }

  return out;
}

function normalizeText(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/[‐–—]/g, '-')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readTextFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), 'utf8');
}

function readJsonFile<T = unknown>(filePath: string): T {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
  return JSON.parse(raw) as T;
}

function asString(x: unknown): string | null {
  return typeof x === 'string' && x.trim() ? x : null;
}

function asNumber(x: unknown): number | null {
  if (typeof x === 'number' && Number.isFinite(x)) return x;
  if (typeof x === 'string' && x.trim() && !Number.isNaN(Number(x))) return Number(x);
  return null;
}

function extractPageNoFromText(text: string): number | null {
  const m1 = text.match(/\bpage-(\d+)\b/i);
  if (m1) return Number(m1[1]);

  const m2 = text.match(/\bpage\s+(\d+)\b/i);
  if (m2) return Number(m2[1]);

  return null;
}

function splitTxtIntoPages(raw: string): PageInput[] {
  const text = raw.replace(/\r/g, '');

  const markerRegex =
    /(?:^|\n)(page-\d+\s+Start of OCR for page \d+.*?)(?=\npage-\d+\s+Start of OCR for page \d+|\s*$)/gi;

  const matches = Array.from(text.matchAll(markerRegex));

  if (matches.length > 0) {
    return matches.map((m, idx) => {
      const chunk = m[1]?.trim() || '';
      const pageNo = extractPageNoFromText(chunk) ?? idx + 1;
      return {
        pageNo,
        text: normalizeText(chunk),
      };
    });
  }

  const fallbackPages = text
    .split(/\f+/)
    .map((x) => normalizeText(x))
    .filter(Boolean);

  if (fallbackPages.length > 1) {
    return fallbackPages.map((pageText, idx) => ({
      pageNo: idx + 1,
      text: pageText,
    }));
  }

  return [
    {
      pageNo: 1,
      text: normalizeText(text),
    },
  ];
}

function inferPagesFromJson(input: unknown): PageInput[] {
  if (Array.isArray(input)) {
    return inferPagesFromArray(input);
  }

  if (input && typeof input === 'object') {
    const obj = input as UnknownJson;

    if (Array.isArray(obj.pages)) {
      return inferPagesFromArray(obj.pages);
    }

    if (Array.isArray(obj.results)) {
      return inferPagesFromArray(obj.results);
    }

    if (Array.isArray(obj.ocr_pages)) {
      return inferPagesFromArray(obj.ocr_pages);
    }

    if (Array.isArray(obj.document_pages)) {
      return inferPagesFromArray(obj.document_pages);
    }

    if (typeof obj.text === 'string') {
      return splitTxtIntoPages(obj.text);
    }
  }

  throw new Error('Unsupported JSON OCR structure');
}

function inferPagesFromArray(items: unknown[]): PageInput[] {
  const pages: PageInput[] = [];

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];

    if (typeof item === 'string') {
      pages.push({
        pageNo: i + 1,
        text: normalizeText(item),
      });
      continue;
    }

    if (!item || typeof item !== 'object') continue;

    const obj = item as UnknownJson;

    const pageNo =
      asNumber(obj.pageNo) ??
      asNumber(obj.page_no) ??
      asNumber(obj.page) ??
      asNumber(obj.pageNumber) ??
      i + 1;

    const text =
      asString(obj.text) ??
      asString(obj.rawText) ??
      asString(obj.raw_text) ??
      asString(obj.content) ??
      asString(obj.ocrText) ??
      asString(obj.ocr_text) ??
      asString(obj.markdown) ??
      asString(obj.value);

    if (text) {
      pages.push({
        pageNo,
        text: normalizeText(text),
      });
      continue;
    }

    if (Array.isArray(obj.lines)) {
      const joined = obj.lines
        .map((x) => {
          if (typeof x === 'string') return x;
          if (x && typeof x === 'object') {
            const xo = x as UnknownJson;
            return (
              asString(xo.text) ??
              asString(xo.value) ??
              asString(xo.content) ??
              ''
            );
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');

      if (joined.trim()) {
        pages.push({
          pageNo,
          text: normalizeText(joined),
        });
      }
    }
  }

  if (!pages.length) {
    throw new Error('No pages extracted from JSON OCR data');
  }

  return pages.sort((a, b) => a.pageNo - b.pageNo);
}

function dedupePages(pages: PageInput[]): PageInput[] {
  const seen = new Set<string>();
  const out: PageInput[] = [];

  for (const page of pages) {
    const key = `${page.pageNo}::${page.text.slice(0, 200)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(page);
  }

  return out.sort((a, b) => a.pageNo - b.pageNo);
}

function validatePages(pages: PageInput[]): PageInput[] {
  const clean = pages
    .map((p, idx) => ({
      pageNo: Number.isFinite(p.pageNo) ? p.pageNo : idx + 1,
      text: normalizeText(p.text || ''),
    }))
    .filter((p) => p.text.length > 0);

  if (!clean.length) {
    throw new Error('No non-empty OCR pages found');
  }

  return clean;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const rawPages =
    opts.json
      ? inferPagesFromJson(readJsonFile(opts.json))
      : splitTxtIntoPages(readTextFile(opts.txt!));

  const pages = dedupePages(validatePages(rawPages));

  await runOcrImport(prisma, {
    projectCode: opts.projectCode,
    sourceFilename: opts.sourceFilename,
    pages,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectCode: opts.projectCode,
        sourceFilename: opts.sourceFilename,
        pageCount: pages.length,
        firstPage: pages[0]?.pageNo ?? null,
        lastPage: pages[pages.length - 1]?.pageNo ?? null,
      },
      null,
      2
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });