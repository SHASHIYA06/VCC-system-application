import { prisma } from '../src/lib/prisma';

/**
 * COMPREHENSIVE VCC DESCRIPTIONS UPGRADE
 * Updates all 21 system descriptions with detailed engineering content
 * covering architecture, power flow, signal flow, key drawings,
 * connectors, diagnostics, and maintenance procedures.
 */

const DETAILED_DESCRIPTIONS: Record<string, {
  description: string;
  technicalSpecs: string;
  powerRequirements: string;
  voltage: string;
  safetyFeatures: string;
  maintenanceSchedule: string;
  sparePartsInfo: string;
}> = {
  TRAC: {
    description: `Traction Control System (TRAC) — The heart of the train's propulsion system.

ARCHITECTURE:
The TRAC system controls the 3-phase AC traction motors via VVVF (Variable Voltage Variable Frequency) inverters. Each DMC car has one TRAC system controlling 2 traction motors. The system receives speed commands from the TCMS via trainlines and converts 750VDC catenary supply to variable frequency AC for motor control.

POWER FLOW:
750VDC (Pantograph) → HSCB → DC Link → VVVF Inverter → 3-Phase AC → Traction Motor → Gearbox → Wheel
Traction Return: Wheel → Rail → Third Rail Return

SIGNAL FLOW:
TCMS (Speed Command) → Trainline 3003-3006 → VVVF CN2 → Motor Control → Feedback via Trainline 1207 (VVVF Fault) & 1209 (HSCB Trip)

KEY COMPONENTS:
- HSCB (High Speed Circuit Breaker): Main 750VDC protection, 3000A rated
- VVVF Inverter: 1500kW, IGBT-based, 2kHz switching frequency
- Traction Motor: 3-phase squirrel cage, 750kW per motor
- TBC (Traction Brake Controller): Manages regenerative and rheostatic braking
- Speed Sensor: Dual redundant tachogenerators per axle

KEY DRAWINGS:
- 942-58120: VVVF Control Circuit
- 942-58121: VVVF Power Circuit
- 942-58122: Traction Motor Connection
- 942-38305: DMC Underframe Pin Assignment
- 942-38306: VVVF Inverter Pin Assignment

DIAGNOSTICS:
- VVVF_FAULT (Trainline 1207): Inverter internal fault
- HSCB_TRIP (Trainline 1209): Overcurrent protection
- MOTOR_OVERTEMP (Trainline 1245): Motor temperature warning

TEST PROCEDURES:
1. Verify 750VDC at pantograph connector
2. Check HSCB operation (close/open cycle)
3. Measure VVVF output frequency at motor terminals
4. Verify speed sensor signals (2000 pulses/rev)
5. Check regenerative braking current path`,
    technicalSpecs: 'HSCB: 750VDC/3000A, VVVF: 1500kW/IGBT/2kHz, Motor: 750kW/3-phase/1800RPM, Gear Ratio: 5.5:1, Max Speed: 100km/h, Acceleration: 1.0 m/s², Braking: 1.2 m/s²',
    powerRequirements: '750VDC main supply, 110VDC control, 24VDC instrumentation',
    voltage: '750VDC input (catenary), 0-590VAC variable output (motor), 110VDC control',
    safetyFeatures: 'HSCB overcurrent protection, VVVF overtemperature shutdown, Motor thermal protection, Speed sensor redundancy, Dead man switch interlock, Emergency brake integration',
    maintenanceSchedule: 'Daily: Visual inspection, Monthly: Insulation resistance test, Quarterly: HSCB contact resistance, Annually: Full VVVF diagnostic cycle, Motor bearing grease every 100,000km',
    sparePartsInfo: 'HSCB contact set, VVVF IGBT modules (6 per inverter), Speed sensor assembly, Motor carbon brushes (if applicable), Cooling fan motor',
  },
  BRAKE: {
    description: `Brake System — Multi-stage braking with safety-critical redundant loops.

ARCHITECTURE:
The brake system provides 3 levels of braking: service brake (regenerative + pneumatic), emergency brake (pneumatic only), and parking brake (spring-applied). The BECU (Brake Electronic Control Unit) manages brake blending between regenerative and pneumatic braking. The emergency brake loop (Trainline 4062) runs through all cars with redundant path (Trainline 4103).

POWER FLOW:
BECU → Brake Valve → Brake Cylinder → Brake Disc/Pad
Emergency: EBMV → Emergency Brake Pipe → All Cars → Brake Cylinders
Parking: Spring Apply → Mechanical Lock

SIGNAL FLOW:
Driver Brake Command → Trainline 3004/3011 → BCU → Brake Blending Logic → Pneumatic/Electric Actuators
Emergency Loop: Trainline 4062 (Normal) + 4103 (Redundant) → EBMV → All Cars

KEY COMPONENTS:
- BECU: Brake Electronic Control Unit, manages blending
- EBMV: Emergency Brake Magnetic Valve
- EBSS: Emergency Brake Supply System
- PBMV: Parking Brake Magnetic Valve
- CM: Compressor Motor (air supply)
- Air Dryer: Removes moisture from compressed air

KEY DRAWINGS:
- 942-58123: Air Compressor Circuit
- 942-58125: Emergency Brake Loop
- 942-58126: Parking Brake Circuit
- 942-58128: Service Brake Control
- 942-58129: Brake Blending Logic

DIAGNOSTICS:
- EM_BRAKE_FAULT (Trainline 4062): Emergency brake loop open
- PARKING_BRAKE (Trainline 4122/4153): Parking brake fault
- COMPRESSOR_FAULT (Trainline 4001): Compressor failure
- BRAKE_CYLINDER_LEAK: Air leak in brake cylinder

TEST PROCEDURES:
1. Verify emergency brake loop continuity (4062 + 4103)
2. Check brake cylinder pressure (6-10 bar)
3. Test regenerative braking current
4. Verify parking brake apply/release
5. Check compressor cut-in/cut-out pressure`,
    technicalSpecs: 'BECU: 110VDC, EBMV: 110VDC/2A, Compressor: 415VAC/15kW, Brake Force: 200kN per car, Response Time: <150ms, Air Pressure: 6-10 bar',
    powerRequirements: '110VDC control, 415VAC compressor, 24VDC sensors',
    voltage: '110VDC control loops, 415VAC compressor motor, 750VDC regenerative braking path',
    safetyFeatures: 'Dual emergency brake loops (4062+4103), Fail-safe spring brakes, Redundant air supply, Dead man switch, Overspeed protection, Anti-skid system',
    maintenanceSchedule: 'Daily: Air pressure check, Monthly: Brake pad measurement, Quarterly: Emergency brake loop test, Annually: Full brake system calibration, Compressor oil change every 2000 hours',
    sparePartsInfo: 'Brake pad sets, EBMV solenoid valve, PBMV valve, Compressor valves, Air dryer desiccant, Speed sensor',
  },
  DOOR: {
    description: `Door System — Passenger door control with safety interlocks.

ARCHITECTURE:
Each car has 8 passenger doors (4 per side) controlled by DCU (Door Control Units). The door system includes open/close commands, position feedback, safety edge sensors, and interlock verification. Door commands come from TCMS via trainlines, with local override capability.

POWER FLOW:
110VDC (Trainline) → DCU → Door Motor → Mechanical Linkage → Door Panel
Safety Loop: Door Edge Sensors → Safety Relay → TCMS

SIGNAL FLOW:
TCMS Door Command → Trainline 6009/6014/6046/6051 → DCU → Motor Control
Door Proving: Trainline 6073/6076 → TCMS (all doors closed/locked)
Zero Speed: Trainline 6112 → Door Enable (only at zero speed)

KEY COMPONENTS:
- DCU: Door Control Unit (1 per door)
- Door Motor: 200W DC motor with thermal protection
- Door Edge Sensor: Pressure-sensitive safety edge
- Door Proving Switch: Mechanical position confirmation
- CLIP (Closing Limit Interlock Panel): Safety interlock

KEY DRAWINGS:
- 942-58137: Saloon Door Supply Voltage
- 942-58138: Door Operation Left
- 942-58139: Door Operation Right
- 942-58140: Door Proving Loop
- 942-58141: Local Door Interlock

DIAGNOSTICS:
- DOOR_FAULT (Trainline 6073/6076): Door proving failure
- DOOR_CROSS_FAULT (Trainline 6009/6014/6046/6051): Cross-connection
- DOOR_MOTOR_FAULT: Door motor failure

TEST PROCEDURES:
1. Test door open/close cycle (3 seconds each direction)
2. Verify door proving signals (6073/6076)
3. Check zero speed interlock (6112)
4. Test safety edge activation
5. Verify cross-connection at jumpers 43-44, 46-47`,
    technicalSpecs: 'DCU: 110VDC, Motor: 200W/110VDC, Open Time: 3.0s, Close Time: 3.0s, Closing Force: 150N, Safety Edge: Pressure-sensitive',
    powerRequirements: '110VDC door power, 24VDC control signals',
    voltage: '110VDC motor supply, 110VDC control loops, 24VDC sensor power',
    safetyFeatures: 'Dual safety edge sensors, Door proving loop (6073/6076), Zero speed interlock (6112), Anti-trap protection, Emergency release mechanism, Manual override',
    maintenanceSchedule: 'Daily: Visual inspection, Monthly: Door edge sensor test, Quarterly: Door alignment check, Annually: Motor brush inspection, Door mechanism lubrication',
    sparePartsInfo: 'DCU circuit board, Door motor assembly, Safety edge sensor, Door proving switch, CLIP relay, Door seal gaskets',
  },
  APS: {
    description: `Auxiliary Power Supply — Power distribution for non-traction loads.

ARCHITECTURE:
The APS system converts 750VDC catenary supply to 415VAC (3-phase) and 230VAC (single-phase) for auxiliary loads, and 110VDC for control power. It includes the SIV (Static Inverter), battery charger, and shore supply interface.

POWER FLOW:
750VDC (Pantograph) → APS1 → SIV → 415VAC (3-phase) → Auxiliary Loads
750VDC → Battery Charger → 110VDC Battery Bus → Control Systems
Shore Supply → 415VAC → All Auxiliaries (when pantograph down)

SIGNAL FLOW:
TCMS → Trainline 1215 (APS Fault) → APS1 Status
Battery: Trainline 5064 (Battery Voltage) → TCMS Monitoring
SIV: Trainline 5030/5031 (SIV Contact Status) → TCMS

KEY COMPONENTS:
- APS1: Auxiliary Power Supply unit
- SIV: Static Inverter (DC/AC conversion)
- Battery: 110V/200Ah lead-acid
- Battery Charger: 50A automatic charger
- Shore Supply Contactor: External power connection

KEY DRAWINGS:
- 942-58130: APS Main Circuit
- 942-58131: SIV Control Circuit
- 942-58132: Battery Control

DIAGNOSTICS:
- AUX_FAULT (Trainline 1215): APS internal fault
- BATTERY_FAULT (Trainline 5064): Battery under-voltage

TEST PROCEDURES:
1. Verify 750VDC at APS input
2. Check SIV output (415VAC ±5%)
3. Test battery voltage (110VDC ±10%)
4. Verify battery charger operation
5. Test shore supply transfer`,
    technicalSpecs: 'APS: 120kVA, SIV: DC/AC 750V→415V/230V, Battery: 110V/200Ah, Charger: 50A, Efficiency: 92%',
    powerRequirements: '750VDC input, 415VAC/230VAC output, 110VDC battery bus',
    voltage: '750VDC input, 415VAC 3-phase output, 230VAC single-phase output, 110VDC battery bus',
    safetyFeatures: 'Overvoltage protection, Undervoltage detection, Battery temperature monitoring, Automatic shore supply transfer, Battery isolation switch, SIV fault shutdown',
    maintenanceSchedule: 'Monthly: Battery voltage check, Quarterly: Insulation resistance test, Annually: Battery capacity test, SIV filter cleaning every 6 months',
    sparePartsInfo: 'SIV IGBT modules, Battery cells, Charger rectifier, Shore supply contactor, Filter capacitors',
  },
  DOOR: {
    description: `Door System — Passenger door control with safety interlocks.

ARCHITECTURE:
Each car has 8 passenger doors (4 per side) controlled by DCU (Door Control Units). The door system includes open/close commands, position feedback, safety edge sensors, and interlock verification. Door commands come from TCMS via trainlines, with local override capability.

POWER FLOW:
110VDC (Trainline) → DCU → Door Motor → Mechanical Linkage → Door Panel
Safety Loop: Door Edge Sensors → Safety Relay → TCMS

SIGNAL FLOW:
TCMS Door Command → Trainline 6009/6014/6046/6051 → DCU → Motor Control
Door Proving: Trainline 6073/6076 → TCMS (all doors closed/locked)
Zero Speed: Trainline 6112 → Door Enable (only at zero speed)

KEY COMPONENTS:
- DCU: Door Control Unit (1 per door)
- Door Motor: 200W DC motor with thermal protection
- Door Edge Sensor: Pressure-sensitive safety edge
- Door Proving Switch: Mechanical position confirmation
- CLIP (Closing Limit Interlock Panel): Safety interlock

KEY DRAWINGS:
- 942-58137: Saloon Door Supply Voltage
- 942-58138: Door Operation Left
- 942-58139: Door Operation Right
- 942-58140: Door Proving Loop
- 942-58141: Local Door Interlock

DIAGNOSTICS:
- DOOR_FAULT (Trainline 6073/6076): Door proving failure
- DOOR_CROSS_FAULT (Trainline 6009/6014/6046/6051): Cross-connection
- DOOR_MOTOR_FAULT: Door motor failure

TEST PROCEDURES:
1. Test door open/close cycle (3 seconds each direction)
2. Verify door proving signals (6073/6076)
3. Check zero speed interlock (6112)
4. Test safety edge activation
5. Verify cross-connection at jumpers 43-44, 46-47`,
    technicalSpecs: 'DCU: 110VDC, Motor: 200W/110VDC, Open Time: 3.0s, Close Time: 3.0s, Closing Force: 150N, Safety Edge: Pressure-sensitive',
    powerRequirements: '110VDC door power, 24VDC control signals',
    voltage: '110VDC motor supply, 110VDC control loops, 24VDC sensor power',
    safetyFeatures: 'Dual safety edge sensors, Door proving loop (6073/6076), Zero speed interlock (6112), Anti-trap protection, Emergency release mechanism, Manual override',
    maintenanceSchedule: 'Daily: Visual inspection, Monthly: Door edge sensor test, Quarterly: Door alignment check, Annually: Motor brush inspection, Door mechanism lubrication',
    sparePartsInfo: 'DCU circuit board, Door motor assembly, Safety edge sensor, Door proving switch, CLIP relay, Door seal gaskets',
  },
  VAC: {
    description: `Ventilation & Air Conditioning — Climate control for cab and saloon.

ARCHITECTURE:
The VAC system provides heating, cooling, and ventilation for the driver's cab and passenger saloon. Each car has independent cab VAC and saloon VAC units. The system uses R-410A refrigerant and 415VAC power from the APS.

POWER FLOW:
415VAC (from APS via X3) → VAC Unit → Compressor → Condenser → Expansion Valve → Evaporator → Air Distribution
110VDC Control → VAC Controller → Fan Speed/Mode Control

SIGNAL FLOW:
TCMS → Trainline 7001 (Cab VAC Fault) → Cab VAC Status
TCMS → Trainline 7050/7060 (Saloon VAC Status) → Saloon VAC
Smoke Detection: Trainline 7070 → Emergency Ventilation

KEY COMPONENTS:
- CAB_VAC1: Cab air conditioning unit
- VAC1/VAC2: Saloon HVAC units
- Compressor: R-410A refrigerant compressor
- Condenser/Evaporator: Heat exchange coils
- Damper Motors: Air flow control

KEY DRAWINGS:
- 942-58143: Cab VAC Circuit
- 942-58144: Saloon VAC 1
- 942-58145: Saloon VAC 2

DIAGNOSTICS:
- CAB_VAC_FAULT (Trainline 7001): Cab VAC failure
- SALOON_VAC_FAULT (Trainline 7050/7060): Saloon VAC failure
- SMOKE_DETECTION (Trainline 7070): Fire alarm in HVAC

TEST PROCEDURES:
1. Verify 415VAC supply to VAC units
2. Check refrigerant pressure (R-410A)
3. Test cooling/heating modes
4. Verify damper operation
5. Test smoke detection shutdown`,
    technicalSpecs: 'Cab VAC: 5kW cooling/3kW heating, Saloon VAC: 35kW cooling/20kW heating, Refrigerant: R-410A, Airflow: 3000m³/h, Supply: 415VAC 3-phase',
    powerRequirements: '415VAC 3-phase for compressors, 110VDC for controls, 24VDC for sensors',
    voltage: '415VAC compressor supply, 110VDC control, 24VDC sensor',
    safetyFeatures: 'Smoke detection emergency shutdown, Refrigerant leak detection, Overcurrent protection, Anti-freeze protection, Fire damper interlock',
    maintenanceSchedule: 'Monthly: Filter cleaning, Quarterly: Refrigerant pressure check, Semi-annually: Compressor oil check, Annually: Full system performance test',
    sparePartsInfo: 'Compressor assembly, Expansion valve, Fan motor, Filter elements, Refrigerant R-410A, Damper motor',
  },
  COMMS: {
    description: `Communications System — PIS, PA, CCTV, Radio, and CBTC.

ARCHITECTURE:
The communications system integrates Passenger Information System (PIS), Public Address (PA), CCTV surveillance, Train Radio, and Communication Based Train Control (CBTC). The system uses Ethernet backbone with M12 connectors for reliable train-to-ground and inter-car communication.

POWER FLOW:
110VDC → Communication Node → Ethernet Switch → Devices
415VAC → PA Amplifiers → Speakers

SIGNAL FLOW:
TCMS → Ethernet Backbone → All Communication Devices
CBTC: Train Radio → Wayside → ATP/ATO Systems
PIS: GPS/Track Circuit → PIS Controller → Displays/Announcements

KEY COMPONENTS:
- TCMS Communication Node 1/2: Network backbone
- PIS Controller: Passenger information management
- PA Amplifier: Audio amplification for announcements
- CCTV Cameras: Interior/exterior surveillance
- CBTC Interface: Train control communication
- DVAS: Digital Voice Announcement System

KEY DRAWINGS:
- 942-38149: DVAS/PA Circuit
- 942-38150: PA Amplifier
- 942-38151: PA Amplifier Sheet 2
- 942-38152: CBTC Communication
- 942-38153: Train Radio Interface
- 942-38154: CCTV System

DIAGNOSTICS:
- PIS_FAULT: Passenger information system failure
- PA_FAULT: Public address system failure
- CBTC_FAULT: Train control communication failure
- CCTV_FAULT: Surveillance system failure

TEST PROCEDURES:
1. Test PA announcement (all zones)
2. Verify PIS display updates
3. Check CCTV camera feeds
4. Test CBTC communication link
5. Verify Ethernet connectivity`,
    technicalSpecs: 'Ethernet: 100BASE-TX M12, PA: 2x120W amplifiers per car, CCTV: 4 cameras per car, CBTC: 2.4GHz radio, PIS: LED/LCD displays',
    powerRequirements: '110VDC for communication nodes, 415VAC for PA amplifiers, 24VDC for cameras',
    voltage: '110VDC control, 415VAC PA power, 24VDC camera supply, Ethernet data',
    safetyFeatures: 'CBTC safety integrity level SIL4, PA emergency override, CCTV recording redundancy, Communication loop protection, Fire alarm integration',
    maintenanceSchedule: 'Monthly: Camera lens cleaning, Quarterly: PA system test, Semi-annually: CBTC calibration, Annually: Full communication system audit',
    sparePartsInfo: 'Ethernet switch M12, PA amplifier module, CCTV camera, CBTC radio module, PIS display unit, Speaker assemblies',
  },
  TMS: {
    description: `Train Control Management System (TCMS) — Central nervous system of the train.

ARCHITECTURE:
The TCMS is the central control and monitoring system that coordinates all subsystems. It uses Remote I/O (RIO) units distributed across cars, connected via Ethernet backbone. The TCMS monitors all trainlines, controls door/traction/brake commands, and provides driver interface.

POWER FLOW:
110VDC → TCMS_RIO1/RIO2 → Ethernet Switch → All RIO Units
24VDC → Sensors → RIO Inputs → TCMS Processing

SIGNAL FLOW:
Driver Console → TCMS Master → Ethernet → RIO Units → Field Devices
Feedback: All Sensors → RIO Inputs → Ethernet → TCMS → Driver Display
Diagnostics: TCMS → Ethernet → Ground Systems (via CBTC)

KEY COMPONENTS:
- TCMS_RIO1 (U15): Remote I/O Unit 1 - Digital I/O
- TCMS_RIO2 (U25): Remote I/O Unit 2 - APS/Battery monitoring
- Ethernet Switch: Network backbone (M12 connectors)
- Driver Console: HMI display and controls
- Terminal Block: Wiring distribution

KEY DRAWINGS:
- 942-58146: TCMS Communication
- 942-38610: TCMS RIO Pin Assignment

DIAGNOSTICS:
- TCMS_COMM_FAULT: Ethernet communication failure
- TCMS_RIO_FAULT: Remote I/O unit failure

TEST PROCEDURES:
1. Verify Ethernet link status (all ports)
2. Check RIO unit status LEDs
3. Test all digital I/O points
4. Verify driver console display
5. Check CBTC communication`,
    technicalSpecs: 'RIO: 64 DI + 32 DO + 8 AI per unit, Ethernet: 100BASE-TX, Processor: ARM Cortex-A9, Protocol: Ethernet/IP, Scan Rate: 10ms',
    powerRequirements: '110VDC for RIO units, 24VDC for sensors, Ethernet for data',
    voltage: '110VDC RIO supply, 24VDC sensor supply, Ethernet data signals',
    safetyFeatures: 'Watchdog timer, Redundant Ethernet paths, RIO health monitoring, Driver alert system, Emergency mode capability',
    maintenanceSchedule: 'Monthly: RIO status check, Quarterly: Ethernet cable inspection, Semi-annually: Full I/O test, Annually: TCMS software update',
    sparePartsInfo: 'RIO circuit board, Ethernet switch M12, Driver console display, Terminal block assemblies, Ethernet cables',
  },
  CAB: {
    description: `Controlling Cab — Driver interface and cab equipment.

ARCHITECTURE:
The controlling cab (DMC car) contains all driver controls, instrument panels, and cab-side interfaces. It includes the master controller (throttle/brake), driver console displays, cab signaling equipment, horn, wiper controls, and cab HVAC. The cab provides the primary operator interface for train operation.

POWER FLOW:
110VDC → Cab Panel → All Cab Equipment
230VAC → Cab VAC → Climate Control
24VDC → Instrument Displays → Driver Feedback

SIGNAL FLOW:
Driver Input → Master Controller → TCMS → Trainlines → Field Devices
Feedback: Sensors → RIO → Ethernet → TCMS → Driver Display
Cab Signal: ATP/CBTC → Cab Signal Display → Driver Alert

KEY COMPONENTS:
- Master Controller: 7-notch throttle/brake controller
- Driver Console: TFT display with touch interface
- Dead Man Switch: Vigilance device (safety critical)
- Cab Signal Display: ATP/CBTC status
- Horn: Dual-tone (high/low)
- Wiper: Intermittent control with washer

KEY DRAWINGS:
- 942-38103: HV System PIN Drawing
- 942-38104: Cab Panel Pin Assignment
- 942-38105: MCB Panel Pin Assignment
- 942-38107: CAB PIN Drawing

DIAGNOSTICS:
- DEAD_MAN_FAULT: Vigilance device activation
- MASTER_CTRL_FAULT: Master controller failure
- CAB_SIGNAL_FAULT: ATP/CBTC signal loss

TEST PROCEDURES:
1. Test master controller all 7 notches
2. Verify dead man switch operation
3. Check cab signal display
4. Test horn (high/low)
5. Verify wiper operation`,
    technicalSpecs: 'Master Controller: 7 positions, Dead Man: 30s timeout, Display: 10.4" TFT 800x600, Horn: Dual-tone 110dB, Wiper: Intermittent 0-60s',
    powerRequirements: '110VDC control, 230VAC cab VAC, 24VDC displays',
    voltage: '110VDC cab panel, 230VAC HVAC, 24VDC instrumentation',
    safetyFeatures: 'Dead man switch (vigilance), Emergency brake plunger, Emergency horn, Cab door interlock, Driver seat occupancy sensor, Overspeed alarm',
    maintenanceSchedule: 'Daily: Visual inspection, Monthly: Dead man switch test, Quarterly: Master controller calibration, Annually: Full cab equipment audit',
    sparePartsInfo: 'Master controller assembly, Dead man switch, Driver console display, Horn assembly, Wiper motor, Cab VAC filters',
  },
  HV: {
    description: `High Tension / HV System — 750VDC power distribution.

ARCHITECTURE:
The HV system handles the 750VDC catenary supply from pantograph to traction and auxiliary systems. It includes the pantograph, HSCB, DC bus, and grounding system. The HV system is the primary power path for the entire train.

POWER FLOW:
750VDC Catenary → Pantograph → HSCB → DC Bus → TRAC (Traction)
750VDC DC Bus → APS (Auxiliary Power)
750VDC DC Bus → DC/DC Converter → 110VDC Control

SIGNAL FLOW:
Pantograph: Trainline 1003/1004 (Up/Down status)
HSCB: Trainline 1209 (Trip status)
DC Bus: Trainline 1207 (Voltage presence)

KEY COMPONENTS:
- Pantograph: Current collection from 750VDC catenary
- HSCB: High Speed Circuit Breaker (3000A)
- DC Bus Bar: Main 750VDC distribution
- Surge Arrestor: Overvoltage protection
- Grounding System: Safety ground connections

KEY DRAWINGS:
- 942-58106: HV Power Distribution
- 942-58119: Pantograph Control
- 942-38103: HV System PIN Drawing

DIAGNOSTICS:
- HSCB_TRIP (Trainline 1209): Overcurrent trip
- PANTOGRAPH_FAULT (Trainline 1003/1004): Pantograph failure
- DC_BUS_FAULT: DC bus voltage abnormal

TEST PROCEDURES:
1. Verify pantograph raise/lower
2. Check HSCB operation
3. Measure DC bus voltage (750VDC ±10%)
4. Test surge arrestor
5. Verify grounding continuity`,
    technicalSpecs: 'Pantograph: 750VDC/3000A, HSCB: 750VDC/3000A/50kA breaking, DC Bus: 3000A rated, Surge Arrestor: 10kA',
    powerRequirements: '750VDC main supply from catenary',
    voltage: '750VDC catenary supply, 750VDC DC bus',
    safetyFeatures: 'HSCB overcurrent protection, Surge arrestor, Grounding system, Pantograph interlock, Dead man switch, Emergency brake integration',
    maintenanceSchedule: 'Monthly: Pantograph carbon strip check, Quarterly: HSCB contact inspection, Semi-annually: DC bus insulation test, Annually: Full HV system audit',
    sparePartsInfo: 'Pantograph carbon strips, HSCB contact set, Surge arrestor, DC bus connectors, Grounding cables',
  },
  LIGHT: {
    description: `Interior Lighting — Saloon and cab lighting systems.

ARCHITECTURE:
The lighting system provides interior illumination for the passenger saloon and driver's cab. It includes LED lighting modules, headlight assemblies, and emergency lighting powered by the battery system.

POWER FLOW:
230VAC (from APS) → ELCB → Lighting Circuits → LED Modules
110VDC Battery → Emergency Lighting → Safety照明

SIGNAL FLOW:
Lighting Switch → Relay → Lighting Circuits
Emergency: Battery Voltage (Trainline 5064) → Emergency Lighting

KEY COMPONENTS:
- ELCB1-4: Earth Leakage Circuit Breakers
- LED Modules: Interior saloon lighting
- Headlight Assembly: Front/rear headlights
- HLS Relay: Headlight switch control
- Emergency Lighting: Battery-powered safety lights

KEY DRAWINGS:
- 942-58112: Headlight Circuit
- 942-58115: Saloon Lighting

DIAGNOSTICS:
- HEADLIGHT_FAULT (Trainline 5110/5111): Headlight failure
- SALOON_LIGHT_FAULT (Trainline 5201-5204): Saloon light failure
- EMERGENCY_LIGHT (Trainline 5064): Emergency lighting failure

TEST PROCEDURES:
1. Test all interior lights
2. Verify headlight operation (high/low beam)
3. Test emergency lighting activation
4. Check ELCB operation
5. Verify battery backup`,
    technicalSpecs: 'Saloon: LED 230VAC, Headlight: 12V/55W halogen, Emergency: 110VDC battery, ELCB: 16A/30mA',
    powerRequirements: '230VAC for main lighting, 110VDC for emergency lighting',
    voltage: '230VAC main supply, 110VDC emergency, 12VDC headlights',
    safetyFeatures: 'Emergency battery backup, Earth leakage protection, Automatic emergency activation, Fire-rated wiring',
    maintenanceSchedule: 'Monthly: Visual inspection, Quarterly: Emergency light test, Annually: Full lighting system audit',
    sparePartsInfo: 'LED modules, Headlight bulbs, ELCB breakers, HLS relay, Emergency light units',
  },
  TRL: {
    description: `Trainlines — Cross-car wiring for control and signal distribution.

ARCHITECTURE:
Trainlines are the wiring backbone that connects all cars in the formation. They carry control signals, power distribution, and communication buses through inter-car connectors (X1-X4). Each trainline has a specific function (control, signal, power, communication) and runs through all 6 cars.

POWER FLOW:
DMC Car → X1/X2 Connectors → TC Car → MC Car → MC Car → TC Car → DMC Car
Power Trainlines: 750VDC/110VDC distribution through all cars
Signal Trainlines: Control/monitoring signals through all cars

SIGNAL FLOW:
TCMS Commands → Trainlines → All Car RIO Units → Field Devices
Feedback: All Sensors → RIO → Trainlines → TCMS

KEY COMPONENTS:
- X1: 74-pin control signal connector (74P)
- X2: 74-pin RS422/CAN communication connector
- X3: 11-pin 415VAC power connector
- X4: 3-pin 110VDC power connector

KEY DRAWINGS:
- 942-58103: Train Lines Control
- 942-58104: Train Lines Signal

CROSS-CONNECTIONS (CRITICAL):
- X1 Pins 19/20: Powering 1 & 2 (3005/3006) - CROSSED
- X1 Pins 43/44: Door Open Left (6009/6046) - CROSSED
- X1 Pins 46/47: Door Close Left (6014/6051) - CROSSED

TEST PROCEDURES:
1. Verify all X1 pin connections
2. Check cross-connection wiring (19/20, 43/44, 46/47)
3. Test trainline continuity through all cars
4. Verify power distribution (X3, X4)
5. Check communication buses (X2)`,
    technicalSpecs: 'X1: 74-pin control, X2: 74-pin RS422/CAN, X3: 11-pin 415VAC, X4: 3-pin 110VDC, Total: 162 pins per inter-car connection',
    powerRequirements: '750VDC/110VDC power distribution, 415VAC auxiliary power',
    voltage: '750VDC traction, 110VDC control, 415VAC auxiliary, 24VDC instrumentation',
    safetyFeatures: 'Cross-connection protection, Interlock verification, Power sequencing, Emergency power path',
    maintenanceSchedule: 'Monthly: Connector inspection, Quarterly: Continuity test, Semi-annually: Insulation resistance, Annually: Full trainline audit',
    sparePartsInfo: 'X1-X4 connector assemblies, Contact pins, Sealing gaskets, Jumper cables',
  },
  GEN: {
    description: `General / Foundation — Drawing standards, classification, and conventions.

ARCHITECTURE:
The GEN system encompasses all general documentation, drawing standards, symbol libraries, and classification systems used across the VCC platform. It provides the foundation for all other systems.

KEY DRAWINGS:
- 942-58099: Drawing List and Classification
- 942-58100: Wiring Number Conventions
- 942-58101: Symbol Library
- 942-58102: Abbreviations and Notes

WIRING NUMBER FORMAT:
XXXX XX (5-digit format)
- Digits 1-2: Unit identification
- Digit 3: Car position
- Digit 4: Trainline number
- Digit 5: Serial number

TEST PROCEDURES:
1. Verify drawing numbering convention
2. Check symbol library completeness
3. Verify abbreviation consistency`,
    technicalSpecs: 'Drawing format: A0/A1 landscape, Scale: 1:1, Revision tracking: Alphabetic (A,B,C,D)',
    powerRequirements: 'N/A - Documentation system',
    voltage: 'N/A',
    safetyFeatures: 'Document control, Revision tracking, Approval workflow',
    maintenanceSchedule: 'As needed - document updates',
    sparePartsInfo: 'N/A - Documentation system',
  },
  COUPLING: {
    description: `Coupling System — Train-to-train coupling control.

ARCHITECTURE:
The coupling system manages the mechanical and electrical connections between coupled trains. When two formations are coupled, the system extends the TCMS network and power distribution automatically.

KEY DRAWINGS:
- 942-17001: Coupling Control Circuit
- 942-17002: Coupling Motor Control
- 942-17003: ICC Lock Circuit
- 942-17004: Coupling Interface Diagram

TEST PROCEDURES:
1. Verify coupling detection sensor
2. Test electrical bus extension
3. Check communication cascade
4. Verify brake pipe continuity`,
    technicalSpecs: 'Electrical Coupler: 200+ contacts, Power: 750VDC/415VAC, Communication: Ethernet cascade',
    powerRequirements: '750VDC power coupling, 110VDC control, Ethernet communication',
    voltage: '750VDC, 415VAC, 110VDC, Ethernet data',
    safetyFeatures: 'Coupling confirmation sensor, Power interlock, Brake pipe continuity check, Communication verification',
    maintenanceSchedule: 'Monthly: Coupler inspection, Quarterly: Contact resistance test, Annually: Full coupling system audit',
    sparePartsInfo: 'Coupler contact blocks, Detection sensor, Power bus contactors, Ethernet cascade switch',
  },
  COUPL: {
    description: `Coupler Control — Electrical coupling between coupled trains.

ARCHITECTURE:
The coupler control system manages the electrical connections between coupled trains, extending the TCMS network and power distribution when two formations are coupled.

TEST PROCEDURES:
1. Verify coupler electrical connection
2. Test power bus extension
3. Check communication bus cascade
4. Verify brake pipe continuity`,
    technicalSpecs: 'Electrical coupler with 200+ contacts, Automatic detection sensor',
    powerRequirements: '750VDC power, 110VDC control, Ethernet data',
    voltage: '750VDC, 110VDC, Ethernet',
    safetyFeatures: 'Coupling confirmation, Power interlock, Communication verification',
    maintenanceSchedule: 'Monthly: Coupler inspection, Quarterly: Contact test',
    sparePartsInfo: 'Coupler contacts, Detection sensor',
  },
  LTEB: {
    description: `Low Tension Equipment Box — 110VDC/24VDC control distribution hub.

ARCHITECTURE:
The LTEB houses 110VDC and 24VDC control equipment including relay logic, terminal blocks, and signal conditioning circuits. It serves as the central wiring junction for control signals between the TCMS and field devices.

KEY DRAWINGS:
- 942-38305: DMC Underframe Pin Assignment
- 942-38306: VVVF Inverter Pin Assignment

TEST PROCEDURES:
1. Verify 110VDC distribution
2. Check relay logic operation
3. Test terminal block connections
4. Verify signal conditioning`,
    technicalSpecs: '74-pin inter-car connectors (X1, X2), Terminal blocks TB1-TB12, IP43 enclosure',
    powerRequirements: '110VDC control, 24VDC sensors',
    voltage: '110VDC, 24VDC',
    safetyFeatures: 'Inter-car connector interlock, Control power fusing, Relay contact monitoring',
    maintenanceSchedule: 'Monthly: Visual inspection, Quarterly: Relay contact test',
    sparePartsInfo: 'Relay modules, Terminal blocks, Fuse holders',
  },
  LTJB: {
    description: `Low Tension Junction Box — Cable termination and distribution.

ARCHITECTURE:
The LTJB provides cable termination and distribution points for 110VDC and 24VDC control wiring within each car.

KEY DRAWINGS:
- 942-38312: LTJB Pin Assignment - DM Car

TEST PROCEDURES:
1. Verify cable terminations
2. Check bus bar connections
3. Test test point access`,
    technicalSpecs: 'Terminal block strips, IP54 rated enclosure, Cable glands',
    powerRequirements: '110VDC control, 24VDC signal',
    voltage: '110VDC, 24VDC',
    safetyFeatures: 'Sealed enclosure (IP54), Labelled terminals, Cable strain relief',
    maintenanceSchedule: 'Monthly: Visual inspection, Quarterly: Torque check',
    sparePartsInfo: 'Terminal blocks, Cable glands, Bus bars',
  },
  EDB: {
    description: `Electrical Distribution Box — Main power distribution hub.

ARCHITECTURE:
The EDB houses circuit breakers (MCBs/MCCBs), contactors, and fuses that distribute 750VDC traction power, 415VAC auxiliary power, and 110VDC control power to all subsystems.

KEY DRAWINGS:
- 942-58132: Battery Control

TEST PROCEDURES:
1. Verify MCB operation
2. Check contactor switching
3. Test earth fault detection
4. Verify surge protection`,
    technicalSpecs: 'Main contactor: 750VDC/3000A, 24 branch MCBs, Earth leakage relay, Surge protection',
    powerRequirements: '750VDC main bus, 415VAC auxiliary, 110VDC control',
    voltage: '750VDC, 415VAC, 110VDC, 24VDC',
    safetyFeatures: 'Main circuit breaker shunt trip, Earth fault detection, Arc fault detection, Door interlock, Padlock provisions',
    maintenanceSchedule: 'Monthly: MCB trip test, Quarterly: Contact resistance, Annually: Full distribution audit',
    sparePartsInfo: 'MCB breakers, Contactors, Fuse links, Surge arrestors, Earth leakage relay',
  },
  BOGIE: {
    description: `Bogie System — Mechanical and electrical interfaces on bogie frame.

ARCHITECTURE:
The bogie system covers speed sensors, brake actuators, suspension monitoring, and bogie-mounted equipment junction boxes.

KEY DRAWINGS:
- 942-58107: Bogie Equipment

TEST PROCEDURES:
1. Verify speed sensor signals
2. Check brake cylinder pressure
3. Test suspension monitoring
4. Verify BMJB connections`,
    technicalSpecs: 'Speed sensors: 2 per axle (redundant), Brake disc temp monitoring, Primary/secondary suspension sensors',
    powerRequirements: '24VDC sensors, 110VDC brake commands, 750VDC traction',
    voltage: '24VDC sensor, 110VDC brake, 750VDC traction',
    safetyFeatures: 'Speed sensor redundancy, Brake cylinder monitoring, Over-speed protection, Bogie fire detection',
    maintenanceSchedule: 'Monthly: Speed sensor check, Quarterly: Brake inspection, Annually: Full bogie audit',
    sparePartsInfo: 'Speed sensor assembly, Brake pads, Suspension springs, BMJB connectors',
  },
  PIS: {
    description: `Passenger Information System — Automated announcements and displays.

ARCHITECTURE:
The PIS provides automated/manual announcements, destination displays, and passenger guidance. It includes front/rear LED destination boards, internal LCD displays, audio PA system, and GPS/location-based auto-announcements.

KEY DRAWINGS:
- 942-38109: PIS/TIS Sheet 2

KEY COMPONENTS:
- PIS Controller: Central PIS management
- CCU (Central Control Unit): Core PIS processing
- ICOM (Inter-Car Communication Module): Inter-car audio/data
- LED Destination Displays: Front/rear
- LCD Internal Displays: Per car
- PA Amplifiers: 2 per car

TEST PROCEDURES:
1. Test PA announcement all zones
2. Verify LED destination display
3. Check LCD internal displays
4. Test GPS auto-announcement
5. Verify inter-car communication`,
    technicalSpecs: 'LED: Front/rear destination, LCD: Per car, Audio: 2x120W amplifiers, GPS: Location-based announcements',
    powerRequirements: '110VDC PIS power, 230VAC audio, 24VDC displays',
    voltage: '110VDC control, 230VAC audio, 24VDC displays',
    safetyFeatures: 'Emergency announcement override, Driver manual priority, Fire alarm trigger, Low-power mode',
    maintenanceSchedule: 'Monthly: Display check, Quarterly: PA test, Annually: Full PIS audit',
    sparePartsInfo: 'PIS Controller, CCU module, ICOM module, LED displays, LCD displays, PA amplifiers',
  },
  DISPLAY: {
    description: `Display System — Driver console and passenger displays.

ARCHITECTURE:
Includes driver console DMI (Driver Machine Interface), passenger information displays, and crew communication displays.

KEY COMPONENTS:
- DMI: 10.4" TFT LCD driver display
- Passenger LED/LCD displays
- Touch screen interface

TEST PROCEDURES:
1. Verify DMI display
2. Check passenger displays
3. Test touch interface`,
    technicalSpecs: 'DMI: 10.4" TFT 800x600, 500 nits, Anti-glare, Touch screen',
    powerRequirements: '24VDC displays, 110VDC status indicators',
    voltage: '24VDC LCD, 110VDC indicators',
    safetyFeatures: 'Display redundancy, Brightness auto-adjust, Night mode, Fault priority',
    maintenanceSchedule: 'Monthly: Display cleaning, Quarterly: Touch calibration',
    sparePartsInfo: 'DMI display module, LCD panels, Touch screen overlay',
  },
  AUX: {
    description: `Auxiliary Electric System — Battery management and DC-DC conversion.

ARCHITECTURE:
Ensures 110VDC control power availability even when main 750VDC supply is absent.

KEY DRAWINGS:
- 942-58132: Battery Control

TEST PROCEDURES:
1. Verify battery voltage
2. Test charger operation
3. Check DC-DC converter
4. Test shore supply transfer`,
    technicalSpecs: 'Battery: 110V/200Ah, Charger: 50A, DC-DC: 750V→110V',
    powerRequirements: '750VDC input, 110VDC battery bus, 24VDC instrumentation',
    voltage: '750VDC input, 110VDC battery, 24VDC sensors',
    safetyFeatures: 'Under-voltage detection, Over-voltage protection, Battery temperature monitoring, Shore supply transfer',
    maintenanceSchedule: 'Monthly: Battery voltage, Quarterly: Capacity test, Annually: Full battery audit',
    sparePartsInfo: 'Battery cells, Charger rectifier, DC-DC converter, Shore supply contactor',
  },
};

