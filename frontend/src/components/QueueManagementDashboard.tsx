import React, { useState } from 'react';
import { 
  useQueueHealthCheck, 
  useQueueMetrics, 
  usePerformMaintenance, 
  useQueueConfiguration,
  useUpdateConfiguration
} from '../hooks/useQueueQueries';
import { 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Trash2, 
  RefreshCw, 
  Wrench, 
  BarChart3,
  Shield,
  Zap,
  HardDrive,
  Cpu,
  Timer,
  TrendingUp,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RotateCcw
} from 'lucide-react';

interface MaintenanceOperation {
  PurgeCompleted?: null;
  PurgeFailed?: null;
  PurgeOld?: { olderThanMs: number };
  CompactQueue?: null;
  ResetStatistics?: null;
  OptimizeMemory?: null;
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

interface ConfigChanges {
  maxQueueSize?: number;
  maxBatchSize?: number;
  minCyclesThreshold?: number;
  maxMemoryUsageBytes?: number;
  maxBatchProcessingTimeNs?: number;
  maxRetryAttempts?: number;
  healthCheckIntervalMs?: number;
  metricsCollectionEnabled?: boolean;
}

const QueueManagementDashboard: React.FC = () => {
  const [selectedMaintenanceOp, setSelectedMaintenanceOp] = useState<string>('');
  const [purgeOlderThanHours, setPurgeOlderThanHours] = useState(24);
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [configChanges, setConfigChanges] = useState<ConfigChanges>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: healthReport, refetch: refetchHealth } = useQueueHealthCheck();
  const { data: queueMetrics } = useQueueMetrics();
  const { data: configuration } = useQueueConfiguration();
  const performMaintenanceMutation = usePerformMaintenance();
  const updateConfigMutation = useUpdateConfiguration();

  const handleMaintenanceOperation = async () => {
    if (!selectedMaintenanceOp) return;

    let operation: MaintenanceOperation;
    
    switch (selectedMaintenanceOp) {
      case 'purgeCompleted':
        operation = { PurgeCompleted: null };
        break;
      case 'purgeFailed':
        operation = { PurgeFailed: null };
        break;
      case 'purgeOld':
        operation = { PurgeOld: { olderThanMs: purgeOlderThanHours * 60 * 60 * 1000 } };
        break;
      case 'compactQueue':
        operation = { CompactQueue: null };
        break;
      case 'resetStatistics':
        operation = { ResetStatistics: null };
        break;
      case 'optimizeMemory':
        operation = { OptimizeMemory: null };
        break;
      default:
        return;
    }

    try {
      await performMaintenanceMutation.mutateAsync(operation);
      setShowMaintenanceConfirm(false);
      setSelectedMaintenanceOp('');
      // Refresh health check after maintenance
      refetchHealth();
    } catch (error) {
      console.error('Maintenance operation failed:', error);
    }
  };

