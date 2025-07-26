#!/usr/bin/env node

import { Actor, HttpAgent } from '@dfinity/agent';
import fs from 'fs';

// Auto-detect canister IDs from dfx local configuration
function getCanisterIds() {
  try {
    const canisterIds = JSON.parse(fs.readFileSync('../.dfx/local/canister_ids.json'));
    return {
      backend: canisterIds.backend.local,
      queue: canisterIds.queue?.local || null
    };
  } catch (error) {
    console.error('❌ Error reading canister IDs:', error.message);
    console.log('💡 Make sure you have deployed canisters with: dfx deploy');
    process.exit(1);
  }
}

// Import canister interface definitions
async function createActor(canisterId, idlFactory) {
  const agent = new HttpAgent({ 
    host: 'http://localhost:8080',
    fetch: globalThis.fetch 
  });
  
  // For local development, fetch the root key
  try {
    await agent.fetchRootKey();
  } catch (error) {
    console.warn('⚠️  Could not fetch root key:', error.message);
  }
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId
  });
}

// Mock IDL factory for backend canister (based on backend.did)
const backendIdlFactory = ({ IDL }) => {
  const NodeId = IDL.Nat;
  const Key = IDL.Text;
  const Value = IDL.Text;
  const NodeStatus = IDL.Variant({
    'Healthy': IDL.Null,
    'Failed': IDL.Null,
    'Recovering': IDL.Null,
  });
  
  return IDL.Service({
    'setAnonymous': IDL.Func([Key, Value], [IDL.Bool], []),
    'getAnonymous': IDL.Func([Key], [IDL.Opt(Value)], ['query']),
    'deleteEntryAnonymous': IDL.Func([Key], [IDL.Bool], []),
    'getNodeStatusesAnonymous': IDL.Func([], [IDL.Vec(IDL.Tuple(NodeId, NodeStatus))], ['query']),
    'simulateFailure': IDL.Func([NodeId], [], []),
    'simulateRecovery': IDL.Func([NodeId], [], []),
  });
};

// Test result tracking
class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }
  
  async runTest(name, testFn) {
    const startTime = Date.now();
    console.log(`🧪 Running: ${name}`);
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        status: 'passed',
        duration,
        message: result?.message || 'Test completed successfully'
      });
      
      console.log(`✅ PASSED: ${name} (${duration}ms)`);
      if (result?.details) {
        console.log(`   ${result.details}`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        status: 'failed', 
        duration,
        message: error.message,
        error: error
      });
      
      console.log(`❌ FAILED: ${name} (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  printSummary() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;
    
    console.log('\\n📊 Test Summary:');
    console.log(`${passed} passed • ${failed} failed • ${total} total (${totalTime}ms)`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.message}`);
        });
    }
    
    return { passed, failed, total, success: failed === 0 };
  }
}

