import React, { useState } from 'react';
import { Users, Play, Pause, Settings, TrendingUp, Coins, Clock, Crown, Gamepad2, Plus, Eye, Ban } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

interface HoldemSession {
  id: string;
  session_code: string;
  table_name: string;
  host_id: string;
  small_blind: number;
  big_blind: number;
  max_players: number;
  current_players: number;
  dealer_position: number;
  current_hand_number: number;
  pot: number;
  betting_round: string;
  is_active: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
  };
}

interface HoldemPlayer {
  id: string;
  session_id: string;
  player_id: string;
  seat_position: number;
  current_chips: number;
  player_status: string;
  is_connected: boolean;
  profiles: {
    username: string;
  };
}

interface HoldemStats {
  id: string;
  player_id: string;
  total_hands_played: number;
  total_hands_won: number;
  total_blackjacks: number;
  total_busts: number;
  total_wagered: number;
  total_won: number;
  win_rate: number;
  blackjack_rate: number;
  bust_rate: number;
  profiles: {
    username: string;
  };
}

const HoldemEnvironment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [showCreateSession, setShowCreateSession] = useState(false);

  // Fetch 21 Hold'em data from holdem_21 schema
  const { data: sessions, loading: sessionsLoading, refetch: refetchSessions } = useSupabaseData<HoldemSession>(
    'holdem_21.sessions',
    `*, profiles(username)`
  );

  const { data: players, loading: playersLoading } = useSupabaseData<HoldemPlayer>(
    'holdem_21.players',
    `*, profiles(username)`
  );

  const { data: stats, loading: statsLoading } = useSupabaseData<HoldemStats>(
    'holdem_21.stats',
    `*, profiles(username)`
  );

  // Calculate environment stats
  const activeSessions = sessions.filter(s => s.is_active).length;
  const totalPlayers = players.filter(p => p.is_connected).length;
  const totalHandsPlayed = stats.reduce((sum, s) => sum + s.total_hands_played, 0);
  const totalPot = sessions.reduce((sum, s) => sum + Number(s.pot), 0);

  const handleCreateSession = async (formData: FormData) => {
    try {
      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase.schema('holdem_21').from('sessions').insert({
        session_code: sessionCode,
        table_name: formData.get('tableName') as string,
        host_id: (await supabase.auth.getUser()).data.user?.id || 'admin-host-id',
        small_blind: parseInt(formData.get('smallBlind') as string),
        big_blind: parseInt(formData.get('bigBlind') as string),
        max_players: parseInt(formData.get('maxPlayers') as string),
        min_buy_in: parseInt(formData.get('minBuyIn') as string),
        max_buy_in: parseInt(formData.get('maxBuyIn') as string),
        is_private: formData.get('isPrivate') === 'on'
      });

      if (error) throw error;
      
      refetchSessions();
      setShowCreateSession(false);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleToggleSession = async (sessionId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .schema('holdem_21')
        .from('sessions')
        .update({ is_active: !isActive })
        .eq('id', sessionId);

      if (error) throw error;
      refetchSessions();
    } catch (err) {
      console.error('Error toggling session:', err);
    }
  };

  if (sessionsLoading || playersLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">21 Hold'em Environment</h1>
          <p className="text-gray-400 mt-2">Manage 21 Hold'em tables, sessions, and players</p>
        </div>
        <button 
          onClick={() => setShowCreateSession(true)}
          className="mt-4 lg:mt-0 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </button>
      </div>

      {/* Environment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Sessions</p>
              <p className="text-3xl font-bold text-white mt-2">{activeSessions}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Gamepad2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">Live</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Connected Players</p>
              <p className="text-3xl font-bold text-white mt-2">{totalPlayers}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-sm font-medium text-blue-400">Online now</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Pot</p>
              <p className="text-3xl font-bold text-white mt-2">{totalPot.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-400">All tables</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Hands Played</p>
              <p className="text-3xl font-bold text-white mt-2">{totalHandsPlayed.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Crown className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-sm font-medium text-gray-400">All time</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'sessions', label: 'Active Sessions', icon: Gamepad2 },
              { id: 'players', label: 'Players', icon: Users },
              { id: 'statistics', label: 'Statistics', icon: TrendingUp },
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
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Active 21 Hold'em Sessions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Table</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Host</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Blinds</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Players</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pot</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{session.table_name}</div>
                            <div className="text-sm text-gray-400">{session.session_code}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-white">{session.profiles?.username || 'Unknown'}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-white">{session.small_blind}/{session.big_blind}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-white">{session.current_players}/{session.max_players}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-white">{Number(session.pot).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            session.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {session.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-400 hover:bg-blue-500/20 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleToggleSession(session.id, session.is_active)}
                              className="p-1 text-orange-400 hover:bg-orange-500/20 rounded"
                            >
                              {session.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                            <button className="p-1 text-red-400 hover:bg-red-500/20 rounded">
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Connected Players</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.filter(p => p.is_connected).map((player) => (
                  <div key={player.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {player.profiles?.username || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">Seat {player.seat_position}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {Number(player.current_chips).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">chips</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        player.player_status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.player_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Player Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hands</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blackjacks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Busts</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Won</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.slice(0, 10).map((stat) => (
                      <tr key={stat.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {stat.profiles?.username || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{stat.total_hands_played}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{Number(stat.win_rate).toFixed(1)}%</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{stat.total_blackjacks}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{stat.total_busts}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {Number(stat.total_won).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">21 Hold'em Environment Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Small Blind</label>
                    <input type="number" defaultValue="25" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Big Blind</label>
                    <input type="number" defaultValue="50" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Players Per Table</label>
                    <input type="number" defaultValue="9" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Start Hands</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hand Timeout (seconds)</label>
                    <input type="number" defaultValue="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allow Spectators</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New 21 Hold'em Session</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateSession(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table Name</label>
                <input
                  name="tableName"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="High Stakes Table"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Small Blind</label>
                  <input
                    name="smallBlind"
                    type="number"
                    required
                    defaultValue="25"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Big Blind</label>
                  <input
                    name="bigBlind"
                    type="number"
                    required
                    defaultValue="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Players</label>
                <select name="maxPlayers" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="6">6 Players</option>
                  <option value="9">9 Players</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Buy-in</label>
                  <input
                    name="minBuyIn"
                    type="number"
                    required
                    defaultValue="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Buy-in</label>
                  <input
                    name="maxBuyIn"
                    type="number"
                    required
                    defaultValue="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  name="isPrivate"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Private Session</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoldemEnvironment;