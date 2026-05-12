-- ============================================================
-- Migration 007: Promote from Raw - Wire Connections Final Table
-- For KMRCL VCC Intelligent Wiring Explorer
-- ============================================================

begin;

-- ============================================
-- FINAL TABLE: WIRE CONNECTIONS
-- ============================================
create table if not exists public.wire_connections (
    id bigserial primary key,
    connection_key text not null unique,
    connector_code text not null,
    pin_no text not null,
    wire_no text,
    wire_type text,
    endpoint_direction text,
    endpoint_name text,
    endpoint_pin text,
    equipment text,
    primary_source_file text,
    first_source_page integer,
    first_seen_at timestamptz not null default now(),
    last_seen_at timestamptz not null default now(),
    source_count integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_wire_connections_direction
        check (endpoint_direction in ('FROM', 'TO') or endpoint_direction is null)
);

comment on table public.wire_connections is 'Final wire connection data - promoted from seed after validation';

-- ============================================
-- TRACKING TABLE: PROMOTION RUNS
-- ============================================
create table if not exists public.wire_connection_promotion_runs (
    id bigserial primary key,
    run_started_at timestamptz not null default now(),
    run_finished_at timestamptz,
    source_file text,
    promoted_count integer not null default 0,
    skipped_count integer not null default 0,
    note text
);

comment on table public.wire_connection_promotion_runs is 'Tracks wire connection promotion batches for audit';

-- ============================================
-- VALIDATION VIEW: Unmapped Wire Connections
-- ============================================
create or replace view public.v_wire_connections_unmapped as
select 
    wc.connection_key,
    wc.connector_code,
    wc.pin_no,
    wc.wire_no,
    wc.equipment,
    wc.primary_source_file,
    wc.first_source_page
from public.wire_connections wc
left join public.connectors c on c.connector_code = wc.connector_code
where c.id is null
order by wc.primary_source_file, wc.connector_code;

comment on view public.v_wire_connections_unmapped is 'Shows wire connections not yet linked to connector records';

-- ============================================
-- VALIDATION VIEW: Cross-Reference Matrix
-- ============================================
create or replace view public.v_wire_connections_xref as
select 
    s.code as system_code,
    s.name as system_name,
    wc.connector_code,
    wc.pin_no,
    wc.wire_no,
    wc.wire_type,
    wc.endpoint_name,
    wc.equipment,
    d.drawing_no,
    d.title as drawing_title,
    ct.code as car_type
from public.wire_connections wc
left join public.drawings d on d.drawing_no = wc.primary_source_file
left join public.systems s on s.id = d.system_id
left join public.car_types ct on ct.id = d.car_type_id
order by s.code, wc.connector_code, wc.pin_no;

comment on view public.v_wire_connections_xref is 'Cross-reference matrix of wire connections by system, connector, and car type';

-- ============================================
-- VALIDATION VIEW: Wire-to-Trainline Mapping
-- ============================================
create or replace view public.v_wire_trainline_map as
select 
    t.trainline_no,
    t.name as trainline_name,
    t.voltage_domain,
    t.is_cross_connected,
    t.cross_connect_notes,
    wc.connector_code,
    wc.pin_no,
    wc.wire_no,
    wc.equipment,
    wc.primary_source_file as drawing_no
from public.trainlines t
left join public.wire_connections wc on wc.wire_no = t.trainline_no::text
order by t.trainline_no;

comment on view public.v_wire_trainline_map is 'Maps trainline numbers to physical wire connections';

-- ============================================
-- VALIDATION VIEW: Connector Pin Summary
-- ============================================
create or replace view public.v_connector_pin_summary as
select 
    norm_connector_code as connector_code,
    count(*) as total_connections,
    count(distinct norm_wire_no) as unique_wires,
    count(distinct equipment) as equipment_count,
    array_agg(distinct equipment) as equipment_list,
    array_agg(distinct norm_wire_no) as wire_list
from public.wire_connection_seed
where promoted_at is null
group by norm_connector_code
order by norm_connector_code;

comment on view public.v_connector_pin_summary is 'Summary of pending wire connections per connector';

