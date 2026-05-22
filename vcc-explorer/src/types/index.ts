// ============================================================
// KMRCL VCC - Complete Data Structure & Types
// ============================================================

export interface Project {
  id: string;
  code: string;
  name: string;
  customer_name: string;
  rolling_stock_type: string;
}

export interface CarType {
  id: string;
  code: string;
  name: string;
  position_in_formation: number;
}

export interface System {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  icon_name: string;
  sort_order: number;
  drawing_count?: number;
  equipment_count?: number;
}

export interface Subsystem {
  id: string;
  code: string;
  name: string;
  system_id: string;
  description: string;
}

export interface Drawing {
  id: string;
  drawing_no: string;
  title: string;
  car_code: string;
  system_code: string;
  drawing_type: 'SCHEMATIC' | 'PIN_ASSIGNMENT' | 'DRAWING_LIST' | 'CLASSIFICATION' | 'SYMBOL_LIBRARY' | 'WIRING_NUMBER_DEF';
  sheet_count: number;
  current_alt: string;
  current_revision: string;
  drawing_date: string;
  drwn_by: string;
  chkd_by: string;
  revd_by: string;
  appd_by: string;
  status: 'active' | 'superseded' | 'obsolete' | 'draft';
  notes: string;
}

export interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  car_code: string;
  system_code: string;
  equipment_type: string;
  manufacturer: string;
  part_number: string;
  location_hint: string;
}

export interface Connector {
  id: string;
  drawing_id: string;
  equipment_id: string;
  connector_code: string;
  connector_type: string;
  pin_count: number;
  view_name: string;
  remarks: string;
}

export interface Pin {
  id: string;
  connector_id: string;
  pin_no: string;
  sequence_no: number;
  wire_id: string;
  wire_no_raw: string;
  signal_name: string;
  wire_type_raw: string;
  cable_spec: string;
  from_ref: string;
  to_ref: string;
  remark: string;
}

export interface Wire {
  id: string;
  wire_no: string;
  wire_type: string;
  wire_size: string;
  wire_color: string;
  shielded: boolean;
  voltage_class: string;
  description: string;
  remarks: string;
}

export interface Trainline {
  id: string;
  trainline_no: number;
  name: string;
  description: string;
  system_id: string;
  voltage_domain: string;
  is_cross_connected: boolean;
  cross_connect_notes: string;
}

export interface TrainlineCrossing {
  id: string;
  trainline_id: string;
  crossing_type: string;
  source_connector: string;
  source_pin: string;
  dest_connector: string;
  dest_pin: string;
  description: string;
}

export interface TcmsPoint {
  id: string;
  point_code: string;
  rio_unit: string;
  connector_code: string;
  pin_no: string;
  signal_type: 'DI' | 'DO' | 'AI' | 'AO';
  signal_name: string;
  description: string;
  system_id: string;
  drawing_id: string;
}

export interface WireConnection {
  id: string;
  connection_key: string;
  connector_code: string;
  pin_no: string;
  wire_no: string;
  wire_type: string;
  endpoint_direction: string;
  endpoint_name: string;
  endpoint_pin: string;
  equipment: string;
  primary_source_file: string;
  first_source_page: number;
}

export interface PinLink {
  id: string;
  source_pin_id: string;
  target_equipment_code: string;
  target_connector_code: string;
  target_pin_no: string;
  target_ref: string;
  confidence: number;
}

// Dashboard Stats
export interface DashboardStats {
  total_systems: number;
  total_drawings: number;
  total_equipment: number;
  total_wires: number;
  total_trainlines: number;
  total_connectors: number;
  total_tcms_points: number;
}

// System Detail with Full Context
export interface SystemDetail extends System {
  subsystems: Subsystem[];
  drawings: Drawing[];
  equipment: Equipment[];
  trainlines: Trainline[];
  key_wires: Wire[];
  tcms_points: TcmsPoint[];
  car_types: string[];
}

// Equipment Detail with Connectors
export interface EquipmentDetail extends Equipment {
  connectors: Connector[];
  pins: Pin[];
  wire_connections: WireConnection[];
  related_drawings: Drawing[];
}

// Drawing Detail with All Pages
export interface DrawingDetail extends Drawing {
  pages: DrawingPage[];
  equipment: Equipment[];
  connectors: Connector[];
  wires: Wire[];
}

export interface DrawingPage {
  id: string;
  drawing_id: string;
  page_no: number;
  page_label: string;
  section_name: string;
  raw_ocr: string;
  ocr_quality: 'raw' | 'reviewed' | 'verified' | 'failed';
}

// Fleet Formation
export interface FleetFormation {
  cars: FleetCar[];
}

export interface FleetCar {
  position: number;
  type: 'DMC' | 'TC' | 'MC';
  label: string;
  equipment_count: number;
  connector_count: number;
}

// Search Result
export interface SearchResult {
  type: 'wire' | 'drawing' | 'equipment' | 'trainline' | 'connector' | 'tcms' | 'system';
  id: string;
  code: string;
  name: string;
  description: string;
  system_code?: string;
  car_code?: string;
  drawing_no?: string;
}

// Fault Tree Node
export interface FaultNode {
  id: string;
  symptom: string;
  possible_causes: string[];
  check_points: string[];
  related_wires: string[];
  related_trainlines: string[];
  troubleshooting_steps: string[];
}

// Learning Module
export interface LearningModule {
  id: string;
  system_code: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LearningStep[];
}

export interface LearningStep {
  step_no: number;
  title: string;
  content: string;
  diagram_ref?: string;
  wire_refs?: string[];
  equipment_refs?: string[];
}

// ============================================================
// COMPLETE VCC DRAWING REGISTRY
// ============================================================

