import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { useSupabaseData } from "../hooks/useSupabaseData";
import { supabase, Profile } from "../lib/supabase";

// Extended Profile interface with is_active
interface ExtendedProfile extends Profile {
  is_active?: boolean;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedProfile | null>(
    null
  );
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Fetch profiles (confirmed users)
  const {
    data: users,
    loading,
    error,
    refetch,
  } = useSupabaseData<ExtendedProfile>("profiles", "*");

  // Also fetch wallet data to show user stats
  const { data: wallets } = useSupabaseData<any>("user_wallet", "*");

  console.log("👥 UserManagement - Profiles data:", users?.length, "users");
  console.log("👥 UserManagement - Loading:", loading);
  console.log("👥 UserManagement - Error:", error);
  console.log("💰 Wallet data:", wallets?.length, "wallets");
  console.log("👥 Raw users data:", users);
  console.log("💰 Raw wallets data:", wallets);

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get wallet data for a user
  const getUserWallet = (userId: string) => {
    return wallets.find((w) => w.user_id === userId);
  };

  const handleAddUser = async (formData: FormData) => {
    try {
      // Create user in profiles table
      const { data, error } = await supabase.from("profiles").insert([
        {
          username: formData.get("username") as string,
          email: formData.get("email") as string,
          is_active: true, // New users are active by default
        },
      ]);

      if (error) throw error;
      refetch();
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding user:", err);
      alert("Failed to add user. Please try again.");
    }
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
  const handleToggleUserAccess = async (
    userId: string,
    currentStatus: boolean
  ) => {
    const action = currentStatus ? "pause" : "restore";
    if (!confirm(`Are you sure you want to ${action} this user's access?`))
      return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user access. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-4">Error loading users: {error}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
        >
          Retry Loading Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            User Management
          </h1>
          <p className="text-gray-400 mt-2">
            Manage {users.length} registered users
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 flex items-center justify-center text-gray-300">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedUsers.map((user) => {
          const username =
            user.username || user.email?.split("@")[0] || "Unknown";
          const isActive = user.is_active !== false; // Default to true if undefined
          const wallet = getUserWallet(user.id);

          return (
            <div
              key={user.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {username.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {username}
                    </div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {isActive ? "Active" : "Paused"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-gray-400">Level</div>
                  <div className="text-sm font-medium text-white">
                    Level {wallet?.level || 1}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Experience</div>
                  <div className="text-sm font-medium text-white">
                    {wallet?.experience?.toLocaleString() || "0"} XP
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Chips</div>
                  <div className="text-sm font-medium text-white">
                    {wallet?.chips?.toLocaleString() || "0"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Games</div>
                  <div className="text-sm text-white">
                    {wallet?.games_played || 0}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserDetails(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleToggleUserAccess(user.id, isActive)}
                  className={`px-3 py-2 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Restore
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30 border-b border-gray-600/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Chips
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Games
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedUsers.map((user) => {
                const wallet = getUserWallet(user.id);
                const username =
                  user.username || user.email?.split("@")[0] || "Unknown";
                const isActive = user.is_active !== false; // Default to true if undefined

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-700/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {username.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {username}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white truncate max-w-xs">
                        {user.email || "No email"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isActive ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white whitespace-nowrap">
                        Level {wallet?.level || 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white whitespace-nowrap">
                        {wallet?.chips?.toLocaleString() || "0"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">
                        {wallet?.games_played || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors duration-150"
                          title="View Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleUserAccess(user.id, isActive)
                          }
                          className={`p-2 rounded-lg transition-colors duration-150 ${
                            isActive
                              ? "text-yellow-400 hover:bg-yellow-500/20"
                              : "text-green-400 hover:bg-green-500/20"
                          }`}
                          title={isActive ? "Pause Access" : "Restore Access"}
                        >
                          {isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-12 text-center">
          <div className="text-gray-400">
            {users.length === 0 ? (
              <div>
                <p className="text-lg mb-2">No users found in profiles</p>
                <p className="text-sm">Check console for debugging info</p>
              </div>
            ) : (
              <div>
                <p className="text-lg mb-2">No users match your search</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add New User
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleAddUser(formData);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                  placeholder="user@example.com"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">User Details</h3>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white break-words">
                  {selectedUser.username ||
                    selectedUser.email?.split("@")[0] ||
                    "No username"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white break-words">
                  {selectedUser.email || "No email"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Status
                </label>
                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
                  {selectedUser.is_active !== false ? "Active" : "Paused"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID
                </label>
                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white break-all text-sm">
                  {selectedUser.id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Created
                </label>
                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleString()
                    : "Unknown"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Updated
                </label>
                <div className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white">
                  {selectedUser.updated_at
                    ? new Date(selectedUser.updated_at).toLocaleString()
                    : "Never updated"}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-700">
              <button
                onClick={() => setShowUserDetails(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleToggleUserAccess(
                    selectedUser.id,
                    selectedUser.is_active !== false
                  );
                  setShowUserDetails(false);
                }}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedUser.is_active !== false
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {selectedUser.is_active !== false
                  ? "Pause Access"
                  : "Restore Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
