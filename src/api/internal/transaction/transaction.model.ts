import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionDocument extends Document {
  product: mongoose.ObjectId;
  transactionCode: string;
  quantity: number; // Quantity added or removed
  remainingQuantity: number; // For FIFO, track remaining quantity
  price: number; // Price per unit
  sellPrice: number; // Price per unit
  receivedAt: Date; // Date when the stock was received
  transactionType: 'IN' | 'OUT' | "ADJUST"; // Track inflow (IN) and outflow (OUT)
  description?: string;
  
  // Audit
  active: boolean;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  transactionCode: { type: String },
  quantity: { type: Number, required: true },
  remainingQuantity: { type: Number, required: true }, // To track FIFO consumption
  price: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  receivedAt: { type: Date, default: Date.now },
  transactionType: { type: String, enum: ['IN', 'OUT', 'ADJUST'], required: true },
  description: { type: String },

  // Audit
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  deletedAt: { type: Date }
}, { timestamps: true });

export const Transaction = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema);