export const VCC_DRAWING_REGISTRY: Record<string, Drawing> = {
  // FOUNDATION
  '942-58099': { id: 'd001', drawing_no: '942-58099', title: 'Drawing List - KMRCL RS3R VCC', car_code: 'DMC', system_code: 'GEN', drawing_type: 'DRAWING_LIST', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Master drawing index - all VCC sheets' },
  '942-58100': { id: 'd002', drawing_no: '942-58100', title: 'Classification', car_code: 'DMC', system_code: 'GEN', drawing_type: 'CLASSIFICATION', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Conductor classification - HV, AP, BA, measuring, shielded, data' },
  '942-58101': { id: 'd003', drawing_no: '942-58101', title: 'Wiring Numbers and Description', car_code: 'DMC', system_code: 'GEN', drawing_type: 'WIRING_NUMBER_DEF', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: '5-digit wire number grammar: unit + car type + trainline + serial' },
  '942-58102': { id: 'd004', drawing_no: '942-58102', title: 'Symbols', car_code: 'DMC', system_code: 'GEN', drawing_type: 'SYMBOL_LIBRARY', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'IEC-style symbol library for conductors, relays, motors, switches' },
  
  // TRAINLINES
  '942-58103': { id: 'd005', drawing_no: '942-58103', title: 'Train Lines Control', car_code: 'DMC', system_code: 'TRL', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Trainline control signals: RESET 1032, SHUT DOWN 1050, AUX ON 1040' },
  '942-58104': { id: 'd006', drawing_no: '942-58104', title: 'Train Lines Signal', car_code: 'DMC', system_code: 'TRL', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Trainline signal wires for ATP, SCS, mode selection' },
  '942-58105': { id: 'd007', drawing_no: '942-58105', title: 'Low Tension Power Train Line', car_code: 'DMC', system_code: 'TRL', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: '110VDC trainline for power distribution' },
  '942-58106': { id: 'd008', drawing_no: '942-58106', title: 'High Tension Power Train Line', car_code: 'DMC', system_code: 'TRL', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: '750VDC/415VAC high tension power distribution' },
  
  // CAB & STATUS
  '942-58107': { id: 'd009', drawing_no: '942-58107', title: 'Controlling Cab', car_code: 'CAB', system_code: 'CAB', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Head control relay (HCR), tail control relay (TCR), key-on relay (KOR)' },
  '942-58108': { id: 'd010', drawing_no: '942-58108', title: 'Start-up Relay', car_code: 'CAB', system_code: 'CAB', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Startup relay logic, auxiliary on, shutdown sequencing' },
  '942-58109': { id: 'd011', drawing_no: '942-58109', title: 'System Status Indication', car_code: 'CAB', system_code: 'CAB', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'VVVF fault, HSCB trip, aux fault, VAC fault, line voltage status' },
  '942-58110': { id: 'd012', drawing_no: '942-58110', title: 'MCB Trip Status', car_code: 'CAB', system_code: 'CAB', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'MCB trip monitoring map tied to TCMS signals' },
  '942-58111': { id: 'd013', drawing_no: '942-58111', title: 'DC Train Line Supply Contactor', car_code: 'CAB', system_code: 'CAB', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'DC trainline supply contactor control' },
  
  // INTERIOR LIGHTING
  '942-58112': { id: 'd014', drawing_no: '942-58112', title: 'Head Cab Main Light', car_code: 'DMC', system_code: 'LIGHT', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Head cab main light circuit' },
  '942-58113': { id: 'd015', drawing_no: '942-58113', title: 'Tail/Door Open Console Light', car_code: 'DMC', system_code: 'LIGHT', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Tail light and door open console light' },
  '942-58114': { id: 'd016', drawing_no: '942-58114', title: 'Interior Light', car_code: 'DMC', system_code: 'LIGHT', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Saloon interior lighting circuits' },
  '942-58115': { id: 'd017', drawing_no: '942-58115', title: 'Wiper Control', car_code: 'DMC', system_code: 'LIGHT', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Wiper motor control circuit' },
  
  // COUPLER
  '942-58117': { id: 'd018', drawing_no: '942-58117', title: 'Coupling and Uncoupling Control', car_code: 'DMC', system_code: 'COUPL', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Gangway coupler control for coupling/uncoupling' },
  
  // TRACTION
  '942-58119': { id: 'd019', drawing_no: '942-58119', title: 'Speed Control', car_code: 'DMC', system_code: 'TRAC', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Forward 3003, Reverse 3004, Powering1 3005, Powering2 3006, Braking 3010, Full Service Brake 3011' },
  '942-58120': { id: 'd020', drawing_no: '942-58120', title: 'VVVF Control', car_code: 'DMC', system_code: 'TRAC', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'VVVF inverter interface with CN1/CN2 connectors, PWM command, brake mode' },
  '942-58121': { id: 'd021', drawing_no: '942-58121', title: 'Traction Return Current', car_code: 'DMC', system_code: 'TRAC', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Traction return current path, earth brush connections' },
  
  // BRAKE
  '942-58123': { id: 'd022', drawing_no: '942-58123', title: 'Compressor Control', car_code: 'DMC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Compressor motor control, ADU, pressure governor' },
  '942-58124': { id: 'd023', drawing_no: '942-58124', title: 'Brake Loop', car_code: 'DMC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Brake loop normal 4024, return 4028, BCU/BECU brake interface' },
  '942-58125': { id: 'd024', drawing_no: '942-58125', title: 'Emergency Brake', car_code: 'DMC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'EBLR, EBPB, EBMV, EBVR1/2, EBSS, BLCOS, DMSR, SCSR, TBC, MRPS' },
  '942-58126': { id: 'd025', drawing_no: '942-58126', title: 'Parking Brake', car_code: 'DMC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'PBR, PBAPB, PBRPB, PBMV, PBPS1/2 - applied 4122, released 4153, pressure 4155' },
  '942-58127': { id: 'd026', drawing_no: '942-58127', title: 'Horn', car_code: 'DMC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Horn control circuit' },
  '942-58128': { id: 'd027', drawing_no: '942-58128', title: 'Brake Control - DMC/MC', car_code: 'DMC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Brake control for DMC and MC cars - BCU architecture' },
  '942-58129': { id: 'd028', drawing_no: '942-58129', title: 'Brake Control - TC', car_code: 'TC', system_code: 'BRAKE', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Brake control for TC car - BECU architecture' },
  
  // AUXILIARY POWER
  '942-58130': { id: 'd029', drawing_no: '942-58130', title: 'APS - Auxiliary Power Supply', car_code: 'TC', system_code: 'APS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'APS unit, SIV contact 5030/5031, 415V/230V distribution' },
  '942-58131': { id: 'd030', drawing_no: '942-58131', title: 'AC 415V Shore Supply', car_code: 'TC', system_code: 'APS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Shore supply contact 5000, SSK box, shore power connection' },
  '942-58132': { id: 'd031', drawing_no: '942-58132', title: 'Battery Control', car_code: 'TC', system_code: 'APS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Battery under-voltage monitoring 5064, battery box, 110VDC supply' },
  
  // DOORS
  '942-58137': { id: 'd032', drawing_no: '942-58137', title: 'Saloon Door Supply Voltage', car_code: 'MC', system_code: 'DOOR', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Door supply voltage, door status meaning, isolation switch semantics' },
  '942-58138': { id: 'd033', drawing_no: '942-58138', title: 'Left Door Operation', car_code: 'MC', system_code: 'DOOR', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Door open left 6009, close left 6014, proving loop 6073, zero speed 6112' },
  '942-58139': { id: 'd034', drawing_no: '942-58139', title: 'Right Door Operation', car_code: 'MC', system_code: 'DOOR', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Door open right 6046, close right 6051, proving loop 6076' },
  '942-58140': { id: 'd035', drawing_no: '942-58140', title: 'Door Proving Loop', car_code: 'MC', system_code: 'DOOR', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Door proving loop logic, TCMS door status feedback' },
  '942-58141': { id: 'd036', drawing_no: '942-58141', title: 'Local Door Interlock', car_code: 'MC', system_code: 'DOOR', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Local interlock logic, emergency release handle state' },
  '942-58142': { id: 'd037', drawing_no: '942-58142', title: 'Door Communication with TMS', car_code: 'MC', system_code: 'DOOR', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Door TMS communication, TCMS RIO interface for door status' },
  
  // VAC/HVAC
  '942-58143': { id: 'd038', drawing_no: '942-58143', title: 'Cab VAC - Air Conditioning', car_code: 'CAB', system_code: 'VAC', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Cab VAC unit, fault indication 7001, TCMS interface' },
  '942-58144': { id: 'd039', drawing_no: '942-58144', title: 'Saloon VAC Power', car_code: 'MC', system_code: 'VAC', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Saloon VAC1 power 7050, VAC2 power 7060, damper 7071' },
  '942-58145': { id: 'd040', drawing_no: '942-58145', title: 'Saloon VAC Control', car_code: 'MC', system_code: 'VAC', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Saloon VAC control logic, smoke detection 7070, SSK integration' },
  
  // TMS
  '942-58146': { id: 'd041', drawing_no: '942-58146', title: 'TMS Interface 1 to 4', car_code: 'MC', system_code: 'TMS', drawing_type: 'SCHEMATIC', sheet_count: 4, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'TMS interface sheets, TCMS RIO points U1513/U2513, digital I/O mapping' },
  
  // COMMUNICATIONS
  '942-58147': { id: 'd042', drawing_no: '942-58147', title: 'PIS/TIS - Passenger Information System', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'PIS/TIS system, passenger information display, TFT' },
  '942-58148': { id: 'd043', drawing_no: '942-58148', title: 'PIS/TIS Sheet 2', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'PIS/TIS continuation' },
  '942-58149': { id: 'd044', drawing_no: '942-58149', title: 'DVAS/PA - Digital Voice Announcement', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Digital voice announcement system, PA system' },
  '942-58150': { id: 'd045', drawing_no: '942-58150', title: 'PA Amplifier', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'PA amplifier unit, speaker connections' },
  '942-58151': { id: 'd046', drawing_no: '942-58151', title: 'PA Amplifier Sheet 2', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'PA amplifier continuation' },
  '942-58152': { id: 'd047', drawing_no: '942-58152', title: 'CBTC - Communication Based Train Control', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'CBTC system, X10 connector, ATP integration' },
  '942-58153': { id: 'd048', drawing_no: '942-58153', title: 'Train Radio Interface', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'Train radio interface, antenna connections' },
  '942-58154': { id: 'd049', drawing_no: '942-58154', title: 'CCTV - Closed Circuit Television', car_code: 'MC', system_code: 'COMMS', drawing_type: 'SCHEMATIC', sheet_count: 1, current_alt: '', current_revision: '', drawing_date: '', drwn_by: '', chkd_by: '', revd_by: '', appd_by: '', status: 'active', notes: 'CCTV camera, X5 connector for CCTV/TCMS/EBCU, ethernet switch' },
};

// ============================================================
// COMPLETE TRAINLINE REGISTRY
// ============================================================

export const TRAINLINE_REGISTRY: Record<number, Trainline> = {
  // CONTROL TRAINLINES
  1032: { id: 'tl001', trainline_no: 1032, name: 'RESET', description: 'System reset trainline', system_id: 'TRL', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1050: { id: 'tl002', trainline_no: 1050, name: 'SHUT DOWN', description: 'System shutdown trainline', system_id: 'TRL', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1040: { id: 'tl003', trainline_no: 1040, name: 'AUX ON', description: 'Auxiliary power on command', system_id: 'APS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1207: { id: 'tl004', trainline_no: 1207, name: 'VVVF FAULT', description: 'VVVF inverter fault indication', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1209: { id: 'tl005', trainline_no: 1209, name: 'HSCB TRIP', description: 'High speed circuit breaker trip indication', system_id: 'HV', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1215: { id: 'tl006', trainline_no: 1215, name: 'AUX FAULT', description: 'Auxiliary system fault indication', system_id: 'APS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1217: { id: 'tl007', trainline_no: 1217, name: 'VAC FAULT', description: 'VAC system fault indication', system_id: 'VAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1219: { id: 'tl008', trainline_no: 1219, name: 'PARKING BRAKE', description: 'Parking brake status', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  2043: { id: 'tl009', trainline_no: 2043, name: 'SCS', description: 'Service continuity signal', system_id: 'TRL', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  1515: { id: 'tl010', trainline_no: 1515, name: 'ATP', description: 'Automatic train protection', system_id: 'COMMS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  
  // PROPULSION TRAINLINES
  3003: { id: 'tl011', trainline_no: 3003, name: 'FORWARD', description: 'Forward propulsion command', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3004: { id: 'tl012', trainline_no: 3004, name: 'REVERSE', description: 'Reverse propulsion command', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3005: { id: 'tl013', trainline_no: 3005, name: 'POWERING 1', description: 'Powering command level 1', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: true, cross_connect_notes: 'Crossed with 3006 at X1 pins 19/20' },
  3006: { id: 'tl014', trainline_no: 3006, name: 'POWERING 2', description: 'Powering command level 2', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: true, cross_connect_notes: 'Crossed with 3005 at X1 pins 19/20' },
  3010: { id: 'tl015', trainline_no: 3010, name: 'BRAKING', description: 'Braking command', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3011: { id: 'tl016', trainline_no: 3011, name: 'FULL SERVICE BRAKE', description: 'Full service brake command', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3013: { id: 'tl017', trainline_no: 3013, name: 'RM', description: 'Restricted manual mode', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3018: { id: 'tl018', trainline_no: 3018, name: 'STANDBY', description: 'Standby mode', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3019: { id: 'tl019', trainline_no: 3019, name: 'WC', description: 'Wash coupling mode', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  3060: { id: 'tl020', trainline_no: 3060, name: 'ATO', description: 'Automatic train operation', system_id: 'TRAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  
  // BRAKE TRAINLINES
  4024: { id: 'tl021', trainline_no: 4024, name: 'BRAKE LOOP', description: 'Brake loop normal', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4028: { id: 'tl022', trainline_no: 4028, name: 'BRAKE LOOP RETURN', description: 'Brake loop return', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4062: { id: 'tl023', trainline_no: 4062, name: 'EM BRAKE LOOP NORMAL', description: 'Emergency brake loop normal path', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4070: { id: 'tl024', trainline_no: 4070, name: 'EM BRAKE LOOP NORMAL RTN', description: 'Emergency brake loop normal return', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4103: { id: 'tl025', trainline_no: 4103, name: 'EM BRAKE LOOP REDUNDANT', description: 'Emergency brake loop redundant path', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4110: { id: 'tl026', trainline_no: 4110, name: 'EM BRAKE LOOP REDUNDANT RTN', description: 'Emergency brake loop redundant return', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4122: { id: 'tl027', trainline_no: 4122, name: 'PARKING BRAKE APPLIED', description: 'Parking brake applied indication', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4123: { id: 'tl028', trainline_no: 4123, name: 'HOLDING BRAKE', description: 'Holding brake command', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4153: { id: 'tl029', trainline_no: 4153, name: 'PARKING BRAKE RELEASED', description: 'Parking brake released indication', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4155: { id: 'tl030', trainline_no: 4155, name: 'PARKING BRAKE PRESSURE SW', description: 'Parking brake pressure switch signal', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  4600: { id: 'tl031', trainline_no: 4600, name: 'ATO BRAKE CUT-OUT', description: 'ATO brake cut-out command', system_id: 'BRAKE', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  
  // AUXILIARY TRAINLINES
  5000: { id: 'tl032', trainline_no: 5000, name: 'SHORE SUPPLY CONTACT', description: 'Shore supply contactor status', system_id: 'APS', voltage_domain: '415VAC', is_cross_connected: false, cross_connect_notes: '' },
  5030: { id: 'tl033', trainline_no: 5030, name: 'SIV CONTACT 1', description: 'Static inverter contact 1', system_id: 'APS', voltage_domain: '415VAC', is_cross_connected: false, cross_connect_notes: '' },
  5031: { id: 'tl034', trainline_no: 5031, name: 'SIV CONTACT 2', description: 'Static inverter contact 2', system_id: 'APS', voltage_domain: '415VAC', is_cross_connected: false, cross_connect_notes: '' },
  5064: { id: 'tl035', trainline_no: 5064, name: 'BATTERY UNDER-VOLTAGE', description: 'Battery under-voltage monitoring', system_id: 'APS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  
  // DOOR TRAINLINES
  6009: { id: 'tl036', trainline_no: 6009, name: 'DOOR OPEN LEFT', description: 'Left side door open command', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: true, cross_connect_notes: 'Crossed at jumper positions 43/44' },
  6014: { id: 'tl037', trainline_no: 6014, name: 'DOOR CLOSE LEFT', description: 'Left side door close command', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: true, cross_connect_notes: 'Crossed at jumper positions 46/47' },
  6034: { id: 'tl038', trainline_no: 6034, name: 'DOOR CLOSE ANNOUNCEMENT', description: 'Door close announcement signal', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  6046: { id: 'tl039', trainline_no: 6046, name: 'DOOR OPEN RIGHT', description: 'Right side door open command', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: true, cross_connect_notes: 'Crossed at jumper positions 43/44' },
  6051: { id: 'tl040', trainline_no: 6051, name: 'DOOR CLOSE RIGHT', description: 'Right side door close command', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: true, cross_connect_notes: 'Crossed at jumper positions 46/47' },
  6073: { id: 'tl041', trainline_no: 6073, name: 'DOOR PROVING LOOP 1', description: 'Door proving loop signal 1', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  6076: { id: 'tl042', trainline_no: 6076, name: 'DOOR PROVING LOOP 2', description: 'Door proving loop signal 2', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  6112: { id: 'tl043', trainline_no: 6112, name: 'ZERO SPEED', description: 'Zero speed signal', system_id: 'DOOR', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  
  // VAC TRAINLINES
  7001: { id: 'tl044', trainline_no: 7001, name: 'CAB VAC IN SSK', description: 'Cab VAC in SSK signal', system_id: 'VAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  7050: { id: 'tl045', trainline_no: 7050, name: 'SALOON VAC 1 IN SSK', description: 'Saloon VAC 1 in SSK signal', system_id: 'VAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  7060: { id: 'tl046', trainline_no: 7060, name: 'SALOON VAC 2 IN SSK', description: 'Saloon VAC 2 in SSK signal', system_id: 'VAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  7070: { id: 'tl047', trainline_no: 7070, name: 'SMOKE DETECTION', description: 'Smoke detection alarm', system_id: 'VAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  7071: { id: 'tl048', trainline_no: 7071, name: 'DAMPER OPERATION', description: 'Damper operation signal', system_id: 'VAC', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  
  // ATP/MODE TRAINLINES
  9214: { id: 'tl049', trainline_no: 9214, name: 'ATP MODE', description: 'ATP mode active', system_id: 'COMMS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  9215: { id: 'tl050', trainline_no: 9215, name: 'FWD MODE', description: 'Forward mode active', system_id: 'COMMS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
  9216: { id: 'tl051', trainline_no: 9216, name: 'REV MODE', description: 'Reverse mode active', system_id: 'COMMS', voltage_domain: '110VDC', is_cross_connected: false, cross_connect_notes: '' },
};

// ============================================================
// COMPLETE EQUIPMENT REGISTRY
// ============================================================

export const EQUIPMENT_REGISTRY: Record<string, Equipment[]> = {
  DMC: [
    { id: 'eq001', equipment_code: 'LTEB1', equipment_name: 'Low Tension Equipment Box 1', car_code: 'DMC', system_code: 'LTEB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq002', equipment_code: 'LTJB1', equipment_name: 'Low Tension Junction Box 1', car_code: 'DMC', system_code: 'LTJB', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq003', equipment_code: 'V1', equipment_name: 'VVVF Inverter 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'INVERTER', manufacturer: 'MELCO', part_number: '', location_hint: 'Underframe' },
    { id: 'eq004', equipment_code: 'CSJB1', equipment_name: 'Collector Shoe Junction Box', car_code: 'DMC', system_code: 'HV', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq005', equipment_code: 'STINGER1', equipment_name: 'Stinger Box', car_code: 'DMC', system_code: 'HV', equipment_type: 'CONNECTOR_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq006', equipment_code: 'PSB1', equipment_name: 'Pressure Switch Box 1', car_code: 'DMC', system_code: 'BRAKE', equipment_type: 'VALVE_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe/Bogie' },
    { id: 'eq007', equipment_code: 'BCU1', equipment_name: 'Brake Control Unit 1', car_code: 'DMC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'KNORR', part_number: '', location_hint: 'Underframe' },
    { id: 'eq008', equipment_code: 'ASCOS1', equipment_name: 'ASCOS EPIC SR 1', car_code: 'DMC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq009', equipment_code: 'FILT_REACT1', equipment_name: 'Filter Reactor 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'REACTOR', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq010', equipment_code: 'BRAKE_RES1', equipment_name: 'Brake Resistor 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'RESISTOR', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq011', equipment_code: 'MSB1', equipment_name: 'Main Switch Box 1', car_code: 'DMC', system_code: 'HV', equipment_type: 'SWITCH_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq012', equipment_code: 'CCFB1', equipment_name: 'Current Collector Fuse Box', car_code: 'DMC', system_code: 'HV', equipment_type: 'FUSE_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq013', equipment_code: 'HSCB1', equipment_name: 'High Speed Circuit Breaker', car_code: 'DMC', system_code: 'HV', equipment_type: 'BREAKER', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq014', equipment_code: 'TM1', equipment_name: 'Traction Motor Connector 1', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'CONNECTOR', manufacturer: '', part_number: '', location_hint: 'Underframe/Bogie' },
    { id: 'eq015', equipment_code: 'HTEB1', equipment_name: 'High Tension Equipment Box', car_code: 'DMC', system_code: 'HV', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq016', equipment_code: 'HTJB1', equipment_name: 'High Tension Junction Box', car_code: 'DMC', system_code: 'HV', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq017', equipment_code: 'EARTH_B1', equipment_name: 'Earth Brush 1', car_code: 'DMC', system_code: 'HV', equipment_type: 'GROUNDING', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq018', equipment_code: 'ANT_SKID1', equipment_name: 'Anti Skid Valve', car_code: 'DMC', system_code: 'BRAKE', equipment_type: 'VALVE', manufacturer: '', part_number: '', location_hint: 'Bogie' },
    { id: 'eq019', equipment_code: 'AUTO_CPL1', equipment_name: 'Auto Coupler', car_code: 'DMC', system_code: 'COUPL', equipment_type: 'COUPLER', manufacturer: '', part_number: '', location_hint: 'Front/Rear' },
    { id: 'eq020', equipment_code: 'SPEED_S1', equipment_name: 'Speed Sensor Connector', car_code: 'DMC', system_code: 'TRAC', equipment_type: 'SENSOR', manufacturer: '', part_number: '', location_hint: 'Bogie' },
  ],
  TC: [
    { id: 'eq101', equipment_code: 'LTEB2', equipment_name: 'Low Tension Equipment Box 2', car_code: 'TC', system_code: 'LTEB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq102', equipment_code: 'LTJB1', equipment_name: 'Low Tension Junction Box 1', car_code: 'TC', system_code: 'LTJB', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq103', equipment_code: 'LTJB2', equipment_name: 'Low Tension Junction Box 2', car_code: 'TC', system_code: 'LTJB', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq104', equipment_code: 'APS1', equipment_name: 'Auxiliary Power Supply 1', car_code: 'TC', system_code: 'APS', equipment_type: 'POWER_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq105', equipment_code: 'SSB1', equipment_name: 'Shore Supply Box 1', car_code: 'TC', system_code: 'APS', equipment_type: 'POWER_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq106', equipment_code: 'BATT1', equipment_name: 'Battery Box 1', car_code: 'TC', system_code: 'APS', equipment_type: 'BATTERY', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq107', equipment_code: 'ESK1', equipment_name: 'ESK Box 1', car_code: 'TC', system_code: 'HV', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq108', equipment_code: 'PSB2', equipment_name: 'Pressure Switch Box 2', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'VALVE_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe/Bogie' },
    { id: 'eq109', equipment_code: 'EPIC1', equipment_name: 'EPIC SR ASCO', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq110', equipment_code: 'COMP1', equipment_name: 'Compressor Motor 1', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'MOTOR_COMPRESSOR', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq111', equipment_code: 'ADU1', equipment_name: 'Air Drying Unit 1', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'DRYER', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq112', equipment_code: 'PGOV1', equipment_name: 'Pressure Governor Box', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'GOVERNOR', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq113', equipment_code: 'BCU2', equipment_name: 'Brake Control Unit 2', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'KNORR', part_number: '', location_hint: 'Underframe' },
    { id: 'eq114', equipment_code: 'ANT_SKID2', equipment_name: 'Anti Skid Valve FAEMV', car_code: 'TC', system_code: 'BRAKE', equipment_type: 'VALVE', manufacturer: '', part_number: '', location_hint: 'Bogie' },
    { id: 'eq115', equipment_code: 'EARTH_B2', equipment_name: 'Earth Brush 2', car_code: 'TC', system_code: 'HV', equipment_type: 'GROUNDING', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq116', equipment_code: 'HTEB2', equipment_name: 'High Tension Equipment Box 2', car_code: 'TC', system_code: 'HV', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq117', equipment_code: 'HTJB2', equipment_name: 'High Tension Junction Box 2', car_code: 'TC', system_code: 'HV', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq118', equipment_code: 'EDB2', equipment_name: 'Electrical Distribution Box 2', car_code: 'TC', system_code: 'EDB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq119', equipment_code: 'TCMS_RIO2', equipment_name: 'TCMS Remote IO Unit 2', car_code: 'TC', system_code: 'TMS', equipment_type: 'RIO', manufacturer: 'MELCO', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq120', equipment_code: 'DCU2', equipment_name: 'Door Control Unit 2', car_code: 'TC', system_code: 'DOOR', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq121', equipment_code: 'VAC2', equipment_name: 'Saloon VAC Unit 2', car_code: 'TC', system_code: 'VAC', equipment_type: 'HVAC_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq122', equipment_code: 'ETH_SW2', equipment_name: 'Ethernet Switch CCTV 2', car_code: 'TC', system_code: 'COMMS', equipment_type: 'NETWORK_SWITCH', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq123', equipment_code: 'AAU2', equipment_name: 'Audio Alarm Unit 2', car_code: 'TC', system_code: 'COMMS', equipment_type: 'AMPLIFIER', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
  ],
  MC: [
    { id: 'eq201', equipment_code: 'LTEB3', equipment_name: 'Low Tension Equipment Box 3', car_code: 'MC', system_code: 'LTEB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq202', equipment_code: 'V2', equipment_name: 'VVVF Inverter 2', car_code: 'MC', system_code: 'TRAC', equipment_type: 'INVERTER', manufacturer: 'MELCO', part_number: '', location_hint: 'Underframe' },
    { id: 'eq203', equipment_code: 'CSJB2', equipment_name: 'Collector Shoe Junction Box 2', car_code: 'MC', system_code: 'HV', equipment_type: 'JUNCTION_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq204', equipment_code: 'PSB3', equipment_name: 'Pressure Switch Box 3', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'VALVE_BOX', manufacturer: '', part_number: '', location_hint: 'Underframe/Bogie' },
    { id: 'eq205', equipment_code: 'BCU3', equipment_name: 'Brake Control Unit 3', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'KNORR', part_number: '', location_hint: 'Underframe' },
    { id: 'eq206', equipment_code: 'BECU1', equipment_name: 'Brake Electronic Control Unit 1', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: 'KNORR', part_number: '', location_hint: 'Underframe' },
    { id: 'eq207', equipment_code: 'ASCO1', equipment_name: 'ASCO EPIC SR 1', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq208', equipment_code: 'EDB1', equipment_name: 'Electrical Distribution Box 1', car_code: 'MC', system_code: 'EDB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq209', equipment_code: 'TCMS_RIO1', equipment_name: 'TCMS Remote IO Unit 1', car_code: 'MC', system_code: 'TMS', equipment_type: 'RIO', manufacturer: 'MELCO', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq210', equipment_code: 'TCMS_TB1', equipment_name: 'TCMS Terminal Block 1', car_code: 'MC', system_code: 'TMS', equipment_type: 'TERMINAL_BLOCK', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq211', equipment_code: 'TCMS_CN1', equipment_name: 'TCMS Communication Node 1', car_code: 'MC', system_code: 'TMS', equipment_type: 'COMMS_NODE', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq212', equipment_code: 'DCU1', equipment_name: 'Door Control Unit 1', car_code: 'MC', system_code: 'DOOR', equipment_type: 'CONTROL_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq213', equipment_code: 'VAC1', equipment_name: 'Saloon VAC Unit 1', car_code: 'MC', system_code: 'VAC', equipment_type: 'HVAC_UNIT', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq214', equipment_code: 'ETH_SW1', equipment_name: 'Ethernet Switch CCTV 1', car_code: 'MC', system_code: 'COMMS', equipment_type: 'NETWORK_SWITCH', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq215', equipment_code: 'AAU1', equipment_name: 'Audio Alarm Unit 1', car_code: 'MC', system_code: 'COMMS', equipment_type: 'AMPLIFIER', manufacturer: '', part_number: '', location_hint: 'Ceiling' },
    { id: 'eq216', equipment_code: 'BIC1', equipment_name: 'Brake Interface Controller 1', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'CONTROLLER', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq217', equipment_code: 'PBMV1', equipment_name: 'Parking Brake Magnetic Valve 1', car_code: 'MC', system_code: 'BRAKE', equipment_type: 'VALVE', manufacturer: '', part_number: '', location_hint: 'Underframe' },
    { id: 'eq218', equipment_code: 'HSCB2', equipment_name: 'High Speed Circuit Breaker 2', car_code: 'MC', system_code: 'HV', equipment_type: 'BREAKER', manufacturer: '', part_number: '', location_hint: 'Underframe' },
  ],
  CAB: [
    { id: 'eq301', equipment_code: 'OP_PNL1', equipment_name: 'Operating Panel 1', car_code: 'CAB', system_code: 'CAB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab Desk' },
    { id: 'eq302', equipment_code: 'IND_PNL1', equipment_name: 'Indicator Panel 1', car_code: 'CAB', system_code: 'CAB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab Desk' },
    { id: 'eq303', equipment_code: 'MCB_PNL1', equipment_name: 'MCB Panel 1', car_code: 'CAB', system_code: 'CAB', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab' },
    { id: 'eq304', equipment_code: 'CAB_VAC1', equipment_name: 'Cab VAC Unit 1', car_code: 'CAB', system_code: 'VAC', equipment_type: 'HVAC_UNIT', manufacturer: '', part_number: '', location_hint: 'Cab' },
    { id: 'eq305', equipment_code: 'CAB_VAC_PNL', equipment_name: 'Cab VAC Pin Assignment Panel', car_code: 'CAB', system_code: 'VAC', equipment_type: 'PANEL', manufacturer: '', part_number: '', location_hint: 'Cab' },
  ],
};

// ============================================================
// CONNECTOR REGISTRY (X1-X10 and Car-specific)
// ============================================================

export const CONNECTOR_REGISTRY: Record<string, { code: string; type: string; pin_count: number; description: string }[]> = {
  TRAINLINE: [
    { code: 'X1', type: '74P', pin_count: 74, description: 'Control signal connector - inter-car jumper' },
    { code: 'X2', type: '74PW', pin_count: 74, description: 'Control signal connector with power - inter-car jumper' },
    { code: 'X3', type: '11P', pin_count: 11, description: '415V AC and 230V AC power connector' },
    { code: 'X4', type: '3P', pin_count: 3, description: '110V DC power connector' },
    { code: 'X5', type: 'MULTI', pin_count: 0, description: 'CCTV/TCMS/EBCU connectivity' },
    { code: 'X6', type: 'HIGH_TENSION', pin_count: 0, description: 'High tension power connector' },
    { code: 'X7', type: 'HIGH_TENSION_EARTH', pin_count: 0, description: 'High tension earth connector' },
    { code: 'X8', type: 'EOSS1', pin_count: 0, description: 'Earth observation system sensor 1' },
    { code: 'X9', type: 'EOSS2', pin_count: 0, description: 'Earth observation system sensor 2' },
    { code: 'X10', type: 'CBTC', pin_count: 0, description: 'CBTC dedicated connector' },
  ],
  DMC: [
    { code: 'CN1', type: 'VVVF_INV', pin_count: 0, description: 'VVVF inverter CN1 connector - propulsion commands' },
    { code: 'CN2', type: 'VVVF_INV', pin_count: 0, description: 'VVVF inverter CN2 connector - mode signals' },
    { code: 'X1', type: 'INTERCAR', pin_count: 74, description: 'Inter-car jumper X1' },
    { code: 'X2', type: 'INTERCAR', pin_count: 74, description: 'Inter-car jumper X2' },
  ],
  TC: [
    { code: 'X1', type: 'INTERCAR', pin_count: 74, description: 'Inter-car jumper X1' },
    { code: 'VAC1X01', type: 'VAC', pin_count: 0, description: 'Saloon VAC 1 connector' },
    { code: 'VAC1X02', type: 'VAC', pin_count: 0, description: 'Saloon VAC 1 power connector' },
    { code: 'VAC1X03', type: 'VAC', pin_count: 0, description: 'Saloon VAC 1 earth' },
    { code: 'DCU-X9', type: 'DOOR', pin_count: 0, description: 'Door control unit X9 - left door' },
    { code: 'DCU-X10', type: 'DOOR', pin_count: 0, description: 'Door control unit X10 - right door' },
  ],
  MC: [
    { code: 'X1', type: 'INTERCAR', pin_count: 74, description: 'Inter-car jumper X1' },
    { code: 'VAC2X01', type: 'VAC', pin_count: 0, description: 'Saloon VAC 2 connector' },
    { code: 'VAC2X02', type: 'VAC', pin_count: 0, description: 'Saloon VAC 2 power connector' },
    { code: 'VAC2X03', type: 'VAC', pin_count: 0, description: 'Saloon VAC 2 earth' },
    { code: 'DCU-X9', type: 'DOOR', pin_count: 0, description: 'Door control unit X9 - left door' },
    { code: 'DCU-X10', type: 'DOOR', pin_count: 0, description: 'Door control unit X10 - right door' },
    { code: 'BECU-X1', type: 'BRAKE', pin_count: 0, description: 'BECU X1 connector' },
    { code: 'BECU-X2', type: 'BRAKE', pin_count: 0, description: 'BECU X2 connector' },
  ],
  CAB: [
    { code: 'TB1', type: 'TERMINAL_BLOCK', pin_count: 0, description: 'Cab desk terminal block 1' },
    { code: 'TB2', type: 'TERMINAL_BLOCK', pin_count: 0, description: 'Cab desk terminal block 2' },
    { code: 'CN1', type: 'OPERATOR_PANEL', pin_count: 0, description: 'Operating panel CN1' },
    { code: 'CN2', type: 'INDICATOR_PANEL', pin_count: 0, description: 'Indicator panel CN2' },
    { code: 'MCB-X1', type: 'MCB_PANEL', pin_count: 0, description: 'MCB panel X1' },
    { code: 'CAB_VAC_X1', type: 'VAC', pin_count: 0, description: 'Cab VAC connector X1' },
  ],
};

// ============================================================
// PIN ASSIGNMENT REGISTRY (Key Equipment)
// ============================================================

export const PIN_ASSIGNMENT_REGISTRY: Record<string, Record<string, Pin[]>> = {
  'VVVF1': {
    'CN1': [
      { id: 'p001', connector_id: 'vvvf-c1', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '3003', signal_name: 'FORWARD', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'FWD', to_ref: '', remark: 'Forward command from TCMS' },
      { id: 'p002', connector_id: 'vvvf-c1', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '3004', signal_name: 'REVERSE', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'REV', to_ref: '', remark: 'Reverse command from TCMS' },
      { id: 'p003', connector_id: 'vvvf-c1', pin_no: '3', sequence_no: 3, wire_id: '', wire_no_raw: '3010', signal_name: 'BRAKING', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'BRK', to_ref: '', remark: 'Braking command' },
      { id: 'p004', connector_id: 'vvvf-c1', pin_no: '4', sequence_no: 4, wire_id: '', wire_no_raw: '3011', signal_name: 'FULL_SVC_BRAKE', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'FSB', to_ref: '', remark: 'Full service brake' },
    ],
    'CN2': [
      { id: 'p005', connector_id: 'vvvf-c2', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '3018', signal_name: 'STANDBY', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'SBY', to_ref: '', remark: 'Standby mode' },
      { id: 'p006', connector_id: 'vvvf-c2', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '3013', signal_name: 'RM', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'RM', to_ref: '', remark: 'Restricted manual' },
    ],
  },
  'BCU1': {
    'X1': [
      { id: 'p010', connector_id: 'bcu-x1', pin_no: '5', sequence_no: 5, wire_id: '', wire_no_raw: '4062', signal_name: 'EM_BRAKE_LOOP_N', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'BCU-X1-5', to_ref: '', remark: 'Emergency brake loop normal' },
      { id: 'p011', connector_id: 'bcu-x1', pin_no: '6', sequence_no: 6, wire_id: '', wire_no_raw: '4070', signal_name: 'EM_BRAKE_LOOP_N_RTN', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'BCU-X1-6', to_ref: '', remark: 'Emergency brake loop normal return' },
    ],
    'X2': [
      { id: 'p012', connector_id: 'bcu-x2', pin_no: '5', sequence_no: 5, wire_id: '', wire_no_raw: '4103', signal_name: 'EM_BRAKE_LOOP_R', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'BECU-X2-5', to_ref: '', remark: 'Emergency brake loop redundant' },
      { id: 'p013', connector_id: 'bcu-x2', pin_no: '6', sequence_no: 6, wire_id: '', wire_no_raw: '4110', signal_name: 'EM_BRAKE_LOOP_R_RTN', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'BECU-X2-6', to_ref: '', remark: 'Emergency brake loop redundant return' },
    ],
  },
  'BECU1': {
    'X1': [
      { id: 'p020', connector_id: 'becu-x1', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '4122', signal_name: 'PARKING_BRAKE_APP', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'PBR', to_ref: '', remark: 'Parking brake applied' },
      { id: 'p021', connector_id: 'becu-x1', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '4153', signal_name: 'PARKING_BRAKE_REL', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'PBPS', to_ref: '', remark: 'Parking brake released' },
    ],
  },
  'DCU1': {
    'X9': [
      { id: 'p030', connector_id: 'dcu-x9', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '6009', signal_name: 'DOOR_OPEN_L', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'DOLR', to_ref: '', remark: 'Door open left command' },
      { id: 'p031', connector_id: 'dcu-x9', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '6014', signal_name: 'DOOR_CLOSE_L', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'DOLR', to_ref: '', remark: 'Door close left command' },
      { id: 'p032', connector_id: 'dcu-x9', pin_no: '3', sequence_no: 3, wire_id: '', wire_no_raw: '6073', signal_name: 'DOOR_PROVE_1', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'TCMS', to_ref: '', remark: 'Door proving loop 1' },
      { id: 'p033', connector_id: 'dcu-x9', pin_no: '4', sequence_no: 4, wire_id: '', wire_no_raw: '6076', signal_name: 'DOOR_PROVE_2', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'TCMS', to_ref: '', remark: 'Door proving loop 2' },
    ],
    'X10': [
      { id: 'p034', connector_id: 'dcu-x10', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '6046', signal_name: 'DOOR_OPEN_R', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'DORR', to_ref: '', remark: 'Door open right command' },
      { id: 'p035', connector_id: 'dcu-x10', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '6051', signal_name: 'DOOR_CLOSE_R', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'DORR', to_ref: '', remark: 'Door close right command' },
    ],
  },
  'TCMS_RIO1': {
    'U1513': [
      { id: 'p040', connector_id: 'tcms-u1513', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '9214', signal_name: 'ATP_MODE', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'ATP', to_ref: '', remark: 'ATP mode active' },
      { id: 'p041', connector_id: 'tcms-u1513', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '9215', signal_name: 'FWD_MODE', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'FWD', to_ref: '', remark: 'Forward mode active' },
      { id: 'p042', connector_id: 'tcms-u1513', pin_no: '3', sequence_no: 3, wire_id: '', wire_no_raw: '9216', signal_name: 'REV_MODE', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'REV', to_ref: '', remark: 'Reverse mode active' },
    ],
    'U1..33': [
      { id: 'p043', connector_id: 'tcms-u1xx', pin_no: '33', sequence_no: 33, wire_id: '', wire_no_raw: '6112', signal_name: 'ZERO_SPEED', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'ZVS', to_ref: '', remark: 'Zero speed signal' },
    ],
  },
  'VAC1': {
    'X1': [
      { id: 'p050', connector_id: 'vac-x1', pin_no: '1', sequence_no: 1, wire_id: '', wire_no_raw: '7050', signal_name: 'VAC1_IN_SSK', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'TCMS', to_ref: '', remark: 'Saloon VAC 1 in SSK' },
      { id: 'p051', connector_id: 'vac-x1', pin_no: '2', sequence_no: 2, wire_id: '', wire_no_raw: '7060', signal_name: 'VAC2_IN_SSK', wire_type_raw: '1.5mm²', cable_spec: '', from_ref: 'TCMS', to_ref: '', remark: 'Saloon VAC 2 in SSK' },
    ],
  },
};

// ============================================================
// TCMS POINT REGISTRY
// ============================================================

export const TCMS_POINT_REGISTRY: Record<string, TcmsPoint> = {
  'U1513': { id: 'tcp001', point_code: 'U1513', rio_unit: 'TCMS_RIO1', connector_code: 'U1513', pin_no: '1-33', signal_type: 'DI', signal_name: 'Mode/Status Inputs', description: 'TCMS RIO digital inputs for ATP/FWD/REV modes', system_id: 'TMS', drawing_id: '' },
  'U1..33': { id: 'tcp002', point_code: 'U1..33', rio_unit: 'TCMS_RIO1', connector_code: 'U1..33', pin_no: '33', signal_type: 'DI', signal_name: 'Zero Speed', description: 'Zero speed signal from ZVS', system_id: 'DOOR', drawing_id: '' },
  'U1125': { id: 'tcp003', point_code: 'U1125', rio_unit: 'TCMS_RIO1', connector_code: 'U1125', pin_no: '1', signal_type: 'DI', signal_name: 'Door Status', description: 'Door open/close status feedback', system_id: 'DOOR', drawing_id: '' },
  'U2125': { id: 'tcp004', point_code: 'U2125', rio_unit: 'TCMS_RIO2', connector_code: 'U2125', pin_no: '1', signal_type: 'DI', signal_name: 'Door Status TC', description: 'Door status for TC car', system_id: 'DOOR', drawing_id: '' },
};

// ============================================================
// SYSTEM-SUBSYSTEM HIERARCHY
// ============================================================

export const SYSTEM_SUBSYSTEMS: Record<string, { code: string; name: string; description: string }[]> = {
  GEN: [
    { code: 'DWG_LIST', name: 'Drawing List', description: 'Master index of all VCC drawings' },
    { code: 'CLASS', name: 'Classification', description: 'Conductor classification system' },
    { code: 'WIRE_NUM', name: 'Wiring Numbers', description: 'Wire number grammar and rules' },
    { code: 'SYMBOLS', name: 'Symbols', description: 'IEC-style symbol library' },
  ],
  TRL: [
    { code: 'TRL_CTRL', name: 'Train Line Control', description: 'Control signals: RESET, SHUT DOWN, AUX ON' },
    { code: 'TRL_SIG', name: 'Train Line Signal', description: 'Signal wires for ATP, SCS, modes' },
    { code: 'TRL_LT', name: 'Low Tension Power', description: '110VDC trainline distribution' },
    { code: 'TRL_HT', name: 'High Tension Power', description: '750VDC/415VAC trainline distribution' },
  ],
  CAB: [
    { code: 'CAB_CTRL', name: 'Controlling Cab', description: 'HCR, TCR, KOR, LCAR logic' },
    { code: 'CAB_START', name: 'Start-up Relay', description: 'Startup sequence, auxiliary on' },
    { code: 'CAB_STATUS', name: 'System Status Indication', description: 'VVVF fault, HSCB trip, VAC fault' },
    { code: 'CAB_MCB', name: 'MCB Trip Status', description: 'MCB monitoring and TCMS interface' },
  ],
  TRAC: [
    { code: 'TRAC_SPD', name: 'Speed Control', description: 'Forward, reverse, powering, braking commands' },
    { code: 'TRAC_VVVF', name: 'VVVF Control', description: 'VVVF inverter interface, CN1/CN2' },
    { code: 'TRAC_RET', name: 'Traction Return', description: 'Return current path, earth brush' },
  ],
  BRAKE: [
    { code: 'BRAKE_COMP', name: 'Compressor Control', description: 'Compressor motor, ADU, pressure governor' },
    { code: 'BRAKE_LOOP', name: 'Brake Loop', description: 'Normal and redundant brake loops' },
    { code: 'BRAKE_EM', name: 'Emergency Brake', description: 'EBLR, EBPB, EBMV, EBVR, EBSS' },
    { code: 'BRAKE_PARK', name: 'Parking Brake', description: 'PBR, PBMV, PBPS, applied/released logic' },
    { code: 'BRAKE_HORN', name: 'Horn', description: 'Horn control circuit' },
    { code: 'BRAKE_DMC', name: 'Brake Control DMC/MC', description: 'BCU architecture for DMC/MC' },
    { code: 'BRAKE_TC', name: 'Brake Control TC', description: 'BECU architecture for TC' },
  ],
  APS: [
    { code: 'APS_MAIN', name: 'APS - Auxiliary Power Supply', description: 'APS unit, SIV contacts 5030/5031' },
    { code: 'APS_SHORE', name: 'Shore Supply', description: '415V shore supply, SSK box' },
    { code: 'APS_BATT', name: 'Battery Control', description: 'Battery monitoring 5064' },
  ],
  DOOR: [
    { code: 'DOOR_SUPPLY', name: 'Door Supply Voltage', description: 'Door power supply, status meaning' },
    { code: 'DOOR_L', name: 'Left Door Operation', description: 'Door open 6009, close 6014, proving 6073' },
    { code: 'DOOR_R', name: 'Right Door Operation', description: 'Door open 6046, close 6051, proving 6076' },
    { code: 'DOOR_PROVE', name: 'Door Proving Loop', description: 'Proving logic, TCMS feedback' },
    { code: 'DOOR_INTER', name: 'Local Door Interlock', description: 'Local interlock, emergency release' },
    { code: 'DOOR_TMS', name: 'Door TMS Communication', description: 'TCMS RIO interface' },
  ],
  VAC: [
    { code: 'VAC_CAB', name: 'Cab VAC', description: 'Cab air conditioning, fault 7001' },
    { code: 'VAC_SAL_PWR', name: 'Saloon VAC Power', description: 'VAC1 7050, VAC2 7060 power' },
    { code: 'VAC_SAL_CTRL', name: 'Saloon VAC Control', description: 'Control logic, smoke 7070, damper 7071' },
  ],
  TMS: [
    { code: 'TMS_IF1', name: 'TMS Interface 1', description: 'TCMS interface sheet 1' },
    { code: 'TMS_IF2', name: 'TMS Interface 2', description: 'TCMS interface sheet 2' },
    { code: 'TMS_IF3', name: 'TMS Interface 3', description: 'TCMS interface sheet 3' },
    { code: 'TMS_IF4', name: 'TMS Interface 4', description: 'TCMS interface sheet 4' },
  ],
  COMMS: [
    { code: 'COMMS_PIS', name: 'PIS/TIS', description: 'Passenger information system' },
    { code: 'COMMS_DVAS', name: 'DVAS/PA', description: 'Digital voice announcement, PA' },
    { code: 'COMMS_PA_AMP', name: 'PA Amplifier', description: 'PA amplifier unit' },
    { code: 'COMMS_CBTC', name: 'CBTC', description: 'Communication based train control' },
    { code: 'COMMS_RADIO', name: 'Train Radio', description: 'Train radio interface' },
    { code: 'COMMS_CCTV', name: 'CCTV', description: 'Closed circuit television' },
  ],
  LIGHT: [
    { code: 'LIGHT_HEAD', name: 'Head Cab Main Light', description: 'Headlight circuit' },
    { code: 'LIGHT_TAIL', name: 'Tail/Console Light', description: 'Tail and door open console light' },
    { code: 'LIGHT_INT', name: 'Interior Light', description: 'Saloon interior lighting' },
    { code: 'LIGHT_WPR', name: 'Wiper', description: 'Wiper motor control' },
  ],
};

// ============================================================
// WIRING NUMBER DECODER
// ============================================================

export function decodeWireNumber(wireNo: string): {
  unit: string;
  carType: string;
  trainline: string;
  serial: string;
  description: string;
} {
  const wire = wireNo.toString().padStart(5, '0');
  return {
    unit: wire.substring(0, 1),
    carType: wire.substring(1, 2),
    trainline: wire.substring(2, 4),
    serial: wire.substring(4, 5),
    description: `Unit ${wire.substring(0, 1)}, Car Type ${wire.substring(1, 2)}, Trainline ${wire.substring(2, 4)}, Serial ${wire.substring(4, 5)}`,
  };
}

// ============================================================
// CAR FORMATION
// ============================================================

export const CAR_FORMATION = [
  { position: 1, type: 'DMC' as const, label: 'DMC1', description: 'Driving Motor Car - Leading' },
  { position: 2, type: 'TC' as const, label: 'TC1', description: 'Trailer Car - Position 2' },
  { position: 3, type: 'MC' as const, label: 'MC1', description: 'Motor Car - Position 3' },
  { position: 4, type: 'MC' as const, label: 'MC2', description: 'Motor Car - Position 4' },
  { position: 5, type: 'TC' as const, label: 'TC2', description: 'Trailer Car - Position 5' },
  { position: 6, type: 'DMC' as const, label: 'DMC2', description: 'Driving Motor Car - Trailing' },
];

// ============================================================
// INTERNAL REFERENCE DRAWINGS
// ============================================================

export const INTERNAL_REFS = {
  'H7L7956': { description: 'Power circuit reference', system: 'TRAC' },
  'H12E279': { description: 'VVVF inverter control reference', system: 'TRAC' },
  'H7K3870': { description: 'APS reference', system: 'APS' },
  'H39U956': { description: 'Shore supply reference', system: 'APS' },
  'H7K3871': { description: 'Battery control reference', system: 'APS' },
  'ED910111R14': { description: 'Door wiring reference', system: 'DOOR' },
  'TA4560311': { description: 'Brake piping reference', system: 'BRAKE' },
  'FT0053014-100': { description: 'Cab VAC reference schematic', system: 'VAC' },
  'FT0053013-100': { description: 'Saloon VAC reference schematic', system: 'VAC' },
};

// ============================================================
// DEFAULT EXPORTS
// ============================================================

export const SYSTEMS: System[] = [
  { id: 's001', code: 'GEN', name: 'General & Conventions', category: 'Foundation', description: 'Drawing list, classification, wiring numbers, symbols', icon_name: 'Settings', sort_order: 1 },
  { id: 's002', code: 'TRL', name: 'Trainlines', category: 'Core Systems', description: 'Train line control, signal, low/high tension power', icon_name: 'Train', sort_order: 2 },
  { id: 's003', code: 'CAB', name: 'Cab Control & Status', category: 'Core Systems', description: 'Controlling cab, startup, status indication, MCB trip', icon_name: 'Settings', sort_order: 3 },
  { id: 's004', code: 'TRAC', name: 'Traction & Propulsion', category: 'Propulsion', description: 'Speed control, VVVF control, traction return current', icon_name: 'Zap', sort_order: 4 },
  { id: 's005', code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Compressor, brake loop, emergency brake, parking brake, horn', icon_name: 'ShieldCheck', sort_order: 5 },
  { id: 's006', code: 'APS', name: 'Auxiliary Power Supply', category: 'Power', description: 'APS, shore supply, battery control', icon_name: 'Battery', sort_order: 6 },
  { id: 's007', code: 'DOOR', name: 'Door System', category: 'Core Systems', description: 'Door supply, left/right operation, proving loop, interlock', icon_name: 'DoorOpen', sort_order: 7 },
  { id: 's008', code: 'VAC', name: 'VAC / HVAC', category: 'Core Systems', description: 'Cab VAC, saloon VAC power and control', icon_name: 'Wind', sort_order: 8 },
  { id: 's009', code: 'TMS', name: 'Train Management System', category: 'Control', description: 'TMS interface, TCMS remote I/O, communication nodes', icon_name: 'Activity', sort_order: 9 },
  { id: 's010', code: 'COMMS', name: 'Communication Systems', category: 'Core Systems', description: 'PIS/TIS, DVAS/PA, CBTC, train radio, CCTV', icon_name: 'Radio', sort_order: 10 },
  { id: 's011', code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Head cab light, saloon lights, console light', icon_name: 'Zap', sort_order: 11 },
  { id: 's012', code: 'COUPL', name: 'Gangway & Coupler', category: 'Auxiliary', description: 'Coupling and uncoupling control', icon_name: 'Settings', sort_order: 12 },
  { id: 's013', code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Electrical Distribution', description: 'LTEB pin assignments and wiring', icon_name: 'Zap', sort_order: 13 },
  { id: 's014', code: 'LTJB', name: 'Low Tension Junction Box', category: 'Electrical Distribution', description: 'LTJB pin assignments and wiring', icon_name: 'Zap', sort_order: 14 },
  { id: 's015', code: 'EDB', name: 'Electrical Distribution Box', category: 'Electrical Distribution', description: 'EDB panel assignments', icon_name: 'Zap', sort_order: 15 },
  { id: 's016', code: 'HV', name: 'High Voltage Equipment', category: 'Power', description: 'Collector shoe, HSCB, main switch box, HTEB', icon_name: 'Zap', sort_order: 16 },
];