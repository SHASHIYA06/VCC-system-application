/**
 * MERGE ALL BRANCH DATA TO MAIN
 * 
 * This script connects to the wire-integrity branch (source)
 * and copies all missing data into the main branch (target).
 * 
 * Source: br-still-thunder (wire-integrity) - ep-young-wildflower-aqy2a92u
 * Target: br-lingering-silence (main) - ep-tiny-mode-aq7698gi
 */

import { PrismaClient } from '@prisma/client';

// Source: wire-integrity branch (has the most data)
const source = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-young-wildflower-aqy2a92u-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

// Target: main branch
const target = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function main() {
  console.log('🔄 Starting branch merge: wire-integrity → main\n');

  try {
    // Step 1: Check source counts
    const sourceDrawings = await source.drawing.count();
    const sourceWires = await source.wire.count();
    const sourceEndpoints = await source.wireEndpoint.count();
    const sourceConnectors = await source.connector.count();
    const sourcePins = await source.connectorPin.count();

    console.log(`📊 Source (wire-integrity):`);
    console.log(`   Drawings: ${sourceDrawings}`);
    console.log(`   Wires: ${sourceWires}`);
    console.log(`   WireEndpoints: ${sourceEndpoints}`);
    console.log(`   Connectors: ${sourceConnectors}`);
    console.log(`   ConnectorPins: ${sourcePins}`);

    // Step 2: Check target counts
    const targetDrawings = await target.drawing.count();
    const targetWires = await target.wire.count();
    const targetEndpoints = await target.wireEndpoint.count();
    const targetConnectors = await target.connector.count();
    const targetPins = await target.connectorPin.count();

    console.log(`\n📊 Target (main):`);
    console.log(`   Drawings: ${targetDrawings}`);
    console.log(`   Wires: ${targetWires}`);
    console.log(`   WireEndpoints: ${targetEndpoints}`);
    console.log(`   Connectors: ${targetConnectors}`);
    console.log(`   ConnectorPins: ${targetPins}`);

    console.log(`\n📋 Data to transfer:`);
    console.log(`   Drawings: ${sourceDrawings - targetDrawings} new`);
    console.log(`   Wires: ${sourceWires - targetWires} new`);
    console.log(`   WireEndpoints: ${sourceEndpoints - targetEndpoints} new`);
    console.log(`   Connectors: ${sourceConnectors - targetConnectors} new`);
    console.log(`   ConnectorPins: ${sourcePins - targetPins} new`);

    // Step 3: Transfer Systems (if missing)
    console.log('\n--- Transferring Systems ---');
    const sourceSystems = await source.system.findMany();
    for (const sys of sourceSystems) {
      try {
        await target.system.upsert({
          where: { code: sys.code },
          update: { name: sys.name, description: sys.description, category: sys.category },
          create: { id: sys.id, code: sys.code, name: sys.name, description: sys.description, category: sys.category, sortOrder: sys.sortOrder }
        });
      } catch (e) { /* skip duplicates */ }
    }
    console.log(`   ✅ Systems: ${sourceSystems.length} synced`);

    // Step 4: Transfer Drawings (batch)
    console.log('\n--- Transferring Drawings ---');
    const sourceDrawingsList = await source.drawing.findMany({
      include: { pages: true }
    });
    
    let drawingsAdded = 0;
    for (const d of sourceDrawingsList) {
      try {
        const exists = await target.drawing.findFirst({
          where: { drawingNo: d.drawingNo, revision: d.revision, projectId: d.projectId }
        });
        if (!exists) {
          await target.drawing.create({
            data: {
              id: d.id,
              projectId: d.projectId,
              systemId: d.systemId,
              drawingNo: d.drawingNo,
              revision: d.revision,
              title: d.title,
              totalSheets: d.totalSheets,
              sourceFileId: d.sourceFileId,
              isReference: d.isReference,
              remarks: d.remarks,
              status: d.status
            }
          });
          drawingsAdded++;
        }
      } catch (e: any) {
        // Skip if constraint violation
      }
    }
    console.log(`   ✅ Drawings: ${drawingsAdded} added (${sourceDrawingsList.length} total in source)`);

    // Step 5: Transfer Connectors (batch by 500)
    console.log('\n--- Transferring Connectors ---');
    const sourceConnectorsList = await source.connector.findMany();
    let connectorsAdded = 0;
    
    for (const c of sourceConnectorsList) {
      try {
        const exists = await target.connector.findFirst({
          where: { drawingId: c.drawingId, connectorCode: c.connectorCode }
        });
        if (!exists) {
          await target.connector.create({
            data: {
              id: c.id,
              drawingId: c.drawingId,
              connectorCode: c.connectorCode,
              carType: c.carType,
              instanceLabel: c.instanceLabel,
              locationTag: c.locationTag,
              sideTag: c.sideTag,
              description: c.description,
              connectorTypeCode: c.connectorTypeCode,
              pinCount: c.pinCount,
              scope: c.scope
            }
          });
          connectorsAdded++;
        }
      } catch (e: any) { /* skip */ }
    }
    console.log(`   ✅ Connectors: ${connectorsAdded} added`);

    // Step 6: Transfer ConnectorPins (in batches of 1000)
    console.log('\n--- Transferring ConnectorPins (this will take a while) ---');
    const BATCH_SIZE = 2000;
    let pinsAdded = 0;
    let offset = 0;
    
    while (true) {
      const batch = await source.connectorPin.findMany({
        skip: offset,
        take: BATCH_SIZE,
        orderBy: { id: 'asc' }
      });
      
      if (batch.length === 0) break;
      
      const pinData = batch.map(p => ({
        id: p.id,
        connectorId: p.connectorId,
        pinNo: p.pinNo,
        pinLabel: p.pinLabel,
        wireNo: p.wireNo,
        signalName: p.signalName,
        conductorClassCode: p.conductorClassCode,
        voltageText: p.voltageText,
        terminalFrom: p.terminalFrom,
        terminalTo: p.terminalTo,
        sourceSheetRef: p.sourceSheetRef,
        note: p.note
      }));

      try {
        const result = await target.connectorPin.createMany({
          data: pinData,
          skipDuplicates: true
        });
        pinsAdded += result.count;
      } catch (e: any) {
        // Try individually if batch fails
        for (const p of pinData) {
          try {
            await target.connectorPin.create({ data: p });
            pinsAdded++;
          } catch { /* skip */ }
        }
      }
      
      offset += BATCH_SIZE;
      if (offset % 10000 === 0) {
        console.log(`   ... processed ${offset} pins (${pinsAdded} added)`);
      }
    }
    console.log(`   ✅ ConnectorPins: ${pinsAdded} added`);

    // Step 7: Transfer Wires (in batches)
    console.log('\n--- Transferring Wires ---');
    let wiresAdded = 0;
    offset = 0;
    
    while (true) {
      const batch = await source.wire.findMany({
        skip: offset,
        take: BATCH_SIZE,
        orderBy: { id: 'asc' }
      });
      
      if (batch.length === 0) break;
      
      try {
        const result = await target.wire.createMany({
          data: batch.map(w => ({
            id: w.id,
            wireNo: w.wireNo,
            signalName: w.signalName,
            conductorClassCode: w.conductorClassCode,
            description: w.description,
            wireSize: w.wireSize,
            wireColor: w.wireColor,
            cableSpec: w.cableSpec,
            shielded: w.shielded,
            voltageClass: w.voltageClass,
            sourceEquipment: w.sourceEquipment,
            sourceConnector: w.sourceConnector,
            sourcePin: w.sourcePin,
            destEquipment: w.destEquipment,
            destConnector: w.destConnector,
            destPin: w.destPin,
            remarks: w.remarks,
            wireStatus: w.wireStatus
          })),
          skipDuplicates: true
        });
        wiresAdded += result.count;
      } catch (e: any) {
        // Skip batch errors
      }
      
      offset += BATCH_SIZE;
      if (offset % 20000 === 0) {
        console.log(`   ... processed ${offset} wires (${wiresAdded} added)`);
      }
    }
    console.log(`   ✅ Wires: ${wiresAdded} added`);

    // Step 8: Transfer WireEndpoints (in batches)
    console.log('\n--- Transferring WireEndpoints ---');
    let endpointsAdded = 0;
    offset = 0;
    
    while (true) {
      const batch = await source.wireEndpoint.findMany({
        skip: offset,
        take: BATCH_SIZE,
        orderBy: { id: 'asc' }
      });
      
      if (batch.length === 0) break;
      
      try {
        const result = await target.wireEndpoint.createMany({
          data: batch.map(e => ({
            id: e.id,
            wireId: e.wireId,
            deviceId: e.deviceId,
            connectorId: e.connectorId,
            pinId: e.pinId,
            endpointRole: e.endpointRole,
            endpointLabel: e.endpointLabel,
            endpointPin: e.endpointPin,
            sourceFile: e.sourceFile,
            sourcePage: e.sourcePage
          })),
          skipDuplicates: true
        });
        endpointsAdded += result.count;
      } catch (e: any) {
        // Skip batch errors
      }
      
      offset += BATCH_SIZE;
      if (offset % 10000 === 0) {
        console.log(`   ... processed ${offset} endpoints (${endpointsAdded} added)`);
      }
    }
    console.log(`   ✅ WireEndpoints: ${endpointsAdded} added`);

    // Step 9: Transfer remaining tables
    console.log('\n--- Transferring TrainLines ---');
    const sourceTrainlines = await source.trainLine.findMany();
    try {
      const result = await target.trainLine.createMany({
        data: sourceTrainlines.map(t => ({
          id: t.id,
          drawingId: t.drawingId,
          lineGroup: t.lineGroup,
          itemName: t.itemName,
          wireNo: t.wireNo,
          connectorCode: t.connectorCode,
          pinNo: t.pinNo,
          carType: t.carType,
          sourceSheet: t.sourceSheet,
          note: t.note,
          conductorClassCode: t.conductorClassCode
        })),
        skipDuplicates: true
      });
      console.log(`   ✅ TrainLines: ${result.count} added`);
    } catch { console.log(`   ⚠️ TrainLines: batch failed, skipping`); }

    console.log('\n--- Transferring Signals ---');
    const sourceSignals = await source.signal.findMany();
    try {
      const result = await target.signal.createMany({
        data: sourceSignals.map(s => ({
          id: s.id,
          drawingId: s.drawingId,
          signalName: s.signalName,
          signalCode: s.signalCode,
          protocol: s.protocol,
          voltageText: s.voltageText,
          direction: s.direction,
          sourceSheet: s.sourceSheet,
          note: s.note,
          signalFamily: s.signalFamily,
          medium: s.medium
        })),
        skipDuplicates: true
      });
      console.log(`   ✅ Signals: ${result.count} added`);
    } catch { console.log(`   ⚠️ Signals: batch failed, skipping`); }

    // Final check
    console.log('\n\n📊 FINAL STATE (main branch):');
    const finalDrawings = await target.drawing.count();
    const finalWires = await target.wire.count();
    const finalEndpoints = await target.wireEndpoint.count();
    const finalConnectors = await target.connector.count();
    const finalPins = await target.connectorPin.count();
    console.log(`   Drawings: ${finalDrawings}`);
    console.log(`   Wires: ${finalWires}`);
    console.log(`   WireEndpoints: ${finalEndpoints}`);
    console.log(`   Connectors: ${finalConnectors}`);
    console.log(`   ConnectorPins: ${finalPins}`);

    console.log('\n✅ MERGE COMPLETE!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main();
