import jwt from "jsonwebtoken";

export const genToken = async (user, res) => {
  try {
    const payload = { id: user._id };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("Oreo", token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return token;
  } catch (error) {
    throw error;
  }
};

export const genOTPToken = async (user, res) => {
  try {
    const payload = { id: user._id };

    const token = await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("kitkat", token, {
      maxAge: 1000 * 60 * 10,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return token;
  } catch (error) {
    throw error;
  }
};
