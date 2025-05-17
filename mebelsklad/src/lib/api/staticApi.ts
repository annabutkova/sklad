// src/lib/api/staticApi.ts
import productsData from '../../../data/products.json';
import categoriesData from '../../../data/categories.json';
import setsData from '../../../data/product-sets.json';
import { Product, ProductSet, Category, Collection } from '@/types';

// Хелпер-функция для имитации асинхронных вызовов
const asAsync = <T>(data: T): Promise<T> => Promise.resolve(data);

// API для работы с продуктами
export const productsApi = {
    // Получить все продукты
    async getAllProducts(): Promise<Product[]> {
        return asAsync(productsData as Product[]);
    },

    // Получить продукт по ID
    async getProductById(id: string): Promise<Product | null> {
        const product = productsData.find(p => p.id === id);
        return asAsync(product || null) as Promise<Product | null>;
    },

    // Получить продукт по slug
    async getProductBySlug(slug: string): Promise<Product | null> {
        const product = productsData.find(p => p.slug === slug);
        return asAsync(product || null) as Promise<Product | null>;
    },

    // Получить продукты по коллекции
    async getProductsByCollection(collection: string): Promise<Product[]> {
        const products = productsData.filter(p => p.collection === collection);
        return asAsync(products as Product[]);
    },

    // Сохранить продукт - не работает в статическом режиме
    async saveProduct(product: Product): Promise<Product> {
        console.warn('Product save operation is not available in static mode');
        return asAsync(product);
    },

    // Удалить продукт - не работает в статическом режиме
    async deleteProduct(id: string): Promise<void> {
        console.warn('Product delete operation is not available in static mode');
        return asAsync(undefined);
    }
};

// API для работы с категориями
export const categoriesApi = {
    // Получить все категории
    async getAllCategories(): Promise<Category[]> {
        return asAsync(categoriesData as Category[]);
    },

    // Получить категорию по ID
    async getCategoryById(id: string): Promise<Category | null> {
        const category = categoriesData.find(c => c.id === id);
        return asAsync(category || null) as Promise<Category | null>;
    },

    // Получить категорию по slug
    async getCategoryBySlug(slug: string): Promise<Category | null> {
        const category = categoriesData.find(c => c.slug === slug);
        return asAsync(category || null) as Promise<Category | null>;
    },

    // Сохранить категорию - не работает в статическом режиме
    async saveCategory(category: Category): Promise<Category> {
        console.warn('Category save operation is not available in static mode');
        return asAsync(category);
    },

    // Удалить категорию - не работает в статическом режиме
    async deleteCategory(id: string): Promise<void> {
        console.warn('Category delete operation is not available in static mode');
        return asAsync(undefined);
    },

    // Построение дерева категорий
    async getCategoryTree(): Promise<Category[]> {
        const categories = categoriesData as Category[];
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

        return asAsync(rootCategories);
    }
};

// API для работы с наборами продуктов
export const setsApi = {
    // Получить все наборы
    async getAllSets(): Promise<ProductSet[]> {
        return asAsync(setsData as ProductSet[]);
    },

    // Получить набор по ID
    async getSetById(id: string): Promise<ProductSet | null> {
        const set = setsData.find(s => s.id === id);
        return asAsync(set || null) as Promise<ProductSet | null>;
    },

    // Получить набор по slug
    async getSetBySlug(slug: string): Promise<ProductSet | null> {
        const set = setsData.find(s => s.slug === slug);
        return asAsync(set || null) as Promise<ProductSet | null>;
    },

    // Получить наборы по коллекции
    async getSetsByCollection(collection: string): Promise<ProductSet[]> {
        const sets = setsData.filter(s => s.collection === collection);
        return asAsync(sets as ProductSet[]);
    },

    // Сохранить набор - не работает в статическом режиме
    async saveSet(set: ProductSet): Promise<ProductSet> {
        console.warn('Set save operation is not available in static mode');
        return asAsync(set);
    },

    // Удалить набор - не работает в статическом режиме
    async deleteSet(id: string): Promise<void> {
        console.warn('Set delete operation is not available in static mode');
        return asAsync(undefined);
    },

    // Получить категории наборов
    async getSetCategories(): Promise<Category[]> {
        const categories = categoriesData as Category[];
        const sets = setsData as ProductSet[];

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
        return asAsync(Array.from(setCategoriesMap.values()));
    }
};

// Хелпер для проверки типа и работы клиентского поиска
export const searchApi = {
    // Поиск товаров по тексту
    async searchProducts(query: string): Promise<Product[]> {
        const lowercaseQuery = query.toLowerCase();
        const results = productsData.filter(product =>
            product.name.toLowerCase().includes(lowercaseQuery) ||
            (product.description && product.description.toLowerCase().includes(lowercaseQuery))
        );
        return asAsync(results as Product[]);
    },

    // Поиск категорий по тексту
    async searchCategories(query: string): Promise<Category[]> {
        const lowercaseQuery = query.toLowerCase();
        const results = categoriesData.filter(category =>
            category.name.toLowerCase().includes(lowercaseQuery) ||
            (category.description && category.description.toLowerCase().includes(lowercaseQuery))
        );
        return asAsync(results as Category[]);
    },

    // Поиск наборов по тексту
    async searchSets(query: string): Promise<ProductSet[]> {
        const lowercaseQuery = query.toLowerCase();
        const results = setsData.filter(set =>
            set.name.toLowerCase().includes(lowercaseQuery) ||
            (set.description && set.description.toLowerCase().includes(lowercaseQuery))
        );
        return asAsync(results as ProductSet[]);
    },

    // Общий поиск по сайту
    async searchAll(query: string): Promise<{
        products: Product[],
        categories: Category[],
        sets: ProductSet[]
    }> {
        const products = await this.searchProducts(query);
        const categories = await this.searchCategories(query);
        const sets = await this.searchSets(query);

        return { products, categories, sets };
    }
};