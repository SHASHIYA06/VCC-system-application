import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * VALIDATION AUDIT: Understand the 4,609 ValidationIssue errors
 * 
 * Purpose: Group issues by type/severity and show samples
 * Result: Identify which errors can be mass-resolved vs which need manual fixing
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auditing ValidationIssue records...');

    // STEP 1: Group by severity and issueType
    const grouped = await prisma.validationIssue.groupBy({
      by: ['severity', 'issueType'],
      _count: { id: true },
      orderBy: [{ severity: 'asc' }, { _count: { id: 'desc' } }],
    });

    console.log(`📊 Found ${grouped.length} unique (severity, issueType) combinations`);

    // STEP 2: Get sample issues for manual review
    const sampleSize = 30;
    const samples = await prisma.validationIssue.findMany({
      where: { resolved: false },
      take: sampleSize,
      orderBy: { severity: 'asc' },
      select: {
        id: true,
        severity: true,
        issueType: true,
        sourceTable: true,
        sourceId: true,
        message: true,
        resolved: true,
        createdAt: true,
      },
    });

    console.log(`📋 Retrieved ${samples.length} sample issues`);

    // STEP 3: Count resolved vs unresolved
    const [resolved, unresolved, total] = await Promise.all([
      prisma.validationIssue.count({ where: { resolved: true } }),
      prisma.validationIssue.count({ where: { resolved: false } }),
      prisma.validationIssue.count(),
    ]);

    console.log(`📊 Resolved: ${resolved}, Unresolved: ${unresolved}, Total: ${total}`);

    // STEP 4: Identify critical issue types that block functionality
    const criticalTypes = ['MISSING_WIRE_ENDPOINT', 'ORPHANED_WIRE', 'INVALID_CONNECTOR', 'DUPLICATE_PIN'];
    const criticalIssues = grouped.filter(g => criticalTypes.includes(g.issueType));

    // STEP 5: Build recommendations
    const recommendations: string[] = [];

    if (unresolved > 0) {
      const unresolvedPercent = ((unresolved / total) * 100).toFixed(1);
      recommendations.push(
        `⚠️ ${unresolved} unresolved issues (${unresolvedPercent}% of ${total} total)`
      );
    }

    if (criticalIssues.length > 0) {
      const criticalCount = criticalIssues.reduce((sum, g) => sum + g._count.id, 0);
      recommendations.push(
        `🚨 ${criticalCount} critical issues blocking functionality`
      );
      recommendations.push('→ Use /api/resolve-validation-issues?type=ISSUE_TYPE to mass-resolve by type');
    }

    if (unresolved < 100) {
      recommendations.push('✅ Most issues already resolved - only minor cleanup needed');
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: total,
        resolvedCount: resolved,
        unresolvedCount: unresolved,
        resolutionPercent: ((resolved / total) * 100).toFixed(1),
      },
      groupedByType: grouped.map(g => ({
        severity: g.severity,
        issueType: g.issueType,
        count: g._count.id,
        percentOfTotal: ((g._count.id / total) * 100).toFixed(2),
      })),
      criticalIssuesFound: criticalIssues.map(g => ({
        issueType: g.issueType,
        count: g._count.id,
        resolution: `Use /api/resolve-validation-issues?type=${g.issueType}&auto=true to mass-resolve`,
      })),
      sampleIssues: samples,
      samplesShown: samples.length,
      recommendations,
      nextStep: 'Review samples above. Share the JSON with your team to decide which types to mass-resolve.',
    });
  } catch (error) {
    console.error('❌ Audit failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Validation audit failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to mass-resolve issues by type
 * Example: POST /api/validation-audit?type=MISSING_WIRE_ENDPOINT&auto=true
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const issueType = searchParams.get('type');
  const autoResolve = searchParams.get('auto') === 'true';

  if (!issueType) {
    return NextResponse.json(
      { error: 'Missing ?type parameter' },
      { status: 400 }
    );
  }

  if (!autoResolve) {
    return NextResponse.json(
      { error: 'Must confirm with ?auto=true' },
      { status: 400 }
    );
  }

  try {
    console.log(`🔧 Mass-resolving issues of type: ${issueType}`);

    const result = await prisma.validationIssue.updateMany({
      where: { issueType, resolved: false },
      data: { resolved: true },
    });

    console.log(`✅ Resolved ${result.count} issues of type ${issueType}`);

    return NextResponse.json({
      status: 'success',
      issueType,
      recordsResolved: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Mass-resolve failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Mass-resolve failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
