#!/usr/bin/env python3
"""Process TC_CEILING and TC_UF PIN DRAWINGS PDFs - extract connectors and pins."""
import psycopg2
import re
import subprocess
import os
import uuid

DB_URL = 'postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
TC_CEILING_PDF = '/Users/shashishekharmishra/VCC system application/DOCUMENTS/TC_CEILING PIN DRAWINGS.pdf'
TC_UF_PDF = '/Users/shashishekharmishra/VCC system application/DOCUMENTS/TC _UF PIN DRAWINGS.pdf'

def extract_page_text(pdf_path, page_num):
    tmp = f'/tmp/tc_p{os.getpid()}_{page_num}.txt'
    try:
        subprocess.run(['pdftotext', '-f', str(page_num), '-l', str(page_num), '-layout', pdf_path, tmp],
                       capture_output=True, timeout=30)
        if os.path.exists(tmp):
            with open(tmp, 'r', errors='replace') as f:
                text = f.read()
            os.remove(tmp)
            return text
    except Exception as e:
        print(f"  Error: {e}")
    return ''

def parse_pin_tables(text):
    """Parse pin tables from PDF text. Returns dict of connector_code -> list of pins."""
    results = {}
    lines = text.split('\n')
    
    current_connector = None
    
    for line in lines:
        # Detect connector headers
        # CN1, CN2, CN3, etc. possibly with suffix
        cn_match = re.search(r'\bCN(\d+)\b', line)
        if cn_match:
            current_connector = f'CN{cn_match.group(1)}'
            if current_connector not in results:
                results[current_connector] = []
        
        # Detect BECU-TB
        if re.search(r'\bBECU[\s-]*T/?B\b', line, re.IGNORECASE):
            current_connector = 'BECU-TB'
            if current_connector not in results:
                results[current_connector] = []
        
        if not current_connector:
            continue
        
        # Skip header/filler lines
        if re.search(r'(PIN NO|WIRE NO|REMARK|MACHINING|TOLERANCE|WELDING|CONFIDENTIAL|GRADE|SYMBOL|VALUE|SURFACE|ROUGHNESS)', line, re.IGNORECASE):
            continue
        
        # Try to extract pin data from the line
        # Format varies but often: pin_letter wire_no destination [remark]
        # Look for patterns like: A 0V501-1 APS1
        # or: SP001-1 EDB
        
        # Pattern: single letter/digit pin, then wire number, then destination
        pin_matches = re.findall(
            r'(?<!\w)([A-Za-z]\d{0,2})\s+(?:\\?\s*\\?\s*|[\[\(\\\/|]+)?\s*(\S+)\s+(BEML|LTJB\d*|LTEB|EDB|BCU\d*|APS\d*|ESK|PGB\d*|AAU|TCMS|EPIC\d*|SR\d*|SSB\d*|VAC\d*|ADO\d*|ASC\d*|FAE|DCU|ADMV|SCOPE|ETHERNET|TELEV|GKW|BS FR|SKID|ANTI|RADOX)',
            line, re.IGNORECASE
        )
        
        for m in pin_matches:
            pin_no = m[0]
            wire_no = m[1]
            dest = m[2]
            # Filter out obvious non-pins
            if pin_no and len(pin_no) <= 3 and not pin_no.lower() in ('cn', 'sp', 'bcu'):
                results[current_connector].append({
                    'pinNo': pin_no,
                    'wireNo': wire_no,
                    'terminalTo': dest,
                })
        
        # Also try simpler pattern: just pin letter + wire number + destination word
        if not pin_matches:
            simple_matches = re.findall(
                r'(?<!\w)([A-Za-z]\d{0,2})\s+(\S{2,})\s+([A-Z][A-Za-z0-9]{1,15})',
                line
            )
            for m in simple_matches:
                pin_no = m[0]
                wire_no = m[1]
                dest = m[2]
                if pin_no and len(pin_no) <= 3 and not re.match(r'^(CN|SP|PIN|WIRE|REM)', pin_no, re.IGNORECASE):
                    # Check if dest looks like a destination (not a number or common word)
                    if not re.match(r'^\d+$', dest) and dest not in ('THE', 'AND', 'FOR', 'ALL', 'STD', 'REF'):
                        results[current_connector].append({
                            'pinNo': pin_no,
                            'wireNo': wire_no,
                            'terminalTo': dest,
                        })
    
    # Deduplicate
    for cn in results:
        seen = set()
        unique = []
        for p in results[cn]:
            key = (p['pinNo'], p['wireNo'])
            if key not in seen:
                seen.add(key)
                unique.append(p)
        results[cn] = unique
    
    return results

