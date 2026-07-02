import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * SEED CONNECTORS, PINS AND WIRES FOR 942-38119
 * Based on OCR text from CAB_PIN DRAWINGS 2.pdf page 35
 * Drawing: 942-38119 - PIN ASSIGNMENT - PA/PIS & CCTV (DMC-CAB)
 */
export async function POST() {
  try {
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-38119' },
      select: { id: true, drawingNo: true },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing 942-38119 not found' }, { status: 404 });
    }

    // Clear existing connectors
    const existingConnectors = await prisma.connector.findMany({
      where: { drawingId: drawing.id },
      select: { id: true },
    });
    for (const conn of existingConnectors) {
      await prisma.connectorPin.deleteMany({ where: { connectorId: conn.id } });
      await prisma.wireEndpoint.deleteMany({ where: { connectorId: conn.id } });
    }
    await prisma.connector.deleteMany({ where: { drawingId: drawing.id } });

    // === CONNECTOR X5: CCU Audio Interface ===
    const x5 = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'CCU-X5',
        description: 'CCU Audio Interface - Microphone/PTT/Speaker',
        connectorTypeCode: null,
      },
    });

    const x5Pins = [
      { pinNo: '1/9', signalName: 'SHIELD', wireNo: '9056/S', note: 'Shield 2PG715 (2x0.5)' },
      { pinNo: '3/9', signalName: 'TRIU', wireNo: '9056/2', note: 'MG + PTT GND' },
      { pinNo: '7/9', signalName: 'PTT', wireNo: '9056/1', note: '' },
      { pinNo: '8/9', signalName: 'MIC+', wireNo: '9057/1', note: '' },
      { pinNo: '4/9', signalName: 'MIC-', wireNo: '9057/2', note: '' },
      { pinNo: '9/9', signalName: 'SHIELD', wireNo: '9057/S', note: '' },
    ];
    await prisma.connectorPin.createMany({ data: x5Pins.map(p => ({ connectorId: x5.id, ...p })) });

    // === CONNECTOR X6: CCU Signal Interface ===
    const x6 = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'CCU-X6',
        description: 'CCU Signal Interface - Speaker/Relay/TIU',
        connectorTypeCode: null,
      },
    });

    const x6Pins = [
      { pinNo: 'g72/48', signalName: 'SHIELD', wireNo: '9055A/S', note: 'CAB LOUD SPEAKER SHIELD' },
      { pinNo: 'b2/48', signalName: 'SPEAKER_LS-', wireNo: '9055A/2', note: 'CAB LOUD SPEAKER LS- BS FR EMC 2x1.5' },
      { pinNo: 'd2/48', signalName: 'SPEAKER_LS+', wireNo: '9055A/1', note: 'CAB LOUD SPEAKER LS+' },
      { pinNo: 'b6/48', signalName: 'GND1', wireNo: '9635/2', note: 'CAB DESK TB GND1' },
      { pinNo: 'd6/48', signalName: 'TRIU_INP2', wireNo: '9035A', note: '' },
      { pinNo: 'b8/48', signalName: 'GND1', wireNo: '9042', note: 'CAB DESK TB GND1' },
      { pinNo: 'd8/48', signalName: 'RELAY_INP1', wireNo: '9042', note: 'RELAY PANEL INP1' },
      { pinNo: 'z20/48', signalName: 'SHIELD', wireNo: '9226A/S', note: 'TRIU SHIELD' },
      { pinNo: 'b20/48', signalName: 'RADIO_IN+', wireNo: '9226A/1', note: 'TRIU RADIO_IN+' },
      { pinNo: 'd20/48', signalName: 'RADIO_IN-', wireNo: '90268/2', note: 'TRIU RADIO_IN-' },
      { pinNo: 'd22/48', signalName: 'TRIU_OUT-', wireNo: '9205/2', note: 'TRIU OUT-' },
      { pinNo: 'b22/48', signalName: 'TRIU_OUT+', wireNo: '9205/1', note: 'TRIU OUT+' },
    ];
    await prisma.connectorPin.createMany({ data: x6Pins.map(p => ({ connectorId: x6.id, ...p })) });

    // === CONNECTOR X7: CCU Power & Control ===
    const x7 = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'CCU-X7',
        description: 'CCU Power & Control - Battery/Relay/RS485',
        connectorTypeCode: null,
      },
    });

    const x7Pins = [
      { pinNo: 'd4/48', signalName: 'BAT+', wireNo: 'D9070-1', note: 'CAB DESK TB +BAT' },
      { pinNo: 'b4/48', signalName: 'BAT-', wireNo: '0V942-10', note: 'CAB DESK TB -BAT' },
      { pinNo: 'd10/48', signalName: 'RELAY_IN3', wireNo: '9043-4', note: 'CAB DESK TB IN3' },
      { pinNo: 'b10/48', signalName: 'GND3', wireNo: '0V942-4', note: 'CAB DESK TB GND3' },
      { pinNo: 'd12/48', signalName: 'RELAY_N4', wireNo: '9046', note: 'RELAY PANEL N4' },
      { pinNo: 'b12/48', signalName: 'GND4', wireNo: '0V942-5', note: 'CAB DESK TB GND34' },
      { pinNo: 'd14/48', signalName: 'RELAY_IN5', wireNo: '9045', note: 'RELAY PANEL IN5' },
      { pinNo: 'b14/48', signalName: 'GND5', wireNo: '0V942-6', note: 'CAB DESK TB GND56' },
      { pinNo: 'd16/48', signalName: 'RELAY_IN6', wireNo: '9045a', note: 'RELAY PANEL IN6' },
      { pinNo: 'b16/48', signalName: 'GND6', wireNo: '0V942-7', note: 'CAB DESK TB GND56' },
      { pinNo: 'd18/48', signalName: 'RELAY_IN7', wireNo: '9044', note: 'RELAY PANEL IN7' },
      { pinNo: 'b18/48', signalName: 'GND7', wireNo: '0V942-8', note: 'CAB DESK TB GND78' },
      { pinNo: 'd20/48', signalName: 'RELAY_IN8', wireNo: '9044a', note: 'RELAY PANEL IN8' },
      { pinNo: 'b20/48', signalName: 'GND8', wireNo: '0V942-9', note: 'CAB DESK TB GND78' },
      { pinNo: 'b22/48', signalName: 'TCMS_OUT1+', wireNo: '9010-1', note: 'TCMS TB OUT1+' },
      { pinNo: 'd22/48', signalName: 'DESK_OUT1-', wireNo: 'DB04-37', note: 'CAB DESK TB OUT1-' },
      { pinNo: 'b24/48', signalName: 'TCMS_OUT2+', wireNo: '9755-1', note: 'TCMS TB OUT2+' },
      { pinNo: 'd24/48', signalName: 'DESK_OUT2-', wireNo: 'DB04-38', note: 'CAB DESK TB OUT2-' },
      { pinNo: 'x26/48', signalName: 'SHIELD_9555', wireNo: '9555/S', note: '' },
      { pinNo: 'x26/48b', signalName: 'SHIELD_9221A', wireNo: '9221A/S', note: '' },
      { pinNo: 'y28/48', signalName: 'RS485_1_GND', wireNo: '9032/3', note: '' },
      { pinNo: 'y30/48', signalName: 'RS485_1_N', wireNo: '9032/2', note: '' },
      { pinNo: 'y32/48', signalName: 'RS485_1_P', wireNo: '9032/1', note: '' },
      { pinNo: 'z28/48', signalName: 'RS485_2_GND', wireNo: '9555/3', note: '' },
      { pinNo: 'z30/48', signalName: 'RS485_2_N', wireNo: '9555/2', note: '' },
      { pinNo: 'z32/48', signalName: 'RS485_2_P', wireNo: '9555/1', note: '' },
      { pinNo: 'w28/48', signalName: 'RS485_3_GND', wireNo: '9221A/3', note: '' },
      { pinNo: 'w30/48', signalName: 'RS485_3_N', wireNo: '9221A/2', note: '' },
      { pinNo: 'w32/48', signalName: 'RS485_3_P', wireNo: '9221A/1', note: '' },
    ];
    await prisma.connectorPin.createMany({ data: x7Pins.map(p => ({ connectorId: x7.id, ...p })) });

    // === CONNECTOR DVAU: Digital Voice Announcement Unit ===
    const dvau = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'DVAU',
        description: 'Digital Voice Announcement Unit Interface',
        connectorTypeCode: null,
      },
    });

    // === CONNECTOR Ethernet Switch ===
    const ethSwitch = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'ETH-SWITCH',
        description: 'Ethernet Switch - M12 D Connectors',
        connectorTypeCode: null,
      },
    });

    const ethPins = [
      { pinNo: '1', signalName: 'TX+', wireNo: '9065/1', note: 'YELLOW - CAB DESK TB CN:X1(M12 DM)' },
      { pinNo: '2', signalName: 'RX+', wireNo: '9065/3', note: 'WHITE - PORT 20' },
      { pinNo: '3', signalName: 'TX-', wireNo: '9065/2', note: 'ORANGE - CAT5e ETHERNET' },
      { pinNo: '4', signalName: 'RX-', wireNo: '9065/4', note: 'BLUE' },
    ];
    await prisma.connectorPin.createMany({ data: ethPins.map(p => ({ connectorId: ethSwitch.id, ...p })) });

    // === CONNECTOR SPO: Signal Processing Output ===
    const spo = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'SPO',
        description: 'Signal Processing Output - Relay Panel',
        connectorTypeCode: null,
      },
    });

    const spoPins = [
      { pinNo: '34', signalName: 'RELAY_PANEL', wireNo: null, note: 'Signal Processing Output' },
      { pinNo: '35', signalName: 'RELAY_PANEL', wireNo: null, note: '' },
    ];
    await prisma.connectorPin.createMany({ data: spoPins.map(p => ({ connectorId: spo.id, ...p })) });

    // === CONNECTOR Relay Panel ===
    const relayPanel = await prisma.connector.create({
      data: {
        drawingId: drawing.id,
        connectorCode: 'RELAY-PANEL',
        description: 'Relay Panel - M12 Connectors',
        connectorTypeCode: null,
      },
    });

    const relayPins = [
      { pinNo: '1', signalName: 'TX+', wireNo: '9058/1', note: 'YELLOW - AAU CN:X1(M12 DF)' },
      { pinNo: '2', signalName: 'RX+', wireNo: '9058/3', note: 'WHITE - CAT5e AAU' },
      { pinNo: '3', signalName: 'TX-', wireNo: '9058/2', note: 'ORANGE' },
      { pinNo: '4', signalName: 'RX-', wireNo: '9058/4', note: 'BLUE' },
    ];
    await prisma.connectorPin.createMany({ data: relayPins.map(p => ({ connectorId: relayPanel.id, ...p })) });

    // Create wire records
    const wireNos = [
      '9056/S', '9056/1', '9056/2', '9057/1', '9057/2', '9057/S',
      '9055A/S', '9055A/1', '9055A/2', '9635/2', '9035A', '9042',
      '9226A/S', '9226A/1', '90268/2', '9205/1', '9205/2',
      'D9070-1', '0V942-10', '9043-4', '0V942-4', '9046', '0V942-5',
      '9045', '0V942-6', '9045a', '0V942-7', '9044', '0V942-8',
      '9044a', '0V942-9', '9010-1', 'DB04-37', '9755-1', 'DB04-38',
      '9555/S', '9555/1', '9555/2', '9555/3', '9221A/S', '9221A/1', '9221A/2', '9221A/3',
      '9032/1', '9032/2', '9032/3', '9065/1', '9065/2', '9065/3', '9065/4',
      '9058/1', '9058/2', '9058/3', '9058/4',
    ];

    let wiresCreated = 0;
    for (const wireNo of wireNos) {
      const existing = await prisma.wire.findFirst({ where: { wireNo } });
      if (!existing) {
        await prisma.wire.create({ data: { wireNo, signalName: wireNo } });
        wiresCreated++;
      }
    }

    // Create DrawingWire links
    const allWires = await prisma.wire.findMany({
      where: { wireNo: { in: wireNos } },
      select: { id: true },
    });
    let linksCreated = 0;
    for (const wire of allWires) {
      const existing = await prisma.drawingWire.findFirst({
        where: { drawingId: drawing.id, wireId: wire.id },
      });
      if (!existing) {
        await prisma.drawingWire.create({ data: { drawingId: drawing.id, wireId: wire.id } });
        linksCreated++;
      }
    }

    // Verify
    const finalConnectors = await prisma.connector.findMany({
      where: { drawingId: drawing.id },
      include: { _count: { select: { pins: true } } },
    });
    const totalPins = finalConnectors.reduce((sum, c) => sum + c._count.pins, 0);

    return NextResponse.json({
      status: 'success',
      drawing: '942-38119',
      created: {
        connectors: finalConnectors.length,
        pins: totalPins,
        wires: wiresCreated,
        drawingWireLinks: linksCreated,
      },
      connectors: finalConnectors.map(c => ({
        code: c.connectorCode,
        description: c.description,
        pins: c._count.pins,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
