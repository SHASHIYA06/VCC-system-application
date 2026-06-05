# VCC System Application - Architecture Decisions

## Decision 1: Framework Choice - Next.js 16.2.6
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Need full-stack React application
- Want server-side rendering and static generation
- Require fast build times

### Decision
Use **Next.js 16.2.6 with Turbopack** as the primary framework.

### Rationale
- Turbopack provides 5-10x faster builds than Webpack
- Full React 19 support
- Built-in API routes eliminate need for separate backend
- Static pre-rendering for performance
- PostgreSQL integration via Prisma
- Automatic code splitting

### Consequences
- TypeScript strict mode for type safety
- ESLint configuration required
- Build times ~15 seconds for full build
- Incremental builds ~5 seconds

### Alternatives Considered
- Remix: Would work, but Next.js more mature
- Nuxt: Vue-based, not React
- Vite: No server-side rendering support

---

## Decision 2: Database - PostgreSQL + Prisma
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Need relational data model
- 374+ drawings with complex relationships
- 48 interconnected data models

### Decision
Use **PostgreSQL with Prisma ORM**.

### Rationale
- Prisma provides type-safe queries
- PostgreSQL supports complex relationships
- Neon cloud hosting for managed service
- Migration system for schema changes
- Automatic code generation from schema

### Consequences
- Schema-first development approach
- Migration files required for changes
- Prisma Client auto-generation on build
- pg package required for PostgreSQL

### Alternatives Considered
- MongoDB: Would lose type safety, not ideal for relational data
- SQLite: Not suitable for production
- GraphQL: Added complexity, REST simpler for this project

---

## Decision 3: Build System - Turbopack
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Build times critical for development
- Team wants faster iteration
- Webpack too slow for large project

### Decision
Use **Turbopack** (default in Next.js 16.2.6).

### Rationale
- 5-10x faster than Webpack
- Rust-based for performance
- Built into Next.js
- No configuration needed
- Incremental builds

### Consequences
- Must keep build configuration minimal
- Some Webpack plugins won't work
- Faster feedback loop for developers

### Alternatives Considered
- Webpack: Too slow
- Vite: No Next.js integration
- esbuild: No full bundler support

---

## Decision 4: API Architecture - REST + OpenAI Optional
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Need to serve 374+ drawings
- Want optional AI features
- Must work without OPENAI_API_KEY

### Decision
Use **REST APIs with optional OpenAI integration** through lazy-loading.

### Rationale
- REST simpler than GraphQL for this use case
- Lazy-loading OpenAI prevents build-time failures
- Multi-agent system for comprehensive analysis
- Each agent specialized for different queries
- Fallback behavior when AI unavailable

### Consequences
- OpenAI client only instantiated when used
- Build succeeds without API key
- AI features optional, not required
- 5 specialized agents for better analysis

### Alternatives Considered
- GraphQL: Added complexity
- gRPC: Overkill for this project
- Mandatory OpenAI: Would fail without key

---

## Decision 5: PDF Mapping - Database + Inference Fallback
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Drawing 942-38409 must map to page 15
- Need to verify mappings
- Some PDFs have variable page counts

### Decision
Use **DrawingPageMapping database model** with **inference fallback**.

### Rationale
- Database stores verified mappings
- Fallback algorithm infers page from drawing number
- Supports manual correction later
- Tracks confidence and verification status
- Scalable to 1000s of drawings

### Consequences
- Need to seed initial mappings
- Verified flag indicates confidence
- Sources tracked (database vs inferred)
- Migration required for new model

### Alternatives Considered
- Manual CSV import: Less flexible
- Full OCR: Expensive and error-prone
- No tracking: Can't verify accuracy

---

## Decision 6: GSD Topology - React Flow + Interactive Graph
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Need to visualize system relationships
- 50+ systems with complex connections
- Users want interactive exploration

### Decision
Use **React Flow for graph visualization**.

### Rationale
- React Flow handles large graphs efficiently
- Built-in layout algorithms
- Interactive pan/zoom
- Responsive to screen size
- MiniMap for navigation

### Consequences
- Requires specific data format (nodes + edges)
- Layout algorithm impacts visualization
- Performance considerations for 100+ nodes

### Alternatives Considered
- D3.js: More powerful but complex
- Three.js: Overkill for 2D graph
- Canvas: Manual rendering required

---

## Decision 7: 3D UI Components - Glassmorphism + Gradients
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Dashboard needs attractive design
- Want modern UI without heavy libraries
- Responsive across all devices

### Decision
Use **Glassmorphism with Tailwind CSS gradients** for 3D effect.

### Rationale
- Pure CSS, no heavy libraries
- Glassmorphism creates depth perception
- Gradients add visual interest
- Responsive by default
- Fast rendering

### Consequences
- Requires careful color selection
- Accessibility needs attention (contrast)
- Browsers must support backdrop-filter

### Alternatives Considered
- Three.js: Overkill, slow
- Canvas: Manual rendering required
- SVG: Not suitable for full UI

---

