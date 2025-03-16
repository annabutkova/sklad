// src/lib/api/jsonDataService.ts
import fs from 'fs';
import path from 'path';
import { Product, ProductSet, Category } from '@/types';

export class JsonDataService {
  private productsPath: string;
  private productSetsPath: string;
  private categoriesPath: string;
  
  constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    this.productsPath = path.join(dataDir, 'products.json');
    this.productSetsPath = path.join(dataDir, 'product-sets.json');
    this.categoriesPath = path.join(dataDir, 'categories.json');
  }

  // Load JSON file helper
  private async loadJsonFile<T>(filePath: string): Promise<T> {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Error loading JSON file ${filePath}:`, error);
      throw error;
    }
  }

  // Save JSON file helper
  private async saveJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
      await fs.promises.writeFile(
        filePath, 
        JSON.stringify(data, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error(`Error saving JSON file ${filePath}:`, error);
      throw error;
    }
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return this.loadJsonFile<Product[]>(this.productsPath);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find(product => product.slug === slug) || null;
  }
  
  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllProducts();
    return products.find(product => product.id === id) || null;
  }
  
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.getAllProducts();
    return products.filter(product => product.categoryId === categoryId);
  }
  
  async saveProduct(product: Product): Promise<void> {
    const products = await this.getAllProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    
    await this.saveJsonFile(this.productsPath, products);
  }
  
  async deleteProduct(id: string): Promise<void> {
    const products = await this.getAllProducts();
    const updatedProducts = products.filter(p => p.id !== id);
    await this.saveJsonFile(this.productsPath, updatedProducts);
  }

  // Product Sets
  async getAllProductSets(): Promise<ProductSet[]> {
    return this.loadJsonFile<ProductSet[]>(this.productSetsPath);
  }

  async getProductSetBySlug(slug: string): Promise<ProductSet | null> {
    const sets = await this.getAllProductSets();
    return sets.find(set => set.slug === slug) || null;
  }
  
  async getProductSetById(id: string): Promise<ProductSet | null> {
    const sets = await this.getAllProductSets();
    return sets.find(set => set.id === id) || null;
  }
  
  async saveProductSet(productSet: ProductSet): Promise<void> {
    const sets = await this.getAllProductSets();
    const index = sets.findIndex(s => s.id === productSet.id);
    
    if (index >= 0) {
      sets[index] = productSet;
    } else {
      sets.push(productSet);
    }
    
    await this.saveJsonFile(this.productSetsPath, sets);
  }
  
  async deleteProductSet(id: string): Promise<void> {
    const sets = await this.getAllProductSets();
    const updatedSets = sets.filter(s => s.id !== id);
    await this.saveJsonFile(this.productSetsPath, updatedSets);
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    return this.loadJsonFile<Category[]>(this.categoriesPath);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getAllCategories();
    return categories.find(category => category.slug === slug) || null;
  }
  
  async saveCategory(category: Category): Promise<void> {
    const categories = await this.getAllCategories();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    
    await this.saveJsonFile(this.categoriesPath, categories);
  }
  
  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getAllCategories();
    const updatedCategories = categories.filter(c => c.id !== id);
    await this.saveJsonFile(this.categoriesPath, updatedCategories);
  }
  
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
  }
}

export const jsonDataService = new JsonDataService();