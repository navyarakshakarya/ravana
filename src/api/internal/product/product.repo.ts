import { UpdateQuery } from "mongoose";
import { Product, IProductDocument } from ".";

export const getProducts = async (): Promise<IProductDocument[]> => {
  return Product.find({ active: true, deletedAt: null }).populate("category").lean().exec();
};

export const getProduct = async (id: string): Promise<IProductDocument | null> => {
  return Product.findOne({ _id: id, active: true, deletedAt: null }).populate("category").populate("stocks").lean().exec();
};

export const getProductByCode = async (code: string): Promise<IProductDocument | null> => {
  return Product.findOne({ productCode: code, active: true, deletedAt: null }).populate("category").populate("stocks").lean().exec();
}

export const getProductsByCategory = async (category: string): Promise<IProductDocument[]> => {
  return Product.find({ category, active: true, deletedAt: null }).populate("category").lean().exec();
};

export const createProduct = async (product: IProductDocument): Promise<IProductDocument> => {
  return new Product(product).save();
};

export const updateProduct = async (id: string, update: Partial<IProductDocument>): Promise<IProductDocument | null> => {
  const updateQuery: UpdateQuery<IProductDocument> = { $set: update };
  return Product.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, updateQuery, { new: true }).lean().exec();
};

export const deleteProduct = async (id: string): Promise<IProductDocument | null> => {
  const updateQuery: UpdateQuery<IProductDocument> = { $set: { active: false, deletedAt: new Date() } };
  return Product.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, updateQuery, { new: true }).lean().exec();
};

export const restoreProduct = async (id: string): Promise<IProductDocument | null> => {
  const updateQuery: UpdateQuery<IProductDocument> = { $set: { active: true, deletedAt: null } };
  return Product.findOneAndUpdate({ _id: id, active: false }, updateQuery, { new: true }).lean().exec();
}