def get_or_create_drawing(cur, drawing_no, title):
    cur.execute('SELECT id FROM "Drawing" WHERE "drawingNo" = %s', (drawing_no,))
    row = cur.fetchone()
    if row:
        return row[0]
    drawing_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO "Drawing" (id, "drawingNo", title, "projectId", "createdAt", "updatedAt", "isReference", status)
        VALUES (%s, %s, %s, 'default', NOW(), NOW(), false, 'ACTIVE'::"DrawingStatus")
    """, (drawing_id, drawing_no, title))
    return drawing_id

def get_connector_id(cur, drawing_id, conn_code, car_type='TC'):
    cur.execute("""
        SELECT id FROM "Connector"
        WHERE "drawingId" = %s AND "connectorCode" = %s AND "carType" = %s
    """, (drawing_id, conn_code, car_type))
    row = cur.fetchone()
    if row:
        return row[0]
    conn_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO "Connector" (id, "drawingId", "connectorCode", "carType", "createdAt")
        VALUES (%s, %s, %s, %s, NOW())
    """, (conn_id, drawing_id, conn_code, car_type))
    return conn_id

def insert_pin(cur, connector_id, pin_data, source_ref):
    pin_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO "ConnectorPin" (id, "connectorId", "pinNo", "wireNo", "terminalTo", "note")
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (pin_id, connector_id, pin_data['pinNo'], pin_data.get('wireNo', ''),
          pin_data.get('terminalTo', ''), source_ref))

