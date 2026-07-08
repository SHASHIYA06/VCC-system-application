import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);
const pdfPath = join(process.cwd(), 'public', 'DOCUMENTS', 'KMRCL VCC Drawings_OCR.pdf');

// Drawing regex
const DRAWING_REGEX = /\b942[-_\s]\d{5}\b/g;

async function extractPageText(pageNo: number): Promise<string> {
  const args = `-f ${pageNo} -l ${pageNo} -layout "${pdfPath}" -`;
  try {
    const { stdout } = await execAsync(`pdftotext ${args}`, { timeout: 10000 });
    return stdout;
  } catch (err) {
    return '';
  }
}

async function main() {
  console.log('🔍 Scanning KMRCL VCC Drawings_OCR.pdf page-by-page (127 pages)...');
  
  for (let page = 1; page <= 127; page++) {
    const text = await extractPageText(page);
    
    // Find all drawing numbers
    const matches = text.match(DRAWING_REGEX) || [];
    const uniqueDrawings = Array.from(new Set(matches.map(m => m.replace(/\s+/g, '-'))));
    
    // Let's try to extract the drawing title. Title block is usually at the bottom right.
    // We can look at the last few lines or search for keywords.
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    // Look for lines containing "TITLE" or typical title block words
    let title = 'UNKNOWN TITLE';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      // Title blocks often contain things like "VCC", "CIRCUIT", "DIAGRAM", "DOOR", etc.
      // Let's print the bottom lines to see the structure of the title block.
      if (line.includes('942-') || line.includes('942 ')) {
        // The title is often above or near the drawing number line
        title = lines.slice(Math.max(0, i - 4), i + 1).join(' | ');
        break;
      }
    }

    console.log(`Page ${page.toString().padStart(3)}: Drawings Found: [${uniqueDrawings.join(', ')}] | Title Context: ${title.slice(0, 120)}`);
  }
}

main().catch(console.error);
