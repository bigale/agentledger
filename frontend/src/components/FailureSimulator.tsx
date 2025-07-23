import React from 'react';
import { useNodeStatuses, useSimulateFailure, useSimulateRecovery } from '../hooks/useQueries';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

const FailureSimulator: React.FC = () => {
  const { data: nodeStatuses, isLoading } = useNodeStatuses();
  const failureMutation = useSimulateFailure();
  const recoveryMutation = useSimulateRecovery();

  const handleSimulateFailure = async (nodeId: bigint) => {
    try {
      await failureMutation.mutateAsync(nodeId);
    } catch (error) {
      console.error('Failed to simulate failure:', error);
    }
  };

  const handleSimulateRecovery = async (nodeId: bigint) => {
    try {
      await recoveryMutation.mutateAsync(nodeId);
    } catch (error) {
      console.error('Failed to simulate recovery:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Failure Simulator</h2>
        <div className="text-gray-400">Loading node information...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <AlertTriangle className="w-6 h-6 mr-2 text-yellow-500" />
        Failure Simulator
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Simulate node failures and recoveries to observe the self-healing behavior.
      </p>
      
      <div className="space-y-3">
        {nodeStatuses?.map(([nodeId, status]) => (
          <div
            key={nodeId.toString()}
            className="flex items-center justify-between p-3 border border-gray-700 rounded-lg"
          >
            <div>
              <div className="font-medium">Node {nodeId.toString()}</div>
              <div className="text-sm text-gray-400">Status: {status}</div>
            </div>
            
            <div className="flex space-x-2">
              {status === 'Healthy' && (
                <button
                  onClick={() => handleSimulateFailure(nodeId)}
                  disabled={failureMutation.isPending}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm font-medium flex items-center"
                >
                  {failureMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 mr-1" />
                  )}
                  Fail
                </button>
              )}
              
              {status === 'Failed' && (
                <button
                  onClick={() => handleSimulateRecovery(nodeId)}
                  disabled={recoveryMutation.isPending}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm font-medium flex items-center"
                >
                  {recoveryMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1" />
                  )}
                  Recover
                </button>
              )}
              
              {status === 'Recovering' && (
                <div className="px-3 py-1 bg-yellow-600 rounded text-sm font-medium flex items-center">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  Recovering...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
        <div className="text-sm text-blue-300">
          <strong>Self-Healing Demo:</strong> When you simulate a failure, watch how the system 
          automatically reassigns cache entries to healthy nodes. Recovery will restore the node 
          and rebalance the data distribution.
        </div>
      </div>
    </div>
  );
};

export default FailureSimulator;
