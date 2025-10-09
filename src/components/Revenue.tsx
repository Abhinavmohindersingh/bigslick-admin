import React, { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Banknote, PieChart } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { PurchaseHistory, Profile } from '../lib/supabase';

const Revenue: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30days');

  const { data: purchases, loading } = useSupabaseData<PurchaseHistory & { profiles: Profile }>(
    'purchase_history',
    `*, profiles(username, email)`
  );

  // Calculate revenue metrics
  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0);
  const monthlyRevenue = purchases.filter(p => {
    const date = new Date(p.created_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).reduce((sum, p) => sum + Number(p.price_paid || 0), 0);

  const dailyRevenue = purchases.filter(p => {
    const date = new Date(p.created_at);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).reduce((sum, p) => sum + Number(p.price_paid || 0), 0);

  const averageTransaction = purchases.length > 0 ? totalRevenue / purchases.length : 0;

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
          <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-gray-400 mt-2">Track revenue, transactions, and financial performance</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30">
              <DollarSign className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-400">Monthly Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${monthlyRevenue.toLocaleString()}</p>
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
              <p className="text-sm font-medium text-gray-400">Daily Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">${dailyRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">Today</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Transaction</p>
              <p className="text-3xl font-bold text-white mt-2">${averageTransaction.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <PieChart className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm font-medium text-purple-400">Per purchase</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chips</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {purchases.slice(0, 10).map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {purchase.profiles?.username || 'Unknown User'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-green-400">
                      ${Number(purchase.price_paid).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {Number(purchase.chips_awarded).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {purchase.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;