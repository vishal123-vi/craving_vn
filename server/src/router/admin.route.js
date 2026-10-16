import express from "express";
import { 
  getAllRestaurants, 
  updateRestaurantStatus, 
  getAdminDashboardStats, 
  getAllUsers 
} from "../controller/admin.controller.js";
import { AdminAuthProtect } from "../middleware/auth.middelware.js";

const router = express.Router();

// Admin Routes
router.get("/dashboard-stats", AdminAuthProtect, getAdminDashboardStats);
router.get("/users", AdminAuthProtect, getAllUsers);
router.get("/restaurants", AdminAuthProtect, getAllRestaurants);
router.patch("/restaurants/:id/status", AdminAuthProtect, updateRestaurantStatus);

export default router;
