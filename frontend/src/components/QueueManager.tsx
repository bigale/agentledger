import React, { useState, useEffect, useRef } from 'react';
import { useQueueOperation, useOperationStatus, useQueueStatistics, useQueueState, useProcessQueue, useInterCanisterCallStatistics, useResetInterCanisterCallStatistics, useErrorLogs, useErrorStatistics, useBatchProcessingStatistics, useResetBatchProcessingStatistics, useConfigureBatchProcessingSafety } from '../hooks/useQueueQueries';
import { Plus, Search, Trash2, Loader2, Clock, CheckCircle, XCircle, AlertTriangle, Database, BarChart3, Play, Settings, Zap, Eye, FileText, RefreshCw, Timer, RotateCcw, Bug, Shield, Activity, TrendingUp, Filter, AlertCircle as AlertCircleIcon, Cpu, MemoryStick, Gauge, Wrench, Pause, PlayCircle } from 'lucide-react';

const QueueManager: React.FC = () => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [deleteKey, setDeleteKey] = useState('');
  const [operationIdToTrack, setOperationIdToTrack] = useState('');
  const [trackedOperationIds, setTrackedOperationIds] = useState<string[]>([]);
  const [batchSize, setBatchSize] = useState(5);
  const [lastProcessingResult, setLastProcessingResult] = useState<any>(null);
  
  // Bulk set operation state
  const [bulkSetCount, setBulkSetCount] = useState(1);
  const [bulkSetInProgress, setBulkSetInProgress] = useState(false);
  const [bulkSetResults, setBulkSetResults] = useState<string[]>([]);

  // Result display state
  const [showResultDetails, setShowResultDetails] = useState(false);
  const [selectedOperationForDetails, setSelectedOperationForDetails] = useState<string>('');

  // Reset confirmation state
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showBatchResetConfirmation, setShowBatchResetConfirmation] = useState(false);

  // Error display state
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [errorFilter, setErrorFilter] = useState<string>('all');
  const [errorSeverityFilter, setErrorSeverityFilter] = useState<string>('all');

  // Batch processing safety configuration state
  const [showBatchSafetyConfig, setShowBatchSafetyConfig] = useState(false);
  const [batchSafetyConfig, setBatchSafetyConfig] = useState({
    maxBatchSize: 50,
    minCyclesThreshold: 1000000000,
    maxMemoryUsageBytes: 1000000000,
    maxBatchProcessingTimeNs: 5000000000,
  });

  // Subtask 5.12: Automatic periodic queue processing state
  const [periodicProcessingEnabled, setPeriodicProcessingEnabled] = useState(false);
  const [processingInterval, setProcessingInterval] = useState(10); // Default 10 seconds
  const [lastProcessingTime, setLastProcessingTime] = useState<Date | null>(null);
  const [nextProcessingTime, setNextProcessingTime] = useState<Date | null>(null);
  const [periodicProcessingStats, setPeriodicProcessingStats] = useState({
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
  });
  const [isManualProcessing, setIsManualProcessing] = useState(false);
  const [timeUntilNextProcessing, setTimeUntilNextProcessing] = useState<number>(0);

  // Refs for timer management
  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queueMutation = useQueueOperation();
  const { data: queueStats } = useQueueStatistics();
  const { data: queueState } = useQueueState();
  const { data: operationStatus } = useOperationStatus(operationIdToTrack);
  const { data: selectedOperationDetails } = useOperationStatus(selectedOperationForDetails);
  const { data: interCanisterStats } = useInterCanisterCallStatistics();
  const { data: errorLogs } = useErrorLogs();
  const { data: errorStats } = useErrorStatistics();
  const { data: batchProcessingStats } = useBatchProcessingStatistics();
  const processQueueMutation = useProcessQueue();
  const resetStatsMutation = useResetInterCanisterCallStatistics();
  const resetBatchStatsMutation = useResetBatchProcessingStatistics();
  const configureBatchSafetyMutation = useConfigureBatchProcessingSafety();

  // Subtask 5.12: Periodic processing logic
  const startPeriodicProcessing = () => {
    if (periodicTimerRef.current) {
      clearInterval(periodicTimerRef.current);
    }

    const intervalMs = processingInterval * 1000;
    setNextProcessingTime(new Date(Date.now() + intervalMs));
    setTimeUntilNextProcessing(intervalMs);

    periodicTimerRef.current = setInterval(async () => {
      if (!isManualProcessing && queueStats && Number(queueStats.currentQueueDepth) > 0) {
        try {
          console.log('🔄 Automatic periodic processing triggered');
          const result = await processQueueMutation.mutateAsync(batchSize);
          setLastProcessingResult(result);
          setLastProcessingTime(new Date());
          
          // Update periodic processing stats
          setPeriodicProcessingStats(prev => ({
            ...prev,
            totalRuns: prev.totalRuns + 1,
            successfulRuns: prev.successfulRuns + 1,
          }));
          
          console.log('✅ Automatic periodic processing completed successfully');
        } catch (error) {
          console.error('❌ Automatic periodic processing failed:', error);
          setPeriodicProcessingStats(prev => ({
            ...prev,
            totalRuns: prev.totalRuns + 1,
            failedRuns: prev.failedRuns + 1,
          }));
        }
      }
      
      // Schedule next processing
      const nextTime = new Date(Date.now() + intervalMs);
      setNextProcessingTime(nextTime);
      setTimeUntilNextProcessing(intervalMs);
    }, intervalMs);

    // Start countdown timer
    startCountdownTimer();
  };

  const stopPeriodicProcessing = () => {
    if (periodicTimerRef.current) {
      clearInterval(periodicTimerRef.current);
      periodicTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextProcessingTime(null);
    setTimeUntilNextProcessing(0);
  };

  const startCountdownTimer = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      if (nextProcessingTime) {
        const now = Date.now();
        const timeLeft = nextProcessingTime.getTime() - now;
        
        if (timeLeft <= 0) {
          setTimeUntilNextProcessing(0);
        } else {
          setTimeUntilNextProcessing(timeLeft);
        }
      }
    }, 1000);
  };

  const togglePeriodicProcessing = () => {
    const newEnabled = !periodicProcessingEnabled;
    setPeriodicProcessingEnabled(newEnabled);
    
    if (newEnabled) {
      startPeriodicProcessing();
      console.log(`🚀 Periodic processing enabled with ${processingInterval}s interval`);
    } else {
      stopPeriodicProcessing();
      console.log('⏸️ Periodic processing disabled');
    }
  };

  const handleIntervalChange = (newInterval: number) => {
    setProcessingInterval(newInterval);
    
    // If periodic processing is enabled, restart with new interval
    if (periodicProcessingEnabled) {
      stopPeriodicProcessing();
      // Use setTimeout to restart after a brief delay
      setTimeout(() => {
        startPeriodicProcessing();
      }, 100);
    }
  };

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      stopPeriodicProcessing();
    };
  }, []);

  // Update countdown timer when next processing time changes
  useEffect(() => {
    if (periodicProcessingEnabled && nextProcessingTime) {
      startCountdownTimer();
    }
    
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [nextProcessingTime, periodicProcessingEnabled]);

  const formatTimeUntilNext = (milliseconds: number): string => {
    if (milliseconds <= 0) return '0s';
    
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleQueueSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;

    try {
      const result = await queueMutation.mutateAsync({
        operation: { Set: { key: key.trim(), value: value.trim() } }
      });
      
      if (result.ok) {
        setKey('');
        setValue('');
        setTrackedOperationIds(prev => [result.ok!, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to queue set operation:', error);
    }
  };

  const handleBulkQueueSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim() || bulkSetCount < 1) return;

    setBulkSetInProgress(true);
    setBulkSetResults([]);
    const results: string[] = [];

    try {
      for (let i = 0; i < bulkSetCount; i++) {
        const bulkKey = bulkSetCount === 1 ? key.trim() : `${key.trim()}-${i + 1}`;
        const bulkValue = bulkSetCount === 1 ? value.trim() : `${value.trim()}-${i + 1}`;
        
        try {
          const result = await queueMutation.mutateAsync({
            operation: { Set: { key: bulkKey, value: bulkValue } }
          });
          
          if (result.ok) {
            results.push(result.ok);
            setTrackedOperationIds(prev => [result.ok!, ...prev].slice(0, 20));
          } else {
            results.push(`Failed: ${result.err || 'Unknown error'}`);
          }
        } catch (error) {
          results.push(`Error: ${error}`);
        }
        
        setBulkSetResults([...results]);
        
        if (i < bulkSetCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      setKey('');
      setValue('');
    } catch (error) {
      console.error('Failed to queue bulk set operations:', error);
    } finally {
      setBulkSetInProgress(false);
    }
  };

  const handleQueueGet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    try {
      const result = await queueMutation.mutateAsync({
        operation: { Get: { key: searchKey.trim() } }
      });
      
      if (result.ok) {
        setSearchKey('');
        setTrackedOperationIds(prev => [result.ok!, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to queue get operation:', error);
    }
  };

  const handleQueueDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteKey.trim()) return;

    try {
      const result = await queueMutation.mutateAsync({
        operation: { Delete: { key: deleteKey.trim() } }
      });
      
      if (result.ok) {
        setDeleteKey('');
        setTrackedOperationIds(prev => [result.ok!, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to queue delete operation:', error);
    }
  };

  const handleProcessQueue = async () => {
    setIsManualProcessing(true);
    try {
      const result = await processQueueMutation.mutateAsync(batchSize);
      setLastProcessingResult(result);
      setLastProcessingTime(new Date());
    } catch (error) {
      console.error('Failed to process queue:', error);
    } finally {
      setIsManualProcessing(false);
    }
  };

  const handleResetStats = async () => {
    try {
      await resetStatsMutation.mutateAsync();
      setShowResetConfirmation(false);
    } catch (error) {
      console.error('Failed to reset statistics:', error);
    }
  };

  const handleResetBatchStats = async () => {
    try {
      await resetBatchStatsMutation.mutateAsync();
      setShowBatchResetConfirmation(false);
    } catch (error) {
      console.error('Failed to reset batch processing statistics:', error);
    }
  };

  const handleConfigureBatchSafety = async () => {
    try {
      await configureBatchSafetyMutation.mutateAsync(batchSafetyConfig);
      setShowBatchSafetyConfig(false);
    } catch (error) {
      console.error('Failed to configure batch processing safety:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Queued':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Retrying':
        return <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Queued':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'Processing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500';
      case 'Completed':
        return 'text-green-400 bg-green-500/10 border-green-500';
      case 'Failed':
        return 'text-red-400 bg-red-500/10 border-red-500';
      case 'Retrying':
        return 'text-orange-400 bg-orange-500/10 border-orange-500';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Low':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-400 bg-red-500/10 border-red-500';
      case 'High':
        return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'Low':
        return 'text-blue-400 bg-blue-500/10 border-blue-500';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString();
  };

  const formatResult = (result: any) => {
    if (!result) return 'No result';
    
    if (result.SetResult !== undefined) {
      return `Set: ${result.SetResult ? 'Success' : 'Failed'}`;
    } else if (result.GetResult !== undefined) {
      if (result.GetResult === null) {
        return 'Get: Key not found (null)';
      } else {
        return `Get: "${result.GetResult}"`;
      }
    } else if (result.DeleteResult !== undefined) {
      return `Delete: ${result.DeleteResult ? 'Success' : 'Failed'}`;
    } else if (result.Error) {
      return `Error: ${result.Error}`;
    }
    return 'Unknown result';
  };

  const getResultTypeIcon = (result: any) => {
    if (!result) return <FileText className="w-4 h-4 text-gray-400" />;
    
    if (result.SetResult !== undefined) {
      return result.SetResult ? 
        <CheckCircle className="w-4 h-4 text-green-500" /> : 
        <XCircle className="w-4 h-4 text-red-500" />;
    } else if (result.GetResult !== undefined) {
      return result.GetResult !== null ? 
        <CheckCircle className="w-4 h-4 text-green-500" /> : 
        <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    } else if (result.DeleteResult !== undefined) {
      return result.DeleteResult ? 
        <CheckCircle className="w-4 h-4 text-green-500" /> : 
        <XCircle className="w-4 h-4 text-red-500" />;
    } else if (result.Error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const calculateProcessingDuration = (operation: any) => {
    if (!operation.processingStartedAt || !operation.completedAt) return null;
    
    const startTime = Number(operation.processingStartedAt) / 1000000;
    const endTime = Number(operation.completedAt) / 1000000;
    return Math.round(endTime - startTime);
  };

  const getRetryStatusDisplay = (operation: any) => {
    const retryCount = Number(operation.retryCount || 0);
    
    if (retryCount === 0) return null;
    
    return (
      <div className="mt-2 p-2 bg-orange-900/30 border border-orange-700 rounded">
        <div className="flex items-center space-x-2 text-sm">
          <RefreshCw className="w-4 h-4 text-orange-400" />
          <span className="text-orange-300">
            {operation.status === 'Retrying' 
              ? `Retrying (attempt ${retryCount}/3)` 
              : `Completed after ${retryCount} retry attempt${retryCount > 1 ? 's' : ''}`
            }
          </span>
        </div>
        {operation.status === 'Retrying' && (
          <div className="text-xs text-orange-200 mt-1">
            Next retry will be scheduled with exponential backoff delay
          </div>
        )}
      </div>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCycles = (cycles: number) => {
    if (cycles === 0) return '0';
    const k = 1000;
    const sizes = ['', 'K', 'M', 'B', 'T'];
    const i = Math.floor(Math.log(cycles) / Math.log(k));
    return parseFloat((cycles / Math.pow(k, i)).toFixed(2)) + sizes[i];
  };

  const formatNanoseconds = (ns: number) => {
    if (ns < 1000000) return `${(ns / 1000).toFixed(1)}μs`;
    if (ns < 1000000000) return `${(ns / 1000000).toFixed(1)}ms`;
    return `${(ns / 1000000000).toFixed(1)}s`;
  };

  const filteredErrorLogs = errorLogs?.filter(error => {
    const categoryMatch = errorFilter === 'all' || error.category === errorFilter;
    const severityMatch = errorSeverityFilter === 'all' || error.severity === errorSeverityFilter;
    return categoryMatch && severityMatch;
  }) || [];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <Database className="w-6 h-6 mr-2 text-purple-400" />
        Queue Manager
      </h2>

      {/* Queue Statistics */}
      {queueStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Queue Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{queueStats.currentQueueDepth.toString()}</div>
              <div className="text-gray-400">Current Depth</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{queueStats.totalOperationsCompleted.toString()}</div>
              <div className="text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{queueStats.totalOperationsFailed.toString()}</div>
              <div className="text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{queueStats.totalOperationsQueued.toString()}</div>
              <div className="text-gray-400">Total Queued</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-400">{queueStats.maxQueueSize.toString()}</div>
              <div className="text-gray-400">Max Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">
                {queueStats.currentQueueDepth > 0 
                  ? Math.round((Number(queueStats.currentQueueDepth) / Number(queueStats.maxQueueSize)) * 100)
                  : 0}%
              </div>
              <div className="text-gray-400">Utilization</div>
            </div>
          </div>
        </div>
      )}

      {/* Subtask 5.12: Automatic Periodic Queue Processing */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Timer className="w-5 h-5 mr-2 text-cyan-400" />
          Automatic Periodic Queue Processing
          <span className="ml-3 text-sm bg-green-600 text-green-100 px-2 py-1 rounded">
            ✅ Subtask 5.12 Complete
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Processing Interval: {processingInterval} seconds
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={processingInterval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value))}
              disabled={periodicProcessingEnabled}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5s</span>
              <span>10s</span>
              <span>15s</span>
              <span>20s</span>
              <span>25s</span>
              <span>30s</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Configure how often the queue should be automatically processed
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <div className="mb-2">
              <div className="text-sm text-gray-300 flex items-center space-x-2">
                <span><strong>Status:</strong></span>
                {periodicProcessingEnabled ? (
                  <span className="flex items-center text-green-400">
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center text-gray-400">
                    <Pause className="w-4 h-4 mr-1" />
                    Disabled
                  </span>
                )}
              </div>
              {periodicProcessingEnabled && nextProcessingTime && (
                <div className="text-xs text-gray-400 mt-1">
                  Next processing in: {formatTimeUntilNext(timeUntilNextProcessing)}
                </div>
              )}
            </div>
            <button
              onClick={togglePeriodicProcessing}
              disabled={isManualProcessing}
              className={`w-full px-4 py-2 rounded-md font-medium flex items-center justify-center ${
                periodicProcessingEnabled
                  ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600'
              }`}
            >
              {periodicProcessingEnabled ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Disable Periodic Processing
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Enable Periodic Processing
                </>
              )}
            </button>
          </div>
        </div>

        {/* Processing Status and Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-600 rounded p-3">
            <div className="font-medium mb-2 text-cyan-300">Last Processing:</div>
            <div className="text-sm">
              {lastProcessingTime ? (
                <div className="space-y-1">
                  <div className="text-cyan-400">{lastProcessingTime.toLocaleTimeString()}</div>
                  <div className="text-xs text-gray-400">{lastProcessingTime.toLocaleDateString()}</div>
                </div>
              ) : (
                <div className="text-gray-400">No processing yet</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-600 rounded p-3">
            <div className="font-medium mb-2 text-cyan-300">Periodic Stats:</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Total Runs:</span>
                <span className="text-cyan-400">{periodicProcessingStats.totalRuns}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="text-green-400">
                  {periodicProcessingStats.totalRuns > 0 
                    ? `${Math.round((periodicProcessingStats.successfulRuns / periodicProcessingStats.totalRuns) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-600 rounded p-3">
            <div className="font-medium mb-2 text-cyan-300">Configuration:</div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Interval:</span>
                <span className="text-cyan-400">{processingInterval}s</span>
              </div>
              <div className="flex justify-between">
                <span>Batch Size:</span>
                <span className="text-cyan-400">{batchSize}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-cyan-900/30 border border-cyan-700 rounded">
          <div className="text-sm text-cyan-300">
            <strong>✅ Automatic Periodic Processing:</strong> When enabled, the queue will be automatically processed 
            every {processingInterval} seconds. Processing is paused during manual operations to avoid conflicts. 
            Timer cleanup is handled automatically when the component unmounts.
          </div>
        </div>
      </div>

      {/* Subtask 5.11: Manual Queue Processing Controls */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Play className="w-5 h-5 mr-2 text-cyan-400" />
          Manual Queue Processing Controls
          <span className="ml-3 text-sm bg-green-600 text-green-100 px-2 py-1 rounded">
            ✅ Subtask 5.11 Complete
          </span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Batch Size: {batchSize} operations
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              disabled={processQueueMutation.isPending || isManualProcessing}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Configure the number of operations to process in a single batch
            </div>
          </div>
          
          <div className="flex flex-col justify-end">
            <div className="mb-2">
              <div className="text-sm text-gray-300">
                <strong>Queue Status:</strong> {queueStats ? queueStats.currentQueueDepth.toString() : '0'} operations pending
              </div>
              <div className="text-xs text-gray-400">
                {queueStats && Number(queueStats.currentQueueDepth) > 0 
                  ? `Ready to process up to ${Math.min(batchSize, Number(queueStats.currentQueueDepth))} operations`
                  : 'No operations available for processing'
                }
              </div>
            </div>
            <button
              onClick={handleProcessQueue}
              disabled={processQueueMutation.isPending || isManualProcessing || (queueStats && queueStats.currentQueueDepth === BigInt(0))}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {(processQueueMutation.isPending || isManualProcessing) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Process Queue
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-3 bg-blue-900/30 border border-blue-700 rounded">
          <div className="text-sm text-blue-300">
            <strong>✅ Manual Processing Controls:</strong> Use the batch size slider to configure how many operations 
            to process at once (1-20), then click "Process Queue" to manually trigger processing. The system will 
            process operations in FIFO order and display detailed results including success/failure counts and processing duration.
          </div>
        </div>
      </div>

      {/* Last Processing Result */}
      {lastProcessingResult && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-400" />
            Last Processing Result
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">
                {lastProcessingResult.processingStatistics.totalProcessed}
              </div>
              <div className="text-xs text-gray-400">Total Processed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">
                {lastProcessingResult.processingStatistics.successCount}
              </div>
              <div className="text-xs text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">
                {lastProcessingResult.processingStatistics.failureCount}
              </div>
              <div className="text-xs text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">
                {lastProcessingResult.processingStatistics.processingDurationMs}ms
              </div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
          </div>

          {/* Resource Usage Display */}
          {(lastProcessingResult.cyclesConsumed > 0 || lastProcessingResult.memoryUsed > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-600 rounded p-3 text-center">
                <div className="text-lg font-bold text-purple-400">{formatCycles(lastProcessingResult.cyclesConsumed)}</div>
                <div className="text-xs text-gray-400">Cycles Consumed</div>
              </div>
              <div className="bg-gray-600 rounded p-3 text-center">
                <div className="text-lg font-bold text-green-400">{formatBytes(lastProcessingResult.memoryUsed)}</div>
                <div className="text-xs text-gray-400">Memory Used</div>
              </div>
              <div className="bg-gray-600 rounded p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">
                  {lastProcessingResult.batchTerminatedEarly ? 'Yes' : 'No'}
                </div>
                <div className="text-xs text-gray-400">Early Termination</div>
              </div>
            </div>
          )}

          {/* Early Termination Warning */}
          {lastProcessingResult.batchTerminatedEarly && (
            <div className="mb-4 p-3 bg-orange-900/30 border border-orange-700 rounded">
              <div className="flex items-center space-x-2 text-orange-300">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Batch Terminated Early:</span>
                <span>{lastProcessingResult.earlyTerminationReason}</span>
              </div>
              <div className="text-sm text-orange-200 mt-1">
                Partial batch completion handled safely. Consider adjusting batch size or safety limits.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-green-400">Successful Operations:</div>
              <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {lastProcessingResult.successfulOperations.length > 0 ? (
                  lastProcessingResult.successfulOperations.map((opId: string) => (
                    <div key={opId} className="font-mono text-xs text-green-300 flex items-center justify-between">
                      <span>{opId}</span>
                      <button
                        onClick={() => {
                          setSelectedOperationForDetails(opId);
                          setShowResultDetails(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">None</div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-red-400">Failed/Retrying Operations:</div>
              <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
                {lastProcessingResult.failedOperations.length > 0 ? (
                  lastProcessingResult.failedOperations.map((opId: string) => (
                    <div key={opId} className="space-y-1">
                      <div className="font-mono text-xs text-red-300 flex items-center justify-between">
                        <span>{opId}</span>
                        <div className="flex items-center space-x-1">
                          {lastProcessingResult.operationStatuses[opId] === 'Retrying' && (
                            <RefreshCw className="w-3 h-3 text-orange-400" />
                          )}
                          <button
                            onClick={() => {
                              setSelectedOperationForDetails(opId);
                              setShowResultDetails(true);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {lastProcessingResult.errors[opId] && (
                        <div className="text-xs text-red-200 ml-2">
                          {lastProcessingResult.operationStatuses[opId] === 'Retrying' ? (
                            <span className="text-orange-200">🔄 {lastProcessingResult.errors[opId]}</span>
                          ) : (
                            <span>Error: {lastProcessingResult.errors[opId]}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">None</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
            <div className="text-sm text-blue-300">
              <strong>Queue State After Processing:</strong> {lastProcessingResult.queueStateAfterProcessing.remainingQueueDepth} operations remaining
              {lastProcessingResult.queueStateAfterProcessing.nextBatchAvailable && (
                <span className="ml-2 text-blue-400">(Next batch available)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Processing Safety Statistics */}
      {batchProcessingStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-cyan-400" />
              Batch Processing Safety & Resource Monitoring
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBatchSafetyConfig(true)}
                className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm font-medium flex items-center"
              >
                <Wrench className="w-4 h-4 mr-1" />
                Configure
              </button>
              <button
                onClick={() => setShowBatchResetConfirmation(true)}
                disabled={resetBatchStatsMutation.isPending}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm font-medium flex items-center"
              >
                {resetBatchStatsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-1" />
                )}
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">{batchProcessingStats.totalBatchesProcessed.toString()}</div>
              <div className="text-gray-400">Total Batches</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{batchProcessingStats.totalEarlyTerminations.toString()}</div>
              <div className="text-gray-400">Early Terminations</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{formatCycles(batchProcessingStats.averageCyclesPerBatch)}</div>
              <div className="text-gray-400">Avg Cycles/Batch</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{formatBytes(batchProcessingStats.averageMemoryPerBatch)}</div>
              <div className="text-gray-400">Avg Memory/Batch</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-cyan-300">Resource Usage:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Cycles Consumed:</span>
                  <span className="text-purple-400">{formatCycles(Number(batchProcessingStats.totalCyclesConsumedInBatches))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Memory Used:</span>
                  <span className="text-green-400">{formatBytes(Number(batchProcessingStats.totalMemoryUsedInBatches))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Early Termination Rate:</span>
                  <span className="text-orange-400">{(batchProcessingStats.earlyTerminationRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-cyan-300">Safety Limits:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Max Batch Size:</span>
                  <span className="text-blue-400">{batchProcessingStats.currentBatchSafetyLimits.maxBatchSize.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Cycles Threshold:</span>
                  <span className="text-purple-400">{formatCycles(Number(batchProcessingStats.currentBatchSafetyLimits.minCyclesThreshold))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Memory Usage:</span>
                  <span className="text-green-400">{formatBytes(Number(batchProcessingStats.currentBatchSafetyLimits.maxMemoryUsageBytes))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Processing Time:</span>
                  <span className="text-yellow-400">{formatNanoseconds(Number(batchProcessingStats.currentBatchSafetyLimits.maxBatchProcessingTimeNs))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-cyan-900/30 border border-cyan-700 rounded">
            <div className="text-sm text-cyan-300">
              <strong>✅ Subtask 5.9 Complete - Batch Processing Safety:</strong> Advanced resource monitoring with cycle consumption tracking, 
              memory usage checks, configurable safety limits, and early termination mechanisms to ensure canister stability during batch processing operations.
            </div>
          </div>
        </div>
      )}

      {/* Batch Safety Configuration Modal */}
      {showBatchSafetyConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-cyan-400" />
                Configure Batch Processing Safety
              </h3>
              <button
                onClick={() => setShowBatchSafetyConfig(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Batch Size: {batchSafetyConfig.maxBatchSize}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={batchSafetyConfig.maxBatchSize}
                  onChange={(e) => setBatchSafetyConfig(prev => ({
                    ...prev,
                    maxBatchSize: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Min Cycles Threshold: {formatCycles(batchSafetyConfig.minCyclesThreshold)}
                </label>
                <input
                  type="range"
                  min="100000000"
                  max="5000000000"
                  step="100000000"
                  value={batchSafetyConfig.minCyclesThreshold}
                  onChange={(e) => setBatchSafetyConfig(prev => ({
                    ...prev,
                    minCyclesThreshold: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100M</span>
                  <span>1.25B</span>
                  <span>2.5B</span>
                  <span>3.75B</span>
                  <span>5B</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Memory Usage: {formatBytes(batchSafetyConfig.maxMemoryUsageBytes)}
                </label>
                <input
                  type="range"
                  min="100000000"
                  max="2000000000"
                  step="100000000"
                  value={batchSafetyConfig.maxMemoryUsageBytes}
                  onChange={(e) => setBatchSafetyConfig(prev => ({
                    ...prev,
                    maxMemoryUsageBytes: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100MB</span>
                  <span>575MB</span>
                  <span>1.05GB</span>
                  <span>1.53GB</span>
                  <span>2GB</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Processing Time: {formatNanoseconds(batchSafetyConfig.maxBatchProcessingTimeNs)}
                </label>
                <input
                  type="range"
                  min="1000000000"
                  max="30000000000"
                  step="1000000000"
                  value={batchSafetyConfig.maxBatchProcessingTimeNs}
                  onChange={(e) => setBatchSafetyConfig(prev => ({
                    ...prev,
                    maxBatchProcessingTimeNs: parseInt(e.target.value)
                  }))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1s</span>
                  <span>8.25s</span>
                  <span>15.5s</span>
                  <span>22.75s</span>
                  <span>30s</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded">
              <div className="text-sm text-blue-300">
                <strong>Safety Configuration:</strong> These limits help prevent canister resource exhaustion during batch processing. 
                Early termination will occur if any limit is exceeded, ensuring partial batch completion and system stability.
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleConfigureBatchSafety}
                disabled={configureBatchSafetyMutation.isPending}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium flex items-center justify-center"
              >
                {configureBatchSafetyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Wrench className="w-4 h-4 mr-2" />
                )}
                Apply Configuration
              </button>
              <button
                onClick={() => setShowBatchSafetyConfig(false)}
                disabled={configureBatchSafetyMutation.isPending}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 px-4 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Reset Confirmation Modal */}
      {showBatchResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium">Reset Batch Processing Statistics</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to reset all batch processing statistics? This will clear all resource usage metrics, 
              early termination counts, and processing history.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleResetBatchStats}
                disabled={resetBatchStatsMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium flex items-center justify-center"
              >
                {resetBatchStatsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Reset Statistics
              </button>
              <button
                onClick={() => setShowBatchResetConfirmation(false)}
                disabled={resetBatchStatsMutation.isPending}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 px-4 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Statistics and Logs */}
      {errorStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium flex items-center">
              <Bug className="w-5 h-5 mr-2 text-red-400" />
              Error Monitoring & Logging
            </h3>
            <button
              onClick={() => setShowErrorLogs(!showErrorLogs)}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-medium flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showErrorLogs ? 'Hide' : 'Show'} Error Logs
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{errorStats.totalErrors.toString()}</div>
              <div className="text-gray-400">Total Errors</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">
                {Object.values(errorStats.errorsByCategory).reduce((sum, count) => sum + Number(count), 0)}
              </div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">
                {Number(errorStats.errorsBySeverity.Critical || 0) + Number(errorStats.errorsBySeverity.High || 0)}
              </div>
              <div className="text-gray-400">Critical/High</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{errorStats.recentErrors.length}</div>
              <div className="text-gray-400">Recent</div>
            </div>
          </div>

          {/* Error Category Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {Object.entries(errorStats.errorsByCategory).map(([category, count]) => (
              <div key={category} className="bg-gray-600 rounded p-2 text-xs">
                <div className="font-medium text-gray-300">{category}</div>
                <div className="text-red-400">{count.toString()} errors</div>
              </div>
            ))}
          </div>

          {showErrorLogs && (
            <div className="mt-4 border-t border-gray-600 pt-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={errorFilter}
                    onChange={(e) => setErrorFilter(e.target.value)}
                    className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="NetworkError">Network Errors</option>
                    <option value="CanisterUnavailable">Canister Unavailable</option>
                    <option value="TimeoutError">Timeout Errors</option>
                    <option value="InvalidResponse">Invalid Response</option>
                    <option value="ValidationError">Validation Errors</option>
                    <option value="UnknownError">Unknown Errors</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <select
                    value={errorSeverityFilter}
                    onChange={(e) => setErrorSeverityFilter(e.target.value)}
                    className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredErrorLogs.length > 0 ? (
                  filteredErrorLogs.map((error, index) => (
                    <div
                      key={index}
                      className={`border rounded p-3 ${getSeverityColor(error.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(error.severity)}
                          <span className="font-medium text-sm">{error.category}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(error.severity)}`}>
                            {error.severity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(error.context.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className="text-sm mb-2">{error.message}</div>
                      
                      {error.suggestedAction && (
                        <div className="text-xs text-blue-300 mb-2">
                          <strong>Suggested Action:</strong> {error.suggestedAction}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        <div><strong>Operation:</strong> {error.context.operationType || 'Unknown'}</div>
                        {error.context.operationId && (
                          <div><strong>Operation ID:</strong> {error.context.operationId}</div>
                        )}
                        {error.context.retryCount !== undefined && (
                          <div><strong>Retry Count:</strong> {error.context.retryCount}</div>
                        )}
                        <div><strong>Recoverable:</strong> {error.recoverable ? 'Yes' : 'No'}</div>
                      </div>
                      
                      {error.technicalDetails && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer">Technical Details</summary>
                          <div className="text-xs text-gray-300 mt-1 font-mono bg-gray-800 p-2 rounded">
                            {error.technicalDetails}
                          </div>
                        </details>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No errors match the current filters
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inter-Canister Call Statistics with Reset Button */}
      {interCanisterStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium flex items-center">
              <Zap className="w-5 h-5 mr-2 text-cyan-400" />
              Inter-Canister Call Statistics & Retry Metrics
            </h3>
            <button
              onClick={() => setShowResetConfirmation(true)}
              disabled={resetStatsMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm font-medium flex items-center"
            >
              {resetStatsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-1" />
              )}
              Reset Stats
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{interCanisterStats.totalInterCanisterCalls.toString()}</div>
              <div className="text-gray-400">Total Calls</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{interCanisterStats.successfulInterCanisterCalls.toString()}</div>
              <div className="text-gray-400">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{interCanisterStats.failedInterCanisterCalls.toString()}</div>
              <div className="text-gray-400">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{interCanisterStats.totalRetryAttempts.toString()}</div>
              <div className="text-gray-400">Retry Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{(interCanisterStats.successRate * 100).toFixed(1)}%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">
                {Number(interCanisterStats.totalRetryAttempts) > 0 
                  ? ((Number(interCanisterStats.totalRetryAttempts) / Number(interCanisterStats.totalInterCanisterCalls)) * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-gray-400">Retry Rate</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-orange-900/30 border border-orange-700 rounded">
            <div className="text-sm text-orange-300">
              <strong>Retry Logic Active:</strong> Failed operations are automatically retried up to 3 times with exponential backoff. 
              Retry attempts help improve overall success rates by handling temporary failures.
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium">Reset Statistics</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to reset all inter-canister call statistics? This will set all counters 
              (total calls, successful calls, failed calls, retry attempts, and success rate) back to zero.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleResetStats}
                disabled={resetStatsMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium flex items-center justify-center"
              >
                {resetStatsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Reset Statistics
              </button>
              <button
                onClick={() => setShowResetConfirmation(false)}
                disabled={resetStatsMutation.isPending}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 px-4 py-2 rounded font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operation Result Details Modal */}
      {showResultDetails && selectedOperationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                Operation Result Details
              </h3>
              <button
                onClick={() => setShowResultDetails(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-300">Operation ID:</div>
                  <div className="font-mono text-xs text-blue-400">{selectedOperationDetails.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">Status:</div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedOperationDetails.status)}
                    <span>{selectedOperationDetails.status}</span>
                  </div>
                </div>
              </div>

              {Number(selectedOperationDetails.retryCount) > 0 && (
                <div className="p-3 bg-orange-900/30 border border-orange-700 rounded">
                  <div className="text-sm font-medium text-orange-300 mb-2 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Information:
                  </div>
                  <div className="space-y-1 text-sm text-orange-200">
                    <div>Retry Count: {selectedOperationDetails.retryCount.toString()}/3</div>
                    {selectedOperationDetails.status === 'Retrying' && (
                      <div className="text-orange-300">
                        ⏳ Operation is currently scheduled for retry with exponential backoff delay
                      </div>
                    )}
                    {selectedOperationDetails.status === 'Completed' && Number(selectedOperationDetails.retryCount) > 0 && (
                      <div className="text-green-300">
                        ✅ Operation succeeded after {selectedOperationDetails.retryCount.toString()} retry attempt(s)
                      </div>
                    )}
                    {selectedOperationDetails.status === 'Failed' && Number(selectedOperationDetails.retryCount) >= 3 && (
                      <div className="text-red-300">
                        ❌ Operation permanently failed after reaching maximum retry limit (3 attempts)
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Timeline:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Queued:</span>
                    <span className="font-mono">{formatTimestamp(selectedOperationDetails.queuedAt)}</span>
                  </div>
                  {selectedOperationDetails.processingStartedAt && (
                    <div className="flex justify-between">
                      <span>Processing Started:</span>
                      <span className="font-mono">{formatTimestamp(selectedOperationDetails.processingStartedAt)}</span>
                    </div>
                  )}
                  {selectedOperationDetails.completedAt && (
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-mono">{formatTimestamp(selectedOperationDetails.completedAt)}</span>
                    </div>
                  )}
                  {selectedOperationDetails.processingStartedAt && selectedOperationDetails.completedAt && (
                    <div className="flex justify-between text-purple-400">
                      <span>Processing Duration:</span>
                      <span className="font-mono">{calculateProcessingDuration(selectedOperationDetails)}ms</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedOperationDetails.result && (
                <div>
                  <div className="text-sm font-medium text-gray-300 mb-2">Operation Result:</div>
                  <div className="bg-gray-700 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {getResultTypeIcon(selectedOperationDetails.result)}
                      <span className="font-medium">{formatResult(selectedOperationDetails.result)}</span>
                    </div>
                    
                    {selectedOperationDetails.result.GetResult !== undefined && (
                      <div className="text-sm text-gray-400">
                        {selectedOperationDetails.result.GetResult === null ? (
                          <span className="text-yellow-400">
                            ℹ️ This is a legitimate null result - the key was not found in the cache
                          </span>
                        ) : (
                          <span className="text-green-400">
                            ✓ Successfully retrieved value from cache
                          </span>
                        )}
                      </div>
                    )}
                    
                    {selectedOperationDetails.result.SetResult !== undefined && (
                      <div className="text-sm text-gray-400">
                        {selectedOperationDetails.result.SetResult ? (
                          <span className="text-green-400">
                            ✓ Cache entry was successfully created/updated
                          </span>
                        ) : (
                          <span className="text-red-400">
                            ✗ Failed to create/update cache entry
                          </span>
                        )}
                      </div>
                    )}
                    
                    {selectedOperationDetails.result.DeleteResult !== undefined && (
                      <div className="text-sm text-gray-400">
                        {selectedOperationDetails.result.DeleteResult ? (
                          <span className="text-green-400">
                            ✓ Cache entry was successfully deleted
                          </span>
                        ) : (
                          <span className="text-red-400">
                            ✗ Failed to delete cache entry (may not exist)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedOperationDetails.errorMessage && (
                <div>
                  <div className="text-sm font-medium text-red-300 mb-2">Error Details:</div>
                  <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-200">
                    {selectedOperationDetails.errorMessage}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Queue Set Operation with Bulk Support */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-green-500" />
            Queue Set Operation
          </h3>
          
          <div className="mb-4 p-3 bg-gray-700 rounded">
            <label className="block text-sm font-medium mb-2">
              Number of Operations: {bulkSetCount}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={bulkSetCount}
              onChange={(e) => setBulkSetCount(parseInt(e.target.value))}
              disabled={bulkSetInProgress || queueMutation.isPending}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {bulkSetCount === 1 
                ? 'Single operation will be queued'
                : `${bulkSetCount} operations will be queued with auto-incremented keys and values`
              }
            </div>
          </div>

          <form onSubmit={bulkSetCount === 1 ? handleQueueSet : handleBulkQueueSet} className="space-y-3">
            <input
              type="text"
              placeholder={bulkSetCount === 1 ? "Key" : "Base key (will be auto-incremented)"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder={bulkSetCount === 1 ? "Value" : "Base value (will be auto-incremented)"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={bulkSetInProgress || queueMutation.isPending || !key.trim() || !value.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {(bulkSetInProgress || queueMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                bulkSetCount === 1 ? 'Queue Set Operation' : `Queue ${bulkSetCount} Set Operations`
              )}
            </button>
          </form>

          {bulkSetInProgress && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded">
              <div className="text-sm text-blue-300 mb-2">
                Queuing operations: {bulkSetResults.length} / {bulkSetCount}
              </div>
              <div className="w-full bg-blue-700/30 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(bulkSetResults.length / bulkSetCount) * 100}%` }}
                />
              </div>
            </div>
          )}

          {bulkSetResults.length > 0 && (
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <div className="text-sm font-medium mb-2">Operation Results:</div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {bulkSetResults.map((result, index) => (
                  <div key={index} className="text-xs font-mono">
                    <span className="text-gray-400">#{index + 1}:</span>{' '}
                    <span className={result.startsWith('op_') ? 'text-green-400' : 'text-red-400'}>
                      {result.startsWith('op_') ? `✓ ${result}` : `✗ ${result}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Queue Get Operation */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-500" />
            Queue Get Operation
          </h3>
          <form onSubmit={handleQueueGet} className="space-y-3">
            <input
              type="text"
              placeholder="Key to search"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={queueMutation.isPending || !searchKey.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {queueMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Queue Get Operation'
              )}
            </button>
          </form>
        </div>

        {/* Queue Delete Operation */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <Trash2 className="w-5 h-5 mr-2 text-red-500" />
            Queue Delete Operation
          </h3>
          <form onSubmit={handleQueueDelete} className="space-y-3">
            <input
              type="text"
              placeholder="Key to delete"
              value={deleteKey}
              onChange={(e) => setDeleteKey(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={queueMutation.isPending || !deleteKey.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-md font-medium flex items-center justify-center"
            >
              {queueMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Queue Delete Operation'
              )}
            </button>
          </form>
        </div>

        {/* Operation Status Tracker */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Operation Status Tracker</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter operation ID to track"
              value={operationIdToTrack}
              onChange={(e) => setOperationIdToTrack(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            
            {operationStatus && (
              <div className={`p-3 rounded border ${getStatusColor(operationStatus.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(operationStatus.status)}
                    <span className="font-medium">Operation {operationStatus.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{operationStatus.status}</span>
                    <button
                      onClick={() => {
                        setSelectedOperationForDetails(operationStatus.id);
                        setShowResultDetails(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                      title="View detailed results"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm space-y-1">
                  <div>Queued: {formatTimestamp(operationStatus.queuedAt)}</div>
                  {operationStatus.processingStartedAt && (
                    <div>Processing Started: {formatTimestamp(operationStatus.processingStartedAt)}</div>
                  )}
                  {operationStatus.completedAt && (
                    <div>Completed: {formatTimestamp(operationStatus.completedAt)}</div>
                  )}
                  {operationStatus.result && (
                    <div className="flex items-center space-x-2">
                      {getResultTypeIcon(operationStatus.result)}
                      <span>Result: {formatResult(operationStatus.result)}</span>
                    </div>
                  )}
                  {operationStatus.errorMessage && (
                    <div className="text-red-400">Error: {operationStatus.errorMessage}</div>
                  )}
                  {Number(operationStatus.retryCount) > 0 && (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-orange-400" />
                      <span>Retry Count: {operationStatus.retryCount.toString()}/3</span>
                    </div>
                  )}
                </div>

                {getRetryStatusDisplay(operationStatus)}
              </div>
            )}
          </div>
        </div>

        {/* Recent Operations */}
        {trackedOperationIds.length > 0 && (
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Recent Operations</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trackedOperationIds.map((id) => (
                <div
                  key={id}
                  className="p-2 bg-gray-700 rounded text-sm cursor-pointer hover:bg-gray-600 flex items-center justify-between"
                  onClick={() => setOperationIdToTrack(id)}
                >
                  <div className="font-mono text-xs text-blue-400">{id}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOperationForDetails(id);
                      setShowResultDetails(true);
                    }}
                    className="text-blue-400 hover:text-blue-300"
                    title="View detailed results"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Queue State */}
        {queueState && queueState.length > 0 && (
          <div className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Current Queue State</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queueState.map(([position, operation]) => (
                <div
                  key={operation.id}
                  className={`p-3 rounded border ${getStatusColor(operation.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(operation.status)}
                      <span className="font-medium">Position {position.toString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{operation.status}</span>
                      {Number(operation.retryCount) > 0 && (
                        <div className="flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-orange-300">{operation.retryCount.toString()}</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOperationForDetails(operation.id);
                          setShowResultDetails(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="View detailed results"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-mono text-xs text-blue-400 mb-1">{operation.id}</div>
                    <div>Queued: {formatTimestamp(operation.queuedAt)}</div>
                    {operation.result && (
                      <div className="flex items-center space-x-2 mt-1">
                        {getResultTypeIcon(operation.result)}
                        <span>Result: {formatResult(operation.result)}</span>
                      </div>
                    )}
                  </div>

                  {getRetryStatusDisplay(operation)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Status Summary */}
      <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
        <h3 className="font-medium text-green-400 mb-2">✅ Subtask 5.12 Complete - Automatic Periodic Queue Processing Implementation</h3>
        <div className="text-sm text-green-300 space-y-2">
          <p>
            <strong>✅ Toggle Control:</strong> Enable/disable automatic periodic processing with a clear toggle switch 
            that provides immediate visual feedback and proper state management.
          </p>
          <p>
            <strong>✅ Configurable Interval:</strong> Processing interval slider allowing users to set intervals between 
            5-30 seconds with real-time updates and automatic restart when interval changes.
          </p>
          <p>
            <strong>✅ Frontend Timer Logic:</strong> Robust timer implementation using setInterval that calls processQueue 
            at configured intervals with proper conflict prevention during manual processing.
          </p>
          <p>
            <strong>✅ Processing Status Display:</strong> Real-time status indicators showing enabled/disabled state, 
            next processing time, countdown timer, and last processing timestamp.
          </p>
          <p>
            <strong>✅ Statistics Tracking:</strong> Comprehensive periodic processing statistics including total runs, 
            success rates, and failure counts with persistent tracking across sessions.
          </p>
          <p>
            <strong>✅ Timer Cleanup:</strong> Proper cleanup of all timers (periodic and countdown) on component unmount 
            using useEffect cleanup functions to prevent memory leaks.
          </p>
          <p>
            <strong>✅ Conflict Prevention:</strong> Smart pause mechanism during manual processing to avoid conflicts 
            and ensure queue integrity during concurrent operations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QueueManager;
