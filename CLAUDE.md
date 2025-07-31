# CLAUDE.md - Project Context for AI Assistants

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Current Mission: Universal Agent Coordination Platform

**CORE OBJECTIVE**: Build the world's first Universal Agent Coordination Platform with 3-tier persistence architecture

## 🏗️ Architecture Documents

### Core Planning Documents
- **[UNIVERSAL-AGENT-COORDINATION-PLATFORM-ARCHITECTURE.md](UNIVERSAL-AGENT-COORDINATION-PLATFORM-ARCHITECTURE.md)** - Complete platform architecture with mermaid diagrams
- **[DEPLOYMENT-ROADMAP.md](DEPLOYMENT-ROADMAP.md)** - Implementation roadmap and milestone tracking
- **[INTEGRATION-STRATEGY.md](INTEGRATION-STRATEGY.md)** - Component integration and coordination strategy
- **[AGENTLEDGER-KIT-TRANSFORMATION-PLAN.md](AGENTLEDGER-KIT-TRANSFORMATION-PLAN.md)** - Transform AgentLedger into ICPort kit

### Key Discoveries
- **Universal Construction CLI** already exists in `icpxmldb/icport/kits/universal-construction-cli/`
- **Kit Builder** for recursive kit creation in `icpxmldb/icport/kits/kit-builder/`
- **SUIL** (Smart Universal Intelligence Layer) - 22,500x speedup with specialized programs
- **ICPort** - Docker-like deployment system for ICP with kit registry
- **PocketFlow Cookbook** - 47 proven AI workflow patterns ready for kitization (`icpxmldb/ai-kit/lib/pocketflow-py/cookbook/`)

## 🏆 **Completed Kit Design Cycle Analysis**

### **AgentFlowerBud Chrome Extension Kit** (Successfully Generated)
**Source**: `pocketflow-agent` cookbook pattern → Chrome extension with Kyoko analytical intelligence

**📊 Final Statistics**: 11 JavaScript components, 3,926 lines of code, 7 architectural layers

### **Critical Design Learnings Applied:**
1. **✅ Proper Inheritance Chain**: `super.bloom()` not `super.initialize()` for DOM element creation
2. **✅ Dependency Loading Order**: BotanicalSharedState → BaseBud → AgentFlowerBud → ResearchOrchestrator  
3. **✅ Chrome Extension V3 Compliance**: sidePanel permission, external scripts, service worker architecture
4. **✅ Character-Driven Architecture**: Kyoko personality influences research strategy, search patterns, synthesis approach
5. **✅ PocketFlow Pattern Translation**: DecideAction → SearchWeb → AnswerQuestion successfully implemented in JavaScript

### **Next Kit Generation Improvements Identified:**
1. **MCP Integration**: Real search APIs through Model Context Protocol servers (addresses current mock limitation)
2. **Dependency Injection**: Constructor-based component management for better testability  
3. **Error Resilience**: Graceful degradation when ICP bridge or search services fail
4. **Automated Testing**: Built-in test framework for generated kit validation
5. **API Integration Strategy**: Standardized approach for connecting botanical kits to real-world services

### **Botanical Architecture Success Patterns:**
- **Naming Convention**: BotanicalStemController → BotanicalSharedState → AgentFlowerBud (intuitive hierarchy)
- **Character Integration**: Kyoko analytical approach successfully influences every architectural layer
- **3-Tier Persistence**: Browser DB → PocketFlow SharedState → ICP Cache/Queue working correctly
- **Cross-Pollination Ready**: Message routing system prepared for multi-bud communication

## 🌸 **Unified Botanical Garden Architecture (Latest Success)**

### **Multi-Kit Sidepanel Integration - January 2025**
Successfully implemented **unified botanical garden** architecture that "flattens" multiple cookbook patterns into a single Chrome extension sidepanel interface.

**🏆 Achievement**: Combined ChatFlowerBud (pocketflow-chat) and AgentFlowerBud (pocketflow-agent) into seamless Kit Registry Pattern with checkbox management.

### **Kit Registry Pattern Architecture:**
```
📋 Cookbook Kit Manager (Collapsible)
├── 🌱 Foundational Kits
│   ├── ☑️ 🌸 Chat Flower (Gemini AI integration)
│   └── ☑️ 🔍 Agent Flower (MCP search integration)
├── ⚗️ Cookbook Kits (Future)
│   ├── ☐ 💻 Code Flower (Coming Soon)
│   ├── ☐ 🌍 Translation Flower (Coming Soon)
│   └── ☐ 🔎 Search Flower (Coming Soon)
└── 🌱 Garden Health Status
    ├── Browser Storage: ● (Connected)
    ├── PocketFlow: ● (Active)
    ├── ICP: ○ (Available)
    └── MCP: ● (Mock Mode)
```

### **🔧 Critical Architecture Learnings:**

#### **1. DOM Element Binding Resolution**
**Issue**: `TypeError: Cannot read properties of null (reading 'querySelector')`
**Root Cause**: BotanicalKitRegistry was calling `instance.getTemplate()` directly instead of `instance.render()`
**Solution**: Always use `instance.render()` to properly set `this.element` before calling `onBindEvents()`

```javascript
// ❌ WRONG - Creates element but doesn't set this.element
const kitElement = instance.getTemplate ? 
  this.createElementFromTemplate(instance.getTemplate()) :
  this.createDefaultKitElement(kit);

// ✅ CORRECT - Properly sets this.element via render()
let kitElement;
if (instance.render) {
  kitElement = instance.render(); // Sets this.element internally
} else if (instance.getTemplate) {
  kitElement = this.createElementFromTemplate(instance.getTemplate());
}
```

#### **2. PocketFlow State Management Integration**
**Issue**: AI responses showing "Processing complete" instead of actual content
**Root Cause**: Key mismatch between storage and retrieval:
- BotanicalChatNode stored: `sharedState.set('result', response)`
- BotanicalSharedState expected: `'final_answer'` or `'answer'`
**Solution**: Store responses with expected keys for advanced BotanicalSharedState

```javascript
// Store result with keys that BotanicalSharedState.getResult() expects
sharedState.set('final_answer', response);
sharedState.set('result', response); // Keep for compatibility
```

#### **3. PocketFlow Infinite Loop Prevention**
**Issue**: Chat node executing 10x in loops, causing 28+ second response times
**Root Cause**: Self-loop flow design with always-true continuation condition
**Solution**: Remove self-loops for request-response patterns, use `continue: false`

```javascript
// ❌ WRONG - Creates infinite loops
flow.connections.set('chat_node', [{
  target: 'chat_node',
  condition: 'continue',
  type: 'self-loop'
}]);

// ✅ CORRECT - Single execution per message
// No connections - single execution per message
// Each message is processed once and returns result
```

#### **4. MCP Server Configuration Optimization**
**Issue**: "Failed to connect to data-analysis MCP server" errors
**Root Cause**: AgentFlowerBud configured for unnecessary server types
**Solution**: Minimize MCP server preferences to only required types

```javascript
// ❌ WRONG - Includes unused servers
mcpServerPreferences: [
  { type: 'search-research', priority: 1, fallbackRequired: true },
  { type: 'data-analysis', priority: 2, fallbackRequired: false },    // ← Not needed
  { type: 'content-validation', priority: 3, fallbackRequired: false } // ← Not needed
]

// ✅ CORRECT - Only required servers
mcpServerPreferences: [
  { type: 'search-research', priority: 1, fallbackRequired: true }
]
```

### **🎯 Unified Garden Success Metrics:**
- **✅ Real Gemini AI Integration**: ChatFlowerBud generates actual conversational responses
- **✅ MCP Search Architecture**: AgentFlowerBud processes research queries (mock mode functional)
- **✅ Kit Registry Management**: Checkbox enable/disable with collapsible UI optimization
- **✅ Seamless Kit Switching**: No reload required, instant tab switching between Chat/Agent modes
- **✅ Character Consistency**: Kyoko analytical personality maintained across both kits
- **✅ 3-Tier Persistence**: Browser → PocketFlow → ICP bridge architecture working

### **📚 Debugging Methodology That Worked:**
1. **Systematic Console Logging**: Added debug markers at each architectural boundary
2. **Component Isolation**: Test individual components before integration
3. **State Inspection**: Log SharedState contents to identify key mismatches
4. **Flow Tracing**: Track PocketFlow execution paths to identify loops
5. **Dependency Validation**: Verify script loading order and class availability

