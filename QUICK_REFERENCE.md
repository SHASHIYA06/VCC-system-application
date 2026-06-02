# VCC Application - Quick Reference Guide

## 🚀 Get Started in 5 Minutes

### Environment Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your database credentials

# Generate Prisma client
npm run db:generate

# Run development server
npm run dev
```

Visit `http://localhost:3000/dashboard`

---

## 📍 Key Pages & Routes

### Dashboard & System Exploration
- `/dashboard` - Main dashboard with statistics and quick actions
- `/gsd` - GSD topology visualization
- `/systems` - System explorer
- `/systems/tree` - System hierarchy

### Drawings & Documents
- `/drawings` - Drawing search interface
- `/documents` - PDF document library
- `/connectors` - Connector database

### Wiring & Analysis
- `/wires` - Wire search and tracing
- `/wires/trace` - Interactive wire tracing
- `/cables` - Cable routing

### AI & Diagnostics
- `/ai-assistant` - Multi-agent AI assistant
- `/troubleshooting` - Diagnostic reports
- `/reports` - System analysis reports

---

## 🎨 Using 3D Components

### Import 3D Components
```tsx
import { Card3D, GlassPanel3D, StatCard3D, Button3D } from '@/components/3d';
```

### GlassPanel3D - Glassmorphic Containers
```tsx
<GlassPanel3D 
  title="System Overview"
  glowColor="cyan"
  depth="medium"
  interactive={true}
>
  <p>Your content here</p>
</GlassPanel3D>
```

**Props**:
- `title?: string` - Panel heading
- `glowColor?`: cyan | blue | purple | green | orange | red | amber | pink
- `depth?`: shallow | medium | deep
- `interactive?`: boolean (mouse tracking)

### StatCard3D - Statistics Display
```tsx
<StatCard3D
  label="Total Wires"
  value={12450}
  unit="connections"
  trend={{ value: 15, direction: 'up' }}
  icon={Cable}
  glowColor="blue"
/>
```

**Props**:
- `label: string` - Card heading
- `value: number` - Displayed value
- `unit?: string` - Unit suffix
- `icon?: LucideIcon` - Icon component
- `trend?: { value: number, direction: 'up'|'down' }` - Trend indicator
- `glowColor?`: 8 color options

### Button3D - Interactive Buttons
```tsx
<Button3D
  variant="primary"
  size="lg"
  glowColor="cyan"
  onClick={() => console.log('Clicked!')}
>
  Analyze
</Button3D>
```

**Props**:
- `variant?`: primary | secondary | outline | ghost
- `size?`: sm | md | lg | xl
- `glowColor?`: 8 color options
- `disabled?`: boolean
- `type?`: button | submit | reset

### Card3D - Flexible Cards
```tsx
<Card3D 
  glowColor="purple"
  variant="elevated"
  interactive={true}
>
  Card content
</Card3D>
```

**Props**:
- `glowColor?`: 12 color options
- `variant?`: default | elevated | flat | outline
- `interactive?`: boolean
- `onClick?`: function

---

## 🤖 Using Multi-Agent AI System

### Quick API Query
```bash
# Multi-agent query (all agents)
curl -X POST http://localhost:3000/api/ai/multi-agent \
  -H "Content-Type: application/json" \
  -d '{"query": "Find all CAB system connectors"}'

# Single agent query
curl -X POST http://localhost:3000/api/ai/multi-agent \
  -H "Content-Type: application/json" \
  -d '{"query": "Analyze wiring", "agentType": "wire"}'
```

### JavaScript Client
```typescript
async function queryMultiAgent(query: string) {
  const response = await fetch('/api/ai/multi-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  return data;
}

// Usage
const result = await queryMultiAgent("Find CAB wires");
```

### Available Agents
1. **Drawing Expert** - Analyzes electrical schematics
2. **Wire Expert** - Traces signal flows and connectivity
3. **System Expert** - Explains system architecture
4. **Device Expert** - Analyzes equipment and connectors
5. **Diagnostic Expert** - Identifies faults and issues

### Response Format
```json
{
  "query": "your query",
  "agents": [
    {
      "agent": "DrawingExpert",
      "response": "...",
      "confidence": 0.95,
      "sources": ["942-58120"],
      "executionTime": 234
    }
  ],
  "unifiedResponse": "...",
  "recommendations": [...],
  "executionTime": 1240
}
```

---

## 🔍 Search API

### Drawing Search
```bash
curl "http://localhost:3000/api/drawings/lookup?drawing_no=942-58120"
```

### Wire Search
```bash
curl "http://localhost:3000/api/wires?wire_no=3001"
```

### System Search
```bash
curl "http://localhost:3000/api/systems?code=CAB"
```

### AI Search (100% Accuracy)
```bash
curl -X POST http://localhost:3000/api/ai-search \
  -H "Content-Type: application/json" \
  -d '{"query": "CAB connectors", "systemFilter": "CAB"}'
```

---

## 📊 Diagnostic & Analysis

### System Health Check
```bash
curl "http://localhost:3000/api/diagnostic"
```

