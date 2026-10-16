import express from "express";
import { AuthProtect, RestaurantAuthProtect, RiderAuthProtect } from "../middleware/auth.middelware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersForRider,
  getOrdersForRestaurant,
  updateRestaurantOrderStatus,
  getRiderAvailableOrders,
  claimRiderOrder,
  getRiderActiveOrder,
  updateRiderOrderStatus,
  releaseRiderOrder,
  getRiderHistory,
  getRiderEarnings,
} from "../controller/order.controller.js";

const router = express.Router();

router.post("/create", AuthProtect, createOrder);
router.get("/my-orders", AuthProtect, getMyOrders);
router.get("/track/:orderId", AuthProtect, getOrderById);
router.patch("/cancel/:orderId", AuthProtect, cancelOrder);
router.get("/rider-orders", AuthProtect, getAllOrdersForRider);

// ── Restaurant Manager Order Routes ──
router.get("/restaurant-orders/:restaurantId", RestaurantAuthProtect, getOrdersForRestaurant);
router.patch("/restaurant-update-status/:orderId", RestaurantAuthProtect, updateRestaurantOrderStatus);

// ── Rider Delivery Routes ──
router.get("/rider/available-orders", RiderAuthProtect, getRiderAvailableOrders);
router.patch("/rider/claim/:orderId", RiderAuthProtect, claimRiderOrder);
router.get("/rider/active-order", RiderAuthProtect, getRiderActiveOrder);
router.patch("/rider/status/:orderId", RiderAuthProtect, updateRiderOrderStatus);
router.patch("/rider/release/:orderId", RiderAuthProtect, releaseRiderOrder);
router.get("/rider/history", RiderAuthProtect, getRiderHistory);
router.get("/rider/earnings", RiderAuthProtect, getRiderEarnings);

export default router;
