// Backend type definitions and actor creation for AgentLedger
// These types match the Motoko backend canister interfaces

import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

export type Key = string;
export type Value = string;
export type NodeId = number;

export interface CacheEntry {
  value: Value;
  primaryNode: NodeId;
  replicaNode: NodeId;
}

// IC canister returns variants as objects like { Healthy: null }
export type NodeStatusVariant = { Healthy: null } | { Failed: null } | { Recovering: null };
export type NodeStatus = 'Healthy' | 'Failed' | 'Recovering';

// Utility function to convert IC variant to string
export function nodeStatusFromVariant(variant: NodeStatusVariant): NodeStatus {
  if ('Healthy' in variant) return 'Healthy';
  if ('Failed' in variant) return 'Failed';
  if ('Recovering' in variant) return 'Recovering';
  throw new Error(`Unknown NodeStatus variant: ${JSON.stringify(variant)}`);
}

export interface UserProfile {
  name: string;
}

// Queue operation types
export interface QueueOperation {
  Set?: { key: Key; value: Value };
  Get?: { key: Key };
  Delete?: { key: Key };
}

export type OperationId = string;

export type OperationStatus = 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Retrying';

export interface OperationResult {
  SetResult?: boolean;
  GetResult?: Value | null;
  DeleteResult?: boolean;
  Error?: string;
}

export interface OperationStatusInfo {
  id: OperationId;
  status: OperationStatus;
  queuedAt: number;
  processingStartedAt?: number;
  completedAt?: number;
  result?: OperationResult;
  errorMessage?: string;
  retryCount: number;
}

export interface QueueStatistics {
  totalOperationsQueued: number;
  totalOperationsCompleted: number;
  totalOperationsFailed: number;
  currentQueueDepth: number;
  currentlyProcessing: number;
  maxQueueSize: number;
  nextQueuePosition: number;
}

export interface ProcessingStatistics {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  processingDurationMs: number;
}

export interface ProcessQueueResult {
  processedOperationIds: OperationId[];
  successfulOperations: OperationId[];
  failedOperations: OperationId[];
  operationStatuses: [OperationId, OperationStatus][];
  errors: [OperationId, string][];
  processingStatistics: ProcessingStatistics;
  queueStateAfterProcessing: {
    remainingQueueDepth: number;
    nextBatchAvailable: boolean;
  };
  cyclesConsumed: number;
  memoryUsed: number;
  batchTerminatedEarly: boolean;
  earlyTerminationReason?: string;
}

// Backend canister interface
export interface BackendActor {
  // Cache operations (authenticated)
  set: (key: Key, value: Value) => Promise<boolean>;
  get: (key: Key) => Promise<Value | null>;
  deleteEntry: (key: Key) => Promise<boolean>;
  
  // Cache operations (anonymous for local development)
  setAnonymous: (key: Key, value: Value) => Promise<boolean>;
  getAnonymous: (key: Key) => Promise<Value | null>;
  deleteEntryAnonymous: (key: Key) => Promise<boolean>;
  
  // State queries
  getCacheState: () => Promise<[Key, CacheEntry][]>;
  getNodeStatuses: () => Promise<[NodeId, NodeStatusVariant][]>;
  getNodeEntries: () => Promise<[NodeId, Key[]][]>;
  
  // State queries (anonymous for local development)
  getCacheStateAnonymous: () => Promise<[Key, CacheEntry][]>;
  getNodeStatusesAnonymous: () => Promise<[NodeId, NodeStatusVariant][]>;
  getNodeEntriesAnonymous: () => Promise<[NodeId, Key[]][]>;
  
  // Node simulation
  simulateFailure: (nodeId: NodeId) => Promise<void>;
  simulateRecovery: (nodeId: NodeId) => Promise<void>;
  
  // Authentication
  initializeAuth: () => Promise<void>;
  isCurrentUserAdmin: () => Promise<boolean>;
  setQueueCanister: (queueId: string) => Promise<void>;
  
