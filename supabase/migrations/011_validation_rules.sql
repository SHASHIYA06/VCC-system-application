begin;

create or replace function public.run_validation_rules()
returns integer
language plpgsql
as $$
declare
    v_total integer := 0;
begin
    insert into public.validation_issues (severity, issue_type, source_table, source_id, message, details)
    select
        'HIGH',
        'MISSING_WIRE_NO',
        'connector_pins',
        cp.id,
        'Connector pin is missing wire number',
        jsonb_build_object(
            'connector_id', cp.connector_id,
            'pin_no', cp.pin_no,
            'endpoint_label', cp.endpoint_label
        )
    from public.connector_pins cp
    where cp.wire_no is null
      and not exists (
        select 1 from public.validation_issues vi
        where vi.source_table = 'connector_pins'
          and vi.source_id = cp.id
          and vi.issue_type = 'MISSING_WIRE_NO'
      );

    insert into public.validation_issues (severity, issue_type, source_table, source_id, message, details)
    select
        'MEDIUM',
        'MISSING_ENDPOINT_LABEL',
        'connector_pins',
        cp.id,
        'Connector pin has wire but no endpoint label',
        jsonb_build_object(
            'connector_id', cp.connector_id,
            'pin_no', cp.pin_no,
            'wire_no', cp.wire_no
        )
    from public.connector_pins cp
    where cp.wire_no is not null
      and cp.endpoint_label is null
      and not exists (
        select 1 from public.validation_issues vi
        where vi.source_table = 'connector_pins'
          and vi.source_id = cp.id
          and vi.issue_type = 'MISSING_ENDPOINT_LABEL'
      );

    insert into public.validation_issues (severity, issue_type, source_table, source_id, message, details)
    select
        'HIGH',
        'DUPLICATE_WIRE_ON_CONNECTOR_PIN',
        'connector_pins',
        min(cp.id),
        'Same connector/pin appears with multiple wire numbers',
        jsonb_build_object(
            'connector_id', cp.connector_id,
            'pin_no', cp.pin_no,
            'wire_count', count(distinct cp.wire_no)
        )
    from public.connector_pins cp
    where cp.wire_no is not null
    group by cp.connector_id, cp.pin_no
    having count(distinct cp.wire_no) > 1;

    insert into public.validation_issues (severity, issue_type, source_table, source_id, message, details)
    select
        'MEDIUM',
        'AMBIGUOUS_ENDPOINT_DIR',
        'connector_pins',
        cp.id,
        'Endpoint direction is unclear or missing',
        jsonb_build_object(
            'connector_id', cp.connector_id,
            'pin_no', cp.pin_no,
            'endpoint_dir', cp.endpoint_dir,
            'wire_no', cp.wire_no
        )
    from public.connector_pins cp
    where cp.wire_no is not null
      and cp.endpoint_dir is null
      and not exists (
        select 1 from public.validation_issues vi
        where vi.source_table = 'connector_pins'
          and vi.source_id = cp.id
          and vi.issue_type = 'AMBIGUOUS_ENDPOINT_DIR'
      );

    get diagnostics v_total = row_count;
    return v_total;
end;
$$;

create or replace view public.vw_connector_pin_complete as
select
    c.connector_code,
    c.norm_code,
    cp.pin_no,
    cp.norm_pin_no,
    cp.wire_no,
    cp.wire_type,
    cp.wire_color,
    cp.endpoint_label,
    cp.endpoint_pin,
    cp.endpoint_dir,
    cp.signal_name,
    cp.remarks,
    cp.connection_key,
    w.id as wire_id,
    w.cable_spec,
    w.shielded,
    w.voltage_class,
    di.name as device_name,
    di.tag as device_tag,
    di.car_type,
    dd.drawing_no,
    dd.title as document_title
from public.connectors c
join public.connector_pins cp on cp.connector_id = c.id
left join public.wires w on w.wire_no = cp.wire_no
left join public.device_instances di on di.id = c.device_id
left join public.drawing_documents dd on dd.id = di.document_id;

create or replace view public.vw_wire_trace as
select
    w.wire_no,
    w.wire_type,
    w.wire_color,
    w.cable_spec,
    w.shielded,
    w.voltage_class,
    cp.endpoint_dir,
    cp.endpoint_label,
    cp.endpoint_pin,
    c.connector_code,
    di.name as endpoint_device,
    s.name as subsystem
from public.wires w
join public.wire_endpoints we on we.wire_id = w.id
join public.connectors c on c.id = we.connector_id
left join public.connector_pins cp on cp.id = we.pin_id
left join public.device_instances di on di.id = c.device_id
left join public.systems s on s.id = di.system_id;

create or replace view public.vw_drawing_summary as
select
    dd.drawing_no,
    dd.title,
    dd.revision,
    dd.car_type,
    dd.subsystem,
    dd.sheet_info,
    dd.source_file,
    count(distinct dp.id) as page_count,
    count(distinct c.id) as connector_count,
    count(distinct cp.id) as pin_count
from public.drawing_documents dd
left join public.drawing_pages dp on dp.document_id = dd.id
left join public.device_instances di on di.document_id = dd.id
left join public.connectors c on c.device_id = di.id
left join public.connector_pins cp on cp.connector_id = c.id
group by dd.id;

commit;