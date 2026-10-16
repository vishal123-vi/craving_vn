import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../config/ApiConfig";
import { 
  IoCheckmarkCircle, 
  IoTimeOutline, 
  IoLocationOutline, 
  IoReceiptOutline, 
  IoArrowForward, 
  IoCopyOutline, 
  IoBagCheckOutline 
} from "react-icons/io5";
import toast from "react-hot-toast";
import ReceiptModal from "../components/payment/ReceiptModal";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/order/track/${orderId}`);
        if (res.data?.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error("Order confirmation fetch error:", err);
        toast.error("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4EB] dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-700 dark:text-gray-300">Loading Order Confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F6F4EB] dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center text-4xl mb-4">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">We couldn't retrieve the details for order #{orderId}.</p>
        <button
          onClick={() => navigate("/order-now")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
        >
          Return to Restaurants
        </button>
      </div>
    );
  }

  const isPaid = order.paymentDetails?.paymentStatus === "completed";
  const isCod = order.paymentDetails?.paymentMethod === "cod";
  const bill = order.billDetails || {};

  return (
    <div className="min-h-screen bg-[#F6F4EB] dark:bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Hero Success Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-orange-100 dark:border-gray-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500"></div>

          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/10">
            <IoCheckmarkCircle size={48} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Thank you for your order. The restaurant is getting it ready!
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800/80 px-4 py-2 rounded-xl border border-gray-200/60 dark:border-gray-700/60 text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Order ID:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">#{order._id}</span>
            <button
              onClick={handleCopyOrderId}
              title="Copy Order ID"
              className="text-orange-500 hover:text-orange-600 p-1 transition"
            >
              <IoCopyOutline size={18} />
            </button>
          </div>

          {/* Status Badges */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Status: {order.orderStatus}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isPaid
                ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200 dark:border-green-800"
                : isCod
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800"
            }`}>
              Payment: {isPaid ? "Paid (Verified)" : isCod ? "Pay on Delivery (Pending)" : "Pending"}
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/order-track/${order._id}`}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-orange-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Track Order Live</span>
              <IoArrowForward size={18} />
            </Link>
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
              className="inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold px-6 py-3.5 rounded-2xl border border-orange-200 dark:border-orange-800 transition cursor-pointer"
            >
              <IoReceiptOutline size={18} />
              <span>Download Invoice / PDF</span>
            </button>
            <Link
              to="/order-now"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold px-6 py-3.5 rounded-2xl transition"
            >
              <IoBagCheckOutline size={18} />
              <span>Order More</span>
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Delivery & Restaurant Info */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center">
                <IoLocationOutline size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Delivery Location</h3>
                <p className="text-xs text-gray-500 font-medium">Estimated arrival in 30-40 mins</p>
              </div>
            </div>

            <div className="text-sm space-y-1">
              <p className="font-bold text-gray-800 dark:text-gray-200">{order.deliveryAddress?.name}</p>
              <p className="text-gray-600 dark:text-gray-400">{order.deliveryAddress?.address}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pinCode}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-sm">
              <p className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Restaurant</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">{order.restaurantId?.restaurantName || "Restaurant"}</p>
              <p className="text-gray-500 text-xs">{order.restaurantId?.city}</p>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center">
                  <IoReceiptOutline size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Bill Summary</h3>
                  <p className="text-xs text-gray-500 font-medium">{order.orderItems?.length || 0} items ordered</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 text-sm custom-scrollbar">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                    <span className="font-medium">
                      {item.quantity}x {item.itemDetails?.itemName || item.itemId?.itemName || "Food Item"}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ₹{(item.itemDetails?.price || item.itemId?.price || 0) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
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
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{bill.discountAmount}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="font-bold text-base text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{bill.finalAmount || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Invoice / Receipt Download Modal */}
      <ReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
    </div>
  );
};

export default OrderConfirmation;
