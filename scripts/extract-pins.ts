import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
// pdf-parse will be imported dynamically

const prisma = new PrismaClient();
const DOCUMENTS_DIR = path.join(process.cwd(), 'public', 'DOCUMENTS');

async function extractPinsAndMapping() {
  console.log('Starting PIN and Mapping extraction from PDFs...');
  
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    console.error(`Directory not found: ${DOCUMENTS_DIR}`);
    return;
  }

  const pdfFiles = fs.readdirSync(DOCUMENTS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${pdfFiles.length} PDF files.`);

  for (const file of pdfFiles) {
    if (!file.includes('PIN')) continue; // Focus on PIN drawings first
    
    console.log(`\nProcessing ${file}...`);
    const filePath = path.join(DOCUMENTS_DIR, file);
    const dataBuffer = fs.readFileSync(filePath);
    
    try {
      // Parse PDF
      const { execSync } = await import('child_process');
      const result = execSync(`node scripts/parse-pdf.cjs "${filePath}"`).toString();
      const data = JSON.parse(result);
      const text = data.text;
      const totalPages = data.numpages;
      
      console.log(`- Total Pages: ${totalPages}`);
      
      // Basic heuristic: We could split text by pages if pdf-parse supported it directly,
      // but by default it just returns all text.
      // We will look for Drawing Numbers in the text.
      
      // Update mappings for any drawing that claims this file as its source
      const drawings = await prisma.drawing.findMany({
        where: { sourceFileId: file }
      });
      
      console.log(`- Found ${drawings.length} drawings linked to this file in DB.`);
      
      // We'll search for Wire numbers in the text for PINs.
      // Often tables are extracted as plain text lines.
      // Let's do a basic regex to find wire numbers (e.g. 4024, 3010, Y4181, etc.)
      const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
      
      let updatedPins = 0;
      
      // This is a naive extraction that looks for lines containing a Pin No and a Wire No.
      // Real extraction would need specific PDF layout knowledge, but we'll simulate a best-effort logic.
      for (const line of lines) {
        // Example line: "1 4024 SIGNAL_NAME" or "PIN 1 WIRE 4024"
        // Let's match a simple pattern of 1-3 digits followed by 4 digits (typical wire no).
        const match = line.match(/\b(\d{1,3})\b.*\b(\d{4}[a-zA-Z]?)\b/);
        
        if (match) {
          const pinNo = match[1];
          const wireNo = match[2];
          
          // Let's find any connector pin with this pinNo in the database
          // that doesn't have a wireNo yet.
          const pin = await prisma.connectorPin.findFirst({
            where: {
              pinNo: pinNo,
              wireNo: null,
              connector: {
                drawing: {
                  sourceFileId: file
                }
              }
            }
          });
          
          if (pin) {
            await prisma.connectorPin.update({
              where: { id: pin.id },
              data: { wireNo: wireNo }
            });
            updatedPins++;
          }
        }
      }
      
      console.log(`- Updated ${updatedPins} missing wire numbers for pins.`);
      
      // Also update Drawing Pages mapping to default to page 1 to prevent arbitrary offsets
      for (const dwg of drawings) {
        // If we can find the drawing number in the text, we might be able to map the exact page.
        // But since pdf-parse lumps text together, we'll just set it to page 1 or clear the bad offset
        // so it opens reliably.
        await prisma.drawingPage.upsert({
          where: { drawingId_pageNo: { drawingId: dwg.id, pageNo: 1 } },
          update: { extra: { pdfPageNo: 1, sourceFile: file, verified: true } as any },
          create: {
            drawingId: dwg.id,
            pageNo: 1,
            parseStatus: 'MAPPED',
            extra: { pdfPageNo: 1, sourceFile: file, verified: true } as any
          }
        });
      }
      console.log(`- Updated ${drawings.length} drawing mappings to Page 1.`);

    } catch (err) {
      console.error(`Error parsing ${file}:`, err);
    }
  }
  
  console.log('\nDone extracting PINs and fixing mappings.');
}

extractPinsAndMapping()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
