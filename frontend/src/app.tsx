import React from 'react';
import { useInternetIdentity } from 'ic-use-internet-identity';
import { useActor } from './hooks/useActors';
import { useIsCurrentUserAdmin } from './hooks/useQueries';
import LoginButton from './components/LoginButton';
import UserProfileSetup from './components/UserProfileSetup';
import CacheManager from './components/CacheManager';
import NodeStatus from './components/NodeStatus';
import CacheVisualization from './components/CacheVisualization';
import FailureSimulator from './components/FailureSimulator';
import TestSuite from './components/TestSuite';
import MetricsDashboard from './components/MetricsDashboard';
import PracticalConsiderations from './components/PracticalConsiderations';
import QueueTaskList from './components/QueueTaskList';
import QueueManager from './components/QueueManager';
import ProcessingStatisticsDashboard from './components/ProcessingStatisticsDashboard';
import QueueManagementDashboard from './components/QueueManagementDashboard';
import { Heart } from 'lucide-react';

function App() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const { data: isAdmin } = useIsCurrentUserAdmin();

  if (isFetching || !actor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Connecting to distributed cache...</div>
      </div>
    );
  }

  const isAuthenticated = !!identity;

  // For local development, show the UI even without authentication
  // In production, you might want to require authentication
  const showLoginOnly = false; // Set to true to require authentication
  
  if (!isAuthenticated && showLoginOnly) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Self-Healing Distributed Cache
          </h1>
          <p className="text-gray-400 mb-8">
            Please login to access the admin dashboard
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  // For local development, skip admin check or allow if not authenticated
  const requireAdminAuth = false; // Set to true to require admin authentication
  
  if (!isAdmin && requireAdminAuth && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-400 mb-8">
            Only administrators can access this system
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Self-Healing Distributed Cache
            </h1>
            <p className="text-gray-400">
              A prototype demonstrating automatic failure detection and recovery on the Internet Computer
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <UserProfileSetup />
            <LoginButton />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <NodeStatus />
            <FailureSimulator />
          </div>
          <div>
            <CacheManager />
          </div>
        </div>

        <div className="mb-8">
          <CacheVisualization />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <TestSuite />
          </div>
          <div>
            <MetricsDashboard />
          </div>
        </div>

        <div className="mb-8">
          <QueueManager />
        </div>

        <div className="mb-8">
          <QueueManagementDashboard />
        </div>

        <div className="mb-8">
          <ProcessingStatisticsDashboard />
        </div>

        <div className="mb-8">
          <QueueTaskList />
        </div>

        <div className="mb-8">
          <PracticalConsiderations />
        </div>

        <footer className="text-center text-gray-500 text-sm border-t border-gray-700 pt-4">
          © 2025. Built with <Heart className="inline w-4 h-4 text-red-500" /> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
