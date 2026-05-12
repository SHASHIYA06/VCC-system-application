-- ============================================================
-- Migration 006: Wire Connection Seed & Staging Layer
-- For KMRCL VCC Intelligent Wiring Explorer
-- ============================================================

begin;

-- ============================================
-- STAGING: RAW WIRE ROWS (for bulk OCR imports)
-- ============================================
create table if not exists public.raw_wire_rows (
    id bigserial primary key,
    raw_row_id bigint,
    source_file text,
    source_page integer,
    drawing_no text,
    sheet_no text,
    equipment text,
    connector_code text,
    pin_no text,
    wire_no text,
    wire_type text,
    endpoint_direction text,
    endpoint_name text,
    endpoint_pin text,
    remark text,
    created_at timestamptz not null default now()
);

comment on table public.raw_wire_rows is 'Staging table for bulk wire imports from OCR extraction';

-- ============================================
-- SEED: WIRE CONNECTION SEED
-- ============================================
create table if not exists public.wire_connection_seed (
    id bigserial primary key,
    raw_row_id bigint,
    source_file text,
    source_page integer,
    drawing_no text,
    sheet_no text,
    equipment text,
    connector_code text not null,
    pin_no text not null,
    wire_no text,
    wire_type text,
    endpoint_direction text,
    endpoint_name text,
    endpoint_pin text,
    remark text,
    norm_connector_code text not null,
    norm_pin_no text not null,
    norm_wire_no text,
    connection_key text not null,
    promoted_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_wire_connection_seed_direction
        check (endpoint_direction in ('FROM', 'TO') or endpoint_direction is null)
);

comment on table public.wire_connection_seed is 'Normalized wire connection data ready for promotion';

create unique index if not exists ux_wire_connection_seed_key
    on public.wire_connection_seed (connection_key);

create index if not exists ix_wire_connection_seed_promoted_at
    on public.wire_connection_seed (promoted_at);

create index if not exists ix_wire_connection_seed_connector_pin
    on public.wire_connection_seed (norm_connector_code, norm_pin_no);

create index if not exists ix_wire_connection_seed_wire
    on public.wire_connection_seed (norm_wire_no);

-- ============================================
-- FUNCTION: Seed Wire Connection from Raw
-- ============================================
create or replace function public.seed_wire_connection_from_raw(
    p_schema text default 'public',
    p_table  text default 'raw_wire_rows'
)
returns bigint
language plpgsql
as $$
declare
    v_rel regclass;
    v_cols text[];
    v_sql text;
    v_count bigint;
begin
    v_rel := to_regclass(format('%I.%I', p_schema, p_table));
    if v_rel is null then
        raise exception 'Source table %.% not found', p_schema, p_table;
    end if;

    select array_agg(c.column_name::text order by c.ordinal_position)
    into v_cols
    from information_schema.columns c
    where c.table_schema = p_schema
      and c.table_name = p_table;

    v_sql := format($f$
        insert into public.wire_connection_seed (
            raw_row_id, source_file, source_page, drawing_no, sheet_no,
            equipment, connector_code, pin_no, wire_no, wire_type,
            endpoint_direction, endpoint_name, endpoint_pin, remark,
            norm_connector_code, norm_pin_no, norm_wire_no, connection_key
        )
        select
            (case when 'raw_row_id' = any(v_cols) then raw_row_id::bigint
                  when 'id' = any(v_cols) then id::bigint else null end) as raw_row_id,
            (case when 'source_file' = any(v_cols) then source_file::text
                  when 'source_filename' = any(v_cols) then source_filename::text else null end) as source_file,
            (case when 'source_page' = any(v_cols) then source_page::int
                  when 'page_no' = any(v_cols) then page_no::int else null end) as source_page,
            (case when 'drawing_no' = any(v_cols) then drawing_no::text
                  when 'drg_no' = any(v_cols) then drg_no::text else null end) as drawing_no,
            (case when 'sheet_no' = any(v_cols) then sheet_no::text else null end) as sheet_no,
            (case when 'equipment' = any(v_cols) then equipment::text else null end) as equipment,
            trim(connector_code) as connector_code,
            trim(pin_no) as pin_no,
            nullif(trim(wire_no), '') as wire_no,
            nullif(trim(wire_type), '') as wire_type,
            (case when endpoint_direction in ('FROM','TO') then endpoint_direction else null end) as endpoint_direction,
            nullif(trim(endpoint_name), '') as endpoint_name,
            nullif(trim(endpoint_pin), '') as endpoint_pin,
            nullif(trim(remark), '') as remark,
            upper(regexp_replace(trim(connector_code), '[^A-Za-z0-9]+', '', 'g')) as norm_connector_code,
            upper(regexp_replace(trim(pin_no), '[^A-Za-z0-9]+', '', 'g')) as norm_pin_no,
            nullif(upper(regexp_replace(coalesce(trim(wire_no), ''), '[^A-Za-z0-9]+', '', 'g')), '') as norm_wire_no,
            md5(concat_ws('|',
                coalesce(source_file, ''),
                upper(regexp_replace(trim(connector_code), '[^A-Za-z0-9]+', '', 'g')),
                upper(regexp_replace(trim(pin_no), '[^A-Za-z0-9]+', '', 'g')),
                coalesce(nullif(upper(regexp_replace(coalesce(trim(wire_no), ''), '[^A-Za-z0-9]+', '', 'g')), ''), '')
            )) as connection_key
        from %I.%I
        where trim(connector_code) is not null and trim(pin_no) is not null
        on conflict (connection_key) do update
        set wire_no = excluded.wire_no, wire_type = excluded.wire_type,
            endpoint_direction = excluded.endpoint_direction,
            endpoint_name = excluded.endpoint_name, endpoint_pin = excluded.endpoint_pin,
            remark = excluded.remark, updated_at = now()
    $f$, p_schema, p_table);

    execute v_sql;
    get diagnostics v_count = row_count;
    return v_count;
