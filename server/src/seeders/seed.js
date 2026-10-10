import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/dbConnection.config.js";
import adminSeed from "./admin.seed.js";
import userSeed from "./user.seed.js";
import restaurantSeed from "./restaurant.seed.js";
import menuSeed from "./menu.seed.js";

const Seed = async () => {
  try {
    await connectDB();

    await adminSeed();
    await userSeed();
    await restaurantSeed();
    await menuSeed();
    //Call The Function which we need to Seed.
  } catch (error) {
    console.log(error.message);
  }
  finally {
    process.exit(0);
  }
};

Seed();
