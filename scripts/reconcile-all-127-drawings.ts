import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PDF_FILE_NAME = 'KMRCL VCC Drawings_OCR.pdf';

interface PageMappingDef {
  pageNo: number;
  drawingNo: string;
  title: string;
  systemCode: string;
  description: string;
}

const PAGE_MAPPINGS: PageMappingDef[] = [
  // Pages 1-10
  { pageNo: 1, drawingNo: '942-58099-Cover', title: 'VCC Drawing List Cover', systemCode: 'GENERAL', description: 'Cover page of vehicle control circuit drawings list' },
  { pageNo: 2, drawingNo: '942-58099', title: 'VCC Drawing List & Index', systemCode: 'GENERAL', description: 'Index sheet of vehicle control circuit drawings list' },
  { pageNo: 3, drawingNo: '942-58100', title: 'Classification of Drawings', systemCode: 'GENERAL', description: 'Classification of vehicle control circuit drawings' },
  { pageNo: 4, drawingNo: '942-58101', title: 'Wiring Numbers Description', systemCode: 'GENERAL', description: 'Wiring numbers semantics description' },
  { pageNo: 5, drawingNo: '942-58102-Sh1', title: 'Symbol Library Sheet 1', systemCode: 'GENERAL', description: 'Vehicle control circuit symbols sheet 1' },
  { pageNo: 6, drawingNo: '942-58102-Sh2', title: 'Symbol Library Sheet 2', systemCode: 'GENERAL', description: 'Vehicle control circuit symbols sheet 2' },
  { pageNo: 7, drawingNo: '942-58102-Sh3', title: 'Symbol Library Sheet 3', systemCode: 'GENERAL', description: 'Vehicle control circuit symbols sheet 3' },
  { pageNo: 8, drawingNo: '942-58102-Sh4', title: 'Symbol Library Sheet 4', systemCode: 'GENERAL', description: 'Vehicle control circuit symbols sheet 4' },
  { pageNo: 9, drawingNo: '942-58103-Sh1', title: 'Train Lines Control Sheet 1', systemCode: 'GENERAL', description: 'Train lines control schematic sheet 1' },
  { pageNo: 10, drawingNo: '942-58103-Sh2', title: 'Train Lines Control Sheet 2', systemCode: 'GENERAL', description: 'Train lines control schematic sheet 2' },
  
  // Pages 11-20
  { pageNo: 11, drawingNo: '942-58103-Sh3', title: 'Train Lines Control Sheet 3', systemCode: 'GENERAL', description: 'Train lines control schematic sheet 3' },
  { pageNo: 12, drawingNo: '942-58103-Sh4', title: 'Train Lines Control Sheet 4', systemCode: 'GENERAL', description: 'Train lines control schematic sheet 4' },
  { pageNo: 13, drawingNo: '942-58104-Sh1', title: 'Train Lines Signal Sheet 1', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 1' },
  { pageNo: 14, drawingNo: '942-58104-Sh2', title: 'Train Lines Signal Sheet 2', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 2' },
  { pageNo: 15, drawingNo: '942-58104-Sh3', title: 'Train Lines Signal Sheet 3', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 3' },
  { pageNo: 16, drawingNo: '942-58104-Sh4', title: 'Train Lines Signal Sheet 4', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 4' },
  { pageNo: 17, drawingNo: '942-58104-Sh5', title: 'Train Lines Signal Sheet 5', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 5' },
  { pageNo: 18, drawingNo: '942-58104-Sh6', title: 'Train Lines Signal Sheet 6', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 6' },
  { pageNo: 19, drawingNo: '942-58104-Sh7', title: 'Train Lines Signal Sheet 7', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 7' },
  { pageNo: 20, drawingNo: '942-58104-Sh8', title: 'Train Lines Signal Sheet 8', systemCode: 'GENERAL', description: 'Train lines signal schematic sheet 8' },
  
  // Pages 21-30
  { pageNo: 21, drawingNo: '942-58105', title: 'LT Power Distribution', systemCode: 'AUX', description: 'Low tension power distribution schematic' },
  { pageNo: 22, drawingNo: '942-58106', title: 'HT Power Distribution', systemCode: 'AUX', description: 'High tension power distribution schematic' },
  { pageNo: 23, drawingNo: '942-58107', title: 'Cab Configuration', systemCode: 'CAB', description: 'Cab control console schematic' },
  { pageNo: 24, drawingNo: '942-58108-Sh1', title: 'Start-up Relay Circuit Sheet 1', systemCode: 'CAB', description: 'Vehicle start-up relay schematic sheet 1' },
  { pageNo: 25, drawingNo: '942-58108-Sh2', title: 'Start-up Relay Circuit Sheet 2', systemCode: 'CAB', description: 'Vehicle start-up relay schematic sheet 2' },
  { pageNo: 26, drawingNo: '942-58109-Sh1', title: 'Status Indication Sheet 1', systemCode: 'CAB', description: 'Status and fault indication schematic sheet 1' },
  { pageNo: 27, drawingNo: '942-58109-Sh2', title: 'Status Indication Sheet 2', systemCode: 'CAB', description: 'Status and fault indication schematic sheet 2' },
  { pageNo: 28, drawingNo: '942-58110-Sh1', title: 'MCB Trip Control Sheet 1', systemCode: 'CAB', description: 'MCB trip control loop schematic sheet 1' },
  { pageNo: 29, drawingNo: '942-58110-Sh2', title: 'MCB Trip Control Sheet 2', systemCode: 'CAB', description: 'MCB trip control loop schematic sheet 2' },
  { pageNo: 30, drawingNo: '942-58111', title: 'Supply Contactor Control', systemCode: 'AUX', description: 'Control power supply contactor schematic' },
  
  // Pages 31-40
  { pageNo: 31, drawingNo: '942-58112', title: 'Head Cab Lighting', systemCode: 'LIGHT', description: 'Cab exterior headlight/taillight control schematic' },
  { pageNo: 32, drawingNo: '942-58113', title: 'Taillight Control', systemCode: 'LIGHT', description: 'Taillight control schematic' },
  { pageNo: 33, drawingNo: '942-58114', title: 'Interior Lighting Saloon', systemCode: 'LIGHT', description: 'Interior saloon lighting schematic' },
  { pageNo: 34, drawingNo: '942-58115', title: 'Wiper Control', systemCode: 'LIGHT', description: 'Windscreen wiper control schematic' },
  { pageNo: 35, drawingNo: '942-58116', title: 'Wiper Motor Interface', systemCode: 'LIGHT', description: 'Wiper motor interface schematic' },
  { pageNo: 36, drawingNo: '942-58117', title: 'Coupling and Uncoupling Control', systemCode: 'GENERAL', description: 'Coupling control schematic' },
  { pageNo: 37, drawingNo: '942-58118', title: 'Wiper Control Revised', systemCode: 'LIGHT', description: 'Revised wiper control schematic' },
  { pageNo: 38, drawingNo: '942-58119', title: 'Speed Control', systemCode: 'TRACTION', description: 'Speed control command logic schematic' },
  { pageNo: 39, drawingNo: '942-58120-Sh1', title: 'VVVF Control Sheet 1', systemCode: 'TRACTION', description: 'VVVF inverter interface schematic sheet 1' },
  { pageNo: 40, drawingNo: '942-58120-Sh2', title: 'VVVF Control Sheet 2', systemCode: 'TRACTION', description: 'VVVF inverter interface schematic sheet 2' },
  
  // Pages 41-50
  { pageNo: 41, drawingNo: '942-58120-Sh3', title: 'VVVF Control Sheet 3', systemCode: 'TRACTION', description: 'VVVF inverter interface schematic sheet 3' },
  { pageNo: 42, drawingNo: '942-58120-Sh4', title: 'VVVF Control Sheet 4', systemCode: 'TRACTION', description: 'VVVF inverter interface schematic sheet 4' },
  { pageNo: 43, drawingNo: '942-58121-Sh1', title: 'Traction Return Current Sheet 1', systemCode: 'TRACTION', description: 'Traction return current path sheet 1' },
  { pageNo: 44, drawingNo: '942-58121-Sh2', title: 'Traction Return Current Sheet 2', systemCode: 'TRACTION', description: 'Traction return current path sheet 2' },
  { pageNo: 45, drawingNo: '942-58121-Sh3', title: 'Traction Return Current Sheet 3', systemCode: 'TRACTION', description: 'Traction return current path sheet 3' },
  { pageNo: 46, drawingNo: '942-58121-Sh4', title: 'Traction Return Current Sheet 4', systemCode: 'TRACTION', description: 'Traction return current path sheet 4' },
  { pageNo: 47, drawingNo: '942-58121-Sh5', title: 'Traction Return Current Sheet 5', systemCode: 'TRACTION', description: 'Traction return current path sheet 5' },
  { pageNo: 48, drawingNo: '942-58121-Sh6', title: 'Traction Return Current Sheet 6', systemCode: 'TRACTION', description: 'Traction return current path sheet 6' },
  { pageNo: 49, drawingNo: '942-58123-Sh1', title: 'Compressor Control Sheet 1', systemCode: 'BRAKE', description: 'Compressor control schematic sheet 1' },
  { pageNo: 50, drawingNo: '942-58123-Sh2', title: 'Compressor Control Sheet 2', systemCode: 'BRAKE', description: 'Compressor control schematic sheet 2' },
  
  // Pages 51-60
  { pageNo: 51, drawingNo: '942-58124', title: 'Brake Loop Normal', systemCode: 'BRAKE', description: 'Brake loop and BECU interface schematic' },
  { pageNo: 52, drawingNo: '942-58125-Sh1', title: 'Emergency Brake Control Sheet 1', systemCode: 'BRAKE', description: 'Emergency brake loop schematic sheet 1' },
  { pageNo: 53, drawingNo: '942-58125-Sh2', title: 'Emergency Brake Control Sheet 2', systemCode: 'BRAKE', description: 'Emergency brake loop schematic sheet 2' },
  { pageNo: 54, drawingNo: '942-58126', title: 'Parking Brake Control', systemCode: 'BRAKE', description: 'Parking brake control schematic' },
  { pageNo: 55, drawingNo: '942-58127', title: 'Horn Control', systemCode: 'BRAKE', description: 'Horn control schematic' },
  { pageNo: 56, drawingNo: '942-58128-Sh1', title: 'Brake Control DMC/MC Sheet 1', systemCode: 'BRAKE', description: 'BCU/BECU interface schematic sheet 1' },
  { pageNo: 57, drawingNo: '942-58128-Sh2', title: 'Brake Control DMC/MC Sheet 2', systemCode: 'BRAKE', description: 'BCU/BECU interface schematic sheet 2' },
  { pageNo: 58, drawingNo: '942-58129', title: 'Brake Control TC Car', systemCode: 'BRAKE', description: 'Brake control for TC car' },
  { pageNo: 59, drawingNo: '942-58130-Sh1', title: 'APS Auxiliary Power Supply Sheet 1', systemCode: 'AUX', description: 'APS 415V/230V distribution sheet 1' },
  { pageNo: 60, drawingNo: '942-58130-Sh2', title: 'APS Auxiliary Power Supply Sheet 2', systemCode: 'AUX', description: 'APS 415V/230V distribution sheet 2' },
  
  // Pages 61-70
  { pageNo: 61, drawingNo: '942-58131', title: 'AC 415V Shore Supply', systemCode: 'AUX', description: 'Shore supply box connection schematic' },
  { pageNo: 62, drawingNo: '942-58132-Sh1', title: 'Battery Control Sheet 1', systemCode: 'AUX', description: 'Battery under-voltage monitoring sheet 1' },
  { pageNo: 63, drawingNo: '942-58132-Sh2', title: 'Battery Control Sheet 2', systemCode: 'AUX', description: 'Battery under-voltage monitoring sheet 2' },
  { pageNo: 64, drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', systemCode: 'DOOR', description: 'Saloon door power supply distribution' },
  { pageNo: 65, drawingNo: '942-58138-Sh1', title: 'Left Door Operation Sheet 1', systemCode: 'DOOR', description: 'Left door operation loop sheet 1' },
  { pageNo: 66, drawingNo: '942-58138-Sh2', title: 'Left Door Operation Sheet 2', systemCode: 'DOOR', description: 'Left door operation loop sheet 2' },
  { pageNo: 67, drawingNo: '942-58138-Sh3', title: 'Left Door Operation Sheet 3', systemCode: 'DOOR', description: 'Left door operation loop sheet 3' },
  { pageNo: 68, drawingNo: '942-58139-Sh1', title: 'Right Door Operation Sheet 1', systemCode: 'DOOR', description: 'Right door operation loop sheet 1' },
  { pageNo: 69, drawingNo: '942-58139-Sh2', title: 'Right Door Operation Sheet 2', systemCode: 'DOOR', description: 'Right door operation loop sheet 2' },
  { pageNo: 70, drawingNo: '942-58140', title: 'Door Proving Loop', systemCode: 'DOOR', description: 'Door proving loop logic schematic' },
  
  // Pages 71-80
  { pageNo: 71, drawingNo: '942-58141-Sh1', title: 'Local Door Interlock Sheet 1', systemCode: 'DOOR', description: 'Local door interlock control sheet 1' },
  { pageNo: 72, drawingNo: '942-58141-Sh2', title: 'Local Door Interlock Sheet 2', systemCode: 'DOOR', description: 'Local door interlock control sheet 2' },
  { pageNo: 73, drawingNo: '942-58142', title: 'Door Communication with TMS', systemCode: 'DOOR', description: 'Door RIO/TMS communication' },
  { pageNo: 74, drawingNo: '942-58143-Sh1', title: 'Cab VAC Air Conditioning Sheet 1', systemCode: 'AIRCON', description: 'Cab air conditioning circuit sheet 1' },
  { pageNo: 75, drawingNo: '942-58143-Sh2', title: 'Cab VAC Air Conditioning Sheet 2', systemCode: 'AIRCON', description: 'Cab air conditioning circuit sheet 2' },
  { pageNo: 76, drawingNo: '942-58144-Sh1', title: 'Saloon VAC Power Sheet 1', systemCode: 'AIRCON', description: 'Saloon air conditioning power sheet 1' },
  { pageNo: 77, drawingNo: '942-58144-Sh2', title: 'Saloon VAC Power Sheet 2', systemCode: 'AIRCON', description: 'Saloon air conditioning power sheet 2' },
  { pageNo: 78, drawingNo: '942-58145', title: 'Saloon VAC Control', systemCode: 'AIRCON', description: 'Saloon air conditioning control logic' },
  { pageNo: 79, drawingNo: '942-58146', title: 'TMS Interface Digital I/O', systemCode: 'TIMS', description: 'Train management system RIO mapping' },
  { pageNo: 80, drawingNo: '81-9717-23-A', title: 'Traction and Bogie Schematic', systemCode: 'TRACTION', description: 'Mitsubishi traction and bogie wiring' },
  
  // Pages 81-90
  { pageNo: 81, drawingNo: 'H12E2791', title: 'VVFINVERTER Interface', systemCode: 'TRACTION', description: 'Mitsubishi VVVF inverter interface' },
  { pageNo: 82, drawingNo: '81-9717-23-A-APS', title: 'APS Power Supply', systemCode: 'AUX', description: 'Mitsubishi auxiliary power supply schematic' },
  { pageNo: 83, drawingNo: '81-9717-33-A', title: 'Kolkata APS Auxiliary Power', systemCode: 'AUX', description: 'Kolkata APS auxiliary power circuit' },
  { pageNo: 84, drawingNo: '81-9717-23-A-APS-Ext', title: 'Kolkata APS Auxiliary Power Extension', systemCode: 'AUX', description: 'Kolkata APS auxiliary power extension circuit' },
  { pageNo: 85, drawingNo: 'ECO-D307310-Sh1', title: 'Faiveley Door Circuit Sheet 1', systemCode: 'DOOR', description: 'Faiveley saloon door circuit diagram sheet 1' },
  { pageNo: 86, drawingNo: 'ECO-D307310-Sh2', title: 'Faiveley Door Circuit Sheet 2', systemCode: 'DOOR', description: 'Faiveley saloon door circuit diagram sheet 2' },
  { pageNo: 87, drawingNo: 'ECO-D307310-Sh3', title: 'Faiveley Door Circuit Sheet 3', systemCode: 'DOOR', description: 'Faiveley saloon door circuit diagram sheet 3' },
  { pageNo: 88, drawingNo: 'ECO-D307310-Sh4', title: 'Faiveley Door Circuit Sheet 4', systemCode: 'DOOR', description: 'Faiveley saloon door circuit diagram sheet 4' },
  { pageNo: 89, drawingNo: '81-9717-23-A-Bogie', title: 'Traction Bogie Connection', systemCode: 'TRACTION', description: 'Mitsubishi traction bogie connection schematic' },
  { pageNo: 90, drawingNo: 'FT0053014-100-Sh1', title: 'KMRCL Cab VAC System Sheet 1', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 1' },
  
  // Pages 91-100
  { pageNo: 91, drawingNo: 'FT0053014-100-Sh2', title: 'KMRCL Cab VAC System Sheet 2', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 2' },
  { pageNo: 92, drawingNo: 'FT0053014-100-Sh3', title: 'KMRCL Cab VAC System Sheet 3', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 3' },
  { pageNo: 93, drawingNo: 'FT0053014-100-Sh4', title: 'KMRCL Cab VAC System Sheet 4', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 4' },
  { pageNo: 94, drawingNo: 'FT0053014-100-Sh5', title: 'KMRCL Cab VAC System Sheet 5', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 5' },
  { pageNo: 95, drawingNo: 'FT0053014-100-Sh6', title: 'KMRCL Cab VAC System Sheet 6', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 6' },
  { pageNo: 96, drawingNo: 'FT0053014-100-Sh7', title: 'KMRCL Cab VAC System Sheet 7', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 7' },
  { pageNo: 97, drawingNo: 'FT0053014-100-Sh8', title: 'KMRCL Cab VAC System Sheet 8', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 8' },
  { pageNo: 98, drawingNo: 'FT0053014-100-Sh9', title: 'KMRCL Cab VAC System Sheet 9', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 9' },
  { pageNo: 99, drawingNo: 'FT0053014-100-Sh10', title: 'KMRCL Cab VAC System Sheet 10', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 10' },
  { pageNo: 100, drawingNo: 'FT0053014-100-Sh11', title: 'KMRCL Cab VAC System Sheet 11', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 11' },
  
  // Pages 101-110
  { pageNo: 101, drawingNo: 'FT0053014-100-Sh12', title: 'KMRCL Cab VAC System Sheet 12', systemCode: 'AIRCON', description: 'Cab HVAC schematic sheet 12' },
  { pageNo: 102, drawingNo: 'FT0053013-100-Sh1', title: 'KMRCL Saloon VAC System Sheet 1', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 1' },
  { pageNo: 103, drawingNo: 'FT0053013-100-Sh2', title: 'KMRCL Saloon VAC System Sheet 2', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 2' },
  { pageNo: 104, drawingNo: 'FT0053013-100-Sh3', title: 'KMRCL Saloon VAC System Sheet 3', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 3' },
  { pageNo: 105, drawingNo: 'FT0053013-100-Sh4', title: 'KMRCL Saloon VAC System Sheet 4', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 4' },
  { pageNo: 106, drawingNo: 'FT0053013-100-Sh5', title: 'KMRCL Saloon VAC System Sheet 5', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 5' },
  { pageNo: 107, drawingNo: 'FT0053013-100-Sh6', title: 'KMRCL Saloon VAC System Sheet 6', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 6' },
  { pageNo: 108, drawingNo: 'FT0053013-100-Sh7', title: 'KMRCL Saloon VAC System Sheet 7', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 7' },
  { pageNo: 109, drawingNo: 'FT0053013-100-Sh8', title: 'KMRCL Saloon VAC System Sheet 8', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 8' },
  { pageNo: 110, drawingNo: 'FT0053013-100-Sh9', title: 'KMRCL Saloon VAC System Sheet 9', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 9' },
  
  // Pages 111-120
  { pageNo: 111, drawingNo: 'FT0053013-100-Sh10', title: 'KMRCL Saloon VAC System Sheet 10', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 10' },
  { pageNo: 112, drawingNo: 'FT0053013-100-Sh11', title: 'KMRCL Saloon VAC System Sheet 11', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 11' },
  { pageNo: 113, drawingNo: 'FT0053013-100-Sh12', title: 'KMRCL Saloon VAC System Sheet 12', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 12' },
  { pageNo: 114, drawingNo: 'FT0053013-100-Sh13', title: 'KMRCL Saloon VAC System Sheet 13', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 13' },
  { pageNo: 115, drawingNo: 'FT0053013-100-Sh14', title: 'KMRCL Saloon VAC System Sheet 14', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 14' },
  { pageNo: 116, drawingNo: 'FT0053013-100-Sh15', title: 'KMRCL Saloon VAC System Sheet 15', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 15' },
  { pageNo: 117, drawingNo: 'FT0053013-100-Sh16', title: 'KMRCL Saloon VAC System Sheet 16', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 16' },
  { pageNo: 118, drawingNo: 'FT0053013-100-Sh17', title: 'KMRCL Saloon VAC System Sheet 17', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 17' },
  { pageNo: 119, drawingNo: 'FT0053013-100-Sh18', title: 'KMRCL Saloon VAC System Sheet 18', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 18' },
  { pageNo: 120, drawingNo: 'FT0053013-100-Sh19', title: 'KMRCL Saloon VAC System Sheet 19', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 19' },
  
  // Pages 121-127
  { pageNo: 121, drawingNo: 'FT0053013-100-Sh20', title: 'KMRCL Saloon VAC System Sheet 20', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 20' },
  { pageNo: 122, drawingNo: 'FT0053013-100-Sh21', title: 'KMRCL Saloon VAC System Sheet 21', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 21' },
  { pageNo: 123, drawingNo: 'FT0053013-100-Sh22', title: 'KMRCL Saloon VAC System Sheet 22', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 22' },
  { pageNo: 124, drawingNo: 'FT0053013-100-Sh23', title: 'KMRCL Saloon VAC System Sheet 23', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 23' },
  { pageNo: 125, drawingNo: 'FT0053013-100-Sh24', title: 'KMRCL Saloon VAC System Sheet 24', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 24' },
  { pageNo: 126, drawingNo: 'FT0053013-100-Sh25', title: 'KMRCL Saloon VAC System Sheet 25', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 25' },
  { pageNo: 127, drawingNo: 'FT0053013-100-Sh26', title: 'KMRCL Saloon VAC System Sheet 26', systemCode: 'AIRCON', description: 'Saloon HVAC schematic sheet 26' },
];

async function main() {
  console.log('🔄 Reconciling all 127 drawings page-by-page non-destructively in Neon...');

  // 1. Get or Create Project KMRCL_RS3R
  let project = await prisma.project.findFirst({
    where: { projectCode: 'KMRCL_RS3R' }
  });
  if (!project) {
    // If not found, look for KMRCL-RS3R
    project = await prisma.project.findFirst({
      where: { projectCode: 'KMRCL-RS3R' }
    });
  }
  if (!project) {
    project = await prisma.project.create({
      data: {
        projectCode: 'KMRCL_RS3R',
        projectName: 'KMRCL RS3R Metro'
      }
    });
    console.log(`Created Project: ${project.projectCode}`);
  } else {
    console.log(`Using Project: ${project.projectCode}`);
  }

  // 2. Get or Create SourceFile record
  let sourceFile = await prisma.sourceFile.findFirst({
    where: { filename: PDF_FILE_NAME }
  });
  if (!sourceFile) {
    sourceFile = await prisma.sourceFile.create({
      data: {
        projectId: project.id,
        filename: PDF_FILE_NAME,
        fileType: 'application/pdf',
        mimeType: 'application/pdf',
        status: 'PROCESSED'
      }
    });
    console.log(`Created SourceFile: ${PDF_FILE_NAME}`);
  }

  // 3. Load all Systems from DB to avoid N+1 queries
  const systemsList = await prisma.system.findMany();
  const systemsMap = new Map(systemsList.map(s => [s.code, s.id]));

  // Ensure necessary systems exist
  const requiredSystemCodes = Array.from(new Set(PAGE_MAPPINGS.map(p => p.systemCode)));
  for (const code of requiredSystemCodes) {
    if (!systemsMap.has(code)) {
      const newSys = await prisma.system.create({
        data: {
          code,
          name: code.charAt(0) + code.slice(1).toLowerCase() + ' System',
          sortOrder: 99
        }
      });
      systemsMap.set(code, newSys.id);
      console.log(`Created missing system in DB: ${code}`);
    }
  }

  // 4. Load existing drawings in DB for KMRCL_RS3R
  const drawingsList = await prisma.drawing.findMany({
    where: { projectId: project.id }
  });
  const drawingsMap = new Map(drawingsList.map(d => [d.drawingNo, d.id]));

  console.log(`Loaded ${drawingsList.length} existing drawings from project.`);

  // 5. Batch process the page mappings
  let createdCount = 0;
  let updatedCount = 0;
  let mappingCount = 0;

  for (const item of PAGE_MAPPINGS) {
    const systemId = systemsMap.get(item.systemCode)!;
    let drawingId = drawingsMap.get(item.drawingNo);

    if (!drawingId) {
      // Create new drawing
      const d = await prisma.drawing.create({
        data: {
          projectId: project.id,
          drawingNo: item.drawingNo,
          revision: '0',
          title: item.title,
          systemId,
          totalSheets: 1,
          status: 'ACTIVE',
          remarks: item.description,
          sourceFileId: PDF_FILE_NAME,
          drawingPdfUrl: `/api/pdf/${encodeURIComponent(PDF_FILE_NAME)}`
        }
      });
      drawingId = d.id;
      drawingsMap.set(item.drawingNo, d.id);
      createdCount++;
    } else {
      // Update existing drawing non-destructively
      await prisma.drawing.update({
        where: { id: drawingId },
        data: {
          title: item.title,
          systemId,
          sourceFileId: PDF_FILE_NAME,
          drawingPdfUrl: `/api/pdf/${encodeURIComponent(PDF_FILE_NAME)}`
        }
      });
      updatedCount++;
    }

    // Upsert DrawingPageMapping
    const existingMapping = await prisma.drawingPageMapping.findFirst({
      where: {
        drawingId,
        sourceFileName: PDF_FILE_NAME
      }
    });

    if (!existingMapping) {
      await prisma.drawingPageMapping.create({
        data: {
          drawingId,
          sourceFileId: sourceFile.id,
          sourceFileName: PDF_FILE_NAME,
          pdfPageNo: item.pageNo,
          drawingNumber: item.drawingNo,
          verified: true,
          confidence: 1.0,
          notes: 'Reconciled page-by-page mapping'
        }
      });
      mappingCount++;
    } else {
      await prisma.drawingPageMapping.update({
        where: { id: existingMapping.id },
        data: {
          pdfPageNo: item.pageNo,
          drawingNumber: item.drawingNo,
          verified: true,
          notes: 'Updated page-by-page mapping'
        }
      });
    }

    // Upsert DrawingPage
    const existingPage = await prisma.drawingPage.findFirst({
      where: {
        drawingId,
        pageNo: 1
      }
    });

    const pageExtra = {
      pdfPageNo: item.pageNo,
      pdfFile: PDF_FILE_NAME,
      sourceFile: PDF_FILE_NAME,
      verified: true,
      mappedAt: new Date().toISOString(),
      mappingSource: 'reconcile_all_127_drawings'
    };

    if (!existingPage) {
      await prisma.drawingPage.create({
        data: {
          drawingId,
          pageNo: 1,
          parseStatus: 'MAPPED',
          extra: pageExtra
        }
      });
    } else {
      await prisma.drawingPage.update({
        where: { id: existingPage.id },
        data: {
          parseStatus: 'MAPPED',
          extra: pageExtra
        }
      });
    }
  }

  console.log(`\n🎉 Reconciled all 127 pages successfully!`);
  console.log(`   - Created Drawings: ${createdCount}`);
  console.log(`   - Updated Drawings: ${updatedCount}`);
  console.log(`   - Created Mappings: ${mappingCount}`);
  console.log(`   - Total drawings in DB: ${await prisma.drawing.count()}`);
  console.log(`   - Total page mappings in DB: ${await prisma.drawingPageMapping.count()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
