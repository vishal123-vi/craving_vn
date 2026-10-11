import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Menu from "../models/menu.model.js";

// ─── POST /order/create ──────────────────────────────────────────────────────
export const createOrder = async (req, res, next) => {
  try {
    const { restaurantId, paymentMethod, orderItems, geoLocation, deliveryAddress, discountAmount = 0 } = req.body;
    const userId = req.user._id;

    if (!restaurantId || !orderItems || !orderItems.length) {
      const error = new Error("Restaurant ID and order items are required");
      error.statusCode = 400;
      return next(error);
    }

    let customer = await Customer.findOne({ customerId: userId });
    if (!customer) {
      customer = await Customer.create({ customerId: userId });
    }

    // ── Prevent Duplicate Order Submissions (within 15 seconds) ────────────
    const duplicateWindow = new Date(Date.now() - 15000);
    const existingRecentOrder = await Order.findOne({
      customerId: customer._id,
      restaurantId,
      createdAt: { $gte: duplicateWindow },
      orderStatus: { $in: ["pending", "accepted"] },
      "paymentDetails.paymentStatus": "pending",
    });

    if (existingRecentOrder) {
      return res.status(200).json({
        success: true,
        message: "Existing pending order retrieved",
        data: existingRecentOrder,
      });
    }

    // ── Server-side Trusted Price & Bill Calculation ────────────────────────
    let calculatedSubtotal = 0;
    const menu = await Menu.findOne({ restaurantId });
    if (menu && menu.menuItems) {
      for (const item of orderItems) {
        const dbItem = menu.menuItems.find(
          (mi) => mi._id.toString() === item.itemId.toString()
        );
        if (dbItem) {
          calculatedSubtotal += Number(dbItem.price) * (Number(item.quantity) || 1);
        }
      }
    }

    const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : (Number(req.body.amount) || 0);
    const platformFee = 5;
    // Free delivery over ₹300, else ₹30 standard delivery
    const deliveryCharge = subtotal >= 300 ? 0 : 30;
    const taxAmount = Math.round(subtotal * 0.05); // 5% GST
    const discount = Math.min(Number(discountAmount) || 0, subtotal);
    const finalAmount = Math.max(0, subtotal + platformFee + deliveryCharge + taxAmount - discount);

    // ── Resolve Delivery Address ───────────────────────────────────────────
    const defaultUserAddress = req.user.addresses && req.user.addresses.length > 0 ? req.user.addresses[0] : null;
    const resolvedAddress = {
      name: deliveryAddress?.name || req.user.fullName || "Customer",
      address: deliveryAddress?.address || defaultUserAddress?.address || "Hostel Block A, Near Campus Gate",
      city: deliveryAddress?.city || defaultUserAddress?.city || "Bhopal",
      state: deliveryAddress?.state || defaultUserAddress?.state || "Madhya Pradesh",
      pinCode: deliveryAddress?.pinCode || deliveryAddress?.pincode || defaultUserAddress?.pincode || "462001",
      country: deliveryAddress?.country || defaultUserAddress?.country || "India",
      geoLocation: geoLocation || deliveryAddress?.geoLocation || { lat: "23.2599", lon: "77.4126" },
    };

    const method = paymentMethod || "cod";
    const isCod = method === "cod";

    // IMPORTANT: Payment status is ALWAYS strictly "pending" upon creation!
    // COD payment is pending until cash is collected upon delivery.
    // Online payment is pending until cryptographic signature verification.
    const newOrder = new Order({
      restaurantId,
      customerId: customer._id,
      orderItems,
      billDetails: {
        totalAmount: subtotal,
        platformFee,
        convenienceFee: 0,
        taxAmount,
        deliveryCharge,
        discountAmount: discount,
        finalAmount,
      },
      deliveryAddress: resolvedAddress,
      orderStatus: isCod ? "accepted" : "pending",
      paymentDetails: {
        paymentMethod: method,
        paymentStatus: "pending",
        paidAt: null,
      },
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: isCod 
        ? "Order placed successfully! Pay on delivery." 
        : "Order initiated. Proceed to secure online payment.",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /order/my-orders ────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let customer = await Customer.findOne({ customerId: userId });
    if (!customer) {
      customer = await Customer.create({ customerId: userId });
    }

    let orders = await Order.find({ customerId: customer._id })
      .populate("restaurantId", "restaurantName email phone coverImage address city")
      .populate("riderId", "vehicleDetails currentLocation averageRating status")
      .sort({ createdAt: -1 });

    // Note: We deliberately DO NOT mutate orders with artificial timers.
    // Order progression reflects genuine restaurant and rider updates.

    // Convert to plain objects to attach populated menu items
    orders = orders.map(o => o.toObject());

    for (let order of orders) {
      if (order.restaurantId && order.restaurantId._id) {
        const menu = await Menu.findOne({ restaurantId: order.restaurantId._id });
        if (menu && menu.menuItems) {
          order.orderItems = order.orderItems.map((orderItem) => {
            const menuItemDetails = menu.menuItems.find(
              (mi) => mi._id.toString() === orderItem.itemId?.toString()
            );
            return {
              ...orderItem,
              itemId: menuItemDetails || orderItem.itemId,
            };
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    next(error);
  }
};

// ─── GET /order/track/:orderId ───────────────────────────────────────────────
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    let customer = await Customer.findOne({ customerId: userId });

    const query = { _id: orderId };
    // If not admin, restrict customer to their own orders
    if (req.user.userType === "customer" && customer) {
      query.customerId = customer._id;
    }

    const order = await Order.findOne(query)
      .populate("restaurantId", "restaurantName email phone address city geoLocation coverImage")
      .populate("riderId", "vehicleDetails currentLocation averageRating status");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const orderObj = order.toObject();

    // Populate item details
    if (order.restaurantId && order.restaurantId._id) {
      const menu = await Menu.findOne({ restaurantId: order.restaurantId._id });
      if (menu && menu.menuItems) {
        orderObj.orderItems = orderObj.orderItems.map((oi) => {
          const mi = menu.menuItems.find((m) => m._id.toString() === oi.itemId?.toString());
          return {
            ...oi,
            itemDetails: mi || oi.itemId,
          };
        });
      }
    }

    res.status(200).json({
      success: true,
      data: orderObj,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /order/cancel/:orderId ────────────────────────────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    let customer = await Customer.findOne({ customerId: userId });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer profile not found" });
    }

    const order = await Order.findOne({ _id: orderId, customerId: customer._id });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Cancellation rule: cannot cancel after kitchen preparation begins
    const nonCancellableStates = ["preparing", "ready", "pickedUp", "onTheWay", "outForDelivery", "delivered"];
    if (nonCancellableStates.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled because the restaurant has already begun preparing the food.",
      });
    }

    if (["cancelled", "rejected", "failed", "payment_failed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled or closed.",
      });
    }

    order.orderStatus = "cancelled";
    if (order.paymentDetails.paymentStatus === "completed") {
      order.paymentDetails.paymentStatus = "cancelled"; // Flagged for refund
    } else {
      order.paymentDetails.paymentStatus = "failed";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /order/rider-orders ─────────────────────────────────────────────────
export const getAllOrdersForRider = async (req, res, next) => {
  try {
    let orders = await Order.find({ 
      orderStatus: { $in: ["accepted", "preparing", "ready", "pickedUp", "onTheWay", "outForDelivery", "delivered"] } 
    })
      .populate("restaurantId", "restaurantName email phone address city geoLocation")
      .populate("customerId", "customerId") 
      .sort({ createdAt: -1 });

    orders = orders.map(o => o.toObject());

    for (let order of orders) {
      if (order.restaurantId && order.restaurantId._id) {
        const menu = await Menu.findOne({ restaurantId: order.restaurantId._id });
        if (menu && menu.menuItems) {
          order.orderItems = order.orderItems.map((orderItem) => {
            const menuItemDetails = menu.menuItems.find(
              (mi) => mi._id.toString() === orderItem.itemId?.toString()
            );
            return {
              ...orderItem,
              itemId: menuItemDetails || orderItem.itemId,
            };
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching rider orders:", error);
    next(error);
  }
};
