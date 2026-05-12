begin;

create extension if not exists pgcrypto;

create table if not exists public.drawing_documents (
    id text primary key default gen_random_uuid()::text,
    drawing_no text,
    title text,
    revision text,
    sheet_info text,
    source_file text,
    car_type text,
    subsystem text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_drawing_documents_drawing_no on public.drawing_documents(drawing_no);
create index if not exists idx_drawing_documents_source_file on public.drawing_documents(source_file);
create index if not exists idx_drawing_documents_car_type_subsystem on public.drawing_documents(car_type, subsystem);

create table if not exists public.drawing_pages (
    id text primary key default gen_random_uuid()::text,
    document_id text not null references public.drawing_documents(id) on delete cascade,
    page_no integer,
    ocr_text text,
    extracted_json jsonb,
    created_at timestamptz not null default now(),
    unique(document_id, page_no)
);

create table if not exists public.systems (
    id text primary key default gen_random_uuid()::text,
    name text not null unique,
    code text,
    description text
);

create table if not exists public.device_types (
    id text primary key default gen_random_uuid()::text,
    name text not null unique,
    category text,
    description text
);

create table if not exists public.device_instances (
    id text primary key default gen_random_uuid()::text,
    system_id text references public.systems(id),
    type_id text references public.device_types(id),
    document_id text references public.drawing_documents(id),
    tag text,
    name text not null,
    location text,
    car_type text,
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_device_instances_tag on public.device_instances(tag);
create index if not exists idx_device_instances_name on public.device_instances(name);
create index if not exists idx_device_instances_car_type on public.device_instances(car_type);

create table if not exists public.connectors (
    id text primary key default gen_random_uuid()::text,
    device_id text references public.device_instances(id),
    connector_code text not null,
    connector_type text,
    gender text,
    side text,
    remarks text,
    norm_code text not null,
    created_at timestamptz not null default now(),
    unique(device_id, norm_code)
);

create index if not exists idx_connectors_code on public.connectors(connector_code);
create index if not exists idx_connectors_norm_code on public.connectors(norm_code);

create table if not exists public.connector_pins (
    id text primary key default gen_random_uuid()::text,
    connector_id text not null references public.connectors(id) on delete cascade,
    pin_no text not null,
    signal_name text,
    wire_no text,
    wire_type text,
    wire_color text,
    endpoint_label text,
    endpoint_pin text,
    endpoint_dir text,
    remarks text,
    norm_pin_no text not null,
    connection_key text,
    created_at timestamptz not null default now(),
    unique(connector_id, norm_pin_no)
);

create index if not exists idx_connector_pins_wire_no on public.connector_pins(wire_no);
create index if not exists idx_connector_pins_connection_key on public.connector_pins(connection_key);

create table if not exists public.wires (
    id text primary key default gen_random_uuid()::text,
    wire_no text not null unique,
    wire_type text,
    wire_color text,
    cable_spec text,
    shielded boolean,
    voltage_class text,
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.wire_endpoints (
    id text primary key default gen_random_uuid()::text,
    wire_id text not null references public.wires(id) on delete cascade,
    device_id text references public.device_instances(id),
    connector_id text references public.connectors(id),
    pin_id text references public.connector_pins(id),
    endpoint_role text,
    endpoint_label text,
    endpoint_pin text,
    source_file text,
    source_page integer,
    created_at timestamptz not null default now()
);

create index if not exists idx_wire_endpoints_wire_id on public.wire_endpoints(wire_id);
create index if not exists idx_wire_endpoints_label on public.wire_endpoints(endpoint_label);
create index if not exists idx_wire_endpoints_source on public.wire_endpoints(source_file, source_page);

create table if not exists public.validation_issues (
    id bigserial primary key,
    severity text not null,
    issue_type text not null,
    source_table text,
    source_id text,
    message text not null,
    details jsonb,
    resolved boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_validation_issues_state on public.validation_issues(severity, resolved);

create table if not exists public.drawing_extraction_raw (
    id bigserial primary key,
    source_file text,
    source_page integer,
    drawing_no text,
    title text,
    equipment text,
    connector_code text,
    pin_no text,
    wire_no text,
    wire_type text,
    wire_color text,
    endpoint_direction text,
    endpoint_name text,
    endpoint_pin text,
    remark text,
    raw_json jsonb,
    promoted_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_drawing_extraction_raw_source on public.drawing_extraction_raw(source_file, source_page);
create index if not exists idx_drawing_extraction_raw_conn_pin on public.drawing_extraction_raw(connector_code, pin_no);
create index if not exists idx_drawing_extraction_raw_wire on public.drawing_extraction_raw(wire_no);

insert into public.systems(name, code, description) values
('TCMS', 'TCMS', 'Train control and monitoring system'),
('CCTV', 'CCTV', 'Camera and ethernet switch system'),
('DOOR', 'DOOR', 'Door control and status system'),
('AAU', 'AAU', 'Passenger alarm/audio related units'),
('VAC', 'VAC', 'Ventilation and air conditioning'),
('BECU', 'BECU', 'Brake electronic control unit'),
('EDB', 'EDB', 'Electrical distribution box')
on conflict (name) do nothing;

insert into public.device_types(name, category, description) values
('TCMS RIO', 'CONTROL', 'Remote IO module'),
('ETHERNET SWITCH', 'NETWORK', 'Ethernet switch with M12 ports'),
('CAMERA', 'CCTV', 'Interior or exterior camera'),
('PEAU', 'PASSENGER', 'Passenger emergency alarm unit'),
('TFT', 'DISPLAY', 'Passenger display/TFT'),
('COMMUNICATION NODE', 'NETWORK', 'TCMS communication node'),
('TERMINAL BLOCK', 'ELECTRICAL', 'Terminal block reference'),
('BECU', 'CONTROL', 'Brake electronic control unit'),
('DOOR INDICATOR', 'DOOR', 'Door inside/outside indicator')
on conflict (name) do nothing;

commit;