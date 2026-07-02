'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, ChevronRight, Zap, Shield, Cpu, Wind, Battery,
  Activity, Radio, Lightbulb, Settings, Thermometer, Waves,
  Gauge, Power, Plug, CircuitBoard, AlertTriangle, CheckCircle,
  BookOpen, Beaker, Wrench, ArrowRight,
} from 'lucide-react';

interface ComponentEntry {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  function: string;
  symbol: string;
  operatingPrinciple: string;
  applications: string[];
  testing: string[];
  failureModes: string[];
  measurements: { param: string; normal: string; unit: string }[];
  relatedSystems: string[];
  relatedDrawings: string[];
  safetyNotes: string[];
  maintenanceInterval: string;
}

const COMPONENTS: ComponentEntry[] = [
  {
    id: 'relay',
    name: 'Relay',
    category: 'Switching',
    icon: Zap,
    color: 'text-yellow-400',
    description: 'An electrically operated switch that uses an electromagnet to mechanically switch contacts. Relays allow a low-power signal to control a higher-power circuit.',
    function: 'Signal amplification, isolation between control and power circuits, logic operations, safety interlocking.',
    symbol: 'K (e.g., K1, K2, K300)',
    operatingPrinciple: 'When current flows through the coil, it generates a magnetic field that attracts the armature, moving the contacts from their normal position. When current stops, the spring returns contacts to normal position.',
    applications: ['Traction control circuits', 'Door interlocking', 'Brake safety loop', 'Lighting control', 'VAC compressor control', 'Battery charger control'],
    testing: ['Measure coil resistance (typically 100-1000Ω)', 'Apply rated voltage to coil, verify audible click', 'Check contact continuity with multimeter', 'Verify contact resistance < 0.1Ω', 'Check for welded/stuck contacts', 'Verify insulation resistance > 10MΩ'],
    failureModes: ['Coil burnout (open circuit)', 'Welded contacts (stuck closed)', 'Bounce/wear on contacts', 'Mechanical failure of armature', 'Insulation breakdown', 'Oxidation on contacts causing high resistance'],
    measurements: [
      { param: 'Coil Resistance', normal: '100-1000', unit: 'Ω' },
      { param: 'Contact Resistance', normal: '< 0.1', unit: 'Ω' },
      { param: 'Insulation Resistance', normal: '> 10', unit: 'MΩ' },
      { param: 'Operating Voltage', normal: '110V DC / 230V AC', unit: '' },
    ],
    relatedSystems: ['TRAC', 'BRAKE', 'DOOR', 'APS', 'LIGHT', 'VAC'],
    relatedDrawings: ['942-58120', '942-58125', '942-58137', '942-58130', '942-58112'],
    safetyNotes: ['Never touch live relay contacts', 'De-energize coil before replacement', 'Check for welded contacts before assuming correct operation'],
    maintenanceInterval: 'Visual inspection every 6 months, full test annually',
  },
  {
    id: 'mcb',
    name: 'MCB (Miniature Circuit Breaker)',
    category: 'Protection',
    icon: Shield,
    color: 'text-red-400',
    description: 'An automatically operated electrical switch designed to protect circuits from overcurrent. Trips on overload or short circuit conditions.',
    function: 'Overcurrent protection, short circuit protection, manual switching for maintenance isolation.',
    symbol: 'QF (e.g., QF1, QF2)',
    operatingPrinciple: 'Uses thermal (bimetallic strip for overload) and magnetic (solenoid for short circuit) trip mechanisms. Under normal conditions, contacts remain closed. On fault current, the trip mechanism releases the latch, opening contacts.',
    applications: ['Power distribution protection', 'Auxiliary circuit protection', 'Battery circuit protection', 'Lighting circuit protection', 'Compressor circuit protection'],
    testing: ['Visual inspection for damage/burns', 'Manual trip test (toggle to OFF)', 'Verify trip current rating matches circuit design', 'Check contact condition', 'Measure insulation resistance', 'Verify proper torque on terminals'],
    failureModes: ['Contacts welding closed (won\'t trip)', 'Nuisance tripping', 'Mechanical latch failure', 'Thermal element fatigue', 'Terminal overheating', 'Physical damage from vibration'],
    measurements: [
      { param: 'Trip Current (In)', normal: '6-63', unit: 'A' },
      { param: 'Breaking Capacity', normal: '6-10', unit: 'kA' },
      { param: 'Contact Resistance', normal: '< 5', unit: 'mΩ' },
      { param: 'Insulation Resistance', normal: '> 2', unit: 'MΩ' },
    ],
    relatedSystems: ['APS', 'HV', 'LIGHT', 'TRAC'],
    relatedDrawings: ['942-58130', '942-58106', '942-58112'],
    safetyNotes: ['Always verify OFF position before working on protected circuit', 'Replace only with same rating MCB', 'Check for signs of arcing damage'],
    maintenanceInterval: 'Visual every 6 months, trip test annually',
  },
  {
    id: 'fuse',
    name: 'Fuse',
    category: 'Protection',
    icon: Shield,
    color: 'text-orange-400',
    description: 'A sacrificial overcurrent protection device that contains a metal wire or strip that melts when excessive current flows through it, breaking the circuit.',
    function: 'Short circuit protection, last-resort overcurrent protection, equipment protection.',
    symbol: 'F (e.g., F1, F2)',
    operatingPrinciple: 'The fuse element is designed to melt at a specific current level (I²t characteristic). When the current exceeds the rating, the element melts and creates an open circuit. Must be replaced after operation.',
    applications: ['Control circuit protection', 'Sensor circuit protection', 'Communication line protection', 'Battery protection'],
    testing: ['Visual inspection for blown element', 'Continuity test with multimeter', 'Verify correct rating', 'Check holder contacts for corrosion'],
    failureModes: ['Blown element (open circuit)', 'Intermittent connection', 'Holder contact corrosion', 'Wrong rating installed'],
    measurements: [
      { param: 'Current Rating', normal: '0.5-32', unit: 'A' },
      { param: 'Voltage Rating', normal: '250-600', unit: 'V' },
      { param: 'Breaking Capacity', normal: '1-10', unit: 'kA' },
      { param: 'Resistance', normal: '< 0.5', unit: 'Ω' },
    ],
    relatedSystems: ['APS', 'TMS', 'COMMS', 'LIGHT'],
    relatedDrawings: ['942-58130', '942-58146'],
    safetyNotes: ['Always replace with same rating and type', 'Never bypass a fuse', 'Check for root cause before replacing'],
    maintenanceInterval: 'Visual inspection every maintenance cycle',
  },
  {
    id: 'contactor',
    name: 'Contactor',
    category: 'Switching',
    icon: Plug,
    color: 'text-emerald-400',
    description: 'A heavy-duty relay designed for switching high-power electrical loads such as motors, compressors, and heating elements. Designed for frequent switching operations.',
    function: 'High-power load switching, motor starting, compressor control, heating element control.',
    symbol: 'KM (e.g., KM1, CM)',
    operatingPrinciple: 'Similar to relay but designed for higher current ratings. Coil energization moves contacts to switch the load. Auxiliary contacts provide status feedback. Arc quenching chambers handle switching transients.',
    applications: ['Compressor motor control', 'Traction motor pre-charge', 'Heating element control', 'Battery charger contactor', 'SIV contact control'],
    testing: ['Measure coil resistance', 'Verify contact resistance under load', 'Check arc quenching condition', 'Test auxiliary contacts', 'Verify coil voltage', 'Check mechanical interlocks'],
    failureModes: ['Coil burnout', 'Contact welding', 'Arc damage', 'Coil voltage dropout', 'Mechanical wear', 'Coil chattering'],
    measurements: [
      { param: 'Coil Voltage', normal: '110', unit: 'V DC' },
      { param: 'Main Contact Rating', normal: '100-400', unit: 'A' },
      { param: 'Contact Resistance', normal: '< 0.05', unit: 'Ω' },
      { param: 'Coil Power', normal: '20-50', unit: 'W' },
    ],
    relatedSystems: ['BRAKE', 'APS', 'TRAC'],
    relatedDrawings: ['942-58123', '942-58130', '942-58132'],
    safetyNotes: ['Verify load is disconnected before replacement', 'Check for arc damage on contacts', 'Ensure proper torque on power terminals'],
    maintenanceInterval: 'Visual every 3 months, contact resistance test annually',
  },
  {
    id: 'transformer',
    name: 'Transformer',
    category: 'Power Conversion',
    icon: CircuitBoard,
    color: 'text-purple-400',
    description: 'A static device that transfers electrical energy between circuits through electromagnetic induction, changing voltage levels while maintaining frequency.',
    function: 'Voltage step-up/down, galvanic isolation, signal coupling, impedance matching.',
    symbol: 'T (e.g., T1, TG301)',
    operatingPrinciple: 'AC current in the primary winding creates a changing magnetic flux in the core, which induces a voltage in the secondary winding. The turns ratio determines the voltage transformation ratio.',
    applications: ['Auxiliary power supply voltage conversion', 'Control circuit voltage supply', 'Signal isolation', 'Battery charger voltage regulation'],
    testing: ['Measure primary and secondary resistance', 'Check insulation resistance (winding to core)', 'Verify turns ratio', 'Measure inductance', 'Check for core saturation', 'Thermal imaging under load'],
    failureModes: ['Winding short circuit', 'Core saturation', 'Insulation breakdown', 'Overheating', 'Vibration/loose laminations', 'Open circuit winding'],
    measurements: [
      { param: 'Primary Resistance', normal: '0.5-50', unit: 'Ω' },
      { param: 'Secondary Resistance', normal: '0.01-2', unit: 'Ω' },
      { param: 'Insulation Resistance', normal: '> 100', unit: 'MΩ' },
      { param: 'Temperature Rise', normal: '< 80', unit: '°C' },
    ],
    relatedSystems: ['APS', 'HV'],
    relatedDrawings: ['942-58130', '942-58106'],
    safetyNotes: ['High voltage present even when powered off (stored energy)', 'Check for oil leaks on oil-filled types', 'Verify grounding'],
    maintenanceInterval: 'Thermal imaging every 6 months, insulation test annually',
  },
  {
    id: 'diode',
    name: 'Diode',
    category: 'Semiconductor',
    icon: Activity,
    color: 'text-cyan-400',
    description: 'A semiconductor device that allows current to flow in one direction only. Fundamental building block of power electronics and signal processing circuits.',
    function: 'Rectification (AC to DC), voltage clamping, signal demodulation, reverse polarity protection.',
    symbol: 'D (e.g., D1, D2)',
    operatingPrinciple: 'A P-N junction creates a depletion region. Forward bias reduces the barrier allowing current flow (0.7V drop for silicon). Reverse bias widens the barrier blocking current until breakdown voltage.',
    applications: ['Rectifier bridges in APS', 'Freewheeling diodes on relay coils', 'Reverse polarity protection', 'Voltage clamping circuits', 'Signal demodulation'],
    testing: ['Forward voltage drop test (should be 0.6-0.8V for Si)', 'Reverse leakage current test', 'Breakdown voltage test', 'Continuity test (should conduct one way only)'],
    failureModes: ['Short circuit (bidirectional conduction)', 'Open circuit (no conduction)', 'Thermal runaway', 'Reverse breakdown damage'],
    measurements: [
      { param: 'Forward Voltage', normal: '0.6-0.8', unit: 'V' },
      { param: 'Reverse Leakage', normal: '< 1', unit: 'μA' },
      { param: 'Reverse Breakdown', normal: '> 100', unit: 'V' },
      { param: 'Max Forward Current', normal: '1-50', unit: 'A' },
    ],
    relatedSystems: ['APS', 'HV', 'TRAC'],
    relatedDrawings: ['942-58130', '942-58120'],
    safetyNotes: ['Check polarity before installation', 'Verify heat sinking for power diodes', 'Handle by body, not leads'],
    maintenanceInterval: 'Test during scheduled maintenance',
  },
  {
    id: 'thyristor',
    name: 'Thyristor / SCR',
    category: 'Semiconductor',
    icon: Zap,
    color: 'text-amber-400',
    description: 'A four-layer semiconductor device (PNPN) that acts as a latching switch. Once triggered, it conducts until the current drops below the holding threshold.',
    function: 'Controlled rectification, power control, motor speed control, soft starting.',
    symbol: 'T (e.g., T1, T2)',
    operatingPrinciple: 'Gate pulse triggers conduction from cathode to anode. Once triggered, the device latches ON and remains conducting even after gate signal is removed. Turns OFF when anode current drops below holding current.',
    applications: ['VVVF inverter power stage', 'Battery charger current control', 'Motor soft start', 'Heating power control'],
    testing: ['Gate trigger test', 'Forward blocking voltage test', 'Holding current test', 'dV/dt immunity test', 'Thermal resistance measurement'],
    failureModes: ['Gate failure (won\'t trigger)', 'Latch failure (won\'t hold)', 'Short circuit (cathode-anode)', 'Thermal runaway', 'Gate sensitivity change'],
    measurements: [
      { param: 'Gate Trigger Current', normal: '50-300', unit: 'mA' },
      { param: 'Forward Blocking Voltage', normal: '600-1200', unit: 'V' },
      { param: 'Holding Current', normal: '50-200', unit: 'mA' },
      { param: 'On-state Voltage', normal: '1.5-2.5', unit: 'V' },
    ],
    relatedSystems: ['TRAC', 'APS'],
    relatedDrawings: ['942-58120', '942-58130'],
    safetyNotes: ['High voltage and current — extreme caution required', 'Use proper gate drive circuit', 'Ensure adequate heat sinking'],
    maintenanceInterval: 'Full test during major overhaul',
  },
  {
    id: 'mosfet',
    name: 'MOSFET',
    category: 'Semiconductor',
    icon: Cpu,
    color: 'text-blue-400',
    description: 'A voltage-controlled semiconductor switch using Metal-Oxide-Semiconductor field effect. Provides fast switching with minimal power loss.',
    function: 'High-frequency switching, power conversion, motor drive output stage, DC-DC conversion.',
    symbol: 'Q (e.g., Q1, Q2)',
    operatingPrinciple: 'Gate voltage creates an electric field that forms a conductive channel between source and drain. N-channel requires positive Vgs above threshold. P-channel requires negative Vgs.',
    applications: ['VVVF inverter switching stage', 'DC-DC converters', 'PWM motor control', 'Bidirectional current switching'],
    testing: ['Gate threshold voltage test', 'On-resistance measurement (Rds_on)', 'Leakage current test', 'Body diode test', 'Switching speed measurement'],
    failureModes: ['Gate oxide breakdown', 'Drain-source short', 'Parasitic turn-on', 'Thermal runaway', 'Avalanche breakdown'],
    measurements: [
      { param: 'Gate Threshold', normal: '2-4', unit: 'V' },
      { param: 'On-Resistance (Rds_on)', normal: '< 0.1', unit: 'Ω' },
      { param: 'Drain Current (Id)', normal: '50-200', unit: 'A' },
      { param: 'Drain-Source Voltage', normal: '600-1200', unit: 'V' },
    ],
    relatedSystems: ['TRAC', 'APS'],
    relatedDrawings: ['942-58120'],
    safetyNotes: ['ESD sensitive — proper handling required', 'Gate voltage must not exceed rated maximum', 'Verify heat sink attachment'],
    maintenanceInterval: 'Test during scheduled maintenance',
  },
  {
    id: 'igbt',
    name: 'IGBT',
    category: 'Semiconductor',
    icon: Cpu,
    color: 'text-rose-400',
    description: 'Insulated Gate Bipolar Transistor — combines MOSFET gate control with BJT current handling. The primary switch in modern VVVF inverters.',
    function: 'High-power switching, VVVF inverter output stage, motor drive control.',
    symbol: 'Q (e.g., Q1-Q6 in inverter bridge)',
    operatingPrinciple: 'Gate voltage controls a MOSFET-like input stage which drives a BJT-like output stage. Combines high input impedance of MOSFET with low on-state voltage of BJT.',
    applications: ['VVVF traction inverter (main switching elements)', 'Auxiliary inverter', 'Motor speed and torque control'],
    testing: ['Gate threshold voltage test', 'Collector-emitter saturation voltage', 'Switching loss measurement', 'Thermal impedance test', 'Short-circuit withstand test'],
    failureModes: ['Gate failure', 'Collector-emitter short', 'Latching (uncontrolled conduction)', 'Thermal fatigue', 'Bond wire failure'],
    measurements: [
      { param: 'Gate Threshold', normal: '5-7', unit: 'V' },
      { param: 'Vce(sat)', normal: '1.5-3', unit: 'V' },
      { param: 'Collector Current', normal: '200-600', unit: 'A' },
      { param: 'Collector-Emitter Voltage', normal: '1200-3300', unit: 'V' },
    ],
    relatedSystems: ['TRAC'],
    relatedDrawings: ['942-58120', '942-58121'],
    safetyNotes: ['Extremely high voltage/current — only qualified personnel', 'Always verify discharge of DC bus capacitors', 'Use proper PPE'],
    maintenanceInterval: 'Full test during major overhaul',
  },
  {
    id: 'vvvf',
    name: 'VVVF Inverter',
    category: 'Power Conversion',
    icon: Waves,
    color: 'text-indigo-400',
    description: 'Variable Voltage Variable Frequency inverter — converts DC power to variable AC for traction motor speed control. Core component of modern electric traction.',
    function: 'DC to AC conversion, motor speed and torque control, regenerative braking support.',
    symbol: 'VVVF (system-level designation)',
    operatingPrinciple: 'Takes 750V DC input, uses PWM (Pulse Width Modulation) switching of IGBTs to generate variable frequency AC output (0-120Hz). Controls motor speed by varying both voltage and frequency simultaneously.',
    applications: ['Traction motor speed control', 'Regenerative braking', 'Motor current limiting', 'Torque control'],
    testing: ['Output frequency accuracy test', 'Output voltage symmetry', 'DC bus voltage monitoring', 'Gate driver waveforms', 'Thermal performance under load', 'Overcurrent protection test'],
    failureModes: ['IGBT failure (module replacement)', 'Gate driver fault', 'DC bus overvoltage', 'Overcurrent trip', 'Cooling system failure', 'Encoder feedback fault'],
    measurements: [
      { param: 'DC Bus Voltage', normal: '500-900', unit: 'V DC' },
      { param: 'Output Frequency', normal: '0-120', unit: 'Hz' },
      { param: 'Output Current', normal: '0-400', unit: 'A RMS' },
      { param: 'Switching Frequency', normal: '2-8', unit: 'kHz' },
    ],
    relatedSystems: ['TRAC'],
    relatedDrawings: ['942-58119', '942-58120', '942-58121'],
    safetyNotes: ['HIGH VOLTAGE — qualified personnel only', 'DC bus capacitors store lethal energy after power-off', 'Minimum 15 minute discharge wait', 'Lock-out/tag-out required for service'],
    maintenanceInterval: 'Cooling system check monthly, full diagnostic annually',
  },
  {
    id: 'resistor',
    name: 'Resistor',
    category: 'Passive Component',
    icon: Zap,
    color: 'text-slate-400',
    description: 'A passive two-terminal component that implements electrical resistance. Fundamental for voltage division, current limiting, and signal conditioning.',
    function: 'Current limiting, voltage division, pull-up/pull-down, signal termination, energy dissipation.',
    symbol: 'R (e.g., R1, R2)',
    operatingPrinciple: 'Converts electrical energy to heat according to Ohm\'s law (V = IR). Resistance value determined by material resistivity, length, and cross-section.',
    applications: ['Signal conditioning circuits', 'Pull-up/pull-down resistors', 'Voltage dividers for sensing', 'Current sensing resistors', 'Braking resistors'],
    testing: ['Resistance measurement with multimeter', 'Power rating verification', 'Temperature coefficient check', 'Visual inspection for damage'],
    failureModes: ['Open circuit (burnout)', 'Value drift', 'Thermal damage', 'Moisture damage', 'Cracking from vibration'],
    measurements: [
      { param: 'Resistance', normal: 'Varies', unit: 'Ω/kΩ/MΩ' },
      { param: 'Power Rating', normal: '0.125-50', unit: 'W' },
      { param: 'Tolerance', normal: '±1-10', unit: '%' },
      { param: 'Temperature Coefficient', normal: '±50-200', unit: 'ppm/°C' },
    ],
    relatedSystems: ['TMS', 'COMMS', 'TRAC'],
    relatedDrawings: ['942-58146', '942-58120'],
    safetyNotes: ['Check power rating matches application', 'Hot to touch under normal operation is possible', 'Handle carefully — ceramic types are fragile'],
    maintenanceInterval: 'Test during scheduled maintenance',
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    category: 'Passive Component',
    icon: Zap,
    color: 'text-teal-400',
    description: 'A passive two-terminal component that stores electrical energy in an electric field. Used for filtering, energy storage, power factor correction, and signal coupling.',
    function: 'Energy storage, filtering, power factor correction, DC bus stabilization, signal coupling/decoupling.',
    symbol: 'C (e.g., C1, C2)',
    operatingPrinciple: 'Two conductive plates separated by a dielectric material. Voltage across plates stores charge Q = CV. Energy stored: E = ½CV². Blocks DC, passes AC.',
    applications: ['DC bus capacitor in VVVF inverter', 'Filter capacitors in power supplies', 'Timing circuits', 'Coupling capacitors in signal circuits', 'Power factor correction'],
    testing: ['Capacitance measurement', 'ESR (Equivalent Series Resistance) test', 'Leakage current test', 'Visual inspection for bulging/leaking', 'Voltage rating verification'],
    failureModes: ['Dielectric breakdown (short circuit)', 'Capacitance loss (aging)', 'ESR increase', 'Electrolyte leakage (electrolytic)', 'Bulging/explosion (overvoltage)'],
    measurements: [
      { param: 'Capacitance', normal: 'Varies', unit: 'pF/nF/μF/F' },
      { param: 'Voltage Rating', normal: '16-3300', unit: 'V DC' },
      { param: 'ESR', normal: '< 100', unit: 'mΩ' },
      { param: 'Leakage Current', normal: '< 5', unit: 'mA' },
    ],
    relatedSystems: ['TRAC', 'APS', 'TMS'],
    relatedDrawings: ['942-58120', '942-58130'],
    safetyNotes: ['Electrolytic capacitors can explode if reverse-connected', 'DC bus capacitors store lethal energy', 'Always discharge before handling', 'Check polarity'],
    maintenanceInterval: 'Visual inspection every 6 months, capacitance test annually',
  },
  {
    id: 'inductor',
    name: 'Inductor / Choke',
    category: 'Passive Component',
    icon: Waves,
    color: 'text-violet-400',
    description: 'A passive component that stores energy in a magnetic field when current flows through it. Used for filtering, energy storage in power converters, and current smoothing.',
    function: 'Energy storage, current smoothing, EMI filtering, buck/boost conversion.',
    symbol: 'L (e.g., L1, L2)',
    operatingPrinciple: 'Coil of wire that opposes changes in current through it. Energy stored: E = ½LI². Impedance increases with frequency — passes DC, blocks AC.',
    applications: ['Output filter in VVVF inverter', 'EMI filter chokes', 'DC-DC converter energy storage', 'Current smoothing'],
    testing: ['Inductance measurement', 'DC resistance measurement', 'Saturation current test', 'Visual inspection for insulation damage'],
    failureModes: ['Insulation breakdown (shorted turns)', 'Core saturation', 'Mechanical vibration', 'Overheating', 'Core cracking'],
    measurements: [
      { param: 'Inductance', normal: '10-1000', unit: 'μH/mH' },
      { param: 'DC Resistance', normal: '0.01-10', unit: 'Ω' },
      { param: 'Saturation Current', normal: '10-500', unit: 'A' },
      { param: 'Temperature Rise', normal: '< 60', unit: '°C' },
    ],
    relatedSystems: ['TRAC', 'APS'],
    relatedDrawings: ['942-58120'],
    safetyNotes: ['Strong magnetic field — keep away from sensitive equipment', 'May be hot under normal operation', 'Check for loose laminations causing vibration'],
    maintenanceInterval: 'Visual and thermal check every 6 months',
  },
  {
    id: 'encoder',
    name: 'Encoder',
    category: 'Sensor',
    icon: Gauge,
    color: 'text-green-400',
    description: 'A feedback device that converts rotational position/speed into electrical signals. Essential for VVVF motor control closed-loop operation.',
    function: 'Motor speed measurement, rotor position feedback, commutation timing for vector control.',
    symbol: 'ENC (e.g., ENC-M1)',
    operatingPrinciple: 'Optical or magnetic sensing of a patterned disc attached to the motor shaft. Outputs quadrature signals (A, B) for position and speed, plus index pulse (Z) for reference.',
    applications: ['Traction motor speed feedback', 'VVVF commutation', 'Position control', 'Speed limiting'],
    testing: ['Output waveform verification with oscilloscope', 'Signal amplitude check', 'Insulation resistance', 'Mechanical runout check', 'Cable continuity'],
    failureModes: ['Optical disc contamination', 'Signal cable damage', 'Connector corrosion', 'Bearing wear causing misalignment', 'Signal interference/noise'],
    measurements: [
      { param: 'Resolution', normal: '1024-4096', unit: 'pulses/rev' },
      { param: 'Output Voltage (High)', normal: '4.5-5.5', unit: 'V' },
      { param: 'Output Voltage (Low)', normal: '< 0.5', unit: 'V' },
      { param: 'Max Speed', normal: '6000-12000', unit: 'RPM' },
    ],
    relatedSystems: ['TRAC'],
    relatedDrawings: ['942-58119', '942-58120'],
    safetyNotes: ['Handle disc surface carefully — no scratches', 'Verify alignment during installation', 'Check cable routing for interference'],
    maintenanceInterval: 'Signal check every 6 months, alignment check annually',
  },
  {
    id: 'pressure_sensor',
    name: 'Pressure Switch / Sensor',
    category: 'Sensor',
    icon: Gauge,
    color: 'text-sky-400',
    description: 'A device that monitors air pressure in the braking system and provides status signals. Critical for brake safety and compressor control.',
    function: 'Air pressure monitoring, low/high pressure alarm, compressor control, brake availability indication.',
    symbol: 'PS (e.g., PS1, PS2)',
    operatingPrinciple: 'Diaphragm or piston moves with pressure change, actuating electrical contacts at set pressure thresholds. Switch closes/opens at calibrated set points.',
    applications: ['Brake air pressure monitoring', 'Compressor cut-in/cut-out control', 'Low pressure warning', 'Safety interlock'],
    testing: ['Set point calibration check', 'Contact operation verification', 'Leak test', 'Hysteresis check', 'Response time measurement'],
    failureModes: ['Diaphragm failure', 'Set point drift', 'Contact corrosion', 'Air leak at fitting', 'Mechanical wear'],
    measurements: [
      { param: 'Set Point (Low)', normal: '5-7', unit: 'bar' },
      { param: 'Set Point (High)', normal: '9-10', unit: 'bar' },
      { param: 'Contact Rating', normal: '10', unit: 'A @ 250V' },
      { param: 'Hysteresis', normal: '0.5-1.0', unit: 'bar' },
    ],
    relatedSystems: ['BRAKE'],
    relatedDrawings: ['942-58123', '942-58125'],
    safetyNotes: ['Do not adjust calibration without proper equipment', 'Verify pressure source is isolated before removal', 'Check for air leaks regularly'],
    maintenanceInterval: 'Calibration check every 6 months',
  },
  {
    id: 'temperature_sensor',
    name: 'Temperature Sensor (PTC/NTC)',
    category: 'Sensor',
    icon: Thermometer,
    color: 'text-pink-400',
    description: 'A sensor that changes resistance with temperature. PTC (Positive Temperature Coefficient) increases, NTC (Negative) decreases. Used for motor and equipment thermal protection.',
    function: 'Temperature monitoring, overtemperature protection, thermal management control.',
    symbol: 'TH (e.g., TH1, TH-M1)',
    operatingPrinciple: 'PTC thermistor: resistance rises sharply above Curie temperature, triggering protection. NTC thermistor: resistance decreases exponentially with temperature, providing analog temperature measurement.',
    applications: ['Motor winding temperature monitoring', 'VVVF inverter temperature sensing', 'Bearing temperature monitoring', 'Ambient temperature sensing'],
    testing: ['Resistance at known temperature', 'Response time check', 'Insulation resistance', 'Calibration verification'],
    failureModes: ['Drift from calibration', 'Open circuit', 'Short circuit', 'Moisture ingress', 'Physical damage'],
    measurements: [
      { param: 'PTC Trip Temperature', normal: '130-150', unit: '°C' },
      { param: 'NTC Resistance @ 25°C', normal: '1-100', unit: 'kΩ' },
      { param: 'Accuracy', normal: '±1-2', unit: '°C' },
      { param: 'Response Time', normal: '1-5', unit: 'sec' },
    ],
    relatedSystems: ['TRAC', 'APS', 'VAC'],
    relatedDrawings: ['942-58120', '942-58130', '942-58143'],
    safetyNotes: ['Verify correct sensor type for application', 'Check cable routing away from high-temperature areas', 'Verify calibration periodically'],
    maintenanceInterval: 'Calibration verification every 12 months',
  },
  {
    id: 'solenoid',
    name: 'Solenoid Valve',
    category: 'Actuator',
    icon: Settings,
    color: 'text-lime-400',
    description: 'An electromechanical valve that uses an electromagnetic coil to control fluid or air flow. Used extensively in pneumatic brake and door systems.',
    function: 'Pneumatic air flow control, brake application/release, door operation, pressure regulation.',
    symbol: 'SOL (e.g., SOL1, EBMV, PBMV)',
    operatingPrinciple: 'Energizing the coil creates a magnetic field that moves a plunger, opening or closing the valve passage. Spring return to default position when de-energized.',
    applications: ['Emergency brake valve (EBMV)', 'Parking brake valve (PBMV)', 'Door control valves', 'Compressor unloader valve'],
    testing: ['Coil resistance measurement', 'Valve operation test (energize/de-energize)', 'Air leak test', 'Response time measurement', 'Flow rate verification'],
    failureModes: ['Coil burnout', 'Plunger sticking', 'Seat leakage', 'Spring fatigue', 'Contamination blocking flow'],
    measurements: [
      { param: 'Coil Voltage', normal: '24/110', unit: 'V DC' },
      { param: 'Coil Resistance', normal: '50-500', unit: 'Ω' },
      { param: 'Operating Pressure', normal: '0-10', unit: 'bar' },
      { param: 'Response Time', normal: '< 100', unit: 'ms' },
    ],
    relatedSystems: ['BRAKE', 'DOOR'],
    relatedDrawings: ['942-58125', '942-58137'],
    safetyNotes: ['Isolate air supply before removal', 'Verify correct coil voltage', 'Check for air leaks after replacement'],
    maintenanceInterval: 'Operation test every 3 months, full service annually',
  },
  {
    id: 'current_sensor',
    name: 'Current Sensor / CT',
    category: 'Sensor',
    icon: Zap,
    color: 'text-orange-400',
    description: 'A sensor that measures current flow in a conductor using Hall effect or current transformer principles. Provides proportional voltage output.',
    function: 'Current measurement, overcurrent protection, motor control feedback.',
    symbol: 'CT / CS (e.g., CT1, CS-M1)',
    operatingPrinciple: 'Hall effect: measures magnetic field generated by current-carrying conductor. CT: transformer with single primary turn, secondary provides scaled current output.',
    applications: ['Traction motor current sensing', 'VVVF overcurrent protection', 'Auxiliary current monitoring', 'Energy metering'],
    testing: ['Calibration verification with known current', 'Output signal check', 'Insulation test', 'Linearity verification'],
    failureModes: ['Calibration drift', 'Core saturation at high currents', 'Output amplifier failure', 'Cable damage', 'Magnetic interference'],
    measurements: [
      { param: 'Primary Current Range', normal: '0-500', unit: 'A' },
      { param: 'Secondary Output', normal: '0-100', unit: 'mA' },
      { param: 'Accuracy', normal: '±1', unit: '%' },
      { param: 'Bandwidth', normal: 'DC-20', unit: 'kHz' },
    ],
    relatedSystems: ['TRAC', 'APS'],
    relatedDrawings: ['942-58120', '942-58130'],
    safetyNotes: ['Never open secondary circuit while primary is energized (CT type)', 'Verify polarity during installation'],
    maintenanceInterval: 'Calibration check every 12 months',
  },
  {
    id: 'hall_sensor',
    name: 'Hall Effect Sensor',
    category: 'Sensor',
    icon: Activity,
    color: 'text-fuchsia-400',
    description: 'A sensor that detects magnetic field strength using the Hall effect. Used for current measurement, position sensing, and speed detection.',
    function: 'Non-contact current measurement, magnetic field detection, proximity sensing.',
    symbol: 'H (e.g., H1, HCS)',
    operatingPrinciple: 'When current flows through a conductor in a magnetic field, a voltage perpendicular to both is generated (Hall voltage). This voltage is proportional to the magnetic field strength.',
    applications: ['Traction motor current measurement', 'Speed sensing', 'Position detection', 'Proximity switching'],
    testing: ['Output voltage at zero field', 'Sensitivity check', 'Linearity verification', 'Temperature stability test'],
    failureModes: ['Sensitivity drift', 'Magnetic interference', 'Temperature sensitivity', 'Output amplifier failure', 'Supply voltage sensitivity'],
    measurements: [
      { param: 'Supply Voltage', normal: '4.5-5.5', unit: 'V' },
      { param: 'Sensitivity', normal: '1-10', unit: 'mV/G' },
      { param: 'Operating Temperature', normal: '-40 to +150', unit: '°C' },
      { param: 'Offset Voltage', normal: '±5', unit: 'mV' },
    ],
    relatedSystems: ['TRAC'],
    relatedDrawings: ['942-58120'],
    safetyNotes: ['Keep away from strong permanent magnets during testing', 'Verify supply voltage is stable'],
    maintenanceInterval: 'Test during scheduled maintenance',
  },
  {
    id: 'battery',
    name: 'Battery (NiCd / Li-ion)',
    category: 'Energy Storage',
    icon: Battery,
    color: 'text-green-400',
    description: 'Rechargeable battery providing backup DC power for emergency systems, lighting, and control circuits when main power is unavailable.',
    function: 'Emergency power supply, backup for control systems, UPS functionality.',
    symbol: 'BATT (e.g., BATT1)',
    operatingPrinciple: 'Chemical energy storage that converts to electrical energy through electrochemical reactions. NiCd uses nickel-cadmium chemistry; Li-ion uses lithium intercalation.',
    applications: ['Emergency lighting backup', 'Control circuit power during power loss', 'TCMS backup power', 'Door opening during emergency'],
    testing: ['Voltage measurement (cell level)', 'Capacity test (discharge curve)', 'Internal resistance measurement', 'Charging system verification', 'Visual inspection for swelling/leaking'],
    failureModes: ['Capacity loss (aging)', 'Cell imbalance', 'Memory effect (NiCd)', 'Thermal runaway (Li-ion)', 'Terminal corrosion', 'Electrolyte leakage'],
    measurements: [
      { param: 'Nominal Voltage', normal: '110', unit: 'V DC' },
      { param: 'Capacity', normal: '40-100', unit: 'Ah' },
      { param: 'Internal Resistance', normal: '< 1', unit: 'Ω' },
      { param: 'Float Charge Voltage', normal: '121-125', unit: 'V' },
    ],
    relatedSystems: ['APS', 'LIGHT', 'TMS'],
    relatedDrawings: ['942-58132', '942-58112'],
    safetyNotes: ['Battery acid is corrosive — wear PPE', 'Ventilation required during charging', 'Li-ion: fire risk if damaged', 'Use insulated tools'],
    maintenanceInterval: 'Voltage check weekly, capacity test quarterly, full service annually',
  },
  {
    id: 'motor_dc',
    name: 'DC Motor / AC Motor',
    category: 'Actuator',
    icon: Settings,
    color: 'text-emerald-400',
    description: 'Electromechanical device converting electrical energy to rotational mechanical energy. Traction motors drive the wheels; auxiliary motors drive compressors and blowers.',
    function: 'Traction propulsion, compressor driving, blower/fan operation, door operation.',
    symbol: 'M (e.g., M1, MG300, TM1)',
    operatingPrinciple: 'DC motor: current-carrying conductors in magnetic field experience Lorentz force, producing rotation. AC motor: rotating magnetic field in stator induces current in rotor.',
    applications: ['Traction motors (4 per car set)', 'Compressor motor', 'Cooling fan motors', 'Door motors', 'Auxiliary blower motors'],
    testing: ['Insulation resistance test (Megger)', 'Armature resistance check', 'Brush condition (DC type)', 'Bearing noise/vibration', 'Speed vs voltage curve', 'Current draw under load'],
    failureModes: ['Insulation breakdown', 'Bearing failure', 'Brush wear (DC)', 'Commutator damage (DC)', 'Rotor bar crack (AC)', 'Overheating', 'Vibration damage'],
    measurements: [
      { param: 'Insulation Resistance', normal: '> 5', unit: 'MΩ' },
      { param: 'Armature Resistance', normal: '0.01-0.5', unit: 'Ω' },
      { param: 'Rated Speed', normal: '1500-3000', unit: 'RPM' },
      { param: 'Rated Current', normal: '50-400', unit: 'A' },
    ],
    relatedSystems: ['TRAC', 'BRAKE', 'VAC'],
    relatedDrawings: ['942-58120', '942-58123', '942-58143'],
    safetyNotes: ['Rotating parts — keep clear', 'Isolate power before servicing', 'Verify insulation before re-energizing after work', 'Lock-out/tag-out required'],
    maintenanceInterval: 'Visual inspection monthly, insulation test quarterly, full overhaul per mileage',
  },
  {
    id: 'optocoupler',
    name: 'Optocoupler',
    category: 'Semiconductor',
    icon: Lightbulb,
    color: 'text-amber-400',
    description: 'A semiconductor device that transfers electrical signals between two isolated circuits using light. Provides galvanic isolation between control and power circuits.',
    function: 'Signal isolation, level shifting, noise immunity, safety isolation.',
    symbol: 'OC (e.g., OC1, U1)',
    operatingPrinciple: 'Input LED converts electrical signal to light. Output phototransistor/photodiode detects light and converts back to electrical signal. No electrical connection between input and output.',
    applications: ['TCMS communication isolation', 'Gate driver isolation in VVVF', 'Digital I/O isolation', 'Feedback signal isolation'],
    testing: ['Current Transfer Ratio (CTR) measurement', 'Insulation resistance test', 'Response time check', 'Input/output isolation test'],
    failureModes: ['LED degradation (CTR decrease)', 'Output transistor failure', 'Isolation breakdown', 'Contamination affecting light path'],
    measurements: [
      { param: 'Current Transfer Ratio', normal: '50-300', unit: '%' },
      { param: 'Isolation Voltage', normal: '2500-5000', unit: 'V RMS' },
      { param: 'Response Time', normal: '< 10', unit: 'μs' },
      { param: 'CTR Temperature Coeff', normal: '-0.5', unit: '%/°C' },
    ],
    relatedSystems: ['TMS', 'TRAC', 'COMMS'],
    relatedDrawings: ['942-58146', '942-58120'],
    safetyNotes: ['Verify isolation voltage rating matches application', 'Handle with ESD precautions'],
    maintenanceInterval: 'Test during scheduled maintenance',
  },
  {
    id: 'emc_filter',
    name: 'EMI/EMC Filter',
    category: 'Protection',
    icon: Shield,
    color: 'text-teal-400',
    description: 'A passive network that suppresses electromagnetic interference conducted through power or signal lines. Essential for EMC compliance in railway environments.',
    function: 'EMI suppression, EMC compliance, signal integrity protection, noise reduction.',
    symbol: 'FIL (e.g., FIL1)',
    operatingPrinciple: 'Combination of capacitors (X and Y type) and inductors (common-mode and differential-mode chokes) that attenuate high-frequency noise while passing desired signals/power.',
    applications: ['Main power input filtering', 'TCMS communication line filtering', 'Sensor signal filtering', 'VVVF input/output filtering'],
    testing: ['Insertion loss measurement', 'Rated voltage/current check', 'Leakage current measurement', 'Visual inspection', 'Capacitance check'],
    failureModes: ['Capacitor degradation', 'Inductor saturation', 'Resonance issues', 'Physical damage', 'Moisture ingress'],
    measurements: [
      { param: 'Insertion Loss', normal: '20-60', unit: 'dB' },
      { param: 'Rated Voltage', normal: '250-440', unit: 'V AC' },
      { param: 'Rated Current', normal: '10-100', unit: 'A' },
      { param: 'Leakage Current', normal: '< 1', unit: 'mA' },
    ],
    relatedSystems: ['TRAC', 'APS', 'TMS', 'COMMS'],
    relatedDrawings: ['942-58120', '942-58130', '942-58146'],
    safetyNotes: ['Verify ground connection', 'Replace with same type and rating', 'Check for burning smell indicating overload'],
    maintenanceInterval: 'Visual inspection every 6 months, full test annually',
  },
];

