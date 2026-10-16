import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: function() { return !this.googleId; },
    },
    dob: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: function() { return !this.googleId; },
      select: false,
    },
    photo: {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
      },
    },
    userType: {
      type: String,
      enum: ["admin", "customer", "rider", "restaurant"],
      required: true,
      default: "customer",
    },
    lastPasswordChange: {
      type: Date,
      default: null,
    },
    addresses: [
      {
        address: { type: String, default: "" },
        city: { type: String, default: "Bhopal" },
        state: { type: String, default: "Madhya Pradesh" },
        pincode: { type: String, default: "" },
        country: { type: String, default: "India" },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

const User = mongoose.model("user", UserSchema);

export default User;
