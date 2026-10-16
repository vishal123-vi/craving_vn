import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { 
  IoRefreshOutline, 
  IoTimeOutline, 
  IoLocationOutline, 
  IoCallOutline, 
  IoPersonOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoFastFoodOutline
} from "react-icons/io5";

const RestaurantOrders = ({ activeRestaurantId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchOrders = async () => {
    if (!activeRestaurantId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/order/restaurant-orders/${activeRestaurantId}`);
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 20 seconds so new customer orders pop up automatically
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, [activeRestaurantId]);

  const handleUpdateStatus = async (orderId, newStatus, reason = "") => {
    try {
      setActionLoading(orderId);
      const res = await api.patch(`/order/restaurant-update-status/${orderId}`, {
        status: newStatus,
        rejectionReason: reason,
      });

      if (res.data?.success) {
        toast.success(`Order marked as ${newStatus}!`);
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
        );
        if (rejectModalOrder) {
          setRejectModalOrder(null);
          setRejectionReason("");
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.orderStatus === statusFilter;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      accepted: "bg-blue-100 text-blue-800 border-blue-200",
      preparing: "bg-purple-100 text-purple-800 border-purple-200",
      ready: "bg-cyan-100 text-cyan-800 border-cyan-200",
      pickedUp: "bg-indigo-100 text-indigo-800 border-indigo-200",
      onTheWay: "bg-sky-100 text-sky-800 border-sky-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      rejected: "bg-rose-100 text-rose-800 border-rose-200",
      failed: "bg-gray-100 text-gray-800 border-gray-200",
      payment_failed: "bg-red-100 text-red-800 border-red-200",
    };
    return map[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCustomerName = (order) => {
    return (
      order.deliveryAddress?.name ||
      order.customerId?.customerId?.fullName ||
      "Customer"
    );
  };

  const getCustomerPhone = (order) => {
    return (
      order.deliveryAddress?.phone ||
      order.customerId?.customerId?.phone ||
      "N/A"
    );
  };

  return (
    <div className="overflow-y-auto h-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Incoming Orders
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Manage live incoming customer orders and kitchen preparation in real-time
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
        >
          <IoRefreshOutline className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 whitespace-nowrap">
        {["all", "pending", "accepted", "preparing", "ready", "delivered", "rejected"].map(
          (tab) => {
            const count =
              tab === "all"
                ? orders.length
                : orders.filter((o) => o.orderStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? "bg-(--color-primary) text-white shadow-md shadow-orange-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab ? "bg-white/25 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="py-20 text-center text-gray-500 font-medium animate-pulse">
          Loading incoming orders from database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
          <IoFastFoodOutline className="mx-auto text-4xl text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
            No orders found
          </h3>
          <p className="text-sm text-gray-500">
            {statusFilter === "all"
              ? "No customer orders have been placed for this restaurant yet."
              : `No orders with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const customerName = getCustomerName(order);
            const customerPhone = getCustomerPhone(order);
            const formattedDate = new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "short",
            });
            const isActing = actionLoading === order._id;

            return (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Top: Order ID, Date, Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <IoTimeOutline />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Card Body: Customer details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Customer Info
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                      <IoPersonOutline className="text-(--color-primary)" />
                      {customerName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                      <IoCallOutline className="text-gray-400" />
                      {customerPhone}
                    </p>
                    {order.deliveryAddress?.address && (
                      <p className="text-xs text-gray-500 flex items-start gap-1.5 mt-2">
                        <IoLocationOutline className="text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {order.deliveryAddress.address}, {order.deliveryAddress.city}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Items Ordered */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 md:col-span-2">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                      Items Ordered ({order.orderItems?.length || 0})
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {order.orderItems?.map((it, idx) => {
                        const name = it.itemDetails?.itemName || "Menu Dish";
                        const price = it.itemDetails?.price || "";
                        return (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-xs py-1 border-b border-gray-100/60 dark:border-gray-700/40 last:border-0"
                          >
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {name}{" "}
                              <span className="text-(--color-primary) font-black">
                                × {it.quantity}
                              </span>
                            </span>
                            {price && (
                              <span className="text-gray-500 font-medium">
                                ₹{Number(price) * Number(it.quantity)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Amount, Payment, and Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Total Amount
                      </p>
                      <p className="text-xl font-black text-[#c2410c]">
                        ₹{order.billDetails?.finalAmount || 0}
                      </p>
                    </div>
                    <div className="h-7 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {order.paymentDetails?.paymentMethod || "COD"}
                      </span>
                      <span
                        className={`ml-1.5 text-[10px] font-bold ${
                          order.paymentDetails?.paymentStatus === "completed"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {order.paymentDetails?.paymentStatus === "completed"
                          ? "● Paid"
                          : "● Unpaid"}
                      </span>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {order.orderStatus === "pending" && (
                      <>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          disabled={isActing}
                          className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order._id, "accepted")}
                          disabled={isActing}
                          className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <IoCheckmarkCircleOutline className="text-base" />
                          Accept Order
                        </button>
                      </>
                    )}

                    {order.orderStatus === "accepted" && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "preparing")}
                        disabled={isActing}
                        className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <IoFastFoodOutline className="text-base" />
                        Start Preparing
                      </button>
                    )}

                    {order.orderStatus === "preparing" && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "ready")}
                        disabled={isActing}
                        className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <IoCheckmarkCircleOutline className="text-base" />
                        Ready for Pickup
                      </button>
                    )}

                    {order.orderStatus === "ready" && (
                      <span className="text-xs px-3 py-1.5 font-bold rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-200">
                        🛵 Ready for Rider Pickup
                      </span>
                    )}

                    {order.orderStatus === "delivered" && (
                      <span className="text-xs px-3 py-1.5 font-bold rounded-lg bg-green-50 text-green-700 border border-green-200">
                        ✅ Delivered
                      </span>
                    )}

                    {order.orderStatus === "rejected" && (
                      <span className="text-xs px-3 py-1.5 font-bold rounded-lg bg-red-50 text-red-700 border border-red-200">
                        ❌ Rejected {order.rejectionReason ? `(${order.rejectionReason})` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
              Reject Order #{rejectModalOrder._id.slice(-6).toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500">
              Please enter a brief reason so the customer understands why the order was cancelled.
            </p>
            <input
              type="text"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Item out of stock, Kitchen closed"
              className="w-full p-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(
                    rejectModalOrder._id,
                    "rejected",
                    rejectionReason || "Restaurant busy / out of stock"
                  )
                }
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
