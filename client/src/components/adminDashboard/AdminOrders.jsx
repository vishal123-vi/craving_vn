import React, { useState, useEffect } from "react";
import { FiShoppingBag, FiSearch, FiFilter, FiEye, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import api from "../../config/ApiConfig";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard-stats");
      if (res.data?.success && res.data.data?.recentOrders) {
        setOrders(res.data.data.recentOrders || []);
      }
    } catch (error) {
      console.error("Error fetching admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const defaultMockOrders = [
    { _id: "670101", code: "#CRV12345", customer: "Rahul Sharma", restaurant: "Pizza Palace", amount: 320, status: "preparing", date: "Oct 26, 2025" },
    { _id: "670102", code: "#CRV12344", customer: "Priya Singh", restaurant: "Burger Hub", amount: 180, status: "outForDelivery", date: "Oct 26, 2025" },
    { _id: "670103", code: "#CRV12343", customer: "Aman Verma", restaurant: "Spice Junction", amount: 540, status: "delivered", date: "Oct 25, 2025" },
    { _id: "670104", code: "#CRV12342", customer: "Neha Gupta", restaurant: "Healthy Bites", amount: 290, status: "delivered", date: "Oct 25, 2025" },
    { _id: "670105", code: "#CRV12341", customer: "Karan Mehta", restaurant: "Pizza Palace", amount: 410, status: "cancelled", date: "Oct 24, 2025" },
    { _id: "670106", code: "#CRV12340", customer: "Rohit Kumar", restaurant: "Desi Tadka", amount: 650, status: "delivered", date: "Oct 24, 2025" },
  ];

  const displayOrders = orders.length > 0 
    ? orders.map(o => ({
        _id: o._id,
        code: `#CRV${o._id?.slice(-5).toUpperCase()}`,
        customer: o.customerId?.customerId?.fullName || o.deliveryAddress?.name || "Customer",
        restaurant: o.restaurantId?.restaurantName || "Restaurant Partner",
        amount: o.billDetails?.finalAmount || 320,
        status: o.orderStatus || "preparing",
        date: new Date(o.createdAt || Date.now()).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      }))
    : defaultMockOrders;

  const filtered = displayOrders.filter((o) => {
    const statusMatch = filterStatus === "all" || o.status.toLowerCase().includes(filterStatus.toLowerCase());
    const searchMatch = o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

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

        <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
          {filtered.length} Orders
        </span>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders" },
            { id: "prep", label: "Preparing" },
            { id: "out", label: "Out for Delivery" },
            { id: "deliver", label: "Delivered" },
            { id: "cancel", label: "Cancelled" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
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

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID or restaurant..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Restaurant</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {filtered.map((order, i) => (
              <tr key={order._id || i} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 font-bold text-slate-900">{order.code}</td>
                <td className="py-3.5 text-slate-800">{order.customer}</td>
                <td className="py-3.5 text-slate-600">{order.restaurant}</td>
                <td className="py-3.5 font-bold text-slate-900">₹ {order.amount}</td>
                <td className="py-3.5">{getStatusBadge(order.status)}</td>
                <td className="py-3.5 text-slate-400">{order.date}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Modal View */}
      {selectedOrder && (
        <div 
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Order Details {selectedOrder.code}
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="font-bold text-slate-600">Customer:</span> {selectedOrder.customer}</p>
              <p><span className="font-bold text-slate-600">Restaurant:</span> {selectedOrder.restaurant}</p>
              <p><span className="font-bold text-slate-600">Amount:</span> ₹ {selectedOrder.amount}</p>
              <p><span className="font-bold text-slate-600">Date:</span> {selectedOrder.date}</p>
              <div className="pt-2">
                <span className="font-bold text-slate-600 block mb-1">Status:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
