import React, { useState, useEffect } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { IoRestaurantOutline, IoLocationOutline } from "react-icons/io5";

const RestaurantOverview = ({ activeRestaurantId, restaurants, refreshRestaurants }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!activeRestaurantId) return;
      try {
        setLoadingOrders(true);
        const res = await api.get(`/order/restaurant-orders/${activeRestaurantId}`);
        if (res.data?.success) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error("Error loading overview orders", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [activeRestaurantId]);

  const totalOrdersCount = orders.length;
  const totalSalesRevenue = orders
    .filter((o) => o.paymentDetails?.paymentStatus === "completed" || o.orderStatus === "delivered" || o.orderStatus === "accepted" || o.orderStatus === "preparing" || o.orderStatus === "ready")
    .reduce((sum, o) => sum + (o.billDetails?.finalAmount || 0), 0);
  const recentOrders = orders.slice(0, 5);

  const handleToggleStatus = async (restaurantId, currentStatus) => {
    try {
      const response = await api.patch("/restaurant/toggle-status", { restaurantId });
      if (response.data?.data) {
        if (refreshRestaurants) {
          refreshRestaurants();
        }
        toast.success(response.data.message || "Status updated!");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="overflow-y-auto h-full space-y-8 pb-10">
      
      {/* Overview Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-500 font-medium">Get a quick glance at your restaurant operations</p>
      </div>

      {/* Network Quick Controls - This shows ALL restaurants for this manager */}
      {restaurants && restaurants.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <IoRestaurantOutline className="text-[#c2410c]" size={22} />
            My Restaurant Network
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((rest) => {
              const coverImage = rest.coverImage?.url || "https://placehold.co/100x100?text=Food";
              return (
                <div key={rest._id} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <img src={coverImage} alt={rest.restaurantName} className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-bold text-gray-900 truncate">{rest.restaurantName}</h4>
                      {rest.status === "active" ? (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700 border border-green-200">Approved</span>
                      ) : rest.status === "blocked" ? (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700 border border-red-200">Suspended</span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending Review</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1 mb-2">
                      <IoLocationOutline /> {rest.city}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${rest.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                        {rest.isOpen ? 'Online' : 'Offline'}
                      </span>
                      <label 
                        className={`relative inline-flex items-center ${rest.status !== "active" && !rest.isOpen ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                        title={rest.status !== "active" && !rest.isOpen ? "Approval required before opening online" : "Toggle store open/closed"}
                      >
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={rest.isOpen || false} 
                          disabled={rest.status !== "active" && !rest.isOpen}
                          onChange={() => handleToggleStatus(rest._id, rest.isOpen)} 
                        />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-4xl font-black text-gray-900">{totalOrdersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Sales</p>
          <p className="text-4xl font-black text-[#c2410c]">₹{totalSalesRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-4">Recent Orders</h3>
        
        {loadingOrders ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading recent orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No orders yet for this restaurant</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => {
                    const custName =
                      order.deliveryAddress?.name ||
                      order.customerId?.customerId?.fullName ||
                      "Customer";
                    const formattedId = `#${order._id.slice(-6).toUpperCase()}`;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{formattedId}</td>
                        <td className="px-4 py-3 text-gray-700 font-semibold">{custName}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">₹{order.billDetails?.finalAmount || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            order.orderStatus === "delivered" ? "bg-green-100 text-green-700 border border-green-200" :
                            order.orderStatus === "preparing" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                            order.orderStatus === "accepted" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                            order.orderStatus === "pending" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            "bg-red-100 text-red-700 border border-red-200"
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden flex flex-col gap-3">
              {recentOrders.map((order) => {
                const custName =
                  order.deliveryAddress?.name ||
                  order.customerId?.customerId?.fullName ||
                  "Customer";
                const formattedId = `#${order._id.slice(-6).toUpperCase()}`;
                return (
                  <div key={order._id} className="border border-gray-100 rounded-xl p-3 shadow-sm bg-gray-50/30">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                      <span className="font-bold text-gray-900">{formattedId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.orderStatus === "delivered" ? "bg-green-100 text-green-700 border border-green-200" :
                        order.orderStatus === "preparing" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                        order.orderStatus === "accepted" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                        order.orderStatus === "pending" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                        "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Customer</p>
                        <p className="font-medium text-sm text-gray-800">{custName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">Amount</p>
                        <p className="font-bold text-[#c2410c]">₹{order.billDetails?.finalAmount || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantOverview;
