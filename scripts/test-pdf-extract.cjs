/**
 * VCC PDF Text Extractor using pdfjs-dist
 * Extracts wire numbers, drawing references, and connector data from PDF files
 */

const path = require('path');
const fs = require('fs');

// Set up pdfjs-dist for Node.js
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

const DOCS_DIR = path.join(process.cwd(), 'public', 'DOCUMENTS');

// Wire number patterns: 3001, 3001a, 3001A, 3001/1, Y4181, X3201
const WIRE_PATTERN = /\b([A-Z]?)(\d{3,5})([a-zA-Z]?(?:\/\d+)?)\b/g;

// Drawing number pattern: 942-58120, 942-38305
const DRAWING_PATTERN = /\b942[-\s](\d{5}[A-D]?)\b/g;

// Connector code pattern: X3, J1, J2, CN1, TB1, A1 (letter+digits)
const CONNECTOR_PATTERN = /\b([A-Z]{1,4}\d{1,3}[A-Z]?)\b/g;

async function extractTextFromPdf(filename, maxPages = 50) {
  const filePath = path.join(DOCS_DIR, filename);
  const data = new Uint8Array(fs.readFileSync(filePath));
  
  const loadingTask = pdfjsLib.getDocument({ data, disableFontFace: true, verbosity: 0 });
  const pdfDoc = await loadingTask.promise;
  const numPages = Math.min(pdfDoc.numPages, maxPages);
  
  const pages = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map(item => item.str || '').join(' ');
    pages.push({ pageNo: i, text });
  }
  return { numPages: pdfDoc.numPages, pages };
}

async function main() {
  const file = 'KMRCL VCC Drawings_OCR.pdf';
  console.log('Extracting from:', file);
  
  const result = await extractTextFromPdf(file, 5);
  console.log('Total pages in PDF:', result.numPages);
  console.log('Extracted', result.pages.length, 'pages');
  
  result.pages.forEach(p => {
    console.log(`\n=== Page ${p.pageNo} (${p.text.length} chars) ===`);
    console.log(p.text.slice(0, 500));
    
    // Extract wire numbers
    const wires = new Set();
    let m;
    const wPattern = /\b([A-Z]?)(\d{3,5})([a-zA-Z]?(?:\/\d+)?)\b/g;
    while ((m = wPattern.exec(p.text)) !== null) {
      const prefix = m[1];
      const num = m[2];
      const suffix = m[3];
      if (num.length >= 4) {
        wires.add(`${prefix}${num}${suffix}`);
      }
    }
    if (wires.size > 0) {
      console.log('Wire numbers found:', Array.from(wires).slice(0, 20).join(', '));
    }
    
    // Extract drawing numbers
    const drawings = new Set();
    const dPattern = /942[-\s](\d{5}[A-D]?)/g;
    while ((m = dPattern.exec(p.text)) !== null) {
      drawings.add(`942-${m[1]}`);
    }
    if (drawings.size > 0) {
      console.log('Drawings found:', Array.from(drawings).join(', '));
    }
  });
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
