import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSetting from "../../components/adminDashboard/AdminSetting";
import Sidebar from "../../components/Sidebar";
import AdminOverview from "../../components/adminDashboard/AdminOverview";
import AdminOrders from "../../components/adminDashboard/AdminOrders";
import AdminRestaurants from "../../components/adminDashboard/AdminRestaurants";
import { MdDashboard, MdRestaurant } from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";

const AdminDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard size={20} /> },
    { name: "Orders", value: "orders", icon: <FaShoppingCart size={20} /> },
    { name: "Restaurants", value: "restaurants", icon: <MdRestaurant size={20} /> },
  ];
  const settingsTab = { name: "Settings", value: "settings", icon: <IoMdSettings size={20} /> };

  if (!isLogin || role !== "admin") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')]  bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center ">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as an Admin to view this page.
          </h1>
          <button
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden relative">
      {/* Mobile Header for Hamburger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 shrink-0 shadow-sm">
        <span className="font-bold text-xl text-gray-800 dark:text-white">Admin Dashboard</span>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-(--color-primary) hover:bg-gray-200 transition-colors"
        >
          {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`
        fixed lg:relative top-[64px] lg:top-0 left-0 h-[calc(100vh-64px)] lg:h-full shrink-0 z-50
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsMobileSidebarOpen(false); }}
          mainTabs={mainTabs}
          settingsTab={settingsTab}
          subtitle="Admin Panel"
        />
      </div>

      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden top-[64px]"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 bg-(--color-base-100) p-4 rounded-2xl shadow-xl h-full overflow-y-auto w-full">
        {activeTab === "overview" && <AdminOverview />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "restaurants" && <AdminRestaurants />}
        {activeTab === "settings" && <AdminSetting />}
      </div>
    </div>
  );
};

export default AdminDashboard;
