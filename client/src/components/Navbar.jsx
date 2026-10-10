import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "../assets/transparentLogoLight.png";
import { useAuth } from "../context/AuthContext";
import { FaPowerOff } from "react-icons/fa";
import { IoCartOutline, IoCloseOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";
import { useCart } from "../context/CartContext";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import ReceiptModal from "./payment/ReceiptModal";

const Navbar = () => {
  const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();
  const { totalItems, cart, totalAmount, handleAddToCart, handleRemoveFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [receiptData, setReceiptData] = React.useState(null);

  React.useEffect(() => {
    if (totalItems === 0 && isCartOpen) {
      setIsCartOpen(false);
    }
  }, [totalItems, isCartOpen]);

  const handleNavigate = () => {
    if (role === "restaurant") {
      navigate("/restaurant-dashboard", { state: { activeTab: "overview" } });
    } else if (role === "rider") {
      navigate("/rider-dashboard", { state: { activeTab: "overview" } });
    } else if (role === "admin") {
      navigate("/admin-dashboard", { state: { activeTab: "overview" } });
    } else {
      navigate("/customer-dashboard", { state: { activeTab: "overview" } });
    }
  };

  const handleLogout = async () => {
    try {
      const res = await api.get("/auth/logout");
      toast.success(res.data.message);

      sessionStorage.removeItem("cravingUser");
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unknown error occurred during registration. Please try again.",
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!isLogin) {
      toast.error("Please login first");
      return;
    }
    if (role !== "customer") {
      toast.error("Only customers can order");
      return;
    }
    if (!cart?.length) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setIsCheckingOut(true);

      const restaurantId = cart[0].item.restaurantId;
      
      // Attempt to get user's live geolocation
      const getGeoLocation = () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  lat: position.coords.latitude.toString(),
                  lon: position.coords.longitude.toString(),
                });
              },
              () => resolve(null),
              { timeout: 5000, maximumAge: 0, enableHighAccuracy: true }
            );
          }
        });
      };
      
      const geoLocation = await getGeoLocation();

      const createOrderRes = await api.post("/order/create", {
        restaurantId,
        paymentMethod: "upi",
        amount: totalAmount,
        orderItems: cart.map((c) => ({ itemId: c.item._id, quantity: c.quantity })),
        geoLocation
      });
      
      const appOrderId = createOrderRes?.data?.data?._id;

      if (!appOrderId) {
        throw new Error("Failed to create order");
      }

      const paymentOrderRes = await api.post("/payment/create-order", { orderId: appOrderId });
      const paymentData = paymentOrderRes?.data?.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsCheckingOut(false);
        return;
      }

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Cravings Delivery",
        description: "Food Order Payment",
        order_id: paymentData.razorpayOrderId,

        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payment/verify", {
              orderId: appOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful!");
            setIsCartOpen(false);
            setReceiptData({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              amount: totalAmount,
              items: cart,
            });
            clearCart();
            navigate("/customer-dashboard");
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.fullName || user?.name || "Test User",
          email: user?.email || "test@example.com",
          contact: user?.phone || "9999999999",
        },
        theme: { color: "#ea580c" },
        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-99 flex items-center justify-between px-12 py-1 bg-(--color-primary) text-white w-full h-16 shadow-md">
        <div className="h-full">
          <Link to="/">
            <img src={logoLight} alt="Logo" className="w-fit h-full" />{" "}
          </Link>
        </div>
        <div className="flex items-center gap-4 h-full">
          {totalItems > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center focus:outline-none"
            >
              <IoCartOutline size={24} />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
                {totalItems}
              </span>
            </button>
          )}

          {isLogin ? (
          <div className="flex items-center bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 rounded-full pr-2 pl-1 py-1 shadow-lg backdrop-blur-md group">
            <button
              className="flex items-center gap-3 cursor-pointer text-left focus:outline-none"
              title="Go to Dashboard"
              onClick={handleNavigate}
            >
              <div className="relative">
                <img
                  src={user?.photo?.url}
                  alt={user?.fullName}
                  className="w-10 h-10 rounded-full object-cover object-top ring-2 ring-white/40 group-hover:ring-white transition-all duration-300"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-(--color-primary) rounded-full"></div>
              </div>
              <div className="flex flex-col mr-3">
                <span className="text-sm font-bold text-white leading-tight">
                  {user?.fullName}
                </span>
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </button>

            <div className="w-1px h-8 bg-white/20 mx-1"></div>

            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white hover:bg-red-500/90 p-2.5 rounded-full transition-all duration-300 ml-1 flex items-center justify-center focus:outline-none"
              title="Logout"
            >
              <FaPowerOff size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-(--color-primary-content) border border-transparent hover:border-(--color-primary-content) px-3 py-1 rounded"
            >
              Login
            </Link>
            <Link
              to="/register/customer"
              className="bg-(--color-primary-content) text-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-primary-content) border px-3 py-1 rounded"
            >
              Register
            </Link>
          </div>
        )}
        </div>
      </div>

      {/* Cart Modal Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-100 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-500" onClick={() => setIsCartOpen(false)}>
          <div 
            className="w-full sm:w-100 h-full shadow-2xl flex flex-col transform transition-transform duration-500 translate-x-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-800/50 bg-linear-to-r from-orange-50 to-white dark:from-orange-900/10 dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-500/20 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                  <IoCartOutline size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Your Cart</h2>
                  <p className="text-xs text-gray-500 font-medium">{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-800 dark:hover:text-white group"
              >
                <IoCloseOutline size={26} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 dark:bg-black/20 custom-scrollbar">
              {cart.map((c) => {
                const itemImage = c.item.image?.url || "https://placehold.co/150x150?text=Food";
                return (
                <div key={c.item._id} className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/50 transform hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-xl">
                    <img src={itemImage} alt={c.item.itemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 transition-colors">{c.item.itemName}</h4>
                      <p className="text-orange-600 dark:text-orange-400 font-extrabold text-sm mt-0.5">₹{c.item.price}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 border border-gray-200/50 dark:border-gray-600/50">
                        <button onClick={() => handleRemoveFromCart(c.item, false)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 shadow-sm hover:bg-orange-500 hover:text-white text-orange-600 dark:text-orange-400 font-bold text-lg transition-all active:scale-95">-</button>
                        <span className="font-bold text-gray-800 dark:text-gray-200 min-w-6 text-center text-sm">{c.quantity}</span>
                        <button onClick={() => handleAddToCart(c.item)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-gray-600 shadow-sm hover:bg-orange-500 hover:text-white text-orange-600 dark:text-orange-400 font-bold text-lg transition-all active:scale-95">+</button>
                      </div>
                      <p className="font-black text-gray-800 dark:text-white text-lg">₹{c.item.price * c.quantity}</p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-800 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Item Total</span>
                <span className="text-gray-800 dark:text-white font-bold">₹{totalAmount}</span>
              </div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800 border-dashed">
                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm flex items-center gap-1">Delivery Fee <IoCartOutline/></span>
                <span className="text-green-500 font-bold text-sm tracking-wide uppercase">Free</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-800 dark:text-white font-black text-lg">Grand Total</span>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{totalAmount}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={isCheckingOut} className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="relative z-10 flex items-center gap-2">
                  {isCheckingOut ? "Processing..." : "Place Order"}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                {/* Subtle shine effect on button */}
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
              </button>
            </div>
          </div>
        </div>
      )}
      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        data={receiptData} 
      />
    </>
  );
};

export default Navbar;
