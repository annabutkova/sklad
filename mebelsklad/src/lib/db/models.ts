import mongoose, { Schema, Document } from 'mongoose';
import { Product, Category, ProductSet, ProductImage, Collection } from '@/types';

// Схема для изображений
const ImageSchema = new Schema({
    url: { type: String, required: true },
    alt: String,
    isMain: { type: Boolean, default: false }
});

// Схема для спецификаций
const SpecificationSchema = new Schema({
    material: {
        karkas: String,
        fasad: String,
        ruchki: String,
        obivka: String,
        spinka: String
    },
    style: {
        style: String,
        color: {
            karkas: String,
            fasad: String,
            ruchki: String,
            obivka: String,
            spinka: String
        }
    },
    dimensions: {
        width: Number,
        height: Number,
        depth: Number,
        length: Number
    },
    bedSize: String,
    content: {
        yashiki: Number,
        polki: Number,
        shtanga: Number
    },
    warranty: {
        duration: Number,
        lifetime: Number,
        production: String
    }
}, { _id: false });

// Схема для товаров
const ProductSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryIds: [String],
    price: { type: Number, required: true },
    discount: Number,
    inStock: { type: Boolean, default: true },
    images: [ImageSchema],
    description: String,
    features: [String],
    specifications: SpecificationSchema,
    variants: [String],
    relatedProductIds: [String],
    collection: { type: String, enum: Object.values(Collection) }
});

// Схема для категорий
const CategorySchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: String,
    description: String,
    images: [ImageSchema]
});

// Схема для элемента набора
const SetItemSchema = new Schema({
    productId: { type: String, required: true },
    defaultQuantity: { type: Number, default: 1 },
    minQuantity: { type: Number, default: 0 },
    maxQuantity: { type: Number, default: 10 },
    required: { type: Boolean, default: false }
}, { _id: false });

// Схема для наборов
const ProductSetSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryIds: [String],
    inStock: { type: Boolean, default: true },
    images: [ImageSchema],
    description: String,
    specifications: SpecificationSchema,
    collection: { type: String, enum: Object.values(Collection) },
    items: [SetItemSchema]
});

// Экспорт моделей с проверкой существования (защита от горячей перезагрузки)
export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const ProductSetModel = mongoose.models.ProductSet || mongoose.model('ProductSet', ProductSetSchema);