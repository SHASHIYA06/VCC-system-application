#!/usr/bin/env python3
"""Process TC_CEILING and TC_UF PIN DRAWINGS - comprehensive extraction."""
import psycopg2
import re
import subprocess
import os
import uuid

DB_URL = 'postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
TC_CEILING_PDF = '/Users/shashishekharmishra/VCC system application/DOCUMENTS/TC_CEILING PIN DRAWINGS.pdf'
TC_UF_PDF = '/Users/shashishekharmishra/VCC system application/DOCUMENTS/TC _UF PIN DRAWINGS.pdf'

def extract_text(pdf_path, page_num):
    tmp = f'/tmp/tc_v2_{os.getpid()}_{page_num}.txt'
    try:
        subprocess.run(['pdftotext', '-f', str(page_num), '-l', str(page_num), '-layout', pdf_path, tmp],
                       capture_output=True, timeout=30)
        if os.path.exists(tmp):
            with open(tmp, 'r', errors='replace') as f:
                text = f.read()
            os.remove(tmp)
            return text
    except:
        pass
    return ''

def extract_pins_from_text(text):
    """Extract pin data from page text. Returns list of pin dicts."""
    pins = []
    lines = text.split('\n')
    
    for line in lines:
        # Skip header/filler lines
        if re.search(r'(PIN NO|WIRE NO|REMARK|MACHINING|TOLERANCE|WELDING|CONFIDENTIAL|GRADE|SYMBOL|VALUE|SURFACE|ROUGHNESS|STATUS|SIGNATURE|DRAWING RELEASED)', line, re.IGNORECASE):
            continue
        if len(line.strip()) < 5:
            continue
        
        # Pattern 1: pin letter + wire number + destination (most common)
        # e.g., "A 0V501-1 APS1" or "A [\ 14215/1-3 BECU T/B"
        matches = re.findall(
            r'(?<!\w)([A-Za-z])\s+(?:\\?\s*\\?\s*|[\[\(\\\/|]+)?\s*(\S{2,30})\s+(BEML|LTJB\d*|LTEB|EDB|BCU\d*|APS\d*|ESK|PGB\d*|AAU|TCMS|EPIC\d*|SR\d*|SSB\d*|VAC\d*|ADO\d*|ASC\d*|FAE|DCU|ADMV|SCOPE|ETHERNET|TELEV|GKW|BS FR|SKID|ANTI|RADOX|KNORR|MAKER)',
            line, re.IGNORECASE
        )
        for m in matches:
            pin_no, wire_no, dest = m
            if pin_no.isalpha() and len(pin_no) == 1:
                pins.append({'pinNo': pin_no, 'wireNo': wire_no, 'terminalTo': dest})
        
        # Pattern 2: pin number + wire + destination (for numbered pins like 1, 2, 3)
        if not matches:
            num_matches = re.findall(
                r'(?<!\w)(\d{1,2})\s+(?:\\?\s*\\?\s*|[\[\(\\\/|]+)?\s*(\S{2,30})\s+(BEML|LTJB\d*|LTEB|EDB|BCU\d*|APS\d*|ESK|PGB\d*|AAU|TCMS|EPIC\d*|SR\d*|SSB\d*|VAC\d*|ADO\d*|ASC\d*|FAE|DCU|ADMV|SCOPE|ETHERNET|TELEV|GKW|BS FR|SKID|ANTI|RADOX|KNORR|MAKER)',
                line, re.IGNORECASE
            )
            for m in num_matches:
                pin_no, wire_no, dest = m
                if pin_no.isdigit() and 1 <= int(pin_no) <= 72:
                    pins.append({'pinNo': pin_no, 'wireNo': wire_no, 'terminalTo': dest})
        
        # Pattern 3: simpler - just pin + wire + any uppercase word destination
        if not matches:
            simple = re.findall(
                r'(?<!\w)([A-Za-z])\s+(\S{2,20})\s+([A-Z][A-Za-z0-9]{1,10})',
                line
            )
            for m in simple:
                pin_no, wire_no, dest = m
                if (pin_no.isalpha() and len(pin_no) == 1 and 
                    dest not in ('THE', 'AND', 'FOR', 'ALL', 'STD', 'REF', 'NOT', 'HALF', 'FULL', 'PIN', 'WIRE', 'REM', 'MACH', 'TOL', 'WELD')):
                    pins.append({'pinNo': pin_no, 'wireNo': wire_no, 'terminalTo': dest})
    
    # Deduplicate
    seen = set()
    unique = []
    for p in pins:
        key = (p['pinNo'], p['wireNo'])
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique

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

def insert_pin(cur, connector_id, pin, source_ref):
    pin_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO "ConnectorPin" (id, "connectorId", "pinNo", "wireNo", "terminalTo", "note")
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (pin_id, connector_id, pin['pinNo'], pin.get('wireNo', ''), pin.get('terminalTo', ''), source_ref))

