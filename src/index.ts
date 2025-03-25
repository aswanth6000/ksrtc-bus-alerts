import express, { Request, Response } from "express";
import { parse } from "url";
import { RequestHandler } from "express";
import rateLimit from 'express-rate-limit';
import { Alert } from "./models/alert.model";
import { connectToDatabase } from "./database.connection";
import serverless from "serverless-http";
import cors from "cors";
import { Email } from "./models/email.model";
const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://ksrtc-bus-alerts.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Create a limiter that allows 10 requests per IP address per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { message: '❌ Too many requests, please try again later.' }
});

// Apply the rate limiting middleware to the alerts endpoint
app.use('/alerts', limiter);

connectToDatabase();

// Function to extract query parameters from the search URL
const extractParams = (searchUrl: string) => {
  const { query } = parse(searchUrl, true);

  // Extract city IDs from the format "298|Bangalore"
  const fromCityID = query.fromCity?.toString().split('|')[0];
  const toCityID = query.toCity?.toString().split('|')[0];
  const journeyDate = query.departDate;

  return {
    fromCityID,
    toCityID,
    journeyDate,
  };
};

// API to create a bus seat alert
app.post("/alerts", (async (req: Request, res: Response) => {
  try {
    const { email, searchUrl, timeRangeStart, timeRangeEnd } = req.body;

    if (!email || !searchUrl) {
      return res.status(400).json({ message: "Email and search URL are required" });
    }

    const params = extractParams(searchUrl);

    if (!params.fromCityID || !params.toCityID || !params.journeyDate) {
      return res.status(400).json({
        message: "Invalid search URL. Expected format: .../search?fromCity=298|Bangalore&toCity=472|Iritty&departDate=28-03-2025..."
      });
    }

    const alert = {
      email,
      fromCity: parseInt(params.fromCityID),
      toCity: parseInt(params.toCityID),
      date: params.journeyDate,
      timeRangeStart,
      timeRangeEnd,
    };
    const existingEmail = await Email.findOne({ email });
    if (!existingEmail) {
      const createdEmail = await Email.create({ email });
      if (!createdEmail) {
        return res.status(500).json({ message: "❌ Failed to create email" });
      }
    }
    const createdAlert = await Alert.create(alert);
    if (createdAlert) {
      res.json({ message: "✅ Alert created successfully!" });
    } else {
      res.status(500).json({ message: "❌ Failed to create alert" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "❌ Failed to create alert", error: error.message });
  }
}) as RequestHandler);

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: '✅ Server is running' });
});

export const handler = serverless(app);
