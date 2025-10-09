import React, { useState } from 'react';
import { BarChart3, Users, Settings, LogOut, Menu, X, Shield, Coins, DollarSign, Gift, Megaphone, Gamepad2, Kanban } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'hr', label: 'HR Management', icon: Users },
    { id: 'projects', label: 'Project Management', icon: Kanban },
    { id: 'chips', label: 'Chip Management', icon: Coins },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'bonuses', label: 'Bonuses', icon: Gift },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'reporting', label: 'Reporting', icon: BarChart3 },
    { id: 'admin', label: 'Admin Tools', icon: Settings },
  ];

  const handleMenuClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-40 transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Portal</h1>
              <p className="text-xs text-gray-400">User Management</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 mb-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-r-2 border-orange-500'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-orange-400' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700/50">
          <button className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-200 mb-2">
            <Settings className="w-5 h-5 mr-3 text-gray-400" />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;