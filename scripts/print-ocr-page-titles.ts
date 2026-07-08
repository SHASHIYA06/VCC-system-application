import * as fs from 'fs';
import { join } from 'path';

async function main() {
  const dataPath = join(process.cwd(), 'scratch', 'pdf_scan_results.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Scan results not found. Run detailed scan first.');
    return;
  }

  const results = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log('=== OCR Page Analysis (Pages 80 to 127) ===\n');

  for (let page = 80; page <= 127; page++) {
    const r = results[page - 1];
    console.log(`Page ${page.toString().padStart(3)}:`);
    console.log(`  Drawings: ${JSON.stringify(r.drawings)}`);
    console.log(`  Title:    ${r.title}`);
    console.log(`  System:   ${r.system}`);
    console.log(`  Sheet:    ${r.sheetInfo}`);
    console.log('----------------------------------------------------');
  }
}

main().catch(console.error);