end;
$$;

-- ============================================
-- SEED DATA: High Priority Wire Connections
-- ============================================
insert into public.wire_connection_seed (
    source_file, drawing_no, equipment, connector_code, pin_no, wire_no, wire_type,
    endpoint_direction, endpoint_name, remark, norm_connector_code, norm_pin_no, norm_wire_no, connection_key
) values
-- TRAINLINE POWERING (Cross-connected at X1 pins 19/20)
('942-58103', '942-58103', 'X1 Inter-car Jumper', 'X1', '19', '3005', '1.5mm²', 'FROM', 'DMC1 X1-19', 'Powering 1 - crossed at jumper', 'X1', '19', '3005', md5('X1|19|3005')),
('942-58103', '942-58103', 'X1 Inter-car Jumper', 'X1', '20', '3006', '1.5mm²', 'FROM', 'DMC1 X1-20', 'Powering 2 - crossed at jumper', 'X1', '20', '3006', md5('X1|20|3006')),

-- BRAKE LOOP WIRES
('942-58124', '942-58124', 'BCU/BECU', 'X1', '5', '4062', '1.5mm²', 'FROM', 'BCU-X1-5', 'Emergency brake loop normal', 'X1', '5', '4062', md5('X1|5|4062')),
('942-58124', '942-58124', 'BCU/BECU', 'X1', '6', '4070', '1.5mm²', 'TO', 'BCU-X1-6', 'Emergency brake loop normal return', 'X1', '6', '4070', md5('X1|6|4070')),
('942-58124', '942-58124', 'BCU/BECU', 'X2', '5', '4103', '1.5mm²', 'FROM', 'BECU-X2-5', 'Emergency brake loop redundant', 'X2', '5', '4103', md5('X2|5|4103')),
('942-58124', '942-58124', 'BCU/BECU', 'X2', '6', '4110', '1.5mm²', 'TO', 'BECU-X2-6', 'Emergency brake loop redundant return', 'X2', '6', '4110', md5('X2|6|4110')),
('942-58125', '942-58125', 'Parking Brake Valve', 'PBMV', '1', '4122', '1.5mm²', 'FROM', 'PBR-PBMV-1', 'Parking brake applied', 'PBMV', '1', '4122', md5('PBMV|1|4122')),
('942-58126', '942-58126', 'Parking Brake Valve', 'PBMV', '2', '4153', '1.5mm²', 'TO', 'PBPS-PBMV-2', 'Parking brake released', 'PBMV', '2', '4153', md5('PBMV|2|4153')),
('942-58126', '942-58126', 'Parking Brake Switch', 'PBPS', '1', '4155', '1.5mm²', 'FROM', 'PBPS-1', 'Parking brake pressure switch', 'PBPS', '1', '4155', md5('PBPS|1|4155')),

-- DOOR OPERATION WIRES
('942-58138', '942-58138', 'Door Control Unit', 'DCU-X9', '1', '6009', '1.5mm²', 'FROM', 'DOLR-DCUX9-1', 'Door open left command', 'DCUX9', '1', '6009', md5('DCUX9|1|6009')),
('942-58138', '942-58138', 'Door Control Unit', 'DCU-X9', '2', '6014', '1.5mm²', 'FROM', 'DOLR-DCUX9-2', 'Door close left command', 'DCUX9', '2', '6014', md5('DCUX9|2|6014')),
('942-58139', '942-58139', 'Door Control Unit', 'DCU-X10', '1', '6046', '1.5mm²', 'FROM', 'DORR-DCU-X10-1', 'Door open right command', 'DCUX10', '1', '6046', md5('DCUX10|1|6046')),
('942-58139', '942-58139', 'Door Control Unit', 'DCU-X10', '2', '6051', '1.5mm²', 'FROM', 'DORR-DCU-X10-2', 'Door close right command', 'DCUX10', '2', '6051', md5('DCUX10|2|6051')),
('942-58138', '942-58138', 'Door Control Unit', 'DCU-X9', '3', '6073', '1.5mm²', 'FROM', 'TCMS-DCUX9-3', 'Door proving loop 1', 'DCUX9', '3', '6073', md5('DCUX9|3|6073')),
('942-58138', '942-58138', 'Door Control Unit', 'DCU-X9', '4', '6076', '1.5mm²', 'FROM', 'TCMS-DCUX9-4', 'Door proving loop 2', 'DCUX9', '4', '6076', md5('DCUX9|4|6076')),
('942-58140', '942-58140', 'Door Proving', 'DP1', '1', '6112', '1.5mm²', 'FROM', 'ZVS-DP1-1', 'Zero speed signal', 'DP1', '1', '6112', md5('DP1|1|6112')),

