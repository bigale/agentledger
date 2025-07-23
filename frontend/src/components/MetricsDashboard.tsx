import React, { useState, useEffect } from 'react';
import { useNodeStatuses } from '../hooks/useQueries';
import { BarChart3, TrendingUp, Activity, AlertTriangle, RefreshCw } from 'lucide-react';

interface MetricsData {
  totalFailures: number;
  totalRecoveries: number;
  failureHistory: Array<{ timestamp: number; nodeId: bigint }>;
  recoveryHistory: Array<{ timestamp: number; nodeId: bigint }>;
  currentHealthyNodes: number;
  currentFailedNodes: number;
  currentRecoveringNodes: number;
}

const MetricsDashboard: React.FC = () => {
  const { data: nodeStatuses } = useNodeStatuses();
  const [metrics, setMetrics] = useState<MetricsData>({
    totalFailures: 0,
    totalRecoveries: 0,
    failureHistory: [],
    recoveryHistory: [],
    currentHealthyNodes: 0,
    currentFailedNodes: 0,
    currentRecoveringNodes: 0,
  });

  const [previousStatuses, setPreviousStatuses] = useState<Map<bigint, string>>(new Map());

  useEffect(() => {
    if (!nodeStatuses) return;

    const currentStatuses = new Map<bigint, string>();
    let healthyCount = 0;
    let failedCount = 0;
    let recoveringCount = 0;

    // Count current status distribution
    nodeStatuses.forEach(([nodeId, status]) => {
      currentStatuses.set(nodeId, status);
      switch (status) {
        case 'Healthy':
          healthyCount++;
          break;
        case 'Failed':
          failedCount++;
          break;
        case 'Recovering':
          recoveringCount++;
          break;
      }
    });

    // Detect status changes and update metrics
    setMetrics(prev => {
      let newFailures = 0;
      let newRecoveries = 0;
      const newFailureHistory = [...prev.failureHistory];
      const newRecoveryHistory = [...prev.recoveryHistory];

      nodeStatuses.forEach(([nodeId, currentStatus]) => {
        const previousStatus = previousStatuses.get(nodeId);
        
        if (previousStatus && previousStatus !== currentStatus) {
          const timestamp = Date.now();
          
          // Detect failure (transition to Failed)
          if (currentStatus === 'Failed' && previousStatus !== 'Failed') {
            newFailures++;
            newFailureHistory.push({ timestamp, nodeId });
          }
          
          // Detect recovery (transition from Failed/Recovering to Healthy)
          if (currentStatus === 'Healthy' && (previousStatus === 'Failed' || previousStatus === 'Recovering')) {
            newRecoveries++;
            newRecoveryHistory.push({ timestamp, nodeId });
          }
        }
      });

      // Keep only last 50 events for performance
      const maxHistoryLength = 50;
      if (newFailureHistory.length > maxHistoryLength) {
        newFailureHistory.splice(0, newFailureHistory.length - maxHistoryLength);
      }
      if (newRecoveryHistory.length > maxHistoryLength) {
        newRecoveryHistory.splice(0, newRecoveryHistory.length - maxHistoryLength);
      }

      return {
        totalFailures: prev.totalFailures + newFailures,
        totalRecoveries: prev.totalRecoveries + newRecoveries,
        failureHistory: newFailureHistory,
        recoveryHistory: newRecoveryHistory,
        currentHealthyNodes: healthyCount,
        currentFailedNodes: failedCount,
        currentRecoveringNodes: recoveringCount,
      };
    });

    setPreviousStatuses(currentStatuses);
  }, [nodeStatuses, previousStatuses]);

  const getRecentEvents = () => {
    const allEvents = [
      ...metrics.failureHistory.map(event => ({ ...event, type: 'failure' as const })),
      ...metrics.recoveryHistory.map(event => ({ ...event, type: 'recovery' as const })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

    return allEvents;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getEventIcon = (type: 'failure' | 'recovery') => {
    return type === 'failure' 
      ? <AlertTriangle className="w-4 h-4 text-red-500" />
      : <RefreshCw className="w-4 h-4 text-green-500" />;
  };

  const recentEvents = getRecentEvents();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 mr-2" />
        Metrics Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400">
                {metrics.totalFailures}
              </div>
              <div className="text-sm text-red-300">Total Failures</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {metrics.totalRecoveries}
              </div>
              <div className="text-sm text-green-300">Total Recoveries</div>
            </div>
            <RefreshCw className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Current Status Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Current Node Status
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-400">
              {metrics.currentHealthyNodes}
            </div>
            <div className="text-xs text-green-300">Healthy</div>
          </div>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-400">
              {metrics.currentFailedNodes}
            </div>
            <div className="text-xs text-red-300">Failed</div>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-yellow-400">
              {metrics.currentRecoveringNodes}
            </div>
            <div className="text-xs text-yellow-300">Recovering</div>
          </div>
        </div>
      </div>

      {/* Simple Chart Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Event Trends
        </h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-end space-x-2 h-24">
            {/* Simple bar chart showing recent activity */}
            {Array.from({ length: 10 }, (_, i) => {
              const recentFailures = metrics.failureHistory.filter(
                event => event.timestamp > Date.now() - (i + 1) * 60000
              ).length;
              const recentRecoveries = metrics.recoveryHistory.filter(
                event => event.timestamp > Date.now() - (i + 1) * 60000
              ).length;
              
              const maxHeight = Math.max(recentFailures + recentRecoveries, 1);
              const failureHeight = (recentFailures / maxHeight) * 80;
              const recoveryHeight = (recentRecoveries / maxHeight) * 80;
              
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col justify-end h-20 w-full">
                    {recoveryHeight > 0 && (
                      <div 
                        className="bg-green-500 w-full rounded-t"
                        style={{ height: `${recoveryHeight}px` }}
                      />
                    )}
                    {failureHeight > 0 && (
                      <div 
                        className="bg-red-500 w-full"
                        style={{ height: `${failureHeight}px` }}
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {10 - i}m
                  </div>
                </div>
              );
            }).reverse()}
          </div>
          <div className="flex justify-center space-x-4 mt-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-1" />
              <span>Failures</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-1" />
              <span>Recoveries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h3 className="text-lg font-medium mb-3">Recent Events</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentEvents.length > 0 ? (
            recentEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm"
              >
                <div className="flex items-center space-x-2">
                  {getEventIcon(event.type)}
                  <span>
                    Node {event.nodeId.toString()} {event.type}
                  </span>
                </div>
                <span className="text-gray-400">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">
              No events recorded yet. Simulate failures and recoveries to see metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