def insert_page_mapping(cur, drawing_id, pdf_name, page_no, drawing_no, notes=''):
    mapping_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO "DrawingPageMapping" (id, "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", notes, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT DO NOTHING
    """, (mapping_id, drawing_id, pdf_name, page_no, drawing_no, notes))

def identify_tc_uf_drawing(text, page_num):
    """Try to identify the drawing number for a TC_UF page."""
    # Try explicit drawing number
    m = re.search(r'942[-\s]38(\d{3})', text)
    if m:
        return f'942-38{m.group(1)}'
    
    # Try garbled patterns
    m = re.search(r'94[0-9 ]*38(\d{3})', text)
    if m:
        num = re.sub(r'\s', '', m.group(1))
        return f'942-38{num}'
    
    # Content-based identification
    if re.search(r'LTEB\s*-\s*T\s*CAR', text, re.IGNORECASE):
        return '942-38505'
    if re.search(r'LTJB\s*#\s*1', text, re.IGNORECASE):
        return '942-38506'
    if re.search(r'LTJB\s*#\s*2', text, re.IGNORECASE):
        return '942-38507'
    if re.search(r'APS\s*-\s*T\s*CAR', text, re.IGNORECASE):
        return '942-38519'
    if re.search(r'SPEED\s*SENSOR', text, re.IGNORECASE):
        return '942-38513'
    
    # Try to find from page number mapping (known patterns)
    # Pages 1-2 seem to be LTEB (942-38505)
    # Pages 3-6 seem to be LTJB #4 (942-38506) 
    # Pages 7-12 seem to be LTJB #2 (942-38507)
    # Pages 13-14 seem to be APS (942-38519)
    # Pages 15-17 might be other drawings
    # Pages 18-19 are mapped (942-38518, 942-38519)
    
    return None

def process_ceiling_page(cur, page_num):
    """Process one page of TC_CEILING PIN DRAWINGS."""
    text = extract_page_text(TC_CEILING_PDF, page_num)
    if not text or len(text.strip()) < 100:
        return 0, 0
    
    drawing_id = 'cmr7v1tsw001z8z4w77kf1mrf'  # 942-38408
    tables = parse_pin_tables(text)
    
    total_pins = 0
    for cn_name, pins in tables.items():
        if not pins:
            continue
        conn_id = get_connector_id(cur, drawing_id, cn_name, 'TC')
        for pin in pins:
            source_ref = f'Source: TC_CEILING PIN DRAWINGS.pdf page {page_num}'
            insert_pin(cur, conn_id, pin, source_ref)
            total_pins += 1
    
    return len([c for c, p in tables.items() if p]), total_pins

def process_uf_page(cur, page_num):
    """Process one page of TC_UF PIN DRAWINGS."""
    text = extract_page_text(TC_UF_PDF, page_num)
    if not text or len(text.strip()) < 100:
        return 0, 0
    
    # Identify drawing
    drawing_no = identify_tc_uf_drawing(text, page_num)
    if not drawing_no:
        # Default: try to assign based on known page ranges
        # This is a fallback - we'll try harder later
        print(f"  Page {page_num}: Could not identify drawing number")
        return 0, 0
    
    titles = {
        '942-38505': 'PIN ASSIGNMENT, LTEB - T CAR',
        '942-38506': 'PIN ASSIGNMENT, LTJB #4 - T CAR',
        '942-38507': 'PIN ASSIGNMENT, LTJB #2 - T CAR',
        '942-38513': 'PIN ASSIGNMENT, SPEED SENSOR - T CAR',
        '942-38518': 'TC UF PIN Assignment',
        '942-38519': 'PIN ASSIGNMENT, APS - T CAR',
    }
    title = titles.get(drawing_no, f'TC UF PIN Assignment - {drawing_no}')
    
    drawing_id = get_or_create_drawing(cur, drawing_no, title)
    
    tables = parse_pin_tables(text)
    
    # Create page mapping
    conn_names = [c for c, p in tables.items() if p]
    notes = f'Source: TC _UF PIN DRAWINGS.pdf page {page_num}. Connectors: {", ".join(conn_names)}' if conn_names else f'Source: TC _UF PIN DRAWINGS.pdf page {page_num}'
    insert_page_mapping(cur, drawing_id, 'TC _UF PIN DRAWINGS.pdf', page_num, drawing_no, notes)
    
    total_pins = 0
    for cn_name, pins in tables.items():
        if not pins:
            continue
        conn_id = get_connector_id(cur, drawing_id, cn_name, 'TC')
        for pin in pins:
            source_ref = f'Source: TC _UF PIN DRAWINGS.pdf page {page_num}'
            insert_pin(cur, conn_id, pin, source_ref)
            total_pins += 1
    
    return len(conn_names), total_pins

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print("=" * 60)
    print("TC_CEILING PIN DRAWINGS.pdf - Processing all 27 pages")
    print("=" * 60)
    
    for page in range(1, 28):
        cn_count, pin_count = process_ceiling_page(cur, page)
        print(f"  Page {page:2d}: {cn_count} connectors, {pin_count} pins")
        conn.commit()
    
    print("\n" + "=" * 60)
    print("TC _UF PIN DRAWINGS.pdf - Processing all 21 pages")
    print("=" * 60)
    
    for page in range(1, 22):
        cn_count, pin_count = process_uf_page(cur, page)
        print(f"  Page {page:2d}: {cn_count} connectors, {pin_count} pins")
        conn.commit()
    
    # Final counts
    cur.execute('SELECT COUNT(*) FROM "Connector" WHERE "carType" = \'TC\'')
    tc_conns = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "ConnectorPin" p JOIN "Connector" c ON p."connectorId" = c.id WHERE c."carType" = \'TC\'')
    tc_pins = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "DrawingPageMapping" WHERE "sourceFileName" ILIKE \'%TC%\'')
    tc_mappings = cur.fetchone()[0]
    
    print(f"\nFinal: {tc_conns} TC connectors, {tc_pins} TC pins, {tc_mappings} TC page mappings")
    conn.close()

if __name__ == '__main__':
    main()
