import React, { useState } from "react";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import {
  IoCloseOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoAlertCircleOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoLockClosedOutline,
  IoRadioButtonOn,
  IoRadioButtonOff,
} from "react-icons/io5";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { SiContactlesspayment } from "react-icons/si";

const POPULAR_BANKS = [
  { id: "sbi", name: "State Bank of India", short: "SBI", badge: "Popular" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC", badge: "Fast" },
  { id: "icici", name: "ICICI Bank", short: "ICICI", badge: "Popular" },
  { id: "axis", name: "Axis Bank", short: "AXIS", badge: "Fast" },
  { id: "kotak", name: "Kotak Mahindra Bank", short: "KOTAK", badge: null },
  { id: "pnb", name: "Punjab National Bank", short: "PNB", badge: null },
];

const OTHER_BANKS = [
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
  "Yes Bank",
  "IDBI Bank",
  "Federal Bank",
  "Central Bank of India",
  "Indian Overseas Bank",
];

const SandboxPaymentModal = ({ isOpen, onClose, orderData, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("card"); // "card" | "netbanking"
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  // Card form state
  const [cardNumber, setCardNumber] = useState("4532 8921 4452 4242");
  const [cardHolder, setCardHolder] = useState(orderData?.deliveryAddress?.name || "Vishal Tiwari");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("786");

  // Netbanking state
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [otherBank, setOtherBank] = useState("");

  if (!isOpen || !orderData) return null;

  const appOrderId = orderData._id || orderData.orderId;
  const amount = orderData.billDetails?.finalAmount || orderData.amount || 0;

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setCardExpiry(val);
  };

  const handlePay = async (simulateFailure = false) => {
    try {
      setProcessing(true);

      if (!simulateFailure) {
        setProcessingStep(activeTab === "card" ? "Contacting Visa / Mastercard 3D-Secure..." : "Connecting to Bank Gateway...");
        await new Promise((r) => setTimeout(r, 600));
        setProcessingStep("Authorizing Transaction with Bank...");
        await new Promise((r) => setTimeout(r, 600));
      }

      const paymentMethod = activeTab === "netbanking" ? "netbanking" : "card";

      const res = await api.post("/payment/sandbox-verify", {
        orderId: appOrderId,
        simulateFailure,
        paymentMethod,
        bank: activeTab === "netbanking" ? (selectedBank === "other" ? otherBank : selectedBank) : null,
      });

      if (simulateFailure) {
        toast.error("Simulated payment failure: Transaction declined by bank.");
        onClose();
        return;
      }

      if (res.data?.success) {
        toast.success(
          activeTab === "card"
            ? "Card Payment Successful & Verified! 🎉"
            : "Net Banking Payment Confirmed! 🎉"
        );
        onSuccess(appOrderId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment authorization failed. Please try again.");
    } finally {
      setProcessing(false);
      setProcessingStep("");
    }
  };

  const handleDismiss = async () => {
    try {
      await api.post("/payment/cancel", {
        orderId: appOrderId,
        reason: "Customer closed Card/Netbanking checkout",
      });
    } catch (ignore) {}
    toast.error("Payment cancelled.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-5 text-white relative shrink-0">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/30 transition text-white"
            title="Close"
          >
            <IoCloseOutline size={22} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Card & NetBanking Checkout</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">Complete Payment</h3>
          <p className="text-xs text-white/90 mt-0.5">
            Pay securely with Credit / Debit Card or Net Banking
          </p>

          <div className="mt-3 pt-3 border-t border-white/20 flex justify-between items-baseline">
            <span className="text-xs text-white/80 font-bold uppercase tracking-wider">
              Total Amount Payable
            </span>
            <span className="text-3xl font-black">₹{amount}</span>
          </div>
        </div>

        {/* Tab Navigation: Cards vs Net Banking */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`flex-1 py-3 px-4 text-xs font-black flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "card"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-900"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <IoCardOutline size={18} />
            <span>Debit / Credit Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("netbanking")}
            className={`flex-1 py-3 px-4 text-xs font-black flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === "netbanking"
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-900"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <IoBusinessOutline size={18} />
            <span>Net Banking (All Indian Banks)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Order ID Tag */}
          <div className="bg-gray-50 dark:bg-gray-800/60 px-3.5 py-2 rounded-xl border border-gray-200/60 dark:border-gray-700/60 flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-bold">Order Reference:</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">#{appOrderId?.substring(0, 12)}</span>
          </div>

          {/* TAB 1: CARD CHECKOUT */}
          {activeTab === "card" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Virtual Card Preview */}
              <div className="bg-gradient-to-tr from-slate-900 via-gray-800 to-slate-900 text-white p-4 rounded-2xl shadow-lg relative overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-1.5">
                    <SiContactlesspayment size={22} className="text-gray-400" />
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Secure Card</span>
                  </div>
                  <div className="flex items-center gap-2 text-xl">
                    <FaCcVisa className="text-blue-400" />
                    <FaCcMastercard className="text-orange-400" />
                  </div>
                </div>

                <div className="font-mono text-base tracking-widest font-black mb-3 text-gray-200">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>

                <div className="flex justify-between items-end text-xs">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold">Card Holder</span>
                    <span className="font-bold text-white uppercase">{cardHolder || "CUSTOMER NAME"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-gray-400 font-bold">Expires</span>
                    <span className="font-mono font-bold text-white">{cardExpiry || "MM/YY"}</span>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4532 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-gray-400">
                      <FaCcVisa size={18} />
                      <FaCcMastercard size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.substring(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NET BANKING */}
          {activeTab === "netbanking" && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Popular Indian Banks
              </label>

              <div className="grid grid-cols-2 gap-2">
                {POPULAR_BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setSelectedBank(b.id);
                      setOtherBank("");
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedBank === b.id
                        ? "bg-orange-50 dark:bg-orange-950/30 border-orange-500 shadow-sm ring-2 ring-orange-500/20"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xs">
                        {b.short}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          {b.name}
                        </span>
                        {b.badge && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                            ● {b.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedBank === b.id ? (
                      <IoRadioButtonOn className="text-orange-500 shrink-0" size={18} />
                    ) : (
                      <IoRadioButtonOff className="text-gray-300 dark:text-gray-600 shrink-0" size={18} />
                    )}
                  </button>
                ))}
              </div>

              {/* All Other Banks Dropdown */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Or Select Another Indian Bank
                </label>
                <select
                  value={otherBank}
                  onChange={(e) => {
                    setOtherBank(e.target.value);
                    if (e.target.value) setSelectedBank("other");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Choose from all Indian Banks --</option>
                  {OTHER_BANKS.map((ob) => (
                    <option key={ob} value={ob}>
                      {ob}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* SSL & Security Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1">
            <IoLockClosedOutline size={14} className="text-emerald-500" />
            <span>256-Bit SSL Encrypted Bank Gateway • Verified Payment</span>
          </div>

          {/* Processing Indicator */}
          {processing && processingStep && (
            <div className="bg-orange-50 dark:bg-orange-950/40 p-3 rounded-2xl border border-orange-200 dark:border-orange-800 flex items-center justify-center gap-2.5 text-xs font-bold text-orange-700 dark:text-orange-300 animate-pulse">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span>{processingStep}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handlePay(false)}
              disabled={processing}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <IoShieldCheckmarkOutline size={18} />
              <span>
                {processing
                  ? "Processing Payment..."
                  : `Pay ₹${amount} with ${activeTab === "card" ? "Card" : "Net Banking"}`}
              </span>
            </button>

            <button
              onClick={() => handlePay(true)}
              disabled={processing}
              className="w-full py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/30 text-gray-500 dark:text-gray-400 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <IoAlertCircleOutline size={15} />
              <span>Simulate Decline / Bank Error (Testing)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxPaymentModal;
