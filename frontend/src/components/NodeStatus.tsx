import React from 'react';
import { useNodeStatuses, useNodeEntries } from '../hooks/useQueries';
import { Server, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const NodeStatus: React.FC = () => {
  const { data: nodeStatuses, isLoading: statusLoading } = useNodeStatuses();
  const { data: nodeEntries, isLoading: entriesLoading } = useNodeEntries();

  if (statusLoading || entriesLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Node Status</h2>
        <div className="text-gray-400">Loading node information...</div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'Recovering':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'border-green-500 bg-green-500/10';
      case 'Failed':
        return 'border-red-500 bg-red-500/10';
      case 'Recovering':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getEntryCount = (nodeId: bigint) => {
    const entries = nodeEntries?.find(([id]) => id === nodeId)?.[1];
    return entries?.length || 0;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Server className="w-6 h-6 mr-2" />
        Node Status
      </h2>
      <div className="space-y-3">
        {nodeStatuses?.map(([nodeId, status]) => (
          <div
            key={nodeId.toString()}
            className={`border rounded-lg p-4 ${getStatusColor(status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status)}
                <div>
                  <div className="font-medium">Node {nodeId.toString()}</div>
                  <div className="text-sm text-gray-400">
                    {getEntryCount(nodeId)} cache entries
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium">
                {status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeStatus;
