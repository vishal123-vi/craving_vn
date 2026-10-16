import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/ApiConfig";
import toast from "react-hot-toast";
import {
  IoArrowBack,
  IoCallOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoLocationOutline,
  IoRestaurantOutline,
  IoBicycleOutline,
  IoHomeOutline,
  IoRefreshOutline,
  IoCloseCircleOutline,
  IoCopyOutline,
  IoReceiptOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import ReceiptModal from "../components/payment/ReceiptModal";

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [receiptData, setReceiptData] = useState(null);

  // Poll timer reference
  const pollIntervalRef = useRef(null);

  const fetchOrder = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      const res = await api.get(`/order/track/${orderId}`);
      if (res.data?.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error("Order tracking fetch error:", err);
      if (isManualRefresh || loading) {
        toast.error(err.response?.data?.message || "Could not retrieve order tracking data.");
      }
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      pollIntervalRef.current = setInterval(() => {
        fetchOrder(false);
      }, 7000); // Poll every 7 seconds
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const res = await api.patch(`/order/cancel/${orderId}`, { reason: cancelReason });
      if (res.data?.success) {
        toast.success("Order has been cancelled.");
        setShowCancelModal(false);
        fetchOrder(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard!");
  };

  const handleOpenReceipt = () => {
    if (!order) return;
    setReceiptData({
      razorpay_order_id: order.paymentDetails?.razorpayOrderId || `ORD_${order._id.substring(0, 8)}`,
      razorpay_payment_id: order.paymentDetails?.razorpayPaymentId || (order.paymentDetails?.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"),
      amount: order.billDetails?.finalAmount || 0,
      items: order.orderItems?.map((oi) => ({
        item: {
          itemName: oi.itemDetails?.itemName || oi.itemId?.itemName || "Food Item",
          price: oi.itemDetails?.price || oi.itemId?.price || 0,
        },
        quantity: oi.quantity,
      })),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4EB] dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-700 dark:text-gray-300">Connecting to Live Tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F6F4EB] dark:bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Could not locate tracking information for #{orderId}.</p>
        <button
          onClick={() => navigate("/customer-dashboard", { state: { activeTab: "orders" } })}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
        >
          Go to My Orders
        </button>
      </div>
    );
  }

  const status = order.orderStatus || "pending";
  const isCancelled = ["cancelled", "rejected", "failed", "payment_failed"].includes(status);
  const isDelivered = status === "delivered";

  // Map status to progress step index (0 to 4)
  const getStepIndex = (st) => {
    switch (st) {
      case "pending":
        return 0;
      case "accepted":
      case "preparing":
        return 1;
      case "ready":
      case "pickedUp":
        return 2;
      case "onTheWay":
      case "outForDelivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(status);

  const steps = [
    { id: 0, title: "Order Placed", desc: "Received by restaurant", icon: IoReceiptOutline },
    { id: 1, title: "Kitchen Prep", desc: "Chef is preparing your meal", icon: IoRestaurantOutline },
    { id: 2, title: "Food Ready", desc: "Packed & waiting for rider", icon: IoCheckmarkCircle },
    { id: 3, title: "On The Way", desc: "Rider is heading to your door", icon: IoBicycleOutline },
    { id: 4, title: "Delivered", desc: "Enjoy your hot meal!", icon: IoHomeOutline },
  ];

  // Cancellation rule: only before preparation
  const canCancel = ["pending", "accepted"].includes(status);

  // Approximate ETA Calculation
  const getEtaText = () => {
    if (isCancelled) return "Order Cancelled";
    if (isDelivered) return "Order Delivered";
    if (status === "pending") return "35 - 45 mins";
    if (status === "accepted" || status === "preparing") return "25 - 35 mins";
    if (status === "ready" || status === "pickedUp") return "15 - 20 mins";
    if (status === "onTheWay" || status === "outForDelivery") return "8 - 12 mins";
    return "30 mins";
  };

  const isPaid = order.paymentDetails?.paymentStatus === "completed";
  const isCod = order.paymentDetails?.paymentMethod === "cod";
  const bill = order.billDetails || {};
  const restaurant = order.restaurantId || {};
  const rider = order.riderId || null;

  return (
    <div className="min-h-screen bg-[#F6F4EB] dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/customer-dashboard", { state: { activeTab: "orders" } })}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 hover:text-orange-600 transition"
              title="Back to Orders"
            >
              <IoArrowBack size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  Order Tracking
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-900">
                  #{order._id.substring(0, 8).toUpperCase()}
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className="text-gray-400 hover:text-orange-500 transition"
                  title="Copy Full ID"
                >
                  <IoCopyOutline size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition"
              title="Refresh tracking status"
            >
              <IoRefreshOutline size={16} className={refreshing ? "animate-spin text-orange-500" : ""} />
              <span>{refreshing ? "Updating..." : "Live Sync"}</span>
            </button>

            <button
              onClick={handleOpenReceipt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition"
            >
              <IoReceiptOutline size={16} />
              <span>Receipt</span>
            </button>
          </div>
        </div>

        {/* Live ETA Hero Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
          isCancelled
            ? "bg-gradient-to-r from-red-600 to-rose-700"
            : isDelivered
              ? "bg-gradient-to-r from-emerald-600 to-teal-700"
              : "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"
        }`}>
          {/* Subtle Background Pattern */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>{isCancelled ? "Cancelled" : isDelivered ? "Delivered" : "Live Delivery Status"}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                {isCancelled
                  ? "Order has been cancelled"
                  : isDelivered
                    ? "Order Delivered Successfully!"
                    : `Estimated Arrival: ${getEtaText()}`}
              </h2>
              <p className="text-white/90 text-sm mt-1 max-w-lg">
                {isCancelled
                  ? "This order was cancelled. If you made an online payment, a refund has been initiated."
                  : isDelivered
                    ? "Thank you for dining with Cravings! Rate your meal below."
                    : `Delivering hot food from ${restaurant.restaurantName || "the restaurant"} straight to your address.`}
              </p>
            </div>

            {/* Quick Action in Banner */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2"
              >
                <IoCloseCircleOutline size={18} />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Timeline */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs mb-8 flex items-center justify-between">
            <span>Order Milestone Timeline</span>
            <span className="text-orange-500 font-extrabold capitalize text-sm">{status}</span>
          </h3>

          {isCancelled ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <IoAlertCircleOutline size={30} />
              </div>
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-400 text-lg">Order Cancelled</h4>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                  This order was cancelled and will not be prepared or delivered.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Desktop Horizontal Stepper */}
              <div className="hidden md:flex justify-between items-start relative">
                {/* Background Line */}
                <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-800 -z-0"></div>
                {/* Active Line */}
                <div
                  className="absolute top-6 left-8 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700 -z-0"
                  style={{ width: `${Math.min(100, (currentStep / (steps.length - 1)) * 100)}%` }}
                ></div>

                {steps.map((step) => {
                  const isDone = currentStep >= step.id;
                  const isCurrent = currentStep === step.id;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center text-center relative z-10 w-32">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                          isDone
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/30 scale-105"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-orange-200 dark:ring-orange-950 animate-pulse" : ""}`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className={`text-xs font-black mt-3 leading-tight ${
                        isDone ? "text-gray-900 dark:text-white" : "text-gray-400"
                      }`}>
                        {step.title}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-[110px]">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden space-y-6">
                {steps.map((step, idx) => {
                  const isDone = currentStep >= step.id;
                  const isCurrent = currentStep === step.id;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      {idx < steps.length - 1 && (
                        <div
                          className={`absolute top-10 left-5 w-0.5 h-10 ${
                            currentStep > step.id ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-800"
                          }`}
                        ></div>
                      )}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 z-10 ${
                          isDone
                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-orange-100 dark:ring-orange-950" : ""}`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-bold ${isDone ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live Route Map Simulation */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IoLocationOutline className="text-orange-500" size={20} />
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Live Route View</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">Bhopal Transit Zone</span>
          </div>

          {/* Interactive Simulated Map Canvas */}
          <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-100 via-gray-100 to-stone-200 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 p-6 flex flex-col justify-between overflow-hidden">
            {/* Grid Lines to simulate map streets */}
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
              backgroundImage: "linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }}></div>

            {/* Simulated Route Path Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 120 70 Q 250 140, 480 180 T 750 200"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-[dash_20s_linear_infinite]"
              />
            </svg>

            {/* Restaurant Marker (Top Left) */}
            <div className="relative z-10 inline-flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-orange-200 dark:border-gray-700 max-w-xs self-start">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <IoRestaurantOutline size={18} />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-orange-600 block leading-tight">Pick-up</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                  {restaurant.restaurantName || "Restaurant Kitchen"}
                </span>
              </div>
            </div>

            {/* Moving Rider Marker (Center / Dynamic) */}
            {!isCancelled && !isDelivered && (
              <div className="relative z-10 self-center inline-flex items-center gap-2 bg-orange-600 text-white px-3.5 py-1.5 rounded-full shadow-xl shadow-orange-500/30 animate-bounce">
                <IoBicycleOutline size={20} />
                <span className="text-xs font-bold">Rider en route</span>
              </div>
            )}

            {/* Destination Marker (Bottom Right) */}
            <div className="relative z-10 inline-flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-green-200 dark:border-gray-700 max-w-xs self-end">
              <div className="w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                <IoHomeOutline size={18} />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-green-600 block leading-tight">Delivery Pin</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                  {order.deliveryAddress?.address || "Your Address"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Info Section: Partner & Order Bill */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Delivery Partner / Restaurant Info */}
          <div className="space-y-4">
            {/* Rider Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Delivery Partner
              </h3>

              {rider ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center font-black text-xl">
                      🛵
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">
                        {rider.name || "Assigned Delivery Executive"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {rider.vehicleDetails?.vehicleNumber || "Hero Splendor • MP-04-AB-1234"}
                      </p>
                    </div>
                  </div>

                  <a
                    href="tel:+919876543210"
                    className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg shadow-green-500/20 transition flex items-center justify-center"
                    title="Call Delivery Partner"
                  >
                    <IoCallOutline size={20} />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <IoTimeOutline size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Assigning closest rider...</p>
                    <p className="text-xs">A delivery partner will be connected shortly.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Restaurant Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Restaurant Partner
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {restaurant.restaurantName || "Restaurant"}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {restaurant.address}, {restaurant.city}
                  </p>
                  {restaurant.phone && (
                    <p className="text-xs text-orange-600 font-semibold mt-1">📞 {restaurant.phone}</p>
                  )}
                </div>
                {restaurant._id && (
                  <Link
                    to={`/restaurant-details/${restaurant._id}`}
                    className="text-xs font-bold text-orange-500 hover:underline"
                  >
                    View Menu
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Order & Bill Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Bill Summary ({order.orderItems?.length || 0} items)
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isPaid
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200"
                    : isCod
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200"
                }`}>
                  {isPaid ? "Paid Online (Verified)" : isCod ? "Pay on Delivery" : "Payment Pending"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-sm custom-scrollbar">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-xs sm:text-sm">
                      {item.quantity}x {item.itemDetails?.itemName || item.itemId?.itemName || "Food Item"}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      ₹{(item.itemDetails?.price || item.itemId?.price || 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 text-xs space-y-1.5 text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹{bill.totalAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹{bill.taxAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">₹{bill.platformFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {bill.deliveryCharge === 0 ? "FREE" : `₹${bill.deliveryCharge}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-bold text-base text-gray-900 dark:text-white">Grand Total</span>
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{bill.finalAmount || 0}</span>
            </div>

            <button
              onClick={() =>
                setReceiptData({
                  order_id: order._id,
                  razorpay_order_id: order.paymentDetails?.razorpayOrderId || order._id,
                  razorpay_payment_id:
                    order.paymentDetails?.razorpayPaymentId ||
                    (order.paymentDetails?.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"),
                  payment_status: order.paymentDetails?.paymentStatus || "pending",
                  amount: bill.finalAmount || 0,
                  items: order.orderItems?.map((item) => ({
                    quantity: item.quantity,
                    item: {
                      itemName:
                        item.itemDetails?.itemName ||
                        item.itemId?.itemName ||
                        "Food Item",
                      price:
                        item.itemDetails?.price ||
                        item.itemId?.price ||
                        0,
                    },
                  })),
                })
              }
              className="mt-4 w-full py-2.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl font-bold text-xs border border-orange-200 dark:border-orange-800 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <IoReceiptOutline size={16} />
              <span>Download Invoice / PDF Receipt</span>
            </button>
          </div>
        </div>

      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cancel This Order?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to cancel order #{order._id.substring(0, 8)}? Cancellation is only allowed before the kitchen starts preparation.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (e.g., ordered by mistake, placed wrong items)..."
              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-orange-500 mb-4"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
    </div>
  );
};

export default OrderTracking;
