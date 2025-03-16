// src/components/admin/SetForm.tsx
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, ProductSet, Category, ProductImage, SetItem } from '@/types';
import { generateSlug, generateId, formatPrice } from '@/lib/utils/format';

// Define validation schema for product sets
const productSetSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description is required"),
  longDescription: z.string().optional(),
  basePrice: z.number().min(0, "Base price must be positive"),
  discount: z.number().min(0, "Discount must be positive").optional(),
});

type ProductSetFormValues = z.infer<typeof productSetSchema>;

interface SetFormProps {
  productSet?: ProductSet;
  categories: Category[];
  products: Product[];
}

export default function SetForm({ productSet, categories, products }: SetFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<ProductImage[]>(productSet?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for managing set items
  const [selectedItems, setSelectedItems] = useState<SetItem[]>(
    productSet?.items || []
  );
  
  // Calculate total price based on selected items and quantities
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  // Set up form with react-hook-form
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductSetFormValues>({
    resolver: zodResolver(productSetSchema),
    defaultValues: productSet ? {
      ...productSet,
    } : {
      id: generateId('SET'),
      basePrice: 0,
      discount: 0,
    }
  });
  
  // Watch values for auto-calculations
  const name = watch('name');
  const basePrice = watch('basePrice');
  
  // Auto-generate slug when name changes (for new sets)
  useEffect(() => {
    if (name && !productSet) {
      setValue('slug', generateSlug(name));
    }
  }, [name, setValue, productSet]);
  
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
      
      // Only auto-set base price for new sets
      if (!productSet) {
        setValue('basePrice', total);
      }
    }
  }, [selectedItems, products, setValue, productSet]);

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
      
      // Create the complete product set object
      const completeSet: ProductSet = {
        ...data,
        images: images,
        items: selectedItems,
        specifications: productSet?.specifications || {},
      };

      // Save to API
      const response = await fetch(
        productSet 
          ? `/api/admin/sets/${productSet.id}` 
          : '/api/admin/sets',
        {
          method: productSet ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeSet),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save product set');
      }

      // Redirect to sets list
      router.push('/admin/sets');
      router.refresh();
    } catch (error) {
      console.error('Error saving product set:', error);
      alert('Failed to save product set. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newImages: ProductImage[] = Array.from(files).map((file, index) => ({
      url: URL.createObjectURL(file),
      alt: file.name,
      isMain: index === 0 && images.length === 0
    }));

    setImages([...images, ...newImages]);
  };

  // Get product details by ID
  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };
  
  // Get products that aren't already in the set
  const availableProducts = products.filter(product => 
    !selectedItems.some(item => item.productId === product.id)
  );

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

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Base Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                {...register('basePrice', { valueAsNumber: true })}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {calculatedPrice > 0 && calculatedPrice !== basePrice && (
                <div className="mt-1 text-sm text-gray-500">
                  Calculated value: {formatPrice(calculatedPrice)}{' '}
                  <button
                    type="button"
                    onClick={() => setValue('basePrice', calculatedPrice)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Use this
                  </button>
                </div>
              )}
            </div>
            {errors.basePrice && (
              <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Long Description (Optional)
          </label>
          <textarea
            {...register('longDescription')}
            rows={5}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the set..."
          ></textarea>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Images</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        {/* Image preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image.url} 
                  alt={image.alt || 'Set image'} 
                  className="h-24 w-full object-cover rounded-md"
                />
                {image.isMain && (
                  <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-md">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProducts.length > 0 ? (
              availableProducts.map(product => (
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
                All available products have been added to the set.
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