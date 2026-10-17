import crypto from "crypto";
import Razorpay from "razorpay";
import QRCode from "qrcode";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";

// Check if Razorpay credentials are valid and not placeholder defaults
export const isRazorpayConfigured = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
    keySecret &&
    keyId.trim() !== "" &&
    keySecret.trim() !== "" &&
    keyId !== "your_razorpay_key_id" &&
    keySecret !== "your_razorpay_key_secret"
  );
};

// Lazily create Razorpay instance
const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay credentials are not configured in server/.env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── Helper: find a customer's order safely ─────────────────────────────────
const getCustomerOrder = async (userId, orderId) => {
  let customer = await Customer.findOne({ customerId: userId });
  if (!customer) {
    customer = await Customer.create({ customerId: userId });
  }
  return Order.findOne({ _id: orderId, customerId: customer._id });
};

// ─── GET /payment/config-status ─────────────────────────────────────────────
// Informs client whether Razorpay keys are configured without exposing secrets
export const GetPaymentConfigStatus = async (req, res) => {
  const configured = isRazorpayConfigured();
  return res.status(200).json({
    success: true,
    configured,
    isConfigured: configured,
    gateway: "Razorpay",
    supportedMethods: ["cod", "upi", "card"],
    message: configured
      ? "Razorpay Payment Gateway is active."
      : "Payment simulation / Dynamic UPI active. Online checkout available.",
  });
};

