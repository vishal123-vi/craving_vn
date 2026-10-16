import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";

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

// ─── GET /order/restaurant-orders/:restaurantId ──────────────────────────────
export const getOrdersForRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const currentUserId = req.user._id;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant ID is required" });
    }

    // Verify the authenticated manager owns this restaurant
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      managerId: currentUserId,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view orders for this restaurant",
      });
    }

    let orders = await Order.find({ restaurantId })
      .populate({
        path: "customerId",
        populate: {
          path: "customerId",
          select: "fullName email phone photo",
        },
      })
      .populate("riderId", "fullName phone photo")
      .sort({ createdAt: -1 });

    orders = orders.map((o) => o.toObject());

    // Populate itemDetails from the restaurant's menu
    const menu = await Menu.findOne({ restaurantId });
    if (menu && menu.menuItems) {
      for (const order of orders) {
        if (order.orderItems && order.orderItems.length) {
          order.orderItems = order.orderItems.map((oi) => {
            const itemMatch = menu.menuItems.find(
              (mi) => mi._id.toString() === oi.itemId?.toString()
            );
            return {
              ...oi,
              itemDetails: itemMatch || null,
            };
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    next(error);
  }
};

// ─── PATCH /order/restaurant-update-status/:orderId ──────────────────────────
export const updateRestaurantOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, rejectionReason } = req.body;
    const currentUserId = req.user._id;

    const allowedStatuses = ["accepted", "preparing", "ready", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify manager ownership of the restaurant
    const restaurant = await Restaurant.findOne({
      _id: order.restaurantId,
      managerId: currentUserId,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage orders for this restaurant",
      });
    }

    order.orderStatus = status;
    if (status === "rejected" && rejectionReason) {
      order.rejectionReason = rejectionReason;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating restaurant order status:", error);
    next(error);
  }
};

// ─── GET /order/rider/available-orders ───────────────────────────────────────
export const getRiderAvailableOrders = async (req, res, next) => {
  try {
    // Only fetch orders that need delivery and have not been claimed by any rider
    const availableOrders = await Order.find({
      orderStatus: { $in: ["ready", "preparing", "accepted"] },
      $or: [{ riderId: null }, { riderId: { $exists: false } }],
    })
      .populate("restaurantId", "restaurantName address city phone geoLocation coverImage")
      .populate({
        path: "customerId",
        populate: { path: "customerId", select: "fullName phone email" },
      })
      .sort({ createdAt: -1 });

    const ordersWithDetails = [];
    for (let order of availableOrders) {
      const orderObj = order.toObject();
      if (orderObj.restaurantId && orderObj.restaurantId._id) {
        const menu = await Menu.findOne({ restaurantId: orderObj.restaurantId._id });
        if (menu && menu.menuItems) {
          orderObj.orderItems = orderObj.orderItems.map((oi) => {
            const itemMatch = menu.menuItems.find(
              (mi) => mi._id.toString() === oi.itemId?.toString()
            );
            return {
              ...oi,
              itemDetails: itemMatch || null,
            };
          });
        }
      }
      ordersWithDetails.push(orderObj);
    }

    res.status(200).json({
      success: true,
      count: ordersWithDetails.length,
      data: ordersWithDetails,
    });
  } catch (error) {
    console.error("Error fetching available orders for rider:", error);
    next(error);
  }
};

// ─── PATCH /order/rider/claim/:orderId ───────────────────────────────────────
export const claimRiderOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const riderUserId = req.user._id;

    // Concurrency Check 1: Check if this rider already has an active ongoing delivery
    const existingActiveOrder = await Order.findOne({
      riderId: riderUserId,
      orderStatus: { $in: ["accepted", "preparing", "ready", "pickedUp", "onTheWay", "outForDelivery"] },
    });

    if (existingActiveOrder) {
      return res.status(400).json({
        success: false,
        message: "You already have an active delivery task in progress! Complete it before claiming another.",
        activeOrderId: existingActiveOrder._id,
      });
    }

    // Concurrency Check 2: Atomic findOneAndUpdate prevents race conditions between two riders
    const claimedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        $or: [{ riderId: null }, { riderId: { $exists: false } }],
        orderStatus: { $in: ["ready", "preparing", "accepted"] },
      },
      {
        $set: {
          riderId: riderUserId,
        },
      },
      { new: true }
    )
      .populate("restaurantId", "restaurantName address city phone geoLocation")
      .populate({
        path: "customerId",
        populate: { path: "customerId", select: "fullName phone email" },
      });

    if (!claimedOrder) {
      const existing = await Order.findById(orderId);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      if (existing.riderId) {
        return res.status(409).json({
          success: false,
          message: "Sorry, this order was just claimed by another rider!",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Order is not available for delivery (Current status: ${existing.orderStatus})`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order claimed successfully! Head over to the restaurant for pickup.",
      data: claimedOrder,
    });
  } catch (error) {
    console.error("Error claiming order:", error);
    next(error);
  }
};

// ─── GET /order/rider/active-order ───────────────────────────────────────────
export const getRiderActiveOrder = async (req, res, next) => {
  try {
    const riderUserId = req.user._id;

    const activeOrder = await Order.findOne({
      riderId: riderUserId,
      orderStatus: { $in: ["accepted", "preparing", "ready", "pickedUp", "onTheWay", "outForDelivery"] },
    })
      .populate("restaurantId", "restaurantName address city phone geoLocation coverImage")
      .populate({
        path: "customerId",
        populate: { path: "customerId", select: "fullName phone email" },
      });

    if (!activeOrder) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const orderObj = activeOrder.toObject();
    if (orderObj.restaurantId && orderObj.restaurantId._id) {
      const menu = await Menu.findOne({ restaurantId: orderObj.restaurantId._id });
      if (menu && menu.menuItems) {
        orderObj.orderItems = orderObj.orderItems.map((oi) => {
          const itemMatch = menu.menuItems.find(
            (mi) => mi._id.toString() === oi.itemId?.toString()
          );
          return {
            ...oi,
            itemDetails: itemMatch || null,
          };
        });
      }
    }

    res.status(200).json({
      success: true,
      data: orderObj,
    });
  } catch (error) {
    console.error("Error fetching active order:", error);
    next(error);
  }
};

// ─── PATCH /order/rider/status/:orderId ──────────────────────────────────────
export const updateRiderOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const riderUserId = req.user._id;

    const validStatuses = ["pickedUp", "outForDelivery", "delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Safety: Verify that this rider is indeed assigned to this order
    if (!order.riderId || order.riderId.toString() !== riderUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You are not the assigned rider for this order",
      });
    }

    order.orderStatus = status;

    // If delivered, mark payment completed if COD, and save delivery timestamp
    if (status === "delivered") {
      if (order.paymentDetails) {
        order.paymentDetails.paymentStatus = "completed";
        order.paymentDetails.paidAt = new Date();
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating rider order status:", error);
    next(error);
  }
};

// ─── PATCH /order/rider/release/:orderId ────────────────────────────────────
export const releaseRiderOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const riderUserId = req.user._id;

    const order = await Order.findOne({ _id: orderId, riderId: riderUserId });
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Active delivery task not found or not assigned to you" 
      });
    }

    // Release task so other riders can claim it
    order.riderId = null;
    if (["pickedUp", "outForDelivery"].includes(order.orderStatus)) {
      order.orderStatus = "ready";
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: "Delivery task released! The order is now available for other riders to claim.",
      data: order,
    });
  } catch (error) {
    console.error("Error releasing rider order:", error);
    next(error);
  }
};


// ─── GET /order/rider/history ───────────────────────────────────────────────
export const getRiderHistory = async (req, res, next) => {
  try {
    const riderUserId = req.user._id;

    const history = await Order.find({
      riderId: riderUserId,
      orderStatus: { $in: ["delivered", "cancelled"] },
    })
      .populate("restaurantId", "restaurantName address city phone")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Error fetching rider history:", error);
    next(error);
  }
};

// ─── GET /order/rider/earnings ──────────────────────────────────────────────
export const getRiderEarnings = async (req, res, next) => {
  try {
    const riderUserId = req.user._id;

    const completedOrders = await Order.find({
      riderId: riderUserId,
      orderStatus: "delivered",
    }).sort({ updatedAt: -1 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalEarnings = 0;
    let todayEarnings = 0;
    let todayDeliveries = 0;

    for (const order of completedOrders) {
      const fee = order.billDetails?.deliveryCharge > 0 ? order.billDetails.deliveryCharge : 40;
      totalEarnings += fee;

      const orderDate = new Date(order.updatedAt || order.createdAt);
      if (orderDate >= todayStart) {
        todayEarnings += fee;
        todayDeliveries += 1;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalDeliveries: completedOrders.length,
        todayDeliveries,
        totalEarnings,
        todayEarnings,
        recentDeliveries: completedOrders.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Error fetching rider earnings:", error);
    next(error);
  }
};
