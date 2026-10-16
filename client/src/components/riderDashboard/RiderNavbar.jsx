import React, { useState } from "react";
import { FiMenu, FiBell } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const RiderNavbar = ({ onOpenSidebar, isAvailable = true }) => {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    { id: 1, title: "New Orders Nearby", desc: "A customer placed an order 1.2km from your current location.", time: "3m ago" },
    { id: 2, title: "High Demand Area", desc: "Hostel Zone & Campus Gate are experiencing peak orders right now.", time: "15m ago" },
  ];

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    toast.success("All notifications marked as read");
  };

  return (
    <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Hamburger menu toggle for mobile & tablet */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <FiMenu className="text-2xl" />
        </button>
      </div>

      {/* Right: Notification Bell & Profile Avatar */}
      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Notifications Icon with Red Badge */}
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
              className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="px-4 pb-2.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Delivery Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Mark as read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
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
            </div>
          )}
        </div>

        {/* Small User Avatar */}
        <div className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-200">
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-sm">
              {user?.photo ? (
                <img src={user.photo} alt={user?.fullName || "User"} className="w-full h-full object-cover" />
              ) : (
                <span>{(user?.fullName || "V").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span 
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                isAvailable ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          </div>
          <span className="hidden md:inline-block font-semibold text-sm text-slate-700">
            {user?.fullName?.split(" ")[0] || "Vishal"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default RiderNavbar;
