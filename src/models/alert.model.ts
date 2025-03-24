import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
  email: string;
  fromCity: number;
  toCity: number;
  date: string;
  timeRangeStart: string;
  timeRangeEnd: string;
}

const AlertSchema = new Schema({
  email: { type: String, required: true },
  fromCity: { type: Number, required: true },
  toCity: { type: Number, required: true },
  date: { type: String, required: true },
  timeRangeStart: { type: String, required: true },
  timeRangeEnd: { type: String, required: true },
});

export const Alert = mongoose.model<IAlert>("Alert", AlertSchema);
