begin;

insert into public.drawing_documents(id, drawing_no, title, revision, car_type, subsystem, source_file, sheet_info)
values
    (gen_random_uuid()::text, '942-58131', 'Trainlines DMC (DMC CAR)', 'A', 'DMC', 'TCMS', '942-58131.pdf', 'Sheet 1 of 2'),
    (gen_random_uuid()::text, '942-58132', 'Trainlines TC (TC CAR)', 'A', 'TC', 'TCMS', '942-58132.pdf', 'Sheet 1 of 2'),
    (gen_random_uuid()::text, '942-58133', 'Trainlines MC (MC CAR)', 'A', 'MC', 'TCMS', '942-58133.pdf', 'Sheet 1 of 2'),
    (gen_random_uuid()::text, '942-58134', 'Wire Termination DMC', 'A', 'DMC', 'TCMS', '942-58134.pdf', 'Sheet 1 of 2'),
    (gen_random_uuid()::text, '942-58135', 'Wire Termination TC', 'A', 'TC', 'TCMS', '942-58135.pdf', 'Sheet 1 of 2'),
    (gen_random_uuid()::text, '942-58136', 'Wire Termination MC', 'A', 'MC', 'TCMS', '942-58136.pdf', 'Sheet 1 of 2'),
    (gen_random_uuid()::text, '942-38342', 'TCMS RIO CN11 Pin Assignment', 'A', 'MC', 'TCMS', '942-38342.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38343', 'TCMS RIO CN12 Pin Assignment', 'A', 'MC', 'TCMS', '942-38343.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38344', 'TCMS RIO CN15 Pin Assignment', 'A', 'MC', 'TCMS', '942-38344.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38345', 'TCMS RIO CN17 Pin Assignment', 'A', 'MC', 'TCMS', '942-38345.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38431', 'CCTV Ethernet Switch Port Assignment', 'A', 'MC', 'CCTV', '942-38431.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38432', 'CCTV Camera Pin Assignment', 'A', 'MC', 'CCTV', '942-38432.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38433', 'CCTV System Interconnect', 'A', 'MC', 'CCTV', '942-38433.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38531', 'AAU PEAU Pin Assignment', 'A', 'MC', 'AAU', '942-38531.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38532', 'PEAU to TCMS Connection', 'A', 'MC', 'AAU', '942-38532.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38533', 'AAU System Overview', 'A', 'MC', 'AAU', '942-38533.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38631', 'TFT Display Pin Assignment', 'A', 'MC', 'DISPLAY', '942-38631.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38632', 'TFT to TCMS Communication', 'A', 'MC', 'DISPLAY', '942-38632.pdf', 'Sheet 1'),
    (gen_random_uuid()::text, '942-38633', 'PIS System Overview', 'A', 'MC', 'PIS', '942-38633.pdf', 'Sheet 1')
on conflict do nothing;

insert into public.connectors(id, device_id, connector_code, norm_code, connector_type, remarks)
select
    gen_random_uuid()::text,
    di.id,
    seed.conn_code,
    upper(regexp_replace(seed.conn_code, '[^A-Za-z0-9]+', '', 'g')),
    seed.conn_type,
    seed.remarks
from (
    values
    ('TCMS RIO-1', 'CN11', 'MULTIPIN', 'TCMS RIO CN11 26-pin connector'),
    ('TCMS RIO-1', 'CN12', 'MULTIPIN', 'TCMS RIO CN12 26-pin connector'),
    ('TCMS RIO-1', 'CN15', 'MULTIPIN', 'TCMS RIO CN15 26-pin connector'),
    ('TCMS RIO-1', 'CN17', 'MULTIPIN', 'TCMS RIO CN17 26-pin connector'),
    ('TCMS RIO-1', 'X1', 'TERMINAL', 'TCMS RIO X1 terminal block'),
    ('TCMS RIO-1', 'X4', 'TERMINAL', 'TCMS RIO X4 terminal block'),
    ('ETHERNET SWITCH', 'M12-1', 'ETHERNET', 'Ethernet M12 port 1'),
    ('ETHERNET SWITCH', 'M12-2', 'ETHERNET', 'Ethernet M12 port 2'),
    ('ETHERNET SWITCH', 'M12-3', 'ETHERNET', 'Ethernet M12 port 3'),
    ('ETHERNET SWITCH', 'M12-4', 'ETHERNET', 'Ethernet M12 port 4'),
    ('ETHERNET SWITCH', 'M12-5', 'ETHERNET', 'Ethernet M12 port 5'),
    ('ETHERNET SWITCH', 'M12-6', 'ETHERNET', 'Ethernet M12 port 6'),
    ('ETHERNET SWITCH', 'M12-7', 'ETHERNET', 'Ethernet M12 port 7'),
    ('ETHERNET SWITCH', 'M12-8', 'ETHERNET', 'Ethernet M12 port 8'),
    ('AAU', 'CN1', 'MULTIPIN', 'AAU CN1 connector'),
    ('AAU', 'CN2', 'MULTIPIN', 'AAU CN2 connector'),
    ('PEAU R1', 'CN1', 'MULTIPIN', 'PEAU CN1 connector'),
    ('PEAU R2', 'CN1', 'MULTIPIN', 'PEAU CN1 connector'),
    ('PEAU L1', 'CN1', 'MULTIPIN', 'PEAU CN1 connector'),
    ('PEAU L2', 'CN1', 'MULTIPIN', 'PEAU CN1 connector'),
    ('TFT R1', 'CN1', 'DISPLAY', 'TFT display CN1 connector'),
    ('TFT R2', 'CN1', 'DISPLAY', 'TFT display CN1 connector'),
    ('TFT L1', 'CN1', 'DISPLAY', 'TFT display CN1 connector'),
    ('TFT L2', 'CN1', 'DISPLAY', 'TFT display CN1 connector'),
    ('BECU', 'CN1', 'MULTIPIN', 'BECU CN1 connector'),
    ('TCMS RIO-2', 'CN11', 'MULTIPIN', 'TCMS RIO CN11 26-pin connector'),
    ('TCMS RIO-2', 'CN12', 'MULTIPIN', 'TCMS RIO CN12 26-pin connector'),
    ('TCMS COMMUNICATION NODE-1', 'CN1', 'COMMUNICATION', 'TCMS comm node CN1'),
    ('TCMS COMMUNICATION NODE-2', 'CN1', 'COMMUNICATION', 'TCMS comm node CN1')
) as seed(device_name, conn_code, conn_type, remarks)
join public.device_instances di on di.name = seed.device_name
where not exists (
    select 1 from public.connectors c
    where c.device_id = di.id
      and c.norm_code = upper(regexp_replace(seed.conn_code, '[^A-Za-z0-9]+', '', 'g'))
);

commit;