import mongoose, { Schema, Document } from "mongoose";

export interface IBus extends Document {
  RouteScheduleId: string;
  RouteName: string;
  DepartureTime: Date;
  ArrivalTime: Date;
  AvailableSeats: number;
  Fare: number;
  BusType: string;
}

const BusSchema = new Schema({
  RouteScheduleId: { type: String, required: true, unique: true },
  RouteName: String,
  DepartureTime: Date,
  ArrivalTime: Date,
  AvailableSeats: Number,
  Fare: Number,
  BusType: String,
});

export const Bus = mongoose.model<IBus>("Bus", BusSchema);
