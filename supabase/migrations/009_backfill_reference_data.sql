begin;

insert into public.systems(name, code, description) values
('LTEB', 'LTEB', 'Low tension equipment box'),
('LTJB', 'LTJB', 'Low tension junction box'),
('TMS', 'TMS', 'Train management / monitoring references in drawings'),
('DISPLAY', 'DISPLAY', 'Passenger display and TFT subsystem'),
('COMM', 'COMM', 'Communication subsystem'),
('LIGHTING', 'LIGHTING', 'Saloon and interior lighting'),
('BRAKE', 'BRAKE', 'Brake and BECU subsystem'),
('PIS', 'PIS', 'Passenger information system'),
('FAM', 'FAM', 'Fire alarm module')
on conflict (name) do nothing;

insert into public.device_types(name, category, description) values
('TCMS RIO-1', 'CONTROL', 'TCMS remote input output unit 1'),
('TCMS RIO-2', 'CONTROL', 'TCMS remote input output unit 2'),
('TCMS TB', 'TERMINAL', 'TCMS terminal block'),
('ETHERNET PORT', 'NETWORK', 'Ethernet switch M12 port'),
('EXTERIOR CAMERA', 'CCTV', 'Exterior CCTV camera'),
('INTERIOR CAMERA', 'CCTV', 'Interior CCTV camera'),
('AAU', 'PASSENGER', 'Audio / alarm unit'),
('PEAU', 'PASSENGER', 'Passenger emergency alarm unit'),
('TFT DISPLAY', 'DISPLAY', 'Passenger TFT display'),
('LTJB', 'JUNCTION', 'Low tension junction box'),
('LTEB', 'JUNCTION', 'Low tension equipment box'),
('EDB', 'POWER', 'Electrical distribution box'),
('BECU', 'CONTROL', 'Brake electronic control unit'),
('COMMUNICATION NODE-1', 'NETWORK', 'TCMS communication node 1'),
('COMMUNICATION NODE-2', 'NETWORK', 'TCMS communication node 2'),
('DOOR INSIDE INDICATOR', 'DOOR', 'Door inside indicator'),
('DOOR OUTSIDE INDICATOR', 'DOOR', 'Door outside indicator'),
('PAU', 'AUDIO', 'Passenger address unit'),
('HVAC', 'HVAC', 'Heating ventilation air conditioning'),
('IOC', 'CONTROL', 'Input output controller'),
('MDU', 'DISPLAY', 'Message display unit'),
('DACU', 'AUDIO', 'Driver access control unit')
on conflict (name) do nothing;

insert into public.device_instances(id, system_id, type_id, name, tag, car_type, remarks)
select
    gen_random_uuid()::text,
    s.id,
    dt.id,
    seed.name,
    seed.tag,
    seed.car_type,
    seed.remarks
