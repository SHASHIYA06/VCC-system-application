import fs from 'fs';
import path from 'path';

export interface DocumentMetadata {
  id: string;
  filename: string;
  title: string;
  category: 'PIN_DRAWING' | 'LAYOUT' | 'REFERENCE' | 'OCR';
  carType: 'DMC' | 'TC' | 'MC' | 'ALL' | 'CAB';
  location: 'CEILING' | 'UNDERFRAME' | 'ALL' | 'CAB';
  pageCount: number;
  description: string;
  sourcePath: string;
  createdAt: Date;
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  content?: string;
  connectors?: ConnectorPinout[];
  wires?: WireConnection[];
}

export interface ConnectorPinout {
  connectorCode: string;
  connectorType: string;
  location: string;
  pins: PinDetail[];
}

export interface PinDetail {
  pinNo: string;
  signalName: string;
  wireNo: string;
  wireColor?: string;
  endpoint?: string;
  description?: string;
  direction?: string;
}

export interface WireConnection {
  wireNo: string;
  signalName: string;
  fromConnector: string;
  fromPin: string;
  toConnector: string;
  toPin: string;
  wireType?: string;
  description?: string;
}

const DOCUMENTS_CONFIG: Omit<DocumentMetadata, 'id' | 'createdAt' | 'sections'>[] = [
  {
    filename: 'VCC DESCRIPTION 13.12.2017.pdf',
    title: 'VCC System Description',
    category: 'REFERENCE',
    carType: 'ALL',
    location: 'ALL',
    pageCount: 54,
    description: 'Complete VCC system description - trainline reference, connector details, equipment layout',
    sourcePath: '/DOCUMENTS/VCC DESCRIPTION 13.12.2017.pdf'
  },
  {
    filename: 'CAB_PIN DRAWINGS.pdf',
    title: 'Cab Pin Drawings - Part 1',
    category: 'PIN_DRAWING',
    carType: 'CAB',
    location: 'CAB',
    pageCount: 48,
    description: 'Driver cab connector pin assignments - operating panel, master controller, indicators',
    sourcePath: '/DOCUMENTS/CAB_PIN DRAWINGS.pdf'
  },
  {
    filename: 'CAB_PIN DRAWINGS 2.pdf',
    title: 'Cab Pin Drawings - Part 2',
    category: 'PIN_DRAWING',
    carType: 'CAB',
    location: 'CAB',
    pageCount: 48,
    description: 'Extended cab pin assignments and additional controls',
    sourcePath: '/DOCUMENTS/CAB_PIN DRAWINGS 2.pdf'
  },
  {
    filename: 'DMC_CEILING.pdf',
    title: 'DMC Car Ceiling Drawings',
    category: 'LAYOUT',
    carType: 'DMC',
    location: 'CEILING',
    pageCount: 28,
    description: 'DMC car ceiling equipment layout - TCMS RIO, Door Control Units, Electrical Distribution Box',
    sourcePath: '/DOCUMENTS/DMC_CEILING.pdf'
  },
  {
    filename: 'DMC UF_PIN DRAWINGS.pdf',
    title: 'DMC Underframe Pin Drawings',
    category: 'PIN_DRAWING',
    carType: 'DMC',
    location: 'UNDERFRAME',
    pageCount: 26,
    description: 'DMC underframe connector pin assignments - VVVF, BCU, LTEB (X1-X4 jumpers)',
    sourcePath: '/DOCUMENTS/DMC UF_PIN DRAWINGS.pdf'
  },
  {
    filename: 'TC_CEILING PIN DRAWINGS.pdf',
    title: 'TC Car Ceiling Pin Drawings',
    category: 'PIN_DRAWING',
    carType: 'TC',
    location: 'CEILING',
    pageCount: 27,
    description: 'TC car ceiling connector pin assignments - TCMS RIO2, VAC, PIS controller',
    sourcePath: '/DOCUMENTS/TC_CEILING PIN DRAWINGS.pdf'
  },
  {
    filename: 'TC _UF PIN DRAWINGS.pdf',
    title: 'TC Underframe Pin Drawings',
    category: 'PIN_DRAWING',
    carType: 'TC',
    location: 'UNDERFRAME',
    pageCount: 21,
    description: 'TC underframe connector pin assignments - APS, Battery, Shore Supply Box',
    sourcePath: '/DOCUMENTS/TC _UF PIN DRAWINGS.pdf'
  },
  {
    filename: 'MC_CEILING_PIN DRAWINGS.pdf',
    title: 'MC Car Ceiling Pin Drawings',
    category: 'PIN_DRAWING',
    carType: 'MC',
    location: 'CEILING',
    pageCount: 58,
    description: 'MC car ceiling connector pin assignments - TCMS RIO1, CCTV, TFT Displays',
    sourcePath: '/DOCUMENTS/MC_CEILING_PIN DRAWINGS.pdf'
  },
  {
    filename: 'MC_UF.pdf',
    title: 'MC Underframe Layout',
    category: 'LAYOUT',
    carType: 'MC',
    location: 'UNDERFRAME',
    pageCount: 27,
    description: 'MC car underframe equipment layout and connections - VVVF2, BCU3, BECU1, LTEB3',
    sourcePath: '/DOCUMENTS/MC_UF.pdf'
  },
  {
    filename: 'KMRCL VCC Drawings_OCR.pdf',
    title: 'KMRCL VCC Drawings OCR',
    category: 'OCR',
    carType: 'ALL',
    location: 'ALL',
    pageCount: 10,
    description: 'OCR extracted VCC drawings with connector tables, wire lists, trainline cross reference',
    sourcePath: '/DOCUMENTS/KMRCL VCC Drawings_OCR.pdf'
  }
];

