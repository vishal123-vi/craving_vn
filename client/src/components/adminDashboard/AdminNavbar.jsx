import React, { useState } from "react";
import { FiMenu, FiBell, FiSearch, FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminNavbar = ({ onOpenSidebar, onSearch = () => {}, onNavigateTab }) => {
  const { user, setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");

  const notifications = [
    { id: 1, title: "New Restaurant Registered", desc: "Spice Garden submitted documentation for review.", time: "10m ago", unread: true },
    { id: 2, title: "High-Volume Order Placed", desc: "Order #8492 placed with 4 items (₹1,180).", time: "25m ago", unread: true },
    { id: 3, title: "Delivery Partner Available", desc: "Rider Rahul Sharma is online and accepting tasks.", time: "1h ago", unread: true },
  ];

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("cravingUser");
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false);
    setRole(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <FiMenu className="text-2xl" />
        </button>
      </div>

      {/* Center: Search input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users, restaurants, orders..."
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </form>

      {/* Right: Notifications & Profile dropdown */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <FiBell className="text-xl" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown (English) */}
          {notifOpen && (
            <div 
              onMouseLeave={() => setNotifOpen(false)}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="px-4 pb-2.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 px-4 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    setNotifOpen(false);
                    if (onNavigateTab) onNavigateTab("orders");
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  View all system activities →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-300 flex items-center justify-center text-white font-bold text-sm">
              {user?.photo ? (
                <img src={user.photo} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <span>👨‍💼</span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-1 font-semibold text-sm text-slate-700">
              <span>Admin</span>
              <FiChevronDown className="text-xs text-slate-400" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div 
              onMouseLeave={() => setDropdownOpen(false)}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs font-semibold text-slate-700"
            >
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (onNavigateTab) onNavigateTab("settings");
                }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <FiUser className="text-sm text-slate-400" />
                <span>Account Settings</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-red-50 text-red-600 transition-colors text-left"
              >
                <FiLogOut className="text-sm" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
