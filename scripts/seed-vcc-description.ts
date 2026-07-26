import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedVCCDescription() {
    try {
        console.log('🌱 Seeding VCC Description data...');

        // Get all systems
        const systems = await prisma.system.findMany();
        console.log(`Found ${systems.length} systems`);

        // VCC System descriptions data - extended to include all systems
        const vccSystemData: Record<string, any> = {
            'GENERAL': {
                systemName: 'General',
                description: 'General documentation and standards providing foundational information for all VCC systems including drawing lists, classifications, wiring numbers, symbols, and train-line details.',
                technicalSpecs: 'General documentation and standards for all VCC systems',
                powerRequirements: 'N/A',
                voltage: 'N/A',
                current: 'N/A',
                frequency: 'N/A',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Standard safety protocols and documentation guidelines',
                maintenanceSchedule: 'As per individual system requirements',
                sparePartsInfo: 'Refer to specific system documentation',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'TRACTION': {
                systemName: 'Traction System',
                description: 'Traction system including DC750V main power supply, speed control, VVVF Inverter interface and grounding for propulsion.',
                technicalSpecs: '750V DC traction power system with VVVF control for motor drive',
                powerRequirements: '750V DC Overhead Supply, 110V DC Battery Supply',
                voltage: '750V DC (main), 110V DC (control)',
                current: '1500A (main), 50A (control)',
                frequency: 'Variable (VVVF)',
                environmentalConditions: 'Standard operational conditions with thermal management',
                safetyFeatures: 'Grounding, emergency brake interface, isolation, electrical protection',
                maintenanceSchedule: 'Monthly inspection, quarterly servicing',
                sparePartsInfo: 'Contact shoes, filters, inverters, traction motors',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'BRAKE': {
                systemName: 'Brake System',
                description: 'Brake system including Compressor Control, Brake Loop, Emergency Brake Loop, Parking Brake, Horn and Brake Control for safe stopping.',
                technicalSpecs: 'Electro-pneumatic brake control system with multiple safety loops',
                powerRequirements: '110V DC Battery Supply, Compressed Air',
                voltage: '110V DC',
                current: '10A',
                frequency: 'N/A',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Emergency brake loop, parking brake, horn, fail-safe mechanisms',
                maintenanceSchedule: 'Monthly inspection, quarterly servicing',
                sparePartsInfo: 'Valves, pressure switches, compressors, brake control units',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'AUX': {
                systemName: 'Auxiliary Electric System',
                description: 'Auxiliary power system providing 415VAC supply for non-traction loads including lighting, HVAC, and communication systems.',
                technicalSpecs: '415V AC auxiliary power distribution with static inverters',
                powerRequirements: '415V AC Shore Supply, 110V DC Battery Supply',
                voltage: '415V AC (main), 110V DC (battery)',
                current: '200A (AC), 50A (DC)',
                frequency: '50Hz',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Earth leakage protection, circuit breakers, overload protection',
                maintenanceSchedule: 'Monthly inspection, annual servicing',
                sparePartsInfo: 'Static inverters, battery chargers, breakers, distribution panels',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'DOOR': {
                systemName: 'Door System',
                description: 'Passenger door system including Saloon Door Supply Voltage, Door Operation, Door Proving Loop, Local Door Interlock Circuit and Communication with TCMS.',
                technicalSpecs: 'Electro-pneumatic passenger door control with centralized monitoring',
                powerRequirements: '110V DC Battery Supply, Compressed Air',
                voltage: '110V DC',
                current: '8A',
                frequency: 'N/A',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Door proving loops, emergency release, anti-trap sensors, interlocks',
                maintenanceSchedule: 'Monthly inspection, quarterly servicing',
                sparePartsInfo: 'Door control units, motors, sensors, pneumatic actuators',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'AIRCON': {
                systemName: 'Air Conditioning System',
                description: 'Air conditioning system providing comfortable cabin environment including Cab VAC and Saloon VAC units.',
                technicalSpecs: 'Centralized air conditioning system with temperature control',
                powerRequirements: '415V AC Auxiliary Supply',
                voltage: '415V AC',
                current: '50A',
                frequency: '50Hz',
                environmentalConditions: 'Temperature controlled environments with humidity management',
                safetyFeatures: 'Pressure relief, temperature limits, electrical protection',
                maintenanceSchedule: 'Monthly inspection, seasonal servicing',
                sparePartsInfo: 'Compressors, condensers, evaporators, filters, fans',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'TIMS': {
                systemName: 'Train Integrated Management System',
                description: 'Integrated train management system for control, monitoring, and diagnostics of all vehicle systems.',
                technicalSpecs: 'Centralized train control and monitoring system with distributed I/O',
                powerRequirements: '110V DC Battery Supply',
                voltage: '110V DC',
                current: '15A',
                frequency: 'N/A',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Redundancy, fault logging, diagnostics, fail-safe operation',
                maintenanceSchedule: 'Monthly inspection, software updates as scheduled',
                sparePartsInfo: 'Display units, processors, network components, I/O modules',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'COMM': {
                systemName: 'Communication System',
                description: 'Integrated communication system including Passenger Information System (PIS), Public Address (PA), CCTV, Radio, and ATP interface.',
                technicalSpecs: 'Integrated communication and passenger information system',
                powerRequirements: '110V DC Battery Supply, 415V AC Auxiliary Supply',
                voltage: '110V DC / 415V AC',
                current: '10A (DC), 20A (AC)',
                frequency: '50Hz (AC)',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Emergency communication, redundant systems, fail-safe operation',
                maintenanceSchedule: 'Monthly inspection, software updates as scheduled',
                sparePartsInfo: 'Radios, displays, cameras, amplifiers, network switches',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'LIGHT': {
                systemName: 'Lighting System',
                description: 'Vehicle lighting system including Head Light, Cab Main Light, Tail Light, Flasher Light, Console Light, Saloon Lights, Gangway Light, and Windscreen Wiper.',
                technicalSpecs: 'Lighting control and distribution systems with energy efficiency',
                powerRequirements: '110V DC Battery Supply, 230V AC Auxiliary Supply',
                voltage: '110V DC / 230V AC',
                current: '2A (DC), 1A (AC)',
                frequency: '50Hz (AC)',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Emergency lighting, circuit protection, automatic dimming',
                maintenanceSchedule: 'Monthly inspection, bulb replacement as needed',
                sparePartsInfo: 'LED modules, ballasts, fuses, control units',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'LTEB': {
                systemName: 'Low Tension Equipment Box',
                description: 'Low tension equipment box housing auxiliary electrical components and distribution panels.',
                technicalSpecs: 'Low voltage electrical distribution and equipment housing',
                powerRequirements: '110V DC Battery Supply, 415V AC Auxiliary Supply',
                voltage: '110V DC / 415V AC',
                current: '30A',
                frequency: '50Hz (AC)',
                environmentalConditions: 'Standard operational conditions with IP protection',
                safetyFeatures: 'Circuit breakers, earth leakage protection, enclosure protection',
                maintenanceSchedule: 'Monthly inspection, annual servicing',
                sparePartsInfo: 'Distribution panels, breakers, relays, terminal blocks',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'LTJB': {
                systemName: 'Low Tension Junction Box',
                description: 'Low tension junction boxes for electrical connections and distribution throughout the vehicle.',
                technicalSpecs: 'Junction and distribution points for low voltage circuits',
                powerRequirements: '110V DC Battery Supply, 415V AC Auxiliary Supply',
                voltage: '110V DC / 415V AC',
                current: '20A',
                frequency: '50Hz (AC)',
                environmentalConditions: 'Standard operational conditions with IP protection',
                safetyFeatures: 'Circuit protection, enclosure sealing, grounding',
                maintenanceSchedule: 'Monthly inspection, as needed',
                sparePartsInfo: 'Enclosures, terminals, glands, protective devices',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            },
            'CAB': {
                systemName: 'Cab Control System',
                description: 'Cab control system including driver controls, indicators, and interfaces for train operation.',
                technicalSpecs: 'Driver control console and instrumentation system',
                powerRequirements: '110V DC Battery Supply',
                voltage: '110V DC',
                current: '5A',
                frequency: 'N/A',
                environmentalConditions: 'Standard operational conditions',
                safetyFeatures: 'Emergency controls, fail-safe operation, interlocks',
                maintenanceSchedule: 'Monthly inspection, as needed',
                sparePartsInfo: 'Push buttons, indicators, displays, control levers',
                documentVersion: '1.0',
                source: 'VCC DESCRIPTION 13.12.2017.pdf'
            }
        };

        let createdCount = 0;

        // Create or update VCC descriptions for each system
        for (const system of systems) {
            if (vccSystemData[system.code]) {
                try {
                    await prisma.vCCDescription.upsert({
                        where: { systemCode: system.code },
                        update: {
                            ...vccSystemData[system.code],
                            lastUpdated: new Date()
                        },
                        create: {
                            systemCode: system.code,
                            ...vccSystemData[system.code]
                        }
                    });
                    createdCount++;
                    console.log(`✅ Upserted VCC description for system: ${system.code}`);
                } catch (error) {
                    console.error(`❌ Failed to upsert VCC description for system: ${system.code}`, error);
                }
            } else {
                console.log(`⚠️ No VCC description data found for system: ${system.code}`);
            }
        }

        console.log(`🌱 Successfully seeded ${createdCount} VCC descriptions`);

    } catch (error) {
        console.error('❌ Error seeding VCC descriptions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed function
seedVCCDescription().catch(console.error);