import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assessProductionReadiness() {
    try {
        console.log('Assessing production readiness...\n');

        // Collect all metrics
        const [
            totalWires,
            totalDrawings,
            totalConnectors,
            totalPins,
            drawingWireLinks,
        ] = await Promise.all([
            prisma.wire.count(),
            prisma.drawing.count(),
            prisma.connector.count(),
            prisma.connectorPin.count(),
            prisma.drawingWire.count(),
        ]);

        // Get wire status breakdown
        const wireStatusResult = await prisma.$queryRaw<Array<{ wireStatus: string; count: number }>>`
      SELECT "wireStatus", COUNT(*)::int as count FROM "Wire" GROUP BY "wireStatus"
    `;

        const verifiedWires = wireStatusResult.find(w => w.wireStatus === 'VERIFIED')?.count || 0;
        const unverifiedWires = wireStatusResult.find(w => w.wireStatus === 'UNVERIFIED')?.count || 0;
        const deprecatedWires = wireStatusResult.find(w => w.wireStatus === 'DEPRECATED')?.count || 0;

        // Empty drawings
        const emptyDrawings = await prisma.drawing.count({
            where: {
                connectors: { none: {} }
            }
        });
        const drawingsWithConnectors = totalDrawings - emptyDrawings;

        // Data linkage analysis
        const [missingSource, missingDest, pinsWithoutWires] = await Promise.all([
            prisma.wire.count({
                where: {
                    OR: [
                        { sourceConnector: null },
                        { sourceEquipment: null }
                    ]
                }
            }),
            prisma.wire.count({
                where: {
                    OR: [
                        { destConnector: null },
                        { destEquipment: null }
                    ]
                }
            }),
            prisma.connectorPin.count({
                where: {
                    wireNo: null,
                    wireEndpoints: { none: {} }
                }
            })
        ]);

        // Calculate metrics
        const drawingCoverageScore = (drawingsWithConnectors / totalDrawings) * 100;
        const wireLinkCoverageScore = (drawingWireLinks / totalWires) * 100;
        const sourceCompletenessScore = ((totalWires - missingSource) / totalWires) * 100;
        const destCompletenessScore = ((totalWires - missingDest) / totalWires) * 100;

        const integrityScore = Math.round(
            (drawingCoverageScore * 0.25) +
            (wireLinkCoverageScore * 0.25) +
            (sourceCompletenessScore * 0.25) +
            (destCompletenessScore * 0.25)
        );

        // Verification status
        const verifiedPercentage = (verifiedWires / totalWires) * 100;
        const unverifiedPercentage = (unverifiedWires / totalWires) * 100;
        const deprecatedPercentage = (deprecatedWires / totalWires) * 100;

        // Display results
        console.log('=== PRODUCTION READINESS ASSESSMENT ===\n');

        console.log('DATABASE METRICS:');
        console.log(`  Total Wires: ${totalWires.toLocaleString()}`);
        console.log(`  Total Drawings: ${totalDrawings.toLocaleString()}`);
        console.log(`  Total Connectors: ${totalConnectors.toLocaleString()}`);
        console.log(`  Total Pins: ${totalPins.toLocaleString()}`);
        console.log(`  Drawing-Wire Links: ${drawingWireLinks.toLocaleString()}\n`);

        console.log('WIRE STATUS:');
        console.log(`  VERIFIED: ${verifiedWires.toLocaleString()} (${verifiedPercentage.toFixed(1)}%)`);
        console.log(`  UNVERIFIED: ${unverifiedWires.toLocaleString()} (${unverifiedPercentage.toFixed(1)}%)`);
        console.log(`  DEPRECATED: ${deprecatedWires.toLocaleString()} (${deprecatedPercentage.toFixed(1)}%)\n`);

        console.log('DATA COMPLETENESS:');
        console.log(`  Drawings with connectors: ${drawingsWithConnectors}/${totalDrawings} (${drawingCoverageScore.toFixed(1)}%)`);
        console.log(`  Empty drawings: ${emptyDrawings}`);
        console.log(`  Wire source completeness: ${sourceCompletenessScore.toFixed(1)}%`);
        console.log(`  Wire destination completeness: ${destCompletenessScore.toFixed(1)}%`);
        console.log(`  Drawing-wire link coverage: ${wireLinkCoverageScore.toFixed(1)}%`);
        console.log(`  Pin-wire link coverage: ${(((totalPins - pinsWithoutWires) / totalPins) * 100).toFixed(1)}%\n`);

        console.log('DATA INTEGRITY SCORE:');
        const scoreColor = integrityScore > 75 ? 'GREEN' : integrityScore > 50 ? 'YELLOW' : 'RED';
        const scoreRating = integrityScore > 75 ? 'EXCELLENT' : integrityScore > 50 ? 'FAIR' : 'POOR';
        console.log(`  ${integrityScore}/100 - ${scoreRating} (${scoreColor})\n`);

        console.log('PRODUCTION READINESS:');
        if (integrityScore >= 75) {
            console.log('  ✅ READY FOR PRODUCTION');
            console.log('  All key metrics are within acceptable ranges for production deployment.');
        } else if (integrityScore >= 50) {
            console.log('  ⚠️  PARTIAL READINESS - Additional work recommended');
            console.log('  Key metrics indicate fair quality but require improvement before production.');
        } else {
            console.log('  ❌ NOT READY FOR PRODUCTION');
            console.log('  Key metrics are below acceptable thresholds. Significant work required.');
        }

        console.log('\nKEY FINDINGS:');
        if (emptyDrawings > 0) {
            console.log(`  • ${emptyDrawings} drawings have no connectors (need attention)`);
        }
        if (missingSource > 0) {
            console.log(`  • ${missingSource} wires missing source data (manual verification needed)`);
        }
        if (missingDest > 0) {
            console.log(`  • ${missingDest} wires missing destination data (manual verification needed)`);
        }
        if (unverifiedWires > 0) {
            console.log(`  • ${unverifiedWires} wires not yet verified (verification workflow needed)`);
        }

        console.log('\nRECOMMENDATIONS:');
        if (integrityScore < 75) {
            console.log('  1. Implement wire verification workflow to increase VERIFIED wire count');
            console.log('  2. Populate missing source/destination data for wires');
            console.log('  3. Address empty drawings (populate or mark deprecated)');
            console.log('  4. Run comprehensive data validation checks');
        }

        if (integrityScore < 50) {
            console.log('  5. Consider additional data import/OCR extraction from PDFs');
            console.log('  6. Implement automated data quality checks');
            console.log('  7. Conduct thorough regression testing');
        }

        console.log('\n=== ASSESSMENT COMPLETE ===');

    } catch (error) {
        console.error('Error assessing production readiness:', error);
    } finally {
        await prisma.$disconnect();
    }
}

assessProductionReadiness();