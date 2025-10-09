import React from 'react';
import { Clock, User, Coins, DollarSign, AlertTriangle, Gamepad as GamepadIcon } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { GameResult, PurchaseHistory, UserViolation, Profile } from '../lib/supabase';

const RecentActivity: React.FC = () => {
  const { data: gameResults, loading: gamesLoading } = useSupabaseData<GameResult & { profiles: Profile }>(
    'game_results',
    `*, profiles!fk_game_results_user_id(username)`,
    []
  );

  const { data: purchases, loading: purchasesLoading } = useSupabaseData<PurchaseHistory & { profiles: Profile }>(
    'purchase_history',
    `*, profiles(username)`,
    []
  );

  const { data: violations, loading: violationsLoading } = useSupabaseData<UserViolation & { profiles: Profile }>(
    'user_violations',
    `*, profiles!user_violations_user_id_fkey(username)`,
    []
  );

  if (gamesLoading || purchasesLoading || violationsLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }
  // Combine and sort all activities
  const allActivities = [
    ...gameResults.slice(0, 5).map(game => ({
      id: `game-${game.id}`,
      type: 'game',
      message: `Game ${game.result_type}`,
      details: `${game.profiles?.username || 'Unknown'} - ${game.game_type}`,
      time: game.created_at,
      icon: GamepadIcon,
      color: game.result_type === 'win' ? 'emerald' : game.result_type === 'loss' ? 'red' : 'gray'
    })),
    ...purchases.slice(0, 5).map(purchase => ({
      id: `purchase-${purchase.id}`,
      type: 'purchase',
      message: 'Chip purchase',
      details: `${purchase.profiles?.username || 'Unknown'} - ${Number(purchase.chips_awarded).toLocaleString()} chips`,
      time: purchase.created_at,
      icon: Coins,
      color: 'emerald'
    })),
    ...violations.slice(0, 3).map(violation => ({
      id: `violation-${violation.id}`,
      type: 'violation',
      message: 'Policy violation',
      details: `${violation.profiles?.username || 'Unknown'} - ${violation.violation_type.replace('_', ' ')}`,
      time: violation.created_at,
      icon: AlertTriangle,
      color: 'red'
    }))
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      emerald: 'bg-emerald-50 text-emerald-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-red-50 text-red-600',
      gray: 'bg-gray-50 text-gray-600'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <button className="text-sm text-orange-400 hover:text-orange-300 font-medium">View All</button>
      </div>

      <div className="space-y-4">
        {allActivities.length > 0 ? (
          allActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors duration-150">
                <div className={`p-2 rounded-lg ${getIconColor(activity.color)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.message}</p>
                  <p className="text-sm text-gray-400 truncate">{activity.details}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">{getTimeAgo(activity.time)}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;