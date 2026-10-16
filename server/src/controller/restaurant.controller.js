import Restaurant from "../models/restaurant.model.js";
import {
  uploadMultipleImages,
  deleteMultipleImages,
  UploadSingleImage,
  deleteSingleImage,
} from "../utils/image.service.js";

export const getRestaurantProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const existingRestaurants = await Restaurant.find({
      managerId: currentUser._id,
    });

    return res.status(200).json({
      message: "Restaurants fetched successfully",
      data: existingRestaurants, // This is now an array
    });
  } catch (error) {
    next(error);
  }
};

export const restaurantUpdateProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const restaurantDataFromFE = req.body;
    const coverImageFromFE = req.files?.coverImage?.[0];
    const restaurantImageFromFE = req.files?.restaurantImage;
    const { restaurantId } = req.body;

    // Security Whitelist: Only allow legitimate restaurant editable fields
    // Privileged fields like status (approval), averageRating, numReviews, and managerId are strictly protected
    const allowedRestaurantFields = [
      "restaurantName",
      "address",
      "city",
      "state",
      "pinCode",
      "country",
      "geoLocation",
      "documents",
      "financialDetails",
      "contactDetails",
      "servingHours",
      "isOpen",
      "cuisineTypes",
      "description",
      "restaurantType",
      "socialMediaLinks",
      "coverImage",
      "restaurantImage",
    ];

    let existingRestaurant = null;
    if (restaurantId) {
      existingRestaurant = await Restaurant.findOne({
        _id: restaurantId,
        managerId: currentUser._id,
      });

      if (!existingRestaurant) {
        return res.status(404).json({
          message: "Restaurant profile not found or unauthorized",
        });
      }
    } else {
      existingRestaurant = await Restaurant.findOne({
        managerId: currentUser._id,
      });
    }

    if (existingRestaurant && existingRestaurant.status === "blocked") {
      return res.status(403).json({
        message: "Restaurant account has been suspended by Admin.",
      });
    }

    if (restaurantDataFromFE.socialMediaLinks) {
      try {
        restaurantDataFromFE.socialMediaLinks = JSON.parse(restaurantDataFromFE.socialMediaLinks);
      } catch (e) {
        console.error("Failed to parse socialMediaLinks", e);
      }
    }

    if (!existingRestaurant) {
      if (coverImageFromFE) {
        const coverImage = await UploadSingleImage(
          coverImageFromFE,
          `restaurant/${currentUser.phone}/coverPhoto`,
        );
        restaurantDataFromFE.coverImage = coverImage;
      }

      if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
        const restaurantImage = await uploadMultipleImages(
          restaurantImageFromFE,
          `restaurant/${currentUser.phone}/restaurantPhotos`,
        );
        restaurantDataFromFE.restaurantImage = restaurantImage;
      }

      const restaurantPayload = {
        managerId: currentUser._id,
        status: "inactive",
        averageRating: 0,
        numReviews: 0,
      };
      allowedRestaurantFields.forEach((key) => {
        if (restaurantDataFromFE[key] !== undefined) {
          restaurantPayload[key] = restaurantDataFromFE[key];
        }
      });

      const newRestaurant = await Restaurant.create(restaurantPayload);
      return res.status(201).json({
        message: "Restaurant profile created successfully",
        data: newRestaurant,
      });
    } else {
      if (coverImageFromFE) {
        await deleteSingleImage(existingRestaurant.coverImage);

        const coverImage = await UploadSingleImage(
          coverImageFromFE,
          `restaurant/${currentUser.phone}/coverPhoto`,
        );
        restaurantDataFromFE.coverImage = coverImage;
      }
      if (restaurantDataFromFE.existingRestaurantImages) {
        try {
          const keptImages = JSON.parse(restaurantDataFromFE.existingRestaurantImages);
          const keptImageUrls = keptImages.map((img) => img.url);
          
          // Find images that exist in the DB but are NOT in the keptImages array
          const imagesToDelete = existingRestaurant.restaurantImage.filter(
            (img) => !keptImageUrls.includes(img.url)
          );
          
          // Delete only the removed images from Cloudinary
          if (imagesToDelete.length > 0) {
            await deleteMultipleImages(imagesToDelete);
          }
          
          // Temporarily set restaurantDataFromFE.restaurantImage to keptImages
          restaurantDataFromFE.restaurantImage = keptImages;
        } catch (e) {
          console.error("Failed to parse existingRestaurantImages", e);
        }
      }

      if (restaurantImageFromFE && restaurantImageFromFE.length > 0) {
        const newImages = await uploadMultipleImages(
          restaurantImageFromFE,
          `restaurant/${currentUser.phone}/restaurantPhotos`,
        );
        
        if (restaurantDataFromFE.restaurantImage) {
           restaurantDataFromFE.restaurantImage = [...restaurantDataFromFE.restaurantImage, ...newImages];
        } else {
           restaurantDataFromFE.restaurantImage = newImages;
        }
      }
      allowedRestaurantFields.forEach((key) => {
        if (restaurantDataFromFE[key] !== undefined) {
          existingRestaurant.set(key, restaurantDataFromFE[key]);
        }
      });
      await existingRestaurant.save();
      return res.status(200).json({
        message: "Restaurant profile updated successfully",
        data: existingRestaurant,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const toggleRestaurantStatus = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { restaurantId } = req.body;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    const existingRestaurant = await Restaurant.findOne({
      _id: restaurantId,
      managerId: currentUser._id,
    });

    if (!existingRestaurant) {
      return res.status(404).json({
        message: "Restaurant profile not found",
        data: null,
      });
    }

    // Security check: Only allow opening if Admin has approved the restaurant
    if (!existingRestaurant.isOpen && existingRestaurant.status !== "active") {
      const msg =
        existingRestaurant.status === "blocked"
          ? "Your restaurant account has been suspended by Admin."
          : "Restaurant is awaiting Admin approval. It cannot be opened until approved.";
      return res.status(403).json({ message: msg });
    }

    existingRestaurant.isOpen = !existingRestaurant.isOpen;
    await existingRestaurant.save();

    return res.status(200).json({
      message: `Restaurant is now ${existingRestaurant.isOpen ? "Open" : "Closed"}`,
      data: existingRestaurant,
    });
  } catch (error) {
    next(error);
  }
};
