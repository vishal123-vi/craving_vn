import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";
import { UploadSingleImage } from "../utils/image.service.js";

export const getMenuItems = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const menu = await Menu.findOne({ restaurantId });
    res.status(200).json({ success: true, data: menu ? menu.menuItems : [] });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const { itemName, description, price, category, type, travelScore } = req.body;
    const restaurantId = req.body.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant ID is required" });
    }

    // Verify manager ownership
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      managerId: req.user?._id,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage menu for this restaurant",
      });
    }

    if (restaurant.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Restaurant account has been suspended by Admin",
      });
    }

    let uploadedImage = { url: "", publicId: "" };
    if (req.file) {
      const imageResult = await UploadSingleImage(req.file, "menu_items");
      if (imageResult) {
        uploadedImage = {
          url: imageResult.url,
          publicId: imageResult.publicId,
        };
      }
    }

    const newItem = {
      itemName,
      description,
      price: Number(price),
      category,
      type: type || "Vegetarian",
      image: uploadedImage,
      isTopRated: req.body.isTopRated === 'true' || req.body.isTopRated === true,
      isRecommended: req.body.isRecommended === 'true' || req.body.isRecommended === true,
      isNew: req.body.isNew === 'true' || req.body.isNew === true,
      travelScore: travelScore !== undefined ? Number(travelScore) : 100,
      macros: {
        calories: Math.floor(Math.random() * 400) + 200,
        protein: Math.floor(Math.random() * 30) + 5,
        carbs: Math.floor(Math.random() * 50) + 10,
        fats: Math.floor(Math.random() * 30) + 5
      }
    };

    const updatedMenu = await Menu.findOneAndUpdate(
      { restaurantId },
      { $push: { menuItems: newItem } },
      { new: true, upsert: true }
    );

    const addedItem = updatedMenu.menuItems[updatedMenu.menuItems.length - 1];

    res.status(201).json({ success: true, data: addedItem, message: "Menu item created successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { itemName, description, price, category, type, status, travelScore } = req.body;
    const restaurantId = req.body.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant ID is required" });
    }

    // Verify manager ownership
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      managerId: req.user?._id,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update menu for this restaurant",
      });
    }

    if (restaurant.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Restaurant account has been suspended by Admin",
      });
    }

    let imageUpdate = {};
    if (req.file) {
      const imageResult = await UploadSingleImage(req.file, "menu_items");
      if (imageResult) {
        imageUpdate = {
          "menuItems.$.image": {
            url: imageResult.url,
            publicId: imageResult.publicId,
          }
        };
      }
    } else if (req.body.removeImage === 'true') {
      imageUpdate = {
        "menuItems.$.image": { url: "", publicId: "" }
      };
    }

    const setFields = { ...imageUpdate };
    if (itemName !== undefined) setFields["menuItems.$.itemName"] = itemName;
    if (description !== undefined) setFields["menuItems.$.description"] = description;
    if (price !== undefined) setFields["menuItems.$.price"] = Number(price);
    if (category !== undefined) setFields["menuItems.$.category"] = category;
    if (type !== undefined) setFields["menuItems.$.type"] = type;
    if (status !== undefined) setFields["menuItems.$.status"] = status;
    if (travelScore !== undefined) setFields["menuItems.$.travelScore"] = Number(travelScore);
    if (req.body.isTopRated !== undefined) setFields["menuItems.$.isTopRated"] = req.body.isTopRated === 'true' || req.body.isTopRated === true;
    if (req.body.isRecommended !== undefined) setFields["menuItems.$.isRecommended"] = req.body.isRecommended === 'true' || req.body.isRecommended === true;
    if (req.body.isNew !== undefined) setFields["menuItems.$.isNew"] = req.body.isNew === 'true' || req.body.isNew === true;

    const updatedMenu = await Menu.findOneAndUpdate(
      { restaurantId, "menuItems._id": itemId },
      { $set: setFields },
      { new: true }
    );

    if (!updatedMenu) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    const updatedItem = updatedMenu.menuItems.find(item => item._id.toString() === itemId);

    res.status(200).json({ success: true, data: updatedItem, message: "Menu item updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const restaurantId = req.body?.restaurantId || req.query?.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: "Restaurant ID is required" });
    }

    // Verify manager ownership
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      managerId: req.user?._id,
    });

    if (!restaurant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete items from this restaurant",
      });
    }

    if (restaurant.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Restaurant account has been suspended by Admin",
      });
    }

    const updatedMenu = await Menu.findOneAndUpdate(
      { restaurantId },
      { $pull: { menuItems: { _id: itemId } } },
      { new: true }
    );

    if (!updatedMenu) {
      return res.status(404).json({ success: false, message: "Menu or item not found" });
    }

    res.status(200).json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    next(error);
  }
};
