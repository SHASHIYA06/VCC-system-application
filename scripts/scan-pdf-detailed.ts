import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import * as fs from 'fs';

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
  console.log('🔍 Detailed scanning of KMRCL VCC Drawings_OCR.pdf (127 pages)...');
  const results = [];

  for (let page = 1; page <= 127; page++) {
    const text = await extractPageText(page);
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Look for drawing numbers matching various formats:
    // 1. 942-581xx
    // 2. Mitsubishi / Other drawing numbers like H38L956 or 81-9717-... or similar
    const drawingMatches = text.match(/\b942[-_\s]\d{5}[A-Z]?\b/gi) || [];
    const mitsubishiMatches = text.match(/\b[Hh]\s*\d\s*\d\s*[A-Za-z]\s*\d\s*\d\s*\d\s*\d\b/g) || 
                             text.match(/\b81-\d{4}-\d{2,4}-\d{1,2}[A-Z]?\b/g) || [];

    const cleanedDrawings = Array.from(new Set([
      ...drawingMatches.map(m => m.replace(/\s+/g, '-').toUpperCase()),
      ...mitsubishiMatches.map(m => m.replace(/\s+/g, '').toUpperCase())
    ]));

    // Find Title:
    // Look for lines containing "TITLE"
    let title = 'UNKNOWN';
    let system = 'GEN';
    let sheetInfo = 'Sheet 1';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for "TITLE"
      if (line.includes('TITLE')) {
        const titleParts = [];
        // The title might be on the same line or subsequent lines
        const idx = line.indexOf('TITLE');
        const restOfLine = line.substring(idx + 5).trim();
        if (restOfLine) titleParts.push(restOfLine);
        
        // Grab next couple of lines if they look like part of a title block
        for (let j = 1; j <= 3; j++) {
          if (lines[i + j] && !lines[i + j].includes('DWG') && !lines[i + j].includes('APPROVED') && lines[i + j].length < 100) {
            titleParts.push(lines[i + j].trim());
          }
        }
        title = titleParts.join(' ').replace(/\s+/g, ' ').trim();
      }

      // Check for sheet info
      if (line.includes('OF') || line.includes('SHEET')) {
        const sheetMatch = line.match(/(\d+)\s+OF\s+(\d+)/i) || line.match(/SHEET\s+(\d+)/i);
        if (sheetMatch) {
          sheetInfo = `Sheet ${sheetMatch[1]} of ${sheetMatch[2] || '?'}`;
        }
      }
    }

    // Try to guess system based on title or text keywords
    const lowerText = text.toLowerCase();
    if (lowerText.includes('traction') || lowerText.includes('vvvf') || lowerText.includes('pantograph') || lowerText.includes('hscb')) {
      system = 'TRAC';
    } else if (lowerText.includes('brake') || lowerText.includes('compressor') || lowerText.includes('horn')) {
      system = 'BRAKE';
    } else if (lowerText.includes('door')) {
      system = 'DOOR';
    } else if (lowerText.includes('auxiliary') || lowerText.includes('aps') || lowerText.includes('battery') || lowerText.includes('shore')) {
      system = 'APS';
    } else if (lowerText.includes('pis') || lowerText.includes('public address') || lowerText.includes('cctv') || lowerText.includes('radio') || lowerText.includes('cbtc')) {
      system = 'COMMS';
    } else if (lowerText.includes('light') || lowerText.includes('lamp')) {
      system = 'LIGHT';
    } else if (lowerText.includes('wiper')) {
      system = 'LIGHT'; // wiper is under LIGHT system in index
    } else if (lowerText.includes('tms') || lowerText.includes('tcms') || lowerText.includes('rio')) {
      system = 'TMS';
    }

    // Fallback title detection if still UNKNOWN
    if (title === 'UNKNOWN' || title.length < 3) {
      // Find lines that look like drawing titles
      for (const line of lines) {
        if (line.toUpperCase().includes('CIRCUIT') || line.toUpperCase().includes('DIAGRAM') || line.toUpperCase().includes('SCHEMATIC') || line.toUpperCase().includes('CONNECTION')) {
          title = line;
          break;
        }
      }
    }

    results.push({
      page,
      drawings: cleanedDrawings,
      title: title.slice(0, 100),
      system,
      sheetInfo,
      textSample: lines.slice(0, 5).join(' | ').slice(0, 150)
    });
  }

  const outputPath = join(process.cwd(), 'scratch', 'pdf_scan_results.json');
  fs.mkdirSync(join(process.cwd(), 'scratch'), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nScan complete! Results written to ${outputPath}`);
}

main().catch(console.error);
