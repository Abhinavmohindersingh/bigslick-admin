import React, { useState } from 'react';
import { Gift, Plus, TrendingUp, Users, Calendar, Percent } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { PurchaseHistory, Profile } from '../lib/supabase';

const Bonuses: React.FC = () => {
  const [showCreateBonus, setShowCreateBonus] = useState(false);

  const { data: bonuses, loading } = useSupabaseData<PurchaseHistory & { profiles: Profile }>(
    'purchase_history',
    `*, profiles(username, email)`,
    []
  );

  const bonusTransactions = bonuses.filter(b => b.is_bonus || b.transaction_type === 'bonus');
  const totalBonusValue = bonusTransactions.reduce((sum, b) => sum + Number(b.bonus_amount || 0), 0);
  const monthlyBonuses = bonusTransactions.filter(b => {
    const date = new Date(b.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bonus Management</h1>
          <p className="text-gray-400 mt-2">Manage user bonuses, promotions, and rewards</p>
        </div>
        <button 
          onClick={() => setShowCreateBonus(true)}
          className="mt-4 lg:mt-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Bonus
        </button>
      </div>

      {/* Bonus Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Bonuses</p>
              <p className="text-3xl font-bold text-white mt-2">{bonusTransactions.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Gift className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">All time</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Bonus Value</p>
              <p className="text-3xl font-bold text-white mt-2">{totalBonusValue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">Chips awarded</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Monthly Bonuses</p>
              <p className="text-3xl font-bold text-white mt-2">{monthlyBonuses}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-white mt-2">{new Set(bonusTransactions.map(b => b.user_id)).size}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Users className="w-4 h-4 text-amber-500 mr-1" />
            <span className="text-sm font-medium text-amber-400">Received bonuses</span>
          </div>
        </div>
      </div>

      {/* Recent Bonuses */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Bonuses</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bonus Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {bonusTransactions.slice(0, 10).map((bonus) => (
                <tr key={bonus.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {bonus.profiles?.username || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-green-400">
                      +{Number(bonus.bonus_amount || bonus.chips_awarded).toLocaleString()} chips
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {bonus.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {bonus.purchase_source}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(bonus.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bonus Modal */}
      {showCreateBonus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Bonus</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bonus Type</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                  <option value="welcome">Welcome Bonus</option>
                  <option value="daily">Daily Bonus</option>
                  <option value="loyalty">Loyalty Bonus</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chip Amount</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Bonus description..."
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateBonus(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Create Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bonuses;