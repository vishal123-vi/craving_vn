import Customer from "../models/customer.model.js";

// Helper to get or create customer for current user
const getOrCreateCustomer = async (userId) => {
  let customer = await Customer.findOne({ customerId: userId });
  if (!customer) {
    customer = await Customer.create({
      customerId: userId,
      addressBook: [],
    });
  }
  return customer;
};

// ─── GET /customer/profile ───────────────────────────────────────────────────
export const getCustomerProfile = async (req, res, next) => {
  try {
    const customer = await getOrCreateCustomer(req.user._id);
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /customer/address ──────────────────────────────────────────────────
export const addCustomerAddress = async (req, res, next) => {
  try {
    const { name, address, city, state, country = "India", addressType = "home", isDefault = false, geoLocation } = req.body;
    const pinCode = req.body.pinCode || req.body.pincode;
    const resolvedName = name || req.user?.fullName || "Customer";

    if (!address || !city || !state || !pinCode) {
      return res.status(400).json({
        success: false,
        message: "Address, city, state, and pinCode are required",
      });
    }

    const customer = await getOrCreateCustomer(req.user._id);

    // If marked default, unset previous default
    if (isDefault || customer.addressBook.length === 0) {
      customer.addressBook.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      name: resolvedName,
      address,
      city,
      state,
      pinCode: String(pinCode),
      country,
      addressType,
      isDefault: isDefault || customer.addressBook.length === 0,
      geoLocation: geoLocation || { lat: "23.2599", lon: "77.4126" },
    };

    customer.addressBook.push(newAddress);
    await customer.save();

    res.status(201).json({
      success: true,
      message: "Address saved successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /customer/address/:addressId ─────────────────────────────────────────
export const updateCustomerAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const customer = await getOrCreateCustomer(req.user._id);

    const addrIndex = customer.addressBook.findIndex(
      (a) => a._id.toString() === addressId
    );

    if (addrIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const updates = { ...req.body };
    if (updates.pincode && !updates.pinCode) {
      updates.pinCode = updates.pincode;
    }
    if (updates.isDefault) {
      customer.addressBook.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(customer.addressBook[addrIndex], updates);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /customer/address/:addressId ─────────────────────────────────────
export const deleteCustomerAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const customer = await getOrCreateCustomer(req.user._id);

    customer.addressBook = customer.addressBook.filter(
      (a) => a._id.toString() !== addressId
    );

    // If no default remains, make first item default
    if (customer.addressBook.length > 0 && !customer.addressBook.some(a => a.isDefault)) {
      customer.addressBook[0].isDefault = true;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: customer.addressBook,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /customer/address/:addressId/default ──────────────────────────────
export const setDefaultCustomerAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const customer = await getOrCreateCustomer(req.user._id);

    customer.addressBook.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Default address updated",
      data: customer.addressBook,
    });
  } catch (error) {
    next(error);
  }
};
