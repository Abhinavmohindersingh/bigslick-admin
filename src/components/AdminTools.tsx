import React, { useState } from 'react';
import { Settings, Database, Shield, AlertTriangle, RefreshCw, Download, Upload, Trash2 } from 'lucide-react';

const AdminTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Tools</h1>
          <p className="text-gray-400 mt-2">System administration, database management, and security tools</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh System
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'system', label: 'System Status', icon: Settings },
              { id: 'database', label: 'Database', icon: Database },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Status</h3>
              
              {/* System Health */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">API Status</h4>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-400">All endpoints operational</p>
                  <p className="text-xs text-green-400 mt-1">Response time: 45ms</p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Database</h4>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-400">Connected and healthy</p>
                  <p className="text-xs text-green-400 mt-1">Query time: 12ms</p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">Storage</h4>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-400">78% capacity used</p>
                  <p className="text-xs text-yellow-400 mt-1">Monitor usage</p>
                </div>
              </div>

              {/* System Metrics */}
              <div className="bg-gray-700/30 rounded-lg p-6">
                <h4 className="font-medium text-white mb-4">System Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">99.9%</div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">1.2GB</div>
                    <div className="text-sm text-gray-400">Memory Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">15%</div>
                    <div className="text-sm text-gray-400">CPU Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">45ms</div>
                    <div className="text-sm text-gray-400">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Database Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="font-medium text-white mb-4">Database Operations</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Export Database
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </button>
                    <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Optimize Tables
                    </button>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="font-medium text-white mb-4">Database Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Tables:</span>
                      <span className="text-white">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Records:</span>
                      <span className="text-white">156,789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Database Size:</span>
                      <span className="text-white">2.4 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Backup:</span>
                      <span className="text-white">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Queries */}
              <div className="bg-gray-700/30 rounded-lg p-6">
                <h4 className="font-medium text-white mb-4">Recent Queries</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-sm text-gray-300 font-mono">SELECT * FROM profiles WHERE...</span>
                    <span className="text-xs text-gray-400">12ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-sm text-gray-300 font-mono">UPDATE user_wallet SET chips...</span>
                    <span className="text-xs text-gray-400">8ms</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-sm text-gray-300 font-mono">INSERT INTO game_results...</span>
                    <span className="text-xs text-gray-400">15ms</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Security Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="font-medium text-white mb-4">Security Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">SSL Certificate:</span>
                      <span className="text-green-400">Valid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Firewall:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Rate Limiting:</span>
                      <span className="text-green-400">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">2FA Required:</span>
                      <span className="text-yellow-400">Partial</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="font-medium text-white mb-4">Recent Security Events</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="text-yellow-400">Failed login attempt</div>
                      <div className="text-xs text-gray-400">2 minutes ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-green-400">Admin login successful</div>
                      <div className="text-xs text-gray-400">15 minutes ago</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-red-400">Suspicious activity detected</div>
                      <div className="text-xs text-gray-400">1 hour ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Actions */}
              <div className="bg-gray-700/30 rounded-lg p-6">
                <h4 className="font-medium text-white mb-4">Security Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                    Block IP Address
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200">
                    Reset User Password
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Generate API Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Maintenance</h3>
              
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-400">Maintenance Mode</h4>
                    <p className="text-sm text-yellow-300">System is currently in maintenance mode</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="font-medium text-white mb-4">Maintenance Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200">
                      Enable Maintenance Mode
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                      Clear Cache
                    </button>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      Restart Services
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Logs
                    </button>
                  </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-6">
                  <h4 className="font-medium text-white mb-4">System Logs</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="text-xs font-mono">
                      <span className="text-gray-400">[2024-01-20 10:30:15]</span>
                      <span className="text-green-400 ml-2">INFO</span>
                      <span className="text-gray-300 ml-2">System startup complete</span>
                    </div>
                    <div className="text-xs font-mono">
                      <span className="text-gray-400">[2024-01-20 10:29:45]</span>
                      <span className="text-yellow-400 ml-2">WARN</span>
                      <span className="text-gray-300 ml-2">High memory usage detected</span>
                    </div>
                    <div className="text-xs font-mono">
                      <span className="text-gray-400">[2024-01-20 10:29:12]</span>
                      <span className="text-red-400 ml-2">ERROR</span>
                      <span className="text-gray-300 ml-2">Database connection timeout</span>
                    </div>
                    <div className="text-xs font-mono">
                      <span className="text-gray-400">[2024-01-20 10:28:55]</span>
                      <span className="text-green-400 ml-2">INFO</span>
                      <span className="text-gray-300 ml-2">User authentication successful</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Tasks */}
              <div className="bg-gray-700/30 rounded-lg p-6">
                <h4 className="font-medium text-white mb-4">Scheduled Tasks</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-600/30">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Task</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Schedule</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Last Run</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600/50">
                      <tr>
                        <td className="px-4 py-2 text-sm text-white">Database Backup</td>
                        <td className="px-4 py-2 text-sm text-gray-400">Daily at 2:00 AM</td>
                        <td className="px-4 py-2 text-sm text-gray-400">2 hours ago</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-sm text-white">Log Cleanup</td>
                        <td className="px-4 py-2 text-sm text-gray-400">Weekly</td>
                        <td className="px-4 py-2 text-sm text-gray-400">3 days ago</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Success
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTools;