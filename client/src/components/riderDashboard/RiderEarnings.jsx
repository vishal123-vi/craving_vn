import React, { useState } from "react";
import { FiArrowLeft, FiClock, FiCheckCircle } from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { FaMotorcycle } from "react-icons/fa";

const RiderEarnings = ({ stats, historyOrders = [], onBack }) => {
  const [timeframe, setTimeframe] = useState("today"); // 'today' | 'week' | 'month'

  const todayEarnings = stats?.todayEarnings ?? 285;
  const todayDeliveries = stats?.todayDeliveries ?? 3;
  const avgPerDelivery = todayDeliveries > 0 ? Math.round(todayEarnings / todayDeliveries) : 95;
  const estimatedHours = todayDeliveries > 0 ? Math.max(1, Math.round(todayDeliveries * 0.7)) : 2;

  // Mock list or real recent deliveries from DB
  const recentOrders = stats?.recentDeliveries && stats.recentDeliveries.length > 0 
    ? stats.recentDeliveries 
    : [
        { _id: "670412342", code: "CRV12342", time: "10:15 AM", amount: 95 },
        { _id: "670412340", code: "CRV12340", time: "12:30 PM", amount: 110 },
        { _id: "670412338", code: "CRV12338", time: "02:45 PM", amount: 80 },
      ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Earnings
          </h2>
          <p className="text-xs text-slate-500">
            Track your delivery payouts and performance
          </p>
        </div>
      </div>

      {/* Big Earnings Hero Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {timeframe === "today" ? "Today's Earnings" : timeframe === "week" ? "This Week's Earnings" : "This Month's Earnings"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
              ₹ {timeframe === "today" ? todayEarnings : timeframe === "week" ? todayEarnings * 4.5 : todayEarnings * 18}
            </h1>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl shrink-0">
            <IoWalletOutline />
          </div>
        </div>

        {/* 3 Metric Chips */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-lg sm:text-xl font-black text-slate-900">
              {timeframe === "today" ? todayDeliveries : todayDeliveries * 4}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Deliveries
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-lg sm:text-xl font-black text-slate-900">
              {timeframe === "today" ? estimatedHours : estimatedHours * 4}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Hours
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <p className="text-lg sm:text-xl font-black text-slate-900">
              ₹ {avgPerDelivery}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Avg. per Delivery
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Pills: [Today] [This Week] [This Month] */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTimeframe("today")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            timeframe === "today"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeframe("week")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            timeframe === "week"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeframe("month")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            timeframe === "month"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          This Month
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Recent Delivery Payouts
        </h4>

        {recentOrders.map((item, idx) => {
          const code = item.code || `#CRV${item._id?.slice(-5).toUpperCase()}`;
          const time = item.time || new Date(item.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const payout = item.amount || item.billDetails?.deliveryCharge || 95;

          return (
            <div 
              key={item._id || idx}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
                  <FiCheckCircle />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Order {code}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Delivered • {time}
                  </p>
                </div>
              </div>

              <span className="font-black text-slate-900 text-base">
                ₹ {payout}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiderEarnings;
