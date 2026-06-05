# GSD Pi Integration - VCC System Application

This directory contains the **GSD Pi project workspace** for the VCC System Application. GSD Pi is a local-first coding agent that helps with planning, implementing, verifying, and tracking project work from the command line.

## 📁 Directory Structure

```
.gsd/
├── README.md                          # This file
├── config.json                        # GSD Pi configuration
├── project/                           # Project metadata (version controlled)
│   ├── REQUIREMENTS.md               # Project requirements
│   ├── DECISIONS.md                  # Architecture decisions
│   ├── WORKFLOW.md                   # Development workflow
│   ├── STATUS.md                     # Current status
│   └── TASKS.md                      # Task manifest
├── sessions/                         # Session records (local only, not versioned)
│   └── *.md                          # Session logs
└── agent/                            # Agent state (local only)
    ├── managed-resources.json        # Resource tracking
    └── cache/                        # Temporary cache

```

## 🚀 Getting Started with GSD Pi

### 1. Install GSD Pi (if not already installed)

```bash
# Using npx (recommended)
npx @opengsd/gsd-pi@latest

# Or install globally
npm install -g @opengsd/gsd-pi@latest
```

### 2. Verify Installation

```bash
gsd --version
command -v gsd
```

### 3. Start a GSD Session

From the project root directory:

```bash
# Start interactive GSD session
gsd

# Inside GSD, you'll see the prompt:
# gsd> 

# Run commands:
gsd> /gsd status                    # Show session status
gsd> /gsd plan "Task description"   # Create a plan
gsd> /gsd auto                      # Run autonomous mode
gsd> /gsd quick "Quick task"        # Run quick task
gsd> exit                           # Exit session
```

## 📋 Project Files

### config.json
The main GSD Pi configuration file. Contains:
- Project metadata (name, description, root path)
- Model provider settings (Anthropic Claude default)
- Git configuration (worktree settings)
- Feature flags (autonomous mode, tracking)

**Edit this file to:**
- Change AI provider
- Adjust model preferences
- Configure git behavior

### project/REQUIREMENTS.md
Complete project requirements including:
- Project objectives
- Key features
- Technical requirements
- Milestones and success criteria
- Dependencies and constraints

**Reference this when:**
- Planning new features
- Understanding project scope
- Reviewing requirements
- Planning sprints

### project/DECISIONS.md
All architectural decisions made for the project:
- Framework choice (Next.js)
- Database choice (PostgreSQL)
- Build system (Turbopack)
- API architecture
- And 8 more decisions

**Review this when:**
- Making new architectural decisions
- Understanding design rationale
- Onboarding new team members
- Planning major changes

### project/WORKFLOW.md
Development workflow and best practices:
- Development phases (Planning, Implementation, Verification, Tracking)
- GSD Pi commands reference
- Sprint planning template
- Slices and task structure
- Git workflow patterns

**Use this to:**
- Start new work
- Understand development process
- Plan sprints
- Create pull requests

### project/STATUS.md
Current project status and metrics:
- Overall status (Production Ready)
- Module status report
- Code quality metrics
- Performance metrics
- Risk assessment
- Recommendations

**Check this for:**
- Project health
- Current blockers
- Performance baseline
- Next priorities

### project/TASKS.md (to be created)
Task manifest with all current work items:
- Active tasks
- Completed tasks
- Planned tasks
- Task dependencies
- Owner assignments

**Create/Update when:**
- Adding new tasks
- Completing work
- Planning sprints

## 🛠️ Common GSD Pi Commands

### Session Commands
```bash
gsd                           # Start interactive session
gsd config                    # Configure GSD for project
gsd --version                 # Show GSD version
gsd upgrade                   # Upgrade GSD Pi
```

### In-Session Commands
```bash
/gsd status                   # Show session status
/gsd usage                    # Show token usage
/gsd context                  # Show context state
/gsd plan "description"       # Create implementation plan
/gsd auto                     # Run autonomous work mode
/gsd quick "task"            # Run quick single task
/gsd verify                   # Verify implementation
/gsd report                   # Generate status report
```

### Git-Related
```bash
/gsd git status              # Check worktree status
/gsd git commit              # Create commit
/gsd git pr                  # Create pull request
/gsd git merge               # Merge changes
```

## 📚 Workflow: From Plan to Production

### 1. Planning Phase
```bash
gsd
gsd> /gsd plan "Implement PDF mapping enhancement"
# GSD creates:
# - Milestones
# - Slices (multi-day work units)
# - Tasks (4-hour units)
```

### 2. Implementation Phase
```bash
gsd> /gsd auto
# GSD:
# - Creates feature worktree
# - Implements changes
# - Runs verification
# - Creates commit
```

### 3. Verification Phase
```bash
gsd> /gsd verify
# GSD checks:
# - Build passes (npm run build)
# - Tests pass (npm test)
# - No regressions
# - Code quality
```

### 4. Tracking Phase
```bash
gsd> /gsd status
# Shows:
# - Task completion %
# - Active work items
# - Blockers
# - Next steps
```

## 🔄 Git Worktree Workflow

GSD Pi uses Git worktrees to isolate feature work:

```
Main checkout: main (production)
├── Feature 1 worktree: feature-drawing-mapping-XXXX
├── Feature 2 worktree: feature-pdf-viewer-XXXX
└── Feature 3 worktree: feature-ai-agents-XXXX
```

**Benefits:**
- Work isolated from main
- Main always deployable
- Parallel development possible
- Easy to review before merge

## 📊 Session Types

### Guided Session (Default)
```bash
gsd
# Interactive planning and implementation
# GSD guides through phases
# Good for: New features, complex tasks
```

### Autonomous Mode
```bash
gsd> /gsd auto
# GSD plans and implements without waiting
# Uses configuration and task descriptions
# Good for: Well-defined tasks, batch work
```

### Quick Mode
```bash
gsd> /gsd quick "Add new field to schema"
# Fast implementation for simple tasks
# Skips extensive planning
# Good for: Bug fixes, small improvements
```

## 🎯 Sprint Planning with GSD Pi

### 1. Create Sprint Plan
```bash
gsd
gsd> /gsd plan "Sprint 3: Feature Enhancement"
```

### 2. Add Milestones
```bash
gsd> /gsd milestone "M3.1: Performance"
gsd> /gsd milestone "M3.2: Scale"
gsd> /gsd milestone "M3.3: Monitoring"
```

### 3. Add Slices (1-2 day work)
```bash
gsd> /gsd slice "Query optimization"
gsd> /gsd slice "Add caching layer"
gsd> /gsd slice "Implement monitoring"
```

### 4. Add Tasks (4-hour work)
```bash
gsd> /gsd task "Profile database queries"
gsd> /gsd task "Add missing indexes"
gsd> /gsd task "Optimize joins"
```

### 5. Run Autonomous Work
```bash
gsd> /gsd auto
# GSD implements task by task
# Reports on each completion
# Tracks time and artifacts
```

## 📖 Commit Message Format

GSD Pi uses special commit format:

```
gsd: <type>(<scope>): <subject>

<body>

<footer>
```

**Example:**
```
gsd: feat(db): Add performance indexes to Drawing table

Added 5 B-tree indexes to improve query performance:
- drawing_no index for lookups
- system_code for filtering
- created_at for sorting
- sourceFileId for joins
- verified status for searches

Reduces query time by 60% for common searches.

Fixes: PERF-123
Co-authored-by: GSD Pi Agent
```

## 🔍 Monitoring Progress

### Daily Status
```bash
gsd
gsd> /gsd status
# Shows current progress across all tasks
# Highlights blockers
# Suggests next actions
```

### Weekly Summary
```bash
gsd> /gsd report
# Generates comprehensive report
# Includes metrics and achievements
# Lists artifacts created
# Shows velocity trends
```

### Project Health
Check `.gsd/project/STATUS.md`:
- Overall status
- Module completion
- Code quality metrics
- Performance baselines
- Risk assessment

## 🚨 Troubleshooting

### GSD Pi Not Found
```bash
# Reinstall
npx @opengsd/gsd-pi@latest

# Or use pnpm
pnpm dlx @opengsd/gsd-pi@latest
```

### Configuration Issues
```bash
# Reset configuration
rm ~/.gsd/config.json
gsd config  # Re-run setup
```

### Git Worktree Problems
```bash
# Clean up old worktrees
gsd /gsd git clean

# Check worktree status
git worktree list
```

### Session Corruption
```bash
# Backup and reset
mv .gsd/sessions .gsd/sessions.bak
gsd  # Start fresh session
```

## 📞 Getting Help

### GSD Pi Documentation
- Official docs: https://opengsd.github.io/gsd-pi/
- GitHub: https://github.com/open-gsd/gsd-pi
- Changelog: See CHANGELOG.md in GSD Pi repo

### VCC Project References
- Requirements: `.gsd/project/REQUIREMENTS.md`
- Decisions: `.gsd/project/DECISIONS.md`
- Workflow: `.gsd/project/WORKFLOW.md`
- Status: `.gsd/project/STATUS.md`

### Quick Commands
```bash
gsd help
gsd config --help
/gsd help              # Inside GSD session
```

## 🔄 Integration with GitHub

GSD Pi integrates with GitHub for:
- Creating feature branches
- Generating pull requests
- Tracking commits
- Merging completed work

**Setup:**
1. Ensure GitHub CLI (`gh`) is installed
2. Authenticate: `gh auth login`
3. GSD Pi will auto-detect and use authentication

## 📝 Next Steps

1. **Install GSD Pi**
   ```bash
   npx @opengsd/gsd-pi@latest
   ```

2. **Start First Session**
   ```bash
   gsd
   ```

3. **Review Project Files**
   - Read REQUIREMENTS.md
   - Review DECISIONS.md
   - Check current STATUS.md

4. **Plan First Sprint**
   ```bash
   gsd> /gsd plan "Sprint 3: Enhancement"
   ```

5. **Run Autonomous Mode**
   ```bash
   gsd> /gsd auto
   ```

## 🎓 Learning Resources

### For New Users
- Start with WORKFLOW.md
- Run `gsd config` first
- Try `/gsd quick` for simple tasks
- Review generated commits

### For Advanced Users
- Read DECISIONS.md for architecture
- Customize config.json
- Set up custom tools
- Create project-specific commands

### For Project Leads
- Check STATUS.md regularly
- Review velocity trends
- Monitor tech debt
- Plan milestones

---

**GSD Pi Version**: 1.0.0+  
**Last Updated**: June 2, 2026  
**Project Status**: ✅ PRODUCTION READY  
**Integration Status**: ✅ COMPLETE

Ready to start? Run: `gsd`
