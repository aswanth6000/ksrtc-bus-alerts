import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { Bus } from "./models/bus.model";
import { Alert, IAlert } from "./models/alert.model";
import { emailConfig } from "./config";
import { connectToDatabase } from "./database.connection";
import dotenv from "dotenv";

dotenv.config();

const EMAIL = process.env.EMAIL!;

async function checkAlerts(): Promise<void> {
  connectToDatabase();
  const alerts: IAlert[] = await Alert.find();

  for (const alert of alerts) {
    const bus = await Bus.findOne({
      FromCityID: alert.fromCity,
      ToCityID: alert.toCity,
      JourneyDate: alert.date,
      DepartureTime: { $gte: alert.timeRangeStart, $lte: alert.timeRangeEnd },
      AvailableSeats: { $gt: 0 },
    });

    if (bus) {
      await sendEmail(alert.email, bus);
    }
  }
  await mongoose.disconnect();
}

async function sendEmail(email: string, bus: any): Promise<void> {
  const transporter = nodemailer.createTransport(emailConfig);

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Bus Seat Available!",
    text: `A seat is available for your route ${bus.RouteName} on ${bus.JourneyDate}. Book Now!`,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📩 Alert sent to ${email}`);
}

checkAlerts();
