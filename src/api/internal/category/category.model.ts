import mongoose from "mongoose";

export interface ICategoryDocument extends mongoose.Document {
  categoryCode: string;
  name: string;
  description?: string;
  // Audit
  active?: boolean;
  createdBy: string;
  updatedBy: string;
  deletedAt: Date;
}

export const CategorySchema = new mongoose.Schema({
  categoryCode: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  // Audit
  active: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
  deletedAt: { type: Date }
}, { timestamps: true, versionKey: false });

CategorySchema.index({ categoryCode: 1 }, { unique: true });
CategorySchema.index({ name: 1 }, { unique: true });

CategorySchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  this.categoryCode = this.categoryCode.toUpperCase();
  this.name = this.name.toUpperCase();
  next();
});

CategorySchema.pre("findOneAndUpdate", async function (next) {
  const updated = this.getUpdate() as any;
  if (updated.$set.categoryCode) updated.$set.categoryCode = updated.$set.categoryCode.toUpperCase();
  if (updated.$set.name) updated.$set.name = updated.$set.name.toUpperCase();
  next();
})

export const Category = mongoose.model<ICategoryDocument>("Category", CategorySchema);