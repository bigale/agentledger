import React from 'react';
import { useCacheState, useNodeStatuses } from '../hooks/useQueries';
import { Database, Copy } from 'lucide-react';

const CacheVisualization: React.FC = () => {
  const { data: cacheState, isLoading: cacheLoading } = useCacheState();
  const { data: nodeStatuses, isLoading: statusLoading } = useNodeStatuses();

  if (cacheLoading || statusLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Cache Visualization</h2>
        <div className="text-gray-400">Loading cache data...</div>
      </div>
    );
  }

  const getNodeStatus = (nodeId: bigint) => {
    return nodeStatuses?.find(([id]) => id === nodeId)?.[1] || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-green-500 border-green-500';
      case 'Failed':
        return 'text-red-500 border-red-500';
      case 'Recovering':
        return 'text-yellow-500 border-yellow-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Database className="w-6 h-6 mr-2" />
        Cache Visualization
      </h2>
      
      {!cacheState || cacheState.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No cache entries found. Add some entries to see the distribution.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cacheState.map(([key, entry]) => (
            <div
              key={key}
              className="border border-gray-700 rounded-lg p-4 bg-gray-750"
            >
              <div className="mb-3">
                <div className="font-mono text-sm text-blue-400 mb-1">Key:</div>
                <div className="font-mono text-sm break-all">{key}</div>
              </div>
              
              <div className="mb-3">
                <div className="font-mono text-sm text-blue-400 mb-1">Value:</div>
                <div className="font-mono text-sm break-all">{entry.value}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Primary:</span>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(getNodeStatus(entry.primaryNode))}`}>
                    Node {entry.primaryNode.toString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center">
                    <Copy className="w-3 h-3 mr-1" />
                    Replica:
                  </span>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(getNodeStatus(entry.replicaNode))}`}>
                    Node {entry.replicaNode.toString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CacheVisualization;
