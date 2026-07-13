import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since we can't easily import the mappings file, we'll recreate the essential data here
const ALL_DRAWING_MAPPINGS = [
    // MAIN_SCHEMATIC_MAPPINGS
    { drawingNumber: '942-58100', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-58101', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-58102', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 9, verified: false, sheets: 4 },
    { drawingNumber: '942-58103', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 13, verified: false, sheets: 4 },
    { drawingNumber: '942-58104', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 17, verified: false, sheets: 8 },
    { drawingNumber: '942-58105', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 25, verified: false, sheets: 3 },
    { drawingNumber: '942-58106', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 28, verified: false },
    { drawingNumber: '942-58107', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 33, verified: false },
    { drawingNumber: '942-58108', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 39, verified: false },
    { drawingNumber: '942-58119', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 45, verified: false },
    { drawingNumber: '942-58120', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 49, verified: false },
    { drawingNumber: '942-58121', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 53, verified: false, sheets: 6 },
    { drawingNumber: '942-58137', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 54, verified: false },
    { drawingNumber: '942-58138', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 55, verified: false, sheets: 4 },
    { drawingNumber: '942-58139', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 59, verified: false },
    { drawingNumber: '942-58140', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 57, verified: false },
    { drawingNumber: '942-58141', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 58, verified: false },
    { drawingNumber: '942-58142', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 59, verified: true },
    { drawingNumber: '942-58123', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 60, verified: false },
    { drawingNumber: '942-58124', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 62, verified: false },
    { drawingNumber: '942-58125', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 64, verified: false },
    { drawingNumber: '942-58126', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 66, verified: false },
    { drawingNumber: '942-58127', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 68, verified: false },
    { drawingNumber: '942-58128', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 69, verified: false },
    { drawingNumber: '942-58129', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 70, verified: false },
    { drawingNumber: '942-58130', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 71, verified: false },
    { drawingNumber: '942-58131', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 72, verified: false },
    { drawingNumber: '942-58132', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 73, verified: false },
    { drawingNumber: '942-58143', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 74, verified: false },
    { drawingNumber: '942-58144', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 75, verified: false },
    { drawingNumber: '942-58145', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 76, verified: false, sheets: 2 },
    { drawingNumber: '942-58146', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 78, verified: false },
    { drawingNumber: '942-58147', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 79, verified: false },
    { drawingNumber: '942-58148', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 80, verified: false },
    { drawingNumber: '942-58149', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 70, verified: true },
    { drawingNumber: '942-58150', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 82, verified: false },
    { drawingNumber: '942-58151', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 83, verified: false },
    { drawingNumber: '942-58152', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 84, verified: false },
    { drawingNumber: '942-58153', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 85, verified: false },
    { drawingNumber: '942-58154', pdfFile: 'KMRCL VCC Drawings_OCR.pdf', pageNumber: 86, verified: false },

    // CAB_PIN_MAPPINGS
    { drawingNumber: '942-38103', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 1, verified: false, sheets: 8 },
    { drawingNumber: '942-38104', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 9, verified: false, sheets: 8 },
    { drawingNumber: '942-38105', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 17, verified: false, sheets: 3 },
    { drawingNumber: '942-38108', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 20, verified: false },
    { drawingNumber: '942-38109', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 21, verified: false },
    { drawingNumber: '942-38111', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 22, verified: false },
    { drawingNumber: '942-38112', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 23, verified: false },
    { drawingNumber: '942-38113', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 24, verified: false },
    { drawingNumber: '942-38117', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 25, verified: false },
    { drawingNumber: '942-38118', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 26, verified: false },
    { drawingNumber: '942-38119', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 27, verified: false },
    { drawingNumber: '942-38120', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 28, verified: false },
    { drawingNumber: '942-38121', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 29, verified: false },
    { drawingNumber: '942-38122', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 30, verified: false },
    { drawingNumber: '942-38110', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 31, verified: false },
    { drawingNumber: '942-38128', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 32, verified: false },
    { drawingNumber: '942-38409', pdfFile: 'CAB_PIN DRAWINGS.pdf', pageNumber: 33, verified: false },

    // DMC_UF_PIN_MAPPINGS
    { drawingNumber: '942-38305', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 1, verified: false },
    { drawingNumber: '942-38306', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 3, verified: false },
    { drawingNumber: '942-38307', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-38309', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-38310', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 9, verified: false },
    { drawingNumber: '942-38312', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 11, verified: false, sheets: 3 },
    { drawingNumber: '942-38314', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 14, verified: false },
    { drawingNumber: '942-38315', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 15, verified: false },
    { drawingNumber: '942-38316', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 16, verified: false },
    { drawingNumber: '942-38317', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 17, verified: false },
    { drawingNumber: '942-38319', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 18, verified: false },
    { drawingNumber: '942-38320', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 19, verified: false },
    { drawingNumber: '942-38321', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 20, verified: false },
    { drawingNumber: '942-38323', pdfFile: 'DMC UF_PIN DRAWINGS.pdf', pageNumber: 21, verified: false },

    // DMC_CEILING_MAPPINGS
    { drawingNumber: '942-38402', pdfFile: 'DMC_CEILING.pdf', pageNumber: 1, verified: false },
    { drawingNumber: '942-38404', pdfFile: 'DMC_CEILING.pdf', pageNumber: 3, verified: false },
    { drawingNumber: '942-38405', pdfFile: 'DMC_CEILING.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-38406', pdfFile: 'DMC_CEILING.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-38407', pdfFile: 'DMC_CEILING.pdf', pageNumber: 9, verified: false },
    { drawingNumber: '942-38409', pdfFile: 'DMC_CEILING.pdf', pageNumber: 11, verified: false },
    { drawingNumber: '942-38410', pdfFile: 'DMC_CEILING.pdf', pageNumber: 13, verified: false },
    { drawingNumber: '942-38413', pdfFile: 'DMC_CEILING.pdf', pageNumber: 15, verified: false },

    // TC_UF_PIN_MAPPINGS
    { drawingNumber: '942-38505', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 1, verified: false },
    { drawingNumber: '942-38506', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 3, verified: false },
    { drawingNumber: '942-38507', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-38508', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-38510', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 9, verified: false },
    { drawingNumber: '942-38512', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 11, verified: false },
    { drawingNumber: '942-38514', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 13, verified: false },
    { drawingNumber: '942-38516', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 15, verified: false },
    { drawingNumber: '942-38518', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 17, verified: false },
    { drawingNumber: '942-38519', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 19, verified: false },
    { drawingNumber: '942-38521', pdfFile: 'TC _UF PIN DRAWINGS.pdf', pageNumber: 21, verified: false },

    // TC_CEILING_PIN_MAPPINGS
    { drawingNumber: '942-38602', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 1, verified: false },
    { drawingNumber: '942-38603', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 3, verified: false },
    { drawingNumber: '942-38604', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-38605', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-38607', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 9, verified: false },
    { drawingNumber: '942-38608', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 11, verified: false },
    { drawingNumber: '942-38614', pdfFile: 'TC_CEILING PIN DRAWINGS.pdf', pageNumber: 13, verified: false },

    // MC_UF_MAPPINGS
    { drawingNumber: '942-38101', pdfFile: 'MC_UF.pdf', pageNumber: 1, verified: false },
    { drawingNumber: '942-38102', pdfFile: 'MC_UF.pdf', pageNumber: 3, verified: false },
    { drawingNumber: '942-38103', pdfFile: 'MC_UF.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-38104', pdfFile: 'MC_UF.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-38105', pdfFile: 'MC_UF.pdf', pageNumber: 9, verified: false },
    { drawingNumber: '942-38106', pdfFile: 'MC_UF.pdf', pageNumber: 11, verified: false },
    { drawingNumber: '942-38120', pdfFile: 'MC_UF.pdf', pageNumber: 13, verified: false },
    { drawingNumber: '942-38122', pdfFile: 'MC_UF.pdf', pageNumber: 15, verified: false },
    { drawingNumber: '942-38124', pdfFile: 'MC_UF.pdf', pageNumber: 17, verified: false },

    // MC_CEILING_PIN_MAPPINGS
    { drawingNumber: '942-38604', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 1, verified: false },
    { drawingNumber: '942-38605', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 3, verified: false },
    { drawingNumber: '942-38606', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 5, verified: false },
    { drawingNumber: '942-38607', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 7, verified: false },
    { drawingNumber: '942-38608', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 9, verified: false },
    { drawingNumber: '942-38710', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 11, verified: false },
    { drawingNumber: '942-38711', pdfFile: 'MC_CEILING_PIN DRAWINGS.pdf', pageNumber: 13, verified: false },

    // VCC_DESCRIPTION_MAPPINGS
    { drawingNumber: 'VCC-001', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 1, verified: false },
    { drawingNumber: 'VCC-002', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 3, verified: false },
    { drawingNumber: 'VCC-003', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 10, verified: false },
    { drawingNumber: 'VCC-004', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 20, verified: false },
    { drawingNumber: 'VCC-005', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 25, verified: false },
    { drawingNumber: 'VCC-006', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 30, verified: false },
    { drawingNumber: 'VCC-007', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 35, verified: false },
    { drawingNumber: 'VCC-008', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 40, verified: false },
    { drawingNumber: 'VCC-009', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 45, verified: false },
    { drawingNumber: 'VCC-010', pdfFile: 'VCC DESCRIPTION 13.12.2017.pdf', pageNumber: 50, verified: false },
];

