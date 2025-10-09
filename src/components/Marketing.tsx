import React, { useState } from 'react';
import { Megaphone, Users, TrendingUp, Mail, MessageSquare, Target, Plus, Eye } from 'lucide-react';

const Marketing: React.FC = () => {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  // Mock data for campaigns
  const campaigns = [
    {
      id: 1,
      name: 'Welcome Series',
      type: 'Email',
      status: 'Active',
      sent: 1250,
      opened: 875,
      clicked: 234,
      converted: 89,
      created: '2024-01-15'
    },
    {
      id: 2,
      name: 'Weekend Bonus',
      type: 'Push',
      status: 'Scheduled',
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      created: '2024-01-20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketing Campaigns</h1>
          <p className="text-gray-400 mt-2">Manage email campaigns, push notifications, and user engagement</p>
        </div>
        <button 
          onClick={() => setShowCreateCampaign(true)}
          className="mt-4 lg:mt-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Campaigns</p>
              <p className="text-3xl font-bold text-white mt-2">5</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">Running now</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Reach</p>
              <p className="text-3xl font-bold text-white mt-2">12.5K</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">This month</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Open Rate</p>
              <p className="text-3xl font-bold text-white mt-2">24.5%</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">Average</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
              <p className="text-3xl font-bold text-white mt-2">7.1%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">This month</span>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Marketing Campaigns</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sent</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Opened</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Clicked</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Converted</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{campaign.name}</div>
                    <div className="text-sm text-gray-400">Created {new Date(campaign.created).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {campaign.type === 'Email' ? (
                        <Mail className="w-4 h-4 mr-2 text-blue-400" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2 text-green-400" />
                      )}
                      <span className="text-sm text-white">{campaign.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'Scheduled'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{campaign.sent.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{campaign.opened.toLocaleString()}</div>
                    {campaign.sent > 0 && (
                      <div className="text-xs text-gray-400">
                        {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{campaign.clicked.toLocaleString()}</div>
                    {campaign.opened > 0 && (
                      <div className="text-xs text-gray-400">
                        {((campaign.clicked / campaign.opened) * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{campaign.converted.toLocaleString()}</div>
                    {campaign.clicked > 0 && (
                      <div className="text-xs text-gray-400">
                        {((campaign.converted / campaign.clicked) * 100).toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-150">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Campaign</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Type</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                  <option value="email">Email Campaign</option>
                  <option value="push">Push Notification</option>
                  <option value="sms">SMS Campaign</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                  <option value="all">All Users</option>
                  <option value="new">New Users</option>
                  <option value="active">Active Users</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter your message..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaign(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketing;