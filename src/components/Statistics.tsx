import React, { useState } from 'react';
import { TrendingUp, Users, Coins, DollarSign, Calendar, Download, BarChart3, PieChart, Gamepad as GamepadIcon, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { GameResult, Profile, PurchaseHistory, UserViolation, Leaderboard } from '../lib/supabase';

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [chartType, setChartType] = useState('bar');

  const { data: gameResults } = useSupabaseData<GameResult & { profiles: Profile }>(
    'game_results',
    `*, profiles!fk_game_results_user_id(username, email)`
  );

  const { data: profiles } = useSupabaseData<Profile>('profiles');
  const { data: purchases } = useSupabaseData<PurchaseHistory>('purchase_history');
  const { data: violations } = useSupabaseData<UserViolation>('user_violations');
  const { data: leaderboards } = useSupabaseData<Leaderboard>('leaderboards');

  // Calculate time-filtered data
  const getTimeFilteredData = (data: any[], dateField: string = 'created_at') => {
    const now = new Date();
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(item => new Date(item[dateField]) >= cutoff);
  };

  const filteredGameResults = getTimeFilteredData(gameResults);
  const filteredProfiles = getTimeFilteredData(profiles);
  const filteredPurchases = getTimeFilteredData(purchases);
  const filteredViolations = getTimeFilteredData(violations);

  // Calculate statistics
  const totalGames = filteredGameResults.length;
  const totalWins = filteredGameResults.filter(g => g.result_type === 'win').length;
  const totalRevenue = filteredPurchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0);
  const newUsers = filteredProfiles.length;

  // Get active users from game tables instead of last_activity
  const { data: activeUsersData } = useSupabaseData('active_users', 'user_id', []);
  const activeUsers = activeUsersData.filter(u => u.is_active).length;

  // Game type distribution
  const gameTypeStats = filteredGameResults.reduce((acc, game) => {
    acc[game.game_type] = (acc[game.game_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top players by chips won
  const topPlayers = profiles
    .sort((a, b) => Number(b.chips_won_total || 0) - Number(a.chips_won_total || 0))
    .slice(0, 10);

  // Revenue by day (last 7 days)
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayRevenue = purchases
      .filter(p => new Date(p.created_at).toDateString() === date.toDateString())
      .reduce((sum, p) => sum + Number(p.price_paid || 0), 0);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: dayRevenue
    };
  }).reverse();

  const stats = [
    {
      title: 'New Users',
      value: `+${newUsers}`,
      description: `In last ${timeRange.replace('days', ' days')}`,
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      description: 'Last 7 days',
      icon: TrendingUp,
      color: 'emerald',
      trend: 'up'
    },
    {
      title: 'Games Played',
      value: totalGames.toLocaleString(),
      description: `${totalWins} wins (${totalGames ? Math.round((totalWins / totalGames) * 100) : 0}%)`,
      icon: GamepadIcon,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      description: `From ${filteredPurchases.length} transactions`,
      icon: DollarSign,
      color: 'amber',
      trend: 'up'
    },
    {
      title: 'Violations',
      value: filteredViolations.length.toString(),
      description: `${violations.filter(v => v.status === 'pending').length} pending`,
      icon: AlertTriangle,
      color: 'red',
      trend: filteredViolations.length > 0 ? 'down' : 'up'
    }
  ];

  const exportReport = () => {
    const reportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: profiles.length,
        activeUsers,
        newUsers,
        totalGames,
        totalRevenue,
        violations: violations.length
      },
      gameTypes: gameTypeStats,
      topPlayers: topPlayers.slice(0, 5).map(p => ({
        username: p.username,
        chipsWon: Number(p.chips_won_total || 0),
        gamesPlayed: p.games_played,
        level: p.level
      })),
      revenueByDay
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gaming-platform-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Statistics & Analytics</h1>
          <p className="text-gray-400 mt-2">Comprehensive insights from your gaming platform</p>
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
          <button 
            onClick={exportReport}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/20 text-${stat.color}-400 border border-${stat.color}-500/30`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Daily Revenue Trends</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  chartType === 'bar' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  chartType === 'pie' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-end space-x-2 px-4">
            {revenueByDay.map((day, index) => {
              const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-700/30 rounded-t-lg flex flex-col justify-end h-48">
                    <div 
                      className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-500 hover:from-orange-600 hover:to-orange-500 relative group shadow-lg"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700">
                        ${day.revenue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-300 mt-2">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Types Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Game Types Distribution</h3>
          
          <div className="space-y-4">
            {Object.entries(gameTypeStats).map(([gameType, count]) => {
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
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Players */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Top Players by Chips Won</h3>
          <div className="space-y-4">
            {topPlayers.slice(0, 10).map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-colors duration-150">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{player.username || 'Anonymous'}</div>
                    <div className="text-xs text-gray-400">Level {player.level} • {player.games_played} games</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    {Number(player.chips_won_total || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">chips won</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Violations */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Violations</h3>
          <div className="space-y-4">
            {violations.slice(0, 10).map((violation) => (
              <div key={violation.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors duration-150">
                <div className={`p-2 rounded-lg ${
                  violation.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  violation.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  violation.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white capitalize">
                    {violation.violation_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-400 truncate">{violation.violation_description}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      violation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      violation.status === 'confirmed' ? 'bg-red-500/20 text-red-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {violation.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(violation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;