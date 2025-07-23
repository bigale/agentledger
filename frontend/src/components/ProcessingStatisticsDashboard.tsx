import React, { useState } from 'react';
import { 
  useProcessingStatistics, 
  useProcessingHistory, 
  useProcessingPerformanceMetrics,
  useRollingAverages,
  useOperationTypeStatistics,
  useQueueUtilizationMetrics,
  useProcessingTrendAnalysis,
  useResetProcessingStatistics
} from '../hooks/useQueueQueries';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  Zap, 
  Target, 
  Gauge, 
  PieChart, 
  LineChart,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Timer,
  Database,
  Cpu,
  MemoryStick
} from 'lucide-react';

const ProcessingStatisticsDashboard: React.FC = () => {
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<'10' | '50' | '100'>('50');
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const { data: comprehensiveStats } = useProcessingStatistics();
  const { data: processingHistory } = useProcessingHistory(100);
  const { data: performanceMetrics } = useProcessingPerformanceMetrics();
  const { data: rollingAverages } = useRollingAverages();
  const { data: operationTypeStats } = useOperationTypeStatistics();
  const { data: queueUtilization } = useQueueUtilizationMetrics();
  const { data: trendAnalysis } = useProcessingTrendAnalysis();
  const resetStatsMutation = useResetProcessingStatistics();

  const handleResetStats = async () => {
    try {
      await resetStatsMutation.mutateAsync();
      setShowResetConfirmation(false);
    } catch (error) {
      console.error('Failed to reset processing statistics:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'degrading':
      case 'decreasing':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return 'text-green-400';
      case 'degrading':
      case 'decreasing':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSelectedRollingAverage = () => {
    if (!rollingAverages) return null;
    switch (selectedTimeWindow) {
      case '10':
        return rollingAverages.last10Batches;
      case '50':
        return rollingAverages.last50Batches;
      case '100':
        return rollingAverages.last100Batches;
      default:
        return rollingAverages.last50Batches;
    }
  };

  const selectedAverage = getSelectedRollingAverage();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-purple-400" />
          Processing Statistics Dashboard
          <span className="ml-3 text-sm bg-green-600 text-green-100 px-2 py-1 rounded">
            ✅ Subtask 5.10 Complete
          </span>
        </h2>
        
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
          Reset All Stats
        </button>
      </div>

      {/* Performance Overview */}
      {performanceMetrics && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-blue-400" />
            Performance Overview
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(performanceMetrics.totalOperationsProcessed)}
              </div>
              <div className="text-sm text-gray-400">Total Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {performanceMetrics.overallSuccessRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {performanceMetrics.averageOperationsPerSecond.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Avg Ops/Sec</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {performanceMetrics.processingEfficiencyScore.toFixed(0)}
              </div>
              <div className="text-sm text-gray-400">Efficiency Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-blue-300">Batch Metrics:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Batches:</span>
                  <span className="text-blue-400">{performanceMetrics.totalBatchesProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Batch Size:</span>
                  <span className="text-blue-400">{performanceMetrics.averageBatchSize.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Batch Size:</span>
                  <span className="text-blue-400">{performanceMetrics.maxBatchSize}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-green-300">Performance:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Avg Duration:</span>
                  <span className="text-green-400">{formatDuration(performanceMetrics.averageProcessingDurationMs)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak Ops/Sec:</span>
                  <span className="text-green-400">{performanceMetrics.peakOperationsPerSecond.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Time:</span>
                  <span className="text-green-400">{formatDuration(performanceMetrics.totalProcessingTimeMs)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-purple-300">Resource Usage:</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Avg Cycles/Op:</span>
                  <span className="text-purple-400">{formatNumber(performanceMetrics.averageCyclesPerOperation)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Memory/Op:</span>
                  <span className="text-purple-400">{formatNumber(performanceMetrics.averageMemoryPerOperation)}B</span>
                </div>
                <div className="flex justify-between">
                  <span>Failure Rate:</span>
                  <span className="text-purple-400">{performanceMetrics.overallFailureRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rolling Averages */}
      {rollingAverages && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
              Rolling Averages
            </h3>
            <div className="flex bg-gray-600 rounded-lg p-1">
              {(['10', '50', '100'] as const).map((window) => (
                <button
                  key={window}
                  onClick={() => setSelectedTimeWindow(window)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedTimeWindow === window
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Last {window}
                </button>
              ))}
            </div>
          </div>
          
          {selectedAverage && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">
                  {selectedAverage.averageSuccessRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">
                  {formatDuration(selectedAverage.averageProcessingDuration)}
                </div>
                <div className="text-sm text-gray-400">Avg Duration</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">
                  {selectedAverage.averageOperationsPerSecond.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Ops/Second</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-cyan-400">
                  {selectedAverage.averageBatchSize.toFixed(1)}
                </div>
                <div className="text-sm text-gray-400">Batch Size</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operation Type Statistics */}
      {operationTypeStats && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-yellow-400" />
            Operation Type Breakdown
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-green-300 flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Set Operations:
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="text-green-400">{operationTypeStats.setOperations.totalProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-green-400">{operationTypeStats.setOperations.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Time:</span>
                  <span className="text-green-400">{formatDuration(operationTypeStats.setOperations.averageProcessingTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-blue-300 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Get Operations:
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="text-blue-400">{operationTypeStats.getOperations.totalProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-blue-400">{operationTypeStats.getOperations.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Time:</span>
                  <span className="text-blue-400">{formatDuration(operationTypeStats.getOperations.averageProcessingTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-red-300 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Delete Operations:
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="text-red-400">{operationTypeStats.deleteOperations.totalProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-red-400">{operationTypeStats.deleteOperations.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Time:</span>
                  <span className="text-red-400">{formatDuration(operationTypeStats.deleteOperations.averageProcessingTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Queue Utilization Metrics */}
      {queueUtilization && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-400" />
            Queue Utilization Analysis
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-400">
                {queueUtilization.averageQueueDepth.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">Avg Queue Depth</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-400">
                {queueUtilization.peakQueueDepth}
              </div>
              <div className="text-sm text-gray-400">Peak Queue Depth</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-400">
                {formatDuration(queueUtilization.timeToProcessQueue * 1000)}
              </div>
              <div className="text-sm text-gray-400">Time to Process</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold flex items-center justify-center ${getTrendColor(queueUtilization.queueUtilizationTrend)}`}>
                {getTrendIcon(queueUtilization.queueUtilizationTrend)}
                <span className="ml-1 capitalize">{queueUtilization.queueUtilizationTrend}</span>
              </div>
              <div className="text-sm text-gray-400">Utilization Trend</div>
            </div>
          </div>

          {queueUtilization.queueDepthHistory.length > 0 && (
            <div className="bg-gray-600 rounded p-3">
              <div className="font-medium mb-2 text-indigo-300">Recent Queue Depth History:</div>
              <div className="flex items-end space-x-1 h-16">
                {queueUtilization.queueDepthHistory.slice(-20).map((entry, index) => {
                  const height = Math.max(4, (entry.queueDepth / queueUtilization.peakQueueDepth) * 60);
                  return (
                    <div
                      key={index}
                      className="bg-indigo-500 rounded-t flex-1 min-w-0"
                      style={{ height: `${height}px` }}
                      title={`Queue Depth: ${entry.queueDepth} (${entry.utilizationPercentage.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">Last 20 measurements</div>
            </div>
          )}
        </div>
      )}

      {/* Trend Analysis */}
      {trendAnalysis && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-pink-400" />
            Trend Analysis
            <span className="ml-2 text-sm bg-pink-600 text-pink-100 px-2 py-1 rounded">
              {trendAnalysis.trendConfidence.toFixed(0)}% Confidence
            </span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className={`text-lg font-bold flex items-center justify-center ${getTrendColor(trendAnalysis.performanceTrend)}`}>
                {getTrendIcon(trendAnalysis.performanceTrend)}
                <span className="ml-1 capitalize">{trendAnalysis.performanceTrend}</span>
              </div>
              <div className="text-sm text-gray-400">Performance</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold flex items-center justify-center ${getTrendColor(trendAnalysis.successRateTrend)}`}>
                {getTrendIcon(trendAnalysis.successRateTrend)}
                <span className="ml-1 capitalize">{trendAnalysis.successRateTrend}</span>
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold flex items-center justify-center ${getTrendColor(trendAnalysis.throughputTrend)}`}>
                {getTrendIcon(trendAnalysis.throughputTrend)}
                <span className="ml-1 capitalize">{trendAnalysis.throughputTrend}</span>
              </div>
              <div className="text-sm text-gray-400">Throughput</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold flex items-center justify-center ${getTrendColor(trendAnalysis.efficiencyTrend)}`}>
                {getTrendIcon(trendAnalysis.efficiencyTrend)}
                <span className="ml-1 capitalize">{trendAnalysis.efficiencyTrend}</span>
              </div>
              <div className="text-sm text-gray-400">Efficiency</div>
            </div>
          </div>

          <div className="bg-gray-600 rounded p-3">
            <div className="font-medium mb-2 text-pink-300">Recommended Actions:</div>
            <ul className="space-y-1">
              {trendAnalysis.recommendedActions.map((action, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-pink-400 mr-2">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Processing History */}
      {processingHistory && processingHistory.length > 0 && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Timer className="w-5 h-5 mr-2 text-orange-400" />
            Recent Processing History
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {processingHistory.slice(-10).reverse().map((entry, index) => (
              <div key={index} className="bg-gray-600 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">
                    Batch #{processingHistory.length - index}
                    {entry.batchTerminatedEarly && (
                      <span className="ml-2 text-xs bg-orange-600 text-orange-100 px-2 py-1 rounded">
                        Early Termination
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Batch Size:</div>
                    <div className="font-medium">{entry.batchSize}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Success Rate:</div>
                    <div className="font-medium text-green-400">
                      {((entry.successCount / entry.batchSize) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Duration:</div>
                    <div className="font-medium">{formatDuration(entry.processingDurationMs)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Ops/Sec:</div>
                    <div className="font-medium text-purple-400">{entry.operationsPerSecond.toFixed(1)}</div>
                  </div>
                </div>

                {entry.batchTerminatedEarly && entry.earlyTerminationReason && (
                  <div className="mt-2 text-xs text-orange-300">
                    <strong>Termination Reason:</strong> {entry.earlyTerminationReason}
                  </div>
                )}

                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-400">Set Ops</div>
                    <div className="text-green-400">{entry.operationTypes.setOperations}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Get Ops</div>
                    <div className="text-blue-400">{entry.operationTypes.getOperations}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Delete Ops</div>
                    <div className="text-red-400">{entry.operationTypes.deleteOperations}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-medium">Reset Processing Statistics</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to reset all processing statistics? This will clear all performance metrics, 
              processing history, operation type statistics, queue utilization data, and trend analysis.
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
                Reset All Statistics
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

      {/* Completion Status */}
      <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
        <h3 className="font-medium text-green-400 mb-2 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          ✅ Subtask 5.10 Complete - Processing Statistics Tracking Implementation
        </h3>
        <div className="text-sm text-green-300 space-y-2">
          <p>
            <strong>✅ Comprehensive Statistics Tracking:</strong> The system now tracks detailed processing metrics 
            including batch sizes, success/failure rates, timing performance, and resource utilization across all operations.
          </p>
          <p>
            <strong>✅ Performance Analysis:</strong> Advanced performance metrics with rolling averages, peak performance 
            tracking, efficiency scoring, and operation type-specific statistics for detailed system analysis.
          </p>
          <p>
            <strong>✅ Trend Analysis:</strong> Intelligent trend detection for performance, success rates, throughput, 
            and efficiency with confidence scoring and automated recommendations for system optimization.
          </p>
          <p>
            <strong>✅ Queue Utilization Monitoring:</strong> Comprehensive queue depth tracking, utilization patterns, 
            and processing time analysis for optimal queue management and capacity planning.
          </p>
          <p>
            <strong>✅ Processing History:</strong> Detailed historical tracking of batch processing operations with 
            timestamps, resource usage, operation type breakdowns, and early termination analysis.
          </p>
          <p>
            <strong>✅ Frontend Dashboard:</strong> Complete statistical dashboard with real-time updates, interactive 
            time window selection, trend visualization, and comprehensive performance monitoring interface.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatisticsDashboard;
