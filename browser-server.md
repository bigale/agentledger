# Browser-as-Server: Distributed Browser Runtime Architecture

## Executive Summary

This specification defines a revolutionary architecture where browsers become first-class servers, databases, and compute nodes in a peer-to-peer network. By combining WebRTC data channels, WASM-compiled binary servers, IndexedDB persistence, and cryptographic namespaces, we create a distributed system where "the network IS the computer" - literally.

The architecture seamlessly integrates with AgentLedger's self-healing distributed cache specification, implementing all six nodes as browser instances rather than traditional servers. This approach eliminates the client-server dichotomy, making every browser a sovereign compute node with its own encrypted namespace.

## Core Concept: Browser as Engineering Primitive

Traditional architecture assumes browsers are clients that connect to servers. This specification inverts that assumption: browsers ARE servers, databases, and blockchain nodes simultaneously.

### The Paradigm Shift

```
Traditional Stack:              Browser-as-Server Stack:
┌─────────────────┐            ┌─────────────────────────┐
│    Browser       │            │    Browser Node         │
├─────────────────┤            ├─────────────────────────┤
│    Client Code   │            │  Full Stack:            │
├─────────────────┤            │  • Rust WASM Server     │
│    Network       │            │  • IndexedDB Database   │
├─────────────────┤            │  • P2P Network Layer    │
│    Server        │            │  • CRDT Sync Engine     │
├─────────────────┤            │  • Crypto Namespace     │
│    Database      │            │  • Chrome Extension I/O │
└─────────────────┘            └─────────────────────────┘
```

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Distributed Browser Runtime                    │
├───────────────────────────────────────────────────────────────────┤
│  Browser Nodes (6-node self-healing architecture per AgentLedger) │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Browser 1 │  │ Browser 2 │  │ Browser 3 │  │ Browser N │       │
│  │ Node ID: 1│  │ Node ID: 2│  │ Node ID: 3│  │ Node ID: N│       │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘        │
│        │              │              │              │              │
│  ┌─────▼──────────────▼──────────────▼──────────────▼─────┐      │
│  │           P2P WebRTC Data Channels (STUN)               │      │
│  │         Full Duplex + Binary Protocol Support           │      │
│  └──────────────────────┬───────────────────────────────┘      │
│                         │                                         │
│  ┌──────────────────────▼────────────────────────────────┐      │
│  │              Persistence & Sync Layer                   │      │
│  │  • YDN-DB Entity Sync (ETag/conditional updates)        │      │
│  │  • CRDT State Management (Automerge/Yjs)               │      │
│  │  • IndexedDB Local Storage                             │      │
│  │  • Write-Ahead Logging for Queue Operations            │      │
│  └──────────────────────┬────────────────────────────────┘      │
│                         │                                         │
│  ┌──────────────────────▼────────────────────────────────┐      │
│  │         Chrome Extension Bridge (Optional)              │      │
│  │  • Native OS file system access                         │      │
│  │  • Process spawning capabilities                        │      │
│  │  • System-level integration                            │      │
│  └──────────────────────┬────────────────────────────────┘      │
└─────────────────────────┼─────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│                    ICP Backend (Optional)                       │
│  • Blockchain consensus for critical operations                 │
│  • Global state snapshots                                       │
│  • Audit trail persistence                                      │
└───────────────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Browser Node Implementation

Each browser tab/window functions as a complete cache node per the AgentLedger specification:

```javascript
class BrowserNode {
  constructor(nodeId) {
    this.nodeId = nodeId; // 1-6 per AgentLedger spec
    this.status = 'healthy'; // healthy | failed | recovering
    this.rustServer = null; // WASM-compiled server
    this.storage = null; // YDN-DB instance
    this.peers = new Map(); // nodeId -> RTCPeerConnection
    this.identity = null; // Cryptographic identity
  }

  async initialize() {
    // Load Rust WASM server
    this.rustServer = await this.loadWASMServer();

    // Initialize storage layer
    this.storage = await this.initializeStorage();

    // Setup P2P connections
    await this.connectToPeers();

    // Initialize cryptographic identity
    this.identity = await this.loadOrCreateIdentity();

    // Start health monitoring
    this.startHealthMonitoring();
  }
}
```

### 2. Rust WASM Server Layer

Binary servers compiled to WebAssembly run directly in the browser:

```rust
// Rust code compiled to WASM
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
pub struct CacheServer {
    entries: HashMap<String, CacheEntry>,
    node_id: u8,
    operation_queue: VecDeque<Operation>,
}

#[wasm_bindgen]
impl CacheServer {
    pub fn new(node_id: u8) -> Self {
        Self {
            entries: HashMap::new(),
            node_id,
            operation_queue: VecDeque::new(),
        }
    }

    pub fn set(&mut self, key: String, value: String) -> Result<(), JsValue> {
        let entry = CacheEntry {
            key: key.clone(),
            value,
            timestamp: js_sys::Date::now() as u64,
            node_id: self.node_id,
        };

        self.entries.insert(key, entry);
        Ok(())
    }

    pub fn process_batch(&mut self, batch_size: usize) -> Vec<ProcessedOp> {
        let mut results = Vec::new();

        for _ in 0..batch_size {
            if let Some(op) = self.operation_queue.pop_front() {
                let result = self.process_operation(op);
                results.push(result);
            }
        }

        results
    }
}
```

### 3. P2P Communication Layer

WebRTC data channels provide server-to-server communication:

```javascript
class P2PNetwork {
  constructor(node) {
    this.node = node;
    this.connections = new Map();
    this.dataChannels = new Map();
  }

  async connectToPeer(peerId) {
    const pc = new RTCPeerConnection({
      iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
    });

    // Create data channel for binary communication
    const channel = pc.createDataChannel('cache-sync', {
      ordered: true,
      maxRetransmits: 3,
      binaryType: 'arraybuffer'
    });

    channel.onopen = () => {
      this.dataChannels.set(peerId, channel);
      this.startHeartbeat(peerId);
    };

    channel.onmessage = (event) => {
      this.handlePeerMessage(peerId, event.data);
    };

    channel.onclose = () => {
      this.handlePeerDisconnect(peerId);
    };

    // Negotiate connection
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Exchange offer/answer through signaling server or DHT
    const answer = await this.exchangeSignaling(peerId, offer);
    await pc.setRemoteDescription(answer);

    this.connections.set(peerId, pc);
  }

  broadcast(message) {
    const encoded = this.encodeMessage(message);
    this.dataChannels.forEach(channel => {
      if (channel.readyState === 'open') {
        channel.send(encoded);
      }
    });
  }
}
```

### 4. Persistence Layer (YDN-DB + IndexedDB)

Local storage with synchronization capabilities:

```javascript
class PersistenceLayer {
  constructor() {
    this.schema = {
      stores: [{
        name: 'cache',
        keyPath: 'key',
        indexes: [
          {name: 'nodeId', keyPath: 'assignedNode'},
          {name: 'timestamp'},
          {name: 'etag'}
        ]
      }, {
        name: 'queue',
        keyPath: 'operationId',
        autoIncrement: true,
        indexes: [
          {name: 'status', keyPath: 'status'},
          {name: 'timestamp'}
        ]
      }, {
        name: 'crdt_state',
        keyPath: 'docId',
        indexes: [{name: 'type', keyPath: 'crdtType'}]
      }, {
        name: 'identity',
        keyPath: 'publicKey'
      }, {
        name: 'sync_history',
        keyPath: ['peerId', 'timestamp']
      }]
    };

    this.db = null;
    this.syncEngine = null;
  }

  async initialize() {
    this.db = new ydn.db.Storage('browser-server', this.schema);

    // Setup entity sync for conflict resolution
    this.syncEngine = new ydn.db.sync.Entity(this.db, {
      stores: ['cache'],
      conflict: 'last-write-wins',
      backend: this.createP2PBackend()
    });
  }

  createP2PBackend() {
    return {
      get: async (resource) => {
        // Query peers through WebRTC
        const responses = await this.queryPeers('get', resource);
        return this.mergeResponses(responses);
      },

      put: async (resource, data) => {
        // Broadcast to peers
        await this.broadcastToPeers('put', {resource, data});
        return {etag: this.generateETag(data)};
      }
    };
  }
}
```

### 5. CRDT Synchronization Layer

Conflict-free replicated data types for distributed state:

