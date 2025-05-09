// src/types/index.ts
// Product related types
export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryIds: string[];
  price: number;
  discount?: number;
  inStock: boolean;
  images: ProductImage[];

  description?: string;
  features?: string[];
  specifications?: Specification;

  variants?: string[];
  relatedProductIds?: string[];

  collection: Collection;
}

export enum Collection {
  Alexandria = "Александрия",
  Bora = "Бора",
  Milan = "Милан",
}


export type Specification = {
  color?: string;
  style?: Style;
  material?: Material;
  dimensions?: Dimensions;
  bedSize?: BedSize;
  content?: Content;
  warranty?: Warranty;
}

export enum BedSize {
  Size180 = "180x200",
  Size160 = "160x200",
  Size140 = "140x200",
  Size120 = "120x200",
  Size90 = "90x200",
  None = "",
}


export type Material = {
  karkas?: string;
  fasad?: string;
  ruchki?: string;
  obivka?: string;
}

export type Style = {
  style?: string;
  color?: {
    karkas?: string;
    fasad?: string;
    ruchki?: string;
    obivka?: string;
  };
}

export type Content = {
  yashiki?: number;
  polki?: number;
  shtanga?: number;
}

export type Dimensions = {
  width?: number;
  height?: number;
  depth?: number;
  length?: number;
}

export type Warranty = {
  duration?: number;
  lifetime?: number;
  production?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isMain?: boolean;
}

// Product set types
export interface ProductSet extends Omit<Product, 'price'> {
  items: SetItem[];
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
  id: string;
  quantity: number;
}