  // User profile
  getUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
}

// Queue canister interface
export interface QueueActor {
  // Queue operations
  queueOperation: (operation: QueueOperation) => Promise<{ ok: OperationId } | { err: string }>;
  processQueue: (batchSize: number) => Promise<ProcessQueueResult>;
  
  // Status and monitoring
  getOperationStatus: (operationId: OperationId) => Promise<OperationStatusInfo | null>;
  getOperationStatuses: (operationIds: OperationId[]) => Promise<(OperationStatusInfo | null)[]>;
  getQueueStatistics: () => Promise<QueueStatistics>;
  getQueueState: () => Promise<[number, OperationStatusInfo][]>;
  
  // Configuration
  configureCacheCanister: (canisterId: string) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  isCurrentUserAdmin: () => Promise<boolean>;
  
  // Maintenance and health
  clearCompletedOperations: () => Promise<number>;
  resetInterCanisterCallStatistics: () => Promise<boolean>;
  
  // User profile
  getUserProfile: () => Promise<UserProfile | null>;
  saveUserProfile: (profile: UserProfile) => Promise<void>;
}

// Export for compatibility with existing code
export type backendInterface = BackendActor;

// Canister IDs - these will be set from environment variables
const BACKEND_CANISTER_ID = process.env.BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
const QUEUE_CANISTER_ID = process.env.QUEUE_CANISTER_ID || 'uzt4z-lp777-77774-qaabq-cai';

// Determine the IC replica host dynamically
function getICHost(): string {
  // If we're in a browser environment
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host;
    const currentProtocol = window.location.protocol;
    
    // If accessing via canister subdomain (like u6s2n-gx777-77774-qaaba-cai.localhost:8080)
    if (currentHost.includes('.localhost:') || currentHost.includes('.127.0.0.1:')) {
      // Extract the port and use 127.0.0.1 with the same port
      const port = currentHost.split(':')[1] || '8080';
      return `${currentProtocol}//127.0.0.1:${port}`;
    }
    
    // If accessing via 127.0.0.1 directly
    if (currentHost.startsWith('127.0.0.1:') || currentHost.startsWith('localhost:')) {
      return `${currentProtocol}//${currentHost}`;
    }
  }
  
  // Default fallback for local development
  return 'http://127.0.0.1:8080';
}

const IC_HOST = getICHost();

// IDL factory for backend canister
const backendIdlFactory = ({ IDL }: any) => {
  const NodeId = IDL.Nat;
  const Key = IDL.Text;
  const Value = IDL.Text;
  const NodeStatus = IDL.Variant({
    'Failed': IDL.Null,
    'Healthy': IDL.Null,
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

// Actor creation function
export const createActor = async (options?: { agentOptions?: any }): Promise<BackendActor> => {
  console.log('Creating actor with canister ID:', BACKEND_CANISTER_ID);
  console.log('Using host:', IC_HOST);
  
  // For local development, we need to disable certificate verification
  const isLocalDevelopment = IC_HOST.includes('127.0.0.1') || IC_HOST.includes('localhost');
  
  const agentOptions = {
    host: IC_HOST,
    ...options?.agentOptions,
  };
  
  // For local development, disable signature verification to avoid delegation errors
  if (isLocalDevelopment) {
    agentOptions.verifyQuerySignatures = false;
  }
  
  const agent = new HttpAgent(agentOptions);

  // Always fetch root key for local development to avoid signature verification issues
  if (isLocalDevelopment) {
    console.log('Fetching root key for local development...');
    try {
      await agent.fetchRootKey();
      console.log('Root key fetched successfully');
    } catch (err) {
      console.warn('Unable to fetch root key. This may cause signature verification issues.');
      console.error(err);
    }
  }

  console.log('Creating actor...');
  const actor = Actor.createActor(backendIdlFactory, {
    agent,
    canisterId: BACKEND_CANISTER_ID,
  }) as BackendActor;
  
  console.log('Actor created successfully');
  return actor;
};