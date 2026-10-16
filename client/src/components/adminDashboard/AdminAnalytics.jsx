import React from "react";
import { FiTrendingUp, FiDollarSign, FiUsers, FiShoppingBag } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const AdminAnalytics = ({ stats }) => {
  const totalRevenue = stats?.totalRevenue ? stats.totalRevenue.toLocaleString("en-IN") : "8,24,530";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Platform Analytics
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Comprehensive performance data, growth trends, and revenue metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform Sales</span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">₹ {totalRevenue}</h3>
          <span className="text-xs font-bold text-emerald-600 mt-1 block">↑ 18.4% month-over-month</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Order Value</span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">₹ 345</h3>
          <span className="text-xs font-bold text-emerald-600 mt-1 block">↑ 4.2% from last quarter</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Repeat Rate</span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">68.2%</h3>
          <span className="text-xs font-bold text-emerald-600 mt-1 block">↑ 5.1% user retention</span>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
