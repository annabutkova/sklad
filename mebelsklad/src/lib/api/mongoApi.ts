import 'server-only';
import { ProductModel, CategoryModel, ProductSetModel } from '../db/models';
import connectToDatabase from '../db/mongodb';
import { Product, ProductSet, Category } from '@/types';

// Убедимся, что соединение с базой данных установлено
async function ensureDbConnection() {
    await connectToDatabase();
}

// API для работы с продуктами
export const productsApi = {
    async getAllProducts(): Promise<Product[]> {
        await ensureDbConnection();
        const products = await ProductModel.find({}).lean();
        // Убираем _id и __v поля, добавленные MongoDB
        return products.map(p => {
            const { _id, __v, ...product } = p;
            return product as unknown as Product;
        });
    },

    async getProductById(id: string): Promise<Product | null> {
        await ensureDbConnection();
        const product = await ProductModel.findOne({ id }).lean();
        if (!product) return null;

        const { _id, __v = 0, ...productData } = product as { _id: unknown; __v?: number;[key: string]: any };
        return productData as unknown as Product;
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        await ensureDbConnection();
        const product = await ProductModel.findOne({ slug }).lean();
        if (!product) return null;

        const { _id, __v = 0, ...productData } = product as { _id: unknown; __v?: number;[key: string]: any };
        return productData as unknown as Product;
    },

    async getProductsByCollection(collection: string): Promise<Product[]> {
        await ensureDbConnection();
        const products = await ProductModel.find({ collection }).lean();
        return products.map(p => {
            const { _id, __v, ...product } = p;
            return product as unknown as Product;
        });
    },

    async saveProduct(product: Product): Promise<Product> {
        await ensureDbConnection();
        await ProductModel.updateOne(
            { id: product.id },
            product,
            { upsert: true }
        );
        return product;
    },

    async deleteProduct(id: string): Promise<void> {
        await ensureDbConnection();
        await ProductModel.deleteOne({ id });
    }
};

// API для работы с категориями
export const categoriesApi = {
    async getAllCategories(): Promise<Category[]> {
        await ensureDbConnection();
        const categories = await CategoryModel.find({}).lean();
        return categories.map(c => {
            const { _id, __v, ...category } = c;
            return category as unknown as Category;
        });
    },

    async getCategoryById(id: string): Promise<Category | null> {
        await ensureDbConnection();
        const category = await CategoryModel.findOne({ id }).lean();
        if (!category) return null;

        const { _id, __v, ...categoryData } = category as { _id: unknown; __v: number;[key: string]: any };
        return categoryData as unknown as Category;
    },

    async saveCategory(category: Category): Promise<Category> {
        await ensureDbConnection();
        await CategoryModel.updateOne(
            { id: category.id },
            category,
            { upsert: true }
        );
        return category;
    },

    async deleteCategory(id: string): Promise<void> {
        await ensureDbConnection();
        await CategoryModel.deleteOne({ id });
    },

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

// API для работы с наборами
export const setsApi = {
    async getAllSets(): Promise<ProductSet[]> {
        await ensureDbConnection();
        const sets = await ProductSetModel.find({}).lean();
        return sets.map(s => {
            const { _id, __v, ...set } = s;
            return set as unknown as ProductSet;
        });
    },

    async getSetById(id: string): Promise<ProductSet | null> {
        await ensureDbConnection();
        const set = await ProductSetModel.findOne({ id }).lean();
        if (!set) return null;

        const { _id, __v, ...setData } = set as { _id: unknown; __v: number;[key: string]: any };
        return setData as unknown as ProductSet;
    },

    async getSetBySlug(slug: string): Promise<ProductSet | null> {
        await ensureDbConnection();
        const set = await ProductSetModel.findOne({ slug }).lean();
        if (!set) return null;

        const { _id, __v = 0, ...setData } = set as { _id: unknown; __v?: number;[key: string]: any };
        return setData as unknown as ProductSet;
    },

    async getSetsByCollection(collection: string): Promise<ProductSet[]> {
        await ensureDbConnection();
        const sets = await ProductSetModel.find({ collection }).lean();
        return sets.map(s => {
            const { _id, __v, ...set } = s;
            return set as unknown as ProductSet;
        });
    },

    async saveSet(set: ProductSet): Promise<ProductSet> {
        await ensureDbConnection();
        await ProductSetModel.updateOne(
            { id: set.id },
            set,
            { upsert: true }
        );
        return set;
    },

    async deleteSet(id: string): Promise<void> {
        await ensureDbConnection();
        await ProductSetModel.deleteOne({ id });
    },

    async getSetCategories(): Promise<Category[]> {
        await ensureDbConnection();
        const categories = await CategoryModel.find({}).lean();
        const sets = await ProductSetModel.find({}).lean();

        // Создаем Map для хранения уникальных категорий комплектов
        const setCategoriesMap = new Map<string, Category>();

        // Перебираем все комплекты и добавляем их категории в Map
        sets.forEach(set => {
            if (set.categoryIds) {
                set.categoryIds.forEach((categoryId: string) => {
                    const category = categories.find(c => c.id === categoryId);
                    if (category) {
                        const { _id, __v, ...categoryData } = category;
                        setCategoriesMap.set(category.id, categoryData as unknown as Category);
                    }
                });
            }
        });

        // Возвращаем массив категорий комплектов
        return Array.from(setCategoriesMap.values());
    }
};