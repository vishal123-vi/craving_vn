import Rider from "../models/rider.model.js";

export const getRiderProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const existingRider = await Rider.findOne({
      riderId: currentUser._id,
    });

    if (!existingRider) {
      return res.status(404).json({
        message: "Rider profile not found",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Rider profile fetched successfully",
      data: existingRider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const riderUpdateProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const riderDataFromFE = req.body;

    // Security Whitelist: Only allow legitimate rider editable fields
    // Privileged fields like status, averageRating, and riderId are strictly protected
    const allowedRiderFields = [
      "vehicleDetails",
      "documents",
      "currentAddress",
      "financialDetails",
      "currentLocation",
      "isAvailable",
    ];

    const existingRider = await Rider.findOne({
      riderId: currentUser._id,
    });

    if (!existingRider) {
      const riderPayload = {
        riderId: currentUser._id,
        status: "inactive",
        averageRating: 0,
      };
      allowedRiderFields.forEach((key) => {
        if (riderDataFromFE[key] !== undefined) {
          riderPayload[key] = riderDataFromFE[key];
        }
      });
      const newRider = await Rider.create(riderPayload);
      return res.status(201).json({
        message: "Rider profile created successfully",
        data: newRider,
      });
    } else {
      allowedRiderFields.forEach((key) => {
        if (riderDataFromFE[key] !== undefined) {
          existingRider.set(key, riderDataFromFE[key]);
        }
      });
      await existingRider.save();
      return res.status(200).json({
        message: "Rider profile updated successfully",
        data: existingRider,
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const toggleRiderAvailability = async (req, res, next) => {
  try {
    const currentUser = req.user;
    let rider = await Rider.findOne({ riderId: currentUser._id });

    if (!rider) {
      rider = await Rider.create({
        riderId: currentUser._id,
        isAvailable: true,
        status: "active",
        vehicleDetails: {
          vehicleType: "Bike",
          vehicleNumber: "MP04AB1234",
          vehicleModel: "Hero Splendor",
          vehicleColor: "Black"
        },
        documents: {
          drivingLicense: "PENDING",
          vehicleRegistrationCertificate: "PENDING",
          insuranceCertificate: "PENDING",
          aadharCard: "PENDING",
          panCard: "PENDING"
        },
        currentAddress: {
          address: "Bhopal",
          city: "Bhopal",
          state: "Madhya Pradesh",
          pinCode: "462001",
          country: "India"
        },
        financialDetails: {
          bankName: "State Bank of India",
          accountNumber: "000000000000",
          ifscCode: "SBIN000000"
        }
      });
    } else {
      rider.isAvailable = !rider.isAvailable;
      await rider.save();
    }

    return res.status(200).json({
      success: true,
      message: `You are now ${rider.isAvailable ? "Online" : "Offline"}`,
      data: rider,
    });
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
