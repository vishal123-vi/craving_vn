import express from "express";
import { getRiderProfile, riderUpdateProfile, toggleRiderAvailability } from "../controller/rider.controller.js";
import { RiderAuthProtect } from "../middleware/auth.middelware.js";

const router = express.Router();

router.post(
  "/update-profile",
  RiderAuthProtect,
  riderUpdateProfile
);

router.get("/get-profile", RiderAuthProtect, getRiderProfile);
router.patch("/toggle-availability", RiderAuthProtect, toggleRiderAvailability);

export default router;
