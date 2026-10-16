import React, { useState } from "react";
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiClock, 
  FiCheck,
  FiShoppingBag,
  FiAlertCircle,
  FiArrowRight
} from "react-icons/fi";
import { FaStore, FaUtensils, FaMotorcycle } from "react-icons/fa";
import toast from "react-hot-toast";

const RiderAvailableOrders = ({ 
  orders = [], 
  onClaimOrder, 
  onBack,
  onNavigateTab,
  activeOrder = null,
  claimingId = null 
}) => {
  const [filter, setFilter] = useState("nearby"); // 'nearby' | 'latest' | 'high_pay'

  // Filter & Sort logic
  const sortedOrders = [...orders].sort((a, b) => {
    if (filter === "latest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (filter === "high_pay") {
      const payA = a.billDetails?.finalAmount || 0;
      const payB = b.billDetails?.finalAmount || 0;
      return payB - payA;
    }
    // 'nearby' default - could use distance or createdAt
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const getDistanceText = (order, index) => {
    const distances = ["1.2 km", "2.5 km", "3.1 km", "4.2 km", "1.8 km", "2.9 km"];
    return distances[index % distances.length];
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  };

  const handleAcceptClick = (orderId) => {
    if (activeOrder) {
      toast.error("Aapka pehle se ek delivery task in progress hai! Pehle use complete karein.");
      if (onNavigateTab) {
        onNavigateTab("active");
      }
      return;
    }
    onClaimOrder(orderId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Back to Overview"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Available Orders
            </h2>
            <p className="text-xs text-slate-500">
              Claim an available delivery task near you
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
          {orders.length} Ready
        </span>
      </div>

      {/* Active Mission Alert Banner (If Rider Already Has 1 Ongoing Order) */}
      {activeOrder && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-sm shadow-amber-500/20">
              <FaMotorcycle />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                  Task In Progress
                </span>
                <span className="text-xs font-bold text-amber-900">
                  Order #CRV{activeOrder._id?.slice(-5).toUpperCase()}
                </span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-amber-950 mt-0.5">
                Pehle current delivery complete karein!
              </h4>
              <p className="text-xs text-amber-800">
                Aapka ek order abhi <span className="font-bold underline">{activeOrder.orderStatus?.toUpperCase()}</span> status me hai. System 1 time pe 1 active delivery allow karta hai.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("active")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <span>Open My Delivery</span>
            <FiArrowRight />
          </button>
        </div>
      )}

      {/* Filter Chips: [Nearby] [Latest] [High Pay] */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter("nearby")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === "nearby"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Nearby
        </button>
        <button
          onClick={() => setFilter("latest")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === "latest"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Latest
        </button>
        <button
          onClick={() => setFilter("high_pay")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === "high_pay"
              ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          High Pay
        </button>
      </div>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Orders Available Right Now
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You are all caught up! As soon as customers place orders and restaurants accept them, they will appear here live.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order, idx) => {
            const restName = order.restaurantId?.restaurantName || "Restaurant Partner";
            const itemCount = order.orderItems?.reduce((sum, i) => sum + (i.quantity || 1), 0) || order.orderItems?.length || 1;
            const amount = order.billDetails?.finalAmount || 0;
            const distance = getDistanceText(order, idx);
            const timeAgo = getTimeAgo(order.createdAt);
            const isClaimingThis = claimingId === order._id;

            return (
              <div 
                key={order._id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:border-blue-200 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left Restaurant Info */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                    <FaUtensils />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {restName}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {timeAgo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <FiMapPin className="text-xs" />
                        {distance}
                      </span>
                      <span>•</span>
                      <span>{itemCount} item{itemCount > 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-800">₹ {amount}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 truncate max-w-xs sm:max-w-md">
                      Deliver to: {order.deliveryAddress?.name || "Customer"}, {order.deliveryAddress?.city || "Bhopal"}
                    </p>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="w-full sm:w-auto flex items-center justify-end">
                  <button
                    onClick={() => handleAcceptClick(order._id)}
                    disabled={isClaimingThis}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeOrder
                        ? "bg-slate-100 hover:bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/20"
                    }`}
                  >
                    {isClaimingThis ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : activeOrder ? (
                      <>
                        <FiAlertCircle className="text-base text-amber-600" />
                        <span>Task in Progress</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="text-base" />
                        <span>Accept</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiderAvailableOrders;