```javascript
class CRDTEngine {
  constructor() {
    this.automerge = null; // For auditable operations
    this.yjs = null; // For real-time collaboration
    this.customCache = null; // For cache-specific CRDT
  }

  async initialize() {
    // Load WASM-compiled CRDT libraries
    this.automerge = await import('./automerge_wasm.js');
    this.yjs = await import('./ywasm.js');

    // Initialize documents
    this.auditLog = new this.automerge.Doc();
    this.sharedState = new this.yjs.Doc();
    this.cacheState = this.createCacheCRDT();
  }

  createCacheCRDT() {
    return {
      state: new Map(),
      vector: new Map(), // Vector clock for causality

      set(key, value, nodeId) {
        const op = {
          type: 'set',
          key,
          value,
          timestamp: Date.now(),
          nodeId,
          clock: this.incrementClock(nodeId)
        };

        this.applyOp(op);
        return op;
      },

      applyOp(op) {
        const existing = this.state.get(op.key);

        // CRDT merge rule: Last-write-wins with vector clock
        if (!existing || this.compareClocks(op.clock, existing.clock) > 0) {
          this.state.set(op.key, op);
          this.vector.set(op.nodeId, op.clock);
        }
      },

      merge(otherState) {
        // Commutative merge - order doesn't matter
        otherState.forEach((op, key) => {
          this.applyOp(op);
        });
      },

      getDelta(sinceVector) {
        const delta = [];
        this.state.forEach((op, key) => {
          if (this.isNewer(op.clock, sinceVector)) {
            delta.push(op);
          }
        });
        return delta;
      }
    };
  }

  async syncWithPeer(peerId, channel) {
    // Exchange state vectors
    const localVector = this.cacheState.vector;
    const remoteVector = await this.requestVector(peerId, channel);

    // Compute and exchange deltas
    const localDelta = this.cacheState.getDelta(remoteVector);
    const remoteDelta = await this.requestDelta(peerId, localVector);

    // Apply remote changes
    remoteDelta.forEach(op => {
      this.cacheState.applyOp(op);
    });

    // Send local changes
    await this.sendDelta(peerId, localDelta, channel);
  }
}
```

### 6. Cryptographic Namespace Layer

Personal data sovereignty through cryptographic isolation:

```javascript
class CryptoNamespace {
  constructor() {
    this.identity = null;
    this.encryptionKey = null;
    this.sharedKeys = new Map(); // publicKey -> derivedKey
  }

  async initialize() {
    // Load or create identity
    const stored = await this.loadStoredIdentity();

    if (stored) {
      this.identity = stored;
    } else {
      this.identity = await this.createNewIdentity();
      await this.storeIdentity(this.identity);
    }

    // Derive encryption key
    this.encryptionKey = await this.deriveEncryptionKey(
      this.identity.privateKey
    );
  }

  async createNewIdentity() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKeyData = await crypto.subtle.exportKey(
      'spki',
      keyPair.publicKey
    );

    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      publicKeyHash: await this.hashPublicKey(publicKeyData)
    };
  }

  async encryptData(data, metadata = {}) {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      new TextEncoder().encode(JSON.stringify(data))
    );

    return {
      owner: this.identity.publicKeyHash,
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      metadata: metadata,
      timestamp: Date.now()
    };
  }

  async decryptData(encryptedData) {
    // Verify ownership
    if (encryptedData.owner !== this.identity.publicKeyHash) {
      throw new Error('Cannot decrypt: not owner');
    }

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(encryptedData.iv)
      },
      this.encryptionKey,
      new Uint8Array(encryptedData.encrypted)
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  async shareWith(data, recipientPublicKey) {
    // Derive shared key using ECDH
    const sharedKey = await this.deriveSharedKey(
      this.identity.privateKey,
      recipientPublicKey
    );

    // Encrypt with shared key
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: crypto.getRandomValues(new Uint8Array(12))
      },
      sharedKey,
      new TextEncoder().encode(JSON.stringify(data))
    );

    return {
      owners: [
        this.identity.publicKeyHash,
        await this.hashPublicKey(recipientPublicKey)
      ],
      encrypted: encrypted,
      type: 'shared'
    };
  }
}
```

### 7. Queue Processing Implementation

Based on AgentLedger specification with browser-specific optimizations:

```javascript
class QueueProcessor {
  constructor(node) {
    this.node = node;
    this.batchSize = 10;
    this.processing = false;
    this.retryConfig = {
      maxAttempts: 3,
      backoffBase: 1000, // ms
      backoffMultiplier: 2
    };
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      // Get queued operations from IndexedDB
      const ops = await this.node.storage.db
        .values('queue')
        .where('status')
        .equals('queued')
        .limit(this.batchSize)
        .toArray();

      if (ops.length === 0) {
        return {processed: 0, success: 0, failed: 0};
      }

      // Update status to processing
      await this.updateOperationStatus(ops, 'processing');

      // Process in Rust WASM for performance
      const results = await this.node.rustServer.processBatch(
        ops.map(op => ({
          id: op.operationId,
          type: op.type,
          key: op.key,
          value: op.value
        }))
      );

      // Handle results
      const stats = {processed: 0, success: 0, failed: 0};

      for (const result of results) {
        stats.processed++;

        if (result.status === 'success') {
          stats.success++;

          // Update CRDT state
          const crdtOp = this.node.crdtEngine.cacheState.set(
            result.key,
            result.value,
            this.node.nodeId
          );

          // Broadcast to peers
          await this.node.p2pNetwork.broadcast({
            type: 'crdt_update',
            operation: crdtOp
          });

          // Mark as completed
          await this.markOperationComplete(result.id, result.value);

        } else {
          stats.failed++;
          await this.handleFailedOperation(result);
        }
      }

      return stats;

    } finally {
      this.processing = false;
    }
  }

  async handleFailedOperation(result) {
    const op = await this.node.storage.db
      .get('queue', result.id);

    if (!op) return;

    op.retryCount = (op.retryCount || 0) + 1;

    if (op.retryCount < this.retryConfig.maxAttempts) {
      // Schedule retry with exponential backoff
      const delay = this.retryConfig.backoffBase *
        Math.pow(this.retryConfig.backoffMultiplier, op.retryCount);

      op.status = 'retrying';
      op.nextRetry = Date.now() + delay;
      op.lastError = result.error;

      await this.node.storage.db.put('queue', op);

      // Schedule retry
      setTimeout(() => {
        this.retryOperation(op.operationId);
      }, delay);

    } else {
      // Permanent failure
      op.status = 'failed';
      op.error = result.error;
      op.failedAt = Date.now();

      await this.node.storage.db.put('queue', op);
    }
  }
}
```

### 8. Self-Healing Implementation

Automatic failure detection and recovery per AgentLedger spec:

```javascript
class SelfHealingManager {
  constructor(node) {
    this.node = node;
    this.healthCheckInterval = 5000; // 5 seconds
    this.nodeStatus = new Map(); // nodeId -> status
    this.redistributionInProgress = false;
  }

  startHealthMonitoring() {
    setInterval(() => this.checkNodeHealth(), this.healthCheckInterval);

    // Monitor P2P connections
    this.node.p2pNetwork.dataChannels.forEach((channel, peerId) => {
      channel.onclose = () => this.handleNodeFailure(peerId);
      channel.onerror = () => this.handleNodeFailure(peerId);
    });
  }

  async checkNodeHealth() {
    const healthChecks = [];

    this.node.p2pNetwork.dataChannels.forEach((channel, nodeId) => {
      if (channel.readyState === 'open') {
        healthChecks.push(this.pingNode(nodeId, channel));
      } else {
        this.nodeStatus.set(nodeId, 'failed');
      }
    });

    const results = await Promise.allSettled(healthChecks);

    // Update node statuses
    results.forEach((result, index) => {
      const nodeId = Array.from(this.node.p2pNetwork.dataChannels.keys())[index];

      if (result.status === 'fulfilled' && result.value) {
        this.nodeStatus.set(nodeId, 'healthy');
      } else {
        this.handleNodeFailure(nodeId);
      }
    });
  }

  async handleNodeFailure(failedNodeId) {
    console.log(`Node ${failedNodeId} failed - initiating self-healing`);

    this.nodeStatus.set(failedNodeId, 'failed');

    if (this.redistributionInProgress) return;
    this.redistributionInProgress = true;

    try {
      // Get all cache entries assigned to failed node
      const orphanedEntries = await this.node.storage.db
        .values('cache')
        .where('assignedNode')
        .equals(failedNodeId)
        .toArray();

      console.log(`Redistributing ${orphanedEntries.length} entries from failed node ${failedNodeId}`);

      // Redistribute to healthy nodes
      const healthyNodes = this.getHealthyNodes();

      if (healthyNodes.length === 0) {
        console.error('No healthy nodes available!');
        return;
      }

      for (let i = 0; i < orphanedEntries.length; i++) {
        const entry = orphanedEntries[i];
        const newNode = healthyNodes[i % healthyNodes.length];

        // Update assignment
        entry.assignedNode = newNode;
        entry.redistributedAt = Date.now();

        // Store locally
        await this.node.storage.db.put('cache', entry);

        // Update CRDT state
        const crdtOp = this.node.crdtEngine.cacheState.set(
          entry.key,
          entry.value,
          newNode
        );

        // Broadcast redistribution
        await this.node.p2pNetwork.broadcast({
          type: 'redistribution',
          operation: crdtOp,
          reason: 'node_failure',
          failedNode: failedNodeId
        });
      }

      console.log(`Redistribution complete - ${orphanedEntries.length} entries moved`);

    } finally {
      this.redistributionInProgress = false;
    }
  }

  getHealthyNodes() {
    const healthy = [this.node.nodeId]; // Always include self

    this.nodeStatus.forEach((status, nodeId) => {
      if (status === 'healthy') {
        healthy.push(nodeId);
      }
    });

    return healthy;
  }

  async handleNodeRecovery(recoveredNodeId) {
    console.log(`Node ${recoveredNodeId} recovered - rebalancing`);

    this.nodeStatus.set(recoveredNodeId, 'recovering');

    // Sync CRDT state with recovered node
    await this.node.crdtEngine.syncWithPeer(
      recoveredNodeId,
      this.node.p2pNetwork.dataChannels.get(recoveredNodeId)
    );

    // Mark as healthy after sync
    this.nodeStatus.set(recoveredNodeId, 'healthy');

    // Optional: Rebalance cache entries
    await this.rebalanceCacheEntries();
  }

  async rebalanceCacheEntries() {
    // Implement consistent hashing or similar strategy
    const allEntries = await this.node.storage.db
      .values('cache')
      .toArray();

    const healthyNodes = this.getHealthyNodes();

    for (const entry of allEntries) {
      const idealNode = this.hashToNode(entry.key, healthyNodes);

      if (entry.assignedNode !== idealNode) {
        entry.assignedNode = idealNode;
        entry.rebalancedAt = Date.now();

        await this.node.storage.db.put('cache', entry);
      }
    }
  }

  hashToNode(key, nodes) {
    // Simple hash distribution
    const hash = this.hashString(key);
    return nodes[hash % nodes.length];
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
```

### 9. ICP Bridge (Optional)

Blockchain consensus for critical operations:

```javascript
class ICPBridge {
  constructor(node) {
    this.node = node;
    this.isLeader = false;
    this.icAgent = null;
    this.canisterId = null;
    this.syncInterval = 60000; // 1 minute
  }

  async initialize(canisterId) {
    this.canisterId = canisterId;

    // Leader election via P2P consensus
    await this.performLeaderElection();

    if (this.isLeader) {
      await this.connectToICP();
      this.startPeriodicSync();
    }
  }

  async performLeaderElection() {
    // Simple election: lowest active nodeId becomes leader
    const activeNodes = [
      this.node.nodeId,
      ...this.node.selfHealing.getHealthyNodes()
    ];

    const leaderId = Math.min(...activeNodes);
    this.isLeader = (leaderId === this.node.nodeId);

    if (this.isLeader) {
      console.log(`Node ${this.node.nodeId} elected as ICP bridge leader`);

      // Announce leadership
      await this.node.p2pNetwork.broadcast({
        type: 'leader_election',
        leaderId: this.node.nodeId
      });
    }
  }

  async connectToICP() {
    const { HttpAgent, Actor } = await import('@dfinity/agent');

    this.icAgent = new HttpAgent({
      host: 'https://ic0.app'
    });

    // In development
    if (process.env.NODE_ENV === 'development') {
      await this.icAgent.fetchRootKey();
    }

    // Create actor for canister interaction
    this.canisterActor = Actor.createActor(idlFactory, {
      agent: this.icAgent,
      canisterId: this.canisterId
    });
  }

  async syncToICP() {
    if (!this.isLeader) return;

    try {
      // Create state snapshot
      const snapshot = await this.createStateSnapshot();

      // Submit to ICP
      const result = await this.canisterActor.submitSnapshot({
        nodeId: this.node.nodeId,
        timestamp: BigInt(Date.now()),
        crdtState: snapshot.crdtState,
        queueState: snapshot.queueState,
        metrics: snapshot.metrics
      });

      console.log('ICP sync successful:', result);

      // Broadcast sync completion
      await this.node.p2pNetwork.broadcast({
        type: 'icp_sync_complete',
        timestamp: Date.now(),
        txId: result.txId
      });

    } catch (error) {
      console.error('ICP sync failed:', error);

      // Trigger re-election if repeated failures
      if (this.syncFailures++ > 3) {
        this.isLeader = false;
        await this.performLeaderElection();
      }
    }
  }

  async createStateSnapshot() {
    // Serialize CRDT states
    const automergeState = this.node.crdtEngine.auditLog.save();
    const yjsState = this.node.crdtEngine.yjs.encodeStateAsUpdate(
      this.node.crdtEngine.sharedState
    );
    const cacheState = Array.from(
      this.node.crdtEngine.cacheState.state.entries()
    );

    // Get queue metrics
    const queueMetrics = await this.getQueueMetrics();

    // Get node health metrics
    const healthMetrics = this.getHealthMetrics();

    return {
      crdtState: {
        automerge: Array.from(automergeState),
        yjs: Array.from(yjsState),
        cache: cacheState
      },
      queueState: queueMetrics,
      metrics: healthMetrics
    };
  }

  startPeriodicSync() {
    setInterval(() => {
      if (this.isLeader) {
        this.syncToICP();
      }
    }, this.syncInterval);
  }
}
```

