import { IProductDocument } from "./productModel";
import * as productRepo from "./productRepo";

export const getProducts = async () => 
  await productRepo.getProducts();

export const getProductById = async (id: string) => 
  await productRepo.getProductById(id)

export const createProduct = async (product: IProductDocument) => 
  await productRepo.createProduct(product) 

export const updateProduct = async (product: IProductDocument) =>
  await productRepo.updateProduct(product)

export const softDeleteProduct = async (id: string) =>
  await productRepo.deleteProduct(id)