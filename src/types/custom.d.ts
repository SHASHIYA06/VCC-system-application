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
