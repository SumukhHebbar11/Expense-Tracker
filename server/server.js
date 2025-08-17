import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import familyMemberRoutes from "./routes/familyMemberRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();

// Simple helper to partially mask sensitive values when printing env
const mask = (str) => {
  if (!str) return "<<not set>>";
  if (str.length < 20) return "<<hidden>>";
  return `${str.slice(0, 8)}...${str.slice(-8)}`;
};

let server;

const start = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
      console.log(
        `Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`
      );
      console.log(`Mongo URI: ${mask(process.env.MONGO_URI)}`);
    });
    server.on("error", (err) => {
      console.error("Server error:", err);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/family-members", familyMemberRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.use(errorHandler);

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception - shutting down:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection - shutting down:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received: closing server");
  if (server) server.close(() => console.log("Process terminated"));
});
