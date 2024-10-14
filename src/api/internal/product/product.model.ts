import mongoose from "mongoose";

export interface IProductDocument extends mongoose.Document {
  productCode?: string;
  name: string;
  description?: string;
  stockLevel?: number;
  currentPrice?: number;
  category: mongoose.ObjectId;
  stocks?: mongoose.ObjectId[];

  // Audit
  active?: boolean;
  createdBy: string;
  updatedBy: string;
  deletedAt?: Date;
}

const ProductSchema = new mongoose.Schema({
  productCode: { type: String },
  name: { type: String, required: true },
  description: { type: String },
  stockLevel: { type: Number, default: 0 },
  currentPrice: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock", default: []}],

  // Audit
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  deletedAt: { type: Date }
}, { timestamps: true, versionKey: false });

ProductSchema.index({ productCode: 1 }, { unique: true });
ProductSchema.index({ name: 1, category: 1 }, { unique: true });

ProductSchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  this.name = this.name.toUpperCase();
  if (this.productCode) {
    this.productCode = this.productCode.toUpperCase();
    return next();
  }
  const product = this;
  const category = await mongoose.model("Category").findById(product.category);
  if (!category) return next(new Error('Category not found'));
  const productCount = await mongoose.model("Product").countDocuments({ category: product.category });
  const productCodeSuffix = (productCount + 1).toString().padStart(3, '0');
  product.productCode = `${category.categoryCode}-${productCodeSuffix}`;
  next();
});

ProductSchema.pre("findOneAndUpdate", async function (next) {
  const updated = this.getUpdate() as any;
  if (updated.$set.name) updated.$set.name = updated.$set.name.toUpperCase();
  if (updated.$set.productCode) updated.$set.productCode = updated.$set.productCode.toUpperCase();
  next();
})

export const Product = mongoose.model<IProductDocument>(
  "Product",
  ProductSchema
);
