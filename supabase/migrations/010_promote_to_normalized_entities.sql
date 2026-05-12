begin;

create or replace function public.norm_code(p_text text)
returns text
language sql
immutable
as $$
    select nullif(upper(regexp_replace(coalesce(trim(p_text), ''), '[^A-Za-z0-9]+', '', 'g')), '');
$$;

create or replace function public.promote_seed_to_normalized(p_limit integer default 10000)
returns integer
language plpgsql
as $$
declare
    v_count integer := 0;
begin
    with picked as (
        select s.*
        from public.wire_connection_seed s
        where s.promoted_at is null
        order by s.id
        limit p_limit
    ),
    upsert_wires as (
        insert into public.wires (id, wire_no, wire_type, cable_spec, remarks)
        select
            gen_random_uuid()::text,
            p.wire_no,
            p.wire_type,
            p.wire_type,
            p.remark
        from picked p
        where nullif(trim(p.wire_no), '') is not null
        on conflict (wire_no) do update set
            wire_type = coalesce(excluded.wire_type, public.wires.wire_type),
            cable_spec = coalesce(excluded.cable_spec, public.wires.cable_spec),
            remarks = coalesce(excluded.remarks, public.wires.remarks),
            updated_at = now()
        returning id
    ),
    upsert_connectors as (
        insert into public.connectors (id, device_id, connector_code, norm_code, connector_type, remarks)
        select
            gen_random_uuid()::text,
            null,
            p.connector_code,
            public.norm_code(p.connector_code),
            null,
            p.equipment
        from picked p
        where public.norm_code(p.connector_code) is not null
        on conflict (device_id, norm_code) do nothing
        returning id
    )
    insert into public.connector_pins (
        id,
        connector_id,
        pin_no,
        wire_no,
        wire_type,
        endpoint_label,
        endpoint_pin,
        endpoint_dir,
        remarks,
        norm_pin_no,
        connection_key
    )
    select
        gen_random_uuid()::text,
        c.id,
        p.pin_no,
        p.wire_no,
        p.wire_type,
        p.endpoint_name,
        p.endpoint_pin,
        p.endpoint_direction,
        p.remark,
        public.norm_code(p.pin_no),
        p.connection_key
    from picked p
    join public.connectors c
        on c.device_id is null
        and c.norm_code = public.norm_code(p.connector_code)
    where public.norm_code(p.pin_no) is not null
    on conflict (connector_id, norm_pin_no) do update set
        wire_no = coalesce(excluded.wire_no, public.connector_pins.wire_no),
        wire_type = coalesce(excluded.wire_type, public.connector_pins.wire_type),
        endpoint_label = coalesce(excluded.endpoint_label, public.connector_pins.endpoint_label),
        endpoint_pin = coalesce(excluded.endpoint_pin, public.connector_pins.endpoint_pin),
        endpoint_dir = coalesce(excluded.endpoint_dir, public.connector_pins.endpoint_dir),
        remarks = coalesce(excluded.remarks, public.connector_pins.remarks),
        connection_key = coalesce(excluded.connection_key, public.connector_pins.connection_key);

    insert into public.wire_endpoints (
        id,
        wire_id,
        connector_id,
        pin_id,
        endpoint_role,
        endpoint_label,
        endpoint_pin,
        source_file,
        source_page
    )
    select
        gen_random_uuid()::text,
        w.id,
        c.id,
        cp.id,
        coalesce(cp.endpoint_dir, 'UNKNOWN'),
        cp.endpoint_label,
        cp.endpoint_pin,
        s.source_file,
        s.source_page
    from public.wire_connection_seed s
    join public.connectors c
        on c.device_id is null
        and c.norm_code = public.norm_code(s.connector_code)
    join public.connector_pins cp
        on cp.connector_id = c.id
        and cp.norm_pin_no = public.norm_code(s.pin_no)
    join public.wires w
        on w.wire_no = s.wire_no
    where s.wire_no is not null
        and not exists (
            select 1
            from public.wire_endpoints we
            where we.wire_id = w.id
                and we.connector_id = c.id
                and we.pin_id = cp.id
        );

    update public.wire_connection_seed
    set promoted_at = now()
    where id in (select id from picked);

    get diagnostics v_count = row_count;
    return v_count;
end;
$$;

create or replace function public.promote_raw_to_seed()
returns integer
language plpgsql
as $$
declare
    v_count integer := 0;
begin
    with source as (
        select
            r.id as raw_id,
            r.source_file,
            r.source_page,
            r.drawing_no,
            r.equipment,
            r.connector_code,
            r.pin_no,
            r.wire_no,
            r.wire_type,
            r.endpoint_direction,
            r.endpoint_name,
            r.endpoint_pin,
            r.remark
        from public.drawing_extraction_raw r
        where not exists (
            select 1
            from public.wire_connection_seed s
            where s.raw_row_id = r.id
        )
        and r.connector_code is not null
        and r.pin_no is not null
    )
    insert into public.wire_connection_seed (
        raw_row_id, source_file, source_page, drawing_no,
        equipment, connector_code, pin_no, wire_no, wire_type,
        endpoint_direction, endpoint_name, endpoint_pin, remark,
        norm_connector_code, norm_pin_no, norm_wire_no, connection_key
    )
    select
        s.raw_id,
        s.source_file,
        s.source_page,
        s.drawing_no,
        s.equipment,
        s.connector_code,
        s.pin_no,
        s.wire_no,
        s.wire_type,
        s.endpoint_direction,
        s.endpoint_name,
        s.endpoint_pin,
        s.remark,
        public.norm_code(s.connector_code),
        public.norm_code(s.pin_no),
        public.norm_code(s.wire_no),
        concat(public.norm_code(s.connector_code), '-', public.norm_code(s.pin_no))
    from source s
    on conflict (connection_key) do nothing;

    get diagnostics v_count = row_count;
    return v_count;
end;
$$;

commit;