import mongoose from "mongoose";

export interface ICategoryDocument extends mongoose.Document {
  name: string;
  description: string;
  active: boolean;
  deletedAt?: Date;
}

export const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true },
  deletedAt: { type: Date },
});

export const Category = mongoose.model<ICategoryDocument>("Category", CategorySchema)