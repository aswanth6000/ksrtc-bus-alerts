import mongoose, { Schema, Document } from "mongoose";

export interface IEmail extends Document {
  email: string;
}

const EmailSchema = new Schema({
  email: { type: String, required: true },
});

export const Email = mongoose.model<IEmail>("Email", EmailSchema);
