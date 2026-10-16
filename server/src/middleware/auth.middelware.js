import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const extractToken = (req) => {
  if (req.cookies?.Oreo) return req.cookies.Oreo;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

const extractOtpToken = (req) => {
  if (req.cookies?.kitkat) return req.cookies.kitkat;
  if (req.cookies?.otpToken) return req.cookies.otpToken;
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

export const AuthProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id || decode._id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const OTPAuthProtect = async (req, res, next) => {
  try {
    const token = extractOtpToken(req);
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id || decode._id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RestaurantAuthProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id || decode._id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    if (verifiedUser.userType !== "restaurant") {
      const error = new Error("Unauthorized Access");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const RiderAuthProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id || decode._id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    if (verifiedUser.userType !== "rider") {
      const error = new Error("Unauthorized Access");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

export const AdminAuthProtect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    const verifiedUser = await User.findById(decode.id || decode._id);
    if (!verifiedUser) {
      const error = new Error("Session Expired");
      error.statusCode = 401;
      return next(error);
    }

    if (verifiedUser.userType !== "admin") {
      const error = new Error("Unauthorized Access");
      error.statusCode = 403;
      return next(error);
    }

    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
