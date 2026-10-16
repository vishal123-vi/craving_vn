import Contact from "../models/contact.model.js";
import Feedback from "../models/feedback.model.js";
import Restaurant from "../models/restaurant.model.js";
import Menu from "../models/menu.model.js";
export const validateFeedbackPayload = (data = {}) => {
  const errors = {};

  if (!data.fullName?.trim()) errors.fullName = "Full name is required";
  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email";
  }
  if (!data.category?.trim()) errors.category = "Category is required";
  if (!data.message?.trim()) errors.message = "Message is required";
  if (!data.rating) errors.rating = "Rating is required";

  return { ok: Object.keys(errors).length === 0, errors };
};

export const ContactUsForm = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    if (!fullName || !email || !phone || !subject || !message) {
      const error = new Error("All fields Required");
      error.statusCode = 400;
      return next(error);
    }

    await Contact.create({
      fullName,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      message: "Thanks for Contacting us! You will hear back from us soon",
    });
  } catch (error) {
    next(error);
  }
};

export const FeedbackForm = async (req, res, next) => {
  try {
    const validation = validateFeedbackPayload(req.body);

    if (!validation.ok) {
      const error = new Error("Please fill the required fields correctly");
      error.statusCode = 400;
      error.details = validation.errors;
      return next(error);
    }

    const { fullName, email, category, rating, message } = req.body;

    await Feedback.create({
      fullName,
      email,
      category,
      rating: Number(rating),
      message,
    });

    res.status(201).json({
      success: true,
      message: "Thanks for your feedback! We appreciate your input.",
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurants = async (req, res, next) => {
  try {
    // Show restaurants that are both approved by Admin and opened by Manager
    const restaurants = await Restaurant.find({ 
      isOpen: true,
      status: "active"
    }).select("-documents -financialDetails -contactDetails");
    
    res.status(200).json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    next(error);
  }
};

export const getDishFeed = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const maxCalories = parseInt(req.query.maxCalories);
    const minProtein = parseInt(req.query.minProtein);
    const maxCarbs = parseInt(req.query.maxCarbs);
    const maxFats = parseInt(req.query.maxFats);

    const matchStage = { "menuItems.status": "available" };
    if (maxCalories) matchStage["menuItems.macros.calories"] = { $lte: maxCalories };
    if (minProtein) matchStage["menuItems.macros.protein"] = { $gte: minProtein };
    if (maxCarbs) matchStage["menuItems.macros.carbs"] = { $lte: maxCarbs };
    if (maxFats) matchStage["menuItems.macros.fats"] = { $lte: maxFats };

    // Use aggregation to get a flat list of menu items from all restaurants
    const feed = await Menu.aggregate([
      { $unwind: "$menuItems" },
      { $match: matchStage },
      // Optional: join with restaurant to get restaurant name
      {
        $lookup: {
          from: "restaurants", // Make sure this matches the collection name
          localField: "restaurantId",
          foreignField: "_id",
          as: "restaurantDetails"
        }
      },
      { $unwind: "$restaurantDetails" },
      {
        $project: {
          _id: "$menuItems._id",
          restaurantId: "$restaurantId",
          restaurantName: "$restaurantDetails.restaurantName",
          itemName: "$menuItems.itemName",
          description: "$menuItems.description",
          price: "$menuItems.price",
          category: "$menuItems.category",
          type: "$menuItems.type",
          image: "$menuItems.image",
          rating: "$menuItems.rating",
          reviewCount: "$menuItems.reviewCount",
          tags: "$menuItems.tags",
          macros: "$menuItems.macros",
          isTopRated: "$menuItems.isTopRated",
          isRecommended: "$menuItems.isRecommended",
          isNew: "$menuItems.isNew"
        }
      },
      // Randomize or sort by some algorithm for the feed. Let's just sort by newest/recommended for now
      { $sort: { isRecommended: -1, isNew: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      data: feed,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

export const getDishReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    // For Phase 1, we just return mock reviews or empty array if we don't have a Review model yet
    // Since we didn't create a Review model in Phase 1 plan, returning empty array to avoid breaking UI
    res.status(200).json({
      success: true,
      data: [],
      message: "Reviews will be populated once Review schema is fully active."
    });
  } catch (error) {
    next(error);
  }
};

export const GetAllRestaurants = async (req, res, next) => {
  try {
    // Admin sees ALL restaurants regardless of status or open/closed
    const restaurants = await Restaurant.find({});
    res.status(200).json({ data: restaurants });
  } catch (error) {
    next(error);
  }
};

export const GetRestaurantDetails = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId).populate("managerId");
    
    if (!restaurant) {
      const error = new Error("Restaurant not found");
      error.statusCode = 404;
      return next(error);
    }

    const menu = await Menu.findOne({ restaurantId });

    const restaurantDetails = {
      restaurantId: restaurant,
      menuItems: menu ? menu.menuItems : []
    };

    res.status(200).json({ data: restaurantDetails });
  } catch (error) {
    next(error);
  }
};
