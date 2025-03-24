import express, { Request, Response } from "express";
import { parse } from "url";
import { RequestHandler } from "express";
import { Alert } from "./models/alert.model";
import { connectToDatabase } from "./database.connection";

const app = express();
app.use(express.json());

connectToDatabase();

// Function to extract query parameters from the search URL
const extractParams = (searchUrl: string) => {
  const { query } = parse(searchUrl, true);
  return {
    fromCityID: query.fromCityID,
    toCityID: query.toCityID,
    journeyDate: query.journeyDate,
  };
};

// API to create a bus seat alert
app.post("/alerts", (async (req: Request, res: Response) => {
  const { email, searchUrl, timeRangeStart, timeRangeEnd } = req.body;

  if (!searchUrl) {
    return res.status(400).json({ message: "Search URL is required" });
  }

  const params = extractParams(searchUrl);

  if (!params.fromCityID || !params.toCityID || !params.journeyDate) {
    return res.status(400).json({ message: "Invalid search URL" });
  }

  const alert = {
    email,
    fromCity: params.fromCityID,
    toCity: params.toCityID,
    date: params.journeyDate,
    timeRangeStart,
    timeRangeEnd,
  };

  const createdAlert = await Alert.create(alert);
  console.log(createdAlert);
  if (createdAlert) {
    res.json({ message: "✅ Alert created successfully!" });
  } else {
    res.status(500).json({ message: "❌ Failed to create alert" });
  }
}) as RequestHandler);


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
