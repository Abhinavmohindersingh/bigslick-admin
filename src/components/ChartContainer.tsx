import React from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { GameResult, PurchaseHistory } from '../lib/supabase';

const ChartContainer: React.FC = () => {
  const { data: gameResults, loading: gamesLoading } = useSupabaseData<GameResult>('game_results');
  const { data: purchases, loading: purchasesLoading } = useSupabaseData<PurchaseHistory>('purchase_history');

  if (gamesLoading || purchasesLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Generate data for the last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthGames = gameResults.filter(game => {
      const gameDate = new Date(game.created_at);
      return gameDate >= monthStart && gameDate <= monthEnd;
    });
    
    const monthPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.created_at);
      return purchaseDate >= monthStart && purchaseDate <= monthEnd;
    });
    
    const revenue = monthPurchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0);
    const chipsAwarded = monthPurchases.reduce((sum, p) => sum + Number(p.chips_awarded || 0), 0);
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      games: monthGames.length,
      chips: Math.floor(chipsAwarded / 1000), // Convert to thousands for display
      revenue: Math.floor(revenue)
    };
  }).reverse();

  const maxValue = Math.max(...chartData.map(item => Math.max(item.games, item.chips, item.revenue)));

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Platform Analytics</h3>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Games</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Chips (K)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span className="text-xs text-gray-300">Revenue ($)</span>
          </div>
        </div>
      </div>

      <div className="h-80 flex items-end space-x-4 px-4">
        {chartData.map((item, index) => (
          <div key={item.month} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-end space-x-1 h-60">
              {/* Games bar */}
              <div className="flex-1 bg-gray-700/30 rounded-t-lg flex flex-col justify-end">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 relative group shadow-lg"
                  style={{ height: `${maxValue > 0 ? (item.games / maxValue) * 100 : 0}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                    {item.games} games
                  </div>
                </div>
              </div>
              
              {/* Chips bar */}
              <div className="flex-1 bg-gray-700/30 rounded-t-lg flex flex-col justify-end">
                <div 
                  className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-emerald-500 relative group shadow-lg"
                  style={{ height: `${maxValue > 0 ? (item.chips / maxValue) * 100 : 0}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                    {item.chips}K chips
                  </div>
                </div>
              </div>
              
              {/* Revenue bar */}
              <div className="flex-1 bg-gray-700/30 rounded-t-lg flex flex-col justify-end">
                <div 
                  className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 hover:from-amber-600 hover:to-amber-500 relative group shadow-lg"
                  style={{ height: `${maxValue > 0 ? (item.revenue / maxValue) * 100 : 0}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700">
                    ${item.revenue}
                  </div>
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-300 mt-2">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {gameResults.length.toLocaleString()}
            </div>
            <div className="text-gray-400">Total Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {Math.floor(purchases.reduce((sum, p) => sum + Number(p.chips_awarded || 0), 0) / 1000)}K
            </div>
            <div className="text-gray-400">Chips Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              ${purchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-400">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;