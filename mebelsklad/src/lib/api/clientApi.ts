// src/lib/api/clientApi.ts
import { Product, ProductSet, Category } from '@/types';

export const clientApi = {
    // Products
    async getAllProducts(): Promise<Product[]> {
        const response = await fetch('./api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    async getProductById(id: string): Promise<Product | null> {
        const response = await fetch(`./api/products/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch product with ID: ${id}`);
        return response.json();
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        const products = await this.getAllProducts();
        return products.find(product => product.slug === slug) || null;
    },

    async getProductsByCollection(collection: string): Promise<Product[]> {
        const products = await this.getAllProducts();
        return products.filter(product => product.collection === collection);
    },

    async saveProduct(product: Product): Promise<Product> {
        const response = await fetch('./api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) throw new Error('Failed to save product');
        return response.json();
    },

    async updateProduct(id: string, product: Product): Promise<Product> {
        const response = await fetch(`./api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!response.ok) throw new Error(`Failed to update product with ID: ${id}`);
        return response.json();
    },

    async deleteProduct(id: string): Promise<void> {
        const response = await fetch(`./api/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Failed to delete product with ID: ${id}`);
    },

    // Product Sets
    async getAllProductSets(): Promise<ProductSet[]> {
        const response = await fetch('./api/sets');
        if (!response.ok) throw new Error('Failed to fetch product sets');
        return response.json();
    },

    async getProductSetById(id: string): Promise<ProductSet | null> {
        const response = await fetch(`./api/sets/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch product set with ID: ${id}`);
        return response.json();
    },

    async getProductSetBySlug(slug: string): Promise<ProductSet | null> {
        const sets = await this.getAllProductSets();
        return sets.find(set => set.slug === slug) || null;
    },

    async getProductSetsByCollection(collection: string): Promise<ProductSet[]> {
        const sets = await this.getAllProductSets();
        return sets.filter(set => set.collection === collection);
    },

    async updateProductSet(id: string, productSet: ProductSet): Promise<ProductSet> {
        const response = await fetch(`./api/sets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productSet)
        });
        if (!response.ok) throw new Error(`Failed to update product set with ID: ${id}`);
        return response.json();
    },

    async saveProductSet(productSet: ProductSet): Promise<ProductSet> {
        const response = await fetch('./api/sets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productSet)
        });
        if (!response.ok) throw new Error('Failed to save product set');
        return response.json();
    },

    async getSetCategories(): Promise<Category[]> {
        const categories = await this.getAllCategories();
        const sets = await this.getAllProductSets();

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


    // Categories
    async getAllCategories(): Promise<Category[]> {
        const response = await fetch('./api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
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

    async getCategoryById(id: string): Promise<Category | null> {
        const response = await fetch(`./api/categories/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch category with ID: ${id}`);
        return response.json();
    },

    async saveCategory(category: Category): Promise<Category> {
        const response = await fetch('./api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!response.ok) throw new Error('Failed to save category');
        return response.json();
    },

    async updateCategory(id: string, category: Category): Promise<Category> {
        const response = await fetch(`./api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!response.ok) throw new Error(`Failed to update category with ID: ${id}`);
        return response.json();
    },

    // Uploads
    async uploadImages(files: File[], folderSlug: string, productSlug: string): Promise<{ url: string, filename: string }[]> {
        const formData = new FormData();
        formData.append('folderSlug', folderSlug);
        formData.append('productSlug', productSlug);

        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        const response = await fetch('./api/upload-images', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload images');
        return response.json().then(data => data.uploadedImages);
    }
};