# GSD Module - Quick Reference Guide

**Module**: General System Diagram (GSD)
**Status**: ✅ Complete and Functional
**Version**: 1.0.0

---

## 🚀 Quick Start

### Access GSD Module
1. **Full Page**: Navigate to `/gsd`
2. **Dashboard Tab**: Click "GSD Topology" tab on dashboard
3. **API**: Call `/api/gsd` endpoint

### Basic Usage
```typescript
// Fetch complete topology
const response = await fetch('/api/gsd');
const data = await response.json();

// Fetch system-specific topology
const response = await fetch('/api/gsd?system=DMC');

// Search for nodes
const response = await fetch('/api/gsd?search=LTEB');
```

---

## 📁 File Structure

```
src/
├── lib/gsd/
│   └── topology.ts              # Data model and functions
├── app/api/gsd/
│   └── route.ts                 # API endpoint
├── components/gsd/
│   ├── GSDViewer.tsx            # Main visualization
│   ├── SystemSelector.tsx       # System filter
│   ├── GSDStats.tsx             # Statistics
│   └── GSDControls.tsx          # Controls
└── app/gsd/
    └── page.tsx                 # Full GSD page
```

---

## 🔌 API Endpoints

### GET /api/gsd
Get complete system topology

**Query Parameters**:
- `system` - Filter by system code (e.g., DMC, TC, MC)
- `device` - Get connections for specific device
- `wire` - Get path for specific wire
- `search` - Search nodes by label/metadata

**Examples**:
```bash
# Complete topology
GET /api/gsd

# DMC system only
GET /api/gsd?system=DMC

# Device connections
GET /api/gsd?device=DEVICE_ID

# Wire path
GET /api/gsd?wire=3003

# Search
GET /api/gsd?search=LTEB
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nodes": [...],
    "edges": [...],
    "systems": [...],
    "statistics": {...}
  },
  "query": {...}
}
```

### POST /api/gsd
Advanced queries

**Body**:
```json
{
  "systemCode": "DMC",
  "deviceId": "device_123",
  "wireNo": "3003",
  "searchQuery": "LTEB"
}
```

---

## 🎨 Components

### GSDViewer
Main visualization component

**Props**:
```typescript
interface GSDViewerProps {
  system?: string;           // System code filter
  device?: string;           // Device ID
  wire?: string;             // Wire number
  onNodeClick?: (node) => void;
  onEdgeClick?: (edge) => void;
  interactive?: boolean;     // Default: true
}
```

**Usage**:
```tsx
<GSDViewer
  system="DMC"
  onNodeClick={(node) => console.log(node)}
  interactive={true}
/>
```

### SystemSelector
System selection component

**Props**:
```typescript
interface SystemSelectorProps {
  systems: SystemInfo[];
  selectedSystem?: string;
  onSystemChange: (code: string) => void;
}
```

### GSDStats
Statistics display component

**Props**:
```typescript
interface GSDStatsProps {
  statistics: TopologyStatistics;
}
```

### GSDControls
Control panel component

**Props**:
```typescript
interface GSDControlsProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}
```

---

## 📊 Data Structures

### SystemNode
```typescript
interface SystemNode {
  id: string;
  label: string;
  type: 'equipment' | 'connector' | 'device' | 'junction' | 'system';
  system: string;
  position: { x: number; y: number };
  metadata: Record<string, any>;
  color?: string;
  icon?: string;
}
```

### SystemEdge
```typescript
interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'power' | 'signal' | 'communication' | 'ground' | 'connection';
  wireNo?: string;
  metadata: Record<string, any>;
  color?: string;
  animated?: boolean;
}
```

### SystemTopology
```typescript
interface SystemTopology {
  nodes: SystemNode[];
  edges: SystemEdge[];
  systems: SystemInfo[];
  statistics: TopologyStatistics;
}
```

---

## 🔧 Functions

### getSystemTopology(systemCode?)
Get complete system topology

