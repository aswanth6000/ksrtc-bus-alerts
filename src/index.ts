import express, { Request, Response } from "express";
import { parse } from "url";
import { RequestHandler } from "express";
import rateLimit from 'express-rate-limit';
import { Alert } from "./models/alert.model";
import Email from "./models/email.model";
import { connectToDatabase } from "./database.connection";
import serverless from "serverless-http";
import cors from "cors";
const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://ksrtc-bus-alerts.vercel.app/",
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
  await Email.create({ email });

  const createdAlert = await Alert.create(alert);
  if (createdAlert) {
    res.json({ message: "✅ Alert created successfully!" });
  } else {
    res.status(500).json({ message: "❌ Failed to create alert" });
  }
}) as RequestHandler);

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: '✅ Server is running' });
});

export const handler = serverless(app);