from (
    values
    ('TCMS', 'TCMS RIO-1', 'TCMS RIO-1', 'RIO1', 'MC', 'Backfilled from pin drawings'),
    ('TCMS', 'TCMS RIO-2', 'TCMS RIO-2', 'RIO2', 'MC', 'Backfilled from pin drawings'),
    ('CCTV', 'ETHERNET SWITCH', 'ETHERNET SWITCH', 'ESW', 'MC', 'Backfilled from pin drawings'),
    ('CCTV', 'INTERIOR CAMERA', 'INTERIOR CAMERA 1', 'CAM-INT-1', 'MC', 'Backfilled from pin drawings'),
    ('CCTV', 'INTERIOR CAMERA', 'INTERIOR CAMERA 2', 'CAM-INT-2', 'MC', 'Backfilled from pin drawings'),
    ('CCTV', 'EXTERIOR CAMERA', 'EXTERIOR CAMERA 1', 'CAM-EXT-1', 'MC', 'Backfilled from pin drawings'),
    ('CCTV', 'EXTERIOR CAMERA', 'EXTERIOR CAMERA 2', 'CAM-EXT-2', 'MC', 'Backfilled from pin drawings'),
    ('AAU', 'AAU', 'AAU', 'AAU', 'MC', 'Backfilled from pin drawings'),
    ('AAU', 'PEAU', 'PEAU R1', 'PEAUR1', 'MC', 'Backfilled from pin drawings'),
    ('AAU', 'PEAU', 'PEAU R2', 'PEAUR2', 'MC', 'Backfilled from pin drawings'),
    ('AAU', 'PEAU', 'PEAU L1', 'PEAUL1', 'MC', 'Backfilled from pin drawings'),
    ('AAU', 'PEAU', 'PEAU L2', 'PEAUL2', 'MC', 'Backfilled from pin drawings'),
    ('DISPLAY', 'TFT DISPLAY', 'TFT R1', 'TFTR1', 'MC', 'Backfilled from pin drawings'),
    ('DISPLAY', 'TFT DISPLAY', 'TFT R2', 'TFTR2', 'MC', 'Backfilled from pin drawings'),
    ('DISPLAY', 'TFT DISPLAY', 'TFT L1', 'TFTL1', 'MC', 'Backfilled from pin drawings'),
    ('DISPLAY', 'TFT DISPLAY', 'TFT L2', 'TFTL2', 'MC', 'Backfilled from pin drawings'),
    ('COMM', 'COMMUNICATION NODE-1', 'TCMS COMMUNICATION NODE-1', 'TCMS-CN1', 'MC', 'Backfilled from pin drawings'),
    ('COMM', 'COMMUNICATION NODE-2', 'TCMS COMMUNICATION NODE-2', 'TCMS-CN2', 'MC', 'Backfilled from pin drawings'),
    ('BECU', 'BECU', 'BECU', 'BECU', 'MC', 'Backfilled from pin drawings'),
    ('DOOR', 'DOOR INSIDE INDICATOR', 'DOOR INSIDE INDICATOR', 'DII', 'MC', 'Backfilled from pin drawings'),
    ('DOOR', 'DOOR OUTSIDE INDICATOR', 'DOOR OUTSIDE INDICATOR', 'DOI', 'MC', 'Backfilled from pin drawings'),
    ('TCMS', 'TCMS TB', 'TCMS TB', 'TCMS-TB', 'MC', 'Backfilled from pin drawings'),
    ('LTEB', 'LTEB', 'LTEB', 'LTEB', 'MC', 'Backfilled from pin drawings'),
    ('LTJB', 'LTJB', 'LTJB', 'LTJB', 'MC', 'Backfilled from pin drawings')
) as seed(system_name, type_name, name, tag, car_type, remarks)
join public.systems s on s.name = seed.system_name
join public.device_types dt on dt.name = seed.type_name
where not exists (
    select 1
    from public.device_instances di
    where di.name = seed.name
        and coalesce(di.tag, '') = coalesce(seed.tag, '')
        and coalesce(di.car_type, '') = coalesce(seed.car_type, '')
);

insert into public.drawing_documents(id, drawing_no, title, revision, car_type, subsystem, source_file)
select gen_random_uuid()::text, v.dno, v.title, v.rev, v.ct, v.sub, v.sf
from (values
    ('942-58131', 'Trainlines DMC (DMC CAR)', 'A', 'DMC', 'TCMS', '942-58131.pdf'),
    ('942-58132', 'Trainlines TC (TC CAR)', 'A', 'TC', 'TCMS', '942-58132.pdf'),
    ('942-58133', 'Trainlines MC (MC CAR)', 'A', 'MC', 'TCMS', '942-58133.pdf'),
    ('942-38342', 'TCMS RIO CN11 Pin Assignment', 'A', 'MC', 'TCMS', null),
    ('942-38343', 'TCMS RIO CN12 Pin Assignment', 'A', 'MC', 'TCMS', null),
    ('942-38344', 'TCMS RIO CN15 Pin Assignment', 'A', 'MC', 'TCMS', null),
    ('942-38345', 'TCMS RIO CN17 Pin Assignment', 'A', 'MC', 'TCMS', null),
    ('942-38431', 'CCTV Ethernet Switch Port Assignment', 'A', 'MC', 'CCTV', null),
    ('942-38432', 'CCTV Camera Pin Assignment', 'A', 'MC', 'CCTV', null),
    ('942-38531', 'AAU PEAU Pin Assignment', 'A', 'MC', 'AAU', null),
    ('942-38532', 'PEAU to TCMS Connection', 'A', 'MC', 'AAU', null),
    ('942-38631', 'TFT Display Pin Assignment', 'A', 'MC', 'DISPLAY', null),
    ('942-38632', 'TFT to TCMS Communication', 'A', 'MC', 'DISPLAY', null)
) as v(dno, title, rev, ct, sub, sf)
on conflict do nothing;

commit;