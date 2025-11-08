import React, { useState, useEffect } from "react";
import {
  Users,
  TrendingUp,
  Clock,
  Shield,
  ArrowUp,
  ArrowDown,
  Gamepad2,
  Award,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
console.log("🔧 ===== INITIALIZING SUPABASE CLIENT =====");

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";
console.log("🌐 Environment: Browser -", isBrowser);

// For Vite - environment variables are available directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

console.log("✅ Using Vite environment variables (import.meta.env)");
console.log("🔗 Supabase URL:", supabaseUrl ? "✅ Found" : "❌ Missing");
console.log("🔑 Supabase Key:", supabaseKey ? "✅ Found" : "❌ Missing");

if (supabaseUrl) {
  console.log("📝 Supabase URL:", supabaseUrl);
  console.log("📝 URL length:", supabaseUrl.length, "characters");
} else {
  console.error("❌ VITE_SUPABASE_URL is not set!");
}

if (supabaseKey) {
  console.log("📝 Supabase Key length:", supabaseKey.length, "characters");
  console.log("📝 Key preview:", supabaseKey.substring(0, 20) + "...");
} else {
  console.error("❌ VITE_SUPABASE_ANON_KEY is not set!");
}

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ ===== CONFIGURATION ERROR =====");
  console.error("⚠️ Supabase credentials are missing!");
  console.error("⚠️ Make sure your .env file has:");
  console.error("   VITE_SUPABASE_URL=https://xxxxx.supabase.co");
  console.error("   VITE_SUPABASE_ANON_KEY=eyJhbGc...");
  console.error("⚠️ After adding credentials, restart your dev server!");
  console.error("═══════════════════════════════════════");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Supabase client created successfully");
console.log("═══════════════════════════════════════\n");

interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface UserWallet {
  id: string;
  user_id: string;
  chips: number;
  bankroll: number;
  chips_won_total: number;
  level: number;
  experience: number;
  games_played: number;
  games_won: number;
  total_hours_played: number;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🎬 ===== COMPONENT MOUNTED =====");
    console.log("📍 Current URL:", window.location.href);
    console.log("⏰ Mount time:", new Date().toLocaleString());
    fetchData();
  }, []);

  useEffect(() => {
    console.log("🔄 ===== STATE UPDATE DETECTED =====");
    console.log("📊 Profiles state length:", profiles.length);
    console.log("💰 Wallets state length:", wallets.length);
    console.log("⏳ Loading:", loading);
    console.log("❌ Error:", error || "None");
  }, [profiles, wallets, loading, error]);

  const fetchData = async () => {
    console.log(" ===== STARTING DATA FETCH =====");
    console.log("Step 1: Initializing fetch process");
    console.log("Supabase URL:", supabaseUrl ? " Set" : "NOT SET");
    console.log("Supabase Key:", supabaseKey ? " Set" : "NOT SET");

    try {
      setLoading(true);
      setError(null);
      console.log("⏳ Loading state: TRUE");
      console.log("🧹 Error state: CLEARED");

      // Fetch profiles
      console.log("\n📊 Step 2: Fetching PROFILES table...");
      console.log("🔍 Query: SELECT * FROM profiles ORDER BY created_at DESC");

      const profilesStart = performance.now();
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      const profilesEnd = performance.now();

      console.log(
        `⏱️ Profiles fetch time: ${(profilesEnd - profilesStart).toFixed(2)}ms`
      );

      if (profilesError) {
        console.error("❌ PROFILES ERROR:", profilesError);
        console.error("❌ Error message:", profilesError.message);
        console.error("❌ Error details:", profilesError.details);
        console.error("❌ Error hint:", profilesError.hint);
        throw profilesError;
      }

      console.log("✅ Profiles fetched successfully!");
      console.log("📈 Total profiles count:", profilesData?.length || 0);
      console.log("📋 Sample profile data (first record):", profilesData?.[0]);
      console.log(
        "🔍 Profile fields:",
        profilesData?.[0] ? Object.keys(profilesData[0]) : "No data"
      );

      // Fetch user wallets
      console.log("\n💰 Step 3: Fetching USER_WALLET table...");
      console.log("🔍 Query: SELECT * FROM user_wallet");

      const walletsStart = performance.now();
      const { data: walletsData, error: walletsError } = await supabase
        .from("user_wallet")
        .select("*");
      const walletsEnd = performance.now();

      console.log(
        `⏱️ Wallets fetch time: ${(walletsEnd - walletsStart).toFixed(2)}ms`
      );

      if (walletsError) {
        console.error("❌ WALLETS ERROR:", walletsError);
        console.error("❌ Error message:", walletsError.message);
        console.error("❌ Error details:", walletsError.details);
        console.error("❌ Error hint:", walletsError.hint);
        throw walletsError;
      }

      console.log("✅ Wallets fetched successfully!");
      console.log("📈 Total wallets count:", walletsData?.length || 0);
      console.log("📋 Sample wallet data (first record):", walletsData?.[0]);
      console.log(
        "🔍 Wallet fields:",
        walletsData?.[0] ? Object.keys(walletsData[0]) : "No data"
      );

      // Set state
      console.log("\n📦 Step 4: Setting component state...");
      setProfiles(profilesData || []);
      console.log(
        "✅ Profiles state set:",
        (profilesData || []).length,
        "profiles"
      );

      setWallets(walletsData || []);
      console.log(
        "✅ Wallets state set:",
        (walletsData || []).length,
        "wallets"
      );

      // Data analysis
      console.log("\n📊 Step 5: Data Analysis...");
      const profilesWithWallets =
        profilesData?.filter((p) =>
          walletsData?.some((w) => w.user_id === p.id)
        ).length || 0;
      console.log("🔗 Profiles with matching wallets:", profilesWithWallets);
      console.log(
        "⚠️ Profiles WITHOUT wallets:",
        (profilesData?.length || 0) - profilesWithWallets
      );

      const walletsWithProfiles =
        walletsData?.filter((w) =>
          profilesData?.some((p) => p.id === w.user_id)
        ).length || 0;
      console.log("🔗 Wallets with matching profiles:", walletsWithProfiles);
      console.log(
        "⚠️ Orphaned wallets (no profile):",
        (walletsData?.length || 0) - walletsWithProfiles
      );

      console.log("\n🎉 ===== DATA FETCH COMPLETED SUCCESSFULLY =====\n");
    } catch (err: any) {
      console.error("\n💥 ===== FETCH FAILED =====");
      console.error("❌ Error type:", err.constructor.name);
      console.error("❌ Error message:", err.message);
      console.error("❌ Full error object:", err);
      console.error("❌ Stack trace:", err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("⏳ Loading state: FALSE");
      console.log("🏁 Fetch process ended\n");
    }
  };

  if (loading) {
    console.log("⏳ RENDERING: Loading screen");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4 border-t-2 border-t-transparent"></div>
          <p className="text-white text-lg">Loading Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching user analytics</p>
          <p className="text-gray-500 text-xs mt-4">
            Check console for detailed logs
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("❌ RENDERING: Error screen");
    console.error("❌ Error details:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Check console for detailed logs
          </p>
          <button
            onClick={() => {
              console.log("🔄 User clicked RETRY button");
              fetchData();
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log("✅ RENDERING: Main dashboard");

  // Calculate user metrics
  console.log("\n🧮 ===== CALCULATING USER METRICS =====");
  const totalUsers = profiles.length;
  console.log("👥 Total users:", totalUsers);

  const recentUsers = profiles.filter((profile) => {
    const createdAt = new Date(profile.created_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdAt >= sevenDaysAgo;
  }).length;
  console.log("🆕 Recent users (7 days):", recentUsers);

  const todayUsers = profiles.filter((profile) => {
    const createdAt = new Date(profile.created_at);
    return createdAt.toDateString() === new Date().toDateString();
  }).length;
  console.log("📅 Today's users:", todayUsers);

  // Calculate wallet metrics
  console.log("\n💰 ===== CALCULATING WALLET METRICS =====");
  const totalChips = wallets.reduce(
    (sum, wallet) => sum + (wallet.chips || 0),
    0
  );
  console.log("🪙 Total chips in circulation:", totalChips.toLocaleString());

  const totalChipsWon = wallets.reduce(
    (sum, wallet) => sum + (wallet.chips_won_total || 0),
    0
  );
  console.log("🏆 Total chips won:", totalChipsWon.toLocaleString());

  const totalGamesPlayed = wallets.reduce(
    (sum, wallet) => sum + (wallet.games_played || 0),
    0
  );
  console.log("🎮 Total games played:", totalGamesPlayed.toLocaleString());

  const totalGamesWon = wallets.reduce(
    (sum, wallet) => sum + (wallet.games_won || 0),
    0
  );
  console.log("✅ Total games won:", totalGamesWon.toLocaleString());

  const averageLevel =
    wallets.length > 0
      ? Math.round(
          wallets.reduce((sum, wallet) => sum + (wallet.level || 1), 0) /
            wallets.length
        )
      : 1;
  console.log("📊 Average level:", averageLevel);

  const winRate =
    totalGamesPlayed > 0 ? (totalGamesWon / totalGamesPlayed) * 100 : 0;
  console.log("🎯 Win rate:", winRate.toFixed(2) + "%");

  // Generate 30-day user registration trend
  console.log("\n📈 ===== GENERATING 30-DAY TRENDS =====");
  const generateUserTrend = (days: number = 30) => {
    console.log("📊 Generating trend for", days, "days");
    const trends = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      const dayUsers = profiles.filter((profile) => {
        const profileDate = new Date(profile.created_at);
        return profileDate.toDateString() === date.toDateString();
      });

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: dayUsers.length,
      };
    });

    const totalInPeriod = trends.reduce((sum, day) => sum + day.value, 0);
    const maxDay = Math.max(...trends.map((d) => d.value));
    console.log("📈 Total users in period:", totalInPeriod);
    console.log("📈 Peak day registrations:", maxDay);
    console.log("📈 Average per day:", (totalInPeriod / days).toFixed(2));

    return trends;
  };

  const userTrends = generateUserTrend();

  // Calculate weekly comparison
  console.log("\n📊 ===== CALCULATING WEEKLY COMPARISON =====");
  const getWeeklyComparison = () => {
    const thisWeek = profiles.filter((profile) => {
      const date = new Date(profile.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }).length;
    console.log("📅 This week:", thisWeek);

    const lastWeek = profiles.filter((profile) => {
      const date = new Date(profile.created_at);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;
    console.log("📅 Last week:", lastWeek);

    const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
    console.log("📊 Week-over-week change:", change.toFixed(2) + "%");

    return { thisWeek, lastWeek, change };
  };

  const userComparison = getWeeklyComparison();

  console.log("\n✅ ===== ALL CALCULATIONS COMPLETE =====\n");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              User Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time user metrics and platform insights
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <div className="flex items-center px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <Clock className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-sm text-gray-300">Live Data</span>
            </div>
            <button
              onClick={() => {
                console.log("🔄 ===== MANUAL REFRESH TRIGGERED =====");
                console.log("👤 User clicked refresh button");
                console.log("⏰ Refresh time:", new Date().toLocaleString());
                fetchData();
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-blue-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div
                className={`flex items-center ${
                  userComparison.change >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {userComparison.change >= 0 ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(userComparison.change).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All registered accounts
              </p>
            </div>
          </div>

          {/* New Users (7 days) */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-emerald-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-emerald-400 text-sm font-medium">
                Last 7 days
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">New Users</p>
              <p className="text-3xl font-bold text-white mt-2">
                {recentUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Recent registrations</p>
            </div>
          </div>

          {/* Total Games Played */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Games Played
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {totalGamesPlayed.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Win rate: {winRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Average Level */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-amber-500/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Average Level</p>
              <p className="text-3xl font-bold text-white mt-2">
                {averageLevel}
              </p>
              <p className="text-xs text-gray-500 mt-1">Across all users</p>
            </div>
          </div>
        </div>

        {/* User Registration Trend Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            User Registration Trends (30 Days)
          </h3>
          <div className="h-64 flex items-end space-x-1">
            {userTrends.map((item, index) => {
              const maxValue = Math.max(...userTrends.map((d) => d.value));
              const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="w-full bg-gray-700/30 rounded-t-lg flex flex-col justify-end h-48">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:opacity-80 relative shadow-lg cursor-pointer"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 z-10">
                        {item.value} users
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 mt-2 transform -rotate-45 origin-left">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Economy Stats */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Economy Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">
                    Total Chips in Circulation
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalChips.toLocaleString()}
                  </p>
                </div>
                <div className="text-4xl">🪙</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="text-sm text-gray-400">Total Chips Won</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalChipsWon.toLocaleString()}
                  </p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>
          </div>

          {/* Top Players */}
          {/* Top Players */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Top Players
            </h3>
            <div className="space-y-3">
              {wallets
                .filter((wallet) => {
                  // Filter out wallets without profiles or valid data
                  const profile = profiles.find((p) => p.id === wallet.user_id);
                  return profile && (wallet.experience || 0) > 0;
                })
                .sort((a, b) => {
                  // Sort by experience level (descending - highest first)
                  const aExp = a.experience || 0;
                  const bExp = b.experience || 0;
                  return bExp - aExp;
                })
                .slice(0, 5)
                .map((wallet, index) => {
                  const profile = profiles.find((p) => p.id === wallet.user_id);
                  return (
                    <div
                      key={wallet.user_id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {profile?.username || "Unknown User"}
                          </div>
                          <div className="text-xs text-gray-400">
                            Level {wallet.level || 1} •{" "}
                            {wallet.games_played || 0} games
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          {(wallet.experience || 0).toLocaleString()} XP
                        </div>
                        <div className="text-xs text-gray-400">experience</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Activity Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {todayUsers}
              </div>
              <div className="text-sm text-gray-400">Users Joined Today</div>
              <div className="mt-2">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                  <Clock className="w-3 h-3 mr-1" />
                  Today
                </div>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                {recentUsers}
              </div>
              <div className="text-sm text-gray-400">New Users (7 Days)</div>
              <div className="mt-2">
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    userComparison.change >= 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {userComparison.change >= 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(userComparison.change).toFixed(1)}% vs last week
                </div>
              </div>
            </div>

            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {totalGamesPlayed.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Games Played</div>
              <div className="mt-2">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  {winRate.toFixed(1)}% win rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