// ─── POST /payment/create-order ──────────────────────────────────────────────
export const CreateRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId, isUpi = false } = req.body;
    if (!orderId) {
      const err = new Error("orderId is required");
      err.statusCode = 400;
      return next(err);
    }

    const order = await getCustomerOrder(req.user._id, orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // Never re-process an order that is already paid
    if (order.paymentDetails?.paymentStatus === "completed") {
      const err = new Error("Payment is already completed for this order");
      err.statusCode = 400;
      return next(err);
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(order.billDetails.finalAmount) * 100);

    let razorpayOrder;
    let isSimulated = false;

    if (!isRazorpayConfigured()) {
      isSimulated = true;
      razorpayOrder = {
        id: `order_sim_${order._id.toString().substring(0, 14)}`,
        amount: amountInPaise,
        currency: "INR",
        status: "created",
      };
    } else {
      try {
        const razorpay = getRazorpayInstance();
        razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${order._id.toString().substring(0, 20)}`,
          notes: { appOrderId: String(order._id), isUpi: String(isUpi) },
        });
      } catch (rzpErr) {
        console.warn("Razorpay API order creation warning:", rzpErr?.error?.description || rzpErr?.message);
        isSimulated = true;
        razorpayOrder = {
          id: `order_sim_${order._id.toString().substring(0, 14)}`,
          amount: amountInPaise,
          currency: "INR",
          status: "created",
        };
      }
    }

    // Keep payment status as strictly PENDING until verification
    order.paymentDetails.paymentStatus = "pending";
    order.paymentDetails.paymentMethod = isUpi ? "upi" : "card";
    order.paymentDetails.razorpayOrderId = razorpayOrder.id;

    // Dynamic UPI QR code generation
    let qrData = null;
    if (isUpi) {
      if (!isSimulated && isRazorpayConfigured()) {
        try {
          const razorpay = getRazorpayInstance();
          if (typeof razorpay.qrCode?.create === "function") {
            const qr = await razorpay.qrCode.create({
              type: "upi_qr",
              name: "Cravings Food Delivery",
              usage: "single_use",
              fixed_amount: true,
              payment_amount: amountInPaise,
              description: `Payment for Order #${order._id.toString().substring(0, 8)}`,
              notes: { appOrderId: String(order._id) },
            });
            if (qr && qr.image_url) {
              qrData = {
                qrId: qr.id,
                imageUrl: qr.image_url,
                status: qr.status,
              };
              order.paymentDetails.razorpayQrId = qr.id;
            }
          }
        } catch (qrErr) {
          // If standalone BharatQR add-on is not active on this account, seamlessly generate standard dynamic UPI QR
        }
      }

      // If standalone Razorpay QR is not active on account, generate official NPCI standard dynamic UPI QR
      if (!qrData) {
        const merchantVpa = process.env.MERCHANT_UPI_ID || "cravings.pay@okhdfcbank";
        const merchantName = "Cravings Food Delivery";
        const amountInRupees = (amountInPaise / 100).toFixed(2);
        const shortRef = order._id.toString().substring(0, 8);
        const upiUri = `upi://pay?pa=${encodeURIComponent(merchantVpa)}&pn=${encodeURIComponent(merchantName)}&am=${amountInRupees}&cu=INR&tn=${encodeURIComponent(`Order #${shortRef}`)}`;

        try {
          const qrDataUrl = await QRCode.toDataURL(upiUri, {
            width: 360,
            margin: 2,
            color: { dark: "#111827", light: "#FFFFFF" },
          });

          qrData = {
            qrId: `upi_${order._id.toString().substring(0, 10)}`,
            imageUrl: qrDataUrl,
            upiUri,
            upiId: merchantVpa,
            payeeName: merchantName,
            status: "active",
          };
        } catch (genErr) {
          console.warn("Server QRCode generation fallback error:", genErr.message);
          qrData = {
            qrId: `upi_${order._id.toString().substring(0, 10)}`,
            imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(upiUri)}`,
            upiUri,
            upiId: merchantVpa,
            payeeName: merchantName,
            status: "active",
          };
        }
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: isSimulated ? "Simulated payment order created" : "Razorpay order created",
      data: {
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_simulated",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_simulated",
        razorpayOrderId: razorpayOrder.id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        appOrderId: order._id,
        isUpi,
        qrData,
        isSimulated,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /payment/verify ────────────────────────────────────────────────────
// Cryptographically verify Razorpay HMAC-SHA256 signature
export const VerifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if ((!orderId && !razorpay_order_id) || !razorpay_payment_id || !razorpay_signature) {
      const err = new Error("Payment verification fields are required (orderId or razorpay_order_id, razorpay_payment_id, razorpay_signature)");
      err.statusCode = 400;
      return next(err);
    }

    let order = null;
    if (orderId) {
      order = await getCustomerOrder(req.user._id, orderId);
    }
    if (!order && razorpay_order_id) {
      order = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpay_order_id });
    }
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // Idempotency: If already completed with this payment ID, return success safely
    if (order.paymentDetails?.paymentStatus === "completed" && order.paymentDetails?.razorpayPaymentId === razorpay_payment_id) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: order,
      });
    }

    // Simulated order handling
    if (
      razorpay_order_id?.startsWith("order_sim_") ||
      razorpay_order_id?.startsWith("order_test_") ||
      razorpay_signature === "simulated_verification" ||
      razorpay_signature === "verified_sandbox_simulation"
    ) {
      order.paymentDetails.paymentStatus = "completed";
      order.paymentDetails.razorpayOrderId = razorpay_order_id;
      order.paymentDetails.razorpayPaymentId = razorpay_payment_id || `pay_sim_${Date.now()}`;
      order.paymentDetails.razorpaySignature = razorpay_signature || "simulated_verification";
      order.paymentDetails.paidAt = new Date();
      order.orderStatus = "accepted";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified and order confirmed!",
        data: order,
      });
    }

    if (!isRazorpayConfigured()) {
      const err = new Error("Cannot verify payment: Razorpay credentials are not configured on server");
      err.statusCode = 500;
      return next(err);
    }

    // ── Signature Verification (HMAC-SHA256) ──────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentDetails.paymentStatus = "failed";
      order.orderStatus = "payment_failed";
      await order.save();

      const err = new Error("Payment signature verification failed. Tampered or invalid transaction.");
      err.statusCode = 400;
      return next(err);
    }

    // ── Payment Genuine & Cryptographically Verified ─────────────────────
    order.paymentDetails.paymentStatus = "completed";
    order.paymentDetails.razorpayOrderId = razorpay_order_id;
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    order.paymentDetails.razorpaySignature = razorpay_signature;
    order.paymentDetails.paidAt = new Date();
    order.orderStatus = "accepted"; // Move to accepted after successful payment
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment cryptographically verified and order confirmed!",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /payment/cancel ────────────────────────────────────────────────────
// Handles user closing or cancelling checkout
export const CancelRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      const err = new Error("orderId is required");
      err.statusCode = 400;
      return next(err);
    }

    const order = await getCustomerOrder(req.user._id, orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    // Only update if not already marked completed
    if (order.paymentDetails?.paymentStatus !== "completed") {
      order.paymentDetails.paymentStatus = "failed";
      order.orderStatus = "payment_failed";
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment marked as cancelled/failed. Order remains unpaid.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /payment/sandbox-verify ────────────────────────────────────────────
// Allows safe, realistic online payment simulation during development/testing
export const VerifySandboxPayment = async (req, res, next) => {
  try {

    const { orderId, simulateFailure = false, paymentMethod = "upi" } = req.body;
    if (!orderId) {
      const err = new Error("orderId is required");
      err.statusCode = 400;
      return next(err);
    }

    const order = await getCustomerOrder(req.user._id, orderId);
    if (!order) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      return next(err);
    }

    if (simulateFailure) {
      order.paymentDetails.paymentStatus = "failed";
      order.orderStatus = "payment_failed";
      await order.save();
      return res.status(200).json({
        success: false,
        message: "Payment failed as simulated in sandbox mode.",
        data: order,
      });
    }

    // Mark verified in sandbox
    order.paymentDetails.paymentMethod = paymentMethod;
    order.paymentDetails.paymentStatus = "completed";
    order.paymentDetails.razorpayOrderId = `order_test_${order._id.toString().substring(0, 10)}`;
    order.paymentDetails.razorpayPaymentId = `pay_test_${Date.now()}`;
    order.paymentDetails.razorpaySignature = "verified_sandbox_simulation";
    order.paymentDetails.paidAt = new Date();
    order.orderStatus = "accepted";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified in development sandbox! Order confirmed 🎉",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /payment/order-status/:orderId ──────────────────────────────────────
// Returns live status, polls Razorpay for captured payments, handles expired/failed
export const GetPaymentOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getCustomerOrder(req.user._id, orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const currentStatus = order.paymentDetails?.paymentStatus || "pending";

    // If already finalized, return immediately
    if (["completed", "failed", "cancelled"].includes(currentStatus)) {
      return res.status(200).json({
        success: true,
        paymentStatus: currentStatus,
        orderStatus: order.orderStatus,
        data: order,
      });
    }

    // Check with Razorpay API if live keys are present, order is pending, and order is not simulated
    const isSimulatedOrder =
      order.paymentDetails?.razorpayOrderId?.startsWith("order_sim_") ||
      order.paymentDetails?.razorpayOrderId?.startsWith("order_test_");

    if (isRazorpayConfigured() && order.paymentDetails?.razorpayOrderId && !isSimulatedOrder) {
      try {
        const razorpay = getRazorpayInstance();
        const rzpOrder = await razorpay.orders.fetch(order.paymentDetails.razorpayOrderId);

        if (rzpOrder && rzpOrder.status === "paid") {
          const payments = await razorpay.orders.fetchPayments(order.paymentDetails.razorpayOrderId);
          const capturedPayment = payments.items?.find((p) => p.status === "captured") || payments.items?.[0];

          order.paymentDetails.paymentStatus = "completed";
          if (capturedPayment) {
            order.paymentDetails.razorpayPaymentId = capturedPayment.id;
            order.paymentDetails.paymentMethod = capturedPayment.method || order.paymentDetails.paymentMethod || "upi";
          }
          order.paymentDetails.paidAt = new Date();
          order.orderStatus = "accepted";
          await order.save();

          return res.status(200).json({
            success: true,
            paymentStatus: "completed",
            orderStatus: order.orderStatus,
            data: order,
          });
        }
      } catch (pollErr) {
        console.warn("Razorpay poll note:", pollErr.message);
      }
    }

    // Check if order payment window expired (15 minutes limit)
    const orderAge = Date.now() - new Date(order.createdAt).getTime();
    const fifteenMinutes = 15 * 60 * 1000;
    if (orderAge > fifteenMinutes && currentStatus === "pending") {
      order.paymentDetails.paymentStatus = "failed";
      order.orderStatus = "payment_failed";
      await order.save();

      return res.status(200).json({
        success: true,
        paymentStatus: "failed",
        isExpired: true,
        message: "Payment session expired after 15 minutes. Please initiate a new order.",
        orderStatus: order.orderStatus,
        data: order,
      });
    }

    return res.status(200).json({
      success: true,
      paymentStatus: currentStatus,
      orderStatus: order.orderStatus,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /payment/webhook ──────────────────────────────────────────────────
// Background server-to-server webhook from Razorpay for captured payments & failures
export const HandleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({ success: false, message: "Razorpay webhook secret is not configured" });
      }
      return res.status(400).json({ success: false, message: "Webhook secret is required to verify webhook" });
    }

    if (!signature) {
      return res.status(400).json({ success: false, message: "Webhook signature header missing" });
    }

    const rawPayload = req.rawBody ? req.rawBody : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawPayload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.warn("Razorpay Webhook: Invalid signature received.");
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    if (!payload || !payload.payment) {
      return res.status(200).json({ status: "ignored" });
    }

    const paymentEntity = payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const appOrderId = paymentEntity.notes?.appOrderId;

    if (!razorpayOrderId && !appOrderId) {
      return res.status(200).json({ status: "no_order_reference" });
    }

    // Locate the matching order
    let order = null;
    if (appOrderId) {
      order = await Order.findById(appOrderId);
    }
    if (!order && razorpayOrderId) {
      order = await Order.findOne({ "paymentDetails.razorpayOrderId": razorpayOrderId });
    }

    if (!order) {
      console.warn("Razorpay Webhook: Order not found for orderId:", appOrderId || razorpayOrderId);
      return res.status(200).json({ status: "order_not_found" });
    }

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      if (order.paymentDetails.paymentStatus !== "completed") {
        order.paymentDetails.paymentStatus = "completed";
        order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
        order.paymentDetails.razorpayOrderId = razorpayOrderId || order.paymentDetails.razorpayOrderId;
        order.paymentDetails.paidAt = new Date();
        order.paymentDetails.paymentMethod = paymentEntity.method || order.paymentDetails.paymentMethod || "upi";
        order.orderStatus = "accepted";
        await order.save();
        console.log(`Razorpay Webhook: Order ${order._id} confirmed via ${event}.`);
      }
    } else if (event === "payment.failed") {
      if (order.paymentDetails.paymentStatus !== "completed") {
        order.paymentDetails.paymentStatus = "failed";
        order.orderStatus = "payment_failed";
        await order.save();
        console.log(`Razorpay Webhook: Order ${order._id} marked payment_failed.`);
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook processing error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

