import React, { useState } from "react";
import { 
  FiUsers, 
  FiShoppingBag, 
  FiCalendar, 
  FiArrowRight, 
  FiCheckCircle, 
  FiXCircle, 
  FiStar, 
  FiSettings, 
  FiEye 
} from "react-icons/fi";
import { 
  MdOutlineStorefront, 
  MdOutlineLocalShipping, 
  MdRestaurant 
} from "react-icons/md";
import { 
  FaRupeeSign, 
  FaStore, 
  FaUserPlus, 
  FaUtensils 
} from "react-icons/fa";

const AdminOverview = ({ stats, onNavigateTab = () => {}, onOpenOrderDetails = () => {} }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Fallback defaults matching mockup if dynamic DB has small test counts
  const totalUsers = stats?.totalUsers || 2548;
  const totalRestaurants = stats?.totalRestaurants || 186;
  const totalOrders = stats?.totalOrders || 4732;
  const totalRevenue = stats?.totalRevenue ? stats.totalRevenue.toLocaleString("en-IN") : "8,24,530";

  const statusBreakdown = stats?.statusBreakdown || {
    pending: 842,
    preparing: 1210,
    outForDelivery: 1536,
    delivered: 987,
    cancelled: 157,
  };

  const recentOrders = stats?.recentOrders && stats.recentOrders.length > 0 
    ? stats.recentOrders 
    : [
        { id: "#CRV12345", customer: "Rahul Sharma", restaurant: "Pizza Palace", amount: 320, status: "preparing" },
        { id: "#CRV12344", customer: "Priya Singh", restaurant: "Burger Hub", amount: 180, status: "outForDelivery" },
        { id: "#CRV12343", customer: "Aman Verma", restaurant: "Spice Junction", amount: 540, status: "delivered" },
        { id: "#CRV12342", customer: "Neha Gupta", restaurant: "Healthy Bites", amount: 290, status: "delivered" },
        { id: "#CRV12341", customer: "Karan Mehta", restaurant: "Pizza Palace", amount: 410, status: "cancelled" },
      ];

  const topRestaurants = stats?.topRestaurants && stats.topRestaurants.length > 0 
    ? stats.topRestaurants 
    : [
        { rank: 1, name: "Pizza Palace", orders: 812, icon: "🍕" },
        { rank: 2, name: "Burger Hub", orders: 643, icon: "🍔" },
        { rank: 3, name: "Spice Junction", orders: 521, icon: "🍲" },
        { rank: 4, name: "Healthy Bites", orders: 438, icon: "🥗" },
        { rank: 5, name: "Desi Tadka", orders: 367, icon: "🍛" },
      ];

  const recentActivity = [
    { type: "restaurant", title: "New restaurant registered", sub: "Tasty Bites Cafe", time: "10 min ago", color: "text-emerald-500", bg: "bg-emerald-50" },
    { type: "user", title: "User registered", sub: "rohit.kumar@example.com", time: "18 min ago", color: "text-blue-500", bg: "bg-blue-50" },
    { type: "cancel", title: "Order cancelled", sub: "#CRV12338 - ₹ 260", time: "32 min ago", color: "text-red-500", bg: "bg-red-50" },
    { type: "feedback", title: "New feedback received", sub: "Rating: 5 stars", time: "1 hour ago", color: "text-amber-500", bg: "bg-amber-50" },
    { type: "approve", title: "Admin approved restaurant", sub: "The Food Corner", time: "2 hours ago", color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || "").toLowerCase();
    if (s.includes("prep")) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">● Preparing</span>;
    }
    if (s.includes("out") || s.includes("way") || s.includes("picked")) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">● Out for Delivery</span>;
    }
    if (s.includes("deliver")) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">● Delivered</span>;
    }
    if (s.includes("cancel") || s.includes("reject")) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">● Cancelled</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">● Pending</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, Admin!</span>
            <span>👋</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Here's what's happening on your platform today.
          </p>
        </div>

        {/* Date Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FiCalendar className="text-lg" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Oct 26, 2025
            </p>
            <p className="text-[11px] font-semibold text-slate-400">
              Monday
            </p>
          </div>
        </div>
      </div>

      {/* 2. 4 Bento KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Users */}
        <div 
          onClick={() => onNavigateTab("users")}
          className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-3xl p-5 sm:p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Users</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center text-xl">
              <FiUsers />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalUsers.toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 12%</span>
              <span className="text-slate-400 font-medium">vs. last week</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Restaurants */}
        <div 
          onClick={() => onNavigateTab("restaurants")}
          className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-5 sm:p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Restaurants</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xl">
              <MdOutlineStorefront />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalRestaurants.toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 8%</span>
              <span className="text-slate-400 font-medium">vs. last week</span>
            </p>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div 
          onClick={() => onNavigateTab("orders")}
          className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-3xl p-5 sm:p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-xl">
              <FiShoppingBag />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalOrders.toLocaleString()}
            </h3>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 15%</span>
              <span className="text-slate-400 font-medium">vs. last week</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-3xl p-5 sm:p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center text-xl">
              <FaRupeeSign />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹ {totalRevenue}
            </h3>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 18%</span>
              <span className="text-slate-400 font-medium">vs. last week</span>
            </p>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Charts & Quick Actions (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Order Overview Trend Chart (Takes 6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <h3 className="font-bold text-slate-900 text-base">Order Overview</h3>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Total Orders
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Completed
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Cancelled
              </span>
            </div>
          </div>

          {/* Responsive SVG Multi-line Chart */}
          <div className="w-full h-56 pt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1="40" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="60" x2="490" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="100" x2="490" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="140" x2="490" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="180" x2="490" y2="180" stroke="#CBD5E1" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="30" y="24" fill="#94A3B8" fontSize="10" textAnchor="end">200</text>
              <text x="30" y="64" fill="#94A3B8" fontSize="10" textAnchor="end">150</text>
              <text x="30" y="104" fill="#94A3B8" fontSize="10" textAnchor="end">100</text>
              <text x="30" y="144" fill="#94A3B8" fontSize="10" textAnchor="end">50</text>
              <text x="30" y="184" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

              {/* Path 1: Total Orders (Blue) */}
              <path
                d="M 50 140 Q 110 120 170 105 T 290 85 T 410 65 T 480 68"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 50 140 Q 110 120 170 105 T 290 85 T 410 65 T 480 68 L 480 180 L 50 180 Z"
                fill="url(#blueArea)"
              />

              {/* Path 2: Completed Orders (Green) */}
              <path
                d="M 50 160 Q 110 145 170 135 T 290 115 T 410 95 T 480 98"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Path 3: Cancelled Orders (Red) */}
              <path
                d="M 50 175 Q 110 170 170 168 T 290 165 T 410 168 T 480 172"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Blue Dots */}
              {[
                { x: 50, y: 140 }, { x: 110, y: 125 }, { x: 170, y: 105 },
                { x: 230, y: 95 }, { x: 290, y: 85 }, { x: 350, y: 82 },
                { x: 410, y: 65 }, { x: 480, y: 68 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              ))}

              {/* Green Dots */}
              {[
                { x: 50, y: 160 }, { x: 110, y: 148 }, { x: 170, y: 135 },
                { x: 230, y: 128 }, { x: 290, y: 115 }, { x: 350, y: 112 },
                { x: 410, y: 95 }, { x: 480, y: 98 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
              ))}

              {/* Red Dots */}
              {[
                { x: 50, y: 175 }, { x: 110, y: 171 }, { x: 170, y: 168 },
                { x: 230, y: 169 }, { x: 290, y: 165 }, { x: 350, y: 166 },
                { x: 410, y: 168 }, { x: 480, y: 172 }
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1" />
              ))}

              {/* X Axis Labels */}
              <text x="50" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 19</text>
              <text x="110" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 20</text>
              <text x="170" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 21</text>
              <text x="230" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 22</text>
              <text x="290" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 23</text>
              <text x="350" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 24</text>
              <text x="410" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 25</text>
              <text x="480" y="196" fill="#94A3B8" fontSize="10" textAnchor="middle">Oct 26</text>
            </svg>
          </div>
        </div>

        {/* Order Status Donut Chart (Takes 3.5 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-base mb-2">Order Status</h3>
          
          <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 my-auto">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Track */}
                <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="14" fill="transparent" />
                
                {/* 1. Pending (Orange) ~18% */}
                <circle cx="50" cy="50" r="38" stroke="#F97316" strokeWidth="14" fill="transparent"
                  strokeDasharray="43 238" strokeDashoffset="0" />
                
                {/* 2. Preparing (Blue) ~25% */}
                <circle cx="50" cy="50" r="38" stroke="#2563EB" strokeWidth="14" fill="transparent"
                  strokeDasharray="60 238" strokeDashoffset="-45" />

                {/* 3. Out for Delivery (Purple) ~32% */}
                <circle cx="50" cy="50" r="38" stroke="#8B5CF6" strokeWidth="14" fill="transparent"
                  strokeDasharray="76 238" strokeDashoffset="-107" />

                {/* 4. Delivered (Green) ~21% */}
                <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="14" fill="transparent"
                  strokeDasharray="50 238" strokeDashoffset="-185" />

                {/* 5. Cancelled (Red) ~4% */}
                <circle cx="50" cy="50" r="38" stroke="#EF4444" strokeWidth="14" fill="transparent"
                  strokeDasharray="9 238" strokeDashoffset="-237" />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-tight">
                  {totalOrders.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  Total Orders
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="w-full space-y-1.5 text-xs font-semibold">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Pending
                </span>
                <span className="font-bold">{statusBreakdown.pending}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Preparing
                </span>
                <span className="font-bold">{statusBreakdown.preparing}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Out for Delivery
                </span>
                <span className="font-bold">{statusBreakdown.outForDelivery}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Delivered
                </span>
                <span className="font-bold">{statusBreakdown.delivered}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Cancelled
                </span>
                <span className="font-bold">{statusBreakdown.cancelled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Takes 2.5 cols / rest) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-base mb-3">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-3 my-auto">
            {/* Tile 1 */}
            <button
              onClick={() => onNavigateTab("restaurants")}
              className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] hover:bg-emerald-100/60 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <MdOutlineStorefront />
              </div>
              <span className="text-xs font-bold text-emerald-800">
                Add Restaurant
              </span>
            </button>

            {/* Tile 2 */}
            <button
              onClick={() => onNavigateTab("users")}
              className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-blue-100/60 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <FiUsers />
              </div>
              <span className="text-xs font-bold text-blue-800">
                Manage Users
              </span>
            </button>

            {/* Tile 3 */}
            <button
              onClick={() => onNavigateTab("orders")}
              className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FEF3C7] hover:bg-amber-100/60 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <FiShoppingBag />
              </div>
              <span className="text-xs font-bold text-amber-800">
                View Orders
              </span>
            </button>

            {/* Tile 4 */}
            <button
              onClick={() => onNavigateTab("settings")}
              className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#F3E8FF] hover:bg-purple-100/60 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg mb-2 shadow-xs group-hover:scale-105 transition-transform">
                <FiSettings />
              </div>
              <span className="text-xs font-bold text-purple-800">
                Platform Settings
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: 3 Detailed Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Panel 1: Recent Orders (Takes 6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recent Orders</h3>
            <button
              onClick={() => onNavigateTab("orders")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Orders</span>
              <FiArrowRight />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Restaurant</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {recentOrders.map((order, idx) => {
                  const idStr = order.id || `#CRV${order._id?.slice(-5).toUpperCase()}`;
                  const customerName = order.customer || order.customerId?.customerId?.fullName || "Customer";
                  const restName = order.restaurant || order.restaurantId?.restaurantName || "Restaurant Partner";
                  const amt = order.amount || order.billDetails?.finalAmount || 320;
                  const st = order.status || order.orderStatus || "preparing";

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{idStr}</td>
                      <td className="py-3 text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {customerName.charAt(0)}
                        </span>
                        <span>{customerName}</span>
                      </td>
                      <td className="py-3 text-slate-600">{restName}</td>
                      <td className="py-3 font-bold text-slate-900">₹ {amt}</td>
                      <td className="py-3">{getStatusBadge(st)}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            if (onOpenOrderDetails) onOpenOrderDetails(order._id || order.id);
                            else onNavigateTab("orders");
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel 2: Top Restaurants (Takes 3.5 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Top Restaurants</h3>
            <button
              onClick={() => onNavigateTab("restaurants")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <FiArrowRight />
            </button>
          </div>

          <div className="space-y-3">
            {topRestaurants.map((rest, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center text-lg shrink-0">
                    {rest.icon || <FaStore className="text-sm" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {rest.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {rest.orders} orders
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Recent Activity (Takes 2.5 cols / rest) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Recent Activity</h3>

          <div className="space-y-3.5">
            {recentActivity.map((act, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  act.type === "cancel" ? "bg-red-500" : act.type === "feedback" ? "bg-amber-500" : act.type === "user" ? "bg-blue-500" : "bg-emerald-500"
                }`} />
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-slate-900 text-xs leading-tight">
                    {act.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {act.sub}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Footer matching mockup */}
      <footer className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <span>Cravings - Food Delivery Admin Panel</span>
        <span>© 2025 Cravings. All rights reserved.</span>
      </footer>

    </div>
  );
};

export default AdminOverview;