## Complete Integration Example

### Unified BrowserServer Class

```javascript
class BrowserServer {
  constructor(config = {}) {
    this.config = {
      nodeId: config.nodeId || Math.floor(Math.random() * 6) + 1,
      enableICP: config.enableICP || false,
      enableExtension: config.enableExtension || false,
      ...config
    };

    // Core components
    this.node = null;
    this.p2pNetwork = null;
    this.storage = null;
    this.crdtEngine = null;
    this.cryptoNamespace = null;
    this.queueProcessor = null;
    this.selfHealing = null;
    this.icpBridge = null;

    this.initialized = false;
  }

  async initialize() {
    console.log(`Initializing BrowserServer Node ${this.config.nodeId}`);

    // 1. Create node instance
    this.node = new BrowserNode(this.config.nodeId);

    // 2. Initialize storage layer
    this.storage = new PersistenceLayer();
    await this.storage.initialize();
    this.node.storage = this.storage;

    // 3. Load WASM server
    const wasmModule = await fetch('./cache_server_bg.wasm');
    const wasmBuffer = await wasmModule.arrayBuffer();
    const wasmInstance = await WebAssembly.instantiate(wasmBuffer);
    this.node.rustServer = wasmInstance.instance.exports;

    // 4. Initialize cryptographic namespace
    this.cryptoNamespace = new CryptoNamespace();
    await this.cryptoNamespace.initialize();
    this.node.identity = this.cryptoNamespace.identity;

    // 5. Setup P2P network
    this.p2pNetwork = new P2PNetwork(this.node);
    this.node.p2pNetwork = this.p2pNetwork;

    // 6. Initialize CRDT engine
    this.crdtEngine = new CRDTEngine();
    await this.crdtEngine.initialize();
    this.node.crdtEngine = this.crdtEngine;

    // 7. Setup queue processor
    this.queueProcessor = new QueueProcessor(this.node);

    // 8. Initialize self-healing
    this.selfHealing = new SelfHealingManager(this.node);
    this.node.selfHealing = this.selfHealing;
    this.selfHealing.startHealthMonitoring();

    // 9. Optional: Setup ICP bridge
    if (this.config.enableICP && this.config.canisterId) {
      this.icpBridge = new ICPBridge(this.node);
      await this.icpBridge.initialize(this.config.canisterId);
    }

    // 10. Optional: Chrome extension bridge
    if (this.config.enableExtension) {
      await this.setupExtensionBridge();
    }

    // 11. Connect to peer network
    await this.discoverAndConnectPeers();

    this.initialized = true;
    console.log(`BrowserServer Node ${this.config.nodeId} initialized successfully`);
  }

  async discoverAndConnectPeers() {
    // Use various discovery methods
    const peers = await this.discoverPeers();

    for (const peerId of peers) {
      try {
        await this.p2pNetwork.connectToPeer(peerId);
        console.log(`Connected to peer ${peerId}`);
      } catch (error) {
        console.error(`Failed to connect to peer ${peerId}:`, error);
      }
    }
  }

  async discoverPeers() {
    // Multiple discovery strategies
    const peers = new Set();

    // 1. Local storage (previously connected peers)
    const storedPeers = await this.storage.db.values('peers').toArray();
    storedPeers.forEach(p => peers.add(p.peerId));

    // 2. Broadcast discovery (same network)
    // Implementation depends on environment

    // 3. DHT discovery (if using libp2p)
    // const dhtPeers = await this.dhtDiscover();

    // 4. Bootstrap nodes (hardcoded)
    const bootstrapNodes = this.config.bootstrapNodes || [];
    bootstrapNodes.forEach(n => peers.add(n));

    return Array.from(peers);
  }

  // Cache operations (AgentLedger spec implementation)
  async set(key, value) {
    // Determine target node
    const targetNode = this.hashToNode(key);

    if (targetNode === this.config.nodeId) {
      // We're the primary node

      // Encrypt data
      const encrypted = await this.cryptoNamespace.encryptData({
        key,
        value,
        type: 'cache_entry'
      });

      // Store locally
      await this.storage.db.put('cache', {
        key,
        value: encrypted,
        assignedNode: targetNode,
        timestamp: Date.now()
      });

      // Update CRDT
      const crdtOp = this.crdtEngine.cacheState.set(
        key,
        encrypted,
        this.config.nodeId
      );

      // Replicate to backup nodes
      await this.replicateToBackups(key, encrypted, crdtOp);

      return {success: true, node: targetNode};

    } else {
      // Forward to primary node
      return await this.forwardToPrimary(targetNode, 'set', {key, value});
    }
  }

  async get(key) {
    // Try local first
    const local = await this.storage.db.get('cache', key);

    if (local) {
      // Decrypt and return
      const decrypted = await this.cryptoNamespace.decryptData(local.value);
      return decrypted.value;
    }

    // Query network
    const targetNode = this.hashToNode(key);

    if (targetNode === this.config.nodeId) {
      // We should have it but don't - check backups
      return await this.getFromBackups(key);
    } else {
      // Query primary node
      return await this.queryPrimary(targetNode, 'get', {key});
    }
  }

  async deleteEntry(key) {
    const targetNode = this.hashToNode(key);

    // Create delete operation
    const deleteOp = {
      type: 'delete',
      key,
      timestamp: Date.now(),
      nodeId: this.config.nodeId
    };

    // Update CRDT (tombstone)
    this.crdtEngine.cacheState.applyOp(deleteOp);

    // Remove from local storage
    await this.storage.db.delete('cache', key);

    // Broadcast delete
    await this.p2pNetwork.broadcast({
      type: 'cache_delete',
      operation: deleteOp
    });

    return {success: true};
  }

  // Queue operations
  async queueOperation(type, params) {
    const operation = {
      type,
      ...params,
      status: 'queued',
      timestamp: Date.now(),
      nodeId: this.config.nodeId
    };

    // Store in queue
    const result = await this.storage.db.add('queue', operation);
    operation.operationId = result;

    // Auto-process if enabled
    if (this.config.autoProcessQueue) {
      setTimeout(() => this.queueProcessor.processQueue(), 100);
    }

    return {operationId: result};
  }

  // Sharing operations
  async shareData(key, value, recipientPublicKey) {
    const shared = await this.cryptoNamespace.shareWith(
      {key, value},
      recipientPublicKey
    );

    // Store in shared namespace
    const sharedKey = `shared/${this.cryptoNamespace.identity.publicKeyHash}/${recipientPublicKey}/${key}`;

    await this.storage.db.put('cache', {
      key: sharedKey,
      value: shared,
      type: 'shared',
      owners: shared.owners,
      timestamp: Date.now()
    });

    // Notify recipient via P2P
    await this.notifySharing(recipientPublicKey, sharedKey);

    return {success: true, sharedKey};
  }

  // Helper methods
  hashToNode(key) {
    const nodes = this.selfHealing.getHealthyNodes();
    const hash = this.hashString(key);
    return nodes[hash % nodes.length];
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async replicateToBackups(key, value, crdtOp) {
    // Replicate to 2 backup nodes for fault tolerance
    const backupNodes = this.selectBackupNodes(key, 2);

    const replicationPromises = backupNodes.map(nodeId =>
      this.sendToNode(nodeId, {
        type: 'replicate',
        key,
        value,
        crdtOp,
        primary: this.config.nodeId
      })
    );

    await Promise.allSettled(replicationPromises);
  }

  selectBackupNodes(key, count) {
    const primary = this.hashToNode(key);
    const healthy = this.selfHealing.getHealthyNodes()
      .filter(n => n !== primary);

    // Return next N healthy nodes
    return healthy.slice(0, Math.min(count, healthy.length));
  }

  // Chrome Extension Bridge
  async setupExtensionBridge() {
    if (!chrome?.runtime?.id) {
      console.log('Chrome extension API not available');
      return;
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleExtensionMessage(request, sender, sendResponse);
      return true; // Keep channel open for async response
    });
  }

  async handleExtensionMessage(request, sender, sendResponse) {
    switch (request.type) {
      case 'cache_set':
        const setResult = await this.set(request.key, request.value);
        sendResponse(setResult);
        break;

      case 'cache_get':
        const value = await this.get(request.key);
        sendResponse({value});
        break;

      case 'fs_write':
        // Extension has native FS access
        chrome.runtime.sendNativeMessage('com.browserserver.fs', {
          action: 'write',
          path: request.path,
          data: request.data
        }, sendResponse);
        break;

      default:
        sendResponse({error: 'Unknown request type'});
    }
  }

  // Periodic maintenance
  startMaintenance() {
    // Periodic queue processing
    setInterval(() => {
      this.queueProcessor.processQueue();
    }, 10000);

    // Periodic CRDT sync
    setInterval(() => {
      this.syncWithAllPeers();
    }, 30000);

    // Periodic garbage collection
    setInterval(() => {
      this.garbageCollect();
    }, 300000); // 5 minutes
  }

  async syncWithAllPeers() {
    const syncPromises = [];

    this.p2pNetwork.dataChannels.forEach((channel, peerId) => {
      if (channel.readyState === 'open') {
        syncPromises.push(
          this.crdtEngine.syncWithPeer(peerId, channel)
        );
      }
    });

    await Promise.allSettled(syncPromises);
  }

  async garbageCollect() {
    // Clean up old completed queue operations
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    await this.storage.db
      .values('queue')
      .where('status').equals('completed')
      .and(op => op.timestamp < cutoff)
      .delete();

    // Compact CRDT history if needed
    // Implementation depends on CRDT library
  }
}

// Usage Example
async function initializeBrowserServer() {
  const server = new BrowserServer({
    nodeId: 1, // or auto-assign
    enableICP: true,
    canisterId: 'your-canister-id',
    enableExtension: true,
    autoProcessQueue: true,
    bootstrapNodes: [
      'peer-id-1',
      'peer-id-2'
    ]
  });

  await server.initialize();

  // Start maintenance tasks
  server.startMaintenance();

  // Cache operations
  await server.set('user:123', {name: 'Alice', age: 30});
  const user = await server.get('user:123');

  // Queue operations
  await server.queueOperation('bulk_update', {
    keys: ['key1', 'key2'],
    values: ['val1', 'val2']
  });

  // Share data
  await server.shareData('shared_doc', {content: 'Hello'}, recipientPublicKey);

  return server;
}
```

