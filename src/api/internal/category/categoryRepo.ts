import { UpdateQuery } from "mongoose";
import { ICategoryDocument, Category } from "./categoryModel";

export const getCategories = async (): Promise<ICategoryDocument[]> =>
  await Category.find().lean().exec();

export const getCategoryById = async (id: string): Promise<ICategoryDocument | null> =>
  await Category.findById(id).lean().exec();

export const createCategory = async (category: ICategoryDocument): Promise<ICategoryDocument> =>
  await new Category(category).save();

export const updateCategory = async (category: Partial<ICategoryDocument>): Promise<ICategoryDocument | null> => {
  const updateQuery: UpdateQuery<ICategoryDocument> = { $set: category };
  return await Category.findOneAndUpdate({ _id: category._id }, updateQuery, { new: true });
};

export const softDeleteCategory = async (id: string): Promise<ICategoryDocument | null> =>
  await Category.findOneAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } }, { new: true });
