import React, { useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";

const RiderHistory = ({ historyOrders = [], onBack }) => {
  const [filter, setFilter] = useState("delivered"); // 'delivered' | 'cancelled'

  // Default fallback mock history if no orders in DB yet
  const defaultHistory = [
    { _id: "670412342", code: "CRV12342", status: "delivered", date: "10 Oct 2025", amount: 95 },
    { _id: "670412340", code: "CRV12340", status: "delivered", date: "10 Oct 2025", amount: 110 },
    { _id: "670412336", code: "CRV12336", status: "delivered", date: "9 Oct 2025", amount: 120 },
    { _id: "670412330", code: "CRV12330", status: "cancelled", date: "8 Oct 2025", amount: 85 },
    { _id: "670412328", code: "CRV12328", status: "delivered", date: "8 Oct 2025", amount: 100 },
  ];

  const displayList = historyOrders.length > 0 ? historyOrders : defaultHistory;

  const filteredOrders = displayList.filter(order => {
    const st = order.status || order.orderStatus;
    if (filter === "delivered") return st === "delivered";
    if (filter === "cancelled") return st === "cancelled" || st === "rejected";
    return true;
  });

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
            Delivery History
          </h2>
          <p className="text-xs text-slate-500">
            Review past delivered and closed orders
          </p>
        </div>
      </div>

      {/* Filter Tabs: [Delivered] [Cancelled] */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("delivered")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "delivered"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Delivered
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "cancelled"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-3">
          <p className="text-sm font-bold text-slate-700">No {filter} orders found</p>
          <p className="text-xs text-slate-400">Completed deliveries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((item, idx) => {
            const isDelivered = (item.status || item.orderStatus) === "delivered";
            const code = item.code || `#CRV${item._id?.slice(-5).toUpperCase()}`;
            const dateStr = item.date || new Date(item.updatedAt || Date.now()).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });
            const payout = item.amount || item.billDetails?.deliveryCharge || (isDelivered ? 95 : 0);

            return (
              <div 
                key={item._id || idx}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                    isDelivered ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}>
                    {isDelivered ? <FiCheckCircle /> : <FiXCircle />}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">
                      Order {code}
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isDelivered ? "Delivered" : "Cancelled"} • {dateStr}
                    </p>
                  </div>
                </div>

                <span className={`font-black text-base ${isDelivered ? "text-slate-900" : "text-slate-400"}`}>
                  ₹ {payout}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderHistory;
