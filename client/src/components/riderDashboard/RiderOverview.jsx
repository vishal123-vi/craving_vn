import React, { useState, useEffect } from "react";
import { 
  FiBox, 
  FiTruck, 
  FiCheckCircle, 
  FiArrowRight, 
  FiPower, 
  FiMapPin 
} from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { MdDeliveryDining, MdOutlineLocalShipping } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";

const RiderOverview = ({ onNavigateTab, onToggleStatus, isAvailable, stats, activeOrder, availableOrders = [] }) => {
  const { user } = useAuth();
  const [toggling, setToggling] = useState(false);

  const firstName = user?.fullName?.split(" ")[0] || "Vishal";

  const handleToggle = async () => {
    try {
      setToggling(true);
      await onToggleStatus();
    } finally {
      setToggling(false);
    }
  };

  const availableCount = availableOrders.length;
  const activeCount = activeOrder ? 1 : 0;
  const completedCount = stats?.todayDeliveries ?? 3;
  const todayEarnings = stats?.todayEarnings ?? 285;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Main Grid: Left 2 Columns (Content) + Right 1 Column (Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Hero Banner + 4 Bento Cards + Notification Banner */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Hero Greeting Banner */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="z-10 max-w-md">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  Hello, {firstName} 👋
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isAvailable 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {isAvailable ? "Online" : "Offline"}
                </span>
              </div>
              <p className="text-slate-500 text-sm sm:text-base font-medium">
                Ready to deliver happiness?
              </p>
            </div>

            {/* Delivery Rider on Scooter Illustration */}
            <div className="sm:shrink-0 relative w-full sm:w-60 h-28 flex items-center justify-end">
              <svg 
                viewBox="0 0 240 110" 
                className="w-full h-full max-w-[240px] drop-shadow-sm select-none"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background City Silhouette */}
                <path d="M10 85 L25 85 L25 45 L50 45 L50 85 L70 85 L70 55 L95 55 L95 85 L120 85 L120 40 L145 40 L145 85 L170 85 L170 60 L195 60 L195 85 L230 85" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7"/>
                
                {/* Road Line */}
                <line x1="0" y1="92" x2="240" y2="92" stroke="#CBD5E1" strokeWidth="2.5"/>
                <line x1="20" y1="96" x2="50" y2="96" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 6"/>
                <line x1="80" y1="96" x2="130" y2="96" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 6"/>
                <line x1="160" y1="96" x2="210" y2="96" stroke="#94A3B8" strokeWidth="2" strokeDasharray="6 6"/>

                {/* Scooter Wheels */}
                <circle cx="110" cy="85" r="14" fill="#334155" stroke="#0F172A" strokeWidth="2"/>
                <circle cx="110" cy="85" r="7" fill="#E2E8F0"/>
                <circle cx="178" cy="85" r="14" fill="#334155" stroke="#0F172A" strokeWidth="2"/>
                <circle cx="178" cy="85" r="7" fill="#E2E8F0"/>

                {/* Scooter Body (Red) */}
                <path d="M110 85 L135 85 L155 75 L175 70 L178 85" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M125 78 L142 55 L165 55" stroke="#DC2626" strokeWidth="4" strokeLinecap="round"/>
                <path d="M165 55 L160 42 L150 42" stroke="#334155" strokeWidth="3" strokeLinecap="round"/>

                {/* Rider Character */}
                {/* Legs */}
                <path d="M136 58 L148 70 L146 80" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Body (Red Jacket) */}
                <path d="M132 45 L142 60" stroke="#DC2626" strokeWidth="10" strokeLinecap="round"/>
                {/* Arms holding handle */}
                <path d="M135 48 L152 48 L158 44" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Head with Blue/Red Helmet */}
                <circle cx="138" cy="32" r="10" fill="#2563EB"/>
                <path d="M138 24 A 10 10 0 0 1 148 34 L 140 34 Z" fill="#DC2626"/>
                {/* Helmet visor */}
                <path d="M143 32 L147 34" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>

                {/* Delivery Box (Backpack on rear rack) */}
                <rect x="98" y="50" width="22" height="24" rx="4" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5"/>
                <rect x="103" y="58" width="12" height="8" rx="2" fill="#FFFFFF" opacity="0.9"/>
                {/* Fork icon miniature on box */}
                <line x1="109" y1="60" x2="109" y2="64" stroke="#DC2626" strokeWidth="1.5"/>

                {/* Speed Lines */}
                <path d="M80 62 L92 62" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M75 70 L90 70" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>
                <path d="M83 78 L93 78" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round"/>

                {/* GPS Location Pin on route */}
                <circle cx="60" cy="40" r="12" fill="#EF4444" opacity="0.15"/>
                <path d="M60 30 C56 30 53 33 53 37 C53 43 60 50 60 50 C60 50 67 43 67 37 C67 33 64 30 60 30 Z" fill="#EF4444"/>
                <circle cx="60" cy="36" r="3" fill="#FFFFFF"/>
              </svg>
            </div>
          </div>

          {/* 2. Bento KPI Cards (4 Items) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Card 1: Available Orders */}
            <div 
              onClick={() => onNavigateTab("available")}
              className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-500/15 flex items-center justify-center text-blue-600 mb-3">
                  <FiBox className="text-2xl" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Available Orders</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {availableCount}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                <span>View Orders</span>
                <FiArrowRight />
              </div>
            </div>

            {/* Card 2: Active Deliveries */}
            <div 
              onClick={() => onNavigateTab("active")}
              className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 mb-3">
                  <MdOutlineLocalShipping className="text-2xl" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Active Deliveries</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {activeCount}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                <span>Track Now</span>
                <FiArrowRight />
              </div>
            </div>

            {/* Card 3: Completed Today */}
            <div 
              onClick={() => onNavigateTab("history")}
              className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 mb-3">
                  <FiCheckCircle className="text-2xl" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Completed Today</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {completedCount}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700">
                <span>View History</span>
                <FiArrowRight />
              </div>
            </div>

            {/* Card 4: Today's Earnings */}
            <div 
              onClick={() => onNavigateTab("earnings")}
              className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-3xl p-5 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-600 mb-3">
                  <IoWalletOutline className="text-2xl" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Today's Earnings</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  ₹ {todayEarnings}
                </h3>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700">
                <span>View Details</span>
                <FiArrowRight />
              </div>
            </div>

          </div>

          {/* 3. "New Orders Available!" Notification Banner */}
          <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl shrink-0">
                🗺️
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900">
                  New Orders Available!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Check the available orders and claim the one near you.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab("available")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0 cursor-pointer"
            >
              <span>View Available Orders</span>
              <FiArrowRight />
            </button>
          </div>

        </div>

        {/* Right Rail: Quick Actions & Rider Status */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              {/* Action 1 */}
              <button
                onClick={() => onNavigateTab("available")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                    <FiBox className="text-xl" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 group-hover:text-blue-600">
                    View Available Orders
                  </span>
                </div>
                <FiArrowRight className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Action 2 */}
              <button
                onClick={() => onNavigateTab("active")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                    <MdOutlineLocalShipping className="text-xl" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 group-hover:text-emerald-600">
                    My Deliveries
                  </span>
                </div>
                <FiArrowRight className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Action 3 */}
              <button
                onClick={() => onNavigateTab("earnings")}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                    <IoWalletOutline className="text-xl" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 group-hover:text-amber-600">
                    Earnings
                  </span>
                </div>
                <FiArrowRight className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Rider Status Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Rider Status
            </h3>

            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span className="font-bold text-sm text-slate-800">
                {isAvailable ? "Online" : "Offline"}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-5">
              {isAvailable 
                ? "You are available for new deliveries." 
                : "You are currently offline. Go online to receive order alerts."}
            </p>

            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                isAvailable
                  ? "bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-xs"
                  : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
              }`}
            >
              <FiPower className="text-base" />
              <span>{isAvailable ? "Go Offline" : "Go Online"}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RiderOverview;
