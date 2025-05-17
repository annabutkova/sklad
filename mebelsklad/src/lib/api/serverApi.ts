// src/lib/api/serverApi.ts
import path from 'path';
import fs from 'fs/promises';
import { Product, ProductSet, Category } from '@/types';

// Путь к директории с данными
const dataDir = path.join(process.cwd(), 'data');
const productsPath = path.join(dataDir, 'products.json');
const setsPath = path.join(dataDir, 'product-sets.json');
const categoriesPath = path.join(dataDir, 'categories.json');

// Вспомогательные функции для работы с файлами
async function readJsonFile<T>(filePath: string): Promise<T> {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        throw error;
    }
}

// API для работы с продуктами
export const productsApi = {
    async getAllProducts(): Promise<Product[]> {
        return readJsonFile<Product[]>(productsPath);
    },

    async getProductById(id: string): Promise<Product | null> {
        const products = await readJsonFile<Product[]>(productsPath);
        return products.find(product => product.id === id) || null;
    },

    async saveProduct(product: Product): Promise<Product> {
        const products = await readJsonFile<Product[]>(productsPath);
        const index = products.findIndex(p => p.id === product.id);

        if (index >= 0) {
            products[index] = product;
        } else {
            products.push(product);
        }

        await writeJsonFile(productsPath, products);
        return product;
    },

    async deleteProduct(id: string): Promise<void> {
        const products = await readJsonFile<Product[]>(productsPath);
        const filteredProducts = products.filter(p => p.id !== id);
        await writeJsonFile(productsPath, filteredProducts);
    }
};

// API для работы с комплектами продуктов
export const setsApi = {
    async getAllSets(): Promise<ProductSet[]> {
        return readJsonFile<ProductSet[]>(setsPath);
    },

    async getSetById(id: string): Promise<ProductSet | null> {
        const sets = await readJsonFile<ProductSet[]>(setsPath);
        return sets.find(set => set.id === id) || null;
    },

    async saveSet(set: ProductSet): Promise<ProductSet> {
        const sets = await readJsonFile<ProductSet[]>(setsPath);
        const index = sets.findIndex(s => s.id === set.id);

        if (index >= 0) {
            sets[index] = set;
        } else {
            sets.push(set);
        }

        await writeJsonFile(setsPath, sets);
        return set;
    },

    async deleteSet(id: string): Promise<void> {
        const sets = await readJsonFile<ProductSet[]>(setsPath);
        const filteredSets = sets.filter(s => s.id !== id);
        await writeJsonFile(setsPath, filteredSets);
    },

    async getSetCategories(): Promise<Category[]> {
        const categories = await categoriesApi.getAllCategories();
        const sets = await this.getAllSets();

        // Создаем Map для хранения уникальных категорий комплектов
        const setCategoriesMap = new Map<string, Category>();

        // Перебираем все комплекты и добавляем их категории в Map
        sets.forEach(set => {
            if (set.categoryIds) {
                set.categoryIds.forEach(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    if (category) {
                        setCategoriesMap.set(category.id, category);
                    }
                });
            }
        });

        // Возвращаем массив категорий комплектов
        return Array.from(setCategoriesMap.values());
    },
};

// API для работы с категориями
export const categoriesApi = {
    async getAllCategories(): Promise<Category[]> {
        return readJsonFile<Category[]>(categoriesPath);
    },

    async getCategoryById(id: string): Promise<Category | null> {
        const categories = await readJsonFile<Category[]>(categoriesPath);
        return categories.find(category => category.id === id) || null;
    },

    async saveCategory(category: Category): Promise<Category> {
        const categories = await readJsonFile<Category[]>(categoriesPath);
        const index = categories.findIndex(c => c.id === category.id);

        if (index >= 0) {
            categories[index] = category;
        } else {
            categories.push(category);
        }

        await writeJsonFile(categoriesPath, categories);
        return category;
    },

    async deleteCategory(id: string): Promise<void> {
        const categories = await readJsonFile<Category[]>(categoriesPath);
        const filteredCategories = categories.filter(c => c.id !== id);
        await writeJsonFile(categoriesPath, filteredCategories);
    },

    // Build category tree
    async getCategoryTree(): Promise<Category[]> {
        const categories = await this.getAllCategories();
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // First pass: create map of all categories
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        // Second pass: build hierarchy
        categories.forEach(category => {
            const categoryWithChildren = categoryMap.get(category.id);
            if (!categoryWithChildren) return;

            if (category.parentId && categoryMap.has(category.parentId)) {
                // This is a child category
                const parent = categoryMap.get(category.parentId);
                parent?.children?.push(categoryWithChildren);
            } else {
                // This is a root category
                rootCategories.push(categoryWithChildren);
            }
        });

        return rootCategories;
    },
};