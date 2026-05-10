export interface System {
  id: string;
  code: string;
  name: string;
  description?: string;
  status?: string;
  icon?: string;
}

export interface Equipment {
  id: string;
  equipment_code: string;
  name: string;
  description?: string;
  location?: string;
  system_id?: string;
  system_code?: string;
  car_type_id?: string;
  car_type?: string;
}

export interface Drawing {
  id: string;
  drawing_no: string;
  title: string;
  system_id?: string;
  system_code?: string;
  current_revision?: string;
  status?: string;
}

export interface Connector {
  id: string;
  connector_code: string;
  equipment_id?: string;
  equipment_code?: string;
  type?: string;
  description?: string;
}

export interface Pin {
  id: string;
  pin_number: string;
  connector_id?: string;
  connector_code?: string;
  equipment_code?: string;
  signal_name?: string;
  description?: string;
  wire_id?: string;
  wire_no?: string;
}

export interface Wire {
  id: string;
  wire_no: string;
  signal_name?: string;
  description?: string;
  type?: string;
  color?: string;
  cross_section_mm2?: number;
}