-- TRACTION COMMANDS
('942-58119', '942-58119', 'VVVF Inverter', 'CN1', '1', '3003', '1.5mm²', 'FROM', 'FWD-CN1-1', 'Forward command', 'CN1', '1', '3003', md5('CN1|1|3003')),
('942-58119', '942-58119', 'VVVF Inverter', 'CN1', '2', '3004', '1.5mm²', 'FROM', 'REV-CN1-2', 'Reverse command', 'CN1', '2', '3004', md5('CN1|2|3004')),
('942-58119', '942-58119', 'VVVF Inverter', 'CN1', '3', '3010', '1.5mm²', 'FROM', 'BRK-CN1-3', 'Braking command', 'CN1', '3', '3010', md5('CN1|3|3010')),
('942-58119', '942-58119', 'VVVF Inverter', 'CN1', '4', '3011', '1.5mm²', 'FROM', 'FSB-CN1-4', 'Full service brake', 'CN1', '4', '3011', md5('CN1|4|3011')),
('942-58119', '942-58119', 'VVVF Inverter', 'CN2', '1', '3018', '1.5mm²', 'FROM', 'SBY-CN2-1', 'Standby mode', 'CN2', '1', '3018', md5('CN2|1|3018')),
('942-58119', '942-58119', 'VVVF Inverter', 'CN2', '2', '3013', '1.5mm²', 'FROM', 'RM-CN2-2', 'Restricted manual', 'CN2', '2', '3013', md5('CN2|2|3013')),

-- VAC WIRES
('942-58143', '942-58143', 'Cab VAC Unit', 'X1', '1', '7001', '1.5mm²', 'FROM', 'TCMS-X1-1', 'Cab VAC in SSK', 'X1', '1', '7001', md5('X1|1|7001')),
('942-58144', '942-58144', 'Saloon VAC Unit 1', 'X1', '1', '7050', '1.5mm²', 'FROM', 'TCMS-X1-1', 'Saloon VAC1 in SSK', 'X1', '1', '7050', md5('X1|1|7050')),
('942-58145', '942-58145', 'Saloon VAC Unit 2', 'X1', '1', '7060', '1.5mm²', 'FROM', 'TCMS-X1-1', 'Saloon VAC2 in SSK', 'X1', '1', '7060', md5('X1|1|7060')),
('942-58145', '942-58145', 'Smoke Detector', 'SM1', '1', '7070', '1.5mm²', 'FROM', 'TCMS-SM1-1', 'Smoke detection', 'SM1', '1', '7070', md5('SM1|1|7070')),
('942-58144', '942-58144', 'Damper Control', 'DM1', '1', '7071', '1.5mm²', 'FROM', 'TCMS-DM1-1', 'Damper operation', 'DM1', '1', '7071', md5('DM1|1|7071')),

-- TCMS/RIO WIRES
('942-58146', '942-58146', 'TCMS RIO', 'U1513', '1', '9214', '1.5mm²', 'FROM', 'ATP-U1513-1', 'ATP mode', 'U1513', '1', '9214', md5('U1513|1|9214')),
('942-58146', '942-58146', 'TCMS RIO', 'U1513', '2', '9215', '1.5mm²', 'FROM', 'FWD-U1513-2', 'FWD mode', 'U1513', '2', '9215', md5('U1513|2|9215')),
('942-58146', '942-58146', 'TCMS RIO', 'U1513', '3', '9216', '1.5mm²', 'FROM', 'REV-U1513-3', 'REV mode', 'U1513', '3', '9216', md5('U1513|3|9216')),

-- SIV/AUXILIARY WIRES
('942-58130', '942-58130', 'APS Unit', 'X1', '1', '5030', '1.5mm²', 'FROM', 'SIV-X1-1', 'SIV contact 1', 'X1', '1', '5030', md5('X1|1|5030')),
('942-58130', '942-58130', 'APS Unit', 'X1', '2', '5031', '1.5mm²', 'FROM', 'SIV-X1-2', 'SIV contact 2', 'X1', '2', '5031', md5('X1|2|5031')),
('942-58131', '942-58131', 'Shore Supply', 'SSK', '1', '5000', '1.5mm²', 'FROM', 'SSK-SS-1', 'Shore supply contact', 'SSK', '1', '5000', md5('SSK|1|5000')),
('942-58132', '942-58132', 'Battery Control', 'BAT', '1', '5064', '1.5mm²', 'FROM', 'TCMS-BAT-1', 'Battery under-voltage', 'BAT', '1', '5064', md5('BAT|1|5064'));

commit;