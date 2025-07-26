# CLAUDE.md - Project Context for AI Assistants

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Current Mission: 4-Month Hackathon (Started Jan 21, 2025)

**IMMEDIATE GOAL**: Demo by tomorrow showing Universal Agent Coordination Platform

## 🏗️ Architecture Documents

### Core Planning Documents
- **[UNIVERSAL-AGENT-COORDINATION-PLATFORM-ARCHITECTURE.md](UNIVERSAL-AGENT-COORDINATION-PLATFORM-ARCHITECTURE.md)** - Complete platform architecture with mermaid diagrams
- **[HACKATHON-4-MONTH-DEPLOYMENT-PLAN.md](HACKATHON-4-MONTH-DEPLOYMENT-PLAN.md)** - Detailed 4-month implementation roadmap
- **[HACKATHON-DEMO-STRATEGY.md](HACKATHON-DEMO-STRATEGY.md)** - Tomorrow's demo strategy leveraging existing components
- **[AGENTLEDGER-KIT-TRANSFORMATION-PLAN.md](AGENTLEDGER-KIT-TRANSFORMATION-PLAN.md)** - Transform AgentLedger into ICPort kit

### Key Discoveries
- **Universal Construction CLI** already exists in `icpxmldb/icport/kits/universal-construction-cli/`
- **Kit Builder** for recursive kit creation in `icpxmldb/icport/kits/kit-builder/`
- **SUIL** (Smart Universal Intelligence Layer) - 22,500x speedup with specialized programs
- **ICPort** - Docker-like deployment system for ICP with kit registry

## 🚀 Project Components

### 1. AgentLedger (This Repo) - Cache/Queue System
- **Purpose**: Distributed cache/queue system for Chrome extension sync
- **Architecture**: 
  - Main Cache Canister (`/backend/main.mo`): 6-node fault-tolerant cache
  - Queue Canister (`/backend/queue.mo`): FIFO processing with retry logic
  - Frontend (`/frontend/`): React/TypeScript with real-time monitoring
- **Key Features**: Event router, orchestrator, agent registry (planned)
- **Status**: Basic functionality working, transforming to ICPort kit

### 2. ICPXMLDB (Submodule) - AI Construction Kit
- **Purpose**: Universal software construction platform
- **Features**: 
  - Universal Schema Framework (ANY FORMAT → 9 LANGUAGES)
  - Character-driven development (5 Danganronpa personalities)
  - PocketFlow TypeScript orchestration
- **Location**: `icpxmldb/` submodule

### 3. SiteBud (Submodule) - Web Meta-Layer
- **Purpose**: Universal language tutor with extension-embedded server
- **HTMZ Framework**: One-line DOM control
- **Location**: `sitebud/` submodule

### 4. ICPort (Inside ICPXMLDB) - Docker for ICP
- **Purpose**: Container orchestration for Internet Computer
- **Features**: 
  - Kit Registry (kit.icport.app - like DockerHub)
  - HAAF Automation Bay (QA-as-Code platform)
  - Docker-familiar CLI commands
- **Location**: `icpxmldb/icport/`

## 📋 Critical Context

### SUIL (Smart Universal Intelligence Layer) Concepts
- **80% Specialized Programs**: 225,000+ ops/sec for routine tasks
- **15% Hybrid Approach**: 50,000 ops/sec with selective LLM enhancement
- **5% Full LLM**: 10 ops/sec for creative/novel tasks
- **Character-Driven**: Personalities affect caching strategies, routing decisions, and task prioritization

### Kit System Architecture
- **ICPortfile**: Like Dockerfile, defines single container deployment
- **ICPortKit.yml**: Like docker-compose.yml, defines complete multi-service kit
- **Recursive Building**: Kits can create other kits from blueprint templates
- **Blueprint System**: Extract patterns from existing kits to create new ones
- **Examples**: See `icpxmldb/icport/examples/basic-hello-world/` for proper syntax

## 🎬 Demo Flow (Tomorrow!)

1. **Problem**: Show slow manual agent coordination (no caching, manual routing)
2. **Solution**: Deploy AgentLedger as ICPort kit with single command
3. **SUIL Magic**: Demonstrate 22,500x speedup with specialized programs
4. **Kit Builder**: Show recursive kit creation (AgentLedger → IoT Agent Kit transformation)
5. **Character System**: Switch between Kyoko/Chihiro/Byakuya personalities affecting cache behavior

## Development Commands

### Internet Computer Development
```bash
dfx start --clean           # Start local IC replica
dfx deploy                  # Deploy all canisters
dfx deploy backend          # Deploy only backend canister
dfx deploy queue           # Deploy only queue canister
dfx canister call backend <method> '(<args>)'  # Call canister methods
```

### Frontend Development
```bash
cd frontend                 # IMPORTANT: Always navigate to frontend directory first
npm install                 # Install dependencies
npm run dev                # Start development server (http://localhost:3000)
npm run build              # Build for production (uses Vite)
npm run lint               # Run ESLint
npm run typecheck          # Run TypeScript type checking

# Testing Commands
npm run test:direct:auth --verbose  # Test authentication system
npm run test:browser       # Browser-based testing
npm run test:run-tests     # Playwright UI automation test
```

### Kit Development Commands
```bash
# Transform AgentLedger to Kit
cd icpxmldb/icport/kits/agentledger
icport kit build .
icport kit validate agentledger

# Test Universal Construction CLI
cd icpxmldb/icport/kits/universal-construction-cli
./bin/universal-construct --help

# Run Kit Builder Demo
cd icpxmldb/icport/kits/kit-builder
./demo-recursive-kit-creation.sh
```

## 🚨 Current Status & Tasks

### ✅ Completed
- AgentLedger basic authentication working
- Kit directory structure created (`icpxmldb/icport/kits/agentledger/`)
- ICPortKit.yml and ICPortfile templates created
- Architecture documents written

### 🚧 In Progress
1. **Fix Frontend Signature Verification** - Chrome extension showing auth errors
2. **Complete Kit Transformation** - Move AgentLedger code to kit structure
3. **Test Universal Construction CLI** - Verify schema processing works
4. **Prepare Kit Builder Demo** - Healthcare IoT from AgentLedger blueprint

### ⏳ Pending
- Create unified dashboard showing all 4 projects
- Set up SUIL performance visualization
- Test character-driven kit building
- Practice 5-minute pitch

## 💡 Key Implementation Details

### Cache Operations
- **set(key: Text, value: Text)**: Store with replication across nodes
- **get(key: Text)**: Retrieve from primary or replica node
- **deleteEntry(key: Text)**: Remove from all nodes
- **SUIL Enhancement**: Pattern-based caching with character influence

### Node Management
- 6 simulated nodes for fault tolerance
- Automatic failure detection and recovery
- Data redistribution on node failure
- Character personalities affect recovery strategies

### Queue Processing
- FIFO with configurable batch sizes
- Status tracking: queued → processing → completed/failed
- Retry logic with exponential backoff
- SUIL can predict queue patterns for optimization

## 🏆 Winning Statement

"We've built the world's first Universal Agent Coordination Platform where AI agents, human developers, and software patterns collaborate to create software that creates software. With 22,500x performance improvements and character-driven intelligence, we're not just changing how software is built - we're enabling software to evolve itself."

## 📝 Notes for AI Assistants

- **Focus on the demo**: Everything should support tomorrow's hackathon presentation
- **Use existing components**: Don't rebuild what's already working
- **Emphasize SUIL**: The 22,500x speedup is our killer feature
- **Show recursion**: Kit Builder creating kits is the magic moment
- **Character personalities**: Make them visible and impactful in the demo
- **Test incrementally**: Get each piece working before moving to the next

## 🔗 Related Files

- Universal Schema Framework docs: `icpxmldb/docs/`
- SUIL research: `icpxmldb/docs/ADVANCED-RESEARCH-V3-SMART-UNIVERSAL-INTELLIGENCE-LAYER.md`
- Kit Builder docs: `icpxmldb/icport/kits/kit-builder/README.md`
- Character profiles: `icpxmldb/.character-profiles/`
- ICPort examples: `icpxmldb/icport/examples/`

---

**Last Updated**: January 21, 2025  
**Hackathon Deadline**: Demo tomorrow!  
**Current Focus**: Transform AgentLedger into deployable ICPort kit with SUIL integration