-- ============================================
-- FUNCTION: Promote Wire Connections from Seed
-- ============================================
create or replace function public.promote_from_raw(
    p_limit integer default 5000,
    p_source_file text default null
)
returns integer
language plpgsql
as $$
declare
    v_run_id bigint;
    v_count integer := 0;
    v_skipped integer := 0;
begin
    -- Start a promotion run
    insert into public.wire_connection_promotion_runs (source_file)
    values (p_source_file)
    returning id into v_run_id;

    -- Pick and promote seed rows
    with picked as (
        select s.*
        from public.wire_connection_seed s
        where s.promoted_at is null
          and (p_source_file is null or s.source_file = p_source_file)
        order by s.id
        limit p_limit
    ),
    upserted as (
        insert into public.wire_connections (
            connection_key, connector_code, pin_no, wire_no, wire_type,
            endpoint_direction, endpoint_name, endpoint_pin, equipment,
            primary_source_file, first_source_page,
            first_seen_at, last_seen_at, source_count,
            created_at, updated_at
        )
        select
            p.connection_key,
            p.connector_code,
            p.pin_no,
            p.wire_no,
            p.wire_type,
            p.endpoint_direction,
            p.endpoint_name,
            p.endpoint_pin,
            p.equipment,
            p.source_file,
            p.source_page,
            now(),
            now(),
            1,
            now(),
            now()
        from picked p
        on conflict (connection_key) do update
        set
            wire_no = coalesce(excluded.wire_no, wire_connections.wire_no),
            wire_type = coalesce(excluded.wire_type, wire_connections.wire_type),
            endpoint_direction = coalesce(excluded.endpoint_direction, wire_connections.endpoint_direction),
            endpoint_name = coalesce(excluded.endpoint_name, wire_connections.endpoint_name),
            endpoint_pin = coalesce(excluded.endpoint_pin, wire_connections.endpoint_pin),
            equipment = coalesce(excluded.equipment, wire_connections.equipment),
            primary_source_file = coalesce(wire_connections.primary_source_file, excluded.primary_source_file),
            first_source_page = coalesce(wire_connections.first_source_page, excluded.first_source_page),
            last_seen_at = now(),
            source_count = wire_connections.source_count + 1,
            updated_at = now()
        returning connection_key
    )
    update public.wire_connection_seed s
    set promoted_at = now(), updated_at = now()
    where s.id in (select p.id from picked p);

    get diagnostics v_count = row_count;

    -- Count skipped (already promoted)
    select count(*) into v_skipped
    from public.wire_connection_seed
    where promoted_at is not null
      and (p_source_file is null or source_file = p_source_file);

    -- Update run record
    update public.wire_connection_promotion_runs
    set run_finished_at = now(),
        promoted_count = v_count,
        skipped_count = v_skipped,
        note = case
            when v_count = 0 and v_skipped = 0 then 'No unpromoted seed rows found'
            when v_count = 0 and v_skipped > 0 then 'All rows already promoted'
            else null
        end
    where id = v_run_id;

    return v_count;
end;
$$;

-- ============================================
-- FUNCTION: Validate Wire Connection Coverage
-- ============================================
create or replace function public.validate_wire_coverage()
returns table(
    validation_type text,
    connector_code text,
    missing_pins integer,
    unmapped_wires integer,
    coverage_percent numeric
)
language plpgsql
as $$
begin
    return query
    select 
        'connector_coverage'::text as validation_type,
        c.connector_code,
        (c.pin_count::integer - count(wc.id))::integer as missing_pins,
        count(distinct wc.wire_no) filter (where wc.wire_no is null)::integer as unmapped_wires,
        case 
            when c.pin_count = 0 then 0
            else round((count(wc.id)::numeric / c.pin_count::numeric) * 100, 2)
        end as coverage_percent
    from public.connectors c
    left join public.wire_connections wc on wc.connector_code = c.connector_code
    group by c.id, c.connector_code, c.pin_count
    order by c.connector_code;
end;
$$;

-- ============================================
-- FULL SYNC PROCEDURE: Run All Promotions
-- ============================================
create or replace procedure public.run_wire_connection_sync(
    p_batch_size integer default 5000
)
language plpgsql
as $$
begin
    -- Promote all pending seed rows
    perform public.promote_from_raw(p_batch_size, null);
    
    -- Log completion
    raise notice 'Wire connection sync completed at %', now();
end;
$$;

commit;