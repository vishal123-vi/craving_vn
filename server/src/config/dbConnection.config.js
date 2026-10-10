import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/CravingsFSD08_DB";
    const conn = await mongoose.connect(uri);
    console.log("Mongo DB connected Successfully");
    console.log("DB Host :", conn.connection.host);
    console.log("DB Name :", conn.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

export default connectDB;
