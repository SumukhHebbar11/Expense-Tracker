import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "./models/Transaction.js";
import User from "./models/User.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne();
    if (!user) {
      process.exit(1);
    }

    await Transaction.deleteMany({ userId: user._id });

    mongoose.connection.close();
  } catch (error) {
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
