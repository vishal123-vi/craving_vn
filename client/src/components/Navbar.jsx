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
import AddressSelectorModal from "./customer/AddressSelectorModal";
import SandboxPaymentModal from "./payment/SandboxPaymentModal";
import UpiPaymentModal from "./payment/UpiPaymentModal";
import { IoLocationOutline } from "react-icons/io5";

const Navbar = () => {
  const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
  const navigate = useNavigate();
  const { totalItems, cart, totalAmount, handleAddToCart, handleRemoveFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [receiptData, setReceiptData] = React.useState(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState("cod"); // "cod" | "upi" | "card"
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [sandboxOrderData, setSandboxOrderData] = React.useState(null);
  const [upiOrderData, setUpiOrderData] = React.useState(null);
  const [upiQrData, setUpiQrData] = React.useState(null);
  const [isGatewayConfigured, setIsGatewayConfigured] = React.useState(false);
  const [currentPaymentData, setCurrentPaymentData] = React.useState(null);

  // Fetch user default address on load
  React.useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (isLogin && role === "customer") {
        try {
          const res = await api.get("/customer/profile");
          if (res.data?.success && res.data.data?.addressBook?.length > 0) {
            const list = res.data.data.addressBook;
            const def = list.find((a) => a.isDefault) || list[0];
            setSelectedAddress(def);
          }
        } catch (err) {
          console.error("Default address fetch error:", err);
        }
      }
    };
    fetchDefaultAddress();
  }, [isLogin, role]);

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
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unknown error occurred during logout. Please try again.",
      );
    } finally {
      sessionStorage.removeItem("cravingUser");
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("cravingsCart");
      clearCart();
      setIsCartOpen(false);
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    }
  };

  // Pricing calculations
  const platformFee = 5;
  const deliveryFee = totalAmount >= 300 ? 0 : 30;
  const taxAmount = Math.round(totalAmount * 0.05);
  const grandTotal = totalAmount + platformFee + deliveryFee + taxAmount;

  const launchRazorpayCheckout = async (appOrderId, paymentData, isUpi = false) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setIsCheckingOut(false);
      return;
    }

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency || "INR",
      name: "Cravings Delivery",
      description: isUpi ? "UPI QR Food Order Payment" : "Food Order Payment",
      order_id: paymentData.razorpayOrderId,

      handler: async function (response) {
        try {
          await api.post("/payment/verify", {
            orderId: appOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Payment verified! Order placed. 🎉");
          setIsCartOpen(false);
          setUpiOrderData(null);
          setSandboxOrderData(null);
          clearCart();
          navigate(`/order-confirmation/${appOrderId}`);
        } catch (err) {
          toast.error(err.response?.data?.message || "Payment cryptographic verification failed");
        }
      },
      prefill: {
        name: selectedAddress?.name || user?.fullName || "Customer",
        email: user?.email || "customer@example.com",
        contact: user?.phone || "9999999999",
        ...(isUpi ? { method: "upi" } : {}),
      },
      theme: { color: "#ea580c" },
      modal: {
        ondismiss: async () => {
          try {
            await api.post("/payment/cancel", {
              orderId: appOrderId,
              reason: "Customer closed payment modal",
            });
          } catch (ignore) { }
          toast.error("Payment modal cancelled");
        },
      },
    };

    // Allow Razorpay to present all supported instruments (UPI, Cards, NetBanking, Wallets)
    // without restricting or hiding default payment methods
    if (isUpi) {
      options.prefill = {
        ...options.prefill,
        method: "upi",
      };
    }

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", async function (response) {
      try {
        await api.post("/payment/cancel", {
          orderId: appOrderId,
          reason: response.error?.description || "Payment failed",
        });
      } catch (ignore) { }
      toast.error(`Payment failed: ${response.error?.description}`);
    });

    rzp.open();
  };

  const handlePlaceOrder = async () => {
    if (!isLogin) {
      toast.error("Please login first to place an order");
      navigate("/login");
      return;
    }
    if (role !== "customer") {
      toast.error("Only customer accounts can place orders. Please switch to a customer account.");
      return;
    }
    if (!cart?.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a delivery address to proceed.");
      setIsAddressModalOpen(true);
      return;
    }

    try {
      setIsCheckingOut(true);

      const restaurantId = cart[0].item.restaurantId;
      const geoLocation = selectedAddress?.geoLocation || { lat: "23.2599", lon: "77.4126" };

      // Case 1: Cash on Delivery (COD)
      if (selectedPaymentMethod === "cod") {
        const createOrderRes = await api.post("/order/create", {
          restaurantId,
          paymentMethod: "cod",
          amount: totalAmount,
          orderItems: cart.map((c) => ({ itemId: c.item._id, quantity: c.quantity })),
          geoLocation,
          deliveryAddress: selectedAddress,
        });

        if (createOrderRes?.data?.success) {
          const newOrder = createOrderRes.data.data;
          toast.success("Order placed successfully with Cash on Delivery! 🛵");
          setIsCartOpen(false);
          clearCart();
          navigate(`/order-confirmation/${newOrder._id}`);
          return;
        }
      }

      // Case 2: UPI / QR Code Payment Flow
      if (selectedPaymentMethod === "upi") {
        const createOrderRes = await api.post("/order/create", {
          restaurantId,
          paymentMethod: "upi",
          amount: totalAmount,
          orderItems: cart.map((c) => ({ itemId: c.item._id, quantity: c.quantity })),
          geoLocation,
          deliveryAddress: selectedAddress,
        });

        const appOrderId = createOrderRes?.data?.data?._id;
        if (!appOrderId) {
          throw new Error("Failed to create order");
        }

        try {
          const paymentOrderRes = await api.post("/payment/create-order", {
            orderId: appOrderId,
            isUpi: true,
          });
          const paymentData = paymentOrderRes?.data?.data;
          setCurrentPaymentData(paymentData);
          setIsGatewayConfigured(!paymentData?.isSimulated);
          setUpiQrData(paymentData?.qrData || null);
          setUpiOrderData(createOrderRes.data.data);
          setIsCartOpen(false);
          return;
        } catch (upiErr) {
          console.warn("Falling back to local UPI modal:", upiErr);
          setIsGatewayConfigured(false);
          setUpiQrData(null);
          setUpiOrderData(createOrderRes.data.data);
          setIsCartOpen(false);
          return;
        }
      }

      // Case 3: Cards / Netbanking Online Payment
      const createOrderRes = await api.post("/order/create", {
        restaurantId,
        paymentMethod: "card",
        amount: totalAmount,
        orderItems: cart.map((c) => ({ itemId: c.item._id, quantity: c.quantity })),
        geoLocation,
        deliveryAddress: selectedAddress,
      });

      const appOrderId = createOrderRes?.data?.data?._id;
      if (!appOrderId) {
        throw new Error("Failed to create order");
      }

      try {
        const paymentOrderRes = await api.post("/payment/create-order", { orderId: appOrderId, isUpi: false });
        const paymentData = paymentOrderRes?.data?.data;
        setCurrentPaymentData(paymentData);
        setIsCartOpen(false);

        if (paymentData?.isSimulated) {
          setSandboxOrderData(createOrderRes.data.data);
        } else {
          launchRazorpayCheckout(appOrderId, paymentData, false);
        }
      } catch (cardErr) {
        console.warn("Falling back to sandbox payment modal:", cardErr);
        setSandboxOrderData(createOrderRes.data.data);
        setIsCartOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong placing the order");
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
          {isLogin && totalItems > 0 && (
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
              {/* Delivery Address Pill */}
              <div className="mb-4 bg-orange-50/60 dark:bg-orange-950/20 p-3 rounded-2xl border border-orange-200/60 dark:border-orange-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0">
                    <IoLocationOutline size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 block leading-tight">
                      Deliver To: {selectedAddress?.addressType || "Address"}
                    </span>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {selectedAddress ? `${selectedAddress.name} - ${selectedAddress.address}` : "No address selected"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-2.5 py-1 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-700 rounded-xl text-xs font-black shrink-0 hover:bg-orange-50 transition"
                >
                  {selectedAddress ? "Change" : "Select"}
                </button>
              </div>

              {/* Itemized Pricing Breakdown */}
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">₹{platformFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {deliveryFee === 0 ? <span className="text-green-500 uppercase font-black">Free</span> : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-4 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                <span className="block text-[11px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Select Payment Method
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("cod")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all text-center ${selectedPaymentMethod === "cod"
                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-[1.02]"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                  >
                    <span className="text-base">💵</span>
                    <span className="leading-tight">Cash on Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("upi")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all text-center ${selectedPaymentMethod === "upi"
                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-[1.02]"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                  >
                    <span className="text-base">📱</span>
                    <span className="leading-tight">UPI / QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("card")}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all text-center ${selectedPaymentMethod === "card"
                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-[1.02]"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                  >
                    <span className="text-base">💳</span>
                    <span className="leading-tight">Cards / NetBank</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-800 dark:text-white font-black text-lg">Grand Total</span>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{grandTotal}</span>
              </div>

              <button onClick={handlePlaceOrder} disabled={isCheckingOut} className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3.5 rounded-xl font-bold text-base transition-all shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="relative z-10 flex items-center gap-2">
                  {isCheckingOut ? "Processing..." : `Place Order (₹${grandTotal})`}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
                {/* Subtle shine effect on button */}
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
              </button>
            </div>
          </div>
        </div>
      )}
      <AddressSelectorModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddress={selectedAddress}
        onSelectAddress={(addr) => {
          setSelectedAddress(addr);
          setIsAddressModalOpen(false);
        }}
      />
      <ReceiptModal
        isOpen={!!receiptData}
        onClose={() => setReceiptData(null)}
        data={receiptData}
      />
      <SandboxPaymentModal
        isOpen={!!sandboxOrderData}
        orderData={sandboxOrderData}
        onClose={() => setSandboxOrderData(null)}
        onSuccess={(confirmedOrderId) => {
          setSandboxOrderData(null);
          clearCart();
          navigate(`/order-confirmation/${confirmedOrderId}`);
        }}
      />
      <UpiPaymentModal
        isOpen={!!upiOrderData}
        orderData={upiOrderData}
        qrData={upiQrData}
        isConfigured={isGatewayConfigured && !currentPaymentData?.isSimulated}
        onClose={() => setUpiOrderData(null)}
        onLaunchRazorpayUpi={() => {
          if (upiOrderData?._id && currentPaymentData && !currentPaymentData?.isSimulated) {
            launchRazorpayCheckout(upiOrderData._id, currentPaymentData, true);
          }
        }}
        onSuccess={(confirmedOrderId) => {
          setUpiOrderData(null);
          clearCart();
          navigate(`/order-confirmation/${confirmedOrderId}`);
        }}
      />
    </>
  );
};

export default Navbar;
