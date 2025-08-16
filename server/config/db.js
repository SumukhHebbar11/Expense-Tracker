import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message || error);
    // rethrow so caller can decide how to handle (and so logs are visible in deployments)
    throw error;
  }
};

export default connectDB;
