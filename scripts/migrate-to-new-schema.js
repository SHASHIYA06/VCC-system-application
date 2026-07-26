require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function migrateToNewSchema() {
    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DIRECT_URL } }
    });

    try {
        await prisma.$connect();
        console.log('Connected to database successfully');

        // Start a transaction
        await prisma.$transaction(async (tx) => {
            console.log('Starting migration to new schema...');

            // 1. Migrate Systems
            console.log('\n1. Migrating Systems...');
            const oldSystems = await prisma.system.findMany();
            let systemsMigrated = 0;

            for (const oldSystem of oldSystems) {
                try {
                    // Check if system already exists in new table
                    const existingSystem = await tx.systems.findUnique({
                        where: { code: oldSystem.code }
                    });

                    if (!existingSystem) {
                        await tx.systems.create({
                            data: {
                                id: oldSystem.id,
                                name: oldSystem.name,
                                code: oldSystem.code,
                                category: oldSystem.category,
                                description: oldSystem.description,
                                sort_order: oldSystem.sortOrder || 0,
                                status: oldSystem.isActive ? 'active' : 'inactive',
                                metadata: {
                                    dataStatus: oldSystem.dataStatus,
                                    colorTheme: oldSystem.colorTheme,
                                    iconName: oldSystem.iconName,
                                    uiMenuDisplayName: oldSystem.uiMenuDisplayName
                                },
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });
                        systemsMigrated++;
                    }
                } catch (e) {
                    console.error(`Error migrating system ${oldSystem.code}:`, e.message);
                }
            }
            console.log(`   Migrated ${systemsMigrated} systems`);

            // 2. Migrate Drawings
            console.log('\n2. Migrating Drawings...');
            const oldDrawings = await prisma.drawing.findMany();
            let drawingsMigrated = 0;

            for (const oldDrawing of oldDrawings) {
                try {
                    // Check if drawing already exists in new table
                    const existingDrawing = await tx.drawings.findUnique({
                        where: { drawing_number: oldDrawing.drawingNo }
                    });

                    if (!existingDrawing) {
                        await tx.drawings.create({
                            data: {
                                id: oldDrawing.id,
                                drawing_number: oldDrawing.drawingNo,
                                title: oldDrawing.title,
                                drawing_type: oldDrawing.isReference ? 'reference' : 'electrical',
                                revision: oldDrawing.revision || '0',
                                status: oldDrawing.status?.toLowerCase() || 'active',
                                pdf_url: oldDrawing.drawingPdfUrl,
                                metadata: {
                                    projectId: oldDrawing.projectId,
                                    sourceFileId: oldDrawing.sourceFileId,
                                    totalSheets: oldDrawing.totalSheets,
                                    remarks: oldDrawing.remarks,
                                    isSynced: oldDrawing.isSynced,
                                    syncedAt: oldDrawing.syncedAt
                                },
                                created_at: oldDrawing.createdAt || new Date(),
                                updated_at: oldDrawing.updatedAt || new Date()
                            }
                        });
                        drawingsMigrated++;
                    }
                } catch (e) {
                    console.error(`Error migrating drawing ${oldDrawing.drawingNo}:`, e.message);
                }
            }
            console.log(`   Migrated ${drawingsMigrated} drawings`);

            // 3. Migrate Connectors
            console.log('\n3. Migrating Connectors...');
            const oldConnectors = await prisma.connector.findMany();
            let connectorsMigrated = 0;

            for (const oldConnector of oldConnectors) {
                try {
                    // Check if connector already exists in new table
                    const existingConnector = await tx.connectors.findUnique({
                        where: { id: oldConnector.id }
                    });

                    if (!existingConnector) {
                        await tx.connectors.create({
                            data: {
                                id: oldConnector.id,
                                name: oldConnector.connectorCode,
                                code: oldConnector.connectorCode,
                                location: oldConnector.locationTag,
                                drawing_reference: oldConnector.drawingId,
                                pin_count: oldConnector.pinCount,
                                status: 'active',
                                metadata: {
                                    carType: oldConnector.carType,
                                    instanceLabel: oldConnector.instanceLabel,
                                    sideTag: oldConnector.sideTag,
                                    description: oldConnector.description,
                                    extra: oldConnector.extra,
                                    connectorTypeCode: oldConnector.connectorTypeCode,
                                    scope: oldConnector.scope,
                                    sheetId: oldConnector.sheetId
                                },
                                created_at: oldConnector.createdAt || new Date(),
                                updated_at: new Date()
                            }
                        });
                        connectorsMigrated++;
                    }
                } catch (e) {
                    console.error(`Error migrating connector ${oldConnector.connectorCode}:`, e.message);
                }
            }
            console.log(`   Migrated ${connectorsMigrated} connectors`);

            // 4. Migrate Wires
            console.log('\n4. Migrating Wires...');
            const oldWires = await prisma.wire.findMany();
            let wiresMigrated = 0;

            for (const oldWire of oldWires) {
                try {
                    // Check if wire already exists in new table
                    const existingWire = await tx.wires.findUnique({
                        where: { id: oldWire.id }
                    });

                    if (!existingWire) {
                        await tx.wires.create({
                            data: {
                                id: oldWire.id,
                                wire_number: oldWire.wireNo,
                                wire_color: oldWire.wireColor,
                                wire_gauge: oldWire.wireSize,
                                signal_medium: oldWire.voltageClass,
                                drawing_reference: oldWire.sourceConnector,
                                status: oldWire.wireStatus?.toLowerCase() || 'unverified',
                                metadata: {
                                    signalName: oldWire.signalName,
                                    conductorClassCode: oldWire.conductorClassCode,
                                    description: oldWire.description,
                                    cableSpec: oldWire.cableSpec,
                                    shielded: oldWire.shielded,
                                    sourceEquipment: oldWire.sourceEquipment,
                                    sourcePin: oldWire.sourcePin,
                                    destEquipment: oldWire.destEquipment,
                                    destConnector: oldWire.destConnector,
                                    destPin: oldWire.destPin,
                                    remarks: oldWire.remarks,
                                    wireAlias: oldWire.wireAlias,
                                    verificationSource: oldWire.verificationSource,
                                    verifiedAt: oldWire.verifiedAt
                                },
                                created_at: oldWire.createdAt || new Date(),
                                updated_at: oldWire.updatedAt || new Date()
                            }
                        });
                        wiresMigrated++;
                    }
                } catch (e) {
                    console.error(`Error migrating wire ${oldWire.wireNo}:`, e.message);
                }
            }
            console.log(`   Migrated ${wiresMigrated} wires`);

            // 5. Migrate Equipment
            console.log('\n5. Migrating Equipment...');
            const oldDevices = await prisma.device.findMany();
            let equipmentMigrated = 0;

            // Group devices by name to create unique equipment records
            const deviceGroups = {};
            for (const device of oldDevices) {
                if (!deviceGroups[device.deviceName]) {
                    deviceGroups[device.deviceName] = [];
                }
                deviceGroups[device.deviceName].push(device);
            }

            for (const [deviceName, devices] of Object.entries(deviceGroups)) {
                try {
                    if (deviceName && deviceName.trim() !== '') {
                        const code = deviceName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                        // Check if equipment already exists
                        const existingEquipment = await tx.equipment.findUnique({
                            where: { code: code }
                        });

                        if (!existingEquipment) {
                            const firstDevice = devices[0];
                            await tx.equipment.create({
                                data: {
                                    id: firstDevice.id,
                                    name: deviceName,
                                    code: code,
                                    subsystemId: firstDevice.subsystemId,
                                    manufacturer: firstDevice.manufacturerRef || 'Unknown',
                                    model: null,
                                    partNumber: firstDevice.tagNo,
                                    description: `Auto-generated from device: ${deviceName}`,
                                    metadata: {
                                        autoGenerated: true,
                                        source: 'device_data_migration',
                                        originalTagNo: firstDevice.tagNo,
                                        deviceCount: devices.length
                                    },
                                    created_at: new Date(),
                                    updated_at: new Date()
                                }
                            });
                            equipmentMigrated++;
                        }
                    }
                } catch (e) {
                    console.error(`Error migrating equipment ${deviceName}:`, e.message);
                }
            }
            console.log(`   Migrated ${equipmentMigrated} equipment items`);

            // 6. Migrate Devices
            console.log('\n6. Migrating Devices...');
            let devicesMigrated = 0;

            for (const oldDevice of oldDevices) {
                try {
                    // Check if device already exists in new table
                    const existingDevice = await tx.devices.findUnique({
                        where: { id: oldDevice.id }
                    });

                    if (!existingDevice) {
                        await tx.devices.create({
                            data: {
                                id: oldDevice.id,
                                name: oldDevice.deviceName,
                                device_type: oldDevice.deviceType,
                                location: oldDevice.locationTag,
                                part_number: oldDevice.manufacturerRef,
                                manufacturer: oldDevice.manufacturerRef,
                                status: oldDevice.isVerified ? 'active' : 'pending',
                                metadata: {
                                    drawingId: oldDevice.drawingId,
                                    systemId: oldDevice.systemId,
                                    subsystemId: oldDevice.subsystemId,
                                    tagNo: oldDevice.tagNo,
                                    carType: oldDevice.carType,
                                    note: oldDevice.note,
                                    extra: oldDevice.extra,
                                    verifiedAt: oldDevice.verifiedAt
                                },
                                created_at: new Date(),
                                updated_at: new Date()
                            }
                        });
                        devicesMigrated++;
                    }
                } catch (e) {
                    console.error(`Error migrating device ${oldDevice.deviceName}:`, e.message);
                }
            }
            console.log(`   Migrated ${devicesMigrated} devices`);

            console.log('\n✅ Migration to new schema completed successfully!');
        });

        // Verify migration
        console.log('\n=== VERIFICATION ===');
        const verificationQueries = [
            { table: 'systems', query: () => prisma.systems.count() },
            { table: 'drawings', query: () => prisma.drawings.count() },
            { table: 'connectors', query: () => prisma.connectors.count() },
            { table: 'wires', query: () => prisma.wires.count() },
            { table: 'equipment', query: () => prisma.equipment.count() },
            { table: 'devices', query: () => prisma.devices.count() }
        ];

        for (const { table, query } of verificationQueries) {
            try {
                const count = await query();
                console.log(`${table}: ${count} records`);
            } catch (e) {
                console.log(`${table}: Error - ${e.message}`);
            }
        }

        await prisma.$disconnect();
        console.log('\n🎉 Schema upgrade and data migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Error stack:', error.stack);
        await prisma.$disconnect();
        process.exit(1);
    }
}

migrateToNewSchema();