def insert_page_mapping(cur, drawing_id, pdf_name, page_no, drawing_no, notes=''):
    mapping_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO "DrawingPageMapping" (id, "drawingId", "sourceFileName", "pdfPageNo", "drawingNumber", notes, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT DO NOTHING
    """, (mapping_id, drawing_id, pdf_name, page_no, drawing_no, notes))

def identify_tc_uf_drawing(text, page_num):
    """Identify drawing number for a TC_UF page based on content."""
    # Try explicit 942-38XXX pattern
    m = re.search(r'942[-\s]38(\d{3})', text)
    if m:
        return f'942-38{m.group(1)}'
    
    # Try garbled patterns
    m = re.search(r'94[0-9 ]*38(\d{3})', text)
    if m:
        num = re.sub(r'\s', '', m.group(1))
        if len(num) == 3:
            return f'942-38{num}'
    
    # Content-based identification
    if re.search(r'LTEB\s*-\s*T\s*CAR', text, re.IGNORECASE):
        return '942-38505'
    if re.search(r'LTJB\s*#\s*1', text, re.IGNORECASE):
        return '942-38506'
    if re.search(r'LTJB\s*#\s*2', text, re.IGNORECASE):
        return '942-38507'
    if re.search(r'APS\s*-\s*T\s*CAR', text, re.IGNORECASE):
        # Check for sheet number
        if re.search(r'Sheet\s*2', text, re.IGNORECASE):
            return '942-38512'
        return '942-38519'
    if re.search(r'SPEED\s*SENSOR', text, re.IGNORECASE):
        # Try to identify which SS drawing
        return '942-38508'  # Default SS drawing
    if re.search(r'VVVF', text, re.IGNORECASE):
        return '942-38517'
    
    return None

def process_ceiling_page(cur, page_num):
    """Process one page of TC_CEILING PIN DRAWINGS."""
    text = extract_text(TC_CEILING_PDF, page_num)
    if not text or len(text.strip()) < 100:
        return 0, 0
    
    drawing_id = 'cmr7v1tsw001z8z4w77kf1mrf'  # 942-38408
    pins = extract_pins_from_text(text)
    
    # Group pins by connector based on context
    # For TC Ceiling, pins are for CN1-CN6
    # We need to figure out which connector each pin belongs to
    # For now, we'll create pins under a generic connector
    
    if pins:
        # Create a page-specific connector if needed
        conn_code = f'PAGE-{page_num}'
        conn_id = get_connector_id(cur, drawing_id, conn_code, 'TC')
        for pin in pins:
            source_ref = f'Source: TC_CEILING PIN DRAWINGS.pdf page {page_num}'
            insert_pin(cur, conn_id, pin, source_ref)
    
    return 1, len(pins)

def process_uf_page(cur, page_num):
    """Process one page of TC_UF PIN DRAWINGS."""
    text = extract_text(TC_UF_PDF, page_num)
    if not text or len(text.strip()) < 100:
        return 0, 0
    
    drawing_no = identify_tc_uf_drawing(text, page_num)
    if not drawing_no:
        print(f"  Page {page_num}: Could not identify drawing")
        return 0, 0
    
    titles = {
        '942-38505': 'PIN ASSIGNMENT, LTEB - T CAR',
        '942-38506': 'PIN ASSIGNMENT, LTJB #1 - T CAR',
        '942-38507': 'PIN ASSIGNMENT, LTJB #2 - T CAR',
        '942-38508': 'PIN ASSIGNMENT, SS - T CAR',
        '942-38512': 'PIN ASSIGNMENT, APS - T CAR (Sheet 2)',
        '942-38517': 'PIN ASSIGNMENT, VVVF - T CAR',
        '942-38518': 'TC UF PIN Assignment',
        '942-38519': 'PIN ASSIGNMENT, APS - T CAR',
    }
    title = titles.get(drawing_no, f'TC UF PIN Assignment - {drawing_no}')
    
    drawing_id = get_or_create_drawing(cur, drawing_no, title)
    
    pins = extract_pins_from_text(text)
    
    # Create page mapping
    notes = f'Source: TC _UF PIN DRAWINGS.pdf page {page_num}'
    insert_page_mapping(cur, drawing_id, 'TC _UF PIN DRAWINGS.pdf', page_num, drawing_no, notes)
    
    if pins:
        # Group pins by connector
        # For simplicity, create a connector for this page
        conn_code = f'PAGE-{page_num}'
        conn_id = get_connector_id(cur, drawing_id, conn_code, 'TC')
        for pin in pins:
            source_ref = f'Source: TC _UF PIN DRAWINGS.pdf page {page_num}'
            insert_pin(cur, conn_id, pin, source_ref)
    
    return 1, len(pins)

def main():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print("=" * 60)
    print("TC_CEILING PIN DRAWINGS.pdf")
    print("=" * 60)
    
    for page in range(1, 28):
        mapping_count, pin_count = process_ceiling_page(cur, page)
        print(f"  Page {page:2d}: {pin_count} pins")
        conn.commit()
    
    print("\n" + "=" * 60)
    print("TC _UF PIN DRAWINGS.pdf")
    print("=" * 60)
    
    for page in range(1, 22):
        mapping_count, pin_count = process_uf_page(cur, page)
        print(f"  Page {page:2d}: {pin_count} pins")
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
