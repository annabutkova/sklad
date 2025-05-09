"use client"

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, Category, ProductImage, BedSize, Collection } from '@/types';
import { generateSlug, generateId } from '@/lib/utils/format';

// Updated product schema with the new types and collection field
const productSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  collection: z.string(),
  price: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0, "Discount must be positive").optional(),
  description: z.string().optional(),
  inStock: z.boolean().default(true),
  specifications: z.object({
    material: z.object({
      karkas: z.string().optional(),
      fasad: z.string().optional(),
      ruchki: z.string().optional(),
      obivka: z.string().optional(),
    }).optional(),
    style: z.object({
      style: z.string().optional(),
      color: z.object({
        karkas: z.string().optional(),
        fasad: z.string().optional(),
        ruchki: z.string().optional(),
        obivka: z.string().optional(),
      }).optional(),
    }).optional(),
    dimensions: z.object({
      width: z.number().min(0),
      height: z.number().min(0),
      depth: z.number().min(0),
      length: z.number().min(0),
    }),
    bedSize: z.enum(["180x200", "160x200", "140x200", "120x200", "90x200", ""]).optional(),
    content: z.object({
      yashiki: z.number().optional(),
      polki: z.number().optional(),
      shtanga: z.number().optional(),
    }).optional(),
    warranty: z.object({
      duration: z.number().optional(),
      lifetime: z.number().optional(),
      production: z.string().optional(),
    }).optional(),
  }),
  features: z.array(z.string()).optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  // Правильная инициализация состояния images
  const [images, setImages] = useState<ProductImage[]>(() => {
    return product?.images || [];
  });

  // После инициализации добавьте useEffect для отладки
  useEffect(() => {
    console.log('Текущие изображения:', images);
  }, [images]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Set up form with react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      ...product,
      collection: '',
      price: product.price || 0,
      discount: product.discount || 0,
      specifications: {
        material: {
          karkas: product.specifications?.material?.karkas || '',
          fasad: product.specifications?.material?.fasad || '',
          ruchki: product.specifications?.material?.ruchki || '',
          obivka: product.specifications?.material?.obivka || '',
        },
        style: {
          style: product.specifications?.style?.style || '',
          color: {
            karkas: product.specifications?.style?.color?.karkas || '',
            fasad: product.specifications?.style?.color?.fasad || '',
            ruchki: product.specifications?.style?.color?.ruchki || '',
            obivka: product.specifications?.style?.color?.obivka || '',
          }
        },
        dimensions: {
          width: product.specifications?.dimensions?.width || 0,
          height: product.specifications?.dimensions?.height || 0,
          depth: product.specifications?.dimensions?.depth || 0,
          length: product.specifications?.dimensions?.length || 0,
        },

        bedSize: product.specifications?.bedSize,
        content: {
          yashiki: product.specifications?.content?.yashiki || 0,
          polki: product.specifications?.content?.polki || 0,
          shtanga: product.specifications?.content?.shtanga || 0,
        },
        warranty: {
          duration: product.specifications?.warranty?.duration || 0,
          lifetime: product.specifications?.warranty?.lifetime || 0,
          production: product.specifications?.warranty?.production || '',
        }
      }
    } : {
      id: generateId('PROD'),
      inStock: true,
      collection: '' as Collection,
      price: 0,
      discount: 0,
      specifications: {
        material: {
          karkas: '',
          fasad: '',
          ruchki: '',
          obivka: '',
        },
        style: {
          style: '',
          color: {
            karkas: '',
            fasad: '',
            ruchki: '',
            obivka: '',
          }
        },
        dimensions: { width: 0, height: 0, depth: 0, length: 0 },
        bedSize: BedSize.None,
        content: {
          yashiki: 0,
          polki: 0,
          shtanga: 0,
        },
        warranty: {
          duration: 0,
          lifetime: 0,
          production: 'Россия',
        }
      },
      features: []
    }
  });

  const collectionOptions = Object.values(Collection);
  const selectedCollection = watch('collection');


  // Watch the name field to auto-generate slug
  const name = watch('name');

  useEffect(() => {
    // Auto-generate slug for new products
    if (name && !product) {
      setValue('slug', generateSlug(name));
    }
  }, [name, setValue, product]);

  // Add a new separate useEffect specifically for collection initialization
  // This should run only once on component mount
  // In ProductForm.tsx, modify the useEffect for collection initialization

  // Replace the existing useEffect for collection initialization with this:
  useEffect(() => {
    // Initialize collection only if it's not already set from the product
    if ((!watch('collection') || watch('collection') === '') && product?.collection) {
      setValue('collection', product.collection);
    } else if ((!watch('collection') || watch('collection') === '') && collectionOptions.length > 0) {
      // Set default collection if none is selected
      setValue('collection', collectionOptions[0]);
    }
  }, [collectionOptions, setValue, product, watch]);

  const categoryId = watch('categoryId');
  const selectedCategory = categories.find(cat => cat.id === categoryId);

  const isBedCategory = () => {
    // Если категория не выбрана, возвращаем false
    if (!selectedCategory) return false;

    // Проверяем slug категории
    const bedCategorySlugs = ['krovati', 'divany-krovati']; // Замените на реальные slug-и
    return bedCategorySlugs.includes(selectedCategory.slug);
  };

  const onSubmit = async (data: ProductFormValues) => {
    console.log("Форма отправляется, данные:", data); // Добавьте это

    setIsSubmitting(true);

    try {
      // Make sure collection is properly set
      let finalCollection = data.collection;
      if (!finalCollection && collectionOptions.length > 0) {
        finalCollection = collectionOptions[0];
      }

      // Create the complete product object
      const completeProduct: Product = {
        ...data,
        collection: finalCollection as Collection,
        images: images,
        features: product?.features || [],
        specifications: {
          ...data.specifications,
          bedSize: isBedCategory() ? data.specifications.bedSize as BedSize : undefined,
        },
      };

      console.log('Saving product with collection:', completeProduct.collection);

      // Save to API
      const response = await fetch(
        product
          ? `/api/admin/products/${product.id}`
          : '/api/admin/products',
        {
          method: product ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeProduct),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      // Redirect to products list
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      // Get the product slug
      const productSlug = watch('slug') || generateSlug(watch('name') || 'product');
      const productName = watch('name') || 'Product'; // Получаем название товара

      // Create a slug from the collection title
      const folderSlug = selectedCollection || 'products';

      // Create FormData to send files
      const formData = new FormData();

      // Add the folder slug and product slug
      formData.append('folderSlug', folderSlug);
      formData.append('productSlug', productSlug);

      // Add all files
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      // Send to server
      const response = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Add the uploaded images to state, используя название товара вместо имени файла для alt
      const newImages: ProductImage[] = data.uploadedImages.map(
        (img: { url: string, filename: string }, index: number) => ({
          url: img.url,
          alt: productName, // Используем название товара вместо img.filename
          isMain: index === 0 && images.length === 0
        })
      );

      setImages([...images, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Product ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product ID
            </label>
            <input
              type="text"
              {...register('id')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly={Boolean(product)} // Don't allow editing ID for existing products
            />
            {errors.id && (
              <p className="mt-1 text-sm text-red-600">{errors.id.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Slug
            </label>
            <input
              type="text"
              {...register('slug')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Collection - Added field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Collection
            </label>
            <select
              {...register("collection")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="">Select a collection</option>
              {collectionOptions.map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
            {errors.collection && (
              <p className="mt-1 text-sm text-red-600">{errors.collection.message}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount
            </label>
            <input
              type="number"
              {...register('discount', { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">{errors.discount.message}</p>
            )}
          </div>

          {/* In Stock */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              {...register('inStock')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
              In Stock
            </label>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Description</h2>
        <textarea
          {...register('description')}
          rows={5}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Product description..."
        ></textarea>
      </div>

      {/* Dimensions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Dimensions (cm)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["width", "height", "depth", "length"].map(dimension => (
            <div key={dimension}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {dimension}
              </label>
              <input
                type="number"
                {...register(`specifications.dimensions.${dimension}` as any, { valueAsNumber: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Material Specifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Material</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Karkas</label>
            <input
              type="text"
              {...register("specifications.material.karkas")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fasad</label>
            <input
              type="text"
              {...register("specifications.material.fasad")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ruchki</label>
            <input
              type="text"
              {...register("specifications.material.ruchki")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Obivka</label>
            <input
              type="text"
              {...register("specifications.material.obivka")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
        </div>
      </div>

      {/* Style Specifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Style</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Style</label>
          <input
            type="text"
            {...register("specifications.style.style")}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>

        <h3 className="text-md font-medium mt-4 mb-2">Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Karkas Color</label>
            <input
              type="text"
              {...register("specifications.style.color.karkas")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fasad Color</label>
            <input
              type="text"
              {...register("specifications.style.color.fasad")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ruchki Color</label>
            <input
              type="text"
              {...register("specifications.style.color.ruchki")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Obivka Color</label>
            <input
              type="text"
              {...register("specifications.style.color.obivka")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
        </div>
      </div>

      {/* Bed Size */}
      {isBedCategory() && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Bed Size</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">Size</label>
            <select
              {...register("specifications.bedSize")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            >
              <option value="180x200">180x200</option>
              <option value="160x200">160x200</option>
              <option value="140x200">140x200</option>
              <option value="120x200">120x200</option>
              <option value="90x200">90x200</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Specifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Yashiki</label>
            <input
              type="number"
              {...register("specifications.content.yashiki", { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Polki</label>
            <input
              type="number"
              {...register("specifications.content.polki", { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shtanga</label>
            <input
              type="number"
              {...register("specifications.content.shtanga", { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
        </div>
      </div>

      {/* Warranty Specifications */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Warranty</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (months)</label>
            <input
              type="number"
              {...register("specifications.warranty.duration", { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lifetime (years)</label>
            <input
              type="number"
              {...register("specifications.warranty.lifetime", { valueAsNumber: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Production</label>
            <input
              type="text"
              {...register("specifications.warranty.production")}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Features</h2>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const input = e.currentTarget;
              const newValue = input.value.trim();
              if (newValue) {
                setValue('features', [...(watch('features') || []), newValue]);
                input.value = '';
              }
            }
          }}
          placeholder="Press Enter to add feature"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {(watch('features') || []).map((feature, i) => (
            <span key={i} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
              {feature}
              <button
                type="button"
                onClick={() =>
                  setValue('features', watch('features')?.filter((_, index) => index !== i))
                }
                className="ml-2 text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Images */}
      {/* File upload input */}
      <div className="form-group">
        <label htmlFor="image-upload">Product Images</label>

        {/* File upload input */}
        <div className="form-group">
          <label htmlFor="image-upload">Product Images</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          {isUploading && <span>Uploading...</span>}
        </div>

        {/* Отображение загруженных изображений */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.length > 0 ? (
            images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={image.alt || 'Изображение продукта'}
                  className="h-24 w-full object-cover rounded-md"
                  onError={(e) => {
                    console.error(`Ошибка загрузки изображения: ${image.url}`);
                    e.currentTarget.src = '/images/placeholder.jpg'; // Замените на путь к вашему изображению-заглушке
                  }}
                />
                {image.isMain && (
                  <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md">
                    Основное
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Удаление изображения:', image);
                    setImages(images.filter((_, i) => i !== index));
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updatedImages = images.map((img, i) => ({
                      ...img,
                      isMain: i === index,
                    }));
                    setImages(updatedImages);
                  }}
                  className="absolute bottom-0 left-0 bg-blue-500 text-white p-1 text-xs rounded-tr-md"
                >
                  Сделать основным
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-gray-500">
              Нет загруженных изображений
            </div>
          )}
        </div>

      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => console.log("Submit button clicked, errors:", errors)}

          className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}