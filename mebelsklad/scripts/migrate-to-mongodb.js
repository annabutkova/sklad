const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Путь к JSON файлам
const dataDir = path.join(process.cwd(), '/public/data');
const productsPath = path.join(dataDir, 'products.json');
const categoriesPath = path.join(dataDir, 'categories.json');
const setsPath = path.join(dataDir, 'product-sets.json');

// Проверка наличия переменной окружения
if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI environment variable is not set. Please add it to .env.local');
    process.exit(1);
}

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });

// Схема для изображений
const ImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    alt: { type: String },
    isMain: { type: Boolean, default: false }
}, { _id: false });

// Схема для материалов
const MaterialSchema = new mongoose.Schema({
    karkas: { type: String },
    fasad: { type: String },
    ruchki: { type: String },
    obivka: { type: String },
    spinka: { type: String }
}, { _id: false });

// Схема для цветов
const ColorSchema = new mongoose.Schema({
    karkas: { type: String },
    fasad: { type: String },
    ruchki: { type: String },
    obivka: { type: String },
    spinka: { type: String }
}, { _id: false });

// Схема для стилей
const StyleSchema = new mongoose.Schema({
    style: { type: String },
    color: ColorSchema
}, { _id: false });

// Схема для размеров
const DimensionsSchema = new mongoose.Schema({
    width: { type: Number },
    height: { type: Number },
    depth: { type: Number },
    length: { type: Number }
}, { _id: false });

// Схема для содержимого
const ContentSchema = new mongoose.Schema({
    yashiki: { type: Number },
    polki: { type: Number },
    shtanga: { type: Number }
}, { _id: false });

// Схема для гарантии
const WarrantySchema = new mongoose.Schema({
    duration: { type: Number },
    lifetime: { type: Number },
    production: { type: String }
}, { _id: false });

// Схема для спецификаций
const SpecificationSchema = new mongoose.Schema({
    material: MaterialSchema,
    style: StyleSchema,
    dimensions: DimensionsSchema,
    bedSize: { type: String, enum: ["180x200", "160x200", "140x200", "120x200", "90x200", ""] },
    content: ContentSchema,
    warranty: WarrantySchema
}, { _id: false });

// Схема для товаров
const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryIds: [{ type: String }],
    price: { type: Number, required: true },
    discount: { type: Number },
    inStock: { type: Boolean, default: true },
    images: [ImageSchema],
    description: { type: String },
    features: [{ type: String }],
    specifications: SpecificationSchema,
    variants: [{ type: String }],
    relatedProductIds: [{ type: String }],
    collection: {
        type: String,
        enum: [
            "Александрия", "Денвер", "Габриэлла", "Гамма", "Камелия",
            "Лючия", "Милан", "Николь", "Оливер", "Ривьера", "Сохо", "Фантазия"
        ]
    }
});

// Схема для категорий
const CategorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: String },
    description: { type: String },
    images: [ImageSchema]
});

// Схема для элемента набора
const SetItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    defaultQuantity: { type: Number, default: 1 },
    minQuantity: { type: Number, default: 0 },
    maxQuantity: { type: Number, default: 10 },
    required: { type: Boolean, default: false }
}, { _id: false });

// Схема для наборов товаров
const ProductSetSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryIds: [{ type: String }],
    inStock: { type: Boolean, default: true },
    images: [ImageSchema],
    description: { type: String },
    specifications: SpecificationSchema,
    collection: {
        type: String,
        enum: [
            "Александрия", "Денвер", "Габриэлла", "Гамма", "Камелия",
            "Лючия", "Милан", "Николь", "Оливер", "Ривьера", "Сохо", "Фантазия"
        ]
    },
    items: [SetItemSchema]
});

const Product = mongoose.model('Product', ProductSchema);
const Category = mongoose.model('Category', CategorySchema);
const ProductSet = mongoose.model('ProductSet', ProductSetSchema);

async function migrateData() {
    try {
        // Проверка наличия файлов
        let products = [];
        let categories = [];
        let sets = [];

        if (fs.existsSync(productsPath)) {
            products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
            console.log(`Found ${products.length} products`);
        } else {
            console.warn(`Warning: ${productsPath} does not exist`);
        }

        if (fs.existsSync(categoriesPath)) {
            categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
            console.log(`Found ${categories.length} categories`);
        } else {
            console.warn(`Warning: ${categoriesPath} does not exist`);
        }

        if (fs.existsSync(setsPath)) {
            sets = JSON.parse(fs.readFileSync(setsPath, 'utf8'));
            console.log(`Found ${sets.length} product sets`);
        } else {
            console.warn(`Warning: ${setsPath} does not exist`);
        }

        // Очистка коллекций перед импортом
        console.log('Clearing existing collections...');
        await Product.deleteMany({});
        await Category.deleteMany({});
        await ProductSet.deleteMany({});

        // Импорт данных
        if (categories.length > 0) {
            console.log('Importing categories...');
            await Category.insertMany(categories);
            console.log(`Imported ${categories.length} categories`);
        }

        if (products.length > 0) {
            console.log('Importing products...');
            await Product.insertMany(products);
            console.log(`Imported ${products.length} products`);
        }

        if (sets.length > 0) {
            console.log('Importing product sets...');
            await ProductSet.insertMany(sets);
            console.log(`Imported ${sets.length} product sets`);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

migrateData();