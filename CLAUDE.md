# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgentLedger is an Internet Computer (IC) blockchain-based distributed cache system with self-healing capabilities and optional queue processing. The project demonstrates fault-tolerant distributed caching using 6 simulated nodes within a single canister.

## Architecture

### Backend (Motoko)
- **Main Cache Canister** (`/backend/main.mo`): Implements the distributed cache with self-healing logic
  - 6 simulated nodes for fault tolerance
  - Automatic failure detection and recovery
  - Data replication across nodes
  - Key-based routing and distribution
- **Queue Canister** (`/backend/queue.mo`): Optional queue for buffered operation processing
  - FIFO processing with retry logic
  - Inter-canister communication with main cache
  - Operation status tracking
- **Authentication** (`/backend/auth-single-user/management.mo`): Admin management system

### Frontend (React/TypeScript)
- **Framework**: React with TypeScript
- **State Management**: React Query (@tanstack/react-query)
- **Entry Points**: 
  - `/frontend/src/main.tsx` - Application entry
  - `/frontend/src/app.tsx` - Main component
- **Key Components**:
  - Cache management dashboards
  - Queue management interfaces
  - Metrics visualization
  - Test suite interfaces

## Development Commands

**Note**: This project currently lacks configuration files. Before running any commands, you need:
1. `dfx.json` - Internet Computer project configuration
2. `/frontend/package.json` - Frontend dependencies
3. Optional: `vessel.dhall` or `mops.toml` for Motoko dependencies

### Expected Commands (after configuration):
```bash
# Internet Computer Development
dfx start --clean           # Start local IC replica
dfx deploy                  # Deploy all canisters
dfx deploy backend          # Deploy only backend canister
dfx deploy queue           # Deploy only queue canister
dfx canister call backend <method> '(<args>)'  # Call canister methods

# Frontend Development
cd frontend
npm install                 # Install dependencies
npm run dev                # Start development server
npm run build              # Build for production
npm test                   # Run tests
npm run lint               # Run ESLint
npm run typecheck          # Run TypeScript type checking
```

## Key Implementation Details

### Cache Operations
- **set(key: Text, value: Text)**: Store cache entry with replication
- **get(key: Text)**: Retrieve cache entry from primary or replica
- **deleteEntry(key: Text)**: Remove cache entry from all nodes

### Node Management
- Nodes automatically fail and recover to demonstrate self-healing
- Cache entries are redistributed when nodes fail
- System continues operating even with only one healthy node

### Queue Processing
- Operations can be queued for reliable processing
- Supports batch processing with configurable batch sizes
- Tracks operation status: queued → processing → completed/failed
- Implements retry logic with exponential backoff

### Testing
The frontend includes comprehensive test suites:
- Basic cache operation tests
- Node failure/recovery tests
- Performance tests (configurable rate and volume)
- Queue integration tests
- Individual test execution capability

## Important Notes

1. **Missing Configuration**: The project needs proper configuration files before it can be built or run
2. **Persistent Storage**: Uses Internet Computer's persistent memory for data durability
3. **Inter-Canister Calls**: Queue canister makes async calls to main cache canister
4. **Error Handling**: Strict validation - empty keys/values are rejected
5. **Resource Management**: Batch processing includes cycle and memory monitoring