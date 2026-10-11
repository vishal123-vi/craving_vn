import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { FaCheckCircle, FaUtensils, FaMotorcycle, FaHome, FaTimesCircle } from "react-icons/fa";
import { IoArrowForward, IoNavigateOutline, IoReceiptOutline } from "react-icons/io5";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(false); // fetch without setting loading to true
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get("/order/my-orders");
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Order fetch error:", error.response?.data || error);
      if (showLoading) toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusStep = (status) => {
    if (['pending', 'accepted'].includes(status)) return 1;
    if (['preparing', 'ready'].includes(status)) return 2;
    if (['pickedUp', 'onTheWay', 'outForDelivery'].includes(status)) return 3;
    if (['delivered'].includes(status)) return 4;
    return 0; // cancelled, failed, rejected, etc.
  };

  const renderOrderTracker = (status) => {
    const currentStep = getOrderStatusStep(status);
    const isCancelled = ['cancelled', 'failed', 'rejected', 'undeliverable'].includes(status);
    
    if (isCancelled) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-center gap-3 border border-red-200 dark:border-red-800">
          <FaTimesCircle className="text-red-500 text-2xl" />
          <div>
            <h4 className="font-bold text-red-700 dark:text-red-400">Order {status}</h4>
            <p className="text-sm text-red-600 dark:text-red-300">Unfortunately, this order could not be completed.</p>
          </div>
        </div>
      );
    }

    const steps = [
      { id: 1, label: "Order Placed", icon: FaCheckCircle },
      { id: 2, label: "Food Prepared", icon: FaUtensils },
      { id: 3, label: "Out for Delivery", icon: FaMotorcycle },
      { id: 4, label: "Delivered", icon: FaHome },
    ];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <h4 className="font-bold text-gray-800 dark:text-white mb-6 text-center">Order Status</h4>
        <div className="relative flex justify-between items-center w-full px-2">
          {/* Progress Bar Background */}
          <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-700 -z-10"></div>
          
          {/* Active Progress Bar */}
          <div 
            className="absolute left-[10%] top-1/2 -translate-y-1/2 h-1 bg-orange-500 -z-10 transition-all duration-500 ease-in-out"
            style={{ width: currentStep > 1 ? `${(currentStep - 1) * 26.6}%` : '0%' }}
          ></div>

          {steps.map((step) => {
            const isCompleted = currentStep >= step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-16">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isCompleted 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400"
                }`}>
                  <step.icon size={16} className={isCurrent ? "animate-pulse" : ""} />
                </div>
                <span className={`text-[10px] font-bold text-center leading-tight ${
                  isCompleted ? "text-orange-600 dark:text-orange-400" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto h-full">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white/95 to-white/70 dark:from-gray-900/95 dark:to-gray-800/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-gray-700/50 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="w-full text-sm sm:text-base relative z-10">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-800/80 border-b border-gray-200/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest font-bold">
                  <th className="text-left py-5 px-8">Order ID</th>
                  <th className="text-left py-5 px-6">Restaurant</th>
                  <th className="text-left py-5 px-6">Amount</th>
                  <th className="text-left py-5 px-6">Status</th>
                  <th className="text-left py-5 px-6">Date</th>
                  <th className="text-center py-5 px-8">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100/60 dark:border-gray-800/60 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-transparent dark:hover:from-orange-900/10 transition-all duration-300 group">
                    <td className="py-5 px-8 font-extrabold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      #{order._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-5 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {order.restaurantId?.restaurantName || "Unknown"}
                    </td>
                    <td className="py-5 px-6 font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-300">
                      ₹{order.billDetails?.finalAmount || 0}
                    </td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black border capitalize shadow-sm transition-all duration-300 ${
                        order.orderStatus === "delivered" ? "bg-green-50/80 text-green-700 border-green-200/50 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 shadow-green-500/10" :
                        order.orderStatus === "pending" || order.orderStatus === "preparing" ? "bg-yellow-50/80 text-yellow-700 border-yellow-200/50 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 shadow-yellow-500/10" :
                        "bg-red-50/80 text-red-700 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-red-500/10"
                      }`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${
                          order.orderStatus === "delivered" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" :
                          order.orderStatus === "pending" || order.orderStatus === "preparing" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" :
                          "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        }`}></span>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-gray-500 dark:text-gray-400 font-semibold text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-5 px-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/order-track/${order._id}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md shadow-orange-500/20 transition flex items-center gap-1.5"
                        >
                          <IoNavigateOutline size={15} />
                          <span>Track Live</span>
                        </Link>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-orange-500 px-3.5 py-2 rounded-xl text-xs font-black transition"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col gap-5">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order._id} className="bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/90 dark:to-gray-800/80 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/60 dark:border-gray-700/60 flex flex-col gap-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start border-b border-gray-100/80 dark:border-gray-700/50 pb-4 relative z-10">
                    <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        #{order._id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black shadow-sm border uppercase tracking-widest ${
                      order.orderStatus === "delivered" ? "bg-green-50/80 text-green-700 border-green-200/50 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20" :
                      order.orderStatus === "pending" || order.orderStatus === "preparing" ? "bg-yellow-50/80 text-yellow-700 border-yellow-200/50 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20" :
                      "bg-red-50/80 text-red-700 border-red-200/50 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        order.orderStatus === "delivered" ? "bg-green-500" :
                        order.orderStatus === "pending" || order.orderStatus === "preparing" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}></span>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">Restaurant</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{order.restaurantId?.restaurantName || "Unknown"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">Amount</p>
                      <p className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-300">₹{order.billDetails?.finalAmount || 0}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1 z-10">
                    <Link
                      to={`/order-track/${order._id}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-black transition text-center shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
                    >
                      <IoNavigateOutline size={16} />
                      <span>Track Live</span>
                    </Link>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/30 py-2.5 rounded-xl text-xs font-black transition"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-semibold bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                No orders yet. Time to crave!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Order ID:</span> <span className="font-bold text-gray-900 dark:text-white">{selectedOrder._id}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Date:</span> <span className="font-semibold text-gray-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Restaurant:</span> <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.restaurantId?.restaurantName || "Unknown"}</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Status:</span> <span className="font-bold capitalize text-orange-600">{selectedOrder.orderStatus}</span></div>
                {selectedOrder.paymentDetails?.razorpayPaymentId && (
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Payment ID:</span> <span className="font-semibold text-gray-900 dark:text-white break-all ml-4 text-right">{selectedOrder.paymentDetails.razorpayPaymentId}</span></div>
                )}
                {selectedOrder.deliveryAddress?.geoLocation && selectedOrder.deliveryAddress.geoLocation.lat !== "0" && (
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Live Location:</span> <span className="font-semibold text-gray-900 dark:text-white">Lat: {parseFloat(selectedOrder.deliveryAddress.geoLocation.lat).toFixed(4)}, Lon: {parseFloat(selectedOrder.deliveryAddress.geoLocation.lon).toFixed(4)}</span></div>
                )}
              </div>

              {renderOrderTracker(selectedOrder.orderStatus)}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2">Items</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{item.quantity}x {item.itemId?.itemName || "Unknown Item"}</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{(item.itemId?.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{selectedOrder.billDetails?.finalAmount || 0}</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Link
                to={`/order-track/${selectedOrder._id}`}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm text-center shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
              >
                <IoNavigateOutline size={18} />
                <span>Track Live Screen</span>
              </Link>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
