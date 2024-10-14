import { UpdateQuery } from "mongoose";
import { Category, ICategoryDocument } from ".";

export const getCategories = async (): Promise<ICategoryDocument[]> => {
  return Category.find({ active: true, deletedAt: null }).lean().exec();
}

export const getCategory = async (id: string): Promise<ICategoryDocument | null> => {
  return Category.findOne({ _id: id, active: true, deletedAt: null }).lean().exec();
}

export const getCategoryByCode = async (code: string): Promise<ICategoryDocument | null> => {
  return Category.findOne({ categoryCode: code, active: true, deletedAt: null }).lean().exec();
}

export const createCategory = async (category: ICategoryDocument): Promise<ICategoryDocument> => {
  return new Category(category).save();
}

export const updateCategory = async (id: string, update: Partial<ICategoryDocument>): Promise<ICategoryDocument | null> => {
  const updateQuery: UpdateQuery<ICategoryDocument> = { $set: update };
  return Category.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, updateQuery, { new: true }).lean().exec();
}

export const deleteCategory = async (id: string): Promise<ICategoryDocument | null> => {
  const updateQuery: UpdateQuery<ICategoryDocument> = { $set: { active: false, deletedAt: new Date() } };
  return Category.findOneAndUpdate({ _id: id, active: true, deletedAt: null }, updateQuery, { new: true }).lean().exec();
}

export const restoreCategory = async (id: string): Promise<ICategoryDocument | null> => {
  const updateQuery: UpdateQuery<ICategoryDocument> = { $set: { active: true, deletedAt: null } };
  return Category.findOneAndUpdate({ _id: id, active: false }, updateQuery, { new: true }).lean().exec();
}