export function getAllDocuments(): DocumentMetadata[] {
  return DOCUMENTS_CONFIG.map((doc, index) => ({
    ...doc,
    id: `doc-${index + 1}`,
    createdAt: new Date(),
    sections: []
  }));
}

export function getDocumentById(id: string): DocumentMetadata | undefined {
  const docs = getAllDocuments();
  return docs.find(d => d.id === id);
}

export function getDocumentByFilename(filename: string): DocumentMetadata | undefined {
  const docs = getAllDocuments();
  return docs.find(d => d.filename === filename);
}

export function getDocumentsByCategory(category: string): DocumentMetadata[] {
  const docs = getAllDocuments();
  return docs.filter(d => d.category === category);
}

export function getDocumentsByCarType(carType: string): DocumentMetadata[] {
  const docs = getAllDocuments();
  return docs.filter(d => d.carType === carType || d.carType === 'ALL');
}

export function getDocumentsByLocation(location: string): DocumentMetadata[] {
  const docs = getAllDocuments();
  return docs.filter(d => d.location === location || d.location === 'ALL');
}

export const CAR_TYPE_MAP = {
  'DMC': { name: 'Driving Motor Car', fullName: 'DMC - Driving Motor Car' },
  'TC': { name: 'Trailer Car', fullName: 'TC - Trailer Car' },
  'MC': { name: 'Motor Car', fullName: 'MC - Motor Car' },
  'CAB': { name: 'Cab', fullName: 'Driver Cab' },
  'ALL': { name: 'All Cars', fullName: 'All Cars' }
};

export const SYSTEM_DRAWING_MAP: Record<string, string[]> = {
  'TRAC': ['942-58119', '942-58120', '942-58121', 'DMC UF', 'MC UF'],
  'BRAKE': ['942-58123', '942-58124', '942-58125', '942-58126', '942-58127', 'DMC UF', 'MC UF'],
  'DOOR': ['942-58137', '942-58138', '942-58139', '942-58140', 'DMC CEILING', 'MC CEILING'],
  'APS': ['942-58130', '942-58131', '942-58132', 'TC UF'],
  'VAC': ['942-58143', '942-58144', '942-58145', 'TC CEILING', 'MC CEILING'],
  'TMS': ['942-58146', '942-38409', '942-38606', 'TC CEILING', 'MC CEILING', 'DMC CEILING'],
  'COMMS': ['942-58147', '942-58148', '942-58149', '942-58150', '942-58151', '942-58152', '942-58153', '942-58154', 'MC CEILING'],
  'HV': ['942-58103', '942-58104'],
  'TRL': ['942-58107', '942-58108', '942-58109', '942-58110', '942-58111', 'DMC UF', 'TC UF', 'MC UF']
};

export function getRelatedDrawings(systemCode: string): DocumentMetadata[] {
  const drawingKeywords = SYSTEM_DRAWING_MAP[systemCode] || [];
  const docs = getAllDocuments();
  
  return docs.filter(doc => {
    const docLower = doc.title.toLowerCase() + doc.description.toLowerCase();
    return drawingKeywords.some(kw => docLower.includes(kw.toLowerCase()));
  });
}

export const VCC_REFERENCE_DATA = {
  trainlines: {
    '1000-1999': { range: 'Control Signals', category: 'Control' },
    '2000-2999': { range: 'Speed Sensors', category: 'Monitoring' },
    '3000-3999': { range: 'Traction & Door', category: 'Core Systems' },
    '4000-4999': { range: 'Brake & Comm', category: 'Core Systems' },
    '5000-5999': { range: 'APS & Power', category: 'Power' },
    '6000-6999': { range: 'Door Control', category: 'Door' },
    '7000-7999': { range: 'VAC & Aux', category: 'Auxiliary' },
    '8000-8999': { range: 'Communications', category: 'Comms' },
    '9000-9999': { range: 'TCMS Network', category: 'TCMS' }
  },
  crossConnections: [
    { wires: ['3005', '3006'], location: 'X1-19/20', description: 'Powering 1 & 2 cross for propulsion' },
    { wires: ['6009', '6046'], location: 'J43-44', description: 'Door open left/right cross' },
    { wires: ['6014', '6051'], location: 'J46-47', description: 'Door close left/right cross' }
  ]
};

export default {
  getAllDocuments,
  getDocumentById,
  getDocumentByFilename,
  getDocumentsByCategory,
  getDocumentsByCarType,
  getDocumentsByLocation,
  getRelatedDrawings,
  CAR_TYPE_MAP,
  SYSTEM_DRAWING_MAP,
  VCC_REFERENCE_DATA
};