import React, { useState, useEffect } from "react";
import { 
  FaMapMarkedAlt, 
  FaPhoneAlt, 
  FaMotorcycle, 
  FaCheckCircle, 
  FaBoxOpen, 
  FaStore, 
  FaUser, 
  FaHistory,
  FaRoute
} from "react-icons/fa";
import { IoRefreshOutline, IoTimeOutline, IoLocationSharp, IoArrowForward } from "react-icons/io5";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";

const RiderOrders = () => {
  const [activeTab, setActiveTab] = useState("available"); // "active", "available", "history"
  const [activeOrder, setActiveOrder] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAllRiderData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const [activeRes, availRes, historyRes] = await Promise.allSettled([
        api.get("/order/rider/active-order"),
        api.get("/order/rider/available-orders"),
        api.get("/order/rider/history"),
      ]);

      if (activeRes.status === "fulfilled" && activeRes.value.data?.success) {
        const active = activeRes.value.data.data;
        setActiveOrder(active);
        // If rider has an active order, default to active tab
        if (active && activeTab === "available" && showLoading) {
          setActiveTab("active");
        }
      }

      if (availRes.status === "fulfilled" && availRes.value.data?.success) {
        setAvailableOrders(availRes.value.data.data || []);
      }

      if (historyRes.status === "fulfilled" && historyRes.value.data?.success) {
        setHistoryOrders(historyRes.value.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching rider orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRiderData(true);
    const interval = setInterval(() => {
      fetchAllRiderData(false);
    }, 15000); // Live poll every 15s

    return () => clearInterval(interval);
  }, []);

  const handleClaimOrder = async (orderId) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/order/rider/claim/${orderId}`);
      if (res.data?.success) {
        toast.success(res.data.message || "Task claimed! Head to restaurant for pickup. 🛵");
        setActiveOrder(res.data.data);
        setActiveTab("active");
        fetchAllRiderData(false);
      }
    } catch (error) {
      console.error("Claim error:", error);
      toast.error(error.response?.data?.message || "Failed to claim order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/order/rider/status/${orderId}`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Delivery status updated to: ${newStatus.toUpperCase()}`);
        if (newStatus === "delivered") {
          setActiveOrder(null);
          setActiveTab("history");
        } else {
          setActiveOrder(res.data.data);
        }
        fetchAllRiderData(false);
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const generateMapLink = (lat, lon) => {
    if (!lat || !lon || lat === "0" || lon === "0") return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=Two-wheeler`;
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Delivery Operations Hub
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Manage your live delivery missions, claim available orders, and track delivered tasks
          </p>
        </div>
        <button
          onClick={() => fetchAllRiderData(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh Deliveries
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "active"
              ? "bg-(--color-primary) text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <FaMotorcycle />
          <span>Active Mission</span>
          {activeOrder && (
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping absolute -top-1 -right-1"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "available"
              ? "bg-(--color-primary) text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <FaBoxOpen />
          <span>Available Orders</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-black/10 dark:bg-white/20">
            {availableOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "history"
              ? "bg-(--color-primary) text-white shadow-md shadow-orange-500/20"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
          }`}
        >
          <FaHistory />
          <span>Delivery History</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-black/10 dark:bg-white/20">
            {historyOrders.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: ACTIVE MISSION ─────────────────────────────────────────── */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {activeOrder ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-orange-200 dark:border-orange-900/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-green-500"></div>

              {/* Status Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Current Task
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-200 uppercase">
                      #{activeOrder._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
                    {activeOrder.orderStatus === "pickedUp" || activeOrder.orderStatus === "outForDelivery"
                      ? "En Route to Customer Dropoff 🛵"
                      : "Head to Restaurant for Pickup 🏪"}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500">Status:</span>
                  <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {activeOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* 2-Column: Step 1 Pickup vs Step 2 Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* 1. Restaurant Pickup Point */}
                <div className="bg-orange-50/60 dark:bg-gray-800/60 rounded-2xl p-5 border border-orange-100 dark:border-gray-700 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-(--color-primary) font-bold text-sm uppercase tracking-wide">
                      <FaStore />
                      <span>Step 1: Pickup Point</span>
                    </div>
                    {generateMapLink(
                      activeOrder.restaurantId?.geoLocation?.lat,
                      activeOrder.restaurantId?.geoLocation?.lon
                    ) && (
                      <a
                        href={generateMapLink(
                          activeOrder.restaurantId?.geoLocation?.lat,
                          activeOrder.restaurantId?.geoLocation?.lon
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors"
                      >
                        <FaRoute /> Map Direction
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                      {activeOrder.restaurantId?.restaurantName || "Restaurant Partner"}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-start gap-1">
                      <IoLocationSharp className="text-red-500 shrink-0 text-sm mt-0.5" />
                      <span>
                        {activeOrder.restaurantId?.address}, {activeOrder.restaurantId?.city}
                      </span>
                    </p>
                    {activeOrder.restaurantId?.phone && (
                      <a
                        href={`tel:${activeOrder.restaurantId.phone}`}
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FaPhoneAlt size={10} /> Call Restaurant: {activeOrder.restaurantId.phone}
                      </a>
                    )}
                  </div>

                  {/* Food Items Checklist */}
                  <div className="pt-2 border-t border-orange-100 dark:border-gray-700">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Items to Pick Up ({activeOrder.orderItems?.length || 0})
                    </p>
                    <div className="space-y-1 text-xs">
                      {activeOrder.orderItems?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                          <span>{it.itemDetails?.itemName || "Food Item"}</span>
                          <span className="font-bold text-gray-900 dark:text-white">× {it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Customer Dropoff Point */}
                <div className="bg-blue-50/60 dark:bg-gray-800/60 rounded-2xl p-5 border border-blue-100 dark:border-gray-700 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide">
                      <FaUser />
                      <span>Step 2: Dropoff Customer</span>
                    </div>
                    {generateMapLink(
                      activeOrder.deliveryAddress?.geoLocation?.lat,
                      activeOrder.deliveryAddress?.geoLocation?.lon
                    ) && (
                      <a
                        href={generateMapLink(
                          activeOrder.deliveryAddress?.geoLocation?.lat,
                          activeOrder.deliveryAddress?.geoLocation?.lon
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
                      >
                        <FaRoute /> Map Direction
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white">
                      {activeOrder.deliveryAddress?.name ||
                        activeOrder.customerId?.customerId?.fullName ||
                        "Customer"}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex items-start gap-1">
                      <IoLocationSharp className="text-blue-500 shrink-0 text-sm mt-0.5" />
                      <span>
                        {activeOrder.deliveryAddress?.address}, {activeOrder.deliveryAddress?.city}
                      </span>
                    </p>
                    {activeOrder.deliveryAddress?.phone && (
                      <a
                        href={`tel:${activeOrder.deliveryAddress.phone}`}
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FaPhoneAlt size={10} /> Call Customer: {activeOrder.deliveryAddress.phone}
                      </a>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="pt-2 border-t border-blue-100 dark:border-gray-700">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Payment Collection
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="capitalize">
                        Mode: {activeOrder.paymentDetails?.paymentMethod || "COD"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          activeOrder.paymentDetails?.paymentMethod === "cod" &&
                          activeOrder.paymentDetails?.paymentStatus !== "completed"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-green-100 text-green-800 border border-green-300"
                        }`}
                      >
                        {activeOrder.paymentDetails?.paymentMethod === "cod" &&
                        activeOrder.paymentDetails?.paymentStatus !== "completed"
                          ? `Collect Cash: ₹${activeOrder.billDetails?.finalAmount || 0}`
                          : "Paid Online ✅ (Do NOT Collect)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Progress Workflow */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="text-xs text-gray-500 font-medium">
                  Follow the sequence: <strong className="text-gray-800 dark:text-gray-200">Pick Up ➔ Out for Delivery ➔ Delivered</strong>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Action 1: Confirm Pickup */}
                  {["accepted", "preparing", "ready"].includes(activeOrder.orderStatus) && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder._id, "pickedUp")}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <FaBoxOpen />
                      <span>Confirm Order Picked Up</span>
                    </button>
                  )}

                  {/* Action 2: Out for Delivery */}
                  {activeOrder.orderStatus === "pickedUp" && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder._id, "outForDelivery")}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <FaMotorcycle />
                      <span>Start Ride (Out for Delivery)</span>
                    </button>
                  )}

                  {/* Action 3: Mark Delivered */}
                  {["pickedUp", "outForDelivery", "onTheWay"].includes(activeOrder.orderStatus) && (
                    <button
                      onClick={() => handleUpdateStatus(activeOrder._id, "delivered")}
                      disabled={actionLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-extrabold rounded-xl shadow-lg shadow-green-500/25 hover:opacity-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <FaCheckCircle />
                      <span>Mark Delivered & Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
              <FaMotorcycle className="mx-auto text-5xl text-gray-300 dark:text-gray-600 animate-bounce" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                No Active Delivery Right Now
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                You are ready to take new delivery orders! Switch to the <strong>"Available Orders"</strong> tab to claim ready food tasks.
              </p>
              <button
                onClick={() => setActiveTab("available")}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-(--color-primary) text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 hover:opacity-90 transition-opacity"
              >
                Browse Available Orders <IoArrowForward />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: AVAILABLE ORDERS TO CLAIM ───────────────────────────────── */}
      {activeTab === "available" && (
        <div className="space-y-4">
          {availableOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
              <FaBoxOpen className="mx-auto text-4xl text-gray-400" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                No Unclaimed Orders Right Now
              </h3>
              <p className="text-xs text-gray-500">
                New food delivery tasks will appear here as soon as restaurants prepare them. Auto-refreshing every 15 seconds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => {
                const restName = order.restaurantId?.restaurantName || "Restaurant";
                const custArea = order.deliveryAddress?.city || "Local Dropoff";
                const itemCount = order.orderItems?.length || 1;
                const earning = order.billDetails?.deliveryCharge > 0 ? order.billDetails.deliveryCharge : 40;

                return (
                  <div
                    key={order._id}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
                        <div>
                          <span className="font-extrabold text-gray-900 dark:text-white text-base">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-400 font-medium">
                            Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {order.orderStatus}
                        </span>
                      </div>

                      {/* Pickup & Drop Summary */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <FaStore className="text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">{restName}</p>
                            <p className="text-gray-500 text-[11px] truncate max-w-xs">{order.restaurantId?.address}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <IoLocationSharp className="text-blue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Deliver to: {order.deliveryAddress?.name || "Customer"}</p>
                            <p className="text-gray-500 text-[11px] truncate max-w-xs">{order.deliveryAddress?.address}, {custArea}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Estimated Earning & Claim Button */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          Delivery Earning
                        </p>
                        <p className="text-lg font-black text-green-600">
                          +₹{earning}
                        </p>
                      </div>

                      <button
                        onClick={() => handleClaimOrder(order._id)}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-gradient-to-r from-(--color-primary) to-orange-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        <FaMotorcycle />
                        <span>Claim Task</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: DELIVERY HISTORY ───────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {historyOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
              <FaHistory className="mx-auto text-4xl text-gray-400 mb-2" />
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                No Completed Deliveries Yet
              </h3>
              <p className="text-xs text-gray-500">
                Your successfully delivered orders will appear here along with your earnings summary.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Restaurant</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Delivered Date</th>
                      <th className="py-3.5 px-4">Payout Earned</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                    {historyOrders.map((ord) => {
                      const earning = ord.billDetails?.deliveryCharge > 0 ? ord.billDetails.deliveryCharge : 40;
                      return (
                        <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                            #{ord._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="py-3 px-4">{ord.restaurantId?.restaurantName || "Partner"}</td>
                          <td className="py-3 px-4">{ord.deliveryAddress?.name || "Customer"}</td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(ord.updatedAt || ord.createdAt).toLocaleDateString([], {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-4 font-black text-green-600">+₹{earning}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                              {ord.orderStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiderOrders;