async function fullSyncWithMappings() {
    console.log('Starting full synchronization with accurate mappings...\n');

    // Get all source files
    const sourceFiles = await prisma.sourceFile.findMany();
    console.log(`Found ${sourceFiles.length} source files in database`);

    // Process each mapping
    let processedMappings = 0;
    let createdDrawings = 0;
    let updatedDrawings = 0;

    for (const mapping of ALL_DRAWING_MAPPINGS) {
        try {
            // Find the source file
            const sourceFile = sourceFiles.find(f => f.filename === mapping.pdfFile);
            if (!sourceFile) {
                console.log(`  WARNING: Source file ${mapping.pdfFile} not found`);
                continue;
            }

            // Find or create the drawing
            let drawing = await prisma.drawing.findFirst({
                where: { drawingNo: mapping.drawingNumber }
            });

            if (!drawing) {
                drawing = await prisma.drawing.create({
                    data: {
                        drawingNo: mapping.drawingNumber,
                        title: `Drawing ${mapping.drawingNumber}`,
                        projectId: 'default-project',
                        totalSheets: mapping.sheets || 1,
                        isSynced: true,
                        syncedAt: new Date()
                    }
                });
                createdDrawings++;
                console.log(`  Created drawing ${mapping.drawingNumber}`);
            } else if (!drawing.isSynced) {
                drawing = await prisma.drawing.update({
                    where: { id: drawing.id },
                    data: {
                        isSynced: true,
                        syncedAt: new Date(),
                        totalSheets: mapping.sheets || drawing.totalSheets
                    }
                });
                updatedDrawings++;
                console.log(`  Updated drawing ${mapping.drawingNumber} sync status`);
            }

            // Create or update page mapping
            await prisma.drawingPageMapping.upsert({
                where: {
                    drawingId_sourceFileId: {
                        drawingId: drawing.id,
                        sourceFileId: sourceFile.id
                    }
                },
                create: {
                    drawingId: drawing.id,
                    sourceFileId: sourceFile.id,
                    sourceFileName: mapping.pdfFile,
                    pdfPageNo: mapping.pageNumber,
                    drawingNumber: mapping.drawingNumber,
                    verified: mapping.verified,
                    confidence: mapping.verified ? 1.0 : 0.8
                },
                update: {
                    pdfPageNo: mapping.pageNumber,
                    verified: mapping.verified,
                    confidence: mapping.verified ? 1.0 : 0.8,
                    updatedAt: new Date()
                }
            });

            processedMappings++;
            if (processedMappings % 50 === 0) {
                console.log(`  Processed ${processedMappings}/${ALL_DRAWING_MAPPINGS.length} mappings...`);
            }
        } catch (error: any) {
            console.error(`  ERROR processing mapping for ${mapping.drawingNumber}:`, error.message);
        }
    }

    console.log('\nFull synchronization complete!');

    // Final verification
    const totalMappings = await prisma.drawingPageMapping.count();
    const verifiedMappings = await prisma.drawingPageMapping.count({
        where: { verified: true }
    });
    const syncedDrawings = await prisma.drawing.count({
        where: { isSynced: true }
    });

    console.log(`\nFINAL SYNCHRONIZATION REPORT:`);
    console.log(`=====================================`);
    console.log(`- Total mappings processed: ${processedMappings}`);
    console.log(`- Total page mappings in DB: ${totalMappings}`);
    console.log(`- Verified mappings: ${verifiedMappings}`);
    console.log(`- Created drawings: ${createdDrawings}`);
    console.log(`- Updated drawings: ${updatedDrawings}`);
    console.log(`- Synced drawings: ${syncedDrawings}`);

    process.exit(0);
}

fullSyncWithMappings().catch(e => { console.error(e); process.exit(1); });