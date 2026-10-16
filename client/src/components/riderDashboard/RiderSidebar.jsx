import React from "react";
import { 
  MdDashboard, 
  MdOutlineDeliveryDining, 
  MdHistory,
  MdOutlineLocalShipping 
} from "react-icons/md";
import { FiBox, FiClock, FiUser, FiLogOut, FiX } from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { FaMotorcycle, FaUtensils } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RiderSidebar = ({ 
  activeTab, 
  setActiveTab, 
  isAvailable = true, 
  availableCount = 0,
  isMobileOpen = false,
  setIsMobileOpen = () => {}
}) => {
  const { user, setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("cravingUser");
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false);
    setRole(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: <MdDashboard className="text-xl" />,
    },
    {
      id: "available",
      label: "Available Orders",
      icon: <FiBox className="text-xl" />,
      badge: availableCount > 0 ? availableCount : null,
    },
    {
      id: "active",
      label: "My Deliveries",
      icon: <MdOutlineDeliveryDining className="text-2xl" />,
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: <IoWalletOutline className="text-xl" />,
    },
    {
      id: "history",
      label: "Delivery History",
      icon: <FiClock className="text-xl" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <FiUser className="text-xl" />,
    },
  ];

  const displayName = user?.fullName || "Vishal Kumar";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-[#0B132B] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("overview")}>
              <div className="w-9 h-9 rounded-full bg-[#E53935] flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <FaUtensils className="text-base" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Cravings
              </span>
            </div>
            {/* Close button on mobile */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Rider Profile Snippet */}
          <div className="px-6 py-5 flex items-center gap-3.5 border-b border-slate-800/60">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-lg">
                {user?.photo ? (
                  <img src={user.photo} alt="Rider" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                    🛵
                  </div>
                )}
              </div>
              <span 
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0B132B] ${
                  isAvailable ? "bg-emerald-500" : "bg-slate-500"
                }`}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Rider
              </span>
              <span className="text-sm font-bold text-white truncate max-w-[140px]">
                {displayName}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                {isAvailable ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default RiderSidebar;
