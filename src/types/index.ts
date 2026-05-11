export interface System {
  id: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  icon_name?: string;
  sort_order?: number;
  status?: string;
  icon?: string;
}

export interface Equipment {
  id: string;
  equipment_code: string;
  equipment_name: string;
  equipment_type?: string;
  manufacturer?: string;
  part_number?: string;
  location_hint?: string;
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
  current_alt?: string;
  status?: string;
  drawing_type?: string;
  project_id?: string;
  car_type_id?: string;
}

export interface Connector {
  id: string;
  connector_code: string;
  connector_type?: string;
  connector_variant?: string;
  gender?: string;
  pin_count?: number;
  view_name?: string;
  remarks?: string;
  equipment_id?: string;
  equipment_code?: string;
  drawing_id?: string;
}

export interface Pin {
  id: string;
  pin_no: string;
  sequence_no?: number;
  connector_id?: string;
  connector_code?: string;
  wire_id?: string;
  wire_no?: string;
  wire_no_raw?: string;
  signal_name?: string;
  wire_type_raw?: string;
  cable_spec?: string;
  from_ref?: string;
  to_ref?: string;
  remark?: string;
}

export interface Wire {
  id: string;
  wire_no: string;
  wire_type?: string;
  wire_size?: string;
  wire_color?: string;
  shielded?: boolean;
  voltage_class?: string;
  description?: string;
  remarks?: string;
}

export interface Trainline {
  id: string;
  trainline_no: number;
  name: string;
  description?: string;
  system_id?: string;
  system_code?: string;
  voltage_domain?: string;
  is_cross_connected?: boolean;
  cross_connect_notes?: string;
}

export interface TcmsPoint {
  id: string;
  point_code: string;
  rio_unit?: string;
  connector_code?: string;
  pin_no?: string;
  signal_type?: string;
  signal_name?: string;
  description?: string;
  system_id?: string;
  system_code?: string;
  drawing_id?: string;
}

export interface CarType {
  id: string;
  code: string;
  name: string;
  position_in_formation?: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  customer_name?: string;
  rolling_stock_type?: string;
}