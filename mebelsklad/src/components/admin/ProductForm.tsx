"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, Category, ProductImage, BedSize, Collection } from '@/types';
import { generateSlug, generateId } from '@/lib/utils/format';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageGallery from './ImageGallery';
import { updateEntityWithImages } from '@/lib/utils/entityUpdate';

// Updated product schema with the new types and collection field
const productSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
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
      spinka: z.string().optional(),
    }).optional(),
    style: z.object({
      style: z.string().optional(),
      color: z.object({
        karkas: z.string().optional(),
        fasad: z.string().optional(),
        ruchki: z.string().optional(),
        obivka: z.string().optional(),
        spinka: z.string().optional(),
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
  const searchParams = useSearchParams();
  const isDuplicate = searchParams.get('isDuplicate') === 'true';

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    images,
    setImages,
    imageFiles,
    imagePreviews,
    isUploading,
    handleImageSelect,
    handleRemoveImage,
    handleRemovePreview,
    handleSetMainImage,
    uploadAllImages
  } = useImageUpload({
    initialImages: product?.images || [],
    entityName: product?.name || 'product'
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      ...product,
      categoryIds: product.categoryIds || [],
      collection: product.collection || '',
      price: product.price || 0,
      discount: product.discount || 0,
      specifications: {
        material: {
          karkas: product.specifications?.material?.karkas || '',
          fasad: product.specifications?.material?.fasad || '',
          ruchki: product.specifications?.material?.ruchki || '',
          obivka: product.specifications?.material?.obivka || '',
          spinka: product.specifications?.material?.spinka || '',
        },
        style: {
          style: product.specifications?.style?.style || '',
          color: {
            karkas: product.specifications?.style?.color?.karkas || '',
            fasad: product.specifications?.style?.color?.fasad || '',
            ruchki: product.specifications?.style?.color?.ruchki || '',
            obivka: product.specifications?.style?.color?.obivka || '',
            spinka: product.specifications?.style?.color?.spinka || '',
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
      categoryIds: [],
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
          spinka: '',
        },
        style: {
          style: '',
          color: {
            karkas: '',
            fasad: '',
            ruchki: '',
            obivka: '',
            spinka: '',
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
  const name = watch('name');

  // Initialize collection
  useEffect(() => {
    // Initialize collection only if it's not already set from the product
    if ((!watch('collection') || watch('collection') === '') && product?.collection) {
      setValue('collection', product.collection);
    } else if ((!watch('collection') || watch('collection') === '') && collectionOptions.length > 0) {
      // Set default collection if none is selected
      setValue('collection', collectionOptions[0]);
    }
  }, [collectionOptions, setValue, product, watch]);

  // Функция для определения, является ли товар кроватью
  const isBedCategory = () => {
    // Get selected category IDs
    const categoryIds = watch('categoryIds') || [];

    // Check if any of the selected categories match bed categories
    return categoryIds.some(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return false;

      // Проверяем slug категории
      const bedCategorySlugs = ['krovati', 'detskie-krovati'];
      return bedCategorySlugs.includes(category.slug);
    });
  };

  // Отслеживаем изменения категорий для очистки полей кровати
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'categoryIds') {
        const isBed = isBedCategory();

        // Если не кровать, очищаем специфичные поля
        if (!isBed) {
          // Устанавливаем пустое значение для размера кровати
          setValue('specifications.bedSize', '');

          // Очищаем материал и цвет спинки
          setValue('specifications.material.spinka', '');
          setValue('specifications.style.color.spinka', '');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Make sure collection is properly set
      let finalCollection = data.collection;
      if (!finalCollection && collectionOptions.length > 0) {
        finalCollection = collectionOptions[0];
      }

      // Prepare the complete product object
      const completeProduct: Product = {
        ...data,
        categoryIds: data.categoryIds,
        collection: finalCollection as Collection,
        images: images, // Используем текущие изображения
        features: product?.features || [],
        specifications: {
          ...data.specifications,
          bedSize: isBedCategory() ? data.specifications.bedSize as BedSize : undefined,
          material: {
            ...data.specifications.material,
            spinka: isBedCategory() ? data.specifications.material?.spinka : undefined
          },
          style: {
            ...data.specifications.style,
            color: {
              ...data.specifications.style?.color,
              spinka: isBedCategory() ? data.specifications.style?.color?.spinka : undefined
            }
          }
        },
      };

      // Save product to API
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : '/api/admin/products',
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

      // Get the saved product id
      const savedProduct = await response.json();
      const productId = savedProduct.id || product?.id || data.id;

      // Upload images if any new files selected
      if (imageFiles.length > 0) {
        try {
          // Загружаем изображения
          const folderSlug = finalCollection || 'products';
          const uploadedImages = await uploadAllImages(
            productId,
            data.slug,
            folderSlug
          );

          // Обновляем продукт с новыми изображениями
          if (uploadedImages.length > images.length) {
            await updateEntityWithImages({
              entityType: 'product',
              entityId: productId,
              images: uploadedImages,
              entityData: completeProduct
            });
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          alert('Product saved but failed to upload images. You can upload them later.');
        }
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
              {...register('name', {
                onChange: (e) => {
                  if (!product || isDuplicate) {
                    const newName = e.target.value;
                    setValue('slug', generateSlug(newName));
                  }
                }
              })}
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

          {/* Category Selection - Multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categories
            </label>
            <div className="mt-1">
              {categories.map(category => (
                <div key={category.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    value={category.id}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const categoryId = category.id;
                      const currentCategoryIds = watch('categoryIds') || [];

                      if (checked) {
                        // Добавляем категорию, если её ещё нет
                        if (!currentCategoryIds.includes(categoryId)) {
                          setValue('categoryIds', [...currentCategoryIds, categoryId]);
                        }
                      } else {
                        // Удаляем категорию
                        setValue('categoryIds', currentCategoryIds.filter(id => id !== categoryId));
                      }
                    }}
                    checked={(watch('categoryIds') || []).includes(category.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-900">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            {errors.categoryIds && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryIds.message}</p>
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
          {isBedCategory() && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Spinka (для кроватей)</label>
              <input
                type="text"
                {...register("specifications.material.spinka")}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          )}
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
          {isBedCategory() && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Spinka Color (для кроватей)</label>
              <input
                type="text"
                {...register("specifications.style.color.spinka")}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          )}
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
              <option value="">Выберите размер</option>
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

      {/* Images section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Images</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <input
            type="file"
            onChange={handleImageSelect}
            accept="image/*"
            multiple
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Используем компонент ImageGallery */}
        <ImageGallery
          images={images}
          previews={imagePreviews}
          onRemoveImage={handleRemoveImage}
          onRemovePreview={handleRemovePreview}
          onSetMainImage={handleSetMainImage}
          isUploading={isUploading}
        />
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
          className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}