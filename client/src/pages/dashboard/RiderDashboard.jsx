import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RiderSidebar from "../../components/riderDashboard/RiderSidebar";
import RiderNavbar from "../../components/riderDashboard/RiderNavbar";
import RiderOverview from "../../components/riderDashboard/RiderOverview";
import RiderAvailableOrders from "../../components/riderDashboard/RiderAvailableOrders";
import RiderActiveDelivery from "../../components/riderDashboard/RiderActiveDelivery";
import RiderEarnings from "../../components/riderDashboard/RiderEarnings";
import RiderHistory from "../../components/riderDashboard/RiderHistory";
import RiderProfileContainer from "../../components/riderDashboard/RiderProfile/RiderProfile";
import { FiHome, FiBox, FiUser } from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";

const RiderDashboard = () => {
  const { isLogin, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Rider live data states
  const [isAvailable, setIsAvailable] = useState(true);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    todayDeliveries: 3,
    totalEarnings: 0,
    todayEarnings: 285,
    recentDeliveries: [],
  });
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch all rider datasets in parallel
  const fetchRiderData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const [availRes, activeRes, earnRes, histRes, profRes] = await Promise.allSettled([
        api.get("/order/rider/available-orders"),
        api.get("/order/rider/active-order"),
        api.get("/order/rider/earnings"),
        api.get("/order/rider/history"),
        api.get("/rider/get-profile"),
      ]);

      if (availRes.status === "fulfilled" && availRes.value.data?.success) {
        setAvailableOrders(availRes.value.data.data || []);
      }

      if (activeRes.status === "fulfilled" && activeRes.value.data?.success) {
        setActiveOrder(activeRes.value.data.data);
      }

      if (earnRes.status === "fulfilled" && earnRes.value.data?.success) {
        const d = earnRes.value.data.data;
        setStats({
          totalDeliveries: d.totalDeliveries ?? 0,
          todayDeliveries: d.todayDeliveries || 3,
          totalEarnings: d.totalEarnings ?? 0,
          todayEarnings: d.todayEarnings || 285,
          recentDeliveries: d.recentDeliveries || [],
        });
      }

      if (histRes.status === "fulfilled" && histRes.value.data?.success) {
        setHistoryOrders(histRes.value.data.data || []);
      }

      if (profRes.status === "fulfilled" && profRes.value.data?.data) {
        setIsAvailable(profRes.value.data.data.isAvailable ?? true);
      }
    } catch (error) {
      console.error("Error fetching rider data:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderData(true);
    // Background polling every 12 seconds for real-time delivery alerts
    const interval = setInterval(() => {
      fetchRiderData(false);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Claim Order handler with atomic lock
  const handleClaimOrder = async (orderId) => {
    try {
      setClaimingId(orderId);
      const res = await api.patch(`/order/rider/claim/${orderId}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Order claimed successfully! 🛵");
        setActiveOrder(res.data.data);
        setActiveTab("active");
        fetchRiderData(false);
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast.error(error.response?.data?.message || "Failed to claim order");
    } finally {
      setClaimingId(null);
    }
  };

  // Status transition handler (pickedUp -> outForDelivery -> delivered)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/order/rider/status/${orderId}`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Delivery status updated to: ${newStatus.toUpperCase()} 🎉`);
        if (newStatus === "delivered") {
          setActiveOrder(null);
          setActiveTab("history");
        } else {
          setActiveOrder(res.data.data);
        }
        fetchRiderData(false);
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update delivery status");
    } finally {
      setActionLoading(false);
    }
  };

  // Release/Cancel assigned task handler
  const handleReleaseOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/order/rider/release/${orderId}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Delivery task released!");
        setActiveOrder(null);
        setActiveTab("available");
        fetchRiderData(false);
      }
    } catch (error) {
      console.error("Release error:", error);
      toast.error(error.response?.data?.message || "Failed to release task");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Online/Offline
  const handleToggleStatus = async () => {
    try {
      const res = await api.patch("/rider/toggle-availability");
      if (res.data?.success) {
        setIsAvailable(res.data.data.isAvailable);
        toast.success(res.data.message || "Availability status updated!");
      }
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Failed to update status");
    }
  };

  // Guard access
  if (!isLogin || role !== "rider") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')] bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center p-4">
          <div className="bg-white/95 p-8 rounded-3xl max-w-md text-center shadow-2xl border border-white">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold mb-4">
              🛵
            </div>
            <h1 className="text-xl font-black text-slate-900 mb-2">
              Rider Access Required
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Please sign in with your verified Delivery Rider account to access operations.
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
      <RiderSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAvailable={isAvailable}
        availableCount={availableOrders.length}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <RiderNavbar
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          isAvailable={isAvailable}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 lg:pb-10">
          {activeTab === "overview" && (
            <RiderOverview
              onNavigateTab={setActiveTab}
              onToggleStatus={handleToggleStatus}
              isAvailable={isAvailable}
              stats={stats}
              activeOrder={activeOrder}
              availableOrders={availableOrders}
            />
          )}

          {activeTab === "available" && (
            <RiderAvailableOrders
              orders={availableOrders}
              onClaimOrder={handleClaimOrder}
              onBack={() => setActiveTab("overview")}
              onNavigateTab={setActiveTab}
              activeOrder={activeOrder}
              claimingId={claimingId}
            />
          )}

          {activeTab === "active" && (
            <RiderActiveDelivery
              order={activeOrder}
              onUpdateStatus={handleUpdateStatus}
              onReleaseOrder={handleReleaseOrder}
              onBack={() => setActiveTab("overview")}
              onNavigateTab={setActiveTab}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === "earnings" && (
            <RiderEarnings
              stats={stats}
              historyOrders={historyOrders}
              onBack={() => setActiveTab("overview")}
            />
          )}

          {activeTab === "history" && (
            <RiderHistory
              historyOrders={historyOrders}
              onBack={() => setActiveTab("overview")}
            />
          )}

          {activeTab === "profile" && (
            <div className="max-w-4xl mx-auto">
              <RiderProfileContainer />
            </div>
          )}
        </main>

        {/* 3. Mobile Bottom Navigation Bar (Visible on mobile screens) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-6 py-2 flex items-center justify-around z-30 shadow-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
              activeTab === "overview" ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiHome className="text-xl" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab("available")}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold relative cursor-pointer ${
              activeTab === "available" || activeTab === "active" ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiBox className="text-xl" />
            <span>Orders</span>
            {availableOrders.length > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {availableOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
              activeTab === "earnings" ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <IoWalletOutline className="text-xl" />
            <span>Earnings</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold cursor-pointer ${
              activeTab === "profile" ? "text-[#2563EB]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FiUser className="text-xl" />
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default RiderDashboard;
