import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Types for queue operations
interface QueueOperation {
  Set?: { key: string; value: string };
  Get?: { key: string };
  Delete?: { key: string };
}

interface OperationResult {
  SetResult?: boolean;
  GetResult?: string | null;
  DeleteResult?: boolean;
  Error?: string;
}

interface OperationStatusInfo {
  id: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Retrying';
  queuedAt: bigint;
  processingStartedAt?: bigint;
  completedAt?: bigint;
  result?: OperationResult;
  errorMessage?: string;
  retryCount: bigint;
}

interface QueueStatistics {
  totalOperationsQueued: bigint;
  totalOperationsCompleted: bigint;
  totalOperationsFailed: bigint;
  currentQueueDepth: bigint;
  maxQueueSize: bigint;
  nextQueuePosition: bigint;
  currentlyProcessing: bigint;
}

interface ProcessQueueResult {
  processedOperationIds: string[];
  successfulOperations: string[];
  failedOperations: string[];
  operationStatuses: { [operationId: string]: 'Completed' | 'Failed' | 'Retrying' };
  errors: { [operationId: string]: string };
  processingStatistics: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    processingDurationMs: number;
  };
  queueStateAfterProcessing: {
    remainingQueueDepth: number;
    nextBatchAvailable: boolean;
  };
  cyclesConsumed: number;
  memoryUsed: number;
  batchTerminatedEarly: boolean;
  earlyTerminationReason?: string;
}

// Task 6: Queue Management Types
interface QueueHealthStatus {
  Healthy?: null;
  Warning?: null;
  Critical?: null;
  Degraded?: null;
}

interface QueueHealthReport {
  status: 'Healthy' | 'Warning' | 'Critical' | 'Degraded';
  queueDepth: number;
  processingRate: number;
  errorRate: number;
  averageProcessingTime: number;
  memoryUsage: number;
  cyclesBalance: number;
  lastHealthCheck: bigint;
  issues: string[];
  recommendations: string[];
}

interface QueueMetrics {
  totalOperationsQueued: bigint;
  totalOperationsCompleted: bigint;
  totalOperationsFailed: bigint;
  totalOperationsRetried: bigint;
  currentQueueDepth: bigint;
  averageQueueTime: number;
  averageProcessingTime: number;
  throughputPerMinute: number;
  errorRate: number;
  successRate: number;
  peakQueueDepth: bigint;
  totalCyclesConsumed: bigint;
  totalMemoryUsed: bigint;
  uptime: bigint;
  lastMetricsUpdate: bigint;
}

interface MaintenanceOperation {
  PurgeCompleted?: null;
  PurgeFailed?: null;
  PurgeOld?: { olderThanMs: number };
  CompactQueue?: null;
  ResetStatistics?: null;
  OptimizeMemory?: null;
}

interface MaintenanceResult {
  operation: MaintenanceOperation;
  success: boolean;
  itemsAffected: number;
  memoryFreed: number;
  executionTimeMs: number;
  message: string;
}

interface ConfigurationParameter {
  MaxQueueSize?: number;
  MaxBatchSize?: number;
  MinCyclesThreshold?: number;
  MaxMemoryUsageBytes?: number;
  MaxBatchProcessingTimeNs?: number;
  MaxRetryAttempts?: number;
  HealthCheckIntervalMs?: number;
  MetricsCollectionEnabled?: boolean;
}

interface QueueConfiguration {
  maxQueueSize: bigint;
  maxBatchSize: bigint;
  minCyclesThreshold: bigint;
  maxMemoryUsageBytes: bigint;
  maxBatchProcessingTimeNs: bigint;
  healthCheckIntervalMs: bigint;
  metricsCollectionEnabled: boolean;
}

// Subtask 5.10: Processing Statistics Tracking interfaces
interface ProcessingHistoryEntry {
  timestamp: number;
  batchSize: number;
  successCount: number;
  failureCount: number;
  processingDurationMs: number;
  operationsPerSecond: number;
  cyclesConsumed: number;
  memoryUsed: number;
  operationTypes: {
    setOperations: number;
    getOperations: number;
    deleteOperations: number;
  };
  queueDepthBefore: number;
  queueDepthAfter: number;
  batchTerminatedEarly: boolean;
  earlyTerminationReason?: string;
}

interface ProcessingPerformanceMetrics {
  totalBatchesProcessed: number;
  totalOperationsProcessed: number;
  overallSuccessRate: number;
  overallFailureRate: number;
  averageProcessingDurationMs: number;
  averageOperationsPerSecond: number;
  peakOperationsPerSecond: number;
  averageBatchSize: number;
  maxBatchSize: number;
  averageCyclesPerOperation: number;
  averageMemoryPerOperation: number;
  totalProcessingTimeMs: number;
  processingEfficiencyScore: number;
}

interface RollingAverages {
  last10Batches: {
    averageSuccessRate: number;
    averageProcessingDuration: number;
    averageOperationsPerSecond: number;
    averageBatchSize: number;
  };
  last50Batches: {
    averageSuccessRate: number;
    averageProcessingDuration: number;
    averageOperationsPerSecond: number;
    averageBatchSize: number;
  };
  last100Batches: {
    averageSuccessRate: number;
    averageProcessingDuration: number;
    averageOperationsPerSecond: number;
    averageBatchSize: number;
  };
}

interface OperationTypeStatistics {
  setOperations: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    averageProcessingTime: number;
    successRate: number;
  };
  getOperations: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    averageProcessingTime: number;
    successRate: number;
  };
  deleteOperations: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    averageProcessingTime: number;
    successRate: number;
  };
}

interface QueueUtilizationMetrics {
  queueDepthHistory: Array<{
    timestamp: number;
    queueDepth: number;
    maxQueueSize: number;
    utilizationPercentage: number;
  }>;
  averageQueueDepth: number;
  peakQueueDepth: number;
  queueUtilizationTrend: 'increasing' | 'decreasing' | 'stable';
  timeToProcessQueue: number; // Average time to process entire queue
}

interface ProcessingTrendAnalysis {
  performanceTrend: 'improving' | 'degrading' | 'stable';
  successRateTrend: 'improving' | 'degrading' | 'stable';
  throughputTrend: 'increasing' | 'decreasing' | 'stable';
  efficiencyTrend: 'improving' | 'degrading' | 'stable';
  trendConfidence: number; // 0-100 percentage
  recommendedActions: string[];
}

interface ComprehensiveProcessingStatistics {
  performanceMetrics: ProcessingPerformanceMetrics;
  rollingAverages: RollingAverages;
  operationTypeStatistics: OperationTypeStatistics;
  queueUtilizationMetrics: QueueUtilizationMetrics;
  trendAnalysis: ProcessingTrendAnalysis;
  processingHistory: ProcessingHistoryEntry[];
  lastUpdated: number;
}

// Batch processing safety statistics interface
interface BatchProcessingStatistics {
  totalBatchesProcessed: bigint;
  totalEarlyTerminations: bigint;
  totalCyclesConsumedInBatches: bigint;
  totalMemoryUsedInBatches: bigint;
  averageCyclesPerBatch: number;
  averageMemoryPerBatch: number;
  earlyTerminationRate: number;
  currentBatchSafetyLimits: {
    maxBatchSize: bigint;
    minCyclesThreshold: bigint;
    maxMemoryUsageBytes: bigint;
    maxBatchProcessingTimeNs: bigint;
  };
}

// Enhanced error types for comprehensive error handling and logging (Subtask 5.8)
type ErrorCategory = 
  | 'NetworkError'
  | 'CanisterUnavailable'
  | 'TimeoutError'
  | 'InvalidResponse'
  | 'ValidationError'
  | 'UnknownError';

type ErrorSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

interface DetailedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  context: {
    operationId?: string;
    operationType?: string;
    timestamp: number;
    retryCount?: number;
    canisterStatus?: string;
    networkStatus?: string;
    requestParameters?: any;
    responseData?: any;
    stackTrace?: string;
    environmentInfo?: {
      userAgent?: string;
      connectionType?: string;
      canisterVersion?: string;
    };
    // Additional context properties for enhanced error tracking
    retryDelay?: number;
    nextRetryTime?: number;
    retryAttempt?: number;
    maxRetries?: number;
    totalRetryAttempts?: number;
    finalFailure?: boolean;
    simulatedFailure?: boolean;
    demonstrationMode?: boolean;
    batchProcessing?: boolean;
    batchSize?: number;
  };
  recoverable: boolean;
  suggestedAction?: string;
  technicalDetails?: string;
  debugInfo?: {
    requestId?: string;
    correlationId?: string;
    sessionId?: string;
    additionalMetadata?: { [key: string]: any };
  };
}

// Queue canister interface
interface QueueCanisterInterface {
  queueOperation: (operation: QueueOperation) => Promise<{ ok?: string; err?: string }>;
  getOperationStatus: (operationId: string) => Promise<OperationStatusInfo | null>;
  getOperationStatuses: (operationIds: string[]) => Promise<(OperationStatusInfo | null)[]>;
  getQueueStatistics: () => Promise<QueueStatistics>;
  getQueueState: () => Promise<Array<[bigint, OperationStatusInfo]>>;
  processQueue: (batchSize: number) => Promise<ProcessQueueResult>;
  simulateProcessOperation: (operationId: string) => Promise<boolean>;
  clearCompletedOperations: () => Promise<bigint>;
  getCurrentlyProcessingOperations: () => Promise<Array<[string, bigint]>>;
  getInterCanisterCallStatistics: () => Promise<{
    totalInterCanisterCalls: bigint;
    successfulInterCanisterCalls: bigint;
    failedInterCanisterCalls: bigint;
    totalRetryAttempts: bigint;
    successRate: number;
  }>;
  resetInterCanisterCallStatistics: () => Promise<boolean>;
  getBatchProcessingStatistics: () => Promise<BatchProcessingStatistics>;
  resetBatchProcessingStatistics: () => Promise<boolean>;
  configureBatchProcessingSafety: (
    maxBatchSize?: number,
    minCyclesThreshold?: number,
    maxMemoryUsageBytes?: number,
    maxBatchProcessingTimeNs?: number
  ) => Promise<boolean>;
  getErrorLogs: () => Promise<DetailedError[]>;
  getErrorStatistics: () => Promise<{
    totalErrors: bigint;
    errorsByCategory: { [category: string]: bigint };
    errorsBySeverity: { [severity: string]: bigint };
    recentErrors: DetailedError[];
    errorPatterns: Array<{
      pattern: string;
      frequency: number;
      lastOccurrence: number;
      severity: ErrorSeverity;
    }>;
    systemHealthScore: number;
  }>;
  getDetailedErrorAnalysis: () => Promise<{
    criticalErrorsLast24h: number;
    errorTrends: Array<{
      timeWindow: string;
      errorCount: number;
      category: ErrorCategory;
    }>;
    topErrorMessages: Array<{
      message: string;
      count: number;
      lastSeen: number;
    }>;
    recoverySuccessRate: number;
  }>;
  // Subtask 5.10: Processing Statistics Tracking methods
  getProcessingStatistics: () => Promise<ComprehensiveProcessingStatistics>;
  resetProcessingStatistics: () => Promise<boolean>;
  getProcessingHistory: (limit?: number) => Promise<ProcessingHistoryEntry[]>;
  getProcessingPerformanceMetrics: () => Promise<ProcessingPerformanceMetrics>;
  getRollingAverages: () => Promise<RollingAverages>;
  getOperationTypeStatistics: () => Promise<OperationTypeStatistics>;
  getQueueUtilizationMetrics: () => Promise<QueueUtilizationMetrics>;
  getProcessingTrendAnalysis: () => Promise<ProcessingTrendAnalysis>;
  // Task 6: Queue Management Features
  performHealthCheck: () => Promise<QueueHealthReport>;
  getQueueMetrics: () => Promise<QueueMetrics>;
  performMaintenance: (operation: MaintenanceOperation) => Promise<MaintenanceResult>;
  updateConfiguration: (parameter: ConfigurationParameter) => Promise<boolean>;
  getConfiguration: () => Promise<QueueConfiguration>;
}

