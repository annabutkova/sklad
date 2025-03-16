// src/types/index.ts
// Product related types
export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  discount?: number;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  description?: string;
  features?: string[];
  images: ProductImage[];
  variants?: ProductVariant[];
  specifications?: Record<string, string | number>;
  inStock: boolean;
  relatedProductIds?: string[];
}

export interface ProductImage {
  url: string;
  alt?: string;
  isMain?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorCode?: string;
  imageUrl?: string;
  inStock: boolean;
}

// Product set types
export interface ProductSet {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  longDescription?: string;
  images: ProductImage[];
  items: SetItem[];
  basePrice: number;
  discount?: number;
  specifications?: Record<string, string | number>;
}

export interface SetItem {
  productId: string;
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  required: boolean;
}

// Category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  children?: Category[];
}

// For the shopping cart
export interface CartItem {
  type: "product" | "set";
  id: string;
  quantity: number;
  // For sets with custom configuration
  configuration?: {
    productId: string;
    quantity: number;
  }[];
}
