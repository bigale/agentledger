import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Clock, Database, DollarSign, Globe, Shield, Zap } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const PracticalConsiderations: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections: Section[] = [
    {
      id: 'comparison',
      title: 'Comparison to Traditional Solutions',
      icon: <Database className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-3">Aspect</th>
                  <th className="text-left py-2 px-3">Internet Computer Cache</th>
                  <th className="text-left py-2 px-3">Memcached/Redis</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-medium">Persistence</td>
                  <td className="py-2 px-3">Built-in blockchain persistence</td>
                  <td className="py-2 px-3">In-memory, optional disk persistence</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-medium">Replication</td>
                  <td className="py-2 px-3">Automatic consensus-based replication</td>
                  <td className="py-2 px-3">Manual clustering configuration</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-medium">Consistency</td>
                  <td className="py-2 px-3">Strong consistency via consensus</td>
                  <td className="py-2 px-3">Eventually consistent in clusters</td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="py-2 px-3 font-medium">Infrastructure</td>
                  <td className="py-2 px-3">Serverless, managed by IC</td>
                  <td className="py-2 px-3">Requires server management</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Latency</td>
                  <td className="py-2 px-3">Higher due to consensus (~100-500ms)</td>
                  <td className="py-2 px-3">Very low (~1-10ms)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>Key Insight:</strong> IC-based caching trades raw performance for built-in reliability, 
              persistence, and simplified operations. Best suited for applications where data integrity 
              and operational simplicity outweigh microsecond latency requirements.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'latency',
      title: 'Blockchain Latency Impact',
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-yellow-400">Consensus Overhead</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Query calls: ~100-200ms</li>
                <li>• Update calls: ~2-4 seconds</li>
                <li>• Network congestion impact</li>
                <li>• Subnet load variations</li>
              </ul>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-green-400">Mitigation Strategies</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Use query calls for reads</li>
                <li>• Batch write operations</li>
                <li>• Client-side caching layers</li>
                <li>• Async operation patterns</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Performance Consideration:</strong> While IC consensus adds latency, it provides 
              guarantees that traditional caches cannot: tamper-proof data, automatic replication, 
              and zero-downtime persistence. Consider this trade-off carefully for your use case.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'scalability',
      title: 'Scalability Through Node Expansion',
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">6 Nodes</div>
              <div className="text-xs text-gray-400 mb-2">Current Setup</div>
              <div className="text-sm text-gray-300">
                <div>Fault Tolerance: 2-3 nodes</div>
                <div>Load Distribution: 17%</div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">12 Nodes</div>
              <div className="text-xs text-gray-400 mb-2">Recommended</div>
              <div className="text-sm text-gray-300">
                <div>Fault Tolerance: 5-6 nodes</div>
                <div>Load Distribution: 8%</div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">24+ Nodes</div>
              <div className="text-xs text-gray-400 mb-2">Enterprise</div>
              <div className="text-sm text-gray-300">
                <div>Fault Tolerance: 10+ nodes</div>
                <div>Load Distribution: &lt;5%</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-blue-400">Scaling Benefits:</h4>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• <strong>Increased Throughput:</strong> More nodes can handle more concurrent operations</li>
              <li>• <strong>Better Fault Tolerance:</strong> System survives more simultaneous failures</li>
              <li>• <strong>Load Distribution:</strong> Reduced load per node improves response times</li>
              <li>• <strong>Geographic Distribution:</strong> Nodes can be spread across IC subnets</li>
            </ul>
            <h4 className="font-medium text-red-400">Diminishing Returns:</h4>
            <ul className="text-sm text-gray-300 space-y-1 ml-4">
              <li>• <strong>Coordination Overhead:</strong> More nodes require more consensus communication</li>
              <li>• <strong>Memory Usage:</strong> Each node maintains metadata about all others</li>
              <li>• <strong>Complexity:</strong> Failure scenarios become more complex to handle</li>
            </ul>
          </div>
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              <strong>Current Configuration:</strong> With 6 nodes, the system can tolerate up to 4 simultaneous 
              node failures while maintaining operation. This provides excellent fault tolerance for most 
              enterprise applications while keeping coordination overhead manageable.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'use-cases',
      title: 'Use Case Analysis',
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Credit Union Banking */}
            <div className="border border-green-600 rounded-lg p-4 bg-green-900/20">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-green-400 mr-2" />
                <h4 className="font-medium text-green-400">Credit Union Banking Systems</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-green-300">Suitability: Excellent</strong>
                  <ul className="text-gray-300 mt-1 space-y-1">
                    <li>• Transaction volume: 1K-100K/day ✓</li>
                    <li>• Latency tolerance: 100-500ms ✓</li>
                    <li>• Regulatory compliance needs ✓</li>
                    <li>• Data integrity critical ✓</li>
                    <li>• Operational simplicity valued ✓</li>
                  </ul>
                </div>
                <div className="bg-green-800/30 rounded p-2">
                  <strong>Key Benefits:</strong> Immutable audit trails, automatic compliance logging, 
                  zero-downtime persistence, reduced operational overhead.
                </div>
              </div>
            </div>

            {/* Visa-scale Networks */}
            <div className="border border-red-600 rounded-lg p-4 bg-red-900/20">
              <div className="flex items-center mb-3">
                <Zap className="w-5 h-5 text-red-400 mr-2" />
                <h4 className="font-medium text-red-400">High-Throughput Networks (Visa-scale)</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-red-300">Suitability: Limited</strong>
                  <ul className="text-gray-300 mt-1 space-y-1">
                    <li>• Transaction volume: 65K+/second ✗</li>
                    <li>• Latency requirement: &lt;10ms ✗</li>
                    <li>• Global scale needed ✗</li>
                    <li>• Peak load handling ✗</li>
                    <li>• Cost per transaction ✗</li>
                  </ul>
                </div>
                <div className="bg-red-800/30 rounded p-2">
                  <strong>Challenges:</strong> Consensus latency too high, throughput limitations, 
                  cost per transaction, global distribution complexity.
                </div>
              </div>
            </div>
          </div>

          {/* Sweet Spot Use Cases */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-3">Optimal Use Cases for IC-based Caching:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-300">Financial Services:</strong>
                <ul className="text-gray-300 mt-1 space-y-1">
                  <li>• Regional banks and credit unions</li>
                  <li>• Insurance claim processing</li>
                  <li>• Regulatory reporting systems</li>
                  <li>• Audit trail requirements</li>
                </ul>
              </div>
              <div>
                <strong className="text-blue-300">Enterprise Applications:</strong>
                <ul className="text-gray-300 mt-1 space-y-1">
                  <li>• Supply chain tracking</li>
                  <li>• Document management systems</li>
                  <li>• Configuration management</li>
                  <li>• Session state for web apps</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Decision Matrix */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium mb-3">Decision Matrix:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-1 px-2">Criteria</th>
                    <th className="text-left py-1 px-2">Weight</th>
                    <th className="text-left py-1 px-2">IC Cache</th>
                    <th className="text-left py-1 px-2">Traditional</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <td className="py-1 px-2">Latency &lt;10ms</td>
                    <td className="py-1 px-2">High</td>
                    <td className="py-1 px-2 text-red-400">Poor</td>
                    <td className="py-1 px-2 text-green-400">Excellent</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-1 px-2">Data Persistence</td>
                    <td className="py-1 px-2">Medium</td>
                    <td className="py-1 px-2 text-green-400">Excellent</td>
                    <td className="py-1 px-2 text-yellow-400">Good</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-1 px-2">Operational Simplicity</td>
                    <td className="py-1 px-2">High</td>
                    <td className="py-1 px-2 text-green-400">Excellent</td>
                    <td className="py-1 px-2 text-yellow-400">Fair</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-1 px-2">Compliance/Audit</td>
                    <td className="py-1 px-2">High</td>
                    <td className="py-1 px-2 text-green-400">Excellent</td>
                    <td className="py-1 px-2 text-yellow-400">Good</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2">Cost at Scale</td>
                    <td className="py-1 px-2">Medium</td>
                    <td className="py-1 px-2 text-yellow-400">Variable</td>
                    <td className="py-1 px-2 text-green-400">Predictable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cost-analysis',
      title: 'Cost Implications',
      icon: <DollarSign className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-blue-400">Internet Computer Costs</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Storage:</strong> ~$5/GB/year</li>
                <li>• <strong>Compute:</strong> Per instruction execution</li>
                <li>• <strong>Network:</strong> Per message/query</li>
                <li>• <strong>No Infrastructure:</strong> Zero server costs</li>
                <li>• <strong>Predictable:</strong> Transparent pricing model</li>
              </ul>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 text-green-400">Traditional Infrastructure</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Servers:</strong> $100-1000+/month per node</li>
                <li>• <strong>Storage:</strong> $0.10-0.50/GB/month</li>
                <li>• <strong>Network:</strong> Bandwidth charges</li>
                <li>• <strong>Operations:</strong> DevOps team costs</li>
                <li>• <strong>Variable:</strong> Scaling complexity</li>
              </ul>
            </div>
          </div>
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <h4 className="font-medium text-purple-400 mb-2">Break-even Analysis:</h4>
            <p className="text-purple-300 text-sm">
              IC-based caching becomes cost-effective when operational simplicity, compliance requirements, 
              and built-in reliability features offset the higher per-operation costs. Typically favorable 
              for applications with moderate transaction volumes (1K-1M operations/day) where data integrity 
              and operational simplicity are prioritized over raw performance.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <BookOpen className="w-6 h-6 mr-3 text-blue-400" />
        <h2 className="text-xl font-semibold">Practical Considerations for Internet Computer Implementation</h2>
      </div>
      
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-700 rounded-lg">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-blue-400">{section.icon}</div>
                <h3 className="font-medium">{section.title}</h3>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4 border-t border-gray-700">
                <div className="pt-4">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="font-medium mb-2 text-yellow-400">Summary Recommendation:</h3>
        <p className="text-sm text-gray-300">
          Internet Computer-based distributed caching excels in scenarios requiring strong consistency, 
          regulatory compliance, and operational simplicity, particularly for financial services and 
          enterprise applications with moderate transaction volumes. The 6-node configuration provides 
          excellent fault tolerance while maintaining manageable complexity. For high-frequency, low-latency 
          applications, traditional solutions remain more suitable despite their operational complexity.
        </p>
      </div>
    </div>
  );
};

export default PracticalConsiderations;
