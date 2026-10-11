import React, { useState, useEffect, useRef } from "react";
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
} from "react-icons/io5";

const UpiPaymentModal = ({ isOpen, onClose, orderData, qrData, isConfigured, onLaunchRazorpayUpi, onSuccess }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 mins
  const [polling, setPolling] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [paymentState, setPaymentState] = useState("pending"); // pending, completed, failed, expired
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const orderId = orderData?._id || orderData?.orderId;
  const amount = orderData?.billDetails?.finalAmount || orderData?.amount || 0;

  // Countdown timer
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

      // Status polling every 5 seconds if standalone QR is active
      if (qrData?.imageUrl || isConfigured) {
        pollRef.current = setInterval(() => {
          checkPaymentStatus();
        }, 5000);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, orderId, qrData, isConfigured]);

  const checkPaymentStatus = async () => {
    if (!orderId || paymentState === "completed") return;
    try {
      setPolling(true);
      const res = await api.get(`/payment/order-status/${orderId}`);
      if (res.data?.success) {
        if (res.data.paymentStatus === "completed") {
          setPaymentState("completed");
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          toast.success("UPI Payment Received! Order Confirmed 🎉");
          onSuccess(orderId);
        } else if (res.data.paymentStatus === "failed") {
          setPaymentState("failed");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }
    } catch (err) {
      // Ignore background poll errors
    } finally {
      setPolling(false);
    }
  };

  const handleSimulatePayment = async (simulateFailure = false) => {
    try {
      setSimulating(true);
      const res = await api.post("/payment/sandbox-verify", {
        orderId,
        simulateFailure,
        paymentMethod: "upi",
      });

      if (simulateFailure) {
        setPaymentState("failed");
        toast.error("Simulated UPI failure: Payment declined by bank.");
        return;
      }

      if (res.data?.success) {
        setPaymentState("completed");
        toast.success("Sandbox UPI Payment Verified! 🎉");
        onSuccess(orderId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment simulation failed");
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white relative">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white"
            title="Close"
          >
            <IoCloseOutline size={22} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>UPI Dynamic QR Payment</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">Scan & Pay with UPI</h3>
          <p className="text-xs text-white/90 mt-0.5">
            Use any UPI App: GPay, PhonePe, Paytm, BHIM, Cred
          </p>

          <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-baseline">
            <span className="text-xs text-white/80 font-bold uppercase tracking-wider">Total Amount</span>
            <span className="text-3xl font-black">₹{amount}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-center">

          {/* Expiry Countdown */}
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800">
            <IoTimeOutline size={16} />
            <span>QR Code Expires in:</span>
            <span className="font-mono font-black text-sm">{formattedTime}</span>
          </div>

          {/* Mode 1: Live Razorpay Gateway Standalone QR Code Image */}
          {isConfigured && qrData?.imageUrl ? (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-orange-500 shadow-md inline-block mx-auto">
              <img
                src={qrData.imageUrl}
                alt="Razorpay Dynamic UPI QR Code"
                className="w-56 h-56 object-contain mx-auto"
              />
              <p className="text-[11px] font-bold text-gray-500 mt-2">
                Order Reference: #{orderId.substring(0, 10).toUpperCase()}
              </p>
            </div>
          ) : isConfigured ? (
            /* Mode 2: Live Razorpay Standard Checkout UPI Flow (Supported by all accounts) */
            <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center mx-auto text-3xl">
                <IoQrCodeOutline />
              </div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                Launch Official Razorpay Dynamic QR
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Razorpay Checkout displays the official dynamic QR code on desktop and UPI Intent buttons (GPay, PhonePe) on mobile.
              </p>
              <button
                onClick={onLaunchRazorpayUpi}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <IoPhonePortraitOutline size={18} />
                <span>Open Razorpay UPI / QR Window</span>
              </button>
            </div>
          ) : (
            /* Mode 3: Development Sandbox Mode (When keys are not yet configured in server/.env) */
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 text-left space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <IoAlertCircleOutline size={18} />
                <span>Gateway Configuration Note</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                Razorpay credentials (<code className="font-mono bg-white dark:bg-black/30 px-1 py-0.5 rounded">RAZORPAY_KEY_ID</code>) are empty in <code className="font-mono">server/.env</code>. A real dynamic UPI QR code cannot be rendered without a gateway connection.
              </p>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                <span className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  Test UPI Payment in Sandbox:
                </span>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSimulatePayment(false)}
                    disabled={simulating}
                    className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <IoFlashOutline size={16} />
                    <span>{simulating ? "Verifying..." : "Simulate UPI Success (GPay/PhonePe)"}</span>
                  </button>
                  <button
                    onClick={() => handleSimulatePayment(true)}
                    disabled={simulating}
                    className="w-full py-2 bg-white dark:bg-gray-800 text-red-600 border border-red-200 dark:border-red-800 rounded-xl font-bold text-xs hover:bg-red-50 transition flex items-center justify-center gap-1"
                  >
                    <span>Simulate UPI Failure (Bank Decline)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicators */}
          {paymentState === "expired" && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <IoAlertCircleOutline size={18} />
              <span>QR Code has expired. Please retry with a fresh order.</span>
            </div>
          )}

          {paymentState === "failed" && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <IoAlertCircleOutline size={18} />
              <span>Payment failed or declined. Please retry or choose another payment method.</span>
            </div>
          )}

          {/* Polling / Sync state */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-1">
              <IoShieldCheckmarkOutline className="text-green-500" size={15} />
              <span>Cryptographic verification</span>
            </span>
            <button
              onClick={checkPaymentStatus}
              disabled={polling}
              className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1 hover:underline"
            >
              <IoRefreshOutline className={polling ? "animate-spin" : ""} size={14} />
              <span>{polling ? "Checking..." : "Sync Status"}</span>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
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
