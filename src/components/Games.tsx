import React, { useState } from 'react';
import { Gamepad2, TrendingUp, Users, Clock, Trophy, Play, Pause, Settings } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { GameResult } from '../lib/supabase';

const Games: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: gameResults, loading } = useSupabaseData<GameResult>(
    'game_results',
    '*'
  );

  // Calculate game statistics
  const totalGames = gameResults.length;
  const gamesByType = gameResults.reduce((acc, game) => {
    acc[game.game_type] = (acc[game.game_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const winRate = totalGames > 0 
    ? (gameResults.filter(g => g.result_type === 'win').length / totalGames) * 100 
    : 0;

  const averageGameDuration = gameResults.length > 0
    ? gameResults.reduce((sum, g) => sum + (g.game_duration_minutes || 0), 0) / gameResults.length
    : 0;

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
          <h1 className="text-3xl font-bold text-white">Game Management</h1>
          <p className="text-gray-400 mt-2">Monitor game performance, sessions, and player activity</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center">
            <Play className="w-4 h-4 mr-2" />
            Start Session
          </button>
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
              <p className="text-3xl font-bold text-white mt-2">{totalGames.toLocaleString()}</p>
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
              <p className="text-3xl font-bold text-white mt-2">{winRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Trophy className="w-6 h-6" />
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
              <p className="text-sm font-medium text-gray-400">Active Players</p>
              <p className="text-3xl font-bold text-white mt-2">{new Set(gameResults.map(g => g.user_id)).size}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Users className="w-4 h-4 text-amber-500 mr-1" />
            <span className="text-sm font-medium text-amber-400">Unique players</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Avg Duration</p>
              <p className="text-3xl font-bold text-white mt-2">{averageGameDuration.toFixed(1)}m</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-sm font-medium text-purple-400">Per game</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Gamepad2 },
              { id: 'sessions', label: 'Active Sessions', icon: Play },
              { id: 'types', label: 'Game Types', icon: Trophy },
              { id: 'settings', label: 'Settings', icon: Settings }
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Game Performance Overview</h3>
              
              {/* Game Types Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-white">Games by Type</h4>
                  {Object.entries(gamesByType).map(([gameType, count]) => {
                    const percentage = totalGames > 0 ? (count / totalGames) * 100 : 0;
                    return (
                      <div key={gameType} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-white capitalize">{gameType.replace('-', ' ')}</span>
                          <span className="text-gray-400">{count} games ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-white">Recent Activity</h4>
                  <div className="space-y-3">
                    {gameResults.slice(0, 5).map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30">
                        <div>
                          <div className="text-sm font-medium text-white capitalize">
                            {game.game_type.replace('-', ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(game.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            game.result_type === 'win' ? 'text-green-400' : 
                            game.result_type === 'loss' ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {game.result_type.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {game.chips_won > 0 ? '+' : ''}{game.chips_won} chips
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Active Game Sessions</h3>
              <div className="text-center py-12">
                <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No active game sessions</p>
                <button className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                  Start New Session
                </button>
              </div>
            </div>
          )}

          {activeTab === 'types' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Game Types Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(gamesByType).map(([gameType, count]) => (
                  <div key={gameType} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white capitalize">{gameType.replace('-', ' ')}</h4>
                      <span className="text-sm text-gray-400">{count} games</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Configure
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                        Stats
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Game Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Game Duration (minutes)</label>
                    <input type="number" defaultValue="30" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Players Per Game</label>
                    <input type="number" defaultValue="9" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Auto-Start Games</label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Bet Amount</label>
                    <input type="number" defaultValue="10" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Bet Amount</label>
                    <input type="number" defaultValue="1000" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Enable Spectators</label>
                    <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Games;