### **🚀 Future Kit Generation Improvements:**
1. **Real MCP Integration**: Connect to actual search APIs instead of mock servers
2. **Template Debugging**: Pre-built debug logging for generated kit troubleshooting  
3. **State Key Validation**: Automated checking of SharedState key consistency
4. **Flow Pattern Library**: Pre-validated PocketFlow patterns to prevent loops
5. **Multi-Character Support**: Template generation for Chihiro and Byakuya personalities

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
  - **47 PocketFlow Cookbook Patterns** - Ready-to-deploy AI workflow kits
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
        ALPocketFlow["🔄 agentledger-pocketflow-kit<br/>(Hybrid Python-WASM workflows)"]
    end
    
    subgraph "PocketFlow Cookbook Kits - AI Workflow Patterns"
        PFChat["💬 pocketflow-chat-kit<br/>(Conversational AI)"]
        PFRAG["📚 pocketflow-rag-kit<br/>(Retrieval Augmented Generation)"]
        PFAgent["🤖 pocketflow-agent-kit<br/>(Multi-agent systems)"]
        PFBatch["📦 pocketflow-batch-kit<br/>(Batch processing workflows)"]
        PFMore["... 43 more cookbook kits<br/>(Specialized AI patterns)"]
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
    ALPlatform --> ALPocketFlow
    ALPlatform --> ALChrome
    ALPlatform --> ALDash
    
    ALPocketFlow --> PFChat
    ALPocketFlow --> PFRAG
    ALPocketFlow --> PFAgent
    ALPocketFlow --> PFBatch
    ALPocketFlow --> PFMore
    
    ALMesh --> ALCore
    ALMesh --> ALEvents
    ALSUIL --> ALRegistry
    ALChrome --> ALCore
    ALDash --> ALEvents
    
    classDef foundation fill:#e1f5fe
    classDef intelligence fill:#f3e5f5
    classDef pocketflow fill:#e8f4f8
    classDef application fill:#e8f5e8
    classDef meta fill:#fff3e0
    classDef sitebud fill:#fce4ec
    
    class ALCore,ALEvents,ALRegistry foundation
    class ALSUIL,ALMesh,ALPocketFlow intelligence
    class PFChat,PFRAG,PFAgent,PFBatch,PFMore pocketflow
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

## 🎯 Platform Capabilities

1. **3-Tier Persistence**: Browser → PocketFlow → ICP Cache/Queue system
2. **Character-Driven Intelligence**: Kyoko/Chihiro/Byakuya personalities affecting all operations
3. **PocketFlow Integration**: 47 proven AI workflow patterns as deployable kits
4. **SUIL Performance**: 22,500x speedup with specialized programs vs LLM-only
5. **Recursive Kit Building**: AgentLedger patterns create domain-specific kit derivatives
6. **Universal Coordination**: Browser extensions, web apps, and ICP canisters unified

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

# PocketFlow Cookbook Kit Development
cd icpxmldb/icport/kits
icport cookbook-to-kit pocketflow-chat
icport cookbook-to-kit pocketflow-rag
icport cookbook-to-kit pocketflow-agent

# Deploy Cookbook Kits
icport kit deploy pocketflow-chat-kit local
icport kit deploy pocketflow-rag-kit local
icport kit deploy pocketflow-agent-kit local
```

## 🚨 Current Status & Tasks

### ✅ MAJOR BREAKTHROUGH (January 27, 2025)
- **🎉 WORKING CHROME EXTENSION KIT!** - Complete SiteBud Chat Flower extension with botanical architecture
- **3-Tier Persistence Architecture** - Browser IndexedDB → Chrome Storage → ICP Backend (FULLY WORKING!)
- **Character-Driven Chat Interface** - Kyoko analytical personality with natural conversational responses
- **Kit Builder with Chrome Extension Generation** - Automated creation of browser extension kits (`chrome-extension-kit-builder.js`)
- **Dual-Target Kit Generation** - Single cookbook patterns → both Python/WASM + TypeScript/Browser targets
- **Real ICP Integration** - Background service worker connected to local replica with 2ms sync
- **Botanical Architecture Proven** - BaseBud, ChatFlowerBud, StemController working in production browser
- **End-to-End Testing Complete** - Message processing from browser UI to ICP canister storage

### ✅ Infrastructure Completed
- AgentLedger basic authentication working
- Kit architecture boundaries defined (Foundation/Intelligence/Application/Meta layers)
- AgentLedgerMesh (ALM) distinguished from Solace Agent Mesh (SAM)
- SiteBud positioned as independent kit ecosystem
- Mermaid diagrams for kit dependencies and ALM vs SAM comparison
- **PocketFlow Cookbook Discovery** - 47 proven AI workflow patterns identified and analyzed
- **Hybrid Python-WASM Architecture** - Design for native ICP deployment with local fallback
- **Kit Template Structure** - Proven ICPortKit.yml patterns for cookbook conversion
- **Foundation Cookbook Kits** - chat-kit, rag-kit, hello-world-kit all deployed and tested

### 🚧 Ready for Immediate Scale-Up
1. **Convert Remaining 46 Cookbook Patterns** - Use proven `chrome-extension-kit-builder.js` template
2. **Deploy Complete AgentLedger Platform** - Bundle all foundation + intelligence + application kits
3. **SiteBud Marketplace Integration** - Register all generated extension kits in Garden ecosystem
4. **Multi-Character Browser Extensions** - Add Chihiro and Byakuya personality variants

### ⏳ Future Enhancements
- Advanced SUIL performance visualization with character switching in browser
- Cross-pollination between different cookbook kit types via browser messaging
- Production deployment pipeline for all 47 kits to mainnet ICP
- Automated testing and validation for complete kit ecosystem
- Test recursive kit building (PocketFlow patterns → Domain-specific kits)

## 🌸 Chrome Extension Kit Architecture (PROVEN WORKING)

### SiteBud Chat Flower Kit - Reference Implementation
**Location**: `icpxmldb/icport/kits/kit-builder/generated-chrome-kits/sitebud-chat-flower-kit/`

**Architecture Pattern**: 3-Tier Persistence + Botanical Components
```
Browser UI (ChatFlowerBud) 
    ↓ 
