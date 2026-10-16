import React, { useState } from "react";
import { 
  FiArrowLeft, 
  FiPhone, 
  FiMapPin, 
  FiClock, 
  FiCheckCircle, 
  FiNavigation,
  FiShoppingBag,
  FiUser,
  FiXCircle
} from "react-icons/fi";
import { FaStore, FaMotorcycle, FaCheck } from "react-icons/fa";
import { MdOutlineDeliveryDining } from "react-icons/md";
import toast from "react-hot-toast";

const RiderActiveDelivery = ({ 
  order, 
  onUpdateStatus, 
  onReleaseOrder,
  onBack, 
  onNavigateTab,
  actionLoading = false 
}) => {
  const [subView, setSubView] = useState("details"); // 'details' | 'track'
  const [releasing, setReleasing] = useState(false);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Deliveries
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-3xl">
            🛵
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Active Delivery Mission
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You don't have any ongoing deliveries right now. Check available orders and accept a delivery mission to get started!
          </p>
          <button
            onClick={() => onNavigateTab("available")}
            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            View Available Orders
          </button>
        </div>
      </div>
    );
  }

  const orderIdShort = `#CRV${order._id.slice(-5).toUpperCase()}`;
  const status = order.orderStatus || "ready";
  const restName = order.restaurantId?.restaurantName || "Restaurant";
  const restPhone = order.restaurantId?.phone || "9876543210";
  const restAddress = order.restaurantId?.address || "Commercial Zone, Main Road";
  
  const customerName = order.deliveryAddress?.name || order.customerId?.customerId?.fullName || "Customer";
  const customerPhone = order.deliveryAddress?.phone || order.customerId?.customerId?.phone || "9123456789";
  const customerAddress = `${order.deliveryAddress?.address || "Street Address"}, ${order.deliveryAddress?.city || "Bhopal"}${order.deliveryAddress?.pincode ? ` - ${order.deliveryAddress.pincode}` : ""}`;

  const items = order.orderItems || [];
  const totalAmount = order.billDetails?.finalAmount || 320;

  // Status mapping
  const isPickedUp = ["pickedUp", "outForDelivery", "onTheWay", "delivered"].includes(status);
  const isOutForDelivery = ["outForDelivery", "onTheWay", "delivered"].includes(status);
  const isDelivered = status === "delivered";

  // Google Maps directions link
  const openMaps = () => {
    const destination = encodeURIComponent(customerAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
  };

  const handleRelease = async () => {
    if (!window.confirm("Kya aap sach me is task ko cancel / release karna chahte hain taaki doosra rider ise accept kar sake?")) {
      return;
    }
    try {
      setReleasing(true);
      if (onReleaseOrder) {
        await onReleaseOrder(order._id);
      }
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Order {orderIdShort}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isOutForDelivery
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : isPickedUp
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-blue-50 text-blue-600 border border-blue-200"
              }`}>
                ● {status === "outForDelivery" || status === "onTheWay" ? "On the Way" : status === "pickedUp" ? "Picked Up" : "Ready for Pickup"}
              </span>
            </div>
            <p className="text-xs text-slate-500">Live Delivery Mission</p>
          </div>
        </div>

        {/* View Toggle (Details vs Track) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubView("details")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subView === "details"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Order Details
          </button>
          <button
            onClick={() => setSubView("track")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subView === "track"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Track Route
          </button>
        </div>
      </div>

      {/* Main 2-Column or Single-Column View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT COLUMN: Order Details */}
        <div className={`space-y-4 ${subView === "track" ? "hidden md:block" : "block"}`}>
          
          {/* Restaurant Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                <FaStore />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {restName}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <FiMapPin className="text-xs text-blue-500" />
                  <span>1.2 km • 15 mins</span>
                </p>
              </div>
            </div>

            <a
              href={`tel:${restPhone}`}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center justify-center shrink-0"
              title="Call Restaurant"
            >
              <FiPhone className="text-base" />
            </a>
          </div>

          {/* Order Items Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Order Items
            </h4>

            <div className="divide-y divide-slate-100">
              {items.map((item, i) => {
                const name = item.itemDetails?.name || item.name || `Dish #${i + 1}`;
                const qty = item.quantity || 1;
                const price = item.itemDetails?.price || item.price || 140;

                return (
                  <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-medium">
                      {qty}x {name}
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹ {price * qty}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                Total Amount
              </span>
              <span className="font-black text-slate-900 text-base">
                ₹ {totalAmount}
              </span>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shrink-0 mt-0.5">
                <FiUser />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {customerName}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px] sm:max-w-xs leading-relaxed">
                  {customerAddress}
                </p>
              </div>
            </div>

            <a
              href={`tel:${customerPhone}`}
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center justify-center shrink-0"
              title="Call Customer"
            >
              <FiPhone className="text-base" />
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN: Stepper Timeline & Route Preview */}
        <div className={`space-y-4 ${subView === "details" ? "hidden md:block" : "block"}`}>
          
          {/* Stepper Timeline Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Delivery Progress
            </h4>

            <div className="space-y-6 relative pl-6 border-l-2 border-slate-100">
              
              {/* Step 1: Picked Up */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  isPickedUp ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : "bg-slate-300"
                }`}>
                  <FaCheck className="text-[10px]" />
                </span>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Picked Up
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {order.pickupTime ? new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "12:30 PM"} • Restaurant: {restName}
                  </p>
                </div>
              </div>

              {/* Step 2: Out for Delivery */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  isOutForDelivery ? "bg-emerald-500 shadow-sm shadow-emerald-500/30" : isPickedUp ? "bg-blue-600 animate-pulse" : "bg-slate-300"
                }`}>
                  {isOutForDelivery ? <FaCheck className="text-[10px]" /> : <FaMotorcycle className="text-[10px]" />}
                </span>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Out for Delivery
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {order.outForDeliveryTime ? new Date(order.outForDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "12:45 PM"} • Rider on the way
                  </p>
                </div>
              </div>

              {/* Step 3: Delivered */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                  isDelivered ? "bg-emerald-500" : "bg-slate-200 text-slate-400"
                }`}>
                  <FaCheck className="text-[10px]" />
                </span>
                <div>
                  <h5 className={`font-bold text-sm ${isDelivered ? "text-slate-900" : "text-slate-400"}`}>
                    Delivered
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isDelivered ? "Successfully handed over to customer" : "Pending delivery handover"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Stylized Route Map Preview */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 overflow-hidden relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <FiNavigation className="text-blue-600" />
                <span>Route Preview (2.1 km)</span>
              </span>
              <button
                onClick={openMaps}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                Open in Google Maps
              </button>
            </div>

            {/* Stylized SVG Road Map Illustration */}
            <div className="w-full h-36 bg-slate-200/70 rounded-2xl relative overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 300 120" className="w-full h-full">
                {/* City Blocks background grid */}
                <rect x="20" y="15" width="60" height="40" rx="4" fill="#E2E8F0" opacity="0.6"/>
                <rect x="100" y="15" width="80" height="40" rx="4" fill="#E2E8F0" opacity="0.6"/>
                <rect x="200" y="15" width="70" height="40" rx="4" fill="#E2E8F0" opacity="0.6"/>
                
                <rect x="30" y="75" width="70" height="35" rx="4" fill="#E2E8F0" opacity="0.6"/>
                <rect x="120" y="75" width="60" height="35" rx="4" fill="#E2E8F0" opacity="0.6"/>
                <rect x="200" y="75" width="80" height="35" rx="4" fill="#E2E8F0" opacity="0.6"/>

                {/* S-curve route path */}
                <path 
                  d="M 50 65 Q 110 65 140 40 T 240 65" 
                  fill="none" 
                  stroke="#2563EB" 
                  strokeWidth="5" 
                  strokeLinecap="round"
                />

                {/* Distance Label Badge on route */}
                <rect x="125" y="28" width="46" height="18" rx="9" fill="#2563EB"/>
                <text x="148" y="41" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                  2.1 km
                </text>

                {/* Restaurant Pin (Origin) */}
                <circle cx="50" cy="65" r="8" fill="#F97316"/>
                <circle cx="50" cy="65" r="4" fill="#FFFFFF"/>

                {/* Scooter Moving Icon */}
                <circle cx="150" cy="53" r="10" fill="#2563EB" opacity="0.2"/>
                <circle cx="150" cy="53" r="7" fill="#2563EB"/>
                <circle cx="150" cy="53" r="3" fill="#FFFFFF"/>

                {/* Customer Pin (Destination) */}
                <circle cx="240" cy="65" r="9" fill="#EF4444"/>
                <circle cx="240" cy="65" r="4" fill="#FFFFFF"/>
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-auto flex items-center gap-2">
          {/* Contact Customer Button */}
          <a
            href={`tel:${customerPhone}`}
            className="flex-1 sm:flex-initial py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FiPhone className="text-base text-emerald-600" />
            <span>Contact Customer</span>
          </a>

          {/* Release / Cancel Task button */}
          <button
            onClick={handleRelease}
            disabled={releasing || actionLoading}
            className="py-3 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Release this task so other riders can claim it"
          >
            {releasing ? (
              <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiXCircle className="text-base" />
                <span>Release Task</span>
              </>
            )}
          </button>
        </div>

        {/* Primary Milestone Action Buttons */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          {!isPickedUp ? (
            <button
              onClick={() => onUpdateStatus(order._id, "pickedUp")}
              disabled={actionLoading}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {actionLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FaStore />
                  <span>Mark as Picked Up</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full sm:w-auto flex items-center gap-2">
              {!isOutForDelivery && (
                <button
                  onClick={() => onUpdateStatus(order._id, "outForDelivery")}
                  disabled={actionLoading}
                  className="py-3 px-5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <FaMotorcycle />
                  <span>Start Delivery</span>
                </button>
              )}

              <button
                onClick={() => onUpdateStatus(order._id, "delivered")}
                disabled={actionLoading}
                className="py-3 px-6 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheckCircle className="text-lg" />
                    <span>Mark as Delivered</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderActiveDelivery;