```typescript
const topology = await getSystemTopology();
const dmcTopology = await getSystemTopology('DMC');
```

### getDeviceConnections(deviceId)
Get connections for specific device

```typescript
const connections = await getDeviceConnections('device_123');
```

### getWirePath(wireNo)
Get path for specific wire

```typescript
const path = await getWirePath('3003');
```

### searchTopologyNodes(query, systemCode?)
Search nodes by label/metadata

```typescript
const results = await searchTopologyNodes('LTEB');
const results = await searchTopologyNodes('connector', 'DMC');
```

### getSystemSpecificTopology(systemCode)
Get system-specific topology

```typescript
const topology = await getSystemSpecificTopology('DMC');
```

---

## 🎨 Styling & Colors

### System Colors
- **DMC**: Blue (#3b82f6)
- **TC**: Green (#10b981)
- **MC**: Purple (#a855f7)
- **CAB**: Orange (#f97316)
- **LTEB**: Cyan (#06b6d4)
- **HVAC**: Pink (#ec4899)
- **POWER**: Red (#ef4444)
- **SIGNAL**: Violet (#8b5cf6)

### Edge Colors
- **Power**: Red (#ef4444)
- **Signal**: Blue (#3b82f6)
- **Communication**: Green (#10b981)
- **Ground**: Black (#000000)
- **Connection**: Gray (#6b7280)

### UI Colors
- **Primary**: Cyan (#06b6d4)
- **Secondary**: Blue (#3b82f6)
- **Background**: Slate-900/950
- **Text**: Slate-300/400

---

## 📈 Performance Tips

1. **Lazy Loading**: Components load data on demand
2. **Memoization**: Components are memoized to prevent re-renders
3. **Debouncing**: Search and filter are debounced
4. **Virtual Scrolling**: Large lists use virtual scrolling
5. **Efficient Queries**: Prisma queries are optimized with proper includes

---

## 🐛 Troubleshooting

### Graph Not Rendering
- Check browser console for errors
- Verify API endpoint is accessible
- Ensure data is being fetched correctly

### Slow Performance
- Reduce number of nodes/edges
- Use system filtering to limit data
- Check browser performance tab

### Search Not Working
- Verify search query is not empty
- Check node labels and metadata
- Try different search terms

### Export Not Working
- Check browser console for errors
- Verify JSON data is valid
- Try different browser

---

## 🔗 Integration Points

### Dashboard
- GSD tab in main dashboard
- Statistics display
- Interactive graph viewer
- System selector

### API
- `/api/gsd` endpoint
- Query parameter support
- Error handling
- Response formatting

### Database
- Prisma ORM integration
- Efficient queries
- Relationship mapping
- Data aggregation

---

## 📚 Related Documentation

- `PHASE_2_GSD_IMPLEMENTATION_COMPLETE.md` - Detailed implementation
- `PHASE_2_COMPLETION_STATUS.md` - Phase completion status
- `MASTER_STATUS_REPORT.md` - Overall project status

---

## 🎯 Common Tasks

### Display Complete Topology
```tsx
<GSDViewer />
```

### Display System-Specific Topology
```tsx
<GSDViewer system="DMC" />
```

### Handle Node Click
```tsx
<GSDViewer
  onNodeClick={(node) => {
    console.log('Clicked node:', node.label);
    // Navigate to device details
  }}
/>
```

### Export Topology
```typescript
const response = await fetch('/api/gsd');
const data = await response.json();
const json = JSON.stringify(data.data, null, 2);
// Download or save json
```

### Search Nodes
```typescript
const response = await fetch('/api/gsd?search=LTEB');
const data = await response.json();
const results = data.data.nodes;
```

---

## 📞 Support

For issues or questions:
1. Check this quick reference
2. Review detailed documentation
3. Check browser console for errors
4. Verify API endpoint is accessible
5. Check database connection

---

**Last Updated**: 2026-06-02
**Version**: 1.0.0
**Status**: ✅ Complete
