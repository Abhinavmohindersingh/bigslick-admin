import React, { useState } from "react";
import {
  Gamepad2,
  TrendingUp,
  Users,
  Clock,
  Trophy,
  Play,
  Settings,
} from "lucide-react";
import { useSupabaseData } from "../hooks/useSupabaseData";

interface UserWallet {
  id: string;
  user_id: string;
  chips: number;
  level: number;
  experience: number;
  games_played: number;
  games_won: number;
  total_hours_played: number;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  email: string;
}

const Games: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: wallets, loading } = useSupabaseData<UserWallet>(
    "user_wallet",
    "*"
  );
  const { data: profiles } = useSupabaseData<Profile>(
    "profiles",
    "id, username, email"
  );

  // Calculate game statistics from user_wallet data
  const totalGames = wallets.reduce((sum, w) => sum + (w.games_played || 0), 0);
  const totalWins = wallets.reduce((sum, w) => sum + (w.games_won || 0), 0);
  const totalHours = wallets.reduce(
    (sum, w) => sum + (Number(w.total_hours_played) || 0),
    0
  );

  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
  const activePlayers = wallets.filter((w) => (w.games_played || 0) > 0).length;
  const averageGameDuration =
    totalGames > 0 ? (totalHours * 60) / totalGames : 0; // in minutes

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
          <h1 className="text-3xl font-bold text-white">Game Management</h1>
          <p className="text-gray-400 mt-2">
            Monitor game performance and player activity
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Games</p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalGames.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Gamepad2 className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-400">Win Rate</p>
              <p className="text-3xl font-bold text-white mt-2">
                {winRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Trophy className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">
              {totalWins.toLocaleString()} wins
            </span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Active Players
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {activePlayers}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Users className="w-4 h-4 text-amber-500 mr-1" />
            <span className="text-sm font-medium text-amber-400">
              Players with games
            </span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Duration</p>
              <p className="text-3xl font-bold text-white mt-2">
                {averageGameDuration.toFixed(1)}m
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm font-medium text-purple-400">
              Per game
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: Gamepad2 },
              { id: "players", label: "Top Players", icon: Trophy },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
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
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Game Performance Overview
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-white">
                    Platform Statistics
                  </h4>
                  <div className="space-y-3 bg-gray-700/30 rounded-lg p-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Games Played</span>
                      <span className="text-white font-semibold">
                        {totalGames.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Wins</span>
                      <span className="text-green-400 font-semibold">
                        {totalWins.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Hours Played</span>
                      <span className="text-white font-semibold">
                        {totalHours.toFixed(1)}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Win Rate</span>
                      <span className="text-blue-400 font-semibold">
                        {winRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-white">
                    Top Players by Games
                  </h4>
                  <div className="space-y-3">
                    {wallets
                      .filter((w) => (w.games_played || 0) > 0)
                      .sort(
                        (a, b) => (b.games_played || 0) - (a.games_played || 0)
                      )
                      .slice(0, 5)
                      .map((wallet, index) => {
                        const profile = profiles.find(
                          (p) => p.id === wallet.user_id
                        );
                        const userWinRate =
                          wallet.games_played > 0
                            ? ((wallet.games_won || 0) / wallet.games_played) *
                              100
                            : 0;

                        return (
                          <div
                            key={wallet.user_id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {profile?.username || "Unknown"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Level {wallet.level || 1}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-white">
                                {wallet.games_played} games
                              </div>
                              <div className="text-xs text-green-400">
                                {userWinRate.toFixed(1)}% win rate
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "players" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Player Leaderboard
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/30 border-b border-gray-600/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Player
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Level
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Games
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Wins
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Win Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {wallets
                      .filter((w) => (w.games_played || 0) > 0)
                      .sort(
                        (a, b) => (b.games_played || 0) - (a.games_played || 0)
                      )
                      .map((wallet, index) => {
                        const profile = profiles.find(
                          (p) => p.id === wallet.user_id
                        );
                        const userWinRate =
                          wallet.games_played > 0
                            ? ((wallet.games_won || 0) / wallet.games_played) *
                              100
                            : 0;

                        return (
                          <tr
                            key={wallet.user_id}
                            className="hover:bg-gray-700/30"
                          >
                            <td className="px-6 py-4 text-white font-semibold">
                              #{index + 1}
                            </td>
                            <td className="px-6 py-4 text-white">
                              {profile?.username || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-white">
                              {wallet.level || 1}
                            </td>
                            <td className="px-6 py-4 text-white">
                              {wallet.games_played || 0}
                            </td>
                            <td className="px-6 py-4 text-green-400">
                              {wallet.games_won || 0}
                            </td>
                            <td className="px-6 py-4 text-blue-400">
                              {userWinRate.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 text-white">
                              {Number(wallet.total_hours_played || 0).toFixed(
                                1
                              )}
                              h
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Game Settings
              </h3>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Game settings will be available soon
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Games;
