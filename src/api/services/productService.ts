// src/api/services/ProductService.ts
import { productsData } from "../data/productsData";
import { Product } from "../models/productModel";

// Fetch all products
export const getProducts = (): Product[] => {
  return productsData;
};

// Fetch a product by ID
export const getProductById = (id: number): Product | undefined => {
  return productsData.find(product => product.id === id);
};

// Add a new product
export const createProduct = (newProduct: Product): Product => {
  newProduct.id = productsData.length + 1;
  productsData.push(newProduct);
  return newProduct;
};

// Update an existing product
export const updateProduct = (updatedProduct: Product): void => {
  const index = productsData.findIndex(product => product.id === updatedProduct.id);
  if (index !== -1) {
    productsData[index] = updatedProduct;
  }
};

// Delete a product by ID
export const deleteProduct = (id: number): void => {
  const index = productsData.findIndex(product => product.id === id);
  if (index !== -1) {
    productsData.splice(index, 1);
  }
};
