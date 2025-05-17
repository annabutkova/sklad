"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, ProductSet, Category, ProductImage, Collection } from '@/types';
import { generateSlug, generateId, formatPrice } from '@/lib/utils/format';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageGallery from '@/components/admin/ImageGallery';
import { saveSet, updateSet, uploadImages } from '@/lib/api/httpClient';

// Define validation schema for product sets
const productSetSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  description: z.string().optional(),
  collection: z.string(),
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
    warranty: z.object({
      duration: z.number().optional(),
      lifetime: z.number().optional(),
      production: z.string().optional(),
    }).optional(),
  })
});

type ProductSetFormValues = z.infer<typeof productSetSchema>;

interface SetFormProps {
  productSet?: ProductSet;
  categories: Category[];
  products: Product[];
}

export default function SetForm({ productSet, categories, products }: SetFormProps) {
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
    setIsUploading,
    handleImageSelect,
    handleRemoveImage,
    handleRemovePreview,
    handleSetMainImage,
    resetUploadState
  } = useImageUpload({
    initialImages: productSet?.images || [],
    entityName: productSet?.name || 'set'
  });

  // State for managing set items
  const [selectedItems, setSelectedItems] = useState<Array<{
    productId: string;
    defaultQuantity: number;
    minQuantity: number;
    maxQuantity: number;
    required: boolean;
  }>>(productSet?.items || []);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // Collection filter
  const [selectedCollection, setSelectedCollection] = useState<string>(
    productSet?.collection || ''
  );

  // Calculate total price based on selected items and quantities
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // Setup form with react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductSetFormValues>({
    resolver: zodResolver(productSetSchema),
    defaultValues: productSet ? {
      ...productSet,
      categoryIds: productSet.categoryIds || [],
      collection: productSet.collection || '',
      specifications: {
        material: {
          karkas: productSet.specifications?.material?.karkas || '',
          fasad: productSet.specifications?.material?.fasad || '',
          ruchki: productSet.specifications?.material?.ruchki || '',
          obivka: productSet.specifications?.material?.obivka || '',
          spinka: productSet.specifications?.material?.spinka || '',
        },
        style: {
          style: productSet.specifications?.style?.style || '',
          color: {
            karkas: productSet.specifications?.style?.color?.karkas || '',
            fasad: productSet.specifications?.style?.color?.fasad || '',
            ruchki: productSet.specifications?.style?.color?.ruchki || '',
            obivka: productSet.specifications?.style?.color?.obivka || '',
            spinka: productSet.specifications?.style?.color?.spinka || '',
          }
        },
        warranty: {
          duration: productSet.specifications?.warranty?.duration || 0,
          lifetime: productSet.specifications?.warranty?.lifetime || 0,
          production: productSet.specifications?.warranty?.production || '',
        }
      }
    } : {
      id: generateId('SET'),
      categoryIds: [],
      inStock: true,
      collection: '' as Collection,
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
        warranty: {
          duration: 0,
          lifetime: 0,
          production: 'Россия',
        }
      },
    }
  });

  // Get all Collection enum values for the select dropdown
  const collectionOptions = Object.values(Collection);

  // Initialize collection from productSet
  useEffect(() => {
    // Initialize collection from existing set if available
    if (productSet?.collection && (!watch('collection') || watch('collection') === '')) {
      setValue('collection', productSet.collection);
      setSelectedCollection(productSet.collection);
    } else if ((!watch('collection') || watch('collection') === '') && collectionOptions.length > 0) {
      setValue('collection', collectionOptions[0]);
      setSelectedCollection(collectionOptions[0]);
    }
  }, [collectionOptions, setValue, productSet, watch]);

  // Auto-generate slug when name changes (for new sets)
  useEffect(() => {
    const name = watch('name');
    if (name && !productSet && !isDuplicate) {
      setValue('slug', generateSlug(name));
    }
  }, [watch('name'), setValue, productSet, isDuplicate]);

  // Pre-select all products from the same collection when collection changes
  useEffect(() => {
    if (selectedCollection && !productSet) {
      // Assuming products have a collection property
      const productsInCollection = products.filter(p => p.collection === selectedCollection);

      // Add all products in the selected collection that aren't already selected
      const newItems = productsInCollection
        .filter(product => !selectedItems.some(item => item.productId === product.id))
        .map(product => ({
          productId: product.id,
          defaultQuantity: 1,
          minQuantity: 0,
          maxQuantity: 10,
          required: false
        }));

      if (newItems.length > 0) {
        setSelectedItems([...selectedItems, ...newItems]);
      }
    }
  }, [selectedCollection, products, selectedItems, productSet]);

  // Calculate price based on selected items
  useEffect(() => {
    if (selectedItems.length > 0) {
      const total = selectedItems.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const productPrice = product.discount
            ? product.price - product.discount
            : product.price;
          return sum + (productPrice * item.defaultQuantity);
        }
        return sum;
      }, 0);

      setCalculatedPrice(total);
    } else {
      setCalculatedPrice(0);
    }
  }, [selectedItems, products]);

  // Handle adding a product to the set
  const addProductToSet = (productId: string) => {
    // Check if the product is already in the set
    if (selectedItems.some(item => item.productId === productId)) {
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        productId,
        defaultQuantity: 1,
        minQuantity: 0,
        maxQuantity: 10,
        required: false
      }
    ]);
  };

  // Handle removing a product from the set
  const removeProductFromSet = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  // Handle changing a product's quantity in the set
  const updateProductQuantity = (productId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.productId === productId
        ? { ...item, defaultQuantity: quantity }
        : item
    ));
  };

  // Handle toggling a product's "required" status
  const toggleProductRequired = (productId: string) => {
    setSelectedItems(selectedItems.map(item =>
      item.productId === productId
        ? { ...item, required: !item.required }
        : item
    ));
  };

  // Handle collection selection
  const handleCollectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCollection(value);
    setValue('collection', value);
  };

  // Handle form submission
  const onSubmit = async (data: ProductSetFormValues) => {
    setIsSubmitting(true);

    try {
      // Check if there are any items in the set
      if (selectedItems.length === 0) {
        alert('You must add at least one product to the set');
        setIsSubmitting(false);
        return;
      }

      // Filter out items with non-existent product IDs
      const validItems = selectedItems.filter(item => {
        const productExists = products.some(p => p.id === item.productId);
        if (!productExists) {
          console.warn(`Product with ID ${item.productId} does not exist and will be removed from the set`);
        }
        return productExists;
      });

      if (validItems.length === 0) {
        alert('All products in this set are invalid. Please add valid products.');
        setIsSubmitting(false);
        return;
      }

      // Make sure collection is properly set
      let finalCollection = data.collection;
      if (!finalCollection && collectionOptions.length > 0) {
        finalCollection = collectionOptions[0];
      }

      // Create the complete set object
      const completeSet: ProductSet = {
        ...data,
        categoryIds: data.categoryIds,
        collection: finalCollection as Collection,
        images: images,
        items: validItems,
        specifications: data.specifications || {},
        inStock: true,
      };

      // Save to MongoDB via API
      let savedSet;
      if (productSet) {
        savedSet = await updateSet(productSet.id, completeSet);
      } else {
        savedSet = await saveSet(completeSet);
      }

      // Upload images if any new files selected
      if (imageFiles.length > 0) {
        try {
          setIsUploading(true);
          // Загружаем изображения
          const folderSlug = finalCollection || 'sets';
          const uploadedImages = await uploadImages(
            imageFiles,
            folderSlug,
            savedSet.slug
          );

          // Создаём массив с новыми изображениями
          const newImages = uploadedImages.map((img, index) => ({
            url: img.url,
            alt: savedSet.name,
            isMain: index === 0 && images.length === 0
          }));

          // Объединяем с существующими изображениями
          const allImages = [...images, ...newImages];

          // Обновляем набор с новыми изображениями
          await updateSet(savedSet.id, {
            ...savedSet,
            images: allImages
          });
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          alert('Set saved but failed to upload images. You can upload them later.');
        } finally {
          resetUploadState();
        }
      }

      // Redirect to sets list
      router.push('/admin/sets');
      router.refresh();
    } catch (error) {
      console.error('Error saving set:', error);
      alert('Failed to save set. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get product details by ID
  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  // Get products that aren't already in the set
  const availableProducts = products.filter(product =>
    !selectedItems.some(item => item.productId === product.id)
  );

  // Filter available products based on search query and collection
  const filteredAvailableProducts = availableProducts.filter(product => {
    const matchesSearch = searchQuery.trim() === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCollection = selectedCollection === '' ||
      product.collection === selectedCollection;

    return matchesSearch && matchesCollection;
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Set Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Set Name
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

          {/* Set ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Set ID
            </label>
            <input
              type="text"
              {...register('id')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              readOnly={Boolean(productSet)} // Don't allow editing ID for existing sets
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

          {/* Collection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Collection
            </label>
            <select
              {...register('collection')}
              onChange={handleCollectionChange}
              value={selectedCollection}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a collection</option>
              {collectionOptions.map(collection => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the set..."
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
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

      {/* Products in the Set */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Products in the Set</h2>

        {/* Selected products */}
        {selectedItems.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Selected Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Default Quantity
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required
                    </th>
                    <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedItems.map(item => {
                    const product = getProductById(item.productId);
                    return product ? (
                      <tr key={item.productId}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-8 w-8 rounded object-cover"
                                  src={product.images[0].url}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-8 w-8 rounded bg-gray-200"></div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatPrice(product.discount ? product.price - product.discount : product.price)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(
                                item.productId,
                                Math.max(0, item.defaultQuantity - 1)
                              )}
                              className="px-2 py-1 bg-gray-100 rounded-l"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={item.defaultQuantity}
                              onChange={(e) => updateProductQuantity(
                                item.productId,
                                Math.max(0, parseInt(e.target.value) || 0)
                              )}
                              className="w-12 text-center border-t border-b border-gray-300 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(
                                item.productId,
                                item.defaultQuantity + 1
                              )}
                              className="px-2 py-1 bg-gray-100 rounded-r"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="text-sm font-medium">
                            {formatPrice((product.discount ? product.price - product.discount : product.price) * item.defaultQuantity)}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={() => toggleProductRequired(item.productId)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => removeProductFromSet(item.productId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ) : null;
                  })}
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="px-3 py-2 text-right font-medium">
                      Total Price:
                    </td>
                    <td className="px-3 py-2 text-center font-bold">
                      {formatPrice(calculatedPrice)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  No products added to this set yet. Please add at least one product.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add products */}
        <div>
          <h3 className="text-md font-medium mb-2">Add Products</h3>

          {/* Search and collection filter section */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search field */}
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Collection filter */}
            <div>
              <select
                value={selectedCollection}
                onChange={handleCollectionChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Collections</option>
                {collectionOptions.map(collection => (
                  <option key={collection} value={collection}>
                    {collection}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailableProducts.length > 0 ? (
              filteredAvailableProducts.map(product => (
                <div
                  key={product.id}
                  className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={product.images[0].url}
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200"></div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatPrice(product.discount ? product.price - product.discount : product.price)}
                        {product.collection && (
                          <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                            {product.collection}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProductToSet(product.id)}
                    className="bg-blue-50 text-blue-700 py-1 px-3 rounded-md text-sm hover:bg-blue-100"
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-gray-500">
                {searchQuery.trim() !== '' || selectedCollection !== ''
                  ? "No products found matching your filters."
                  : "All available products have been added to the set."}
              </div>
            )}
          </div>
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
          className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Saving...' : productSet ? 'Update Set' : 'Create Set'}
        </button>
      </div>
    </form>
  );
}