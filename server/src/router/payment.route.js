import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import {
  CreateRazorpayOrder,
  VerifyRazorpayPayment,
  CancelRazorpayPayment,
  GetPaymentConfigStatus,
  VerifySandboxPayment,
  GetPaymentOrderStatus,
} from "../controller/payment.controller.js";

const router = express.Router();

router.get("/config-status", GetPaymentConfigStatus);
router.get("/order-status/:orderId", AuthProtect, GetPaymentOrderStatus);
router.post("/create-order",   AuthProtect, CreateRazorpayOrder);
router.post("/verify",         AuthProtect, VerifyRazorpayPayment);
router.post("/cancel",         AuthProtect, CancelRazorpayPayment);
router.post("/sandbox-verify", AuthProtect, VerifySandboxPayment);

export default router;
