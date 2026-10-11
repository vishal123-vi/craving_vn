import mongoose from "mongoose";
import dns from "node:dns";

// Ensure Atlas mongodb+srv DNS resolution works across all ISP networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

const connectDB = async () => {
  const localUri = "mongodb://127.0.0.1:27017/cravings_vn";
  const primaryUri = process.env.MONGO_DB_URI;

  try {
    const uri = primaryUri || localUri;
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Mongo DB connected Successfully");
    console.log("DB Host :", conn.connection.host);
    console.log("DB Name :", conn.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);

    // If cloud Atlas URI fails (e.g. bad credentials or network), fallback to local MongoDB
    if (primaryUri && primaryUri !== localUri) {
      console.log("Attempting fallback to local MongoDB (127.0.0.1:27017)...");
      try {
        const fallbackConn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to Local MongoDB fallback successfully!");
        console.log("DB Host :", fallbackConn.connection.host);
        console.log("DB Name :", fallbackConn.connection.name);
      } catch (fallbackError) {
        console.error("Local MongoDB fallback also failed:", fallbackError.message);
      }
    }
  }
};

export default connectDB;
