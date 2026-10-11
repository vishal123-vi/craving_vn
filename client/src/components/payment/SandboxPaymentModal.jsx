import React, { useState } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoCardOutline,
  IoFlashOutline,
  IoLockClosedOutline,
} from "react-icons/io5";

const SandboxPaymentModal = ({ isOpen, onClose, orderData, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi");

  if (!isOpen || !orderData) return null;

  const appOrderId = orderData._id || orderData.orderId;
  const amount = orderData.billDetails?.finalAmount || orderData.amount || 0;

  const handlePay = async (simulateFailure = false) => {
    try {
      setProcessing(true);
      const res = await api.post("/payment/sandbox-verify", {
        orderId: appOrderId,
        simulateFailure,
        paymentMethod: selectedMethod,
      });

      if (simulateFailure) {
        toast.error("Simulated payment failure: Transaction declined.");
        onClose();
        return;
      }

      if (res.data?.success) {
        toast.success("Online payment successful (Test Mode)! 🎉");
        onSuccess(appOrderId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Simulation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await api.post("/payment/cancel", {
        orderId: appOrderId,
        reason: "Customer dismissed sandbox checkout",
      });
    } catch (ignore) {}
    toast.error("Online payment cancelled.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white"
          >
            <IoCloseOutline size={22} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>Razorpay Sandbox • Test Mode</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">Complete Online Payment</h3>
          <p className="text-xs text-white/90 mt-0.5">
            Test environment: No real money will be charged.
          </p>

          <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-baseline">
            <span className="text-xs text-white/80 font-bold uppercase tracking-wider">Amount Due</span>
            <span className="text-3xl font-black">₹{amount}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-bold">Order ID:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">#{appOrderId?.substring(0, 10)}</span>
          </div>

          {/* Test Payment Options */}
          <div className="space-y-2.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400">
              Select Test Payment Instrument
            </label>

            {/* UPI */}
            <div
              onClick={() => setSelectedMethod("upi")}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === "upi"
                  ? "bg-orange-50/70 dark:bg-orange-950/20 border-orange-500 shadow-sm ring-2 ring-orange-500/20"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                  <IoFlashOutline size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Instant Test UPI</h4>
                  <p className="text-xs text-gray-500">Google Pay / PhonePe / Paytm Simulator</p>
                </div>
              </div>
              {selectedMethod === "upi" && <IoCheckmarkCircle className="text-orange-600 text-xl" />}
            </div>

            {/* Card */}
            <div
              onClick={() => setSelectedMethod("card")}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === "card"
                  ? "bg-orange-50/70 dark:bg-orange-950/20 border-orange-500 shadow-sm ring-2 ring-orange-500/20"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <IoCardOutline size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Test Debit / Credit Card</h4>
                  <p className="text-xs text-gray-500">Visa ending in •••• 4242</p>
                </div>
              </div>
              {selectedMethod === "card" && <IoCheckmarkCircle className="text-orange-600 text-xl" />}
            </div>
          </div>

          {/* Secure SSL notice */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <IoLockClosedOutline size={14} className="text-green-500" />
            <span>256-Bit SSL Encrypted Mock Gateway</span>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handlePay(false)}
              disabled={processing}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <IoShieldCheckmarkOutline size={18} />
              <span>{processing ? "Simulating Payment..." : `Confirm Test Payment (₹${amount})`}</span>
            </button>

            <button
              onClick={() => handlePay(true)}
              disabled={processing}
              className="w-full py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/30 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <IoAlertCircleOutline size={16} />
              <span>Simulate Payment Failure (Testing)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxPaymentModal;