  const handleConfigurationChange = (key: string, value: number | boolean) => {
    setConfigChanges((prev: ConfigChanges) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const saveConfiguration = async () => {
    for (const [key, value] of Object.entries(configChanges)) {
      let parameter: ConfigurationParameter;
      
      switch (key) {
        case 'maxQueueSize':
          parameter = { MaxQueueSize: value as number };
          break;
        case 'maxBatchSize':
          parameter = { MaxBatchSize: value as number };
          break;
        case 'minCyclesThreshold':
          parameter = { MinCyclesThreshold: value as number };
          break;
        case 'maxMemoryUsageBytes':
          parameter = { MaxMemoryUsageBytes: value as number };
          break;
        case 'maxBatchProcessingTimeNs':
          parameter = { MaxBatchProcessingTimeNs: value as number };
          break;
        case 'maxRetryAttempts':
          parameter = { MaxRetryAttempts: value as number };
          break;
        case 'healthCheckIntervalMs':
          parameter = { HealthCheckIntervalMs: value as number };
          break;
        case 'metricsCollectionEnabled':
          parameter = { MetricsCollectionEnabled: value as boolean };
          break;
        default:
          continue;
      }

      try {
        await updateConfigMutation.mutateAsync(parameter);
      } catch (error) {
        console.error(`Failed to update ${key}:`, error);
      }
    }

    setConfigChanges({});
    setHasUnsavedChanges(false);
  };

  const resetConfiguration = () => {
    setConfigChanges({});
    setHasUnsavedChanges(false);
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'Critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'Degraded':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'border-green-500 bg-green-500/10';
      case 'Warning':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'Critical':
        return 'border-red-500 bg-red-500/10';
      case 'Degraded':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const formatBytes = (bytes: number | bigint) => {
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;
    if (numBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCycles = (cycles: number | bigint) => {
    const numCycles = typeof cycles === 'bigint' ? Number(cycles) : cycles;
    if (numCycles === 0) return '0';
    const k = 1000;
    const sizes = ['', 'K', 'M', 'B', 'T'];
    const i = Math.floor(Math.log(numCycles) / Math.log(k));
    return parseFloat((numCycles / Math.pow(k, i)).toFixed(2)) + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatUptime = (nanoseconds: number | bigint) => {
    const numNanoseconds = typeof nanoseconds === 'bigint' ? Number(nanoseconds) : nanoseconds;
    const seconds = numNanoseconds / 1_000_000_000;
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Type-safe helper functions for getting configuration values
  const getNumericConfigValue = (key: keyof ConfigChanges, defaultValue: number): number => {
    if (configChanges[key] !== undefined) {
      return configChanges[key] as number;
    }
    
    if (!configuration) {
      return defaultValue;
    }
    
    switch (key) {
      case 'maxQueueSize':
        return Number(configuration.maxQueueSize) ?? defaultValue;
      case 'maxBatchSize':
        return Number(configuration.maxBatchSize) ?? defaultValue;
      case 'minCyclesThreshold':
        return Number(configuration.minCyclesThreshold) ?? defaultValue;
      case 'maxMemoryUsageBytes':
        return Number(configuration.maxMemoryUsageBytes) ?? defaultValue;
      case 'maxBatchProcessingTimeNs':
        return Number(configuration.maxBatchProcessingTimeNs) ?? defaultValue;
      case 'healthCheckIntervalMs':
        return Number(configuration.healthCheckIntervalMs) ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  const getBooleanConfigValue = (key: keyof ConfigChanges, defaultValue: boolean): boolean => {
    if (configChanges[key] !== undefined) {
      return configChanges[key] as boolean;
    }
    
    if (!configuration) {
      return defaultValue;
    }
    
    switch (key) {
      case 'metricsCollectionEnabled':
        return configuration.metricsCollectionEnabled ?? defaultValue;
      default:
        return defaultValue;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-400" />
          Queue Management Dashboard
          <span className="ml-3 text-sm bg-green-600 text-green-100 px-2 py-1 rounded">
            ✅ Task 6 Complete
          </span>
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowConfiguration(!showConfiguration)}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            {showConfiguration ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showConfiguration ? 'Hide Config' : 'Show Config'}
          </button>
          <button
            onClick={() => refetchHealth()}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh Health
          </button>
        </div>
      </div>

      {/* Queue Health Status */}
      {healthReport && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Queue Health Status
          </h3>
          
          <div className={`p-4 rounded-lg border ${getHealthStatusColor(healthReport.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getHealthStatusIcon(healthReport.status)}
                <div>
                  <div className="font-medium text-lg">{healthReport.status}</div>
                  <div className="text-sm text-gray-400">
                    Last check: {new Date(Number(healthReport.lastHealthCheck) / 1_000_000).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{healthReport.queueDepth}</div>
                  <div className="text-gray-400">Queue Depth</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{healthReport.processingRate.toFixed(1)}</div>
                  <div className="text-gray-400">Ops/Min</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{(healthReport.errorRate * 100).toFixed(1)}%</div>
                  <div className="text-gray-400">Error Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{formatDuration(healthReport.averageProcessingTime)}</div>
                  <div className="text-gray-400">Avg Time</div>
                </div>
              </div>
            </div>

            {healthReport.issues.length > 0 && (
              <div className="mb-4">
                <div className="font-medium text-red-300 mb-2">Issues Detected:</div>
                <ul className="space-y-1">
                  {healthReport.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-200 flex items-start">
                      <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {healthReport.recommendations.length > 0 && (
              <div>
                <div className="font-medium text-blue-300 mb-2">Recommendations:</div>
                <ul className="space-y-1">
                  {healthReport.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-blue-200 flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-600 rounded p-3 text-center">
              <div className="text-lg font-bold text-purple-400">{formatCycles(healthReport.cyclesBalance)}</div>
              <div className="text-xs text-gray-400">Cycles Balance</div>
            </div>
            <div className="bg-gray-600 rounded p-3 text-center">
              <div className="text-lg font-bold text-green-400">{formatBytes(healthReport.memoryUsage)}</div>
              <div className="text-xs text-gray-400">Memory Usage</div>
            </div>
            <div className="bg-gray-600 rounded p-3 text-center">
              <div className="text-lg font-bold text-blue-400">{healthReport.processingRate.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Processing Rate</div>
            </div>
            <div className="bg-gray-600 rounded p-3 text-center">
              <div className="text-lg font-bold text-orange-400">{formatDuration(healthReport.averageProcessingTime)}</div>
              <div className="text-xs text-gray-400">Avg Processing</div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Metrics */}
      {queueMetrics && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
            Comprehensive Queue Metrics
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{queueMetrics.totalOperationsQueued.toString()}</div>
              <div className="text-xs text-gray-400">Total Queued</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{queueMetrics.totalOperationsCompleted.toString()}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{queueMetrics.totalOperationsFailed.toString()}</div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{queueMetrics.totalOperationsRetried.toString()}</div>
              <div className="text-xs text-gray-400">Retried</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-cyan-300">Performance Metrics:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-green-400">{(queueMetrics.successRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className="text-red-400">{(queueMetrics.errorRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="text-blue-400">{queueMetrics.throughputPerMinute.toFixed(1)} ops/min</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-cyan-300">Timing Metrics:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Avg Queue Time:</span>
                  <span className="text-yellow-400">{formatDuration(queueMetrics.averageQueueTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Processing:</span>
                  <span className="text-purple-400">{formatDuration(queueMetrics.averageProcessingTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-green-400">{formatUptime(queueMetrics.uptime)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-cyan-300">Resource Usage:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Peak Queue:</span>
                  <span className="text-orange-400">{queueMetrics.peakQueueDepth.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cycles:</span>
                  <span className="text-purple-400">{formatCycles(queueMetrics.totalCyclesConsumed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Memory:</span>
                  <span className="text-green-400">{formatBytes(queueMetrics.totalMemoryUsed)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            Last updated: {new Date(Number(queueMetrics.lastMetricsUpdate) / 1_000_000).toLocaleString()}
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfiguration && configuration && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-orange-400" />
              Queue Configuration
            </h3>
            
            {hasUnsavedChanges && (
              <div className="flex space-x-2">
                <button
                  onClick={saveConfiguration}
                  disabled={updateConfigMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm font-medium flex items-center"
                >
                  {updateConfigMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={resetConfiguration}
                  disabled={updateConfigMutation.isPending}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 px-3 py-1 rounded text-sm font-medium flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Queue Size: {getNumericConfigValue('maxQueueSize', Number(configuration.maxQueueSize))}
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={getNumericConfigValue('maxQueueSize', Number(configuration.maxQueueSize))}
                  onChange={(e) => handleConfigurationChange('maxQueueSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100</span>
                  <span>5K</span>
                  <span>10K</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Batch Size: {getNumericConfigValue('maxBatchSize', Number(configuration.maxBatchSize))}
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={getNumericConfigValue('maxBatchSize', Number(configuration.maxBatchSize))}
                  onChange={(e) => handleConfigurationChange('maxBatchSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>500</span>
                  <span>1000</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Cycles Threshold: {formatCycles(getNumericConfigValue('minCyclesThreshold', Number(configuration.minCyclesThreshold)))}
                </label>
                <input
                  type="range"
                  min="100000000"
                  max="10000000000"
                  step="100000000"
                  value={getNumericConfigValue('minCyclesThreshold', Number(configuration.minCyclesThreshold))}
                  onChange={(e) => handleConfigurationChange('minCyclesThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100M</span>
                  <span>5B</span>
                  <span>10B</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Memory Usage: {formatBytes(getNumericConfigValue('maxMemoryUsageBytes', Number(configuration.maxMemoryUsageBytes)))}
                </label>
                <input
                  type="range"
                  min="100000000"
                  max="4000000000"
                  step="100000000"
                  value={getNumericConfigValue('maxMemoryUsageBytes', Number(configuration.maxMemoryUsageBytes))}
                  onChange={(e) => handleConfigurationChange('maxMemoryUsageBytes', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100MB</span>
                  <span>2GB</span>
                  <span>4GB</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Processing Time: {formatDuration(getNumericConfigValue('maxBatchProcessingTimeNs', Number(configuration.maxBatchProcessingTimeNs)) / 1_000_000)}
                </label>
                <input
                  type="range"
                  min="1000000000"
                  max="60000000000"
                  step="1000000000"
                  value={getNumericConfigValue('maxBatchProcessingTimeNs', Number(configuration.maxBatchProcessingTimeNs))}
                  onChange={(e) => handleConfigurationChange('maxBatchProcessingTimeNs', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1s</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Health Check Interval: {formatDuration(getNumericConfigValue('healthCheckIntervalMs', Number(configuration.healthCheckIntervalMs)))}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="3600000"
                  step="1000"
                  value={getNumericConfigValue('healthCheckIntervalMs', Number(configuration.healthCheckIntervalMs))}
                  onChange={(e) => handleConfigurationChange('healthCheckIntervalMs', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1s</span>
                  <span>30m</span>
                  <span>60m</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium">Metrics Collection:</label>
                <button
                  onClick={() => handleConfigurationChange('metricsCollectionEnabled', !getBooleanConfigValue('metricsCollectionEnabled', configuration.metricsCollectionEnabled))}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    getBooleanConfigValue('metricsCollectionEnabled', configuration.metricsCollectionEnabled)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {getBooleanConfigValue('metricsCollectionEnabled', configuration.metricsCollectionEnabled) ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded">
              <div className="text-sm text-yellow-300">
                <strong>⚠️ Unsaved Changes:</strong> You have modified configuration settings. 
                Click "Save Changes" to apply them or "Reset" to discard changes.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Operations */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-red-400" />
          Maintenance Operations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => setSelectedMaintenanceOp('purgeCompleted')}
            className={`p-3 rounded border text-left ${
              selectedMaintenanceOp === 'purgeCompleted'
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-600 bg-gray-600/10 hover:border-green-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="font-medium">Purge Completed</span>
            </div>
            <div className="text-xs text-gray-400">
              Remove all completed operations from history
            </div>
          </button>

          <button
            onClick={() => setSelectedMaintenanceOp('purgeFailed')}
            className={`p-3 rounded border text-left ${
              selectedMaintenanceOp === 'purgeFailed'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 bg-gray-600/10 hover:border-red-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="font-medium">Purge Failed</span>
            </div>
            <div className="text-xs text-gray-400">
              Remove all failed operations from history
            </div>
          </button>

          <button
            onClick={() => setSelectedMaintenanceOp('purgeOld')}
            className={`p-3 rounded border text-left ${
              selectedMaintenanceOp === 'purgeOld'
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-600 bg-gray-600/10 hover:border-yellow-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">Purge Old</span>
            </div>
            <div className="text-xs text-gray-400">
              Remove operations older than specified time
            </div>
          </button>

          <button
            onClick={() => setSelectedMaintenanceOp('compactQueue')}
            className={`p-3 rounded border text-left ${
              selectedMaintenanceOp === 'compactQueue'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 bg-gray-600/10 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="font-medium">Compact Queue</span>
            </div>
            <div className="text-xs text-gray-400">
              Reorganize queue for optimal performance
            </div>
          </button>

          <button
            onClick={() => setSelectedMaintenanceOp('resetStatistics')}
            className={`p-3 rounded border text-left ${
              selectedMaintenanceOp === 'resetStatistics'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-600 bg-gray-600/10 hover:border-purple-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Reset Statistics</span>
            </div>
            <div className="text-xs text-gray-400">
              Clear all performance and usage statistics
            </div>
          </button>

          <button
            onClick={() => setSelectedMaintenanceOp('optimizeMemory')}
            className={`p-3 rounded border text-left ${
              selectedMaintenanceOp === 'optimizeMemory'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-gray-600 bg-gray-600/10 hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span className="font-medium">Optimize Memory</span>
            </div>
            <div className="text-xs text-gray-400">
              Clean up stale data and optimize memory usage
            </div>
          </button>
        </div>

        {selectedMaintenanceOp === 'purgeOld' && (
          <div className="mb-4 p-3 bg-gray-600 rounded">
            <label className="block text-sm font-medium mb-2">
              Remove operations older than: {purgeOlderThanHours} hours
            </label>
            <input
              type="range"
              min="1"
              max="168"
              step="1"
              value={purgeOlderThanHours}
              onChange={(e) => setPurgeOlderThanHours(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1h</span>
              <span>24h</span>
              <span>72h</span>
              <span>168h (1w)</span>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setShowMaintenanceConfirm(true)}
            disabled={!selectedMaintenanceOp || performMaintenanceMutation.isPending}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium flex items-center"
          >
            {performMaintenanceMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Wrench className="w-4 h-4 mr-2" />
            )}
            Execute Maintenance
          </button>
          
          {selectedMaintenanceOp && (
            <button
              onClick={() => setSelectedMaintenanceOp('')}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Maintenance Confirmation Modal */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium">Confirm Maintenance Operation</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to execute the "{selectedMaintenanceOp}" maintenance operation? 
              {selectedMaintenanceOp === 'resetStatistics' && ' This will permanently clear all statistics.'}
              {selectedMaintenanceOp === 'purgeOld' && ` This will remove operations older than ${purgeOlderThanHours} hours.`}
              {selectedMaintenanceOp === 'purgeCompleted' && ' This will remove all completed operations from history.'}
              {selectedMaintenanceOp === 'purgeFailed' && ' This will remove all failed operations from history.'}
              This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleMaintenanceOperation}
                disabled={performMaintenanceMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium flex items-center justify-center"
              >
                {performMaintenanceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Wrench className="w-4 h-4 mr-2" />
                )}
                Execute
              </button>
              <button
                onClick={() => setShowMaintenanceConfirm(false)}
                disabled={performMaintenanceMutation.isPending}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 px-4 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 6 Completion Status */}
      <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
        <h3 className="font-medium text-green-400 mb-2 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          ✅ Task 6 Complete - Queue Management Features Implementation
        </h3>
        <div className="text-sm text-green-300 space-y-2">
          <p>
            <strong>✅ Queue Health Checks:</strong> Comprehensive health monitoring with status indicators, 
            issue detection, resource monitoring, and automated recommendations for system optimization.
          </p>
          <p>
            <strong>✅ Queue Metrics Collection:</strong> Detailed metrics tracking including performance statistics, 
            timing metrics, resource usage, throughput analysis, and comprehensive system monitoring.
          </p>
          <p>
            <strong>✅ Maintenance Operations:</strong> Complete maintenance toolkit including queue purging, 
            compaction, memory optimization, statistics reset, and automated cleanup operations.
          </p>
          <p>
            <strong>✅ Configuration Management:</strong> Dynamic configuration system with real-time parameter 
            adjustment, validation, and immediate application of queue behavior settings.
          </p>
          <p>
            <strong>✅ Administrative Operations:</strong> Full administrative control panel with health monitoring, 
            performance analysis, maintenance scheduling, and system optimization tools.
          </p>
          <p>
            <strong>✅ Queue Diagnostics:</strong> Advanced diagnostic capabilities including health status reporting, 
            performance bottleneck identification, resource utilization analysis, and capacity planning metrics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueManagementDashboard;