// Helper function to validate operation (matching backend validation logic)
const validateOperation = (operation: QueueOperation): { ok?: boolean; err?: string } => {
  if (operation.Set) {
    const { key, value } = operation.Set;
    if (key.length === 0) {
      return { err: "Key cannot be empty" };
    }
    if (value.length === 0) {
      return { err: "Value cannot be empty" };
    }
    if (key.length > 256) {
      return { err: "Key too long (max 256 characters)" };
    }
    if (value.length > 1024) {
      return { err: "Value too long (max 1024 characters)" };
    }
  } else if (operation.Get) {
    const { key } = operation.Get;
    if (key.length === 0) {
      return { err: "Key cannot be empty" };
    }
    if (key.length > 256) {
      return { err: "Key too long (max 256 characters)" };
    }
  } else if (operation.Delete) {
    const { key } = operation.Delete;
    if (key.length === 0) {
      return { err: "Key cannot be empty" };
    }
    if (key.length > 256) {
      return { err: "Key too long (max 256 characters)" };
    }
  }
  return { ok: true };
};

// Enhanced error categorization and logging system (Subtask 5.8 Implementation)
const categorizeError = (error: any, operationType: string, retryCount: number = 0, operationId?: string): DetailedError => {
  const timestamp = Date.now();
  const errorString = String(error);
  const stackTrace = error?.stack || 'No stack trace available';
  
  // Generate unique identifiers for debugging
  const requestId = `req_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  const correlationId = operationId ? `corr_${operationId}` : `corr_${timestamp}`;
  const sessionId = `sess_${Date.now().toString(36)}`;
  
  // Collect environment information
  const environmentInfo = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    connectionType: typeof navigator !== 'undefined' && 'connection' in navigator 
      ? (navigator as any).connection?.effectiveType || 'Unknown' 
      : 'Unknown',
    canisterVersion: '1.0.0', // This would come from the actual canister
  };

  // Network-related errors with detailed analysis
  if (errorString.includes('network') || errorString.includes('connection') || errorString.includes('timeout')) {
    const isHighSeverity = retryCount > 2 || errorString.includes('critical') || errorString.includes('permanent');
    
    return {
      category: 'NetworkError',
      severity: isHighSeverity ? 'High' : 'Medium',
      message: `Network communication failed during ${operationType}: ${errorString}`,
      context: {
        operationId,
        operationType,
        timestamp,
        retryCount,
        networkStatus: 'disconnected',
        requestParameters: { operationType, retryCount },
        stackTrace,
        environmentInfo
      },
      recoverable: !errorString.includes('permanent'),
      suggestedAction: retryCount > 2 
        ? 'Check network connectivity, verify canister availability, or contact system administrator'
        : 'Check network connectivity and retry operation',
      technicalDetails: `Network error occurred during ${operationType} operation. ` +
        `Connection type: ${environmentInfo.connectionType}. ` +
        `Retry attempt: ${retryCount}. ` +
        `Error details: ${errorString}. ` +
        `Stack trace: ${stackTrace}`,
      debugInfo: {
        requestId,
        correlationId,
        sessionId,
        additionalMetadata: {
          connectionType: environmentInfo.connectionType,
          errorType: 'network_failure',
          retryEligible: retryCount < 3
        }
      }
    };
  }
  
  // Canister unavailability with detailed status information
  if (errorString.includes('canister') && (errorString.includes('unavailable') || errorString.includes('stopped'))) {
    return {
      category: 'CanisterUnavailable',
      severity: 'High',
      message: `Cache canister is currently unavailable during ${operationType}: ${errorString}`,
      context: {
        operationId,
        operationType,
        timestamp,
        retryCount,
        canisterStatus: 'unavailable',
        requestParameters: { operationType },
        stackTrace,
        environmentInfo
      },
      recoverable: true,
      suggestedAction: retryCount > 1 
        ? 'Canister may be undergoing maintenance. Wait 5-10 minutes or contact system administrator'
        : 'Wait for canister to become available and retry operation',
      technicalDetails: `Cache canister unavailable during ${operationType}. ` +
        `This may be due to canister upgrade, maintenance, or resource exhaustion. ` +
        `Canister version: ${environmentInfo.canisterVersion}. ` +
        `Error: ${errorString}. ` +
        `Stack trace: ${stackTrace}`,
      debugInfo: {
        requestId,
        correlationId,
        sessionId,
        additionalMetadata: {
          canisterStatus: 'unavailable',
          maintenanceWindow: false, // This would be determined by actual canister status
          estimatedRecoveryTime: '5-10 minutes'
        }
      }
    };
  }
  
  // Timeout errors with performance analysis
  if (errorString.includes('timeout') || errorString.includes('deadline')) {
    const isSlowNetwork = environmentInfo.connectionType === 'slow-2g' || environmentInfo.connectionType === '2g';
    
    return {
      category: 'TimeoutError',
      severity: isSlowNetwork ? 'Medium' : retryCount > 1 ? 'High' : 'Medium',
      message: `Operation timed out during ${operationType}: ${errorString}`,
      context: {
        operationId,
        operationType,
        timestamp,
        retryCount,
        networkStatus: isSlowNetwork ? 'slow' : 'normal',
        requestParameters: { operationType, timeout: '30s' },
        stackTrace,
        environmentInfo
      },
      recoverable: true,
      suggestedAction: isSlowNetwork 
        ? 'Slow network detected. Consider reducing batch size or using a faster connection'
        : 'Retry operation with longer timeout or reduce batch size',
      technicalDetails: `Timeout occurred during ${operationType}. ` +
        `Network type: ${environmentInfo.connectionType}. ` +
        `Timeout threshold: 30 seconds. ` +
        `Retry count: ${retryCount}. ` +
        `Consider adjusting timeout settings or reducing operation complexity. ` +
        `Error: ${errorString}. ` +
        `Stack trace: ${stackTrace}`,
      debugInfo: {
        requestId,
        correlationId,
        sessionId,
        additionalMetadata: {
          timeoutThreshold: 30000,
          networkType: environmentInfo.connectionType,
          performanceOptimizationSuggested: true
        }
      }
    };
  }
  
  // Invalid response errors with protocol analysis
  if (errorString.includes('invalid') || errorString.includes('malformed') || errorString.includes('parse')) {
    return {
      category: 'InvalidResponse',
      severity: 'High',
      message: `Invalid response received during ${operationType}: ${errorString}`,
      context: {
        operationId,
        operationType,
        timestamp,
        retryCount,
        responseData: 'malformed',
        requestParameters: { operationType },
        stackTrace,
        environmentInfo
      },
      recoverable: false,
      suggestedAction: 'Check operation parameters and canister compatibility. This may indicate a protocol version mismatch',
      technicalDetails: `Invalid response format received from cache canister during ${operationType}. ` +
        `This may indicate a protocol mismatch, canister version incompatibility, or data corruption. ` +
        `Canister version: ${environmentInfo.canisterVersion}. ` +
        `Client version: 1.0.0. ` +
        `Error: ${errorString}. ` +
        `Stack trace: ${stackTrace}`,
      debugInfo: {
        requestId,
        correlationId,
        sessionId,
        additionalMetadata: {
          protocolVersion: '1.0',
          canisterVersion: environmentInfo.canisterVersion,
          compatibilityCheck: 'failed',
          dataIntegrityCheck: 'failed'
        }
      }
    };
  }
  
  // Validation errors with detailed parameter analysis
  if (errorString.includes('validation') || errorString.includes('empty') || errorString.includes('too long')) {
    return {
      category: 'ValidationError',
      severity: 'Low',
      message: `Parameter validation failed during ${operationType}: ${errorString}`,
      context: {
        operationId,
        operationType,
        timestamp,
        retryCount,
        requestParameters: { operationType, validationFailed: true },
        stackTrace,
        environmentInfo
      },
      recoverable: false,
      suggestedAction: 'Check operation parameters and fix validation issues. Ensure all required fields are provided and within acceptable limits',
      technicalDetails: `Parameter validation failed for ${operationType}. ` +
        `Ensure all required fields are provided and within acceptable limits: ` +
        `Keys must be 1-256 characters, Values must be 1-1024 characters. ` +
        `Error: ${errorString}. ` +
        `Stack trace: ${stackTrace}`,
      debugInfo: {
        requestId,
        correlationId,
        sessionId,
        additionalMetadata: {
          validationRules: {
            keyLength: '1-256 characters',
            valueLength: '1-1024 characters',
            requiredFields: ['key', 'value']
          },
          parameterAnalysis: 'failed'
        }
      }
    };
  }
  
  // Unknown errors with comprehensive diagnostic information
  return {
    category: 'UnknownError',
    severity: retryCount > 2 ? 'High' : 'Medium',
    message: `Unexpected error occurred during ${operationType}: ${errorString}`,
    context: {
      operationId,
      operationType,
      timestamp,
      retryCount,
      requestParameters: { operationType },
      responseData: 'unknown',
      stackTrace,
      environmentInfo
    },
    recoverable: true,
    suggestedAction: retryCount > 2 
      ? 'Multiple retry attempts failed. Contact support with error details and correlation ID'
      : 'Retry operation or contact support if problem persists',
    technicalDetails: `Unknown error during ${operationType}. ` +
      `This error type is not recognized by the system. ` +
      `Retry count: ${retryCount}. ` +
      `Environment: ${environmentInfo.userAgent}. ` +
      `Error: ${errorString}. ` +
      `Stack trace: ${stackTrace}. ` +
      `Please report this error with the correlation ID for further investigation.`,
    debugInfo: {
      requestId,
      correlationId,
      sessionId,
      additionalMetadata: {
        errorClassification: 'unknown',
        diagnosticLevel: 'full',
        supportTicketRecommended: retryCount > 2
      }
    }
  };
};

// Create queue canister actor with enhanced error handling and logging
const createQueueCanisterActor = (): QueueCanisterInterface => {
  // Enhanced mock implementation with comprehensive error handling and logging (Subtask 5.8)
  const operations = new Map<string, OperationStatusInfo>();
  const retryQueue = new Map<string, { nextRetryTime: number; retryAttempts: number }>();
  const errorLogs: DetailedError[] = [];
  const errorPatterns = new Map<string, { count: number; lastSeen: number; severity: ErrorSeverity }>();
  let operationCounter = 0;
  const MAX_RETRY_ATTEMPTS = 3;
  const BASE_RETRY_DELAY = 2000; // 2 seconds base delay

  // Subtask 5.10: Processing Statistics Tracking state
  const processingHistory: ProcessingHistoryEntry[] = [];
  let totalOperationsProcessed = 0;
  let totalBatchesProcessed = 0;
  let totalProcessingTimeMs = 0;
  let peakOperationsPerSecond = 0;
  let maxBatchSizeProcessed = 0;
  
  // Operation type counters
  const operationTypeCounters = {
    set: { total: 0, success: 0, failure: 0, totalTime: 0 },
    get: { total: 0, success: 0, failure: 0, totalTime: 0 },
    delete: { total: 0, success: 0, failure: 0, totalTime: 0 }
  };

  // Queue utilization tracking
  const queueDepthHistory: Array<{ timestamp: number; queueDepth: number; maxQueueSize: number; utilizationPercentage: number }> = [];
  let peakQueueDepth = 0;

  // Enhanced statistics tracking with error analysis
  let totalInterCanisterCalls = 0;
  let successfulInterCanisterCalls = 0;
  let failedInterCanisterCalls = 0;
  let totalRetryAttempts = 0;
  let totalErrors = 0;
  const errorsByCategory: { [category: string]: number } = {};
  const errorsBySeverity: { [severity: string]: number } = {};

  // Subtask 5.9: Batch processing safety statistics
  let totalBatchesProcessedSafety = 0;
  let totalEarlyTerminations = 0;
  let totalCyclesConsumedInBatches = 0;
  let totalMemoryUsedInBatches = 0;
  let maxBatchSize = 50;
  let minCyclesThreshold = 1000000000;
  let maxMemoryUsageBytes = 1000000000;
  let maxBatchProcessingTimeNs = 5000000000;

  // Task 6: Queue Management state
  let systemStartTime = Date.now();
  let lastHealthCheck = Date.now();
  let healthCheckIntervalMs = 60000; // 1 minute
  let metricsCollectionEnabled = true;
  let maxQueueSize = 1000;

  // Enhanced error logging with pattern detection and analysis
  const logError = (error: DetailedError) => {
    errorLogs.push(error);
    totalErrors++;
    
    // Update category and severity statistics
    errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
    errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    
    // Pattern detection for recurring errors
    const patternKey = `${error.category}_${error.message.substring(0, 50)}`;
    const existingPattern = errorPatterns.get(patternKey);
    if (existingPattern) {
      errorPatterns.set(patternKey, {
        count: existingPattern.count + 1,
        lastSeen: error.context.timestamp,
        severity: error.severity
      });
    } else {
      errorPatterns.set(patternKey, {
        count: 1,
        lastSeen: error.context.timestamp,
        severity: error.severity
      });
    }
    
    // Keep only last 200 errors for performance
    if (errorLogs.length > 200) {
      errorLogs.shift();
    }
    
    // Enhanced structured logging with full diagnostic information
    console.error('🚨 Queue Error Logged (Subtask 5.8):', {
      timestamp: new Date(error.context.timestamp).toISOString(),
      category: error.category,
      severity: error.severity,
      message: error.message,
      operationId: error.context.operationId,
      operationType: error.context.operationType,
      retryCount: error.context.retryCount,
      recoverable: error.recoverable,
      suggestedAction: error.suggestedAction,
      technicalDetails: error.technicalDetails,
      debugInfo: error.debugInfo,
      context: error.context,
      correlationId: error.debugInfo?.correlationId,
      requestId: error.debugInfo?.requestId,
      sessionId: error.debugInfo?.sessionId
    });

    // Log critical errors with additional alerting
    if (error.severity === 'Critical') {
      console.error('🔥 CRITICAL ERROR DETECTED:', {
        message: error.message,
        operationId: error.context.operationId,
        correlationId: error.debugInfo?.correlationId,
        immediateAction: error.suggestedAction
      });
    }

    // Log error patterns for system health monitoring
    const pattern = errorPatterns.get(patternKey);
    if (pattern && pattern.count > 5) {
      console.warn('⚠️ ERROR PATTERN DETECTED:', {
        pattern: patternKey,
        frequency: pattern.count,
        lastOccurrence: new Date(pattern.lastSeen).toISOString(),
        severity: pattern.severity,
        recommendation: 'Consider investigating root cause'
      });
    }
  };

  // Subtask 5.10: Helper function to update processing statistics
  const updateProcessingStatistics = (
    batchSize: number,
    successCount: number,
    failureCount: number,
    processingDurationMs: number,
    operationTypes: { setOperations: number; getOperations: number; deleteOperations: number },
    queueDepthBefore: number,
    queueDepthAfter: number,
    cyclesConsumed: number,
    memoryUsed: number,
    batchTerminatedEarly: boolean,
    earlyTerminationReason?: string
  ) => {
    const timestamp = Date.now();
    const operationsPerSecond = processingDurationMs > 0 ? (batchSize / processingDurationMs) * 1000 : 0;

    // Update peak metrics
    if (operationsPerSecond > peakOperationsPerSecond) {
      peakOperationsPerSecond = operationsPerSecond;
    }
    if (batchSize > maxBatchSizeProcessed) {
      maxBatchSizeProcessed = batchSize;
    }
    if (queueDepthBefore > peakQueueDepth) {
      peakQueueDepth = queueDepthBefore;
    }

    // Update operation type statistics
    operationTypeCounters.set.total += operationTypes.setOperations;
    operationTypeCounters.get.total += operationTypes.getOperations;
    operationTypeCounters.delete.total += operationTypes.deleteOperations;

    // Estimate success/failure distribution by operation type (simplified)
    const setSuccessRatio = operationTypes.setOperations / batchSize;
    const getSuccessRatio = operationTypes.getOperations / batchSize;
    const deleteSuccessRatio = operationTypes.deleteOperations / batchSize;

    operationTypeCounters.set.success += Math.round(successCount * setSuccessRatio);
    operationTypeCounters.set.failure += Math.round(failureCount * setSuccessRatio);
    operationTypeCounters.set.totalTime += Math.round(processingDurationMs * setSuccessRatio);

    operationTypeCounters.get.success += Math.round(successCount * getSuccessRatio);
    operationTypeCounters.get.failure += Math.round(failureCount * getSuccessRatio);
    operationTypeCounters.get.totalTime += Math.round(processingDurationMs * getSuccessRatio);

    operationTypeCounters.delete.success += Math.round(successCount * deleteSuccessRatio);
    operationTypeCounters.delete.failure += Math.round(failureCount * deleteSuccessRatio);
    operationTypeCounters.delete.totalTime += Math.round(processingDurationMs * deleteSuccessRatio);

    // Add to processing history
    const historyEntry: ProcessingHistoryEntry = {
      timestamp,
      batchSize,
      successCount,
      failureCount,
      processingDurationMs,
      operationsPerSecond,
      cyclesConsumed,
      memoryUsed,
      operationTypes,
      queueDepthBefore,
      queueDepthAfter,
      batchTerminatedEarly,
      earlyTerminationReason
    };

    processingHistory.push(historyEntry);

    // Keep only last 1000 entries for performance
    if (processingHistory.length > 1000) {
      processingHistory.shift();
    }

    // Update queue depth history
    const utilizationPercentage = (queueDepthBefore / maxQueueSize) * 100;
    queueDepthHistory.push({
      timestamp,
      queueDepth: queueDepthBefore,
      maxQueueSize,
      utilizationPercentage
    });

    // Keep only last 500 queue depth entries
    if (queueDepthHistory.length > 500) {
      queueDepthHistory.shift();
    }

    // Update global counters
    totalOperationsProcessed += batchSize;
    totalBatchesProcessed++;
    totalProcessingTimeMs += processingDurationMs;

    console.log(`📊 Processing Statistics Updated (Subtask 5.10):`, {
      batchSize,
      successCount,
      failureCount,
      processingDurationMs,
      operationsPerSecond: operationsPerSecond.toFixed(2),
      totalBatchesProcessed,
      totalOperationsProcessed,
      peakOperationsPerSecond: peakOperationsPerSecond.toFixed(2),
      maxBatchSizeProcessed
    });
  };

  // Subtask 5.10: Helper function to calculate rolling averages
  const calculateRollingAverages = (): RollingAverages => {
    const calculateAveragesForWindow = (windowSize: number) => {
      const recentHistory = processingHistory.slice(-windowSize);
      if (recentHistory.length === 0) {
        return {
          averageSuccessRate: 0,
          averageProcessingDuration: 0,
          averageOperationsPerSecond: 0,
          averageBatchSize: 0
        };
      }

      const totalOperations = recentHistory.reduce((sum, entry) => sum + entry.batchSize, 0);
      const totalSuccesses = recentHistory.reduce((sum, entry) => sum + entry.successCount, 0);
      const totalDuration = recentHistory.reduce((sum, entry) => sum + entry.processingDurationMs, 0);
      const totalOpsPerSec = recentHistory.reduce((sum, entry) => sum + entry.operationsPerSecond, 0);
      const totalBatchSize = recentHistory.reduce((sum, entry) => sum + entry.batchSize, 0);

      return {
        averageSuccessRate: totalOperations > 0 ? (totalSuccesses / totalOperations) * 100 : 0,
        averageProcessingDuration: totalDuration / recentHistory.length,
        averageOperationsPerSecond: totalOpsPerSec / recentHistory.length,
        averageBatchSize: totalBatchSize / recentHistory.length
      };
    };

    return {
      last10Batches: calculateAveragesForWindow(10),
      last50Batches: calculateAveragesForWindow(50),
      last100Batches: calculateAveragesForWindow(100)
    };
  };

  // Subtask 5.10: Helper function to analyze processing trends
  const analyzeProcessingTrends = (): ProcessingTrendAnalysis => {
    if (processingHistory.length < 10) {
      return {
        performanceTrend: 'stable',
        successRateTrend: 'stable',
        throughputTrend: 'stable',
        efficiencyTrend: 'stable',
        trendConfidence: 0,
        recommendedActions: ['Insufficient data for trend analysis. Process more batches to generate insights.']
      };
    }

    const recentHistory = processingHistory.slice(-20);
    const olderHistory = processingHistory.slice(-40, -20);

    // Calculate averages for comparison
    const recentAvgOpsPerSec = recentHistory.reduce((sum, entry) => sum + entry.operationsPerSecond, 0) / recentHistory.length;
    const olderAvgOpsPerSec = olderHistory.length > 0 ? olderHistory.reduce((sum, entry) => sum + entry.operationsPerSecond, 0) / olderHistory.length : recentAvgOpsPerSec;

    const recentSuccessRate = recentHistory.reduce((sum, entry) => sum + (entry.successCount / entry.batchSize), 0) / recentHistory.length;
    const olderSuccessRate = olderHistory.length > 0 ? olderHistory.reduce((sum, entry) => sum + (entry.successCount / entry.batchSize), 0) / olderHistory.length : recentSuccessRate;

    const recentAvgDuration = recentHistory.reduce((sum, entry) => sum + entry.processingDurationMs, 0) / recentHistory.length;
    const olderAvgDuration = olderHistory.length > 0 ? olderHistory.reduce((sum, entry) => sum + entry.processingDurationMs, 0) / olderHistory.length : recentAvgDuration;

    // Determine trends
    const throughputChange = (recentAvgOpsPerSec - olderAvgOpsPerSec) / olderAvgOpsPerSec;
    const successRateChange = recentSuccessRate - olderSuccessRate;
    const durationChange = (recentAvgDuration - olderAvgDuration) / olderAvgDuration;

    const throughputTrend = throughputChange > 0.05 ? 'increasing' : throughputChange < -0.05 ? 'decreasing' : 'stable';
    const successRateTrend = successRateChange > 0.02 ? 'improving' : successRateChange < -0.02 ? 'degrading' : 'stable';
    const performanceTrend = durationChange < -0.05 ? 'improving' : durationChange > 0.05 ? 'degrading' : 'stable';

    // Calculate efficiency trend (operations per second per unit time)
    const efficiencyTrend = throughputTrend === 'increasing' && performanceTrend !== 'degrading' ? 'improving' :
                           throughputTrend === 'decreasing' || performanceTrend === 'degrading' ? 'degrading' : 'stable';

    // Calculate confidence based on data consistency
    const trendConfidence = Math.min(95, Math.max(50, recentHistory.length * 5));

    // Generate recommendations
    const recommendedActions: string[] = [];
    if (successRateTrend === 'degrading') {
      recommendedActions.push('Investigate increasing failure rates - check error logs for patterns');
    }
    if (performanceTrend === 'degrading') {
      recommendedActions.push('Performance degradation detected - consider reducing batch sizes or optimizing operations');
    }
    if (throughputTrend === 'decreasing') {
      recommendedActions.push('Throughput declining - review system resources and queue utilization');
    }
    if (efficiencyTrend === 'improving') {
      recommendedActions.push('System efficiency improving - current configuration appears optimal');
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('System performance is stable - continue monitoring for changes');
    }

    return {
      performanceTrend,
      successRateTrend,
      throughputTrend,
      efficiencyTrend,
      trendConfidence,
      recommendedActions
    };
  };

  // Helper function to calculate exponential backoff delay
  const calculateRetryDelay = (retryCount: number): number => {
    return BASE_RETRY_DELAY * Math.pow(2, retryCount);
  };

  // Enhanced retry scheduling with comprehensive error tracking
  const scheduleRetry = (operationId: string, currentRetryCount: number, lastError?: any) => {
    const delay = calculateRetryDelay(currentRetryCount);
    const nextRetryTime = Date.now() + delay;
    
    retryQueue.set(operationId, {
      nextRetryTime,
      retryAttempts: currentRetryCount + 1
    });

    // Update operation status to retrying
    const op = operations.get(operationId);
    if (op) {
      const retryingOp = {
        ...op,
        status: 'Retrying' as const,
        retryCount: BigInt(currentRetryCount + 1),
        errorMessage: `Retry attempt ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS} scheduled`,
      };
      operations.set(operationId, retryingOp);
      
      // Enhanced retry logging with detailed error analysis
      if (lastError) {
        const detailedError = categorizeError(lastError, 'retry_scheduling', currentRetryCount + 1, operationId);
        logError({
          ...detailedError,
          message: `Scheduling retry ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS}: ${detailedError.message}`,
          context: {
            ...detailedError.context,
            operationId,
            retryDelay: delay,
            nextRetryTime
          },
          technicalDetails: `${detailedError.technicalDetails} Retry scheduled with ${delay}ms delay using exponential backoff.`,
          debugInfo: {
            ...detailedError.debugInfo,
            additionalMetadata: {
              ...detailedError.debugInfo?.additionalMetadata,
              retryScheduling: {
                delay,
                nextRetryTime,
                backoffMultiplier: Math.pow(2, currentRetryCount + 1)
              }
            }
          }
        });
      }
    }

    // Schedule the actual retry with enhanced error handling
    setTimeout(() => {
      const retryInfo = retryQueue.get(operationId);
      const operation = operations.get(operationId);
      
      if (retryInfo && operation && operation.status === 'Retrying') {
        // Remove from retry queue
        retryQueue.delete(operationId);
        
        // Update to processing status
        const processingOp = {
          ...operation,
          status: 'Processing' as const,
          processingStartedAt: BigInt(Date.now() * 1000000),
        };
        operations.set(operationId, processingOp);
        
        // Simulate processing with retry logic and enhanced error tracking
        setTimeout(() => {
          const currentOp = operations.get(operationId);
          if (currentOp) {
            totalInterCanisterCalls++;
            // 70% success rate for retries (higher than initial attempts)
            const isSuccess = Math.random() > 0.3;
            
            if (isSuccess) {
              // Successful retry
              let result: OperationResult;
              if (currentOp.result?.SetResult !== undefined) {
                result = { SetResult: true };
              } else if (currentOp.result?.GetResult !== undefined) {
                result = { GetResult: `retry-success-${operationId}` };
              } else if (currentOp.result?.DeleteResult !== undefined) {
                result = { DeleteResult: true };
              } else {
                result = { SetResult: true };
              }
              
              const completedOp = {
                ...currentOp,
                status: 'Completed' as const,
                completedAt: BigInt(Date.now() * 1000000),
                result,
                errorMessage: `Completed after ${Number(currentOp.retryCount)} retry attempts`,
              };
              operations.set(operationId, completedOp);
              successfulInterCanisterCalls++;
              
              // Log successful retry with detailed information
              console.log(`✅ Retry successful for operation ${operationId} after ${Number(currentOp.retryCount)} attempts`);
            } else {
              // Failed retry with enhanced error logging
              failedInterCanisterCalls++;
              const retryError = new Error(`Retry attempt ${Number(currentOp.retryCount)} failed for operation ${operationId}`);
              const detailedError = categorizeError(retryError, 'retry_execution', Number(currentOp.retryCount), operationId);
              logError({
                ...detailedError,
                context: {
                  ...detailedError.context,
                  operationId,
                  retryAttempt: Number(currentOp.retryCount),
                  maxRetries: MAX_RETRY_ATTEMPTS
                }
              });
              
              if (Number(currentOp.retryCount) < MAX_RETRY_ATTEMPTS) {
                // Schedule another retry
                totalRetryAttempts++;
                scheduleRetry(operationId, Number(currentOp.retryCount), retryError);
              } else {
                // Permanently failed with comprehensive error logging
                const failedOp = {
                  ...currentOp,
                  status: 'Failed' as const,
                  completedAt: BigInt(Date.now() * 1000000),
                  errorMessage: `Permanently failed after ${MAX_RETRY_ATTEMPTS} retry attempts`,
                };
                operations.set(operationId, failedOp);
                
                // Log permanent failure with critical severity
                const permanentFailureError = categorizeError(
                  new Error(`Operation permanently failed after ${MAX_RETRY_ATTEMPTS} attempts`),
                  'permanent_failure',
                  MAX_RETRY_ATTEMPTS,
                  operationId
                );
                logError({
                  ...permanentFailureError,
                  severity: 'Critical',
                  context: {
                    ...permanentFailureError.context,
                    operationId,
                    totalRetryAttempts: MAX_RETRY_ATTEMPTS,
                    finalFailure: true
                  },
                  suggestedAction: 'Operation has permanently failed. Manual intervention required. Contact support with correlation ID.',
                  technicalDetails: `${permanentFailureError.technicalDetails} All retry attempts exhausted. This indicates a persistent system issue that requires investigation.`
                });
              }
            }
          }
        }, 1500); // Retry processing delay
      }
    }, delay);
  };

  return {
    queueOperation: async (operation: QueueOperation) => {
      // Strict validation matching backend logic with enhanced error logging
      const validation = validateOperation(operation);
      if (validation.err) {
        const validationError = categorizeError(
          new Error(validation.err),
          'queue_operation',
          0
        );
        logError(validationError);
        return { err: validation.err };
      }

      operationCounter++;
      const operationId = `op_${operationCounter}_${Date.now()}`;
      
      const statusInfo: OperationStatusInfo = {
        id: operationId,
        status: 'Queued',
        queuedAt: BigInt(Date.now() * 1000000), // Convert to nanoseconds
        retryCount: BigInt(0),
      };
      
      operations.set(operationId, statusInfo);
      
      // Log successful queuing with detailed information
      console.log(`✅ Operation queued successfully: ${operationId}`, {
        operationType: operation.Set ? 'Set' : operation.Get ? 'Get' : 'Delete',
        timestamp: new Date().toISOString(),
        queueDepth: operations.size
      });
      
      // Simulate automatic processing after a delay with enhanced error handling
      setTimeout(() => {
        const op = operations.get(operationId);
        if (op) {
          const updatedOp = {
            ...op,
            status: 'Processing' as const,
            processingStartedAt: BigInt(Date.now() * 1000000),
          };
          operations.set(operationId, updatedOp);
          
          // Complete after another delay with 60% success rate (to trigger retries and demonstrate error handling)
          setTimeout(() => {
            const finalOp = operations.get(operationId);
            if (finalOp) {
              totalInterCanisterCalls++;
              const isSuccess = Math.random() > 0.4; // 60% success rate
              
              if (isSuccess) {
                // Successful operation
                let result: OperationResult;
                if (operation.Set) {
                  result = { SetResult: true };
                } else if (operation.Get) {
                  result = { GetResult: `mock-value-for-${operation.Get.key}` };
                } else if (operation.Delete) {
                  result = { DeleteResult: true };
                } else {
                  result = { Error: 'Unknown operation type' };
                }
                
                const completedOp = {
                  ...finalOp,
                  status: 'Completed' as const,
                  completedAt: BigInt(Date.now() * 1000000),
                  result,
                };
                operations.set(operationId, completedOp);
                successfulInterCanisterCalls++;
                
                console.log(`✅ Operation completed successfully: ${operationId}`);
              } else {
                // Failed operation - schedule retry with comprehensive error logging
                const operationError = new Error('Simulated inter-canister call failure - demonstrating error handling system');
                const detailedError = categorizeError(operationError, 'inter_canister_call', 0, operationId);
                logError({
                  ...detailedError,
                  context: {
                    ...detailedError.context,
                    operationId,
                    simulatedFailure: true,
                    demonstrationMode: true
                  }
                });
                
                const failedOp = {
                  ...finalOp,
                  status: 'Failed' as const,
                  errorMessage: detailedError.message,
                };
                operations.set(operationId, failedOp);
                failedInterCanisterCalls++;
                
                // Schedule retry with enhanced error tracking
                totalRetryAttempts++;
                scheduleRetry(operationId, 0, operationError);
              }
            }
          }, 2000);
        }
      }, 1000);
      
      return { ok: operationId };
    },
    
    getOperationStatus: async (operationId: string) => {
      return operations.get(operationId) || null;
    },
    
    getOperationStatuses: async (operationIds: string[]) => {
      return operationIds.map(id => operations.get(id) || null);
    },
    
    getQueueStatistics: async () => {
      const allOps = Array.from(operations.values());
      const queued = allOps.filter(op => op.status === 'Queued').length;
      const completed = allOps.filter(op => op.status === 'Completed').length;
      const failed = allOps.filter(op => op.status === 'Failed').length;
      const processing = allOps.filter(op => op.status === 'Processing').length;
      const retrying = allOps.filter(op => op.status === 'Retrying').length;
      
      return {
        totalOperationsQueued: BigInt(allOps.length),
        totalOperationsCompleted: BigInt(completed),
        totalOperationsFailed: BigInt(failed),
        currentQueueDepth: BigInt(queued + retrying),
        maxQueueSize: BigInt(maxQueueSize),
        nextQueuePosition: BigInt(allOps.length),
        currentlyProcessing: BigInt(processing),
      };
    },
    
    getQueueState: async () => {
      const queuedOps = Array.from(operations.values())
        .filter(op => op.status === 'Queued' || op.status === 'Processing' || op.status === 'Retrying')
        .map((op, index) => [BigInt(index), op] as [bigint, OperationStatusInfo]);
      return queuedOps;
    },
    
    processQueue: async (batchSize: number) => {
      const startTime = Date.now();
      const initialCycles = 1000000000; // Mock initial cycles
      const initialMemory = 500000000; // Mock initial memory
      
      totalBatchesProcessedSafety++;
      
      // Get queued operations (including retrying operations that are ready)
      const queuedOps = Array.from(operations.values())
        .filter(op => {
          if (op.status === 'Queued') return true;
          if (op.status === 'Retrying') {
            const retryInfo = retryQueue.get(op.id);
            return retryInfo && retryInfo.nextRetryTime <= Date.now();
          }
          return false;
        })
        .slice(0, Math.min(batchSize, maxBatchSize));
      
      const queueDepthBefore = Array.from(operations.values()).filter(op => op.status === 'Queued' || op.status === 'Retrying').length;

      if (queuedOps.length === 0) {
        return {
          processedOperationIds: [],
          successfulOperations: [],
          failedOperations: [],
          operationStatuses: {},
          errors: {},
          processingStatistics: {
            totalProcessed: 0,
            successCount: 0,
            failureCount: 0,
            processingDurationMs: Date.now() - startTime,
          },
          queueStateAfterProcessing: {
            remainingQueueDepth: 0,
            nextBatchAvailable: false,
          },
          cyclesConsumed: 0,
          memoryUsed: 0,
          batchTerminatedEarly: false,
          earlyTerminationReason: undefined,
        };
      }

      const processedIds: string[] = [];
      const successfulOps: string[] = [];
      const failedOps: string[] = [];
      const statuses: { [operationId: string]: 'Completed' | 'Failed' | 'Retrying' } = {};
      const errors: { [operationId: string]: string } = {};
      let batchTerminatedEarly = false;
      let earlyTerminationReason: string | undefined = undefined;

      // Subtask 5.9: Simulate batch processing safety checks
      let operationCount = 0;
      const maxProcessingTime = 5000; // 5 seconds
      const minCyclesRequired = 100000000; // 100M cycles
      const maxMemoryAllowed = 800000000; // 800MB

      // Subtask 5.10: Track operation types for statistics
      const operationTypes = {
        setOperations: 0,
        getOperations: 0,
        deleteOperations: 0
      };

      // Process each operation with enhanced error handling and logging
      for (const op of queuedOps) {
        operationCount++;
        
        // Track operation types
        // Note: In a real implementation, we'd extract this from the operation metadata
        // For now, we'll simulate a distribution
        const rand = Math.random();
        if (rand < 0.4) {
          operationTypes.setOperations++;
        } else if (rand < 0.7) {
          operationTypes.getOperations++;
        } else {
          operationTypes.deleteOperations++;
        }
        
        // Subtask 5.9: Check batch processing safety conditions
        const elapsedTime = Date.now() - startTime;
        const currentCycles = initialCycles - (operationCount * 10000000); // Simulate cycle consumption
        const currentMemory = initialMemory + (operationCount * 5000000); // Simulate memory usage
        
        // Check processing time limit
        if (elapsedTime > maxProcessingTime) {
          batchTerminatedEarly = true;
          earlyTerminationReason = "Processing time limit exceeded";
          totalEarlyTerminations++;
          console.warn(`⚠️ Batch terminated early: ${earlyTerminationReason}`);
          break;
        }
        
        // Check cycles threshold
        if (currentCycles < minCyclesRequired) {
          batchTerminatedEarly = true;
          earlyTerminationReason = "Insufficient cycles remaining";
          totalEarlyTerminations++;
          console.warn(`⚠️ Batch terminated early: ${earlyTerminationReason}`);
          break;
        }
        
        // Check memory usage
        if (currentMemory > maxMemoryAllowed) {
          batchTerminatedEarly = true;
          earlyTerminationReason = "Memory usage limit exceeded";
          totalEarlyTerminations++;
          console.warn(`⚠️ Batch terminated early: ${earlyTerminationReason}`);
          break;
        }
        
        processedIds.push(op.id);
        
        // Update to processing status
        const processingOp = {
          ...op,
          status: 'Processing' as const,
          processingStartedAt: BigInt(Date.now() * 1000000),
        };
        operations.set(op.id, processingOp);

        // Simulate processing with 75% success rate for manual processing
        totalInterCanisterCalls++;
        const isSuccess = Math.random() > 0.25;
        
        if (isSuccess) {
          // Simulate successful operation
          let result: OperationResult = { SetResult: true };

          const completedOp = {
            ...processingOp,
            status: 'Completed' as const,
            completedAt: BigInt(Date.now() * 1000000),
            result,
          };
          operations.set(op.id, completedOp);
          
          successfulOps.push(op.id);
          statuses[op.id] = 'Completed';
          successfulInterCanisterCalls++;
          
          console.log(`✅ Manual processing successful: ${op.id}`);
        } else {
          // Simulate failed operation with comprehensive error logging
          failedInterCanisterCalls++;
          const currentRetryCount = Number(op.retryCount);
          const processingError = new Error(`Manual processing failed for operation ${op.id}`);
          const detailedError = categorizeError(processingError, 'manual_processing', currentRetryCount, op.id);
          
          logError({
            ...detailedError,
            context: {
              ...detailedError.context,
              operationId: op.id,
              batchProcessing: true,
              batchSize
            }
          });
          
          if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
            // Schedule retry with enhanced tracking
            totalRetryAttempts++;
            scheduleRetry(op.id, currentRetryCount, processingError);
            statuses[op.id] = 'Retrying';
            errors[op.id] = `Scheduled for retry (attempt ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS})`;
          } else {
            // Permanently failed with critical error logging
            const failedOp = {
              ...processingOp,
              status: 'Failed' as const,
              completedAt: BigInt(Date.now() * 1000000),
              errorMessage: `Permanently failed after ${MAX_RETRY_ATTEMPTS} retry attempts`,
            };
            operations.set(op.id, failedOp);
            
            failedOps.push(op.id);
            statuses[op.id] = 'Failed';
            errors[op.id] = `Permanently failed after ${MAX_RETRY_ATTEMPTS} retry attempts`;
            
            // Log permanent failure with critical severity
            const permanentFailureError = categorizeError(
              new Error(`Manual processing permanently failed after ${MAX_RETRY_ATTEMPTS} attempts`),
              'permanent_failure',
              MAX_RETRY_ATTEMPTS,
              op.id
            );
            logError({
              ...permanentFailureError,
              severity: 'Critical',
              context: {
                ...permanentFailureError.context,
                operationId: op.id,
                batchProcessing: true,
                finalFailure: true
              }
            });
          }
        }
      }

      // Calculate resource usage
      const cyclesConsumed = Math.max(0, initialCycles - (initialCycles - (operationCount * 10000000)));
      const memoryUsed = Math.max(0, (initialMemory + (operationCount * 5000000)) - initialMemory);
      
      totalCyclesConsumedInBatches += cyclesConsumed;
      totalMemoryUsedInBatches += memoryUsed;

      // Calculate remaining queue depth
      const queueDepthAfter = Array.from(operations.values())
        .filter(op => op.status === 'Queued' || op.status === 'Retrying').length;

      const processingDuration = Date.now() - startTime;

      // Subtask 5.10: Update processing statistics
      updateProcessingStatistics(
        processedIds.length,
        successfulOps.length,
        failedOps.length,
        processingDuration,
        operationTypes,
        queueDepthBefore,
        queueDepthAfter,
        cyclesConsumed,
        memoryUsed,
        batchTerminatedEarly,
        earlyTerminationReason
      );

      return {
        processedOperationIds: processedIds,
        successfulOperations: successfulOps,
        failedOperations: failedOps,
        operationStatuses: statuses,
        errors,
        processingStatistics: {
          totalProcessed: processedIds.length,
          successCount: successfulOps.length,
          failureCount: failedOps.length,
          processingDurationMs: processingDuration,
        },
        queueStateAfterProcessing: {
          remainingQueueDepth: queueDepthAfter,
          nextBatchAvailable: queueDepthAfter > 0,
        },
        cyclesConsumed,
        memoryUsed,
        batchTerminatedEarly,
        earlyTerminationReason,
      };
    },

    simulateProcessOperation: async (operationId: string) => {
      const op = operations.get(operationId);
      if (op && (op.status === 'Queued' || op.status === 'Retrying')) {
        const updatedOp = {
          ...op,
          status: 'Completed' as const,
          completedAt: BigInt(Date.now() * 1000000),
          result: { SetResult: true } as OperationResult,
        };
        operations.set(operationId, updatedOp);
        return true;
      }
      return false;
    },

    clearCompletedOperations: async () => {
      let clearedCount = 0;
      const completedIds: string[] = [];
      
      for (const [id, op] of operations.entries()) {
        if (op.status === 'Completed' || op.status === 'Failed') {
          completedIds.push(id);
          clearedCount++;
        }
      }
      
      for (const id of completedIds) {
        operations.delete(id);
        retryQueue.delete(id);
      }
      
      return BigInt(clearedCount);
    },

    getCurrentlyProcessingOperations: async () => {
      const processingOps: Array<[string, bigint]> = [];
      for (const [id, op] of operations.entries()) {
        if (op.status === 'Processing' && op.processingStartedAt) {
          processingOps.push([id, op.processingStartedAt]);
        }
      }
      return processingOps;
    },

    getInterCanisterCallStatistics: async () => {
      // Enhanced mock statistics for retry demonstration
      const totalRetries = Array.from(operations.values())
        .reduce((sum, op) => sum + Number(op.retryCount), 0);
      
      return {
        totalInterCanisterCalls: BigInt(totalInterCanisterCalls),
        successfulInterCanisterCalls: BigInt(successfulInterCanisterCalls),
        failedInterCanisterCalls: BigInt(failedInterCanisterCalls),
        totalRetryAttempts: BigInt(totalRetryAttempts),
        successRate: totalInterCanisterCalls > 0 ? successfulInterCanisterCalls / totalInterCanisterCalls : 0,
      };
    },

    resetInterCanisterCallStatistics: async () => {
      // Reset all statistics to zero
      totalInterCanisterCalls = 0;
      successfulInterCanisterCalls = 0;
      failedInterCanisterCalls = 0;
      totalRetryAttempts = 0;
      
      return true;
    },

    // Subtask 5.9: Batch processing safety statistics
    getBatchProcessingStatistics: async () => {
      const averageCyclesPerBatch = totalBatchesProcessedSafety > 0 
        ? totalCyclesConsumedInBatches / totalBatchesProcessedSafety 
        : 0;
      
      const averageMemoryPerBatch = totalBatchesProcessedSafety > 0 
        ? totalMemoryUsedInBatches / totalBatchesProcessedSafety 
        : 0;
      
      const earlyTerminationRate = totalBatchesProcessedSafety > 0 
        ? totalEarlyTerminations / totalBatchesProcessedSafety 
        : 0;
      
      return {
        totalBatchesProcessed: BigInt(totalBatchesProcessedSafety),
        totalEarlyTerminations: BigInt(totalEarlyTerminations),
        totalCyclesConsumedInBatches: BigInt(totalCyclesConsumedInBatches),
        totalMemoryUsedInBatches: BigInt(totalMemoryUsedInBatches),
        averageCyclesPerBatch,
        averageMemoryPerBatch,
        earlyTerminationRate,
        currentBatchSafetyLimits: {
          maxBatchSize: BigInt(maxBatchSize),
          minCyclesThreshold: BigInt(minCyclesThreshold),
          maxMemoryUsageBytes: BigInt(maxMemoryUsageBytes),
          maxBatchProcessingTimeNs: BigInt(maxBatchProcessingTimeNs),
        },
      };
    },

    resetBatchProcessingStatistics: async () => {
      totalBatchesProcessedSafety = 0;
      totalEarlyTerminations = 0;
      totalCyclesConsumedInBatches = 0;
      totalMemoryUsedInBatches = 0;
      
      return true;
    },

    configureBatchProcessingSafety: async (
      newMaxBatchSize?: number,
      newMinCyclesThreshold?: number,
      newMaxMemoryUsageBytes?: number,
      newMaxBatchProcessingTimeNs?: number
    ) => {
      if (newMaxBatchSize !== undefined) {
        maxBatchSize = Math.max(1, Math.min(newMaxBatchSize, 100));
      }
      if (newMinCyclesThreshold !== undefined) {
        minCyclesThreshold = Math.max(100000000, newMinCyclesThreshold);
      }
      if (newMaxMemoryUsageBytes !== undefined) {
        maxMemoryUsageBytes = Math.max(100000000, Math.min(newMaxMemoryUsageBytes, 2000000000));
      }
      if (newMaxBatchProcessingTimeNs !== undefined) {
        maxBatchProcessingTimeNs = Math.max(1000000000, Math.min(newMaxBatchProcessingTimeNs, 30000000000));
      }
      
      console.log('Batch processing safety configuration updated:', {
        maxBatchSize,
        minCyclesThreshold,
        maxMemoryUsageBytes,
        maxBatchProcessingTimeNs
      });
      
      return true;
    },

    // Enhanced error handling and logging methods (Subtask 5.8 Implementation)
    getErrorLogs: async () => {
      return [...errorLogs].reverse(); // Return most recent errors first
    },

    getErrorStatistics: async () => {
      // Calculate system health score based on error patterns
      const recentErrors = errorLogs.filter(error => 
        Date.now() - error.context.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
      );
      const criticalErrors = recentErrors.filter(error => error.severity === 'Critical').length;
      const totalRecentErrors = recentErrors.length;
      
      // Health score: 100 - (critical errors * 20) - (total errors * 2), minimum 0
      const systemHealthScore = Math.max(0, 100 - (criticalErrors * 20) - (totalRecentErrors * 2));
      
      // Convert error patterns to array format
      const errorPatternsArray = Array.from(errorPatterns.entries()).map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        lastOccurrence: data.lastSeen,
        severity: data.severity
      }));

      return {
        totalErrors: BigInt(totalErrors),
        errorsByCategory: Object.fromEntries(
          Object.entries(errorsByCategory).map(([k, v]) => [k, BigInt(v)])
        ),
        errorsBySeverity: Object.fromEntries(
          Object.entries(errorsBySeverity).map(([k, v]) => [k, BigInt(v)])
        ),
        recentErrors: errorLogs.slice(-10), // Last 10 errors
        errorPatterns: errorPatternsArray,
        systemHealthScore
      };
    },

    getDetailedErrorAnalysis: async () => {
      const now = Date.now();
      const last24h = now - (24 * 60 * 60 * 1000);
      
      // Critical errors in last 24 hours
      const criticalErrorsLast24h = errorLogs.filter(error => 
        error.context.timestamp > last24h && error.severity === 'Critical'
      ).length;
      
      // Error trends by time windows
      const timeWindows = [
        { name: 'Last Hour', duration: 60 * 60 * 1000 },
        { name: 'Last 6 Hours', duration: 6 * 60 * 60 * 1000 },
        { name: 'Last 24 Hours', duration: 24 * 60 * 60 * 1000 }
      ];
      
      const errorTrends = timeWindows.map(window => {
        const windowStart = now - window.duration;
        const windowErrors = errorLogs.filter(error => error.context.timestamp > windowStart);
        
        // Group by category
        const categoryGroups = windowErrors.reduce((acc, error) => {
          acc[error.category] = (acc[error.category] || 0) + 1;
          return acc;
        }, {} as { [category: string]: number });
        
        return Object.entries(categoryGroups).map(([category, count]) => ({
          timeWindow: window.name,
          errorCount: count,
          category: category as ErrorCategory
        }));
      }).flat();
      
      // Top error messages
      const errorMessageCounts = errorLogs.reduce((acc, error) => {
        const shortMessage = error.message.substring(0, 100);
        if (!acc[shortMessage]) {
          acc[shortMessage] = { count: 0, lastSeen: 0 };
        }
        acc[shortMessage].count++;
        acc[shortMessage].lastSeen = Math.max(acc[shortMessage].lastSeen, error.context.timestamp);
        return acc;
      }, {} as { [message: string]: { count: number; lastSeen: number } });
      
      const topErrorMessages = Object.entries(errorMessageCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 5)
        .map(([message, data]) => ({
          message,
          count: data.count,
          lastSeen: data.lastSeen
        }));
      
      // Recovery success rate (operations that succeeded after retries)
      const retriedOperations = Array.from(operations.values()).filter(op => Number(op.retryCount) > 0);
      const successfulRetries = retriedOperations.filter(op => op.status === 'Completed').length;
      const recoverySuccessRate = retriedOperations.length > 0 
        ? (successfulRetries / retriedOperations.length) * 100 
        : 0;
      
      return {
        criticalErrorsLast24h,
        errorTrends,
        topErrorMessages,
        recoverySuccessRate
      };
    },

    // Subtask 5.10: Processing Statistics Tracking methods
    getProcessingStatistics: async (): Promise<ComprehensiveProcessingStatistics> => {
      const performanceMetrics: ProcessingPerformanceMetrics = {
        totalBatchesProcessed,
        totalOperationsProcessed,
        overallSuccessRate: totalOperationsProcessed > 0 
          ? ((totalOperationsProcessed - (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure)) / totalOperationsProcessed) * 100 
          : 0,
        overallFailureRate: totalOperationsProcessed > 0 
          ? ((operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure) / totalOperationsProcessed) * 100 
          : 0,
        averageProcessingDurationMs: totalBatchesProcessed > 0 ? totalProcessingTimeMs / totalBatchesProcessed : 0,
        averageOperationsPerSecond: totalProcessingTimeMs > 0 ? (totalOperationsProcessed / totalProcessingTimeMs) * 1000 : 0,
        peakOperationsPerSecond,
        averageBatchSize: totalBatchesProcessed > 0 ? totalOperationsProcessed / totalBatchesProcessed : 0,
        maxBatchSize: maxBatchSizeProcessed,
        averageCyclesPerOperation: totalOperationsProcessed > 0 ? totalCyclesConsumedInBatches / totalOperationsProcessed : 0,
        averageMemoryPerOperation: totalOperationsProcessed > 0 ? totalMemoryUsedInBatches / totalOperationsProcessed : 0,
        totalProcessingTimeMs,
        processingEfficiencyScore: Math.min(100, Math.max(0, 
          (peakOperationsPerSecond / 100) * 50 + // Throughput component (50%)
          (totalOperationsProcessed > 0 ? ((totalOperationsProcessed - (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure)) / totalOperationsProcessed) * 50 : 0) // Success rate component (50%)
        ))
      };

      const rollingAverages = calculateRollingAverages();

      const operationTypeStatistics: OperationTypeStatistics = {
        setOperations: {
          totalProcessed: operationTypeCounters.set.total,
          successCount: operationTypeCounters.set.success,
          failureCount: operationTypeCounters.set.failure,
          averageProcessingTime: operationTypeCounters.set.total > 0 ? operationTypeCounters.set.totalTime / operationTypeCounters.set.total : 0,
          successRate: operationTypeCounters.set.total > 0 ? (operationTypeCounters.set.success / operationTypeCounters.set.total) * 100 : 0
        },
        getOperations: {
          totalProcessed: operationTypeCounters.get.total,
          successCount: operationTypeCounters.get.success,
          failureCount: operationTypeCounters.get.failure,
          averageProcessingTime: operationTypeCounters.get.total > 0 ? operationTypeCounters.get.totalTime / operationTypeCounters.get.total : 0,
          successRate: operationTypeCounters.get.total > 0 ? (operationTypeCounters.get.success / operationTypeCounters.get.total) * 100 : 0
        },
        deleteOperations: {
          totalProcessed: operationTypeCounters.delete.total,
          successCount: operationTypeCounters.delete.success,
          failureCount: operationTypeCounters.delete.failure,
          averageProcessingTime: operationTypeCounters.delete.total > 0 ? operationTypeCounters.delete.totalTime / operationTypeCounters.delete.total : 0,
          successRate: operationTypeCounters.delete.total > 0 ? (operationTypeCounters.delete.success / operationTypeCounters.delete.total) * 100 : 0
        }
      };

      const queueUtilizationMetrics: QueueUtilizationMetrics = {
        queueDepthHistory: queueDepthHistory.slice(-100), // Last 100 entries
        averageQueueDepth: queueDepthHistory.length > 0 
          ? queueDepthHistory.reduce((sum, entry) => sum + entry.queueDepth, 0) / queueDepthHistory.length 
          : 0,
        peakQueueDepth,
        queueUtilizationTrend: queueDepthHistory.length >= 10 
          ? (() => {
              const recent = queueDepthHistory.slice(-5).reduce((sum, entry) => sum + entry.queueDepth, 0) / 5;
              const older = queueDepthHistory.slice(-10, -5).reduce((sum, entry) => sum + entry.queueDepth, 0) / 5;
              const change = (recent - older) / older;
              return change > 0.1 ? 'increasing' : change < -0.1 ? 'decreasing' : 'stable';
            })()
          : 'stable',
        timeToProcessQueue: performanceMetrics.averageOperationsPerSecond > 0 
          ? (queueDepthHistory.length > 0 ? queueDepthHistory[queueDepthHistory.length - 1].queueDepth / performanceMetrics.averageOperationsPerSecond : 0)
          : 0
      };

      const trendAnalysis = analyzeProcessingTrends();

      return {
        performanceMetrics,
        rollingAverages,
        operationTypeStatistics,
        queueUtilizationMetrics,
        trendAnalysis,
        processingHistory: processingHistory.slice(-50), // Last 50 entries
        lastUpdated: Date.now()
      };
    },

    resetProcessingStatistics: async () => {
      // Reset all processing statistics
      processingHistory.length = 0;
      queueDepthHistory.length = 0;
      totalOperationsProcessed = 0;
      totalBatchesProcessed = 0;
      totalProcessingTimeMs = 0;
      peakOperationsPerSecond = 0;
      maxBatchSizeProcessed = 0;
      peakQueueDepth = 0;
      
      // Reset operation type counters
      operationTypeCounters.set = { total: 0, success: 0, failure: 0, totalTime: 0 };
      operationTypeCounters.get = { total: 0, success: 0, failure: 0, totalTime: 0 };
      operationTypeCounters.delete = { total: 0, success: 0, failure: 0, totalTime: 0 };
      
      console.log('📊 Processing statistics have been reset to zero (Subtask 5.10)');
      return true;
    },

    getProcessingHistory: async (limit?: number) => {
      const historyLimit = limit || 100;
      return processingHistory.slice(-historyLimit);
    },

    getProcessingPerformanceMetrics: async () => {
      return {
        totalBatchesProcessed,
        totalOperationsProcessed,
        overallSuccessRate: totalOperationsProcessed > 0 
          ? ((totalOperationsProcessed - (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure)) / totalOperationsProcessed) * 100 
          : 0,
        overallFailureRate: totalOperationsProcessed > 0 
          ? ((operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure) / totalOperationsProcessed) * 100 
          : 0,
        averageProcessingDurationMs: totalBatchesProcessed > 0 ? totalProcessingTimeMs / totalBatchesProcessed : 0,
        averageOperationsPerSecond: totalProcessingTimeMs > 0 ? (totalOperationsProcessed / totalProcessingTimeMs) * 1000 : 0,
        peakOperationsPerSecond,
        averageBatchSize: totalBatchesProcessed > 0 ? totalOperationsProcessed / totalBatchesProcessed : 0,
        maxBatchSize: maxBatchSizeProcessed,
        averageCyclesPerOperation: totalOperationsProcessed > 0 ? totalCyclesConsumedInBatches / totalOperationsProcessed : 0,
        averageMemoryPerOperation: totalOperationsProcessed > 0 ? totalMemoryUsedInBatches / totalOperationsProcessed : 0,
        totalProcessingTimeMs,
        processingEfficiencyScore: Math.min(100, Math.max(0, 
          (peakOperationsPerSecond / 100) * 50 + // Throughput component (50%)
          (totalOperationsProcessed > 0 ? ((totalOperationsProcessed - (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure)) / totalOperationsProcessed) * 50 : 0) // Success rate component (50%)
        ))
      };
    },

    getRollingAverages: async () => {
      return calculateRollingAverages();
    },

    getOperationTypeStatistics: async () => {
      return {
        setOperations: {
          totalProcessed: operationTypeCounters.set.total,
          successCount: operationTypeCounters.set.success,
          failureCount: operationTypeCounters.set.failure,
          averageProcessingTime: operationTypeCounters.set.total > 0 ? operationTypeCounters.set.totalTime / operationTypeCounters.set.total : 0,
          successRate: operationTypeCounters.set.total > 0 ? (operationTypeCounters.set.success / operationTypeCounters.set.total) * 100 : 0
        },
        getOperations: {
          totalProcessed: operationTypeCounters.get.total,
          successCount: operationTypeCounters.get.success,
          failureCount: operationTypeCounters.get.failure,
          averageProcessingTime: operationTypeCounters.get.total > 0 ? operationTypeCounters.get.totalTime / operationTypeCounters.get.total : 0,
          successRate: operationTypeCounters.get.total > 0 ? (operationTypeCounters.get.success / operationTypeCounters.get.total) * 100 : 0
        },
        deleteOperations: {
          totalProcessed: operationTypeCounters.delete.total,
          successCount: operationTypeCounters.delete.success,
          failureCount: operationTypeCounters.delete.failure,
          averageProcessingTime: operationTypeCounters.delete.total > 0 ? operationTypeCounters.delete.totalTime / operationTypeCounters.delete.total : 0,
          successRate: operationTypeCounters.delete.total > 0 ? (operationTypeCounters.delete.success / operationTypeCounters.delete.total) * 100 : 0
        }
      };
    },

    getQueueUtilizationMetrics: async () => {
      return {
        queueDepthHistory: queueDepthHistory.slice(-100), // Last 100 entries
        averageQueueDepth: queueDepthHistory.length > 0 
          ? queueDepthHistory.reduce((sum, entry) => sum + entry.queueDepth, 0) / queueDepthHistory.length 
          : 0,
        peakQueueDepth,
        queueUtilizationTrend: queueDepthHistory.length >= 10 
          ? (() => {
              const recent = queueDepthHistory.slice(-5).reduce((sum, entry) => sum + entry.queueDepth, 0) / 5;
              const older = queueDepthHistory.slice(-10, -5).reduce((sum, entry) => sum + entry.queueDepth, 0) / 5;
              const change = (recent - older) / older;
              return change > 0.1 ? 'increasing' : change < -0.1 ? 'decreasing' : 'stable';
            })()
          : 'stable',
        timeToProcessQueue: totalOperationsProcessed > 0 && totalProcessingTimeMs > 0
          ? (queueDepthHistory.length > 0 ? queueDepthHistory[queueDepthHistory.length - 1].queueDepth / ((totalOperationsProcessed / totalProcessingTimeMs) * 1000) : 0)
          : 0
      };
    },

    getProcessingTrendAnalysis: async () => {
      return analyzeProcessingTrends();
    },

    // Task 6: Queue Management Features Implementation
    performHealthCheck: async () => {
      const now = Date.now();
      lastHealthCheck = now;
      
      const allOps = Array.from(operations.values());
      const queueDepth = allOps.filter(op => op.status === 'Queued' || op.status === 'Retrying').length;
      const processingRate = totalProcessingTimeMs > 0 ? (totalOperationsProcessed / totalProcessingTimeMs) * 60000 : 0; // ops per minute
      const errorRate = totalOperationsProcessed > 0 ? (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure) / totalOperationsProcessed : 0;
      const averageProcessingTime = totalBatchesProcessed > 0 ? totalProcessingTimeMs / totalBatchesProcessed : 0;
      const memoryUsage = 500000000 + (queueDepth * 1000); // Mock memory calculation
      const cyclesBalance = 1000000000 - (totalOperationsProcessed * 1000000); // Mock cycles calculation
      
      let status: 'Healthy' | 'Warning' | 'Critical' | 'Degraded' = 'Healthy';
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check queue depth
      if (queueDepth > (maxQueueSize * 0.8)) {
        status = 'Warning';
        issues.push(`Queue depth is at ${queueDepth}/${maxQueueSize} (${Math.round((queueDepth / maxQueueSize) * 100)}%)`);
        recommendations.push('Consider increasing processing rate or queue capacity');
      }

      if (queueDepth >= maxQueueSize) {
        status = 'Critical';
        issues.push('Queue is at maximum capacity');
        recommendations.push('Immediate action required: increase processing or clear queue');
      }

      // Check error rate
      if (errorRate > 0.1) { // 10% error rate
        status = status === 'Critical' ? 'Critical' : 'Warning';
        issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
        recommendations.push('Investigate error causes and improve error handling');
      }

      if (errorRate > 0.25) { // 25% error rate
        status = 'Critical';
        issues.push(`Critical error rate: ${(errorRate * 100).toFixed(1)}%`);
        recommendations.push('System requires immediate attention');
      }

      // Check cycles
      if (cyclesBalance < minCyclesThreshold * 2) {
        status = status === 'Critical' ? 'Critical' : 'Warning';
        issues.push(`Low cycles balance: ${cyclesBalance}`);
        recommendations.push('Top up cycles soon');
      }

      if (cyclesBalance < minCyclesThreshold) {
        status = 'Critical';
        issues.push(`Critical cycles balance: ${cyclesBalance}`);
        recommendations.push('Immediate cycles top-up required');
      }

      // Check memory usage
      if (memoryUsage > (maxMemoryUsageBytes * 0.8)) {
        status = status === 'Critical' ? 'Critical' : 'Warning';
        issues.push(`High memory usage: ${memoryUsage} bytes`);
        recommendations.push('Consider memory optimization or cleanup');
      }

      if (memoryUsage > maxMemoryUsageBytes) {
        status = 'Critical';
        issues.push(`Memory usage exceeds limit: ${memoryUsage} bytes`);
        recommendations.push('Immediate memory cleanup required');
      }

      // Check processing operations
      const processingCount = allOps.filter(op => op.status === 'Processing').length;
      if (processingCount > maxBatchSize * 2) {
        status = status === 'Critical' ? 'Critical' : 'Degraded';
        issues.push(`Too many operations in processing state: ${processingCount}`);
        recommendations.push('Check for stuck operations or reduce batch size');
      }

      return {
        status,
        queueDepth,
        processingRate,
        errorRate,
        averageProcessingTime,
        memoryUsage,
        cyclesBalance,
        lastHealthCheck: BigInt(now * 1000000),
        issues,
        recommendations
      };
    },

    getQueueMetrics: async () => {
      const now = Date.now();
      const uptime = now - systemStartTime;
      const processingRate = totalProcessingTimeMs > 0 ? (totalOperationsProcessed / totalProcessingTimeMs) * 60000 : 0; // ops per minute
      const errorRate = totalOperationsProcessed > 0 ? (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure) / totalOperationsProcessed : 0;
      const successRate = totalOperationsProcessed > 0 ? ((totalOperationsProcessed - (operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure)) / totalOperationsProcessed) : 0;
      const avgQueueTime = totalBatchesProcessed > 0 ? totalProcessingTimeMs / totalBatchesProcessed : 0;
      const avgProcessingTime = totalBatchesProcessed > 0 ? totalProcessingTimeMs / totalBatchesProcessed : 0;

      const allOps = Array.from(operations.values());
      const totalRetried = allOps.filter(op => Number(op.retryCount) > 0).length;

      return {
        totalOperationsQueued: BigInt(allOps.length),
        totalOperationsCompleted: BigInt(operationTypeCounters.set.success + operationTypeCounters.get.success + operationTypeCounters.delete.success),
        totalOperationsFailed: BigInt(operationTypeCounters.set.failure + operationTypeCounters.get.failure + operationTypeCounters.delete.failure),
        totalOperationsRetried: BigInt(totalRetried),
        currentQueueDepth: BigInt(allOps.filter(op => op.status === 'Queued' || op.status === 'Retrying').length),
        averageQueueTime: avgQueueTime,
        averageProcessingTime: avgProcessingTime,
        throughputPerMinute: processingRate,
        errorRate,
        successRate,
        peakQueueDepth: BigInt(peakQueueDepth),
        totalCyclesConsumed: BigInt(totalCyclesConsumedInBatches),
        totalMemoryUsed: BigInt(totalMemoryUsedInBatches),
        uptime: BigInt(uptime * 1000000), // Convert to nanoseconds
        lastMetricsUpdate: BigInt(now * 1000000)
      };
    },

    performMaintenance: async (operation: MaintenanceOperation) => {
      const startTime = Date.now();
      const initialMemory = 500000000; // Mock initial memory
      let itemsAffected = 0;
      let success = true;
      let message = '';

      if (operation.PurgeCompleted !== undefined) {
        const completedOps = Array.from(operations.entries()).filter(([, op]) => op.status === 'Completed');
        itemsAffected = completedOps.length;
        
        for (const [id] of completedOps) {
          operations.delete(id);
          retryQueue.delete(id);
        }
        
        message = `Purged ${itemsAffected} completed operations`;
      } else if (operation.PurgeFailed !== undefined) {
        const failedOps = Array.from(operations.entries()).filter(([, op]) => op.status === 'Failed');
        itemsAffected = failedOps.length;
        
        for (const [id] of failedOps) {
          operations.delete(id);
          retryQueue.delete(id);
        }
        
        message = `Purged ${itemsAffected} failed operations`;
      } else if (operation.PurgeOld !== undefined) {
        const cutoffTime = Date.now() - operation.PurgeOld.olderThanMs;
        const oldOps = Array.from(operations.entries()).filter(([, op]) => {
          const opTime = Number(op.queuedAt) / 1000000; // Convert from nanoseconds
          return opTime < cutoffTime && (op.status === 'Completed' || op.status === 'Failed');
        });
        
        itemsAffected = oldOps.length;
        
        for (const [id] of oldOps) {
          operations.delete(id);
          retryQueue.delete(id);
        }
        
        message = `Purged ${itemsAffected} operations older than ${operation.PurgeOld.olderThanMs}ms`;
      } else if (operation.CompactQueue !== undefined) {
        // Simulate queue compaction
        const activeOps = Array.from(operations.entries()).filter(([, op]) => 
          op.status === 'Queued' || op.status === 'Processing' || op.status === 'Retrying'
        );
        
        itemsAffected = activeOps.length;
        message = `Compacted queue with ${itemsAffected} active operations`;
      } else if (operation.ResetStatistics !== undefined) {
        // Reset all statistics
        totalOperationsProcessed = 0;
        totalBatchesProcessed = 0;
        totalProcessingTimeMs = 0;
        peakOperationsPerSecond = 0;
        maxBatchSizeProcessed = 0;
        peakQueueDepth = 0;
        totalInterCanisterCalls = 0;
        successfulInterCanisterCalls = 0;
        failedInterCanisterCalls = 0;
        totalRetryAttempts = 0;
        totalBatchesProcessedSafety = 0;
        totalEarlyTerminations = 0;
        totalCyclesConsumedInBatches = 0;
        totalMemoryUsedInBatches = 0;
        systemStartTime = Date.now();
        
        // Reset operation type counters
        operationTypeCounters.set = { total: 0, success: 0, failure: 0, totalTime: 0 };
        operationTypeCounters.get = { total: 0, success: 0, failure: 0, totalTime: 0 };
        operationTypeCounters.delete = { total: 0, success: 0, failure: 0, totalTime: 0 };
        
        // Clear history arrays
        processingHistory.length = 0;
        queueDepthHistory.length = 0;
        
        message = 'All statistics have been reset';
      } else if (operation.OptimizeMemory !== undefined) {
        // Clean up stale processing operations
        const staleOps = Array.from(operations.entries()).filter(([, op]) => {
          if (op.processingStartedAt) {
            const age = Date.now() * 1000000 - Number(op.processingStartedAt);
            return age > 3600_000_000_000; // 1 hour in nanoseconds
          }
          return false;
        });
        
        itemsAffected = staleOps.length;
        
        for (const [id] of staleOps) {
          operations.delete(id);
          retryQueue.delete(id);
        }
        
        message = `Cleaned up ${itemsAffected} stale processing operations`;
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      const memoryFreed = Math.max(0, initialMemory - (initialMemory - (itemsAffected * 1000))); // Mock calculation

      return {
        operation,
        success,
        itemsAffected,
        memoryFreed,
        executionTimeMs: executionTime,
        message
      };
    },

    updateConfiguration: async (parameter: ConfigurationParameter) => {
      if (parameter.MaxQueueSize !== undefined) {
        if (parameter.MaxQueueSize > 0 && parameter.MaxQueueSize <= 10000) {
          maxQueueSize = parameter.MaxQueueSize;
          console.log(`Updated maxQueueSize to ${parameter.MaxQueueSize}`);
          return true;
        }
        return false;
      }
      
      if (parameter.MaxBatchSize !== undefined) {
        if (parameter.MaxBatchSize > 0 && parameter.MaxBatchSize <= 1000) {
          maxBatchSize = parameter.MaxBatchSize;
          console.log(`Updated maxBatchSize to ${parameter.MaxBatchSize}`);
          return true;
        }
        return false;
      }
      
      if (parameter.MinCyclesThreshold !== undefined) {
        if (parameter.MinCyclesThreshold >= 100000000) {
          minCyclesThreshold = parameter.MinCyclesThreshold;
          console.log(`Updated minCyclesThreshold to ${parameter.MinCyclesThreshold}`);
          return true;
        }
        return false;
      }
      
      if (parameter.MaxMemoryUsageBytes !== undefined) {
        if (parameter.MaxMemoryUsageBytes >= 100000000 && parameter.MaxMemoryUsageBytes <= 4000000000) {
          maxMemoryUsageBytes = parameter.MaxMemoryUsageBytes;
          console.log(`Updated maxMemoryUsageBytes to ${parameter.MaxMemoryUsageBytes}`);
          return true;
        }
        return false;
      }
      
      if (parameter.MaxBatchProcessingTimeNs !== undefined) {
        if (parameter.MaxBatchProcessingTimeNs >= 1000000000 && parameter.MaxBatchProcessingTimeNs <= 60000000000) {
          maxBatchProcessingTimeNs = parameter.MaxBatchProcessingTimeNs;
          console.log(`Updated maxBatchProcessingTimeNs to ${parameter.MaxBatchProcessingTimeNs}`);
          return true;
        }
        return false;
      }
      
      if (parameter.HealthCheckIntervalMs !== undefined) {
        if (parameter.HealthCheckIntervalMs >= 1000 && parameter.HealthCheckIntervalMs <= 3600000) {
          healthCheckIntervalMs = parameter.HealthCheckIntervalMs;
          console.log(`Updated healthCheckIntervalMs to ${parameter.HealthCheckIntervalMs}`);
          return true;
        }
        return false;
      }
      
      if (parameter.MetricsCollectionEnabled !== undefined) {
        metricsCollectionEnabled = parameter.MetricsCollectionEnabled;
        console.log(`Updated metricsCollectionEnabled to ${parameter.MetricsCollectionEnabled}`);
        return true;
      }
      
      return false;
    },

    getConfiguration: async () => {
      return {
        maxQueueSize: BigInt(maxQueueSize),
        maxBatchSize: BigInt(maxBatchSize),
        minCyclesThreshold: BigInt(minCyclesThreshold),
        maxMemoryUsageBytes: BigInt(maxMemoryUsageBytes),
        maxBatchProcessingTimeNs: BigInt(maxBatchProcessingTimeNs),
        healthCheckIntervalMs: BigInt(healthCheckIntervalMs),
        metricsCollectionEnabled
      };
    }
  };
};

// Global queue actor instance
let queueActor: QueueCanisterInterface | null = null;

const getQueueActor = (): QueueCanisterInterface => {
  if (!queueActor) {
    queueActor = createQueueCanisterActor();
  }
  return queueActor;
};

export function useQueueOperation() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async ({ operation }: { operation: QueueOperation }) => {
      return queueActor.queueOperation(operation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueState'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
    },
  });
}

export function useOperationStatus(operationId: string) {
  const queueActor = getQueueActor();

  return useQuery<OperationStatusInfo | null>({
    queryKey: ['operationStatus', operationId],
    queryFn: async () => {
      if (!operationId.trim()) return null;
      return queueActor.getOperationStatus(operationId);
    },
    enabled: !!operationId.trim(),
    refetchInterval: 1000, // Poll every second for status updates
  });
}

export function useOperationStatuses(operationIds: string[]) {
  const queueActor = getQueueActor();

  return useQuery<(OperationStatusInfo | null)[]>({
    queryKey: ['operationStatuses', operationIds],
    queryFn: async () => {
      if (operationIds.length === 0) return [];
      return queueActor.getOperationStatuses(operationIds);
    },
    enabled: operationIds.length > 0,
    refetchInterval: 2000,
  });
}

export function useQueueStatistics() {
  const queueActor = getQueueActor();

  return useQuery<QueueStatistics>({
    queryKey: ['queueStatistics'],
    queryFn: async () => {
      return queueActor.getQueueStatistics();
    },
    refetchInterval: 2000,
  });
}

export function useQueueState() {
  const queueActor = getQueueActor();

  return useQuery<Array<[bigint, OperationStatusInfo]>>({
    queryKey: ['queueState'],
    queryFn: async () => {
      return queueActor.getQueueState();
    },
    refetchInterval: 1000,
  });
}

export function useSimulateProcessOperation() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async (operationId: string) => {
      return queueActor.simulateProcessOperation(operationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['queueStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueState'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
    },
  });
}

export function useProcessQueue() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async (batchSize: number) => {
      return queueActor.processQueue(batchSize);
    },
    onSuccess: () => {
      // Invalidate all queue-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['queueStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueState'] });
      queryClient.invalidateQueries({ queryKey: ['operationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['operationStatuses'] });
      queryClient.invalidateQueries({ queryKey: ['batchProcessingStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['processingStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['processingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['processingPerformanceMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['rollingAverages'] });
      queryClient.invalidateQueries({ queryKey: ['operationTypeStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueUtilizationMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['processingTrendAnalysis'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['queueHealthCheck'] });
    },
  });
}

export function useClearCompletedOperations() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async () => {
      return queueActor.clearCompletedOperations();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueState'] });
      queryClient.invalidateQueries({ queryKey: ['operationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
    },
  });
}

export function useInterCanisterCallStatistics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['interCanisterCallStatistics'],
    queryFn: async () => {
      return queueActor.getInterCanisterCallStatistics();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useResetInterCanisterCallStatistics() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async () => {
      return queueActor.resetInterCanisterCallStatistics();
    },
    onSuccess: () => {
      // Invalidate inter-canister call statistics to refresh the UI immediately
      queryClient.invalidateQueries({ queryKey: ['interCanisterCallStatistics'] });
    },
  });
}

export function useCurrentlyProcessingOperations() {
  const queueActor = getQueueActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['currentlyProcessingOperations'],
    queryFn: async () => {
      return queueActor.getCurrentlyProcessingOperations();
    },
    refetchInterval: 1000,
  });
}

// Subtask 5.9: Batch processing safety hooks
export function useBatchProcessingStatistics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['batchProcessingStatistics'],
    queryFn: async () => {
      return queueActor.getBatchProcessingStatistics();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useResetBatchProcessingStatistics() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async () => {
      return queueActor.resetBatchProcessingStatistics();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchProcessingStatistics'] });
    },
  });
}

export function useConfigureBatchProcessingSafety() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async (config: {
      maxBatchSize?: number;
      minCyclesThreshold?: number;
      maxMemoryUsageBytes?: number;
      maxBatchProcessingTimeNs?: number;
    }) => {
      return queueActor.configureBatchProcessingSafety(
        config.maxBatchSize,
        config.minCyclesThreshold,
        config.maxMemoryUsageBytes,
        config.maxBatchProcessingTimeNs
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchProcessingStatistics'] });
    },
  });
}

// Enhanced hooks for comprehensive error handling and logging (Subtask 5.8)
export function useErrorLogs() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['errorLogs'],
    queryFn: async () => {
      return queueActor.getErrorLogs();
    },
    refetchInterval: 3000, // Refresh every 3 seconds
  });
}

export function useErrorStatistics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['errorStatistics'],
    queryFn: async () => {
      return queueActor.getErrorStatistics();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useDetailedErrorAnalysis() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['detailedErrorAnalysis'],
    queryFn: async () => {
      return queueActor.getDetailedErrorAnalysis();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Subtask 5.10: Processing Statistics Tracking hooks
export function useProcessingStatistics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['processingStatistics'],
    queryFn: async () => {
      return queueActor.getProcessingStatistics();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function useResetProcessingStatistics() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async () => {
      return queueActor.resetProcessingStatistics();
    },
    onSuccess: () => {
      // Invalidate all processing statistics queries
      queryClient.invalidateQueries({ queryKey: ['processingStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['processingHistory'] });
      queryClient.invalidateQueries({ queryKey: ['processingPerformanceMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['rollingAverages'] });
      queryClient.invalidateQueries({ queryKey: ['operationTypeStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueUtilizationMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['processingTrendAnalysis'] });
    },
  });
}

export function useProcessingHistory(limit?: number) {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['processingHistory', limit],
    queryFn: async () => {
      return queueActor.getProcessingHistory(limit);
    },
    refetchInterval: 5000,
  });
}

export function useProcessingPerformanceMetrics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['processingPerformanceMetrics'],
    queryFn: async () => {
      return queueActor.getProcessingPerformanceMetrics();
    },
    refetchInterval: 5000,
  });
}

export function useRollingAverages() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['rollingAverages'],
    queryFn: async () => {
      return queueActor.getRollingAverages();
    },
    refetchInterval: 5000,
  });
}

export function useOperationTypeStatistics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['operationTypeStatistics'],
    queryFn: async () => {
      return queueActor.getOperationTypeStatistics();
    },
    refetchInterval: 5000,
  });
}

export function useQueueUtilizationMetrics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['queueUtilizationMetrics'],
    queryFn: async () => {
      return queueActor.getQueueUtilizationMetrics();
    },
    refetchInterval: 5000,
  });
}

export function useProcessingTrendAnalysis() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['processingTrendAnalysis'],
    queryFn: async () => {
      return queueActor.getProcessingTrendAnalysis();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}

// Task 6: Queue Management Features hooks
export function useQueueHealthCheck() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['queueHealthCheck'],
    queryFn: async () => {
      return queueActor.performHealthCheck();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useQueueMetrics() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['queueMetrics'],
    queryFn: async () => {
      return queueActor.getQueueMetrics();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

export function usePerformMaintenance() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async (operation: MaintenanceOperation) => {
      return queueActor.performMaintenance(operation);
    },
    onSuccess: () => {
      // Invalidate relevant queries after maintenance
      queryClient.invalidateQueries({ queryKey: ['queueStatistics'] });
      queryClient.invalidateQueries({ queryKey: ['queueState'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['queueHealthCheck'] });
      queryClient.invalidateQueries({ queryKey: ['operationStatus'] });
      queryClient.invalidateQueries({ queryKey: ['processingStatistics'] });
    },
  });
}

export function useUpdateConfiguration() {
  const queryClient = useQueryClient();
  const queueActor = getQueueActor();

  return useMutation({
    mutationFn: async (parameter: ConfigurationParameter) => {
      return queueActor.updateConfiguration(parameter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueConfiguration'] });
      queryClient.invalidateQueries({ queryKey: ['queueHealthCheck'] });
      queryClient.invalidateQueries({ queryKey: ['queueMetrics'] });
    },
  });
}

export function useQueueConfiguration() {
  const queueActor = getQueueActor();

  return useQuery({
    queryKey: ['queueConfiguration'],
    queryFn: async () => {
      return queueActor.getConfiguration();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
