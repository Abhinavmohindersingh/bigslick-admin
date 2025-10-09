import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, Users, Coins, DollarSign, FileText, Filter, Eye } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { GameResult, PurchaseHistory, Profile } from '../lib/supabase';

const Reporting: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');
  const [showExportModal, setShowExportModal] = useState(false);

  const { data: gameResults } = useSupabaseData<GameResult & { profiles: Profile }>(
    'game_results',
    `*, profiles!fk_game_results_user_id(username, email)`
  );

  const { data: purchases } = useSupabaseData<PurchaseHistory & { profiles: Profile }>(
    'purchase_history',
    `*, profiles!purchase_history_user_id_fkey(username, email)`
  );

  const { data: profiles } = useSupabaseData<Profile>('profiles');

  // Calculate report metrics
  const getDateFilteredData = (data: any[], days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return data.filter(item => new Date(item.created_at) >= cutoff);
  };

  const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 365;
  const filteredGames = getDateFilteredData(gameResults, days);
  const filteredPurchases = getDateFilteredData(purchases, days);

  const reports = [
    {
      id: 'overview',
      name: 'Platform Overview',
      description: 'High-level metrics and KPIs',
      icon: BarChart3,
      metrics: {
        users: profiles.length,
        games: filteredGames.length,
        revenue: filteredPurchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0),
        conversion: filteredPurchases.length > 0 ? (filteredPurchases.length / profiles.length * 100) : 0
      }
    },
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'User engagement and behavior analysis',
      icon: Users,
      metrics: {
        activeUsers: new Set(filteredGames.map(g => g.user_id)).size,
        avgSessionTime: filteredGames.reduce((sum, g) => sum + (g.game_duration_minutes || 0), 0) / filteredGames.length || 0,
        retention: 85.2,
        newUsers: getDateFilteredData(profiles, days).length
      }
    },
    {
      id: 'financial',
      name: 'Financial Report',
      description: 'Revenue, transactions, and financial metrics',
      icon: DollarSign,
      metrics: {
        totalRevenue: filteredPurchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0),
        avgTransaction: filteredPurchases.length > 0 ? filteredPurchases.reduce((sum, p) => sum + Number(p.price_paid || 0), 0) / filteredPurchases.length : 0,
        chipsAwarded: filteredPurchases.reduce((sum, p) => sum + Number(p.chips_awarded || 0), 0),
        transactions: filteredPurchases.length
      }
    },
    {
      id: 'game-performance',
      name: 'Game Performance',
      description: 'Game statistics and player behavior',
      icon: Coins,
      metrics: {
        totalGames: filteredGames.length,
        winRate: filteredGames.length > 0 ? (filteredGames.filter(g => g.result_type === 'win').length / filteredGames.length * 100) : 0,
        avgBet: filteredGames.reduce((sum, g) => sum + Number(g.chips_bet || 0), 0) / filteredGames.length || 0,
        totalWinnings: filteredGames.reduce((sum, g) => sum + Number(g.chips_won || 0), 0)
      }
    }
  ];

  const selectedReportData = reports.find(r => r.id === selectedReport);

  const exportReport = (format: string) => {
    const reportData = {
      report: selectedReportData?.name,
      dateRange,
      generatedAt: new Date().toISOString(),
      metrics: selectedReportData?.metrics,
      rawData: selectedReport === 'financial' ? filteredPurchases : 
                selectedReport === 'game-performance' ? filteredGames : 
                selectedReport === 'user-activity' ? profiles : 
                { games: filteredGames, purchases: filteredPurchases, users: profiles }
    };

    const filename = `${selectedReport}-report-${dateRange}-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Simple CSV export for metrics
      const csvData = Object.entries(selectedReportData?.metrics || {})
        .map(([key, value]) => `${key},${value}`)
        .join('\n');
      
      const blob = new Blob([`Metric,Value\n${csvData}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reporting & Analytics</h1>
          <p className="text-gray-400 mt-2">Generate comprehensive reports and export data</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-800/70 hover:border-gray-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-orange-400' : 'text-gray-400'}`} />
                {isSelected && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
              </div>
              <h3 className="font-semibold mb-2">{report.name}</h3>
              <p className={`text-sm ${isSelected ? 'text-orange-300' : 'text-gray-400'}`}>
                {report.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Report Details */}
      {selectedReportData && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <selectedReportData.icon className="w-6 h-6 text-orange-400 mr-3" />
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedReportData.name}</h3>
                <p className="text-gray-400">{selectedReportData.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {dateRange.replace('days', ' days').replace('1year', '1 year')}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(selectedReportData.metrics).map(([key, value]) => (
              <div key={key} className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-400 capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-2xl font-bold text-white">
                  {typeof value === 'number' 
                    ? key.includes('Rate') || key.includes('retention') || key.includes('conversion')
                      ? `${value.toFixed(1)}%`
                      : key.includes('Revenue') || key.includes('Transaction') || key.includes('avg')
                      ? `$${value.toLocaleString()}`
                      : value.toLocaleString()
                    : value
                  }
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-400">
                    {dateRange.replace('days', 'd').replace('1year', '1y')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Data Preview */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-4">Data Preview</h4>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">
                Showing recent data for {selectedReportData.name.toLowerCase()}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedReport === 'financial' && filteredPurchases.slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-sm text-white">
                      {purchase.profiles?.username || 'Unknown'} - ${Number(purchase.price_paid).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                
                {selectedReport === 'game-performance' && filteredGames.slice(0, 5).map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-sm text-white">
                      {game.game_type} - {game.result_type} ({game.chips_won} chips)
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(game.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                
                {selectedReport === 'user-activity' && profiles.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-gray-600/30 rounded">
                    <span className="text-sm text-white">
                      {user.username || user.email || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                ))}
                
                {selectedReport === 'overview' && (
                  <div className="text-sm text-gray-400">
                    Overview report combines data from all sources. Use export to get detailed breakdown.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Export Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                <div className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-lg">
                  {selectedReportData?.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <div className="text-sm text-white bg-gray-700/50 px-3 py-2 rounded-lg">
                  {dateRange.replace('days', ' days').replace('1year', '1 year')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => exportReport('json')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </button>
                  <button
                    onClick={() => exportReport('csv')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </button>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-700">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporting;