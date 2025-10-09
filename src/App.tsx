import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import ChipManagement from "./components/ChipManagement";
import Revenue from "./components/Revenue";
import Bonuses from "./components/Bonuses";
import Marketing from "./components/Marketing";
import Games from "./components/Games";
import Reporting from "./components/Reporting";
import AdminTools from "./components/AdminTools";
import Login from "./components/Login";
import HRManagement from "./components/HRManagement";
import ProjectManagement from "./components/ProjectManagement";
import { supabase } from "./lib/supabase";

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log("🔐 Checking authentication...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("📱 Session found:", !!session);
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event, !!session);
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserManagement />;
      case "hr":
        return <HRManagement />;
      case "projects":
        return <ProjectManagement />;
      case "chips":
        return <ChipManagement />;
      case "revenue":
        return <Revenue />;
      case "bonuses":
        return <Bonuses />;
      case "marketing":
        return <Marketing />;
      case "games":
        return <Games />;
      case "reporting":
        return <Reporting />;
      case "admin":
        return <AdminTools />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActiveSection("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 lg:ml-64">
        <div className="p-6 min-h-screen">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;
