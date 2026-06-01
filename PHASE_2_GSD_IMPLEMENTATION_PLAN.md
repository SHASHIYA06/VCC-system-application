# PHASE 2: GSD MODULE IMPLEMENTATION - PLAN

## Status: READY TO START
## Date: 2026-06-01
## Target Completion: 2026-06-02

---

## 🎯 Objective
Create a complete GSD (General System Diagram) module that visualizes the VCC system topology, showing network connections, equipment relationships, and wire paths in an interactive graph.

---

## 📋 Requirements

### 1. GSD API Endpoint (`/api/gsd`)
**Purpose**: Return complete system topology data

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "device_1",
        "label": "LTEB",
        "type": "equipment",
        "system": "DMC",
        "position": { "x": 0, "y": 0 },
        "metadata": { ... }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "device_1",
        "target": "device_2",
        "label": "Wire 3003",
        "type": "power",
        "metadata": { ... }
      }
    ],
    "systems": [
      {
        "code": "DMC",
        "name": "DMC System",
        "devices": 15,
        "connections": 42
      }
    ],
    "statistics": {
      "totalDevices": 150,
      "totalConnections": 500,
      "totalWires": 1200,
      "systemCount": 8
    }
  }
}
```

### 2. GSD Visualization Component
**Purpose**: Display interactive graph with xyflow

**Features**:
- Interactive node/edge visualization
- Zoom and pan controls
- System filtering
- Connection highlighting
- Real-time status indicators
- Search and filter capabilities

### 3. System Topology Data
**Sources**:
- Device table (equipment)
- Wire table (connections)
- WireEndpoint table (connection points)
- Connector table (physical connections)
- System table (system grouping)

---

## 🛠️ Implementation Tasks

### Task 2.1: Create GSD Data Model
**File**: `src/lib/gsd/topology.ts`

**Functions**:
- `getSystemTopology()` - Get complete topology
- `getSystemNodes()` - Get all nodes
- `getSystemEdges()` - Get all edges
- `getSystemStatistics()` - Get statistics
- `filterBySystem()` - Filter by system code
- `getDeviceConnections()` - Get device connections
- `getWirePath()` - Get wire path through system

**Data Structure**:
```typescript
interface SystemNode {
  id: string;
  label: string;
  type: 'equipment' | 'connector' | 'device' | 'junction';
  system: string;
  position: { x: number; y: number };
  metadata: Record<string, any>;
}

interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'power' | 'signal' | 'communication' | 'ground';
  wireNo?: string;
  metadata: Record<string, any>;
}

interface SystemTopology {
  nodes: SystemNode[];
  edges: SystemEdge[];
  systems: SystemInfo[];
  statistics: TopologyStatistics;
}
```

### Task 2.2: Create GSD API Endpoint
**File**: `src/app/api/gsd/route.ts`

**Endpoints**:
- `GET /api/gsd` - Get complete topology
- `GET /api/gsd?system=DMC` - Get system-specific topology
- `GET /api/gsd?device=LTEB` - Get device connections
- `GET /api/gsd?wire=3003` - Get wire path

**Implementation**:
```typescript
export async function GET(request: NextRequest) {
  const systemCode = request.nextUrl.searchParams.get('system');
  const deviceId = request.nextUrl.searchParams.get('device');
  const wireNo = request.nextUrl.searchParams.get('wire');
  
  // Get topology based on filters
  // Return formatted response
}
```

### Task 2.3: Create GSD Visualization Component
**File**: `src/components/gsd/GSDViewer.tsx`

**Features**:
- Interactive graph using xyflow
- Node rendering with icons
- Edge rendering with labels
- Zoom/pan controls
- System filtering
- Connection highlighting
- Search functionality

**Props**:
```typescript
interface GSDViewerProps {
  system?: string;
  device?: string;
  wire?: string;
  onNodeClick?: (node: SystemNode) => void;
  onEdgeClick?: (edge: SystemEdge) => void;
  interactive?: boolean;
}
```

### Task 2.4: Create GSD Page
**File**: `src/app/gsd/page.tsx`

**Features**:
- Full-page GSD viewer
- System selector
- Filter controls
- Statistics panel
- Export options
- Real-time updates

### Task 2.5: Add GSD to Dashboard
**File**: `src/app/dashboard/page.tsx`

**Features**:
- GSD widget showing system overview
- Quick system selector
- Connection statistics
- Link to full GSD page

---

## 📊 Data Sources

### Devices (Equipment)
```sql
SELECT id, tagNo, deviceName, deviceType, systemId, locationTag
FROM "Device"
```

### Wires (Connections)
```sql
SELECT id, wireNo, signalName, sourceEquipment, destEquipment
FROM "Wire"
```

### Wire Endpoints
```sql
SELECT wireId, deviceId, connectorId, pinId, endpointRole
FROM "WireEndpoint"
```

### Connectors
```sql
SELECT id, connectorCode, drawingId, pinCount
FROM "Connector"
```

### Systems
```sql
SELECT id, code, name, category
FROM "System"
```

---

## 🎨 UI/UX Design

### Node Styling
- **Equipment**: Large circles with icons
- **Connectors**: Small squares
- **Devices**: Medium circles
- **Junctions**: Diamond shapes

### Edge Styling
- **Power**: Red/thick lines
- **Signal**: Blue/medium lines
- **Communication**: Green/thin lines
- **Ground**: Black/dashed lines

### Colors
- DMC System: Blue (#3b82f6)
- TC System: Green (#10b981)
- MC System: Purple (#a855f7)
- CAB System: Orange (#f97316)
- Other: Gray (#6b7280)

### Layout
- Force-directed layout for automatic positioning
- Hierarchical layout option
- Circular layout for system view
- Custom positioning support

---

## 🔧 Technical Stack

### Libraries
- `@xyflow/react` - Graph visualization
- `@xyflow/system` - Layout algorithms
- `zustand` - State management
- `react-icons` - Icons
- `tailwindcss` - Styling

### Database
- Prisma for queries
- Optimized queries with proper indexing
- Caching for frequently accessed data

### Performance
- Lazy loading of nodes/edges
- Virtual scrolling for large graphs
- Debounced search/filter
- Memoized components

---

## 📝 Implementation Steps

### Step 1: Create Data Model
```bash
# Create topology.ts with data fetching functions
# Implement node/edge generation logic
# Add filtering and search capabilities
```

### Step 2: Create API Endpoint
```bash
# Create /api/gsd/route.ts
# Implement GET endpoint
# Add query parameter handling
# Add error handling and validation
```

### Step 3: Create Visualization Component
```bash
# Create GSDViewer.tsx component
# Implement xyflow integration
# Add controls and interactions
# Add styling and animations
```

### Step 4: Create GSD Page
```bash
# Create gsd/page.tsx
# Add system selector
# Add filter controls
# Add statistics panel
```

### Step 5: Integrate with Dashboard
```bash
# Add GSD widget to dashboard
# Add quick links
# Add statistics
```

### Step 6: Testing
```bash
# Test API endpoints
# Test visualization rendering
# Test interactions
# Test performance with large datasets
```

---

## ✅ Success Criteria

1. **API Functional**: `/api/gsd` returns correct topology data
2. **Visualization**: Graph renders correctly with all nodes/edges
3. **Interactions**: Zoom, pan, click, filter all work
4. **Performance**: Renders 500+ nodes smoothly
5. **Filtering**: System/device/wire filtering works
6. **Search**: Search functionality finds nodes
7. **Responsive**: Works on desktop and tablet
8. **Documentation**: Code well-documented

---

## 📚 Related Files

### New Files to Create
- `src/lib/gsd/topology.ts` - Data model
- `src/app/api/gsd/route.ts` - API endpoint
- `src/components/gsd/GSDViewer.tsx` - Visualization
- `src/app/gsd/page.tsx` - GSD page
- `src/components/gsd/SystemSelector.tsx` - System filter
- `src/components/gsd/GSDControls.tsx` - Controls
- `src/components/gsd/GSDStats.tsx` - Statistics

### Modified Files
- `src/app/dashboard/page.tsx` - Add GSD widget
- `src/app/layout.tsx` - Add GSD route

---

## 🚀 Next Phase

After Phase 2 completion:
- Phase 3: Diagnostic & AI System
- Phase 4: AI Search with 100% Accuracy
- Phase 5: 3D UI/UX Upgrade
- Phase 6: MCP Configuration

---

**Last Updated**: 2026-06-01
**Version**: 1.0.0
**Status**: READY TO START
