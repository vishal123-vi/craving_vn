import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersForRider,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/create", AuthProtect, createOrder);
router.get("/my-orders", AuthProtect, getMyOrders);
router.get("/track/:orderId", AuthProtect, getOrderById);
router.patch("/cancel/:orderId", AuthProtect, cancelOrder);
router.get("/rider-orders", AuthProtect, getAllOrdersForRider);

export default router;
