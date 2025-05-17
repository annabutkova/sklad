// src/components/admin/CategoryForm.tsx
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Category } from '@/types';
import { generateSlug, generateId } from '@/lib/utils/format';
import React from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageGallery from './ImageGallery';
import { updateEntityWithImages } from '@/lib/utils/entityUpdate';

// Обновленная схема валидации для категорий с images
const categorySchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  parentId: z.string().optional(),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
}

export default function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
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
    uploadAllImages
  } = useImageUpload({
    initialImages: category?.images || [],
    entityName: category?.name || 'category'
  });

  // Set up form with react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      ...category,
    } : {
      id: generateId('CAT'),
    }
  });

  // Watch the name field to auto-generate slug
  const name = watch('name');

  // Auto-generate slug when name changes (for new categories)
  React.useEffect(() => {
    if (name && !category) {
      setValue('slug', generateSlug(name));
    }
  }, [name, setValue, category]);

  // Handle form submission
  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      // Create the complete category object with images
      const completeCategory: Category = {
        ...data,
        images: images,
      };

      // Save to API
      const response = await fetch(
        category
          ? `/api/admin/categories/${category.id}`
          : '/api/admin/categories',
        {
          method: category ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeCategory),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save category');
      }

      // Get the saved category id
      const savedCategory = await response.json();
      const categoryId = savedCategory.id || category?.id || data.id;

      // Upload images if any new files selected
      if (imageFiles.length > 0) {
        try {
          // Загружаем изображения
          const folderSlug = 'categories';
          const uploadedImages = await uploadAllImages(
            categoryId,
            data.slug,
            folderSlug
          );

          // Обновляем категорию с новыми изображениями
          if (uploadedImages.length > images.length) {
            await updateEntityWithImages({
              entityType: 'category',
              entityId: categoryId,
              images: uploadedImages,
              entityData: completeCategory
            });
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          alert('Category saved but failed to upload images. You can upload them later.');
        }
      }

      // Redirect to categories list
      router.push('/admin/categories');
      router.refresh();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all potential parent categories (excluding current category and its children)
  const potentialParents = categories.filter(c => c.id !== category?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Category Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Name
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

          {/* Category ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category ID
            </label>
            <input
              type="text"
              {...register('id')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly={Boolean(category)} // Don't allow editing ID for existing categories
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

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parent Category
            </label>
            <select
              {...register('parentId')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None (Top Level)</option>
              {potentialParents.map(parent => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Category description..."
          ></textarea>
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
          {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}