IndexedDB + BrowserPersistenceLayer
    ↓
Chrome Storage API (Bridge Layer)
    ↓
Background Service Worker (ICPBridge)
    ↓
ICP Canisters (Cache/Queue System)
```

### Key Components Working
- **`manifest.json`** - Chrome Extension Manifest v3 with side panel and background service worker
- **`background.js`** - Service worker with ICP connection, handles Chrome storage bridge
- **`sidepanel.js`** - Main UI controller with SidePanelGarden class managing Chat Flower lifecycle
- **`ChatFlowerBud.js`** - Core chat component with character-driven responses (Kyoko analytical)
- **`PocketFlowOrchestrator.js`** - Message processing with 2ms response time, character optimization
- **`BrowserPersistenceLayer.js`** - IndexedDB management for conversation history
- **`SidePanelICPBridge.js`** - Chrome messaging API bridge to background service for ICP sync
- **`botanical.css`** - Complete styling with character theming and responsive design

### Character System Implementation
```javascript
// Kyoko's conversational responses (analytical personality)
if (message.includes('hello')) {
  return "Hello! I'm ready to assist with analytical precision. What would you like to explore?";
}
// More personality-driven responses...
```

### Performance Metrics (Proven)
- **Message Processing**: 2ms average response time
- **ICP Sync**: Real-time background sync to local replica
- **Conversation History**: Persistent across browser sessions
- **Memory Usage**: Efficient IndexedDB + Chrome storage hybrid
- **UI Responsiveness**: Instant chat interface updates

### Chrome Extension Kit Builder
**Script**: `icpxmldb/icport/kits/kit-builder/chrome-extension-kit-builder.js`
- **Auto-generates** complete Chrome extension from cookbook patterns
- **Creates** all necessary files: manifest, background, sidepanel, botanical components
- **Includes** 3-tier persistence architecture by default
- **Supports** character-driven optimization (Kyoko/Chihiro/Byakuya)
- **Produces** production-ready extension loadable in Chrome

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

"We've built the world's first Universal Agent Coordination Platform where AI agents, human developers, and software patterns collaborate to create software that creates software. With 47 proven AI workflow patterns, 22,500x performance improvements, and character-driven intelligence, we're not just changing how software is built - we're enabling software to evolve itself. Every PocketFlow cookbook pattern becomes a deployable ICP kit, creating an ecosystem where workflow intelligence scales infinitely."

## 📝 Notes for AI Assistants

- **Focus on the demo**: Everything should support tomorrow's hackathon presentation
- **Use existing components**: Don't rebuild what's already working
- **Emphasize SUIL**: The 22,500x speedup is our killer feature
- **PocketFlow Integration**: Leverage 47 cookbook patterns as demo building blocks
- **Show recursion**: Kit Builder creating kits is the magic moment
- **Character personalities**: Make them visible and impactful in the demo
- **Python-to-WASM**: Showcase hybrid architecture for ICP native deployment
- **Test incrementally**: Get each piece working before moving to the next

## 🔗 Related Files

- Universal Schema Framework docs: `icpxmldb/docs/`
- SUIL research: `icpxmldb/docs/ADVANCED-RESEARCH-V3-SMART-UNIVERSAL-INTELLIGENCE-LAYER.md`
- Kit Builder docs: `icpxmldb/icport/kits/kit-builder/README.md`
- Character profiles: `icpxmldb/.character-profiles/`
- ICPort examples: `icpxmldb/icport/examples/`
- **PocketFlow Cookbook**: `icpxmldb/ai-kit/lib/pocketflow-py/cookbook/` - 47 AI workflow patterns
- PocketFlow Kit Templates: `icpxmldb/icport/kits/pocketflow-*-kit/` - Kitized cookbook patterns

---

**Last Updated**: January 26, 2025  
**Current Focus**: PocketFlow Cookbook Integration - 47 AI workflow patterns as deployable kits  
**Architecture Status**: Hybrid Python-WASM strategy defined, cookbook patterns ready for kitization