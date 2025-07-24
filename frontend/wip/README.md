# Work In Progress (WIP) Directory

This directory contains work-in-progress implementations and experimental features for the AgentLedger project.

## Current Projects

### Direct Testing Implementation
**Goal**: Create a Node.js script to run Standard Test Suite directly against IC canisters, bypassing the UI.

**Status**: Planning Phase  
**Plan File**: `direct-testing-plan.md`  
**Benefits**: Faster execution, cleaner output, better debugging, CI/CD friendly

### Files
- `direct-testing-plan.md` - Comprehensive implementation plan with task list
- `test-standard-direct.js` - (To be created) Main direct test runner
- `compare-test-results.js` - (To be created) UI vs Direct test comparison utility

## Usage

Follow the tasks in `direct-testing-plan.md` to implement the direct testing solution. Each task includes specific implementation details and success criteria.

## Guidelines

- All WIP code should be thoroughly tested before moving to main codebase
- Document any assumptions or limitations
- Include clear usage instructions for any new scripts
- Maintain compatibility with existing test infrastructure

## Integration

Once complete, successful WIP implementations will be:
1. Moved to appropriate locations in the main codebase
2. Added to package.json scripts
3. Integrated with existing CI/CD workflows
4. Documented in main project README