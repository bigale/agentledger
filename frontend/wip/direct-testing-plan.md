# Direct Testing Implementation Plan

## Overview
Create a Node.js script that directly calls the Internet Computer canisters to run the same 8 standard tests that the UI runs, bypassing the React frontend entirely.

## Task List

### Phase 1: Foundation Setup
- [ ] **Task 1.1**: Create `test-standard-direct.js` script file
- [ ] **Task 1.2**: Set up canister ID auto-detection from `.dfx/local/canister_ids.json`
- [ ] **Task 1.3**: Configure IC agent connection to local replica
- [ ] **Task 1.4**: Import canister IDL definitions for backend and queue canisters
- [ ] **Task 1.5**: Create basic test runner structure with timing and error handling

### Phase 2: Cache Operation Tests (Tests 1-3)
- [ ] **Task 2.1**: Implement Set Cache Entry test
  - Use timestamp-based unique keys (`test-key-${timestamp}`)
  - Call `setAnonymous(key, value)` method
  - Measure execution time
  - Handle success/failure cases
- [ ] **Task 2.2**: Implement Get Cache Entry test
  - Retrieve value using same key from Set test
  - Verify value matches expected result
  - Handle null/undefined responses
- [ ] **Task 2.3**: Implement Delete Cache Entry test
  - Delete the test key using `deleteEntryAnonymous(key)`
  - Verify deletion was successful
  - Clean up any existing test keys before starting

### Phase 3: Node Simulation Tests (Tests 4-8)
- [ ] **Task 3.1**: Implement Simulate Node Failure test
  - Call `simulateFailure(BigInt(0))` to fail node 0
  - Verify node status changes to Failed
  - Measure response time
- [ ] **Task 3.2**: Implement Simulate Node Recovery test
  - Call `simulateRecovery(BigInt(0))` to recover node 0
  - Verify node status returns to Healthy
  - Check system rebalancing
- [ ] **Task 3.3**: Implement Cache Operations During Failure test
  - Fail node 1, then test cache set/get operations
  - Verify system continues functioning during node failure
  - Recover node 1 after test
- [ ] **Task 3.4**: Implement Multiple Node Failures test
  - Simultaneously fail nodes 2, 3, and 4
  - Test cache operations with multiple failures
  - Verify system resilience
  - Recover all failed nodes
- [ ] **Task 3.5**: Implement Fault Tolerance test
  - Fail all nodes except one (nodes 0,1,2,3)
  - Test if system survives with minimal nodes
  - Recover all nodes to restore full functionality

### Phase 4: Test Infrastructure
- [ ] **Task 4.1**: Create test result data structure
  ```javascript
  {
    name: string,
    status: 'passed' | 'failed' | 'error',
    duration: number,
    message: string,
    timestamp: number
  }
  ```
- [ ] **Task 4.2**: Implement test execution wrapper with retry logic
  - Maximum 3 retry attempts per test
  - Exponential backoff (1s, 2s, 4s)
  - Comprehensive error catching and reporting
- [ ] **Task 4.3**: Add sleep/delay utility for test pacing
- [ ] **Task 4.4**: Create test cleanup functionality
  - Clear test keys before and after test runs
  - Reset node states to healthy
  - Clean up any test artifacts

### Phase 5: Output and Reporting
- [ ] **Task 5.1**: Implement console output formatting
  - Match UI test format: "X passed • Y failed • Z total"
  - Show individual test results with status indicators
  - Display total execution time
- [ ] **Task 5.2**: Add verbose output mode (`--verbose` flag)
  - Show detailed test execution steps
  - Display canister response data
  - Include timing breakdown per test
- [ ] **Task 5.3**: Add JSON output mode (`--json` flag)
  - Export results in structured JSON format
  - Include all test metadata and timings
  - Support file output for CI/CD integration
- [ ] **Task 5.4**: Create summary statistics
  - Success rate percentage
  - Average test execution time
  - Fastest/slowest test identification

### Phase 6: Integration and Validation
- [ ] **Task 6.1**: Add package.json scripts
  ```json
  {
    "test:standard-direct": "node wip/test-standard-direct.js",
    "test:standard-verbose": "node wip/test-standard-direct.js --verbose",
    "test:standard-json": "node wip/test-standard-direct.js --json > wip/direct-test-results.json"
  }
  ```
- [ ] **Task 6.2**: Create comparison utility (`compare-test-results.js`)
  - Run both UI and direct tests
  - Compare results for consistency
  - Highlight any discrepancies
- [ ] **Task 6.3**: Validate against existing UI tests
  - Run both test suites multiple times
  - Ensure consistent results
  - Document any behavioral differences
- [ ] **Task 6.4**: Add error handling for common scenarios
  - Canister not available
  - Network connectivity issues
  - Invalid canister IDs
  - Authentication failures

### Phase 7: Documentation and Optimization
- [ ] **Task 7.1**: Create usage documentation
  - Command-line options and flags
  - Expected output formats
  - Troubleshooting common issues
- [ ] **Task 7.2**: Add performance optimizations
  - Parallel test execution where safe
  - Connection pooling for canister calls
  - Efficient cleanup procedures
- [ ] **Task 7.3**: Create CI/CD pipeline integration guide
  - GitHub Actions example
  - Result artifact collection
  - Failure notification setup

## File Structure
```
wip/
├── direct-testing-plan.md          # This plan file
├── test-standard-direct.js         # Main test runner script
├── compare-test-results.js         # UI vs Direct comparison utility
├── test-results-schema.json        # JSON schema for test results
└── README.md                      # Usage and setup instructions
```

## Success Criteria
- [ ] All 8 standard tests execute successfully via direct canister calls
- [ ] Test results match UI test behavior (same pass/fail outcomes)
- [ ] Execution time is significantly faster than UI tests (target: <10 seconds)
- [ ] Script handles errors gracefully and provides clear feedback
- [ ] Output format is consistent and parseable for automation
- [ ] Documentation is complete and usage is straightforward

## Dependencies Required
```json
{
  "dependencies": {
    "@dfinity/agent": "^0.19.3",
    "@dfinity/candid": "^0.19.3",
    "@dfinity/principal": "^0.19.3"
  }
}
```

## Next Steps Priority Order
1. Start with **Phase 1** - Foundation Setup
2. Implement **Phase 2** - Cache Operations (core functionality)
3. Move to **Phase 3** - Node Simulation Tests
4. Complete **Phase 4** - Test Infrastructure
5. Finish with **Phase 5-7** - Reporting, Integration, and Documentation

This plan provides a comprehensive roadmap to create a robust direct testing solution that bypasses the UI while maintaining the same test coverage and reliability.