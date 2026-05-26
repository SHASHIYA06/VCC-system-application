export interface ConnectorPin {
  id: string;
  pinNo: string;
  wireNo?: string;
  connectorId: string;
  // add other relevant fields as needed
}

export interface WireTraceResult {
  source: { code: string; pin?: string; };
  destination: { code: string; pin?: string; };
  wires: string[];
  colorCode: string;
}

// New API response interfaces
export interface WireResponse {
  wire: {
    id: string;
    wireNo: string;
    signalName?: string;
    description?: string;
    wireColor?: string;
    voltageClass?: string;
    cableSpec?: string;
    conductorClass?: string;
    wireSize?: string;
    sourceEq?: string;
    sourceConnector?: string;
    sourcePin?: string;
    destEq?: string;
    destConnector?: string;
    destPin?: string;
    remarks?: string;
  };
  pins: Array<{ id: string; pinNo: string; signalName?: string; wireNo?: string; connectorCode?: string; connectorId?: string; drawingNo?: string }>;
}

export interface CarTreeStats {
  drawings: number;
  devices: number;
  connectors: number;
  totalPins: number;
}

export interface CarTreeResponse {
  carType: string;
  stats: CarTreeStats;
  drawings: Array<{ no: string; title: string; system?: string; sheets: number }>;
  systems: Array<{ code: string; connectors: number; pins: number; wired: number; connectorList: any[] }>;
  devices: Array<{ code: string; count: number; list: any[] }>;
}

export interface PinListResponse {
  pins: any[];
  connectors: string[];
  cars: string[];
  systems: string[];
  total: number;
}

