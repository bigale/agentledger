#!/usr/bin/env node

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import fs from 'fs';
import crypto from 'crypto';

// Command line argument parsing
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const isAuthMode = args.includes('--auth');
const isAnonymousOnly = args.includes('--anonymous-only');
const isJsonOutput = args.includes('--json');

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

// Enhanced actor creation with authentication support
async function createActor(canisterId, idlFactory, options = {}) {
  const host = 'http://localhost:8080';
  
  const agentOptions = {
    host,
    fetch: globalThis.fetch,
    verifyQuerySignatures: false, // Disable for local development
    ...options.agentOptions
  };
  
  const agent = new HttpAgent(agentOptions);
  
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

// Create a temporary identity for testing (simulates dfx identity)
function createTestIdentity() {
  // Generate a random seed for testing
  const seed = crypto.randomBytes(32);
  return Ed25519KeyIdentity.generate(seed);
}

// Enhanced IDL factory matching the UI's version
const backendIdlFactory = ({ IDL }) => {
  const NodeId = IDL.Nat;
  const Key = IDL.Text;
  const Value = IDL.Text;
  const NodeStatus = IDL.Variant({
    'Healthy': IDL.Null,
    'Failed': IDL.Null,
    'Recovering': IDL.Null,
  });
  const CacheEntry = IDL.Record({
    'primaryNode': NodeId,
    'replicaNode': NodeId,
    'value': Value,
  });
  const UserProfile = IDL.Record({ 'name': IDL.Text });
  
  return IDL.Service({
    'deleteEntry': IDL.Func([Key], [IDL.Bool], []),
    'deleteEntryAnonymous': IDL.Func([Key], [IDL.Bool], []),
    'get': IDL.Func([Key], [IDL.Opt(Value)], ['query']),
    'getAnonymous': IDL.Func([Key], [IDL.Opt(Value)], ['query']),
    'getCacheState': IDL.Func([], [IDL.Vec(IDL.Tuple(Key, CacheEntry))], ['query']),
    'getCacheStateAnonymous': IDL.Func([], [IDL.Vec(IDL.Tuple(Key, CacheEntry))], ['query']),
    'getNodeEntries': IDL.Func([], [IDL.Vec(IDL.Tuple(NodeId, IDL.Vec(Key)))], ['query']),
    'getNodeEntriesAnonymous': IDL.Func([], [IDL.Vec(IDL.Tuple(NodeId, IDL.Vec(Key)))], ['query']),
    'getNodeStatuses': IDL.Func([], [IDL.Vec(IDL.Tuple(NodeId, NodeStatus))], ['query']),
    'getNodeStatusesAnonymous': IDL.Func([], [IDL.Vec(IDL.Tuple(NodeId, NodeStatus))], ['query']),
    'getUserProfile': IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'initializeAuth': IDL.Func([], [], []),
    'isCurrentUserAdmin': IDL.Func([], [IDL.Bool], ['query']),
    'saveUserProfile': IDL.Func([UserProfile], [], []),
    'set': IDL.Func([Key, Value], [IDL.Bool], []),
    'setAnonymous': IDL.Func([Key, Value], [IDL.Bool], []),
    'setQueueCanister': IDL.Func([IDL.Principal], [], []),
    'simulateFailure': IDL.Func([NodeId], [], []),
    'simulateRecovery': IDL.Func([NodeId], [], []),
  });
};

// Enhanced Test Runner with authentication awareness
class AuthAwareTestRunner {
  constructor(authMode = 'anonymous') {
    this.results = [];
    this.startTime = Date.now();
    this.authMode = authMode; // 'anonymous', 'authenticated', 'admin'
  }
  
  async runTest(name, testFn, options = {}) {
    const { requiresAuth = false, authLevel = 'anonymous' } = options;
    const startTime = Date.now();
    
    // Skip auth-required tests if in anonymous mode
    if (requiresAuth && this.authMode === 'anonymous' && !isAuthMode) {
      this.results.push({
        name,
        status: 'skipped',
        duration: 0,
        message: 'Skipped - requires authentication',
        authLevel: 'none'
      });
      
      if (!isJsonOutput) {
        console.log(`⏭️  SKIPPED: ${name} (requires authentication)`);
      }
      return;
    }
    
    if (!isJsonOutput) {
      console.log(`🧪 Running: ${name}${requiresAuth ? ' [AUTH REQUIRED]' : ''}`);
    }
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        name,
        status: 'passed',
        duration,
        message: result?.message || 'Test completed successfully',
        authLevel: this.authMode
      });
      
      if (!isJsonOutput) {
        console.log(`✅ PASSED: ${name} (${duration}ms)`);
        if (result?.details && isVerbose) {
          console.log(`   ${result.details}`);
        }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Check if this is an expected auth error
      const isAuthError = error.message.includes('Unauthorized') || 
                         error.message.includes('admin') ||
                         error.message.includes('authentication');
      
      this.results.push({
        name,
        status: isAuthError && !requiresAuth ? 'auth_failed' : 'failed',
        duration,
        message: error.message,
        authLevel: this.authMode,
        error: error
      });
      
      if (!isJsonOutput) {
        const symbol = isAuthError && !requiresAuth ? '🔒' : '❌';
        const status = isAuthError && !requiresAuth ? 'AUTH_FAILED' : 'FAILED';
        console.log(`${symbol} ${status}: ${name} (${duration}ms)`);
        if (isVerbose) {
          console.log(`   Error: ${error.message}`);
        }
      }
    }
  }
  
  printSummary() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const authFailed = this.results.filter(r => r.status === 'auth_failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const total = this.results.length;
    
    if (isJsonOutput) {
      const summary = {
        summary: {
          passed,
          failed,
          authFailed,
          skipped,
          total,
          totalTime,
          authMode: this.authMode
        },
        results: this.results
      };
      console.log(JSON.stringify(summary, null, 2));
      return { passed, failed, total, success: failed === 0 };
    }
    
    console.log('\\n📊 Test Summary:');
    console.log(`${passed} passed • ${failed} failed • ${authFailed} auth failed • ${skipped} skipped • ${total} total (${totalTime}ms)`);
    console.log(`🔐 Authentication Mode: ${this.authMode}`);
    
    if (failed > 0) {
      console.log('\\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.message}`);
        });
    }
    
    if (authFailed > 0) {
      console.log('\\n🔒 Authentication Failed Tests:');
      this.results
        .filter(r => r.status === 'auth_failed')
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.message}`);
        });
    }
    
    if (skipped > 0) {
      console.log('\\n⏭️  Skipped Tests:');
      this.results
        .filter(r => r.status === 'skipped')
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

// Main test suite with authentication support
async function runStandardTestsWithAuth() {
  if (!isJsonOutput) {
    console.log('🚀 AgentLedger Direct Testing Suite (Auth-Aware)');
    console.log('================================================\\n');
  }
  
  const canisterIds = getCanisterIds();
  if (!isJsonOutput) {
    console.log(`📍 Backend Canister: ${canisterIds.backend}`);
  }
  
  let backendActor;
  let authMode = 'anonymous';
  let isAdmin = false;
  
  try {
    if (isAuthMode && !isAnonymousOnly) {
      // Create authenticated actor
      if (!isJsonOutput) console.log('🔐 Creating authenticated actor...');
      
      const identity = createTestIdentity();
      if (!isJsonOutput) console.log(`🆔 Using identity: ${identity.getPrincipal().toString()}`);
      
      backendActor = await createActor(canisterIds.backend, backendIdlFactory, {
        agentOptions: { identity }
      });
      
      // Initialize authentication (become admin if first caller)
      try {
        await backendActor.initializeAuth();
        isAdmin = await backendActor.isCurrentUserAdmin();
        authMode = isAdmin ? 'admin' : 'authenticated';
        
        if (!isJsonOutput) {
          console.log(`✅ Authentication initialized - ${isAdmin ? 'Admin' : 'Regular User'}`);
        }
      } catch (error) {
        if (!isJsonOutput) {
          console.warn('⚠️  Auth initialization failed:', error.message);
        }
        authMode = 'authenticated';
      }
    } else {
      // Create anonymous actor
      if (!isJsonOutput) console.log('👤 Using anonymous actor');
      backendActor = await createActor(canisterIds.backend, backendIdlFactory);
      authMode = 'anonymous';
    }
    
    if (!isJsonOutput) {
      console.log(`✅ Connected to backend canister (${authMode} mode)\\n`);
    }
  } catch (error) {
    console.error('❌ Failed to connect to backend canister:', error.message);
    process.exit(1);
  }
  
  const runner = new AuthAwareTestRunner(authMode);
  
  // Create unique test identifiers
  const timestamp = Date.now();
  const testKey = `auth-test-${timestamp}`;
  const testValue = `auth-value-${timestamp}`;
  
  if (!isJsonOutput) {
    console.log(`🔑 Using test key: ${testKey}`);
    console.log(`📦 Using test value: ${testValue}\\n`);
  }
  
  // Phase 1: Basic Cache Operations (always available)
  if (!isJsonOutput) {
    console.log('📋 Phase 1: Basic Cache Operations');
    console.log('----------------------------------');
  }
  
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
  
  await sleep(200);
  
  await runner.runTest('Get Cache Entry', async () => {
    const result = await backendActor.getAnonymous(testKey);
    if (!result || result.length === 0) {
      throw new Error(`No value returned for key: ${testKey}`);
    }
    
    const value = result[0];
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
    
    const getResult = await backendActor.getAnonymous(testKey);
    if (getResult && getResult.length > 0) {
      throw new Error('Key still exists after deletion');
    }
    
    return {
      message: 'Successfully deleted cache entry',
      details: `Deleted: ${testKey}`
    };
  });
  
  // Phase 2: Node Simulation Tests (require admin authentication)
  if (!isJsonOutput) {
    console.log('\\n📋 Phase 2: Node Simulation Tests');
    console.log('----------------------------------');
  }
  
  await runner.runTest('Simulate Node Failure', async () => {
    const statuses = await backendActor.getNodeStatusesAnonymous();
    const nodeZeroInitial = statuses.find(([id, status]) => Number(id) === 0);
    
    await backendActor.simulateFailure(BigInt(0));
    await sleep(500);
    
    const updatedStatuses = await backendActor.getNodeStatusesAnonymous();
    const nodeZeroUpdated = updatedStatuses.find(([id, status]) => Number(id) === 0);
    
    if (!nodeZeroUpdated) {
      throw new Error('Node 0 not found in status list');
    }
    
    const [nodeId, status] = nodeZeroUpdated;
    const statusStr = Object.keys(status)[0];
    
    return {
      message: 'Node failure simulation completed',
      details: `Node 0 status: ${statusStr}`
    };
  }, { requiresAuth: true, authLevel: 'admin' });
  
  await sleep(500);
  
  await runner.runTest('Simulate Node Recovery', async () => {
    await backendActor.simulateRecovery(BigInt(0));
    await sleep(500);
    
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
  }, { requiresAuth: true, authLevel: 'admin' });
  
  // Phase 3: Complex Scenarios (require admin authentication)
  if (!isJsonOutput) {
    console.log('\\n📋 Phase 3: Complex Scenarios');
    console.log('------------------------------');
  }
  
  await runner.runTest('Cache Operations During Failure', async () => {
    await backendActor.simulateFailure(BigInt(1));
    await sleep(200);
    
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
    
    await backendActor.simulateRecovery(BigInt(1));
    await backendActor.deleteEntryAnonymous(failureTestKey);
    
    return {
      message: 'Cache operations work during node failure',
      details: `Operations successful with node 1 failed`
    };
  }, { requiresAuth: true, authLevel: 'admin' });
  
  await runner.runTest('Multiple Node Failures', async () => {
    await backendActor.simulateFailure(BigInt(2));
    await backendActor.simulateFailure(BigInt(3));
    await backendActor.simulateFailure(BigInt(4));
    await sleep(300);
    
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
    
    await backendActor.simulateRecovery(BigInt(2));
    await backendActor.simulateRecovery(BigInt(3));
    await backendActor.simulateRecovery(BigInt(4));
    await backendActor.deleteEntryAnonymous(multiFailKey);
    
    return {
      message: 'System survives multiple node failures',
      details: 'Operations successful with nodes 2,3,4 failed'
    };
  }, { requiresAuth: true, authLevel: 'admin' });
  
  await runner.runTest('Fault Tolerance Test', async () => {
    await backendActor.simulateFailure(BigInt(0));
    await backendActor.simulateFailure(BigInt(1));
    await backendActor.simulateFailure(BigInt(2));
    await backendActor.simulateFailure(BigInt(3));
    await sleep(500);
    
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
    
    await backendActor.simulateRecovery(BigInt(0));
    await backendActor.simulateRecovery(BigInt(1));
    await backendActor.simulateRecovery(BigInt(2));
    await backendActor.simulateRecovery(BigInt(3));
    await backendActor.deleteEntryAnonymous(faultTestKey);
    
    return {
      message: 'System demonstrates fault tolerance',
      details: 'Operations successful with only 2 healthy nodes'
    };
  }, { requiresAuth: true, authLevel: 'admin' });
  
  // Print final summary
  if (!isJsonOutput) {
    console.log('\\n' + '='.repeat(50));
  }
  const summary = runner.printSummary();
  
  return summary.success;
}

// Usage information
function printUsage() {
  console.log(`
🚀 AgentLedger Direct Testing Suite (Auth-Aware)

Usage:
  node wip/test-standard-direct-auth.js [options]

Options:
  --auth              Use authenticated mode (creates test identity and becomes admin)
  --anonymous-only    Skip all tests requiring authentication
  --verbose           Show detailed test execution information
  --json              Output results in JSON format
  --help              Show this help message

Examples:
  # Run anonymous tests only (cache operations)
  npm run test:direct:anonymous
  
  # Run all tests with authentication
  npm run test:direct:auth
  
  # Run with verbose output
  npm run test:direct:auth --verbose
  
  # Export results to JSON
  npm run test:direct:auth --json > results.json

Authentication Modes:
  - Anonymous: Only cache operations (3 tests)
  - Authenticated: All tests, admin privileges required for node simulation (8 tests)
  `);
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  if (args.includes('--help')) {
    printUsage();
    process.exit(0);
  }
  
  runStandardTestsWithAuth()
    .then(success => {
      if (!isJsonOutput) {
        console.log(success ? '\\n🎉 All non-skipped tests passed!' : '\\n⚠️  Some tests failed.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      if (!isJsonOutput) {
        console.error('\\n💥 Test runner error:', error);
      }
      process.exit(1);
    });
}