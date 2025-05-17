// src/lib/api/httpClient.ts
import { Product, Category, ProductSet } from '@/types';

// Продукты
export async function getProductById(id: string): Promise<Product | null> {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    return response.json();
}

export async function saveProduct(product: Product): Promise<Product> {
    const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error(`Failed to save product: ${response.statusText}`);
    return response.json();
}

export async function updateProduct(id: string, product: Product): Promise<Product> {
    const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error(`Failed to update product: ${response.statusText}`);
    return response.json();
}

// Категории
export async function saveCategory(category: Category): Promise<Category> {
    const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });

    if (!response.ok) throw new Error(`Failed to save category: ${response.statusText}`);
    return response.json();
}

export async function updateCategory(id: string, category: Category): Promise<Category> {
    const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });

    if (!response.ok) throw new Error(`Failed to update category: ${response.statusText}`);
    return response.json();
}

// Наборы
export async function saveSet(set: ProductSet): Promise<ProductSet> {
    const response = await fetch('/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(set)
    });

    if (!response.ok) throw new Error(`Failed to save set: ${response.statusText}`);
    return response.json();
}

export async function updateSet(id: string, set: ProductSet): Promise<ProductSet> {
    const response = await fetch(`/api/sets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(set)
    });

    if (!response.ok) throw new Error(`Failed to update set: ${response.statusText}`);
    return response.json();
}

// Загрузка изображений
export async function uploadImages(
    files: File[],
    folderSlug: string,
    entitySlug: string
): Promise<Array<{ url: string, filename: string }>> {
    const formData = new FormData();
    formData.append('folderSlug', folderSlug);
    formData.append('productSlug', entitySlug); // Параметр называется productSlug в API

    files.forEach(file => {
        formData.append('images', file);
    });

    const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error(`Failed to upload images: ${response.statusText}`);
    const data = await response.json();
    return data.uploadedImages;
}