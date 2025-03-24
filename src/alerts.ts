import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { Alert, IAlert } from "./models/alert.model";
import { connectToDatabase } from "./database.connection";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const EMAIL = process.env.EMAIL!;
const PASSWORD = process.env.PASSWORD!;


const sendEmail = async (email: string, buses: any[]) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });

  const busListText = buses.map(bus =>
    `- ${bus.RouteName}\n  Departure: ${new Date(bus.DepartureTime).toLocaleString()}\n  Price: ₹${bus.Fare}\n  Available Seats: ${bus.AvailableSeats}\n  Bus Type: ${bus.ServiceType}`
  ).join('\n\n');

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "🚍 Bus Seats Available!",
    text: `Good news! We found available seats matching your criteria:\n\n${busListText}\n\nBook now before they're gone!`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Alert sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const checkAvailability = async (alerts: IAlert[]) => {
  console.log("Checking availability");
  try {

    for (const alert of alerts) {
      const apiUrl = `https://onlineksrtcswift.com/api/resource/searchRoutesV4?fromCityID=${alert.fromCity}&toCityID=${alert.toCity}&journeyDate=${alert.date}&mode=oneway`;

      const response = await axios.get(apiUrl);
      const buses = response.data;

      const availableBuses = buses.filter((bus: any) => {
        const departureTime = new Date(bus.DepartureTime);
        const start = new Date(`${alert.date}T${alert.timeRangeStart}:00`);
        const end = new Date(`${alert.date}T${alert.timeRangeEnd}:00`);

        return (
          bus.AvailableSeats > 0 &&
          departureTime >= start &&
          departureTime <= end
        );
      });

      if (availableBuses.length > 0) {
        // Send email with all available buses
        await sendEmail(alert.email, availableBuses);

        // Optionally, remove the alert after notifying
        await Alert.findByIdAndDelete(alert._id);
      }
    }
  } catch (error) {
    console.error('Error checking availability:', error);
  }
};

async function checkAlerts(): Promise<void> {
  connectToDatabase();
  const alerts = await Alert.find({});
  await checkAvailability(alerts);
  await mongoose.disconnect();
}



checkAlerts();
