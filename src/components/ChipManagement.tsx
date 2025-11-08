import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useSupabaseData } from "../hooks/useSupabaseData";
import { supabase } from "../lib/supabase";

interface Transaction {
  id: string;
  user_id: string;
  item_id: string;
  item_name: string;
  chips_purchased: number;
  amount_paid: number;
  payment_method: string;
  stripe_payment_id: string;
  status: string;
  created_at: string;
}

interface TransactionWithProfile extends Transaction {
  profiles?: {
    username: string;
    email: string;
  };
}

interface Profile {
  id: string;
  username: string;
  email: string;
}

interface UserWallet {
  id: string;
  user_id: string;
  chips: number;
}

const ChipManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Fetch correct tables
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useSupabaseData<TransactionWithProfile>(
    "transactions",
    "*, profiles(username, email)"
  );

  const { data: profiles } = useSupabaseData<Profile>(
    "profiles",
    "id, username, email"
  );
  const { data: wallets } = useSupabaseData<UserWallet>(
    "user_wallet",
    "user_id, chips"
  );

  // Calculate summary stats
  const totalChipsInCirculation = wallets.reduce(
    (sum, wallet) => sum + (wallet.chips || 0),
    0
  );

  const completedTransactions = transactions.filter(
    (t) => t.status === "completed"
  );

  const dailyTransactions = completedTransactions.filter(
    (t) => new Date(t.created_at).toDateString() === new Date().toDateString()
  ).length;

  const totalValue = completedTransactions.reduce(
    (sum, t) => sum + (Number(t.amount_paid) || 0),
    0
  );

  // Filter transactions
  const filteredTransactions = completedTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.profiles?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.profiles?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || transaction.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort by most recent
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleAddTransaction = async (formData: any) => {
    try {
      const chipAmount = parseInt(formData.chipAmount);

      // Add transaction record
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: formData.userId,
        item_id: formData.itemId || "manual_admin",
        item_name: formData.itemName || "Admin Bonus",
        chips_purchased: chipAmount,
        amount_paid: parseFloat(formData.value) || 0,
        payment_method: "admin_manual",
        status: "completed",
        stripe_payment_id: "admin_" + Date.now(),
      });

      if (txError) throw txError;

      // Update user's chips in wallet
      const currentWallet = wallets.find((w) => w.user_id === formData.userId);
      const newChipsAmount = (currentWallet?.chips || 0) + chipAmount;

      const { error: updateError } = await supabase
        .from("user_wallet")
        .update({ chips: newChipsAmount })
        .eq("user_id", formData.userId);

      if (updateError) throw updateError;

      refetch();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding transaction:", err);
      alert("Failed to add transaction");
    }
  };

  const getTransactionIcon = (paymentMethod: string) => {
    return paymentMethod === "admin_manual" ? (
      <ArrowUpRight className="w-4 h-4 text-green-600" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-blue-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Chip Management</h1>
          <p className="text-gray-400 mt-2">
            Monitor chip transactions and inventory
          </p>
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
              <p className="text-sm font-medium text-gray-400">
                Total Chips in Circulation
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalChipsInCirculation.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">
              Live data
            </span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Daily Transactions
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {dailyTransactions}
              </p>
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
              <p className="text-3xl font-bold text-white mt-2">
                ${totalValue.toFixed(2)}
              </p>
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
              placeholder="Search transactions by user, email, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Chips
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedTransactions.slice(0, 20).map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-700/30 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {transaction.profiles?.username || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {transaction.profiles?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {transaction.item_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-green-400">
                      +{transaction.chips_purchased.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      ${Number(transaction.amount_paid).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white capitalize">
                      {transaction.payment_method}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add Chips (Admin)
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleAddTransaction({
                  userId: formData.get("userId"),
                  itemName: formData.get("itemName") || "Admin Bonus",
                  chipAmount: formData.get("chipAmount"),
                  value: formData.get("value"),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User
                </label>
                <select
                  name="userId"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                >
                  <option value="">Select User</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.username} ({profile.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Item Name
                </label>
                <input
                  name="itemName"
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="e.g., Admin Bonus"
                  defaultValue="Admin Bonus"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chip Amount
                </label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Value ($) - Optional
                </label>
                <input
                  name="value"
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="0.00"
                  defaultValue="0"
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
                  Add Chips
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
