# VCC System Application - Vehicle Control Circuits Explorer

**Project**: KMRCL RS(3R) Metro Vehicle Control Circuits Intelligence System  
**Version**: 2.0  
**Status**: ✅ Production Ready  
**Last Updated**: June 7, 2026  

---

## 📋 Quick Links

- **[Getting Started](#getting-started)** - Setup and installation
- **[Project Structure](#project-structure)** - File organization
- **[Features](#features)** - What the app does
- **[Development](#development)** - Dev workflow
- **[Deployment](#deployment)** - Production deployment
- **[Documentation](#documentation)** - All docs
- **[Troubleshooting](#troubleshooting)** - Common issues

---

## 🎯 Project Overview

The VCC System Application is a comprehensive intelligence platform for exploring and analyzing Vehicle Control Circuits (VCC) in the KMRCL RS(3R) Metro project. It provides:

- **574 Engineering Drawings** with intelligent PDF page mapping
- **19,016 Wire Connections** with complete topology
- **1,605 Connectors** with pin-level details
- **Multi-Agent AI System** for intelligent query processing
- **Real-time Voice Assistant** with Web Speech API
- **Interactive Network Visualization** with GSD topology
- **Professional Troubleshooting Guides** with fault codes

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: 14.x or higher (via Neon/Vercel Postgres)
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone https://github.com/SHASHIYA06/VCC-system-application.git
cd "VCC system application"

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your database credentials

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### Environment Variables

Required in `.env.local`:

```env
# Database (Neon/Vercel Postgres)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# AI APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-..."

# Optional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
VCC system application/
├── src/
│   ├── app/                    # Next.js 16 app directory
│   │   ├── dashboard/          # Main dashboard
│   │   ├── drawings/           # Drawing search
│   │   ├── systems/            # System explorer
│   │   ├── wires/              # Wire harness
│   │   ├── equipment/          # Equipment catalog
│   │   ├── gsd/                # GSD Pi topology
│   │   ├── ai-assistant/       # Intelligence & AI
│   │   ├── troubleshooting/    # Troubleshooting guide
│   │   ├── vcc-reference/      # VCC description
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── layout/             # Sidebar, TopBar
│   │   ├── ui/                 # UI primitives
│   │   ├── voice/              # Voice assistant
│   │   ├── pdf/                # PDF viewer
│   │   └── ...
│   └── lib/                    # Business logic
│       ├── ai/                 # Multi-agent RAG
│       ├── voice/              # Voice integration
│       ├── database/           # Prisma utilities
│       ├── gsd/                # GSD topology
│       └── ...
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── scripts/                    # Utility scripts
└── docs/                       # Documentation (consolidated)
```

---

## ✨ Features

### 1. Dashboard
- Real-time system statistics
- Quick access to all modules
- System health monitoring
- Recent activity feed

### 2. Drawing Search
- Search 574 engineering drawings
- Intelligent PDF page mapping
- Related wires and equipment
- Alphabetic variant support (e.g., 942-58128D, Y4181a)

### 3. Systems Explorer
- 10 major systems (TRAC, BRAKE, DOOR, APS, etc.)
- Hierarchical system tree
- Device and equipment catalog
- System-level topology

### 4. Wire Harness
- 19,016 wire connections
- Wire tracing and path visualization
- Endpoint to pin mapping
- Signal flow analysis

### 5. GSD Pi Topology
- Interactive network visualization
- Real-time topology updates
- Node and edge analysis
- System statistics

### 6. Intelligence & AI
- Multi-agent RAG system
- 5 specialized agents:
  - Drawing Agent
  - Wire Agent
  - System Agent
  - Device Agent
  - Diagnostic Agent
- Natural language queries
- Unified response synthesis

### 7. Troubleshooting
- 6 system categories
- 15+ fault codes with solutions
- Step-by-step resolution guides
- Related drawings and trainlines

### 8. Voice Assistant
- Real-time voice recognition (Web Speech API)
- Voice-to-text transcription
- Text-to-speech synthesis
- Voice-controlled navigation
- AI query via voice

---

## 🛠️ Development

### Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Database operations
npx prisma generate      # Generate Prisma client
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Run migrations
```

### Key Technologies

- **Frontend**: React 19, Next.js 16.2.6 (Turbopack), TypeScript
- **Styling**: Tailwind CSS, Framer Motion, Lucide Icons
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: OpenAI GPT-4, Anthropic Claude, LangChain
- **Voice**: Web Speech API (Browser-native)
- **PDF**: react-pdf, PDF.js
- **Visualization**: ReactFlow, D3.js

### Code Standards

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components
- **Components**: Functional components with hooks
- **Styling**: Tailwind utility classes
- **Imports**: Absolute imports with `@/` prefix

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Setup

1. Configure environment variables in Vercel dashboard
2. Connect GitHub repository for automatic deployments
3. Set build command: `npm run build`
4. Set output directory: `.next`

### Database Setup

```bash
# Run migrations on production database
npx prisma migrate deploy

# Seed data (if needed)
npx tsx scripts/sync-all-drawings.ts
npx tsx scripts/cleanup-orphaned-data.ts
```

---

## 📚 Documentation

### Core Documentation

| Document | Description | Status |
|----------|-------------|--------|
| **[README.md](README.md)** | This file - project overview | ✅ Current |
| **[COMPLETE_STATUS_REPORT.md](COMPLETE_STATUS_REPORT.md)** | Comprehensive implementation status | ✅ Current |
| **[NAVIGATION_UPDATE_COMPLETE.md](NAVIGATION_UPDATE_COMPLETE.md)** | Navigation restructure details | ✅ Current |
| **[IMPLEMENTATION_INSTRUCTIONS.md](IMPLEMENTATION_INSTRUCTIONS.md)** | Step-by-step implementation guide | ✅ Current |
| **[COMPLETE_IMPLEMENTATION_GUIDE.md](COMPLETE_IMPLEMENTATION_GUIDE.md)** | Database setup and PDF sync | ✅ Current |
| **[UI_UX_PHASE_2_ACTION_PLAN.md](UI_UX_PHASE_2_ACTION_PLAN.md)** | UI/UX improvement roadmap | ✅ Current |

### Legacy Documentation

All other .md files in the root directory are legacy documentation from previous development phases. They are kept for historical reference but may contain outdated information.

**Recommended**: Refer to the Core Documentation listed above for current, accurate information.

---

## 🔧 Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors
```bash
# Solution: Regenerate Prisma client
npx prisma generate
rm -rf .next
npm run build
```

**Issue**: Module not found errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

**Issue**: Connection timeout
```bash
# Solution: Check DATABASE_URL and use DIRECT_URL for scripts
echo $DATABASE_URL
DATABASE_URL="$DIRECT_URL" npx prisma studio
```

**Issue**: Missing data
```bash
# Solution: Run sync scripts
npx tsx scripts/sync-all-drawings.ts
npx tsx scripts/cleanup-orphaned-data.ts
npx tsx scripts/verify-data-import.ts
```

### PDF Sync Issues

**Issue**: PDF opens to wrong page
```bash
# Solution: Resync PDF mappings
npx tsx scripts/sync-all-drawings.ts
```

### Voice Assistant Issues

**Issue**: Microphone not working
- **Browser permissions**: Allow microphone access
- **HTTPS**: Voice API requires HTTPS (use localhost for dev)
- **Browser support**: Use Chrome, Edge, or Safari (latest versions)

---

## 📊 Statistics

- **Total Routes**: 104
- **Total Drawings**: 574
- **Total Wires**: 19,016
- **Total Connectors**: 1,605
- **Total Pins**: 11,472+
- **Total Equipment**: 500+
- **Build Time**: ~16 seconds
- **Bundle Size**: <50MB per serverless function

---

## 🤝 Contributing

### Development Process

1. Create feature branch from `main`
2. Make changes following code standards
3. Test locally: `npm run dev` and `npm run build`
4. Commit with descriptive message
5. Push to GitHub
6. Create pull request

### Commit Message Format

```
type: Brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3

Fixes/Closes #issue_number
```

**Types**: feat, fix, docs, style, refactor, test, chore

---

## 📝 License

This project is proprietary software developed for KMRCL RS(3R) Metro project.

---

## 👥 Team

- **Project**: KMRCL RS(3R) Metro
- **Repository**: https://github.com/SHASHIYA06/VCC-system-application.git
- **Platform**: Vercel
- **Database**: Neon PostgreSQL

---

## 🎯 Roadmap

### Completed ✅
- [x] Navigation restructure to left sidebar
- [x] Multi-agent RAG system
- [x] PDF page mapping synchronization
- [x] Voice assistant with Web Speech API
- [x] GSD topology visualization
- [x] Troubleshooting system
- [x] Complete UI/UX with glassmorphism

### In Progress ⏳
- [ ] UI/UX Phase 2 (color refinement)
- [ ] Advanced analytics dashboard
- [ ] Export functionality

### Planned 📅
- [ ] Mobile app (React Native)
- [ ] Offline mode
- [ ] Advanced 3D visualization
- [ ] Predictive maintenance AI

---

## 💡 Tips

### Performance

- Use React.memo() for expensive components
- Lazy load heavy components with dynamic imports
- Optimize images (use Next.js Image component)
- Enable database connection pooling

### Security

- Never commit `.env.local` to Git
- Rotate API keys periodically
- Use environment variables for all secrets
- Enable CORS only for trusted origins

### Best Practices

- Follow TypeScript strict mode
- Write meaningful commit messages
- Document complex logic
- Test on multiple browsers
- Keep dependencies updated

---

**Last Updated**: June 7, 2026  
**Version**: 2.0  
**Status**: ✅ Production Ready  

For questions or issues, create a GitHub issue or contact the development team.
