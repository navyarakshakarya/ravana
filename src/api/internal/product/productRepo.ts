import { UpdateQuery } from "mongoose";
import { IProductDocument, Product } from "./productModel";

export const getProducts = async (): Promise<IProductDocument[]> =>
  await Product.find().lean().exec();

export const getProductById = async (id: string): Promise<IProductDocument | null> =>
  await Product.findById(id).populate("category").lean().exec();

export const createProduct = async (product: IProductDocument): Promise<IProductDocument> =>
  await new Product(product).save();

export const updateProduct = async (product: Partial<IProductDocument>): Promise<IProductDocument | null> => {
  const updateQuery: UpdateQuery<IProductDocument> = { $set: product };
  return await Product.findOneAndUpdate({ _id: product._id }, updateQuery, { new: true });
};

export const deleteProduct = async (id: string): Promise<IProductDocument | null> =>
  await Product.findOneAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } }, { new: true });
