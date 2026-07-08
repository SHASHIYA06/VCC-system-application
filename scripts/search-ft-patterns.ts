import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);
const pdfPath = join(process.cwd(), 'public', 'DOCUMENTS', 'KMRCL VCC Drawings_OCR.pdf');

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
  console.log('Searching for drawing numbers on pages 80 to 127...');
  for (let page = 80; page <= 127; page++) {
    const text = await extractPageText(page);
    // Find all alphanumeric words of length >= 6 that look like drawing codes
    const codes = text.match(/\b[A-Z0-9-]{6,20}\b/g) || [];
    const drawingCodes = Array.from(new Set(codes.filter(c => {
      // Must contain letters and numbers, or dashes
      const hasLetters = /[A-Z]/i.test(c);
      const hasDigits = /[0-9]/.test(c);
      const hasDashes = c.includes('-');
      return (hasLetters && hasDigits) || (hasDashes && c.length >= 8);
    })));

    // Filter out common labels
    const filtered = drawingCodes.filter(c => {
      const lower = c.toLowerCase();
      return !['sqmm', 'gnd', '110vdc', '230vac', '415vac', 'beml', 'kmrcl', 'mitsubishi', 'electric', 'corporation', 'diagram', 'schematic', 'circuit', 'vacuum'].includes(lower);
    });

    console.log(`Page ${page}: ${JSON.stringify(filtered.slice(0, 5))}`);
  }
}

main().catch(console.error);
