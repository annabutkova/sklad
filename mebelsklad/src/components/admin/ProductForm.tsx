"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, Category, ProductImage, BedSize, Collection } from '@/types';
import { generateSlug, generateId } from '@/lib/utils/format';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageGallery from '@/components/admin/ImageGallery';
import { saveProduct, updateProduct, uploadImages } from '@/lib/api/httpClient';

// Schema definition remains the same
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

  // Используем хук для управления изображениями
  const {
    images,
    imageFiles,
    imagePreviews,
    isUploading,
    handleImageSelect,
    handleRemoveImage,
    handleRemovePreview,
    handleSetMainImage,
    resetUploadState
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

  // Initialize collection
  useEffect(() => {
    if ((!watch('collection') || watch('collection') === '') && product?.collection) {
      setValue('collection', product.collection);
    } else if ((!watch('collection') || watch('collection') === '') && collectionOptions.length > 0) {
      setValue('collection', collectionOptions[0]);
    }
  }, [collectionOptions, setValue, product, watch]);

  // Функция для определения, является ли товар кроватью
  const isBedCategory = () => {
    const categoryIds = watch('categoryIds') || [];
    return categoryIds.some(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return false;
      const bedCategorySlugs = ['krovati', 'detskie-krovati'];
      return bedCategorySlugs.includes(category.slug);
    });
  };

  // Отслеживаем изменения категорий для очистки полей кровати
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'categoryIds') {
        const isBed = isBedCategory();
        if (!isBed) {
          setValue('specifications.bedSize', '');
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

      // Save or update product using the HTTP API
      let savedProduct;
      if (product) {
        // Updating existing product
        savedProduct = await updateProduct(product.id, completeProduct);
      } else {
        // Creating new product
        savedProduct = await saveProduct(completeProduct);
      }

      // Upload images if any new files selected
      if (imageFiles.length > 0) {
        try {
          // Загружаем изображения
          const folderSlug = finalCollection || 'products';
          const uploadedImages = await uploadImages(
            imageFiles,
            folderSlug,
            savedProduct.slug
          );

          // Создаём массив с новыми изображениями
          const newImages = uploadedImages.map((img, index) => ({
            url: img.url,
            alt: savedProduct.name,
            isMain: index === 0 && images.length === 0
          }));

          // Объединяем с существующими изображениями
          const allImages = [...images, ...newImages];

          // Обновляем продукт с новыми изображениями
          await updateProduct(savedProduct.id, {
            ...savedProduct,
            images: allImages
          });
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          alert('Product saved but failed to upload images. You can upload them later.');
        } finally {
          resetUploadState();
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

          {/* Остальные поля формы остаются такими же */}
          {/* ... */}

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
              disabled={isSubmitting || isUploading}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}