const CATEGORIES = [...new Set(COMPONENTS.map(c => c.category))].sort();

export default function EncyclopediaPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return COMPONENTS.filter(c => {
      const matchesSearch = !search || 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Electronics Encyclopedia</h1>
        </div>
        <p className="text-gray-400 mb-8">
          Complete engineering reference for {COMPONENTS.length} electrical and electronic components used in KMRCL VCC systems.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search components by name, description, or symbol (e.g. relay, MOSFET, QF)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} of {COMPONENTS.length} components
        </div>

        <div className="space-y-3">
          {filtered.map(comp => {
            const Icon = comp.icon;
            const isExpanded = expandedId === comp.id;
            return (
              <div key={comp.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <Icon className={`w-6 h-6 ${comp.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{comp.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">{comp.category}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-800 rounded font-mono text-gray-400">{comp.symbol}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-0.5">{comp.description}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-blue-400 mb-1">Function</h3>
                          <p className="text-sm text-gray-300">{comp.function}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-blue-400 mb-1">Operating Principle</h3>
                          <p className="text-sm text-gray-300">{comp.operatingPrinciple}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-blue-400 mb-1">Applications in VCC</h3>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {comp.applications.map((app, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-gray-500" />
                                {app}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-green-400 mb-1 flex items-center gap-1">
                            <Beaker className="w-3 h-3" /> Testing Procedures
                          </h3>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {comp.testing.map((t, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0 text-green-500" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Failure Modes
                          </h3>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {comp.failureModes.map((f, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertTriangle className="w-3 h-3 mt-1 flex-shrink-0 text-red-500" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-purple-400 mb-1">Typical Measurements</h3>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="text-left py-1">Parameter</th>
                                <th className="text-right py-1">Normal Range</th>
                                <th className="text-right py-1">Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comp.measurements.map((m, i) => (
                                <tr key={i} className="border-t border-gray-800">
                                  <td className="py-1 text-gray-300">{m.param}</td>
                                  <td className="py-1 text-right text-white">{m.normal}</td>
                                  <td className="py-1 text-right text-gray-500">{m.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-yellow-400 mb-1 flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> Safety Notes
                          </h3>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {comp.safetyNotes.map((s, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Shield className="w-3 h-3 mt-1 flex-shrink-0 text-yellow-500" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-semibold text-gray-400">Systems: </span>
                            {comp.relatedSystems.map(s => (
                              <Link key={s} href={`/systems/${s}`} className="text-blue-400 hover:underline mr-1">{s}</Link>
                            ))}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-400">Drawings: </span>
                            {comp.relatedDrawings.map(d => (
                              <Link key={d} href={`/drawings?doc=${d}`} className="text-blue-400 hover:underline mr-1">{d}</Link>
                            ))}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-400">Maintenance: </span>
                            {comp.maintenanceInterval}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No components found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
