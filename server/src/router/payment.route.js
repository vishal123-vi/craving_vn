import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import { paymentLimiter } from "../middleware/security.middleware.js";
import {
  CreateRazorpayOrder,
  VerifyRazorpayPayment,
  CancelRazorpayPayment,
  GetPaymentConfigStatus,
  VerifySandboxPayment,
  GetPaymentOrderStatus,
  HandleRazorpayWebhook,
} from "../controller/payment.controller.js";

const router = express.Router();

router.get("/config-status", GetPaymentConfigStatus);
router.get("/order-status/:orderId", AuthProtect, GetPaymentOrderStatus);
router.post("/create-order",   AuthProtect, paymentLimiter, CreateRazorpayOrder);
router.post("/verify",         AuthProtect, VerifyRazorpayPayment);
router.post("/cancel",         AuthProtect, CancelRazorpayPayment);
router.post("/sandbox-verify", AuthProtect, VerifySandboxPayment);
router.post("/webhook",        HandleRazorpayWebhook);

export default router;
