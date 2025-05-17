'use server'

import { productsApi, categoriesApi, setsApi } from '../api/mongoApi';
import { Product, Category, ProductSet } from '@/types';

// Экспорт функций для работы с продуктами
export async function getAllProducts(): Promise<Product[]> {
    return productsApi.getAllProducts();
}

export async function getProductById(id: string): Promise<Product | null> {
    return productsApi.getProductById(id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    return productsApi.getProductBySlug(slug);
}

export async function getProductsByCollection(collection: string): Promise<Product[]> {
    return productsApi.getProductsByCollection(collection);
}

// Экспорт функций для работы с категориями
export async function getAllCategories(): Promise<Category[]> {
    return categoriesApi.getAllCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
    return categoriesApi.getCategoryById(id);
}

export async function getCategoryTree(): Promise<Category[]> {
    return categoriesApi.getCategoryTree();
}

// Экспорт функций для работы с наборами
export async function getAllSets(): Promise<ProductSet[]> {
    return setsApi.getAllSets();
}

export async function getSetById(id: string): Promise<ProductSet | null> {
    return setsApi.getSetById(id);
}

export async function getSetBySlug(slug: string): Promise<ProductSet | null> {
    return setsApi.getSetBySlug(slug);
}

export async function getSetsByCollection(collection: string): Promise<ProductSet[]> {
    return setsApi.getSetsByCollection(collection);
}

export async function getSetCategories(): Promise<Category[]> {
    return setsApi.getSetCategories();
}