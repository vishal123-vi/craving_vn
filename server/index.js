import cloudinary from "./src/config/cloudinary.config.js";
import express from "express";
import connectDB from "./src/config/dbConnection.config.js";
import AuthRouter from "./src/router/auth.route.js";
import PublicRouter from "./src/router/public.route.js";
import CommonRouter from "./src/router/common.route.js";
import MenuRouter from "./src/router/menu.route.js";
import morgan from "morgan";
import cors from "cors";
import restaurantRouter from "./src/router/restaurant.route.js";
import riderRouter from "./src/router/rider.route.js";
import cookieParser from "cookie-parser";
import customerRouter from "./src/router/customer.route.js";
import adminRouter from "./src/router/admin.route.js";
import PoolRouter from "./src/router/pool.route.js";
import PaymentRouter from "./src/router/payment.route.js";
import OrderRouter from "./src/router/order.route.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://raj-cravings.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(morgan("dev"));


app.use("/auth", AuthRouter);
app.use("/public", PublicRouter);
app.use("/common", CommonRouter);
app.use("/menu", MenuRouter);
app.use("/restaurant", restaurantRouter);
app.use("/admin", adminRouter);
app.use("/customer", customerRouter);
app.use("/rider", riderRouter);
app.use("/pools", PoolRouter);
app.use("/payment", PaymentRouter);
app.use("/order", OrderRouter);

//Default API
app.get("/", (req, res) => {
  console.log("Default Get API Hit");
  res.json({ message: "Welcome to my Cravings Project" });
});

//Default Error Handler

app.use((err, req, res, next) => {
  const ErrMessage = err.message || "Internal Server Error";
  const ErrStausCode = err.statusCode || 500;

  res.status(ErrStausCode).json({ message: ErrMessage });
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log("Server Started on port:", port);
  connectDB();
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const result = await cloudinary.api.ping();
      console.log("Cloudinary Connected :");
      console.log(result);
    } else {
      console.log("Cloudinary credentials not provided in .env (image uploads will be limited).");
    }
  } catch (error) {
    console.warn("Cloudinary Connection Warning:", error.message);
  }
});
