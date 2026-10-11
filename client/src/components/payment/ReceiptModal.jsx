import React, { useRef, useState } from "react";
import { IoCloseOutline, IoDownloadOutline, IoShareSocialOutline } from "react-icons/io5";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const ReceiptModal = ({ isOpen, onClose, data }) => {
  const receiptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !data) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${data.razorpay_order_id}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download receipt.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const textToShare = `Receipt for Order ${data.razorpay_order_id}\nAmount Paid: ₹${data.amount}\nPayment ID: ${data.razorpay_payment_id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment Receipt",
          text: textToShare,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        toast.success("Receipt details copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy receipt details.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Options */}
        <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="overflow-y-auto flex-1 p-6" ref={receiptRef}>
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${data.payment_status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'} rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm`}>
              {data.payment_status === 'completed' ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-2xl font-black">🛵</span>
              )}
            </div>
            <h2 className="text-2xl font-black text-gray-800 dark:text-white">
              {data.payment_status === 'completed' ? "Payment Confirmed" : "Order Placed"}
            </h2>
            <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mt-1">
              {data.payment_status === 'completed' ? "Payment Verified via Razorpay" : "Pay on Delivery (Cash / UPI)"}
            </p>
            <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Order ID</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 break-all ml-4 text-right">#{data.order_id || data.razorpay_order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment Status</span>
                <span className={`font-black uppercase text-xs px-2.5 py-0.5 rounded-full ${
                  data.payment_status === 'completed' 
                    ? "bg-green-100 text-green-700" 
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {data.payment_status === 'completed' ? "Verified" : "Pending Collection"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Payment Reference</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 break-all ml-4 text-right">{data.razorpay_payment_id || "Cash on Delivery"}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 border-dashed pt-4">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">Order Details</h3>
              <div className="space-y-3">
                {data.items && data.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.quantity}x {item.item.itemName}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">₹{item.item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800 dark:text-white">
                {data.payment_status === 'completed' ? "Total Paid" : "Total to Pay"}
              </span>
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹{data.amount}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm disabled:opacity-50"
          >
            <IoDownloadOutline size={20} />
            {isDownloading ? "Downloading..." : "Download"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-orange-500/30"
          >
            <IoShareSocialOutline size={20} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
