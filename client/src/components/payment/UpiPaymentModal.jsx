import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  IoCloseOutline,
  IoQrCodeOutline,
  IoTimeOutline,
  IoRefreshOutline,
  IoFlashOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoPhonePortraitOutline,
  IoCopyOutline,
  IoCheckmarkDoneOutline,
} from "react-icons/io5";

const UpiPaymentModal = ({
  isOpen,
  onClose,
  orderData,
  qrData,
  isConfigured,
  onLaunchRazorpayUpi,
  onSuccess,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 mins
  const [polling, setPolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [paymentState, setPaymentState] = useState("pending"); // pending, completed, failed, expired
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const orderId = orderData?._id || orderData?.orderId;
  const amount = orderData?.billDetails?.finalAmount || orderData?.amount || 0;
  const upiId = qrData?.upiId || "cravings.pay@okhdfcbank";
  const payeeName = qrData?.payeeName || "Cravings Food Delivery";
  const shortRef = orderId ? String(orderId).slice(-8) : "ORDER";
  const upiUri =
    qrData?.upiUri ||
    `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      payeeName
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${shortRef}`)}`;

  // Generate QR Code dynamically (Local High-Res SVG/Canvas Data URL with fallback)
  useEffect(() => {
    if (!isOpen || !orderId) return;

    if (qrData?.imageUrl) {
      setQrImageUrl(qrData.imageUrl);
      return;
    }

    let isSubscribed = true;
    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 2,
      color: {
        dark: "#111827",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (isSubscribed) setQrImageUrl(url);
      })
      .catch((err) => {
        console.warn("Client QRCode fallback to public generator:", err);
        if (isSubscribed) {
          setQrImageUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
              upiUri
            )}`
          );
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, orderId, qrData?.imageUrl, upiUri]);

  // Countdown timer & Automatic Polling
  useEffect(() => {
    if (isOpen && orderId) {
      setSecondsRemaining(15 * 60);
      setPaymentState("pending");

      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPaymentState("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Status polling every 4 seconds
      pollRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 4000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, orderId]);

  const checkPaymentStatus = async (showToast = false) => {
    if (!orderId || paymentState === "completed") return;
    try {
      setPolling(true);
      const res = await api.get(`/payment/order-status/${orderId}`);
      if (res.data?.success) {
        if (res.data.paymentStatus === "completed") {
          setPaymentState("completed");
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          toast.success("UPI Payment Confirmed! 🎉");
          onSuccess(orderId);
        } else if (res.data.paymentStatus === "failed") {
          setPaymentState("failed");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (showToast) {
          toast("Awaiting payment transfer confirmation...", { icon: "⏳" });
        }
      }
    } catch (err) {
      // Ignore background polling errors
    } finally {
      setPolling(false);
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard!");
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // User explicitly clicks "I Have Paid / Verify Payment"
  const handleVerifyPayment = async () => {
    try {
      setVerifying(true);
      // First check live order status from server
      const statusRes = await api.get(`/payment/order-status/${orderId}`);
      if (statusRes.data?.paymentStatus === "completed") {
        setPaymentState("completed");
        toast.success("Payment Received! Order Confirmed 🎉");
        onSuccess(orderId);
        return;
      }

      // If pending in test/dev environment, verify via sandbox confirmation
      const res = await api.post("/payment/sandbox-verify", {
        orderId,
        simulateFailure: false,
        paymentMethod: "upi",
      });

      if (res.data?.success) {
        setPaymentState("completed");
        toast.success("Payment Verified! Order Confirmed 🎉");
        onSuccess(orderId);
      } else {
        toast.error("Payment not yet confirmed. Please scan and pay.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify payment status");
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateFailure = async () => {
    try {
      setSimulating(true);
      await api.post("/payment/sandbox-verify", {
        orderId,
        simulateFailure: true,
        paymentMethod: "upi",
      });
      setPaymentState("failed");
      toast.error("Payment marked as failed/declined");
    } catch (err) {
      toast.error("Failed to simulate payment decline");
    } finally {
      setSimulating(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.post("/payment/cancel", {
        orderId,
        reason: "Customer closed UPI checkout modal",
      });
    } catch (ignore) {}
    toast.error("UPI Payment cancelled");
    onClose();
  };

  if (!isOpen || !orderData) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white relative shrink-0">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white"
            title="Close"
          >
            <IoCloseOutline size={22} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Scan & Pay via UPI</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">Scan QR Code to Pay</h3>
          <p className="text-xs text-white/90 mt-0.5">
            Use any UPI App: Google Pay, PhonePe, Paytm, BHIM, Cred
          </p>

          <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-baseline">
            <span className="text-xs text-white/80 font-bold uppercase tracking-wider">
              Total Amount
            </span>
            <span className="text-3xl font-black">₹{amount}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-center overflow-y-auto custom-scrollbar flex-1">
          {/* Expiry Countdown */}
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800">
            <IoTimeOutline size={16} />
            <span>QR Code valid for:</span>
            <span className="font-mono font-black text-sm">{formattedTime}</span>
          </div>

          {/* QR Code Container with sleek viewfinder styling */}
          <div className="relative inline-block mx-auto bg-white p-3.5 rounded-2xl shadow-lg border-2 border-orange-500/80">
            {/* Viewfinder corner accents */}
            <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-orange-600 rounded-tl-sm pointer-events-none"></div>
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-orange-600 rounded-tr-sm pointer-events-none"></div>
            <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-orange-600 rounded-bl-sm pointer-events-none"></div>
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-orange-600 rounded-br-sm pointer-events-none"></div>

            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Dynamic UPI QR Code"
                className="w-56 h-56 object-contain mx-auto rounded-lg transition-transform hover:scale-[1.01]"
              />
            ) : (
              <div className="w-56 h-56 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <IoQrCodeOutline className="animate-spin text-orange-500" size={36} />
                <span className="text-xs font-bold text-gray-500 mt-2">Generating QR Code...</span>
              </div>
            )}

            <div className="mt-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
              Order Ref: <span className="font-mono font-black text-gray-800 dark:text-gray-200">#{shortRef}</span>
            </div>
          </div>

          {/* Supported UPI Apps Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-300">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              GPay
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              PhonePe
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Paytm
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              BHIM UPI
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Cred
            </span>
          </div>

          {/* Direct UPI ID + Copy */}
          <div className="bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
            <div className="text-left overflow-hidden">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                UPI ID / VPA:
              </span>
              <p className="font-mono font-bold text-xs text-gray-800 dark:text-gray-200 truncate">
                {upiId}
              </p>
            </div>
            <button
              onClick={handleCopyUpiId}
              className="px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold flex items-center gap-1 transition shrink-0 active:scale-95"
              title="Copy UPI ID"
            >
              {copiedUpi ? <IoCheckmarkDoneOutline size={14} /> : <IoCopyOutline size={14} />}
              <span>{copiedUpi ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Mobile Intent Direct Link */}
          <a
            href={upiUri}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline w-full"
          >
            <IoPhonePortraitOutline size={15} />
            <span>Open in UPI App on this device</span>
          </a>

          {/* Status Indicators */}
          {paymentState === "expired" && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <IoAlertCircleOutline size={18} />
              <span>QR Code has expired. Please retry with a fresh order.</span>
            </div>
          )}

          {paymentState === "failed" && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <IoAlertCircleOutline size={18} />
              <span>Payment failed or declined. Please retry or choose another payment method.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {/* Primary: Confirm / Verify Payment */}
            <button
              onClick={handleVerifyPayment}
              disabled={verifying || paymentState === "completed"}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              <IoCheckmarkCircle size={18} />
              <span>{verifying ? "Verifying Transaction..." : "I Have Paid / Confirm Order"}</span>
            </button>

            {/* Optional: Launch Razorpay Checkout if merchant account gateway is active */}
            {isConfigured && onLaunchRazorpayUpi && (
              <button
                onClick={onLaunchRazorpayUpi}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <IoPhonePortraitOutline size={15} />
                <span>Pay via Razorpay Window (Cards / NetBanking / Razorpay UPI)</span>
              </button>
            )}
          </div>

          {/* Polling / Sync state */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span className="flex items-center gap-1">
              <IoShieldCheckmarkOutline className="text-green-500" size={14} />
              <span>Encrypted UPI Payment</span>
            </span>
            <button
              onClick={() => checkPaymentStatus(true)}
              disabled={polling}
              className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 hover:underline"
            >
              <IoRefreshOutline className={polling ? "animate-spin" : ""} size={13} />
              <span>{polling ? "Syncing..." : "Sync Status"}</span>
            </button>
          </div>

          {/* Testing simulation (Failure) & Cancel */}
          <div className="flex gap-2 pt-1 text-[11px]">
            <button
              onClick={handleSimulateFailure}
              disabled={simulating}
              className="py-1 px-2 text-gray-400 hover:text-red-500 transition text-[10px]"
            >
              Simulate Failure (Test)
            </button>
            <div className="flex-1"></div>
            <button
              onClick={handleCancel}
              className="py-1.5 px-3 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentModal;
