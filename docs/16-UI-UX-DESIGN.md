# UI/UX DESIGN SYSTEM
## Enterprise Engineering Interface

**Version**: 4.0 | **Date**: July 17, 2026

---

## 1. Design Principles

1. **Engineering-Grade** — Professional, not flashy
2. **Data-Dense** — Show maximum information efficiently
3. **Dark Theme** — Reduce eye strain for long sessions
4. **Responsive** — Works on desktop, tablet, mobile
5. **Accessible** — WCAG AA compliant

## 2. Color System

| Token | Value | Usage |
|-------|-------|-------|
| --color-bg | #0a0f1e | Background |
| --color-accent | #06b6d4 | Primary accent |
| --color-secondary | #8b5cf6 | Secondary accent |
| --color-success | #10b981 | Positive states |
| --color-warning | #f59e0b | Warning states |
| --color-danger | #ef4444 | Error states |
| --color-glass | rgba(255,255,255,0.06) | Glass panels |
| --color-glass-border | rgba(255,255,255,0.1) | Glass borders |

## 3. Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Heading 1 | Inter | 24px | 700 |
| Heading 2 | Inter | 18px | 600 |
| Body | Inter | 14px | 400 |
| Mono | JetBrains Mono | 14px | 500 |
| Caption | Inter | 12px | 400 |

## 4. Component Library

| Component | Purpose | Location |
|-----------|---------|----------|
| Card3D | Interactive card | src/components/ui/Card3D.tsx |
| GlassPanel | Glass container | src/components/ui/GlassPanel.tsx |
| GlassButton | Action button | src/components/ui/GlassButton.tsx |
| StatCard | Dashboard stat | src/components/ui/StatCard.tsx |

## 5. Navigation Structure

```
Sidebar (Left)
├── MAIN
│   └── Dashboard
├── DIGITAL TWIN
│   ├── Twin Explorer
│   ├── Train Explorer
│   ├── Systems (21)
│   ├── Equipment (254)
│   ├── Connectors (1.1k)
│   ├── Wire Harness (168k)
│   ├── Pin Diagrams (56k)
│   └── Trainlines (1.2k)
├── DOCUMENTATION
│   ├── Drawing Search (297)
│   ├── VCC Reference
│   ├── Documents
│   └── Reports
├── INTELLIGENCE
│   ├── GSD Topology
│   ├── GSD Graph
│   ├── AI Assistant
│   ├── Validation Center
│   └── Troubleshooting
└── ADMIN
    └── Settings
```

## 6. Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│  Header: Dashboard + Database Connected badge    │
├─────────────────────────────────────────────────┤
│  Tab Controller: Explorer | GSD | Diagnostics    │
├─────────────────────────────────────────────────┤
│  Quick Drawing Lookup (Search box)               │
├─────────────────────────────────────────────────┤
│  Vehicle Interface Stats (6 stat cards)          │
│  21 Systems | 168K Wires | 297 Drawings          │
│  254 Equipment | 1.1K Connectors | 56K Pins      │
├─────────────────────┬───────────────────────────┤
│  Wire Distribution  │ Connectors per System      │
│  by System (Pie)    │ (Bar Chart)                │
├─────────────────────┴───────────────────────────┤
│  Car Fleet Overview | Quick Navigation           │
├─────────────────────────────────────────────────┤
│  System Architecture Grid (10 systems)           │
├─────────────────────────────────────────────────┤
│  AI Assistant Search                             │
├─────────────────────────────────────────────────┤
│  Database Status Footer                          │
└─────────────────────────────────────────────────┘
```