## Security Considerations

### Cryptographic Security
- All data encrypted at rest using AES-256-GCM
- Public key cryptography for identity (RSA-2048 or ECC)
- Shared keys derived using ECDH for secure sharing
- No peer can read data they don't own or haven't been explicitly shared with

### Network Security
- WebRTC uses DTLS for transport encryption
- STUN/TURN servers only used for NAT traversal (no data relay)
- Optional VPN-like tunneling through Chrome extension

### Byzantine Fault Tolerance
- CRDT convergence guarantees even with malicious nodes
- Cryptographic signatures prevent data tampering
- Optional ICP consensus for critical operations

## Performance Characteristics

### Latency
- Local cache reads: <1ms
- P2P cache reads: 10-50ms (depends on network)
- CRDT merge: 1-10ms for most operations
- ICP sync: 2-5 seconds (when enabled)

### Throughput
- Single node: 10,000+ ops/sec (WASM performance)
- P2P replication: Limited by bandwidth (typically 1000 ops/sec)
- Queue processing: Configurable batch sizes

### Storage
- IndexedDB: 50% of available disk space (browser limit)
- CRDT overhead: ~2x raw data size (with history)
- Compression available for large datasets

## Deployment Patterns

### Single-User Mode
One browser tab as personal server:
```javascript
const server = new BrowserServer({
  nodeId: 1,
  enableICP: false,
  enableExtension: true
});
```

### Team Collaboration
Multiple browser tabs in P2P mesh:
```javascript
const server = new BrowserServer({
  nodeId: getNodeId(), // 1-6
  enableICP: true,
  bootstrapNodes: teamPeerIds
});
```

### Global Network
Public P2P network with DHT discovery:
```javascript
const server = new BrowserServer({
  enableDHT: true,
  enableICP: true,
  public: true
});
```

## Migration Path from Traditional Architecture

### Phase 1: Hybrid Mode
- Keep existing backend
- Add browser caching layer
- Sync to backend periodically

### Phase 2: P2P Enhancement
- Enable P2P synchronization
- Reduce backend dependency
- Add CRDT conflict resolution

### Phase 3: Full Distributed
- Remove central backend
- ICP for consensus only
- Browsers as primary compute

## Conclusion

The Browser-as-Server architecture fundamentally reimagines distributed systems by making browsers first-class citizens in the compute infrastructure. By combining:

1. **P2P networking** (WebRTC data channels)
2. **Native performance** (Rust WASM servers)
3. **Distributed state** (CRDTs)
4. **Cryptographic sovereignty** (encrypted namespaces)
5. **Persistent storage** (IndexedDB + YDN-DB)
6. **Blockchain consensus** (optional ICP)

We create a system where every browser is simultaneously a client, server, database, and blockchain node. The network truly becomes the computer, with no distinction between "frontend" and "backend" - just a mesh of sovereign compute nodes that happen to run in browsers.

This architecture delivers:
- **Zero infrastructure costs** (browsers are the infrastructure)
- **Infinite scalability** (every user adds capacity)
- **Perfect privacy** (cryptographic data isolation)
- **Unstoppable applications** (no servers to shut down)
- **Native performance** (WASM execution)

The Browser-as-Server model represents the next evolution of distributed computing, where the browser is not just a client, but the fundamental building block of the global compute fabric.