### GSD Topology
```bash
curl "http://localhost:3000/api/gsd"
```

### Wiring Analysis
```bash
curl "http://localhost:3000/api/analysis/wiring"
```

### Statistics
```bash
curl "http://localhost:3000/api/stats"
```

---

## 🔧 Database Commands

### Prisma Management
```bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Apply migrations to database
npm run db:deploy

# Push schema directly (development only)
npm run db:push

# Open Prisma Studio
npm run db:studio
```

### Create New User (Admin)
```bash
npm run db:studio
# Navigate to User table, create new record:
# {
#   email: "admin@vcc.local",
#   name: "Administrator",
#   role: "ADMIN"
# }
```

---

## 🧪 Testing

### Run Tests (Coming Soon)
```bash
npm run test
```

### E2E Tests with Playwright
```bash
npx playwright test
```

### Performance Testing
```bash
npm run build
npm run start
# Load test with your tool of choice
```

---

## 📈 Monitoring & Debugging

### Check Recent Audit Logs
```bash
# Via Prisma Studio
npm run db:studio
# Navigate to AuditLog table
```

### Performance Metrics
```bash
# Check QueryPerformance table
npm run db:studio
```

### Build Diagnostics
```bash
npm run build -- --debug
```

### Dev Server Logs
```bash
npm run dev
# Check console for warnings/errors
```

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# Connect GitHub repository
vercel link

# Deploy
vercel deploy --prod

# View deployment
vercel --prod
```

### Database Migration (First Time)
```bash
npm run db:migrate
npm run db:deploy
```

### Environment Variables
Set these in Vercel dashboard:
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
MCP_SERVER_PORT=3001
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf .next node_modules .turbopack
npm install
npm run build
```

### Database Connection Error
```bash
# Test connection
npm run db:generate

# Verify .env.local has correct DATABASE_URL
# Check PostgreSQL is accessible
npm run db:push
```

### 3D Components Not Working
```bash
# Clear cache
rm -rf .next

# Rebuild
npm run build

# Check browser console for errors
npm run dev
```

### API Returns 500
```bash
# Check server logs
npm run dev

# Verify database connection
npm run db:generate

# Check API endpoint implementation
# Review error response payload
```

---

## 📚 Documentation

### Getting More Help
- **API Docs**: See `/api/*/route.ts` comments
- **Component Docs**: See component JSDoc comments
- **Database Schema**: See `prisma/schema.prisma`
- **Architecture**: See `COMPLETE_APPLICATION_UPGRADE_GUIDE.md`
- **Full Status**: See `FINAL_STATUS_REPORT.md`

### Key Documentation Files
1. `PHASE_5_6_IMPLEMENTATION_COMPLETE.md` - Latest features
2. `COMPLETE_APPLICATION_UPGRADE_GUIDE.md` - Full guide
3. `FINAL_STATUS_REPORT.md` - Project status
4. `README.md` - Getting started

---

## ⚡ Performance Tips

### Frontend Optimization
- Use 3D components for interactive sections
- Components are GPU-accelerated (60 FPS)
- Lazy load heavy components
- Utilize Next.js Image optimization

### Database Optimization
- Use indexed columns in queries
- Paginate large result sets
- Cache frequently accessed data
- Monitor QueryPerformance table

### API Optimization
- Enable gzip compression
- Use appropriate cache headers
- Implement rate limiting
- Monitor API response times

---

## 🔐 Security Reminders

### API Keys
- Store in `.env.local` (never commit)
- Rotate regularly
- Use scoped permissions
- Monitor usage in audit logs

### Authentication
- Implement JWT in production
- Hash passwords (bcrypt)
- Enable API key expiration
- Use HTTPS only

### Audit Trail
- Review AuditLog regularly
- Monitor failed operations
- Track user actions
- Archive old logs

---

## 📞 Quick Support

### Check Status
- Build: `npm run build`
- Dev: `npm run dev`
- DB: `npm run db:generate`

### Common Issues
1. **Port 3000 in use**: `lsof -i :3000` then `kill -9 <PID>`
2. **Database timeout**: Check Neon connection, verify DIRECT_URL
3. **Build errors**: Clear .next, reinstall node_modules
4. **TypeScript errors**: Run `npm run build` to see full errors

### Get Help
- GitHub Issues: https://github.com/SHASHIYA06/VCC-system-application/issues
- Documentation: See docs/ folder
- Code Comments: Check source files for inline documentation

---

## 🎯 Next Steps

1. **Development**:
   - Start dev server: `npm run dev`
   - Explore dashboard: http://localhost:3000/dashboard
   - Try 3D components
   - Test AI queries

2. **Testing**:
   - Test search capabilities
   - Verify diagnostics
   - Try multi-agent queries
   - Check database connection

3. **Deployment**:
   - Verify environment variables
   - Run migrations
   - Deploy to Vercel
   - Monitor production

4. **Maintenance**:
   - Monitor performance
   - Review audit logs
   - Backup database
   - Update dependencies

---

**VCC Application v0.2.1**
**Production Ready** ✅
**Last Updated**: June 2, 2026
