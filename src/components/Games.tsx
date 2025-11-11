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
import { useGamePresence } from "../contexts/GamePresenceContext"; // ADD THIS

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
  const { presenceCounts } = useGamePresence(); // ADD THIS

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
    totalGames > 0 ? (totalHours * 60) / totalGames : 0;

  // ADD: Calculate total online players
  const totalOnlinePlayers = Object.values(presenceCounts).reduce(
    (sum, count) => sum + count,
    0
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

        {/* UPDATED: Show real-time online players */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Players Online Now
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalOnlinePlayers}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-green-400">
              Live tracking
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

      {/* ADD: Live Game Activity Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-3"></div>
          Live Game Activity
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-orange-500/10 to-purple-600/10 rounded-lg p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">
                Racing Suits
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  presenceCounts["racing-suits"] > 0
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {presenceCounts["racing-suits"]}
            </p>
            <p className="text-xs text-gray-400">Players racing</p>
          </div>

          <div className="bg-gradient-to-br from-gray-700/10 to-gray-900/10 rounded-lg p-4 border border-gray-500/30 hover:border-gray-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">
                Space Crash
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  presenceCounts["space-crash"] > 0
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {presenceCounts["space-crash"]}
            </p>
            <p className="text-xs text-gray-400">Players online</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/10 to-green-900/10 rounded-lg p-4 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">Stack'em</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  presenceCounts["stack-em"] > 0
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {presenceCounts["stack-em"]}
            </p>
            <p className="text-xs text-gray-400">Players stacking</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-green-900/10 rounded-lg p-4 border border-emerald-500/30 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">Pokeropoly</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  presenceCounts["poker-opoly"] > 0
                    ? "bg-green-400 animate-pulse"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {presenceCounts["poker-opoly"]}
            </p>
            <p className="text-xs text-gray-400">at tables</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - rest stays the same */}
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

        {/* Rest of your tabs content stays exactly the same */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                Game Performance Overview
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your existing overview content */}
              </div>
            </div>
          )}

          {activeTab === "players" && (
            <div className="space-y-4">{/* Your existing players table */}</div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Your existing settings content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Games;
