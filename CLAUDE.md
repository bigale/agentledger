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

### 1. AgentLedger (This Repo) - Universal Agent Coordination Platform
- **Purpose**: Multi-kit platform for agent coordination with AgentLedgerMesh (ALM)
- **Kit Architecture**: 
  - **Foundation Layer**: Core infrastructure kits (cache+queue, events, registry)
  - **Intelligence Layer**: SUIL + Character System, ALM coordination
  - **Application Layer**: Chrome extension, web dashboard
  - **Meta Kit**: Complete platform bundle for one-command deployment
- **Key Features**: ALM mesh coordination, SUIL intelligence, character-driven agents
- **Status**: Transforming to modular kit ecosystem

### 2. ICPXMLDB (Submodule) - AI Construction Kit
- **Purpose**: Universal software construction platform
- **Features**: 
  - Universal Schema Framework (ANY FORMAT → 9 LANGUAGES)
  - Character-driven development (5 Danganronpa personalities)
  - PocketFlow TypeScript orchestration
- **Location**: `icpxmldb/` submodule

### 3. SiteBud (Submodule) - Browser Extension Ecosystem
- **Purpose**: Independent modular browser extension platform
- **Kit Structure**: Core system, dev environment, marketplace, extensions
- **HTMZ Framework**: One-line DOM control with AI-assisted development
- **Location**: `sitebud/` submodule
- **Status**: Designed as separate kit ecosystem (sitebud-core-kit, sitebud-dev-kit, etc.)

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
- **Kit Granularity**: Organized by coupling (tightly coupled = bundled, loosely coupled = separate)
- **Examples**: See `icpxmldb/icport/examples/basic-hello-world/` for proper syntax

## 🏗️ AgentLedger Kit Architecture

```mermaid
graph TB
    subgraph "Foundation Layer - Infrastructure"
        ALCore["🗄️ agentledger-core-kit<br/>(Cache + Queue bundled)"]
        ALEvents["📡 agentledger-events-kit<br/>(Event Router + pub-sub)"]
        ALRegistry["📋 agentledger-registry-kit<br/>(Agent discovery + capabilities)"]
    end
    
    subgraph "Intelligence Layer - Enhanced Processing"
        ALSUIL["🧠 agentledger-suil-kit<br/>(SUIL + Character System)"]
        ALMesh["🕸️ agentledger-mesh-kit<br/>(ALM coordination layer)"]
    end
    
    subgraph "Application Layer - User Experience"
        ALChrome["🌐 agentledger-chrome-kit<br/>(Browser integration)"]
        ALDash["📊 agentledger-dashboard-kit<br/>(Web monitoring)"]
    end
    
    subgraph "Meta Kit - Complete Platform"
        ALPlatform["🚀 agentledger-platform-kit<br/>(Bundles all for one-command deploy)"]
    end
    
    subgraph "SiteBud Ecosystem - Independent"
        SBCore["🌱 sitebud-core-kit<br/>(Stem + module system)"]
        SBDev["🌳 sitebud-dev-kit<br/>(Grove IDE + AI Pal)"]
        SBMarket["🌻 sitebud-marketplace-kit<br/>(Garden + monetization)"]
        SBExt["🌾 sitebud-extension-kit<br/>(Extension frameworks)"]
    end
    
    ALPlatform --> ALCore
    ALPlatform --> ALEvents
    ALPlatform --> ALRegistry
    ALPlatform --> ALSUIL
    ALPlatform --> ALMesh
    ALPlatform --> ALChrome
    ALPlatform --> ALDash
    
    ALMesh --> ALCore
    ALMesh --> ALEvents
    ALSUIL --> ALRegistry
    ALChrome --> ALCore
    ALDash --> ALEvents
    
    classDef foundation fill:#e1f5fe
    classDef intelligence fill:#f3e5f5
    classDef application fill:#e8f5e8
    classDef meta fill:#fff3e0
    classDef sitebud fill:#fce4ec
    
    class ALCore,ALEvents,ALRegistry foundation
    class ALSUIL,ALMesh intelligence
    class ALChrome,ALDash application
    class ALPlatform meta
    class SBCore,SBDev,SBMarket,SBExt sitebud
```

### AgentLedgerMesh (ALM) vs Solace Agent Mesh (SAM)

**Solace Agent Mesh (SAM)**: Enterprise event-driven architecture  
**AgentLedgerMesh (ALM)**: ICP-native agent coordination with blockchain benefits

```mermaid
comparison
    title ALM vs SAM Comparison
    
    "Infrastructure" : SAM : Complex K8s orchestration
    "Infrastructure" : ALM : Single ICP deployment
    
    "Persistence" : SAM : Separate database systems
    "Persistence" : ALM : Built-in blockchain storage
    
    "Scalability" : SAM : Manual scaling configuration
    "Scalability" : ALM : Automatic canister scaling
    
    "Auditability" : SAM : Custom logging systems
    "Auditability" : ALM : Immutable blockchain history
    
    "Global Access" : SAM : Regional deployments
    "Global Access" : ALM : Worldwide ICP network
```

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
# Build Individual Kits
cd icpxmldb/icport/kits/agentledger-core
icport kit build .
icport kit validate agentledger-core

# Build Complete Platform Kit
cd icpxmldb/icport/kits/agentledger-platform
icport kit build .
icport kit deploy agentledger-platform local

# Test Universal Construction CLI
cd icpxmldb/icport/kits/universal-construction-cli
./bin/universal-construct --help

# Run Kit Builder Demo - Create IoT Kit from AgentLedger Blueprint
cd icpxmldb/icport/kits/kit-builder
icport kit-builder create iot-agent-kit \
  --from-blueprint agentledger-v1 \
  --domain "IoT Device Coordination" \
  --character kyoko

# Deploy SiteBud Ecosystem (Independent)
cd icpxmldb/icport/kits/sitebud-core
icport kit deploy sitebud-ecosystem local
```

## 🚨 Current Status & Tasks

### ✅ Completed
- AgentLedger basic authentication working
- Kit architecture boundaries defined (Foundation/Intelligence/Application/Meta layers)
- AgentLedgerMesh (ALM) distinguished from Solace Agent Mesh (SAM)
- SiteBud positioned as independent kit ecosystem
- Mermaid diagrams for kit dependencies and ALM vs SAM comparison

### 🚧 In Progress
1. **Implement Kit Structure** - Create individual kit directories and manifests
2. **Build Foundation Kits** - agentledger-core-kit (cache+queue), events-kit, registry-kit
3. **Develop Intelligence Kits** - SUIL-kit with character system, ALM mesh-kit
4. **Create Platform Meta-Kit** - Bundle all components for one-command deployment

### ⏳ Pending
- Implement SiteBud kit ecosystem (core, dev, marketplace, extension kits)
- Test recursive kit building (AgentLedger → IoT Agent Kit)
- Set up SUIL performance visualization with character switching
- Create unified dashboard showing kit deployment status

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

**Last Updated**: January 26, 2025  
**Current Focus**: Multi-kit architecture with AgentLedgerMesh (ALM) and independent SiteBud ecosystem  
**Architecture Status**: Kit boundaries defined, ready for modular implementation