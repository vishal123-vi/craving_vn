import express from "express";
import { AuthProtect } from "../middleware/auth.middelware.js";
import {
  getCustomerProfile,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "../controller/customer.controller.js";

const router = express.Router();

router.get("/profile", AuthProtect, getCustomerProfile);
router.post("/address", AuthProtect, addCustomerAddress);
router.put("/address/:addressId", AuthProtect, updateCustomerAddress);
router.delete("/address/:addressId", AuthProtect, deleteCustomerAddress);
router.patch("/address/:addressId/default", AuthProtect, setDefaultCustomerAddress);

export default router;