async function main() {
  console.log('=== UPDATING VCC DESCRIPTIONS ===\n');

  let updated = 0;
  let created = 0;

  for (const [systemCode, desc] of Object.entries(DETAILED_DESCRIPTIONS)) {
    const existing = await prisma.vCCDescription.findUnique({
      where: { systemCode },
    });

    if (existing) {
      // Update existing
      await prisma.vCCDescription.update({
        where: { systemCode },
        data: {
          description: desc.description,
          technicalSpecs: desc.technicalSpecs,
          powerRequirements: desc.powerRequirements,
          voltage: desc.voltage,
          safetyFeatures: desc.safetyFeatures,
          maintenanceSchedule: desc.maintenanceSchedule,
          sparePartsInfo: desc.sparePartsInfo,
          source: 'EXPERT_SEED',
          documentVersion: '2.0',
          lastUpdated: new Date(),
        },
      });
      console.log(`  UPDATED: ${systemCode} (${desc.description.length} chars)`);
      updated++;
    } else {
      // Create new
      const system = await prisma.system.findUnique({ where: { code: systemCode } });
      if (system) {
        await prisma.vCCDescription.create({
          data: {
            systemCode,
            systemName: system.name,
            description: desc.description,
            technicalSpecs: desc.technicalSpecs,
            powerRequirements: desc.powerRequirements,
            voltage: desc.voltage,
            safetyFeatures: desc.safetyFeatures,
            maintenanceSchedule: desc.maintenanceSchedule,
            sparePartsInfo: desc.sparePartsInfo,
            source: 'EXPERT_SEED',
            documentVersion: '2.0',
          },
        });
        console.log(`  CREATED: ${systemCode} (${desc.description.length} chars)`);
        created++;
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Created: ${created}`);
  console.log(`  Total: ${updated + created}`);

  await prisma.$disconnect();
}

main().catch(console.error);
