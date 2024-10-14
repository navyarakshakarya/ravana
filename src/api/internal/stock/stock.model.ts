import mongoose from "mongoose";

export interface IStockDocument extends mongoose.Document {
  product: mongoose.ObjectId;
  stockCode: string;
  quantity: number; // kuantitas awal
  stockLevel: number;
  price: number;
  sellPrice?: number;
  transactions: mongoose.ObjectId[];

  // Audit
  active: boolean;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
}

export const StockSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  stockCode: { type: String },
  quantity: { type: Number, default: 0 },
  stockLevel: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: []}],

  // Audit
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  deletedAt: { type: Date }
}, { timestamps: true, versionKey: false });

StockSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  next();
});

StockSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (!docToUpdate) {
    return next(new Error("Document not found"));
  }
  if (update.$set?.product && update.$set.product.toString() !== docToUpdate.product.toString()) {
    console.log("Product before", docToUpdate.product, "after", update.$set.product.toString());
    return next(new Error("Product cannot be changed once set"));
  }
  next();
});

export const Stock = mongoose.model<IStockDocument>("Stock", StockSchema);
