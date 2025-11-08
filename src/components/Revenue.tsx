import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  CreditCard,
  Banknote,
  PieChart,
} from "lucide-react";
import { useSupabaseData } from "../hooks/useSupabaseData";

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

const Revenue: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30days");

  // Fetch transactions table with user profiles
  const { data: transactions, loading } =
    useSupabaseData<TransactionWithProfile>(
      "transactions",
      "*, profiles(username, email)"
    );

  // Filter by completed transactions only
  const completedTransactions = transactions.filter(
    (t) => t.status === "completed"
  );

  // Calculate revenue metrics
  const totalRevenue = completedTransactions.reduce(
    (sum, t) => sum + Number(t.amount_paid || 0),
    0
  );

  const monthlyRevenue = completedTransactions
    .filter((t) => {
      const date = new Date(t.created_at);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Number(t.amount_paid || 0), 0);

  const dailyRevenue = completedTransactions
    .filter((t) => {
      const date = new Date(t.created_at);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    })
    .reduce((sum, t) => sum + Number(t.amount_paid || 0), 0);

  const averageTransaction =
    completedTransactions.length > 0
      ? totalRevenue / completedTransactions.length
      : 0;

  // Sort by most recent
  const sortedTransactions = [...completedTransactions].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-gray-400 mt-2">
            Track revenue, transactions, and financial performance
          </p>
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
              <p className="text-3xl font-bold text-white mt-2">
                ${totalRevenue.toFixed(2)}
              </p>
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
              <p className="text-sm font-medium text-gray-400">
                Monthly Revenue
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                ${monthlyRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">
              This month
            </span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Daily Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">
                ${dailyRevenue.toFixed(2)}
              </p>
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
              <p className="text-sm font-medium text-gray-400">
                Avg Transaction
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                ${averageTransaction.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <PieChart className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm font-medium text-purple-400">
              Per purchase
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">
            Recent Transactions
          </h3>
        </div>
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
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Chips
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
              {sortedTransactions.slice(0, 15).map((transaction) => (
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
                      ${Number(transaction.amount_paid).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      {transaction.chips_purchased.toLocaleString()}
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
