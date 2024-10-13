import mongoose from "mongoose";

export interface IProductDocument extends mongoose.Document {
  name: string;
  category: mongoose.ObjectId;
  description: string;
  currentPrice: number;
  active: boolean;
  // stocks: mongoose.ObjectId[];
  deletedAt?: Date;
}

export const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: { type: String },
  currentPrice: { type: Number, required: true },
  // stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock" }],
  deletedAt: { type: Date },
})

export const Product = mongoose.model<IProductDocument>("Product", ProductSchema)