## Decision 8: Build Blocker Fix - Async Lazy-Loading
**Date**: June 2, 2026  
**Status**: ✅ IMPLEMENTED

### Context
- Build failing with "Missing credentials" error
- OpenAI import at module level
- 15-day blocker

### Decision
Use **async lazy-loading with dynamic import** for OpenAI.

### Rationale
- Prevents module evaluation at build time
- API key only needed at runtime
- Build succeeds without key
- AI features activate when key available

### Consequences
- getOpenAIClient() must be async
- All callers must use await
- Cleaner separation of concerns

### Alternatives Considered
- Static try/catch: Doesn't prevent module loading
- Conditional exports: Complex and fragile
- Separate package: Overkill

---

## Decision 9: Duplicate Function Removal
**Date**: June 2, 2026  
**Status**: ✅ IMPLEMENTED

### Context
- PDF mapping route has duplicate function
- TypeScript error "function defined multiple times"
- Line 376 duplicate of line 157

### Decision
**Remove duplicate**, keep first version with correct mappings.

### Rationale
- First definition has correct 942-38409 → 15 mapping
- Second definition missing critical mapping
- Removes 216 lines of duplicate code
- Simpler maintenance

### Consequences
- Single source of truth for page mapping
- Cleaner codebase
- TypeScript error resolved

### Alternatives Considered
- Keep both: Leaves error
- Merge: Identical functions
- Refactor: Unnecessary given identical code

---

## Decision 10: Deployment - Vercel with Auto-Deploy
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Need reliable deployment
- Team small, minimal ops overhead
- GitHub integration available

### Decision
Use **Vercel with automatic deployment** on main branch push.

### Rationale
- Zero-config deployment
- Automatic builds on push
- Scales automatically
- PostgreSQL integration available
- Built-in monitoring

### Consequences
- Deployment ~5 minutes after push
- All commits go live (use pull requests for review)
- Environment variables managed in Vercel

### Alternatives Considered
- AWS: More operational overhead
- Heroku: Deprecated dyno system
- Self-hosted: Too much infrastructure

---

## Decision 11: Documentation - Markdown in .gsd/
**Date**: June 2, 2026  
**Status**: ✅ DECIDED

### Context
- Need to track decisions and requirements
- Team needs unified reference
- Multiple documentation types

### Decision
Store all documentation in **`.gsd/project/` directory** as Markdown.

### Rationale
- Version controlled with code
- Searchable and readable
- Part of project state
- GSD Pi uses this format

### Consequences
- Documentation lives with code
- Updates require git commits
- Markdown-based (not wiki)

### Alternatives Considered
- Confluence: Separate from code
- GitHub Wiki: Harder to track changes
- Google Docs: Not version controlled

---

## Decision 12: Authentication - Simple API Key System
**Date**: June 2, 2026  
**Status**: ✅ IMPLEMENTED

### Context
- Need basic API protection
- Don't want complex OAuth setup
- Team small and trusted

### Decision
Use **simple API key system** for endpoints.

### Rationale
- Straightforward implementation
- Sufficient for team size
- Can upgrade to OAuth later
- Environment variable based

### Consequences
- Keys in .env.local
- Rate limiting important
- No session management needed

### Alternatives Considered
- OAuth: Overkill for team
- JWT: More complex than needed
- No auth: Too open

---

## Active Decisions Pending

### Pending 1: OPENAI_API_KEY Setup
- Status: Not yet configured
- Impact: AI features unavailable without key
- Next Step: Generate API key when needed

### Pending 2: Production Database Backup Strategy
- Status: Not configured
- Impact: Data loss risk without backups
- Next Step: Plan and implement backup strategy

### Pending 3: Monitoring & Alerting
- Status: Basic logging only
- Impact: Issues may go unnoticed
- Next Step: Set up error tracking and monitoring

---

## Decision Log

| #  | Title | Date | Status |
|----|-------|------|--------|
| 1  | Framework: Next.js 16.2.6 | 6/2/26 | ✅ Active |
| 2  | Database: PostgreSQL + Prisma | 6/2/26 | ✅ Active |
| 3  | Build System: Turbopack | 6/2/26 | ✅ Active |
| 4  | API: REST + OpenAI Optional | 6/2/26 | ✅ Active |
| 5  | PDF Mapping: DB + Inference | 6/2/26 | ✅ Active |
| 6  | Visualization: React Flow | 6/2/26 | ✅ Active |
| 7  | UI: Glassmorphism + Tailwind | 6/2/26 | ✅ Active |
| 8  | Fix Build: Async Lazy-Load | 6/2/26 | ✅ Active |
| 9  | Fix Duplicate: Remove Function | 6/2/26 | ✅ Active |
| 10 | Deployment: Vercel Auto-Deploy | 6/2/26 | ✅ Active |
| 11 | Documentation: Markdown in .gsd/ | 6/2/26 | ✅ Active |
| 12 | Auth: Simple API Key System | 6/2/26 | ✅ Active |

---

**Last Updated**: June 2, 2026  
**Next Review**: June 30, 2026  
**Owner**: Development Team
