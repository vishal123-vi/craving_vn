import mongoose from "mongoose";
import dns from "node:dns";

// Ensure Atlas mongodb+srv DNS resolution works across all ISP networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/cravings_vn";
    const conn = await mongoose.connect(uri);
    console.log("Mongo DB connected Successfully");
    console.log("DB Host :", conn.connection.host);
    console.log("DB Name :", conn.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

export default connectDB;
