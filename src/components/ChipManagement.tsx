import React, { useState } from 'react';
import { Search, Filter, Plus, ArrowUpRight, ArrowDownLeft, Coins, TrendingUp, DollarSign } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { PurchaseHistory, Profile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const ChipManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const { data: transactions, loading, error, refetch } = useSupabaseData<PurchaseHistory & { profiles: Profile }>(
    'purchase_history',
    `*, profiles(username, email)`
  );

  const { data: profiles } = useSupabaseData<Profile>('profiles', 'id, username, chips_balance');

  // Calculate summary stats
  const totalChipsInCirculation = profiles.reduce((sum, profile) => sum + (profile.chips_balance || 0), 0);
  const dailyTransactions = transactions.filter(t => 
    new Date(t.created_at).toDateString() === new Date().toDateString()
  ).length;
  const totalValue = transactions.reduce((sum, t) => sum + (Number(t.price_paid) || 0), 0);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || transaction.transaction_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleAddTransaction = async (formData: any) => {
    try {
      const { error } = await supabase.from('purchase_history').insert({
        user_id: formData.userId,
        chips_awarded: parseInt(formData.chipAmount),
        price_paid: parseFloat(formData.value),
        transaction_type: formData.type,
        package_name: formData.packageName || null,
        is_bonus: formData.type === 'bonus',
        purchase_source: 'admin_dashboard'
      });

      if (error) throw error;

      // Update user's chip balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          chips_balance: supabase.raw(`chips_balance + ${parseInt(formData.chipAmount)}`)
        })
        .eq('id', formData.userId);

      if (updateError) throw updateError;

      refetch();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'purchase' || type === 'bonus' 
      ? <ArrowUpRight className="w-4 h-4 text-green-600" />
      : <ArrowDownLeft className="w-4 h-4 text-red-600" />;
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Chip Management</h1>
          <p className="text-gray-400 mt-2">Monitor chip transactions and inventory</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="mt-4 lg:mt-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Chips in Circulation</p>
              <p className="text-3xl font-bold text-white mt-2">{totalChipsInCirculation.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">Live data</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Daily Transactions</p>
              <p className="text-3xl font-bold text-white mt-2">{dailyTransactions}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ArrowUpRight className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-400">Total Value</p>
              <p className="text-3xl font-bold text-white mt-2">${totalValue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">All time</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search transactions by user or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="all">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="bonus">Bonus</option>
            <option value="refund">Refund</option>
          </select>
          <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center text-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chips</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{transaction.id.slice(0, 8)}...</div>
                        <div className="text-sm text-gray-400">{transaction.package_name || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {transaction.profiles?.username || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {transaction.profiles?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.transaction_type === 'purchase' ? 'bg-green-100 text-green-800' :
                      transaction.transaction_type === 'bonus' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.transaction_type}
                    </span>
                    {transaction.is_bonus && (
                      <span className="ml-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Bonus
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-semibold ${getAmountColor(Number(transaction.chips_awarded))}`}>
                      +{Number(transaction.chips_awarded).toLocaleString()}
                    </div>
                    {transaction.bonus_amount > 0 && (
                      <div className="text-xs text-yellow-600">
                        +{Number(transaction.bonus_amount).toLocaleString()} bonus
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      ${Number(transaction.price_paid).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{transaction.purchase_source}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Transaction</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddTransaction({
                userId: formData.get('userId'),
                type: formData.get('type'),
                chipAmount: formData.get('chipAmount'),
                value: formData.get('value'),
                packageName: formData.get('packageName')
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
                <select name="userId" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                  <option value="">Select User</option>
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.username || profile.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Transaction Type</label>
                <select name="type" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                  <option value="purchase">Purchase</option>
                  <option value="bonus">Bonus</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chip Amount</label>
                <input
                  name="chipAmount"
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter chip amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Value ($)</label>
                <input
                  name="value"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Package Name (Optional)</label>
                <input
                  name="packageName"
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="e.g., Starter Pack"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChipManagement;