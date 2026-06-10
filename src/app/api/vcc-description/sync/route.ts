/**
 * VCC Description Sync API
 * POST /api/vcc-description/sync
 * 
 * Synchronizes VCC system descriptions from PDF documents
 * Updates database with extracted technical specifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractVCCDescriptionFromPDF, extractAllVCCDescriptions } from '@/lib/services/pdf-extract';

const prisma = new PrismaClient();

interface SyncResult {
  systemCode: string;
  systemName: string;
  status: 'success' | 'failed' | 'skipped';
  description?: string;
  error?: string;
  confidence?: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const results: SyncResult[] = [];

  try {
    console.log('🔄 Starting VCC Description sync...');

    // 1. Get all systems from database
    const systems = await prisma.system.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: 'asc' }
    });

    if (!systems.length) {
      return NextResponse.json({
        success: false,
        message: 'No systems found in database',
        executionTime: Date.now() - startTime
      }, { status: 400 });
    }

    console.log(`📊 Found ${systems.length} systems to sync`);

    // 2. Extract VCC descriptions from all PDFs
    const vccDescriptions = await extractAllVCCDescriptions();

    // 3. Sync each system
    let successCount = 0;
    let failureCount = 0;

    for (const system of systems) {
      try {
        const description = vccDescriptions.get(system.code);

        if (description) {
          // Upsert VCC Description
          await prisma.vCCDescription.upsert({
            where: { systemCode: system.code },
            update: {
              systemName: system.name,
              description: description.text,
              technicalSpecs: description.specs,
              powerRequirements: description.power,
              voltage: description.voltage,
              current: description.current,
              frequency: description.frequency,
              lastUpdated: new Date(),
              source: 'PDF',
              extra: {
                pdfPage: description.page,
                confidence: description.confidence,
                extractedAt: new Date().toISOString()
              }
            },
            create: {
              systemCode: system.code,
              systemName: system.name,
              description: description.text,
              technicalSpecs: description.specs,
              powerRequirements: description.power,
              voltage: description.voltage,
              current: description.current,
              frequency: description.frequency,
              source: 'PDF',
              extra: {
                pdfPage: description.page,
                confidence: description.confidence,
                extractedAt: new Date().toISOString()
              }
            }
          });

          // Update system metadata
          await prisma.systemMetadata.upsert({
            where: { systemCode: system.code },
            update: {
              dataCompleteness: 0.9,
              lastSyncTime: new Date(),
              syncStatus: 'COMPLETE',
              syncErrors: null
            },
            create: {
              systemCode: system.code,
              dataCompleteness: 0.9,
              lastSyncTime: new Date(),
              syncStatus: 'COMPLETE'
            }
          });

          results.push({
            systemCode: system.code,
            systemName: system.name,
            status: 'success',
            description: description.text.substring(0, 80) + '...',
            confidence: description.confidence,
            timestamp: new Date().toISOString()
          });

          successCount++;
        } else {
          // No description found for this system
          results.push({
            systemCode: system.code,
            systemName: system.name,
            status: 'skipped',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        failureCount++;

        const errorMsg = error instanceof Error ? error.message : 'Unknown error';

        // Update metadata with error status
        await prisma.systemMetadata.upsert({
          where: { systemCode: system.code },
          update: {
            syncStatus: 'FAILED',
            syncErrors: errorMsg
          },
          create: {
            systemCode: system.code,
            syncStatus: 'FAILED',
            syncErrors: errorMsg
          }
        });

        results.push({
          systemCode: system.code,
          systemName: system.name,
          status: 'failed',
          error: errorMsg,
          timestamp: new Date().toISOString()
        });

        console.error(`❌ Failed to sync ${system.code}:`, errorMsg);
      }
    }

    const executionTime = Date.now() - startTime;

    console.log(`✅ VCC Description sync completed: ${successCount} success, ${failureCount} failed`);

    return NextResponse.json({
      success: true,
      message: 'VCC Description sync completed',
      results,
      summary: {
        total: systems.length,
        synced: successCount,
        skipped: systems.length - successCount - failureCount,
        failed: failureCount,
        successRate: ((successCount / systems.length) * 100).toFixed(2) + '%',
        executionTime
      }
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error('❌ VCC Description sync failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
      executionTime
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const systemCode = searchParams.get('systemCode');

    if (systemCode) {
      // Get specific system description
      const description = await prisma.vCCDescription.findUnique({
        where: { systemCode }
      });

      if (!description) {
        return NextResponse.json({
          success: false,
          message: 'System description not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: description
      });
    } else {
      // Get all system descriptions with stats
      const descriptions = await prisma.vCCDescription.findMany({
        select: {
          systemCode: true,
          systemName: true,
          source: true,
          lastUpdated: true,
          extra: true
        },
        orderBy: { systemCode: 'asc' }
      });

      return NextResponse.json({
        success: true,
        count: descriptions.length,
        data: descriptions
      });
    }
  } catch (error) {
    console.error('❌ Failed to fetch VCC descriptions:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
