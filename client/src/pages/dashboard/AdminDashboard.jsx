import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "../../components/adminDashboard/AdminSidebar";
import AdminNavbar from "../../components/adminDashboard/AdminNavbar";
import AdminOverview from "../../components/adminDashboard/AdminOverview";
import AdminUsers from "../../components/adminDashboard/AdminUsers";
import AdminRestaurants from "../../components/adminDashboard/AdminRestaurants";
import AdminOrders from "../../components/adminDashboard/AdminOrders";
import AdminMessages from "../../components/adminDashboard/AdminMessages";
import AdminFeedback from "../../components/adminDashboard/AdminFeedback";
import AdminAnalytics from "../../components/adminDashboard/AdminAnalytics";
import AdminSetting from "../../components/adminDashboard/AdminSetting";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard-stats");
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Admin stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (!isLogin || role !== "admin") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')] bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center p-4">
          <div className="bg-white/95 p-8 rounded-3xl max-w-md text-center shadow-2xl border border-white">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold mb-4">
              🛡️
            </div>
            <h1 className="text-xl font-black text-slate-900 mb-2">
              Admin Access Required
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Please sign in with platform administrator credentials to view this page.
            </p>
            <button
              className="w-full py-3 bg-[#E53935] hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* 1. Left Sidebar (Fixed on Desktop, Off-canvas on Mobile) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <AdminNavbar
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateTab={setActiveTab}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-16">
          {activeTab === "overview" && (
            <AdminOverview
              stats={stats}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "users" && (
            <AdminUsers />
          )}

          {activeTab === "restaurants" && (
            <AdminRestaurants />
          )}

          {activeTab === "orders" && (
            <AdminOrders />
          )}

          {activeTab === "messages" && (
            <AdminMessages />
          )}

          {activeTab === "feedback" && (
            <AdminFeedback />
          )}

          {activeTab === "analytics" && (
            <AdminAnalytics stats={stats} />
          )}

          {activeTab === "settings" && (
            <AdminSetting />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
