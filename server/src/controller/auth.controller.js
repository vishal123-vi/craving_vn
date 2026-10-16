import User from "../models/user.model.js";
import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import { genToken } from "../utils/auth.service.js";
import OTP from "../models/otp.model.js";
import { genOTPToken } from "../utils/auth.service.js";
import { sendOTPEmail } from "../utils/email.service.js";

export const RegisterUser = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, userType } =
      req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !phone ||
      !userType
    ) {
      const error = new Error("All fields Required");
      error.statusCode = 400;
      return next(error);
    }

    const allowedRegistrationTypes = ["customer", "restaurant", "rider"];
    if (userType === "admin" || !allowedRegistrationTypes.includes(userType)) {
      const error = new Error("Registration with admin or unauthorized role is not permitted");
      error.statusCode = 403;
      return next(error);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email already registred");
      error.statusCode = 409;
      return next(error);
    }

    const photoURL = `https://placehold.co/600x400?text=${fullName.charAt(0).toUpperCase()}`;

    const photo = {
      url: photoURL,
      publicId: null,
    };
    const SALT = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, SALT);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      photo,
      userType,
    });

    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    next(error);
  }
};

export const LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("All fields Required");
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      const error = new Error("Email not registred");
      error.statusCode = 404;
      return next(error);
    }

    const isVerified = await bcrypt.compare(password, existingUser.password);
    if (!isVerified) {
      const error = new Error("Incorrect Password");
      error.statusCode = 401;
      return next(error);
    }

    const token = await genToken(existingUser, res);

    const userObj = existingUser.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Welcome Back",
      data: userObj,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const LogoutUser = async (req, res, next) => {
  try {
    res.clearCookie("Oreo", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ message: "Logout Sucessfully" });
  } catch (error) {
    next(error);
  }
};

export const SendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      return next(error);
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      const error = new Error("Please enter a valid email address.");
      error.statusCode = 400;
      return next(error);
    }

    // Find existing user or automatically provision account so ANY person entering their email receives OTP!
    let existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      const tempPass = await bcrypt.hash(Math.random().toString(36), 10);
      const nameFromEmail = normalizedEmail.split("@")[0].replace(/[._-]/g, " ");
      existingUser = await User.create({
        fullName: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: normalizedEmail,
        password: tempPass,
        phone: "9876543210",
        userType: "customer",
        photo: { url: `https://placehold.co/400x400?text=${normalizedEmail.charAt(0).toUpperCase()}` },
      });
      await Customer.create({ customerId: existingUser._id });
    }

    // Enforce 60-second cooldown between OTP requests
    const existingOTP = await OTP.findOne({ email: existingUser.email });
    if (existingOTP && existingOTP.createdAt) {
      const elapsedSeconds =
        (Date.now() - new Date(existingOTP.createdAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const waitSeconds = Math.ceil(60 - elapsedSeconds);
        const error = new Error(
          `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
        );
        error.statusCode = 429;
        return next(error);
      }
    }

    // Generate standard 6-digit numeric OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(newOTP, 10);
    if (existingOTP) {
      await existingOTP.deleteOne();
    }

    const savedOTP = await OTP.create({
      email: existingUser.email,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds validity
    });

    console.log(`\n======================================================`);
    console.log(`🔑 [PASSWORD RESET OTP GENERATED]`);
    console.log(`📧 Recipient: ${existingUser.email} (${existingUser.fullName})`);
    console.log(`🔢 OTP Code: ${newOTP}`);
    console.log(`⏳ Expires: in 60 seconds`);
    console.log(`======================================================\n`);

    // Send OTP via Nodemailer and await delivery confirmation
    try {
      const mailInfo = await sendOTPEmail(
        existingUser.email,
        newOTP,
        existingUser.fullName,
      );

      console.log(`✅ [EMAIL SENT SUCCESSFULLY] MessageId: ${mailInfo.messageId}`);

      return res.status(200).json({
        message: `OTP sent successfully to '${existingUser.email}' (Check Inbox & Spam folder)`,
        messageId: mailInfo.messageId,
      });
    } catch (mailError) {
      console.error(`❌ [EMAIL DELIVERY FAILED]:`, mailError.message);
      // Rollback generated OTP if email delivery failed
      await savedOTP.deleteOne();
      mailError.statusCode = mailError.statusCode || 500;
      return next(mailError);
    }
  } catch (error) {
    next(error);
  }
};
export const VerifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      const error = new Error("Email and OTP are required");
      error.statusCode = 400;
      return next(error);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingOTP = await OTP.findOne({ email: normalizedEmail });
    if (!existingOTP || (existingOTP.expiresAt && new Date() > new Date(existingOTP.expiresAt))) {
      if (existingOTP) {
        await existingOTP.deleteOne();
      }
      const error = new Error("The OTP has expired! The old OTP will no longer work; please resend the OTP.");
      error.statusCode = 401;
      return next(error);
    }

    const isVerified = await bcrypt.compare(otp.toString().trim(), existingOTP.otp);
    if (!isVerified) {
      existingOTP.attempts = (existingOTP.attempts || 0) + 1;
      if (existingOTP.attempts >= 5) {
        await existingOTP.deleteOne();
        const error = new Error("Too many incorrect OTP attempts (5/5). This OTP has been invalidated. Please request a new OTP.");
        error.statusCode = 429;
        return next(error);
      }
      await existingOTP.save();
      const remaining = 5 - existingOTP.attempts;
      const error = new Error(`Invalid OTP. You have ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
      error.statusCode = 401;
      return next(error);
    }

    await existingOTP.deleteOne();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) {
      const error = new Error("Email not registered");
      error.statusCode = 404;
      return next(error);
    }

    const otpToken = await genOTPToken(existingUser, res);
    res
      .status(200)
      .json({ message: "OTP verified. Create You New Password Now", token: otpToken });
  } catch (error) {
    next(error);
  }
};
export const ResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    const currentUser = req.user;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    currentUser.password = hashedPassword;
    currentUser.lastPasswordChange = new Date();

    await currentUser.save();

    res.status(200).json({ message: "Password Changed" });
  } catch (error) {
    next(error);
  }
};