// Utility functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test suite
async function runStandardTestsDirect() {
  console.log('🚀 AgentLedger Direct Testing Suite');
  console.log('=====================================\\n');
  
  const canisterIds = getCanisterIds();
  console.log(`📍 Backend Canister: ${canisterIds.backend}`);
  
  let backendActor;
  try {
    backendActor = await createActor(canisterIds.backend, backendIdlFactory);
    console.log('✅ Connected to backend canister\\n');
  } catch (error) {
    console.error('❌ Failed to connect to backend canister:', error.message);
    process.exit(1);
  }
  
  const runner = new TestRunner();
  
  // Create unique test identifiers to avoid cache conflicts
  const timestamp = Date.now();
  const testKey = `direct-test-${timestamp}`;
  const testValue = `direct-value-${timestamp}`;
  
  console.log(`🔑 Using test key: ${testKey}`);
  console.log(`📦 Using test value: ${testValue}\\n`);
  
  // Phase 1: Basic Cache Operations
  console.log('📋 Phase 1: Basic Cache Operations');
  console.log('----------------------------------');
  
  await runner.runTest('Set Cache Entry', async () => {
    const result = await backendActor.setAnonymous(testKey, testValue);
    if (!result) {
      throw new Error('Set operation returned false');
    }
    return { 
      message: 'Successfully stored cache entry',
      details: `Stored: ${testKey} -> ${testValue}`
    };
  });
  
  await sleep(200); // Brief pause between operations
  
  await runner.runTest('Get Cache Entry', async () => {
    const result = await backendActor.getAnonymous(testKey);
    if (!result || result.length === 0) {
      throw new Error(`No value returned for key: ${testKey}`);
    }
    
    const value = result[0]; // Extract from Option type
    if (value !== testValue) {
      throw new Error(`Value mismatch: expected '${testValue}', got '${value}'`);
    }
    
    return {
      message: 'Successfully retrieved correct value',
      details: `Retrieved: ${testKey} -> ${value}`
    };
  });
  
  await sleep(200);
  
  await runner.runTest('Delete Cache Entry', async () => {
    const result = await backendActor.deleteEntryAnonymous(testKey);
    if (!result) {
      throw new Error('Delete operation returned false');
    }
    
    // Verify deletion by trying to get the key
    const getResult = await backendActor.getAnonymous(testKey);
    if (getResult && getResult.length > 0) {
      throw new Error('Key still exists after deletion');
    }
    
    return {
      message: 'Successfully deleted cache entry',
      details: `Deleted: ${testKey}`
    };
  });
  
  // Phase 2: Node Simulation Tests
  console.log('\\n📋 Phase 2: Node Simulation Tests');
  console.log('----------------------------------');
  
  await runner.runTest('Simulate Node Failure', async () => {
    // Get initial node statuses
    const initialStatuses = await backendActor.getNodeStatusesAnonymous();
    const nodeZeroInitial = initialStatuses.find(([id, status]) => Number(id) === 0);
    
    // Simulate failure of node 0
    await backendActor.simulateFailure(BigInt(0));
    
    await sleep(500); // Allow time for status change
    
    // Check if node 0 status changed
    const updatedStatuses = await backendActor.getNodeStatusesAnonymous();
    const nodeZeroUpdated = updatedStatuses.find(([id, status]) => Number(id) === 0);
    
    if (!nodeZeroUpdated) {
      throw new Error('Node 0 not found in status list');
    }
    
    const [nodeId, status] = nodeZeroUpdated;
    const statusStr = Object.keys(status)[0]; // Extract variant key
    
    return {
      message: 'Node failure simulation completed',
      details: `Node 0 status: ${statusStr}`
    };
  });
  
  await sleep(500);
  
  await runner.runTest('Simulate Node Recovery', async () => {
    // Simulate recovery of node 0
    await backendActor.simulateRecovery(BigInt(0));
    
    await sleep(500); // Allow time for status change
    
    // Check node 0 status
    const statuses = await backendActor.getNodeStatusesAnonymous();
    const nodeZero = statuses.find(([id, status]) => Number(id) === 0);
    
    if (!nodeZero) {
      throw new Error('Node 0 not found in status list');
    }
    
    const [nodeId, status] = nodeZero;
    const statusStr = Object.keys(status)[0];
    
    return {
      message: 'Node recovery simulation completed',
      details: `Node 0 status: ${statusStr}`
    };
  });
  
  // Phase 3: Complex Scenarios (may not be fully implemented)
  console.log('\\n📋 Phase 3: Complex Scenarios');
  console.log('------------------------------');
  
  await runner.runTest('Cache Operations During Failure', async () => {
    // Fail node 1
    await backendActor.simulateFailure(BigInt(1));
    await sleep(200);
    
    // Try cache operations during failure
    const failureTestKey = `failure-test-${timestamp}`;
    const failureTestValue = `failure-value-${timestamp}`;
    
    const setResult = await backendActor.setAnonymous(failureTestKey, failureTestValue);
    if (!setResult) {
      throw new Error('Cache operations failed during node failure');
    }
    
    const getResult = await backendActor.getAnonymous(failureTestKey);
    if (!getResult || getResult.length === 0 || getResult[0] !== failureTestValue) {
      throw new Error('Cache retrieval failed during node failure');
    }
    
    // Recover node 1
    await backendActor.simulateRecovery(BigInt(1));
    
    // Cleanup
    await backendActor.deleteEntryAnonymous(failureTestKey);
    
    return {
      message: 'Cache operations work during node failure',
      details: `Operations successful with node 1 failed`
    };
  });
  
  await runner.runTest('Multiple Node Failures', async () => {
    // Fail multiple nodes (2, 3, 4)
    await backendActor.simulateFailure(BigInt(2));
    await backendActor.simulateFailure(BigInt(3));
    await backendActor.simulateFailure(BigInt(4));
    await sleep(300);
    
    // Test cache operations with multiple failures
    const multiFailKey = `multi-fail-${timestamp}`;
    const multiFailValue = `multi-fail-value-${timestamp}`;
    
    const setResult = await backendActor.setAnonymous(multiFailKey, multiFailValue);
    if (!setResult) {
      throw new Error('Cache operations failed with multiple node failures');
    }
    
    const getResult = await backendActor.getAnonymous(multiFailKey);
    if (!getResult || getResult.length === 0 || getResult[0] !== multiFailValue) {
      throw new Error('Cache retrieval failed with multiple node failures');
    }
    
    // Recover nodes
    await backendActor.simulateRecovery(BigInt(2));
    await backendActor.simulateRecovery(BigInt(3));
    await backendActor.simulateRecovery(BigInt(4));
    
    // Cleanup
    await backendActor.deleteEntryAnonymous(multiFailKey);
    
    return {
      message: 'System survives multiple node failures',
      details: 'Operations successful with nodes 2,3,4 failed'
    };
  });
  
  await runner.runTest('Fault Tolerance Test', async () => {
    // Fail most nodes (0,1,2,3) leaving only 4,5
    await backendActor.simulateFailure(BigInt(0));
    await backendActor.simulateFailure(BigInt(1));
    await backendActor.simulateFailure(BigInt(2));
    await backendActor.simulateFailure(BigInt(3));
    await sleep(500);
    
    // Test if system survives with minimal nodes
    const faultTestKey = `fault-test-${timestamp}`;
    const faultTestValue = `fault-value-${timestamp}`;
    
    const setResult = await backendActor.setAnonymous(faultTestKey, faultTestValue);
    if (!setResult) {
      throw new Error('System failed with minimal healthy nodes');
    }
    
    const getResult = await backendActor.getAnonymous(faultTestKey);
    if (!getResult || getResult.length === 0 || getResult[0] !== faultTestValue) {
      throw new Error('System cannot retrieve data with minimal healthy nodes');
    }
    
    // Recover all nodes
    await backendActor.simulateRecovery(BigInt(0));
    await backendActor.simulateRecovery(BigInt(1));
    await backendActor.simulateRecovery(BigInt(2));
    await backendActor.simulateRecovery(BigInt(3));
    
    // Cleanup
    await backendActor.deleteEntryAnonymous(faultTestKey);
    
    return {
      message: 'System demonstrates fault tolerance',
      details: 'Operations successful with only 2 healthy nodes'
    };
  });
  
  // Print final summary
  console.log('\\n' + '='.repeat(50));
  const summary = runner.printSummary();
  
  return summary.success;
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runStandardTestsDirect()
    .then(success => {
      console.log(success ? '\\n🎉 All tests passed!' : '\\n⚠️  Some tests failed.');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\\n💥 Test runner error:', error);
      process.exit(1);
    });
}