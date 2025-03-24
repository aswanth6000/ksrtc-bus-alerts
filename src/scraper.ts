import axios from "axios";
import mongoose from "mongoose";
import { Bus, IBus } from "./models/bus.model";
import { connectToDatabase } from "./database.connection";
async function fetchBusData(): Promise<void> {
  try {
    connectToDatabase();

    const url =
      "https://onlineksrtcswift.com/search?mode=oneway&fromCity=298|Bangalore&toCity=472|Iritty&departDate=28-03-2025";
    
    const response = await axios.get(url);
    const buses: IBus[] = response.data;

    for (const bus of buses) {
      await Bus.updateOne(
        { RouteScheduleId: bus.RouteScheduleId },
        { $set: bus },
        { upsert: true }
      );
    }
    console.log("✅ Bus data updated successfully.");
  } catch (error) {
    console.error("❌ Error fetching bus data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fetchBusData();
