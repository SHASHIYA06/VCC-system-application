import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);
const DOCS_DIR = join(process.cwd(), 'public', 'DOCUMENTS');

async function checkPdf(filename: string) {
  const filePath = join(DOCS_DIR, filename);
  try {
    const { stdout } = await execAsync(`pdfinfo "${filePath}"`);
    console.log(`=== Info for ${filename} ===`);
    console.log(stdout);
  } catch (err) {
    console.error(`Error checking ${filename}:`, err);
  }
}

async function main() {
  await checkPdf('CAB_PIN DRAWINGS.pdf');
  await checkPdf('CAB_PIN DRAWINGS 2.pdf');
}

main().catch(console.error);
