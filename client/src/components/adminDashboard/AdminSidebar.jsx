import React from "react";
import { 
  MdDashboard, 
  MdOutlineStorefront, 
  MdOutlineAnalytics 
} from "react-icons/md";
import { 
  FiUsers, 
  FiShoppingBag, 
  FiMail, 
  FiStar, 
  FiSettings, 
  FiLogOut, 
  FiX 
} from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
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
      id: "users",
      label: "Users",
      icon: <FiUsers className="text-xl" />,
    },
    {
      id: "restaurants",
      label: "Restaurants",
      icon: <MdOutlineStorefront className="text-xl" />,
    },
    {
      id: "orders",
      label: "Orders",
      icon: <FiShoppingBag className="text-xl" />,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <FiMail className="text-xl" />,
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: <FiStar className="text-xl" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <MdOutlineAnalytics className="text-xl" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <FiSettings className="text-xl" />,
    },
  ];

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

          {/* Admin Profile Snippet */}
          <div className="px-6 py-5 flex items-center gap-3.5 border-b border-slate-800/60">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-lg">
                {user?.photo ? (
                  <img src={user.photo} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white">
                    👨‍💼
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0B132B] bg-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate max-w-[140px]">
                {user?.fullName || "Admin"}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[140px]">
                Platform Administrator
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
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
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
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

export default AdminSidebar;
