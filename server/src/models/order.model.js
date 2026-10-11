import mongoose from "mongoose";

const OrderSchema = mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "rider",
      required: false,
    },
    orderItems: {
      type: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "menuItem",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "pickedUp",
        "onTheWay",
        "outForDelivery",
        "undeliverable",
        "delivered",
        "cancelled",
        "failed",
        "payment_failed",
        "rejected",
      ],
      default: "pending",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    billDetails: {
      type: {
        totalAmount: { type: Number, required: true },
        platformFee: { type: Number, required: true },
        convenienceFee: { type: Number, required: true },
        taxAmount: { type: Number, required: true },
        deliveryCharge: { type: Number, required: true },
        discountAmount: { type: Number, required: true },
        finalAmount: { type: Number, required: true },
      },
    },
    deliveryAddress: {
      type: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pinCode: { type: String, required: true },
        country: { type: String, required: true },
        geoLocation: {
          type: {
            lat: {
              type: String,
            },
            lon: {
              type: String,
            },
          },
        },
      },
    },

    paymentDetails: {
      type: {
        paymentMethod: {
          type: String,
          enum: ["card", "upi", "cod", "test"],
          required: true,
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed", "cancelled"],
          default: "pending",
        },
        razorpayOrderId: { type: String, required: false },
        razorpayPaymentId: { type: String, required: false, sparse: true, unique: true },
        razorpaySignature: { type: String, required: false },
        razorpayQrId: { type: String, required: false },
        paidAt: { type: Date, required: false },
      },
    },
  },
  {
    timestamps: true,
  },
);

// High-performance compound indexes for production queries
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, orderStatus: 1 });
OrderSchema.index({ "paymentDetails.razorpayOrderId": 1 });
OrderSchema.index({ createdAt: -1 });

const Order = mongoose.model("order", OrderSchema);

export default Order;
