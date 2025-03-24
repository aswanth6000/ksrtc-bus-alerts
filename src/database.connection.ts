import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


export const connectToDatabase = async () => {
  const mongoURI = process.env.MONGO_URI!;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined in the environment variables");
  }
  await mongoose.connect(mongoURI).then(() => {
    console.log("✅ Connected to database");
  }).catch((error) => {
    console.error("❌ Error connecting to database:", error);
  });
};
