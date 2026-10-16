import React, { useState, useEffect } from "react";
import { 
  FiShoppingBag, 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiRefreshCw, 
  FiChevronLeft, 
  FiChevronRight, 
  FiAlertCircle, 
  FiX, 
  FiUser, 
  FiMapPin, 
  FiPhone, 
  FiCreditCard 
} from "react-icons/fi";
import api from "../../config/ApiConfig";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/orders", {
        params: {
          page,
          limit: 10,
          status: filterStatus !== "all" ? filterStatus : undefined,
          search: debouncedSearch || undefined,
        },
      });

      if (res.data?.success) {
        setOrders(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
      setError(err.response?.data?.message || "Failed to fetch orders from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus, debouncedSearch]);

  const getStatusBadge = (statusStr) => {
    const s = (statusStr || "").toLowerCase();
    if (s.includes("prep")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Preparing
        </span>
      );
    }
    if (s.includes("out") || s.includes("way") || s.includes("picked") || s.includes("ready")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Out for Delivery
        </span>
      );
    }
    if (s.includes("deliver")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Delivered
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("reject") || s.includes("fail")) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Cancelled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1.5 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Pending
      </span>
    );
  };

  const getPaymentBadge = (paymentDetails) => {
    const status = paymentDetails?.paymentStatus || "pending";
    const method = (paymentDetails?.paymentMethod || "COD").toUpperCase();
    if (status === "completed") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Paid ({method})
        </span>
      );
    }
    if (status === "failed") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
          Failed
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        Pending ({method})
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Orders Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitor real-time food orders across all platform restaurants
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh orders"
          >
            <FiRefreshCw className={`text-sm ${loading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            {total} Total Orders
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "Pending" },
            { id: "prep", label: "Preparing" },
            { id: "out", label: "Out for Delivery" },
            { id: "deliver", label: "Delivered" },
            { id: "cancel", label: "Cancelled" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilterStatus(f.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterStatus === f.id
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID, customer, restaurant..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-base shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-xs font-medium text-slate-500">Loading orders from server...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            <FiShoppingBag />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            {filterStatus !== "all" || debouncedSearch
              ? "No orders matched your current filters. Try resetting status or clearing search."
              : "No orders have been recorded in the platform database yet."}
          </p>
          {(filterStatus !== "all" || debouncedSearch) && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setSearchTerm("");
              }}
              className="mt-2 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Restaurant</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {orders.map((order) => {
                const orderCode = `#CRV${(order._id || "").slice(-5).toUpperCase()}`;
                const customerName =
                  order.customerId?.customerId?.fullName ||
                  order.deliveryAddress?.name ||
                  "Customer";
                const restaurantName =
                  order.restaurantId?.restaurantName || "Restaurant Partner";
                const amount = order.billDetails?.finalAmount || 0;

                return (
                  <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 font-mono">
                      {orderCode}
                    </td>
                    <td className="py-3.5 text-slate-800 font-semibold">
                      {customerName}
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {restaurantName}
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      ₹ {amount}
                    </td>
                    <td className="py-3.5">
                      {getPaymentBadge(order.paymentDetails)}
                    </td>
                    <td className="py-3.5">
                      {getStatusBadge(order.orderStatus)}
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
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
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-xs text-xs font-medium text-slate-600">
          <div>
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl border border-slate-200 transition-colors ${
                page === 1
                  ? "opacity-40 cursor-not-allowed bg-slate-50"
                  : "hover:bg-slate-100 text-slate-800 cursor-pointer"
              }`}
            >
              <FiChevronLeft />
            </button>
            <span className="font-bold text-slate-900 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={`p-2 rounded-xl border border-slate-200 transition-colors ${
                page >= totalPages
                  ? "opacity-40 cursor-not-allowed bg-slate-50"
                  : "hover:bg-slate-100 text-slate-800 cursor-pointer"
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Order Modal View */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    Order Details
                  </h3>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    #CRV{(selectedOrder._id || "").slice(-5).toUpperCase()}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Status & Payment Overview */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Order Status</span>
                <div className="mt-1">{getStatusBadge(selectedOrder.orderStatus)}</div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Payment Status</span>
                <div className="mt-1">{getPaymentBadge(selectedOrder.paymentDetails)}</div>
              </div>
            </div>

            {/* Parties Info */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <FiUser className="text-slate-400" /> Customer
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedOrder.customerId?.customerId?.fullName || selectedOrder.deliveryAddress?.name || "Customer"}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5 flex items-start gap-1">
                    <FiMapPin className="shrink-0 mt-0.5 text-slate-400" />
                    <span>
                      {selectedOrder.deliveryAddress?.address || "Address"}, {selectedOrder.deliveryAddress?.city}
                    </span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <FiShoppingBag className="text-slate-400" /> Restaurant
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedOrder.restaurantId?.restaurantName || "Restaurant Partner"}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {selectedOrder.restaurantId?.address || "Restaurant address"}
                  </p>
                </div>
              </div>

              {/* Rider Info if assigned */}
              {selectedOrder.riderId && (
                <div className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block mb-1">
                    Assigned Delivery Rider
                  </span>
                  <p className="font-bold text-slate-900">
                    {selectedOrder.riderId?.fullName || "Assigned Rider"}
                  </p>
                  {selectedOrder.riderId?.phone && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Phone: {selectedOrder.riderId.phone}
                    </p>
                  )}
                </div>
              )}

              {/* Items Ordered */}
              <div>
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block mb-2">
                  Order Items ({selectedOrder.orderItems?.length || 0})
                </span>
                <div className="divide-y divide-slate-100 bg-slate-50/40 rounded-2xl border border-slate-100 overflow-hidden">
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                          {item.quantity}×
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          {item.name || "Food Item"}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-700 text-xs">
                        ₹ {(item.price || 0) * (item.quantity || 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 border border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹ {selectedOrder.billDetails?.totalAmount || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span>₹ {selectedOrder.billDetails?.deliveryCharge || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee</span>
                  <span>₹ {selectedOrder.billDetails?.platformFee || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST)</span>
                  <span>₹ {selectedOrder.billDetails?.taxAmount || 0}</span>
                </div>
                {selectedOrder.billDetails?.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>- ₹ {selectedOrder.billDetails?.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900 text-sm">
                  <span>Final Total</span>
                  <span>₹ {selectedOrder.billDetails?.finalAmount || 0}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
