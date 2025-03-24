import express, { Request, Response } from "express";
import { parse } from "url";
import nodemailer from "nodemailer";
import axios from "axios";
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

// Function to check bus availability
const checkAvailability = async () => {
  const alerts = await Alert.find({});

  for (const alert of alerts) {
    const apiUrl = `https://onlineksrtcswift.com/api/resource/searchRoutesV4?fromCityID=${alert.fromCity}&toCityID=${alert.toCity}&journeyDate=${alert.date}&mode=oneway`;

    try {
      const response = await axios.get(apiUrl);
      const buses = response.data; // Assuming response contains a list of buses

      const availableBus = buses.find((bus: any) => {
        const departureTime = new Date(bus.DepartureTime);
        const start = new Date(`${alert.date}T${alert.timeRangeStart}:00`);
        const end = new Date(`${alert.date}T${alert.timeRangeEnd}:00`);
        return bus.AvailableSeats > 0 && departureTime >= start && departureTime <= end;
      });

      if (availableBus) {
        sendEmail(alert.email, availableBus);
      }
    } catch (error) {
      console.error("Error fetching bus data:", error);
    }
  }
};

// Function to send email using Nodemailer
const sendEmail = (email: string, bus: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com",
      pass: "your-password",
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Bus Seat Alert 🚍",
    text: `Seats available for ${bus.RouteName}! Price: ₹${bus.Fare}. Book now!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Run every 15 minutes using GitHub Actions or Node-cron

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
