import express from "express";
import multer from "multer";
import { restaurantUpdateProfile, getRestaurantProfile, toggleRestaurantStatus } from "../controller/restaurant.controller.js";
import { RestaurantAuthProtect } from "../middleware/auth.middelware.js";

const upload = multer();
const router = express.Router();

router.post(
  "/update-profile",
  RestaurantAuthProtect,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "restaurantImage", maxCount: 10 },
  ]),
  restaurantUpdateProfile,
);

router.patch(
  "/update-profile",
  RestaurantAuthProtect,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "restaurantImage", maxCount: 10 },
  ]),
  restaurantUpdateProfile,
);

router.get("/get-profile", RestaurantAuthProtect, getRestaurantProfile);
router.patch("/toggle-status", RestaurantAuthProtect, toggleRestaurantStatus);

export default router;
